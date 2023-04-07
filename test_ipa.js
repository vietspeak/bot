
const {
    getRandomInt,
    randomIndex,
    getCurrentTask,
    currentTimeStamp,
    cleanTextToCompare,
    vttToPlainText,
    later,
    development,
    onlyHandleChannelbanthongtin,
    onlyHandleChannel2,
    onlyHandleMainThreadEvent,
    onlyHandlePublicEvent,
    onlyHandleIfIM,
    onlyHandleIfNotDeletingEvent,
    onlyHandleIfNotBot,
    getBeginningAndEndingTask,
    getTimeStampFromTaskNumber,
    stringToSlug,
    allowingString,
    onlyHandleIfUploadFile,
    getTheLastDayOfTheMonth,
    onlyHandleFollowingSingleWord,
  } = require("./utilities");

const open_ipa = require("./data/open-ipa-en_US.json");


function convertIPA(inputText) {
    if (inputText.length === 0) return;
  
    inputText = inputText.trim().toLowerCase();
  
    inputText = cleanTextToCompare(inputText);
  
    inputText = inputText.split(" ");
  
    let ipaList = open_ipa.en_US[0];
  
    let ipaConverted = [];
  
    for (let item in inputText) {
      if (ipaList[inputText[item]] === undefined) {
        ipaConverted.push(inputText[item]);
      } else {
        ipaConverted.push(ipaList[inputText[item]]);
      }
    }
  
    let final = ipaConverted.join(" ");
    const slash = /[\/]+/gim;
    final = final.replace(slash, "");
  
    const same = /, +/gim;
    final = final.replace(same, "|");
  
    return final;
  }

  console.log(convertIPA("comparing"))
  console.log(convertIPA("thinking"))