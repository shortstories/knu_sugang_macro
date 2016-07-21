
var JsonUtils = {
  convertToFormData : function(jsonObject) {
    var formData = "";
    for (var key in jsonObject) {
      if (jsonObject.hasOwnProperty(key)) {
        parent = key;
        for (var value in jsonObject[key]) {
           formData = formData + (parent + "." + value + "=" + jsonObject[key][value]) + "&";
        }
        formData = formData + "_=";
      }
    }
    return formData;
  }
};

var SugangMacro = (function() {
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
  }, Macro,
  stateMap = {
    controllerSize : 0
  };

  var init, createPannel, createController, addControllerToPannel;

  Macro = function(lectureCode, lectureType, intervalSecond, callback) {
    this.lectureCode = lectureCode;
    this.lectureType = lectureType;
    this.intervalSecond = intervalSecond;
    this.callback = callback;
    this.tryNum = 0;
    this.intervalKey = null;
  };

  Macro.prototype.request = function() {
    var that = this,
      data = {
        onlineLectReq : {
          open_yr_trm : "",
          subj_cde : that.lectureCode.substr(0, 7),
          sub_class_cde : that.lectureCode.substr(7),
          subj_div_cde : lectureTypeMap[that.lectureType],
          lect_req_div_cde : "",
          lect_req_sts_cde : "",
          stu_nbr : "",
          strt_stu_nbr_yr : "",
          div : ""
        }
      },
      httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState == 4) {
        switch(httpRequest.status) {
          case 200:
            console.log("get response successfully");
            that.callback(httpRequest.responseText);
            break;
          case 404:
            console.log("Not found");
            that.callback("\"sugang.knu.ac.kr\"이 아닙니다.");
            break;
        }
      }
    };

    httpRequest.open("POST", "/Sugang/cour/lectReq/onlineLectReq/procLectPackReqForInpt.action", true);

    httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    httpRequest.setRequestHeader('Accept', 'text/javascript, text/html, application/xml, text/xml, */*');
    httpRequest.setRequestHeader('X-Prototype-Version', '1.6.1');
    httpRequest.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    this.tryNum++;
    httpRequest.send(JsonUtils.convertToFormData(data));
  };

  Macro.prototype.startInterval = function() {
    this.tryNum = 0;
    this.intervalKey = setInterval(this.request.bind(this), this.intervalSecond * 1000);
  };

  Macro.prototype.stop = function() {
    if (this.intervalKey) {
      clearInterval(this.intervalKey);
    }
  };

  createPannel = function() {
    var controllPannel = document.createElement("div");

    controllPannel.setAttribute("style", "position: absolute; top: 0; left: 0; width: 920px; z-index: 100; font-size: 1.5em; background-color: rgba(0, 0, 0, 0.75); box-shadow: 4px 4px 15px #888888");
    controllPannel.innerHTML ="<div id='metadata' style='padding:5px 0'>" +
                                "<span style='margin: 0 10px; color: rgba(255, 255, 255, 0.8); font-size: 0.5em; width: 160px; display: inline-block; text-align: center;'>강의코드</span>" +
                                "<span style='margin-right: 10px; color: rgba(255, 255, 255, 0.8); font-size: 0.5em; width: 100px; display: inline-block; text-align: center;'>강의유형</span>" +
                                "<span style='margin-right: 10px; color: rgba(255, 255, 255, 0.8); font-size: 0.5em; width: 70px; display: inline-block; text-align: center;'>시도간격</span>" +
                                "<span style='margin: 0 10px 0 75px; color: rgba(255, 255, 255, 0.8); font-size: 0.5em; width: 70px; display: inline-block; text-align: center;'>시도횟수</span>" +
                                "<span style='margin-right: 10px; color: rgba(255, 255, 255, 0.8); font-size: 0.5em; width: 380px; display: inline-block; text-align: center;'>결과</span>" +
                              "</div>" +
                              "<div id='controllPannel_wrap' style='text-align: center;'></div>" +
                              "<a id='btnAddController' style='background: #000; cursor: pointer; float:left; color: #fff; width: 100%; text-align: center; text-decoration: none'>+</a>";

    return controllPannel;
  };

  createController = function() {
    var $controller = $("<div class='controller' style='height: 40px; padding: 5px 0; box-sizing: border-box'>" +
        "<input style='box-sizing: border-box; width:160px; height:100%; float: left; margin-left: 10px; margin-right: 10px;' type='text' class='sugang_id' placeholder='ex) COMP328002'/>" +
        "<input style='box-sizing: border-box; width:100px; height:100%; float: left; margin-right: 10px;' type='text' class='sugang_type' placeholder='ex) 전공'/>" +
        "<input style='box-sizing: border-box; width:70px; height:100%; float: left; margin-right: 10px;' type='text' class='req_interval' placeholder='ex) 0.1' />" +
        "<a class='btnStart' style='box-sizing: border-box; cursor: pointer; background: green; padding: 3px 15px; border-radius: 30px; font-size: 0.75em; margin-right: 10px; color: white; text-decoration: none; float: left'>start</a>" +
        "<a class='btnStop' style='box-sizing: border-box; display: none; cursor: pointer; background: red; padding: 3px 15px; border-radius: 30px; font-size: 0.75em; margin-right: 10px; color: white; text-decoration: none; float: left'>stop</a>" +
        "<div class='controllPannel_tryNumber' style='box-sizing: border-box; color: #B6B7D0; text-align: center; float: left; margin-right: 10px; width: 70px'>0</div>" +
        "<div class='result' style='box-sizing: border-box; float: left; color:#fff; width:380px; text-overflow:ellipsis; overflow:hidden; white-space: nowrap'></div> " +
        "<div style='clear:both'></div>" +
      "</div>"),
    macro = new Macro();

    $controller.find(".btnStart").on("click", function(event) {
      var $tryNumber = $controller.find(".controllPannel_tryNumber"),
          $result = $controller.find(".result"),
          lectureCode = $controller.find(".sugang_id").val(),
          lectureType = $controller.find(".sugang_type").val(),
          intervalSecond = $controller.find(".req_interval").val();

      if (!lectureCode || !lectureType || !intervalSecond) {
        alert("한 칸도 비우지 말고 모두 입력하세요");
        return;
      }

      macro.lectureCode = lectureCode.toUpperCase();
      macro.lectureType = lectureType;
      macro.intervalSecond = intervalSecond;
      macro.callback = function(resultText) {
        $tryNumber.html(macro.tryNum);
        $result.html(resultText);
      };

      macro.startInterval();
      $(this).hide();
      $controller.find(".btnStop").show();
    });

    $controller.find(".btnStop").on("click", function(event) {
      macro.stop();
      $(this).hide();
      $controller.find(".btnStart").show();
    });

    stateMap.controllerSize += 1;
    return $controller;
  };

  addControllerToPannel = function() {
    $("#controllPannel_wrap").append(createController());
  };

  init = function() {
    var jqueryScript = document.createElement("script");
    jqueryScript.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js";
    jqueryScript.onload = function() {
      var $pannel = $(createPannel());
      $pannel.find("#controllPannel_wrap").append(createController());
      $pannel.find("#btnAddController").on("click", addControllerToPannel);

      $("body").append($pannel);
    };

    document.getElementsByTagName("head")[0].appendChild(jqueryScript);
  };

  return {
    init: init
  };
}());

SugangMacro.init();
