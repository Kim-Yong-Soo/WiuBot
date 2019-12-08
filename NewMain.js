const scriptName = "Main.js";
var sdcard = android.os.Environment.getExternalStorageDirectory().getAbsolutePath();

var d = new Date();
var year = d.getFullYear();
var dday = d.getDay();
var month = (d.getMonth() + 1);

//만약 0(일요일)이거나 6(토요일)이라면 0을 돌려주어 월요일 시간표를 보여주도록 한다.
function dayNum() {
  if (dday == 0 || dday == 6) {
    return 0;
  } else {
    return dday - 1;
  }
}

//톡 내용을 저장한다.
function saveTalk(talkRoom, talkSender, talkMsg) {
  talkSender = talkSender.trim();
  talkMsg = talkMsg.trim();

  FileStream.append(sdcard + "/WiuBot/talk/" + talkRoom + ".txt", talkSender + " : " + talkMsg + "\n");

}

//톡 내용을 불러온다.
function readData(talkRoom, talkSender) {
  talkSender = talkSender.trim();
  var file = sdcard + "/WiuBot/talk/" + talkRoom + ".txt";

  if (!(java.io.File(file).isFile())) return talkRoom + " 방의 기록이 없습니다.";

  var val1 = FileStream.read(file);
  var val2 = val1.split("\n");
  var val3 = [];
  var val4 = [];

  for (var n = 0; n < val2.length; n++) {
    val3[n] = val2[n].split(" : ");
    if (val3[n][0] == talkSender) {
      val4.push(val3[n][1]);
    }
  }

  if (val4.length == 0) {
    return talkSender + "님의 기록이 없습니다.";
  }

  var value = "";
  for (var m = 0; m < val4.length; m++) {
    value = value + talkSender + " : " + val4[m] + "\n";
  }
  return value;
}

//네이버 검색 링크
var url = "http://search.naver.com/search.naver?sm=tab_hty.top&where=nexearch&query=";

//급식을 불러온다.
function getCafe(days, school) {
  var day = (d.getDate() + days);
  var pap = (month + "월 " + day + "일 ");
  var cafeArray = ["조식", "중식", "석식"];
  var cafeVal = "";
  var util = Utils.getWebText(url + school + "급식");

  for (var n = 0; n < cafeArray.length; n++) {
    try {
      var a = util.split(pap + "[" + cafeArray[n] + "]" + "</strong>");
      var b = a[1].split("</ul>");
      b = b[0].replace(/(<([^>]+)>)/g, "");
      b = b.replace(/\s$/gi, "");
      cafeVal = cafeVal + pap + "[" + cafeArray[n] + "]" + b + "\n";
    } catch (e) {
      cafeVal = cafeVal + pap + "[" + cafeArray[n] + "]" + "\n\n" + cafeArray[n] + "이 없습니다.\n\n";
    }
  }
  return cafeVal;
}

//날씨를 불러온다.
function getWeather(place) {
  place = place.trim();
  var util = Utils.getWebText(url + place + "날씨");
  util = util.replace(/<[^>]+>/g, "").split("월간")[1].split("시간별 예보")[0].trim().split("\n");
  var results = [];
  results[0] = util[0];
  results[1] = util[3].replace("온도", "온도 : ").trim() + "℃";
  results[2] = util[4].replace("온도", "온도 : ").trim() + "℃";
  results[3] = util[9].replace("먼지", "먼지 : ").trim();
  results[4] = util[13].replace("습도", "습도 : ").trim() + "%";
  return results;
}

//비속어를 추가한다.
function writeFuck(talkSender, talkMsg, replier) {
  talkSender = talkSender.trim();
  talkMsg = talkMsg.trim();
  var file = sdcard + "/WiuBot/warning/fucks.txt";
  if (!(java.io.File(file).isFile())) FileStream.append(file, "");
  var val1 = (FileStream.read(file)).split("\n");
  var val2 = [];
  for (var n = 0; n < val1.length; n++) {
    val2[n] = val1[n].split(" : ")[1];
    if (val2[n] == talkMsg) {
      replier.reply("이미 저장된 비속어입니다.");
      return;
    }
  }
  FileStream.append(file, talkSender + " : " + talkMsg + "\n");
}

//톡에 비속어가 포함되어 있는지 확인한다.
function checkFuck(talkMsg, replier) {
  talkMsg = talkMsg.trim().split(" ");
  var file = sdcard + "/WiuBot/warning/fucks.txt";
  if (!(java.io.File(file).isFile())) return "저장된 비속어가 없습니다.";

  var val1 = (FileStream.read(file)).split("\n");
  var val2 = [];
  var val3 = [];
  var check = false;
  var str = [];

  for (var n = 0; n < val1.length; n++) {
    val2[n] = val1[n].split(" : ")[1];
    for (var m = 0; m < talkMsg.length; m++) {
      if (talkMsg[m] == val2[n]) {
        check = true;
        val3.push(val2[n]);
      }
    }
  }
  if (check) {
    replier.reply("※ 비속어 ※\n" + val3.join(", ") + "이/가 발견되었습니다.");
  }
}

