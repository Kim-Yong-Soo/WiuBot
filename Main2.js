const scriptName = "Main.js";
var path = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + "/WiuBot";

var day = new Date();
var month = (d.getMonth() + 1);
var year = d.getFullYear();
var dday = d.getDay();

function dayNum() { return ((dday == 0) && (dday == 6)) && 0 || dday - 1; }

function saveTalk(tRoom, tSender, tMsg) {
  FileStream.append(path + "/talk/" + talkRoom + ".txt", talkSender + " : " + talkMsg + "\n");
}
