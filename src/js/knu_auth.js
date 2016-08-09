"use strict";

const request = require("request");

exports = module.exports = KnuAuth;

function KnuAuth(knuId, knuPassword, stuNumber, openYr) {
  this.knuId = knuId;
  this.knuPassword = knuPassword;
  this.stuNumber = stuNumber;
  this.openYr = openYr;
  this.cookieJar = request.jar();
}

KnuAuth.prototype.login = function(loginCallback) {
  console.log("login");
  var that = this;

  return Promise.resolve()
    .then(() => {
      request({
        method: "POST",
        url: "http://sugang.knu.ac.kr/Sugang/comm/support/login/login.action",
        headers: {
          'content-type': 'multipart/form-data',
          'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
        },
        formData: {
          "user.usr_id": that.knuId,
          "user.passwd": that.knuPassword,
          "user.langage_mode": "kor",
          "user.open_yr_trm": that.openYr,
          "user.stu_nbr": that.stuNumber
        },
        jar: that.cookieJar
      }, loginCallback);
    });
};

KnuAuth.prototype.getCookie = function() {
  return this.cookieJar.getCookies("http://sugang.knu.ac.kr", {allPaths: true});
};

KnuAuth.prototype.getCookieJar = function() {
  return this.cookieJar;
};