//시간표를 추가한다.
function setSchedule(talkRoom, talkMsg, replier) {
  var file = sdcard + "/WiuBot/schedule/" + talkRoom + ".txt";
  if (!(java.io.File(file).isFile())) FileStream.append(file, "");
  var val1 = (FileStream.read(file)).split("\n");
  if (val1.length > 5) {
    replier.reply("이미 5일의 시간표가 추가되어 있습니다.");
    return;
  }
  FileStream.append(file, talkMsg + "\n");
}

//시간표를 불러온다.
function getSchedule(talkRoom, date) {
  var file = sdcard + "/WiuBot/schedule/" + talkRoom + ".txt";
  if (!(java.io.File(file).isFile())) FileStream.append(file, "");

  var val1 = (FileStream.read(file)).split("\n");
  var val2 = [];

  for (var n = 0; n < val1.length; n++) {
    val2[n] = val1[n].split(" ");
  }

  return val2[date].join("\n");
}

//변경된 시간표를 확인하고 당일에 맞는 시간표를 내보낸다.
function checkSchedule(talkRoom, date) {
  var file = sdcard + "/WiuBot/scheduleChange/" + talkRoom + "/" + year + "/" + month + ".txt";
  if (!(java.io.File(file).isFile())) FileStream.append(file, "");
  var val1 = (FileStream.read(file)).split("\n");
  for (var i = 0; i < val1.length; i++) {
    if (val1[i].split(" : ")[0] == date) {
      return val1[i].split(" : ")[1].split(" ").join("\n");
    }
  }
  return getSchedule(talkRoom, dayNum());
}

//변경된 시간표들을 전부 불러온다.
function checkAllSceCh(talkRoom) {
  var file = sdcard + "/WiuBot/scheduleChange/" + talkRoom + "/" + year + "/" + month + ".txt";
  if (!(java.io.File(file).isFile())) FileStream.append(file, "");
  var val1 = (FileStream.read(file)).split("\n");
  return val1.join("\n");
}

//시간표를 변경한다.
function changeSchedule(talkRoom, date, schedule, replier) {
  var file = sdcard + "/WiuBot/scheduleChange/" + talkRoom + "/" + date[0] + "/" + date[1] + ".txt";
  if (!(java.io.File(file).isFile())) FileStream.append(file, "");
  var val1 = (FileStream.read(file)).split("\n");
  for (var i = 0; i < val1.length; i++) {
    if (val1[i].split(" : ")[0] == date[2]) {
      replier.reply("이미 변경사항이 존재하는 날입니다.");
      return;
    }
  }
  FileStream.append(file, date[2] + " : " + schedule + "\n");
}

//리포트 기능이다.
function ddayLists(today, date, place, talkRoom, replier) {
  var schedule = checkSchedule(talkRoom, date).split("\n");
  var res1 = "";
  if (today == "오늘") {
    res1 = today + "은 " + date + "일이며 현재 " + place + "의 기온은 " + getWeather(place)[1].replace("현재온도 : ", "") + "이며, 체감온도는 " + getWeather(place)[2].replace("체감온도 : ", "") + "입니다.\n";
  } else {
    res1 = today + "은 " + date + "일입니다.";
  }
  var res2 = "\n" + today + "의 시간표는 \n1." + schedule[0] + "\n2." + schedule[1] + "\n3." + schedule[2] + "\n4." + schedule[3] + "\n5." + schedule[4] + "\n6." + schedule[5] + "\n7." + schedule[6] + "\n입니다.";
  replier.reply(res1 + res2);
  for (var i = 0; i < schedule.length; i++) {
    if (schedule[i] == "체육") {
      replier.reply("\n" + today + "은 체육이 있으니 체육복을 챙기시기 바랍니다.");
      break;
    }
  }

  replier.reply("[급식]\n" + "\u200b".repeat(500) + getCafe(date - (day - 1), place + "고"));
}

var folder = new java.io.File(sdcard + "/WiuBot/talk/");
folder.mkdirs();
var day = (d.getDate() + 1);

