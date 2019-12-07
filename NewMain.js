const scriptName = "Main.js";

var sdcard = android.os.Environment.getExternalStorageDirectory().getAbsolutePath();

var d = new Date();
var year = d.getFullYear();
var dday = d.getDay();
var month = (d.getMonth() + 1);

function dayNum() {
  if (dday == 0 || dday == 6) {
    return 0;
  } else {
    return dday - 1;
  }
}

function saveTalk(talkRoom, talkSender, talkMsg) {
  talkSender = talkSender.trim();
  talkMsg = talkMsg.trim();

  FileStream.append(sdcard + "/WiuBot/talk/" + talkRoom + ".txt", talkSender + " : " + talkMsg + "\n");

}

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

var url = "http://search.naver.com/search.naver?sm=tab_hty.top&where=nexearch&query=";

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

function checkFuck(talkSender, talkMsg, replier) {
  talkSender = talkSender.trim();
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

function setSchedule(talkRoom, talkMsg) {
  var file = sdcard + "/WiuBot/schedule/" + talkRoom + ".txt";
  if (!(java.io.File(file).isFile())) FileStream.append(file, "");
  FileStream.append(file, talkMsg + "\n");
}

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

function ddayLists(today, date, place, talkRoom) {
  var schedule = checkSchedule(talkRoom, date).split("\n");
  var res1 = today + "은 " + date + "일이며 현재 " + place + "의 기온은 " + getWeather(place)[1].replace("현재온도 : ", "") + "이며, 체감온도는 " + getWeather(place)[2].replace("체감온도 : ", "") + "입니다.\n";
  var res2 = today + "의 시간표는 \n1." + schedule[0] + "\n2." + schedule[1] + "\n3." + schedule[2] + "\n4." + schedule[3] + "\n5." + schedule[4] + "\n6." + schedule[5] + "\n7." + schedule[6] + "\n입니다.";
  var res3 = "";
  for (var i = 0; i < schedule.length; i++) {
    if (schedule[i] == "체육") {
      res3 = "\n" + today + "은 체육이 있으니 체육복을 챙기시기 바랍니다.";
      break;
    }
  }

  return res1 + res2 + res3;
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

  if (room == "게임방") {
    checkFuck(sender, msg, replier);
  }

  if ((msg.indexOf("wiu") == 0) || (msg.indexOf("Wiu") == 0)) {
    switch (command[1]) {
      case "내일급식":
      case "낼급식":
        replier.reply("[급식]\n" + "\u200b".repeat(500) + getCafe(1) + "\n다른 명령어가 궁금하다면? - wiu help -");
        break;
      case "오늘급식":
        replier.reply("[급식]\n" + "\u200b".repeat(500) + getCafe(0) + "\n다른 명령어가 궁금하다면? - wiu help -");
        break;
      case "급식":
        replier.reply("[" + command[2] + " 급식]\n\n" + "\u200b".repeat(500) + getCafe(parseInt(command[3]), command[2]) + "\n다른 명령어가 궁금하다면? - wiu help -");
        break;
      case "명령어":
      case "help":
        replier.reply("[명령어]\n" + "\u200b".repeat(500) + "[Wiu]\n명령어 목록 (2019/12/07 마지막 수정)\n밑의 모든 명령어는 모두 앞에 'wiu' 또는 'Wiu'을 적고 하셔야 합니다!\n명령어, help: 명령어 목록을 확인합니다!\n\n[급식]\n내일급식, 낼급식: 내일 급식을 확인합니다.\n오늘급식: 오늘 급식을 확인합니다.\n급식: '급식 m n'로 m학교의 n일 후 급식을 확인합니다.\n\n[기록]\n내기록: 나의 톡 기록을 확인합니다.\n기록: '기록 user'로 user의 톡 기록을 확인합니다.\n\n(추후 더욱 많은 명령어 추가 예정)");
        break;
      case "내기록":
        replier.reply("[기록]\n" + "\u200b".repeat(500) + readData(room, sender));
        break;
      case "기록":
        replier.reply("[기록]\n" + "\u200b".repeat(500) + readData(room, command[2]));
        break;
      case "비속추":
      case "비속어추가":
        writeFuck(sender, command[2], replier);
        break;
      case "시변":
        changeSchedule(command[2], command[3].split("."), command[4] + " " + command[5] + " " + command[6] + " " + command[7] + " " + command[8] + " " + command[9] + " " + command[10], replier);
        break;
      case "시추":
        setSchedule(command[2], command[3] + " " + command[4] + " " + command[5] + " " + command[6] + " " + command[7] + " " + command[8] + " " + command[9]);
        break;
      case "날씨":
        replier.reply("[" + command[2] + " 날씨]\n\n" + getWeather(command[2]).join("\n"));
        break;
      case "시간표":
        if (dday == 0) {
          replier.reply(checkSchedule(command[2], day));
        } else if (dday == 6) {
          replier.reply(checkSchedule(command[2], day + 1));
        } else {
          replier.reply(checkSchedule(command[2], day - 1));
        }
        break;
      case "report":
      case "리포트":
        if (room == "2-6" || room == "이상한 방" || room == "김용수") {
          if (dday == 0 || dday == 6) {
            replier.reply("주말에는 지원되지 않습니다.");
            break;
          }
          replier.reply(ddayLists("오늘", day - 1, "대천", "2-6"));
        }
        break;
      case "내일리포트":
        if (room == "2-6" || room == "이상한방" || room == "김용수") {
          if (dday == 5 || dday == 6) {
            replier.reply("주말에는 지원되지 않습니다.");
            break;
          }
          replier.reply(ddayLists("내일", day, "대천", "2-6"));
        }
        break;
      default:
    }
  }
  saveTalk(room, sender, msg);
}
