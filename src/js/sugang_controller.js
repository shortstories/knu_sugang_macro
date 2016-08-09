"use strict";

const KnuMacro = require("./macro_advanced.js");
const EventEmitter = require("events");

var SugangController = function() {
  // fields
  var _ipcMain,
      _currentCookieJar = null,
      _macroMap = {},
      startMacroEvent = "startMacro",
      stopMacroEvent = "stopMacro",
      logoutEvent = "logout";

  // methods
  var init, setCookieJarToAllMacro,
      _onStartMacro, _onStopMacro;

  init = function(ipcMain) {
    _ipcMain = ipcMain;

    _ipcMain.on(startMacroEvent, _onStartMacro);
    _ipcMain.on(stopMacroEvent, _onStopMacro);
  };

  setCookieJarToAllMacro = function(cookieJar) {
    console.log("setCookieJarToAllMacro");
    _currentCookieJar = cookieJar;

    for (var key in _macroMap) {
      if (_macroMap.hasOwnProperty(key)) {
        var macro = _macroMap[key];
        macro.setCookieJar(cookieJar);
      }
    }
  };

  _onStartMacro = function(event, data) {
    console.log(data);

    var macro = new KnuMacro.Macro(data.lectureCode,
      data.lectureType, data.intervalSecond,
      (err, response, body) => {
        console.log("body: " + body, ", err: " + err);

        if (body && body.includes("로그인")) {
          SugangController.emit(logoutEvent);
        }

        event.sender.send("macroResult", {
          "index": data.index,
          "tryNumber": macro.tryNum,
          "result": (err) ? err : body
        });
      });

    macro.setCookieJar(_currentCookieJar);

    macro.startInterval();
    _macroMap[data.index] = macro;
  };

  _onStopMacro = function(event, data) {
    console.log(data);
    _macroMap[data.index].stop();
  };

  var returnConstructor = function() {
    this.init = init;
    this.setCookieJarToAllMacro = setCookieJarToAllMacro;
    this.startMacroEvent = startMacroEvent;
    this.stopMacroEvent = stopMacroEvent;
    this.logoutEvent = logoutEvent;
  };
  returnConstructor.prototype = EventEmitter.prototype;

  return new returnConstructor();
}();

exports = module.exports = SugangController;