function response(room, msg, sender, isGroupChat, replier, imageDB) {
  /** @param {String} room - 방 이름
   * @param {String} msg - 메세지 내용
   * @param {String} sender - 발신자 이름
   * @param {Boolean} isGroupChat - 단체채팅 여부
   * @param {Object} replier - 세션 캐싱 답장 메소드 객체
   * @param {Object} imageDB - 프로필 이미지와 수신된 이미지 캐싱 객체
   * @method imageDB.getImage() - 수신된 이미지가 있을 경우 Base64 인코딩 되어있는 JPEG 이미지 반환, 기본 값 null
   * @method imageDB.getProfileImage() - Base64 인코딩 되어있는 JPEG 프로필 이미지 반환, 기본 값 null
   * @method replier.reply("문자열") - 메시지가 도착한 방에 답장을 보내는 메소드 */

  msg = msg.trim();
  var command = msg.split(" ");
  var school = "대천고";
  var place = "대천";
  var firstStr = "\n" + "\u200b".repeat(500);

  if (!(room == "게임방")) {
    checkFuck(sender, msg, replier);
  }

  if ((msg.indexOf("wiu") == 0) || (msg.indexOf("Wiu") == 0)) {
    switch (command[1]) {
      case "내일급식":
      case "낼급식":
        replier.reply("[급식]" + firstStr + getCafe(1, school) + "\n다른 명령어가 궁금하다면? - wiu help -");
        break;
      case "오늘급식":
        replier.reply("[급식]" + firstStr + getCafe(0, school) + "\n다른 명령어가 궁금하다면? - wiu help -");
        break;
      case "급식":
        replier.reply("[" + command[2] + " 급식]\n" + firstStr + getCafe(parseInt(command[3]), command[2]) + "\n다른 명령어가 궁금하다면? - wiu help -");
        break;
      case "내기록":
        replier.reply("[기록]" + firstStr + readData(room, sender));
        break;
      case "기록":
        replier.reply("[기록]" + firstStr + readData(room, command[2]));
        break;
      case "날씨":
        if (command.length >= 3) {
          replier.reply("[" + command[2] + " 날씨]\n\n" + getWeather(command[2]).join("\n"));
        }
        replier.reply("[" + place + " 날씨]\n\n" + getWeather(place).join("\n"));
        break;
      case "시간표":
        if (dday == 0) {
          replier.reply(checkSchedule(room, day));
        } else if (dday == 6) {
          replier.reply(checkSchedule(room, day + 1));
        } else {
          replier.reply(checkSchedule(room, day - 1));
        }
        break;
      case "report":
      case "리포트":
        if (dday == 0 || dday == 6) {
          replier.reply("주말에는 지원되지 않습니다.");
          break;
        }
        ddayLists("오늘", day - 1, place, room, replier);
        break;
      case "내일리포트":
        if (dday == 5 || dday == 6) {
          replier.reply("주말에는 지원되지 않습니다.");
          break;
        }
        ddayLists("내일", day, place, room, replier);
        break;
      case "변경사항확인":
        replier.reply(checkAllSceCh(room));
        break;
      case "명령어":
      case "help":
        var com1 = "[Wiu]\n명령어 목록 (2019/12/08 마지막 수정)\n밑의 모든 명령어는 모두 앞에 'wiu' 또는 'Wiu'을 적고 하셔야 합니다!\n명령어, help: 명령어 목록을 확인합니다!\n\n";
        var com2 = "[날씨]\n날씨: 날씨를 확인합니다. '날씨 place'를 하면 place의 날씨의 확인합니다.\n\n";
        var com3 = "[급식]\n내일급식, 낼급식: 내일 급식을 확인합니다.\n오늘급식: 오늘 급식을 확인합니다.\n급식: '급식 m n'로 m학교의 n일 후 급식을 확인합니다.\n\n";
        var com4 = "[기록]\n내기록: 나의 톡 기록을 확인합니다.\n기록: '기록 user'로 user의 톡 기록을 확인합니다.\n\n";
        var com5 = "[시간표]\n시간표: 오늘의 시간표를 확인합니다. 주말인 경우에는 다음 월요일 시간표를 확인합니다\n시추: 시간표를 추가합니다.\n     초기에 월요일~금요일의 시간표를 차례대로 지정해야만 시간표 관련 명령어 사용 가능합니다.\n시변: 변경된 시간표를 추가시킵니다.\n     예) wiu 시변 독서1 독서2 영어1 영어2 수학 선택1 선택2\n\n";
        var com6 = "[리포트]\n리포트, report: 오늘의 리포트입니다.\n내일리포트: 내일의 리포트입니다\n\n";
        var com7 = "[비속어]\n비속추, 비속어추가: 주의를 줄 비속어를 추가합니다.\n\n(추후 더욱 많은 명령어 추가 예정)";
        replier.reply("[명령어]" + firstStr + com1 + com2 + com3 + com4 + com5 + com6 + com7);
        break;
        //
      case "비속추":
      case "비속어추가":
        writeFuck(sender, command[2], replier);
        break;
      case "시변":
        changeSchedule(room, command[2].split("."), command[3] + " " + command[4] + " " + command[5] + " " + command[6] + " " + command[7] + " " + command[8] + " " + command[9], replier);
        break;
      case "시추":
        setSchedule(room, command[2] + " " + command[3] + " " + command[4] + " " + command[5] + " " + command[6] + " " + command[7] + " " + command[8], replier);
        break;
      default:
    }
  }
  saveTalk(room, sender, msg);
}
