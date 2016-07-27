"use strict";
const electron = require('electron');
const {app, ipcMain, BrowserWindow} = electron;
const KnuAuth = require("./js/knu_auth.js");
const KnuMacro = require("./js/macro_advanced");

let win;
let winSession;
let loginChild;
let sugangChild;
let loginDataCache;
let currentKnuAuth;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false
  });
  loginChild = new BrowserWindow({
    width: 300,
    height: 300,
    frame: false,
    parent: win,
    transparent: true,
    x: 740,
    y: 370,
    resizable: false
  });
  sugangChild = new BrowserWindow({
    width: 500,
    height: 550,
    frame: false,
    parent: win,
    transparent: true,
    x: 240,
    y: 120,
    resizable: false
  });

  // win.loadURL(`file://${__dirname}/html/index.html`);
  // win.loadURL("http://my.knu.ac.kr");
  winSession = win.webContents.session;
  // win.openDevTools(["detach"]);
  loginChild.loadURL(`file://${__dirname}/html/auth.html`);
  sugangChild.loadURL(`file://${__dirname}/html/sugang.html`);
  // loginChild.openDevTools(["detach"]);
  // sugangChild.openDevTools(["detach"]);

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);
app.on('window-all-closed', () =>  {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on("startLogin", (event, data) => {
  console.log("start Login");
  console.log(data);

  if (!data) {
    data = loginDataCache;
  } else {
    loginDataCache = data;
  }

  if (!data || !data.id || !data.password || !data.stu_number) {
    event.sender.send("postLogin", {
      error: "아이디, 비밀번호, 학번을 모두 입력하세요.",
      response: null
    });

    return;
  }

  currentKnuAuth = new KnuAuth(data.id, data.password, data.stu_number);
  currentKnuAuth.login((err, response, body) => {
    if (err) {
      console.log(err);
      throw new Error(err);
    }

    console.log(`STATUS: ${response.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
    console.log(`BODY: ${body}`);
    console.log(`COOKIE: ${currentKnuAuth.getCookie()}`);

    var setCallback = function(error) {
      if (error) {
        console.log(error);
      }
    };
    var cookies = currentKnuAuth.getCookie();
    for (let i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var details = {
        "url" : "http://my.knu.ac.kr",
        "name": cookie.key,
        "value": cookie.value,
        "domain": (cookie.domain === "my.knu.ac.kr") ? null : cookie.domain,
        "path": cookie.path,
        "secure": cookie.secure,
        "httpOnly": cookie.httpOnly,
        "expirationDate": cookie.expires
      };

      winSession.cookies.set(details, setCallback);
    }

    for (var key in macroMap) {
      if (macroMap.hasOwnProperty(key)) {
        var macro = macroMap[key];
        macro.setCookieJar(currentKnuAuth.getCookieJar());
      }
    }

    // win.loadURL("http://my.knu.ac.kr");
  });

  event.sender.send("postLogin", {
    error: null,
    response: "test"
  });
});

let macroMap = {};

ipcMain.on("startMacro", (event, data) => {
  console.log(data);

  var macro = new KnuMacro.Macro(data.lectureCode,
    data.lectureType, data.intervalSecond,
    (err, response, body) => {
      console.log(response);

      event.sender.send("macroResult", {
        "index": data.index,
        "tryNumber": macro.tryNum,
        "result": (err) ? err : body
      });
    });

  if (currentKnuAuth) {
    macro.setCookieJar(currentKnuAuth.getCookieJar());
  }
  macro.startInterval();
  macroMap[data.index] = macro;
});

ipcMain.on("stopMacro", (event, data) => {
  console.log(data);
  macroMap[data.index].stop();
});
