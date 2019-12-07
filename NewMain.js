const scriptName = "Main.js";

var sdcard = android.os.Environment.getExternalStorageDirectory().getAbsolutePath();

var d = new Date();
var month = (d.getMonth() + 1);

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

function getCafe(days, school) {
  var day = (d.getDate() + days);
  var pap = (month + "월 " + day + "일 ");
  var cafeArray = ["조식", "중식", "석식"];
  var cafeVal = "";
  var util = Utils.getWebText("http://search.naver.com/search.naver?sm=tab_hty.top&where=nexearch&query=" + school + "급식");

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
  var util = Utils.getWebText("http://search.naver.com/search.naver?sm=tab_hty.top&where=nexearch&query=" + place + "날씨");
  util = util.replace(/<[^>]+>/g, "").split("월간")[1].split("시간별 예보")[0].trim().split("\n");
  var results = [];
  results[0] = util[0];
  results[1] = util[3].replace("온도", "온도 : ").trim() + "℃";
  results[2] = util[4].replace("온도", "온도 : ").trim() + "℃";
  results[3] = util[9].replace("먼지", "먼지 : ").trim();
  results[4] = util[13].replace("습도", "습도 : ").trim() + "%";
  var result = "[" + place + " 날씨]\n\n" + results.join("\n");
  return result;

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

var folder = new java.io.File(sdcard + "/WiuBot/talk/");
folder.mkdirs();


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

  checkFuck(sender, msg, replier);

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
      default:
    }
  } else if (room == "반톡[쌤없음]" || room == "이상한 방") {
    if (msg == "내일 급식 뭐지") {
      replier.reply("[급식]\n" + "\u200b".repeat(500) + getCafe(1) + "\n다른 명령어가 궁금하다면? - wiu help -");
    } else if (msg == "오늘 급식 뭐지") {
      replier.reply("[급식]\n" + "\u200b".repeat(500) + getCafe(0) + "\n다른 명령어가 궁금하다면? - wiu help -");
    }
  } else if (room == "Sydney Avengers" && sender == "Sydney English") {
    replier.reply("시험이 잘못했어요");
  }

  saveTalk(room, sender, msg);
}
