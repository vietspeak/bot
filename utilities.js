exports.currentTimeStamp = () => Math.floor(new Date().getTime() / 1000.0);

let list_task = [
  1646931600, 1647795600, 1648746000, 1649610000, 1650474000, 1651338000,
  1652202000, 1653066000, 1654016400, 1654880400, 1655744400, 1656608400,
  1657472400, 1658336400, 1659286800, 1660150800, 1661014800, 1661965200,
  1662829200, 1663693200, 1664557200, 1665421200, 1666285200, 1667235600,
  1668099600, 1668963600, 1669827600, 1670691600, 1671555600, 1672506000,
  1673370000, 1674234000, 1675184400, 1676048400, 1676912400, 1677603600,
  1678467600, 1679331600, 1680282000, 1681146000, 1682010000, 1682874000,
  1683738000, 1684602000, 1685552400, 1686416400, 1687280400, 1688144400,
  1688144400, 1688922000, 1689786000, 1690822800, 1691600400, 1692464400,
  1693501200, 1694278800, 1695142800, 1696093200, 1697734800, 1698771600,
  1699549200, 1700413200, 1701363600, 1701363600, 1702141200, 1703005200,
  1704042000, 1704819600, 1705683600,
];

//https://www.epochconverter.com/

exports.getBeginningAndEndingTask = function (currentTime) {
  let getTime = list_task.filter((e) => e > currentTime);
  let ending = getTime[0];
  let beginning = list_task.indexOf(ending) - 1;
  beginning = list_task[beginning];
  return { beginning, ending, totalDay: (ending - beginning) / 86400 };
};

exports.getCurrentTask = function (currentTime) {
  let getCurrentTask = list_task.filter((e) => e > currentTime);
  getCurrentTask = getCurrentTask[0];
  let starting_task = 68;
  getCurrentTask = list_task.indexOf(getCurrentTask) + starting_task;
  let latestTask = list_task.length + starting_task;
  const myDate = (timeStampt) => {
    return new Date(timeStampt * 1000).toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  console.log(
    "Current task: " + getCurrentTask + " - time: " + myDate(currentTime)
  );

  console.log(
    "Latest time setup task: " +
      latestTask +
      " on " +
      myDate(list_task[list_task.length - 1])
  );
  return getCurrentTask;
};

exports.getTimeStampFromTaskNumber = function (task) {
  if (task < 68) return;
  let firstIndex = 68;
  let itemIndex = Number(task) - (68 + 1);
  let beginning = list_task[itemIndex];
  let ending = list_task[itemIndex + 1];
  return {
    beginning,
    ending,
    totalDay: (ending - beginning) / 86400,
  };
};

exports.cleanTextToCompare = function (textInput) {
  let result = textInput.trim().toLowerCase();
  const cong = /[‘’]/g;
  result = result.replace(cong, `'`);

  const dash = /-/g;
  result = result.replace(dash, " ");
  //   match everything except word and space + '
  const nonString = /[^\w\s']+/gim;

  result = result.replace(nonString, "");
  const newline = /\r?\n|\r/g;
  result = result.replace(newline, " ");
  return result;
};

exports.vttToPlainText = (textInput) => {
  if (textInput.length === 0) {
    return;
  }

  textInput = textInput.replace(/WEBVTT/g, "");
  textInput = textInput.replace(/.+ --> .+/g, "");
  textInput = textInput.replace(/<\/c>/g, "");
  textInput = textInput.replace(/<.+?>/g, "");
  textInput = textInput.replace(/^\s*$/g, "");
  textInput = textInput.replace(/&nbsp;/g, " ");
  textInput = textInput.replace(/-/g, " ");
  let lines = textInput.split("\n");

  lines.splice(0, 2);
  lines = lines.map((line) => line.trim());
  lines = lines.filter((line) => line.length > 0);
  lines = lines.filter((line, index, lines) => line !== lines[index + 1]);
  return lines.join(" ");
};

exports.stringToSlug = function (str) {
  // remove accents
  var from =
      "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
    to =
      "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(RegExp(from[i], "gi"), to[i]);
  }

  str = str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-]/g, "_")
    .replace(/-+/g, "_");

  return str;
};

exports.isVietnamese = function (str) {
  str = str.toLowerCase().trim();
  let vietnamesetone =
    "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ";
  for (let i = 0; i < str.length; i++) {
    for (let j = 0; j < vietnamesetone.length; j++) {
      if (str[i] == vietnamesetone[j]) {
        return true;
        break;
      }
    }
  }
  return false;
};

exports.allowingString = function (str) {
  if (/^[a-zA-Z0-9_-]+$/.test(str)) {
    return true;
  }

  return false;
};

exports.later = function (delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
};

exports.development = function (user, event) {
  console.log(event);
  // only handle the user William Shakehand
  if (user != "U01C3SA99FW") return true;
};

exports.onlyHandleChannelbanthongtin = function (channel) {
  if (typeof channel === "undefined") return;
  if (channel != "G01BPHWQ023") return true;
};

exports.onlyHandleChannel2 = function (channel) {
  if (typeof channel === "undefined") return;
  if (channel != "C01BY57F29H") return true;
};

exports.onlyHandleMainThreadEvent = function (thread_ts) {
  if (typeof thread_ts === "string") return true;
};

exports.onlyHandlePublicEvent = function (channel_type) {
  if (typeof channel_type === "undefined") return;
  // DO NOT HANDLE IF SEND THROUGH IM
  if (channel_type === "im") return true;
};

exports.onlyHandleIfIM = function (channel_type) {
  if (typeof channel_type === "undefined") return;
  if (channel_type !== "im") return true;
};

exports.onlyHandleIfNotDeletingEvent = function (subtype) {
  if (typeof subtype === "undefined") return false;
  if (subtype === "message_deleted") return true;
};

exports.onlyHandleIfNotBot = function (user) {
  //user Vietspeak bot, KIWI -> do not handle
  if (user == "U01EVJFP0U8" || user == "U01HEMMPVK2") return true;
};

exports.onlyHandleIfIM = function (channel_type) {
  if (typeof channel_type === "im") return;
  if (channel_type !== "im") return true;
};

exports.getRandomInt = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.randomIndex = function (max) {
  return Math.floor(Math.random() * max);
};

exports.onlyHandleIfUploadFile = function (files) {
  if (typeof files === "undefined") return true;
};

exports.getTheLastDayOfTheMonth = function () {
  const currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth() + 1;
  return new Date(currentYear, currentMonth, 0).getDate();
};

exports.allowSingleKeyWords = function (inputText = "", list = []) {
  if (inputText.length === 0) return true;
  inputText = inputText.trim().toLowerCase();
  inputText = inputText.split(" ");
  if (inputText.length > 1) return true;
  inputText = inputText[0];
  if (list.length === 0) return true;
  if (!list.includes(inputText)) return true;
};
