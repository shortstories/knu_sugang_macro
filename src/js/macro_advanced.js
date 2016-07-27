
exports = module.exports = SugangMacro();

const request = require("request");

function SugangMacro() {
  var lectureTypeMap = {
    "교양" : 01,
    "전공기초" : 02,
    "전공" : 04,
    "부전공" : 05,
    "복수전공" : 06,
    "교직" : 07,
    "자유선택" : 08,
    "연계전공" : 10,
    "전공필수" : 12,
    "교과교육" : 26,
    "공학전공" : 51,
    "전공기반" : 52,
    "기본소양" : 53
  },
  Macro;

  Macro = function(lectureCode, lectureType, intervalSecond, callback) {
    this.lectureCode = lectureCode;
    this.lectureType = lectureType;
    this.intervalSecond = intervalSecond;
    this.callback = callback;
    this.tryNum = 0;
    this.intervalKey = null;
    this.cookieJar = request.jar();
  };

  Macro.prototype.request = function() {
    var that = this;

    this.tryNum++;
    if (lectureTypeMap[that.lectureType] === undefined) {
      that.callback("전공 유형 오류");
      return;
    }

    request({
      method: "POST",
      url: "http://sugang.knu.ac.kr/Sugang/cour/lectReq/onlineLectReq/procLectPackReqForInpt.action",
      headers: {
        'content-type': 'multipart/form-data; charset=UTF-8',
        'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
        'Accept': 'text/javascript, text/html, application/xml, text/xml, */*',
        'X-Prototype-Version': '1.6.1',
        'X-Requested-With': 'XMLHttpRequest'
      },
      formData: {
        "onlineLectReq.open_yr_trm": "",
        "onlineLectReq.subj_cde": that.lectureCode.substr(0, 7),
        "onlineLectReq.sub_class_cde": that.lectureCode.substr(7),
        "onlineLectReq.subj_div_cde": lectureTypeMap[that.lectureType],
        "onlineLectReq.lect_req_div_cde": "",
        "onlineLectReq.lect_req_sts_cde": "",
        "onlineLectReq.stu_nbr": "",
        "onlineLectReq.strt_stu_nbr_yr": "",
        "onlineLectReq.div": ""
      },
      jar: that.cookieJar
    }, that.callback);
  };

  Macro.prototype.setCookieJar = function(cookieJar) {
    this.cookieJar = cookieJar;
  }

  Macro.prototype.startInterval = function() {
    this.tryNum = 0;
    this.intervalKey = setInterval(this.request.bind(this), this.intervalSecond * 1000);
  };

  Macro.prototype.stop = function() {
    if (this.intervalKey) {
      clearInterval(this.intervalKey);
    }
  };

  return {
    Macro : Macro
  };
}
