"use strict";
const electron = require('electron');
const {app, ipcMain, BrowserWindow} = electron;
const KnuAuth = require("./js/knu_auth.js");
const SugangController = require("./js/sugang_controller.js");

let win;
let winSession;
let loginChild;
let sugangChild;
let loginDataCache;
let currentKnuAuth;
let isLogin = false;
let sessionTimeoutKey;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: true
  });
  loginChild = new BrowserWindow({
    width: 300,
    height: 350,
    // frame: false,
    parent: win,
    transparent: true,
    x: 740,
    y: 320,
    resizable: true
  });
  sugangChild = new BrowserWindow({
    width: 500,
    height: 550,
    // frame: false,
    parent: win,
    transparent: true,
    x: 240,
    y: 120,
    resizable: true
  });

  // win.loadURL(`file://${__dirname}/html/index.html`);
  win.loadURL("http://sugang.knu.ac.kr");
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

var onStartLogin = function(event, data) {
  console.log("start Login");
  console.log(data);

  if (!data) {
    data = loginDataCache;
  } else {
    loginDataCache = data;
  }

  if (!data || !data.id || !data.password || !data.stu_number || !data.open_yr) {
    if (event) {
      event.sender.send("postLogin", {
        error: "학기, 아이디, 비밀번호, 학번을 모두 입력하세요.",
        response: null
      });
    }
    return;
  }

  currentKnuAuth = new KnuAuth(data.id, data.password, data.stu_number, data.open_yr);
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
        "url" : "http://sugang.knu.ac.kr",
        "name": cookie.key,
        "value": cookie.value,
        "domain": (cookie.domain === "sugang.knu.ac.kr") ? null : cookie.domain,
        "path": cookie.path,
        "secure": cookie.secure,
        "httpOnly": cookie.httpOnly,
        "expirationDate": cookie.expires
      };

      // console.log(details);
      winSession.cookies.set(details, setCallback);
    }

    SugangController.setCookieJarToAllMacro(currentKnuAuth.getCookieJar());
    win.loadURL("http://sugang.knu.ac.kr/Sugang/cour/lectReq/onlineLectReq/list.action");
    isLogin = true;

    if (sessionTimeoutKey) {
      clearTimeout(sessionTimeoutKey);
    }

    sessionTimeoutKey = setTimeout(onStartLogin, 1000000);
  });

  if (event) {
    event.sender.send("postLogin", {
      error: null,
      response: "test"
    });
  }
};

ipcMain.on("startLogin", onStartLogin);

SugangController.init(ipcMain);
SugangController.on(SugangController.logoutEvent, () => {
  console.log("on logout event");
  if (isLogin) {
    onStartLogin();
  }
});
