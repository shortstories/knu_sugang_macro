"use strict";
const electron = require('electron');
const {app, ipcMain, BrowserWindow} = electron;
const KnuAuth = require("./js/knu_auth.js");

let win;
let winSession;
let loginChild;
let loginDataCache;

function createWindow() {
  win = new BrowserWindow({width: 800, height: 600});
  loginChild = new BrowserWindow({width: 200, height: 200,
    frame: false, parent: win, transparent: false});

  // win.loadURL(`file://${__dirname}/html/index.html`);
  win.loadURL("http://my.knu.ac.kr");
  winSession = win.webContents.session;
  // win.openDevTools(["detach"]);
  loginChild.loadURL(`file://${__dirname}/html/auth.html`);
  // loginChild.openDevTools(["detach"]);

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

  var knuAuth = new KnuAuth(data.id, data.password, data.stu_number);
  knuAuth.login((err, response, body) => {
    if (err) {
      console.log(err);
      throw new Error(err);
    }

    console.log(`STATUS: ${response.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
    console.log(`BODY: ${body}`);
    console.log(`COOKIE: ${knuAuth.getCookie()}`);

    var setCallback = function(error) {
      if (error) {
        console.log(error);
      }
    };
    var cookies = knuAuth.getCookie();
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

    win.loadURL("http://my.knu.ac.kr");
  });

  event.sender.send("postLogin", {
    error: null,
    response: "test"
  });
});
