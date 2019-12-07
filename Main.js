const scriptName = "Main.js";

var sdcard = android.os.Environment.getExternalStorageDirectory().getAbsolutePath();
var folder = new java.io.File(sdcard + "/WiuBot/");
folder.mkdirs();

function addCalendar(roomName, title, content) {
  title = title.trim();
  content = content.trim();

  var file = new java.io.File(sdcard + "/" + roomName + "/calendar.txt");

  if (file.exists()) {
    var fos = new java.io.FileOutputStream(file);
    var str = new java.io.lang.String(title + " : " + content);
    fos.write(str.getBytes());
    fos.close();
  }

}

var day = new Date();
var m = (day.getMonth() + 1);
var u = Utils.getWebText("http://search.naver.com/search.naver?sm=tab_hty.top&where=nexearch&query=대천고급식");


function getCafeA(days) {
  try {
    var d = (day.getDate() + days);
    var pap = (m + "월 " + d + "일 ");
    var a1 = u.split(pap + "[조식]" + "</strong>");
    var b1 = a1[1].split("</ul>");
    b1 = b1[0].replace(/(<([^>]+)>)/g, "");
    b1 = b1.replace(/\s$/gi, "");
    return (pap + "[조식]" + b1);
  } catch (e) {
    return (pap + "[조식]\n\n오늘 조식이 없습니다.\n");
  }
}

function getCafeB(days) {
  try {
    var d = (day.getDate() + days);
    var pap = (m + "월 " + d + "일 ");
    var a2 = u.split(pap + "[중식]" + "</strong>");
    var b2 = a2[1].split("</ul>");
    b2 = b2[0].replace(/(<([^>]+)>)/g, "");
    b2 = b2.replace(/\s$/gi, "");
    return (pap + "[중식]" + b2);
  } catch (e) {
    return (pap + "[중식]\n\n오늘 중식이 없습니다.\n");
  }
}

function getCafeC(days) {
  try {
    var d = (day.getDate() + days);
    var pap = (m + "월 " + d + "일 ");
    var a3 = u.split(pap + "[석식]" + "</strong>");
    var b3 = a3[1].split("</ul>");
    b3 = b3[0].replace(/(<([^>]+)>)/g, "");
    b3 = b3.replace(/\s$/gi, "");
    return (pap + "[석식]" + b3);
  } catch (e) {
    return (pap + "[석식]\n\n오늘 석식이 없습니다.\n");
  }
}

function saveTalk(room, sender, msg) {
  var file = new java.io.File(sdcard + "/" + room + "/talk.txt");

  if (file.exists()) {
    var fos = new java.io.FileOutputStream(file);
    var str = new java.io.lang.String(sender + "#:#" + msg);
    fos.write(str.getBytes());
    fos.close();
  }
}

function getInform(room, sender) {
  var file = new java.io.File(sdcard + "/" + room + "/talk.txt");
  if (!(file.exists)) return null;
  var fis = new java.io.FileInputStream(file);
  var isr = new java.io.InputStreamReader(fis);
  var br = new java.io.BufferedReader(isr);
  var line = br.readLine();
  var str1 = "";
  var str2 = "";
  var num = 0;
  while ((str1 = br.readLine()) != null) {
    str2 = str.split("#:#");
    if (str2 == sender) {
      num += num + 1;
    }
  }
  fis.close();
  isr.close();
  br.close();
  return num;
}

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
  if (room == "Sydney Avengers") {
    replier.reply("시험이 잘못했어요");
  } else {
    if ((msg.indexOf("wiu") == 0)) {
      var command = msg.split(" ");

      switch (command[1]) {
        case "일정추가":
          var calendar = command[2].split(":");
          addCalendar(room, calendar[0], calendar[1]);
          replier.reply("[Wiu] 일정 " + calendar[0] + "이/가 " + calendar[1] + "까지로 저장되었습니다.");
          break;
        case "내일급식":
        case "낼급식":
          replier.reply(getCafeA(1) + "\n" + getCafeB(1) + "\n" + getCafeC(1) + "\n\n다른 명령어가 궁금하다면? - wiu 명령어 -");
          break;
        case "오늘급식":
          replier.reply(getCafeA(0) + "\n" + getCafeB(0) + "\n" + getCafeC(0));
          break;
        case "급식":
          replier.reply(getCafeA(parseInt(command[2])) + "\n" + getCafeB(parseInt(command[2])) + "\n" + getCafeC(parseInt(command[2])));
          break;
        case "명령어":
          replier.reply("[Wiu]\n명령어 목록 (2019/12/05 마지막 수정)\n밑의 모든 명령어는 모두 앞에 'wiu'을 적고 하셔야 합니다!\n공지 : 공지를 확인합니다!\n명령어 : 명령어 목록을 확인합니다!\n내일급식, 낼급식 : 내일 급식을 확인합니다.\n오늘급식 : 오늘 급식을 확인합니다.\급식: '급식 n'으로 n일 후 급식을 확인합니다.\n\n내정보 : 자신의 정보를 확인합니다\n방정보 : 방의 정보를 확인합니다\n\n(추후 더욱 많은 명령어 추가 예정)");
          break;
        case "내정보":
          replier.reply(sender + "님은 이 방에서 총 " + getInform() + "번 얘기하셨습니다.");
          break;
        case "방정보":
          replier.reply("[ILF]\n방이름 : " + room + "\n개설일 : 2018/05/31");
          break;
        default:

      }
      saveTalk(room, sender, msg);
    } else if ((msg.indexOf("던질까") == 0)) {
      var num = Math.floor(Math.random() * 50);
      if (num == 0) {
        replier.reply("던져!");
      } else {
        replier.reply("던지지 마");
      }

    } else {
      saveTalk(room, sender, msg);
    }
  }
}
