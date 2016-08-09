"use strict";

const request = require("request");

exports = module.exports = KnuAuth;

function KnuAuth(knuId, knuPassword, stuNumber) {
  this.knuId = knuId;
  this.knuPassword = knuPassword;
  this.stuNumber = stuNumber;
  this.cookieJar = request.jar();
}

KnuAuth.prototype.getDiv = function(divCallback) {
  var that = this;
  console.log("getDiv");

  request({
      method: "POST",
      url: "http://my.knu.ac.kr/stpo/comm/support/loginPortal/getAvailableUserDivs.action",
      headers: {
        'content-type': 'multipart/form-data',
        'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
      },
      formData: {
        "user.usr_id": that.knuId
      },
      jar : that.cookieJar
    }, divCallback);
};

KnuAuth.prototype.login = function(loginCallback) {
  console.log("login");
  var that = this;

  // return new Promise((resolve, reject) => {
  //   that.getDiv((error, response, body) => {
  //     if (error) {
  //       reject(error);
  //     }
  //
  //     console.log(`STATUS: ${response.statusCode}`);
  //     console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
  //     console.log(`BODY: ${body.toString()}`);
  //
  //     resolve(JSON.parse(body.replace(/'/g,"\""))[0].key);
  //   });
  // });
  return Promise.resolve()
    .then((div) => {
      request({
        method: "POST",
        url: "http://sugang.knu.ac.kr/Sugang/comm/support/login/login.action",
        headers: {
          'content-type': 'multipart/form-data',
          'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
        },
        formData: {
          // "redirUrl": "/stpo/stpo/main/main.action",
          // "menuParam": "901",
          "user.usr_id": that.knuId,
          "user.passwd": that.knuPassword,
          // "user.user_div": div,
          "user.langage_mode": "kor",
          "user.open_yr_trm": "20162",
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
