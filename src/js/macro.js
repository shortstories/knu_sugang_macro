Object.prototype.new = function() {
  var fnc = function(){},
      obj;
  fnc.prototype = this;
  return new fnc();
}

var sugang = {
  key : null,
  callBack : null,
  tryNum : 0,
  request : function(lec_code, lec_type) {
    var subject_code;

    switch(lec_type) {
      case "교양":
        subject_code = 01;
        break;
      case "전공기초":
        subject_code = 02;
        break;
      case "전공":
        subject_code = 04;
        break;    
      case "부전공":
        subject_code = 05;
        break;
      case "복수전공":
        subject_code = 06;
        break;
      case "교직":
        subject_code = 07;
        break;
      case "자유선택":
        subject_code = 08;
        break;
      case "연계전공":
        subject_code = 10;
        break;
      case "전공필수":
        subject_code = 12;
        break;
      case "교과교육":
        subject_code = 26;
        break;
      case "공학전공":
        subject_code = 51;
        break;
      case "전공기반":
        subject_code = 52;
        break;
      case "기본소양":
        subject_code = 53;
        break;
    }

    var data = {
      onlineLectReq : {
        open_yr_trm : "",
        subj_cde : lec_code.substr(0, 7),
        sub_class_cde : lec_code.substr(7),
        subj_div_cde : subject_code,
        lect_req_div_cde : "",
        lect_req_sts_cde : "",
        stu_nbr : "",
        strt_stu_nbr_yr : "",
        div : ""
      }
    };

    jsonToFormData = function (json_data) {
      var form_data = new String();
      for (var data in json_data) {
        if (json_data.hasOwnProperty(data)) {
         parent = data;
         for (var inner_data in json_data[data]) {
             form_data = form_data + (parent + "." + inner_data + "=" + json_data[data][inner_data]) + "&";
         }
            form_data = form_data + "_="
        }
      }

      return form_data;
    }

    var httpRequest = new XMLHttpRequest();

    var that = this;
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        if (that.callBack != null) {
          that.callBack(httpRequest.responseText);
        }
        else {
          console.log("ok");
        }
      }
    }

    httpRequest.open("POST", "/Sugang/cour/lectReq/onlineLectReq/procLectPackReqForInpt.action", true);

    httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    httpRequest.setRequestHeader('Accept', 'text/javascript, text/html, application/xml, text/xml, */*');
    httpRequest.setRequestHeader('X-Prototype-Version', '1.6.1');
    httpRequest.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    httpRequest.send(jsonToFormData(data));

  },
  startInterval : function(lec_code, lec_type, interval_second) {
    var that = this;
    this.tryNum = 0;
    this.key = setInterval(function() { that.request(lec_code, lec_type); that.tryNum += 1; }, interval_second * 1000);
  },
  stop : function() {
    clearInterval(this.key);
  }
}

var pannelIndex = 0;
var sugangInstancesPack = {};

var createControllPannelHtml = function() {
  var html = new String()
                  + "<input style='width:160px; float: left; margin-right: 10px;' type='text' id='sugang_id_" + pannelIndex + "' placeholder='강의코드 ex)COMP328002'/>"
                  + "<input style='width:100px; float: left; margin-right: 10px;' type='text' id='sugang_type_" + pannelIndex + "' placeholder='강의유형 ex)전공'/>"
                  + "<input style='width:70px; float: left; margin-right: 10px;' type='text' id='req_interval_" + pannelIndex + "' placeholder='간격 ex)0.1' />"
                  + "<a style='margin-right: 10px; color: white; text-decoration: none; float: left' href='javascript:startIntervalGUI(" + pannelIndex + ")'>start</a>"
                  + "<a style='margin-right: 10px; color: white; text-decoration: none; float: left' href='javascript:stopGUI(" + pannelIndex + ")'>stop</a>"
                  + "<div id='controllPannel_tryNumber_" + pannelIndex + "' style='color: #B6B7D0; font-size: 1.2em; text-align: center; float: left; margin-right: 10px;'>시도 횟수 0</div>"
                  + "<div id='result_" + pannelIndex + "' style='float: left; color:#fff; width:300px; height: 1em; text-overflow:ellipsis; overflow:hidden; white-space: nowrap'></div> "
                  + "<div style='clear:both'></div>"
  pannelIndex += 1;
  return html;
}

var startIntervalGUI = function(index) {
    var sugangInstance = sugang.new(),
        lec_code = document.getElementById('sugang_id_' + index).value,
        lec_type = document.getElementById('sugang_type_' + index).value,
        interval_second = document.getElementById('req_interval_' + index).value;

    sugangInstance.index = index;
    sugangInstance.callBack = function(responseText) {
      this.tryNum += 1;
      document.getElementById('controllPannel_tryNumber_' + this.index).innerHTML = '시도 횟수 ' + this.tryNum;
      document.getElementById('result_' + this.index).innerHTML = responseText;
    }
    sugangInstance.startInterval(lec_code, lec_type, interval_second);

    sugangInstancesPack[index] = sugangInstance;
}
var stopGUI = function(index) {
    if (sugangInstancesPack[index]) {
      sugangInstancesPack[index].stop();
    }
}

var addControllPannel = function() {
  var wrap = document.getElementById('controllPannel_wrap');
  var controllPannelItem = document.createElement('div');
  controllPannelItem.setAttribute("id", pannelIndex);
  controllPannelItem.innerHTML = createControllPannelHtml();

  wrap.appendChild(controllPannelItem);
}

var body = document.getElementsByTagName("body")[0];
var controllPannel = document.createElement("div");

controllPannel.setAttribute("style", "position: absolute; top: 0; left: 0; width: 920px; z-index: 100; font-size: 1.5em; background-color: rgba(0, 0, 0, 0.75);");
controllPannel.innerHTML  = "<div id='controllPannel_wrap' style='text-align: center;'>"
                            + "<div id='"+ pannelIndex +"'>"
                              + createControllPannelHtml()
                            + "</div>"
                          + "</div>"
                          + "<a style='float:left; color: #fff; width: 100%; text-align: center; text-decoration: none' href='javascript:addControllPannel()'>+</a>"

body.appendChild(controllPannel);
