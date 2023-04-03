require("dotenv").config();

let IBM_Cloudant_VietSpeak_Url = process.env.IBM_Cloudant_VietSpeak_Url;
let IBM_Cloudant_Vietspeak_APIKEY = process.env.IBM_Cloudant_Vietspeak_APIKEY;

let Slack_KIWI_UserClient_token = process.env.Slack_KIWI_UserClient_token;
let Slack_KIWI_Client_token = process.env.Slack_KIWI_Client_token;
let Slack_User_VietSpeakBank_token = process.env.Slack_User_VietSpeakBank_token;
let Slack_KIWI_Bot_token = process.env.Slack_KIWI_Bot_token;
let Slack_KIWI_App_token = process.env.Slack_KIWI_App_token;
let Slack_HOOK_Channel2 = process.env.Slack_HOOK_Channel2;
let Slack_DOWNLOAD_TOKEN = process.env.Slack_DOWNLOAD_TOKEN;

let AirTable_Api_key = process.env.AirTable_Api_key;
let MICROSOFT_Text_to_Speech_token = process.env.MICROSOFT_Text_to_Speech_token;
let MICROSOFT_TRANSLATION_token = process.env.MICROSOFT_TRANSLATION_token;
let WEATHER_API = process.env.WEATHER_API;

let apiEmailSorted = `https://api.airtable.com/v0/appDhJQmOmVO1x4DM/register_form_vietspeak?fields%5B%5D=Formdate&fields%5B%5D=email__address&sort%5B0%5D%5Bdirection%5D=desc&sort%5B0%5D%5Bfield%5D=Formdate&api_key=${AirTable_Api_key}`;

// ====================================================================
const {App} = require("@slack/bolt");
const {WebClient, LogLevel} = require("@slack/web-api");

const NodeCache = require("node-cache");

const myCache = new NodeCache();

const flatCache = require("flat-cache");
const cache = flatCache.load("vietspeak");

const {customAlphabet} = require("nanoid");
const alphabet = "abcdefghijklmnopqrstuvwxyz123456789";
const nanoid = customAlphabet(alphabet, 11);

// ===========================clientcloudant=================================
const {CloudantV1} = require("@ibm-cloud/cloudant");
const {IamAuthenticator} = require("ibm-cloud-sdk-core");

//https://cloud.ibm.com/apidocs/cloudant?code=node#authentication
const authenticator = new IamAuthenticator({
  apikey: IBM_Cloudant_Vietspeak_APIKEY,
});

const clientcloudant = new CloudantV1({
  authenticator: authenticator,
});
clientcloudant.setServiceUrl(IBM_Cloudant_VietSpeak_Url);
// ===========================clientcloudant=================================

var rhymesVietSpeak = require("rhyming.ly").rhymes;
const sdk = require("microsoft-cognitiveservices-speech-sdk");

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

const {Observable, from, of, timer, range, firstValueFrom} = require("rxjs");
const {
  map,
  first,
  scan,
  toArray,
  tap,
  last,
  take,
  filter,
  catchError,
} = require("rxjs/operators");
const {ajax} = require("rxjs/ajax");
const {request} = require("universal-rxjs-ajax"); //use this for nodejs environment

// ============================================================

const client = new WebClient(Slack_KIWI_Client_token, {
  logLevel: LogLevel.DEBUG,
});

// dùng để gọi chat.delete API với token của user
const clientUser = new WebClient(Slack_KIWI_UserClient_token, {
  logLevel: LogLevel.DEBUG,
});

// ============================================================
const VietSpeakBankUser = new WebClient(Slack_User_VietSpeakBank_token, {
  logLevel: LogLevel.DEBUG,
});

const stringSimilarity = require("string-similarity");
const {v4: uuidv4} = require("uuid");
const schedule = require("node-schedule");

const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

const joke = require("./data/joke.json");
let jokeLength = joke.length;

const quote = require("./data/quote.json");
let quoteCount = quote.length;

const stories = require("./data/stories.json");
let storiesCount = stories.length;

const factsModule = require("./data/facts");
const factCount = factsModule.facts.length;

const TOEFL = require("./data/TOEFLwords"); //400 must know TOELF words
const lengthTOEFL = TOEFL.words.length;

const taoeba = require("./data/taoeba/done_taoeba.json");

const open_ipa = require("./data/open-ipa-en_US.json");

function getRandomStories(Randomeindex) {
  return `*${stories[Randomeindex].title}* \n By ${stories[Randomeindex].author} \n \n ${stories[Randomeindex].story}`;
}

function getRandomQuote(Randomeindex) {
  return `${quote[Randomeindex].quoteText} - *${quote[Randomeindex].quoteAuthor}*`;
}

function funFact(index) {
  return factsModule.facts[index].text;
}

const app = new App({
  socketMode: true,
  token: Slack_KIWI_Bot_token,
  appToken: Slack_KIWI_App_token,
});

app.event("message", async ({body, event, context, client, message}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleFollowingSingleWord(text, ["hi", "hello", "hey"])) return;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  const sayGreetings = [
    `how are you ? `,
    `bạn có khỏe hông?! `,
    `what's up?`,
    `nice to see you here! `,
    `how is it going?`,
    `tui biết xài tiếng Việt nha.! `,
    `hế nhô hế nhô!`,
    `chúc một ngày tốt lành nha!`,
  ];

  let randomsayGreetings = sayGreetings[randomIndex(sayGreetings.length)];

  let botReplyGreeting = `${text} <@${message.user}>, ${randomsayGreetings}`;

  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: botReplyGreeting,
    });
  } catch (error) {
    console.error(error);
  }
});

app.event("message", async ({body, event, context, client, message}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleFollowingSingleWord(text, ["thanks", "thank"])) return;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  const thanks = [
    `You are welcome <@${message.user}>! `,
    `Hông có chi <@${message.user}>! `,
    `Chiện nhỏ á <@${message.user}>! `,
    `Okey bro <@${message.user}>! `,
    `Sure <@${message.user}>! `,
    `No worry <@${message.user}>! `,
  ];

  let randomsayThanks = thanks[randomIndex(thanks.length)];
  let botReplyThanks = `<@${message.user}>, ${randomsayThanks}`;
  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: botReplyThanks,
    });
  } catch (error) {
    console.error(error);
  }
});

//=========================================GRE================================================================

app.event("message", async ({message, say}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleFollowingSingleWord(text, ["v"])) return;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  fs.readFile("data/gre-vocabulary.json", "utf8", async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const databases = JSON.parse(data);
    let random = Math.floor(Math.random() * databases.length);
    let word = `*${databases[random].word}* - /${databases[random].pronunciation}/ - *Synonyms:* ${databases[random].synonyms}- *Meaning:* ${databases[random].definition} - *Example: * ${databases[random].passage}`;

    try {
      const result = await client.chat.postMessage({
        channel: user,
        text: word,
      });
    } catch (error) {
      console.error(error);
    }
  });
});

// ==============================weather ==============================
app.message(/(w|W)\s[a-zA-Z]+/, async ({context, body, message, say}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  let textInput = body.event.text;
  let location = text.split(" ")[1].toLowerCase();

  if (location === "hochiminh") {
    location = "saigon";
  }

  if (location === "sg") {
    location = "saigon";
  }

  if (location === "hcm") {
    location = "saigon";
  }

  if (location === "hue") {
    location = "hue-vietnam";
  }

  if (location === "danang") {
    location = "da nang";
  }

  if (location === "phanthiet") {
    location = "phan thiet";
  }

  if (location === "quangtri") {
    location = "quang tri";
  }

  if (location === "dongnai") {
    location = "dong nai";
  }
  let urlWeatherAPI = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API}&q=${location}`;

  async function geWeather() {
    try {
      const response = await axios.get(urlWeatherAPI);
      let locationResponse = `${response.data.location.name} - ${response.data.location.country}`;
      let condition = response.data.current.condition.text;
      let updated = response.data.current.last_updated;
      let tempc = response.data.current.temp_c;
      let tempf = response.data.current.temp_f;
      let humidity = response.data.current.humidity;
      let feelslikeC = response.data.current.feelslike_c;
      let feelslikeF = response.data.current.feelslike_f;

      // console.log(response);
      let weatherResponse = `The weather condition in ${locationResponse}: \n
        *Temperature*: ${tempc}C/${tempf}F \n
        *Feel like*: ${feelslikeC}C/${feelslikeF}F \n
        *Overall*: ${condition} \n
        *Humidity*: ${humidity} \n
        *Updated*: ${updated}
        `;

      const result = await client.chat.postMessage({
        channel: user,
        text: weatherResponse,
      });
    } catch (error) {
      console.error(error);
    }
  }

  geWeather();
});

// ==============================fact===============================
app.event("message", async ({message, say}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleFollowingSingleWord(text, ["f", "ff", "fact"])) return;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  let words = funFact(randomIndex(factCount));

  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: words,
    });
  } catch (error) {
    console.error(error);
  }
});

// ==============================quote===============================
app.event("message", async ({message, say}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleFollowingSingleWord(text, ["q", "quote"])) return;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  let words = getRandomQuote(randomIndex(quoteCount));

  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: words,
    });
  } catch (error) {
    console.error(error);
  }
});

// ==============================story===============================
app.event("message", async ({message, say}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleFollowingSingleWord(text, ["s", "story"])) return;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  let words = getRandomStories(randomIndex(storiesCount));

  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: words,
    });
  } catch (error) {
    console.error(error);
  }
});

// ==============================joke===============================
app.event("message", async ({message, event}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleFollowingSingleWord(text, ["j", "joke"])) return;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  let jokeFetched = joke[randomIndex(jokeLength)];
  let jokeSetup = jokeFetched.setup;
  let jokePunchline = jokeFetched.punchline;
  let words = `*-* ${jokeSetup}\n *-* ${jokePunchline}`;

  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: words,
    });
  } catch (error) {
    console.error(error);
  }
});

// HELP-------------------
app.event("message", async ({message, say}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleFollowingSingleWord(text, ["h", "help"])) return;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  let words = `1) Type *\`d love\`* to check the dictionary of the word \`love\`.\n 2) Type *\`v\`* to receive a random GRE vocabulary. \n 3) Type *\`f\`* to receive a random fun fact. \n 4) Type *\`j\`* to receive a random joke. \n 5) Type *\`q\`* to receive a random quote. \n 6) Type *\`w x\`* to receive a x' weather condition. Try *\`w saigon\`*.\n 7) Type *\`h\`* to receive help. Here you are. \n 8) Type *\`s\`* to receive a random story written by Aesop. Enjoy reading!. \n 9) Type *\`e\`* .to receive a random article published by Economist. Enjoy reading!. \n 10) Type *\`hi\`*, *\`hello\`* or *\`thanks\`* if you wish. \n 11) Type *\`me\`*, to set up your profile. \n 12) Type *\`follow\`* or *\`unfollow\`* and mention the users you want to follow or unfollow. \n 13) Click on the bouque icon to receive the mark of the current audio.\n 14) Send *\`"vi English sentence"\`* to translate English to Vietnamese.\n 15) Send *\`"en xin chào"\`* to translate Vietnamese to English.\n 16) Send *\`"visound  xin chào"\`* to convert text to Vietnamese speech.\n 17) Send *\`"ensound hello world"\`* to convert text to English speech.\n 18) Send *\`"me_yourid"\`* to set up your own anonymous ID.\n 19) Type *\`"thanos"\`* in the thread created by you to eliminate the whole thread.\n 20) Type your transcript in the channel #8 to receive your mark when listening to the audio.\n 21) Type *\`"bee"\`* when you want to receive the transcript.`;

  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: words,
    });
  } catch (error) {
    console.error(error);
  }
});

async function getDictionary(wordCheck) {
  let urlDict = `https://api.dictionaryapi.dev/api/v2/entries/en/${wordCheck}`;
  const dictResponse = await axios.get(urlDict);

  let word = dictResponse.data[0].word;
  let phonetic = dictResponse.data[0].phonetic;
  // let phonetics = dictResponse.data[0].phonetics; // contain audio file
  // console.log(dictResponse.data)
  let origin = dictResponse.data[0].origin;
  let meanings = dictResponse.data[0].meanings;

  let finalmeaningReturn = [];
  finalmeaningReturn.push("*`Word`*: " + word + "\n");
  finalmeaningReturn.push(`*Phonetic*: /${phonetic}/\n`);
  if (origin !== undefined) {
    finalmeaningReturn.push(`*Origin*: ${origin}\n`);
  }

  finalmeaningReturn.push(`\n`);
  let meaningNumber = 0;
  for (eachmeaning of meanings) {
    for (dinhnghia of eachmeaning.definitions) {
      meaningNumber++;
      finalmeaningReturn.push(
        meaningNumber +
        ") " +
        "*Definition*: " +
        "*`" +
        dinhnghia.definition +
        "`*" +
        "\n"
      );
      if (dinhnghia.example !== undefined) {
        finalmeaningReturn.push(`*Example*: ${dinhnghia.example}\n`);
      }
      if (dinhnghia.synonyms.length > 0) {
        finalmeaningReturn.push(
          `*Synonyms*: ${dinhnghia.synonyms.join(", ")}\n`
        );
      }
      if (dinhnghia.antonyms.length > 0) {
        finalmeaningReturn.push(
          `*Antonyms*: ${dinhnghia.antonyms.join(", ")}\n`
        );
      }
      finalmeaningReturn.push(`\n`);
    }
  }

  finalmeaningReturn = finalmeaningReturn.join("");
  console.log(finalmeaningReturn);
  return finalmeaningReturn;
}

app.message(/^(d|D)\s[a-zA-Z]+/, async ({body, message, say}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  let textInput = body.event.text;
  let wordToCheck = textInput.split(" ")[1].toLowerCase();
  let dataReturn = await getDictionary(wordToCheck);

  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: dataReturn,
    });
  } catch (error) {
    console.error(error);
  }
});

//======================================================nytimes ======================================================
let link = "https://kiwi.vietspeak.org/api/nytimes.php";

async function getNews(url) {
  const dictResponse = await axios.get(url);
  let objectURL = dictResponse.data.channel.item;
  return objectURL;
}

async function getItem(index) {
  let linkURL = await getNews(link);
  let firstUrl = linkURL[index].link;
  let htmlResponse = await axios.get(firstUrl);
  const $ = cheerio.load(htmlResponse.data);
  let title = $("h1").html();
  let article = $("[name=articleBody]").text(); //https://fidget.dev/posts/read-the-new-york-times-for-free-using-nodejs-scraper/
  let news = `
  *${title}*\n
  ${article}\n
  `;
  return news;
}

//=========================nytimes========================================================
app.event("message", async ({message, say}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  if (onlyHandleFollowingSingleWord(text, ["ny"])) return;

  let dataReturnNYT = await getItem(randomIndex(10));

  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: dataReturnNYT,
    });
  } catch (error) {
    console.error(error);
  }
});

// ======================== economist =====================================================

let economistAPI = "https://kiwi.vietspeak.org/api/economist.php";

let totalItem = 100;

async function getEconomistExplain(url) {
  const economistResponse = await axios.get(url);

  console.log(economistResponse);

  let objectURL = economistResponse.data.channel.item;
  return {
    objectURL,
  };
}

async function getItemEconomist(randomIndex) {
  let ObjectLink = await getEconomistExplain(economistAPI);
  let randomLink = ObjectLink.objectURL[randomIndex].link;
  let publishedDate = ObjectLink.objectURL[randomIndex].pubDate;
  let htmlResponse = await axios.get(randomLink);
  const $ = cheerio.load(htmlResponse.data);
  const headline = $(".article__headline").text();
  const description = $(".article__description").text();
  const articles = $(".article__body-text");
  let audio = $(".react-audio-player").attr("src");
  const textEconomist = [];
  articles.each(function (index, element) {
    textEconomist.push($(this).text());
  });

  let articleBodyCombined = textEconomist.join("\n\n");
  const resultObject = {
    headline,
    description,
    articleBodyCombined,
    publishedDate,
    randomLink,
    audio,
  };
  return resultObject;
}

app.event("message", async ({event, message, body, say}) => {
  let {text, channel_type, user} = event;

  if (onlyHandleFollowingSingleWord(text, ["e"])) return;

  if (onlyHandleIfIM(channel_type)) return;
  let randomIndexEconomist = randomIndex(totalItem);
  let dataReturn = await getItemEconomist(randomIndexEconomist);

  let sayReturn = `*\`${dataReturn.headline}\`*\n
  _${dataReturn.description}_\n
  ${dataReturn.articleBodyCombined}\n
  Published: ${dataReturn.publishedDate}\n
  Link: ${dataReturn.randomLink}
  `;

  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: sayReturn,
    });
    console.log(result.ok);
  } catch (error) {
    console.error(error);
  }
});

// =========================================================SEND NEWS FROM ECONOMIST============================================================================
async function getAudioFileAxios(fileUrl, localFile) {
  //lưu ý stream không hỗ trơj promise, có thể dùng pipeline hoặc cách sau. ref: https://stackoverflow.com/questions/55374755/node-js-axios-download-file-stream-and-writefile
  const writer = fs.createWriteStream(localFile);
  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  }).then((response) => {
    //ensure that the user can call `then()` only when the file has been downloaded entirely.
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error = null;
      writer.on("error", (err) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on("close", () => {
        if (!error) {
          resolve(true);
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });
    });
  });
}

let channel9__vocabulary = "C01JCFU435G";

async function postEconoMistNews() {
  try {
    let randomIndexEconomist = randomIndex(totalItem);
    let dataReturn = await getItemEconomist(randomIndexEconomist);

    let sayReturn = `${dataReturn.articleBodyCombined}\n
    Published: ${dataReturn.publishedDate}\n
    Link: ${dataReturn.randomLink}
    `;

    await getAudioFileAxios(dataReturn.audio, "economist_audio.mp3");
    let thecomment = `Luyện tập tổng hợp với bản tin audio \n\n *${dataReturn.headline}*`;

    const file = "economist_audio.mp3";

    const result = await client.files.upload({
      channels: channel9__vocabulary, //----> channels có s khi up load file
      filename: uuidv4() + ".mp3",
      filetype: "mp3",
      title: uuidv4() + ".mp3",
      initial_comment: thecomment,
      file: fs.createReadStream(file),
    });

    let ts = result["file"]["shares"]["public"]["C01JCFU435G"][0]["ts"];

    try {
      const result = await client.chat.postMessage({
        channel: "C01JCFU435G",
        thread_ts: ts,
        text: sayReturn,
      });
      console.log(result.ok);
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
  }
}

const ruleEconomist = new schedule.RecurrenceRule();

ruleEconomist.second = 0;
ruleEconomist.minute = [5];

ruleEconomist.hour = [7, 11, 18];

ruleEconomist.tz = "Asia/Ho_Chi_Minh";

const jobPostEoconomist = schedule.scheduleJob(ruleEconomist, function () {
  postEconoMistNews();
});

// ========================================================================================================================================

async function getIPA(wordInput) {
  let urlDict = `https://api.dictionaryapi.dev/api/v2/entries/en/${wordInput}`;
  const dictResponse = await axios.get(urlDict);
  let word = dictResponse.data[0].word;
  let phonetic = dictResponse.data[0].phonetic;
  return phonetic;
}

app.event(
  "app_mention",
  async ({body, event, context, client, message, say}) => {
    let {
      client_msg_id,
      text,
      user,
      ts,
      team,
      thread_ts,
      parent_user_id,
      channel,
      events_ts,
    } = event;
    let lastWord;
    if (
      text.includes("welcome") ||
      text.includes("Welcome") ||
      text.includes("WELCOME") ||
      text.includes("WelCome")
    ) {
      text = text.trim().toLowerCase().split(" ");
      lastWord = text[text.length - 1];
    } else {
      return;
    }

    if (lastWord !== "welcome") {
      return;
    }

    try {
      const result = await client.chat.postMessage({
        channel: channel,
        thread_ts: thread_ts,
        text: "Chào mừng bạn đến với *`VietSpeak`* 💪💪💪\n\n 1) Bạn có thể ghé kênh <#C01BY57F29H>: để nghe bài thu âm của các vietspeaker. Đây cũng là nơi duy nhất bạn sẽ *`ĐĂNG BÀI`* thu của mình theo yêu cầu của từng task.\n\n 2) Các kênh <#C01BXLFCUP4>, <#C01CMFUGHUG>, <#C01BXSK7URZ> và <#C01BQUD8ALE> là nơi bạn *`XEM ĐỀ`*.\n\n 3) Bạn có cần phải đăng bài ngay ở task hiện tại? Với các thành viên mới gia nhập, deadline của bạn sẽ ở task sau. Bạn cũng có thể đăng bài nhưng không bắt buộc.❤️‍❤️‍❤️\n\n 4) Mỗi task kéo dài bao lâu? 10 ngày. *`DEADLINE`* các task luôn rơi vào ngày thứ 10, 20 và ngày cuối cùng của tháng, tùy từng tháng.\n\n 5) Tôi nên thu âm bằng cách nào? Bạn nên dùng app điện thoại hoặc bất kì phần mềm nào có thể thu âm để gửi file tới kênh 2. \n\n 6) Bạn có thể gửi file cho bot <@U01EVJFP0U8> để check điểm trước khi gửi bài. \n\n 7) Sau khi đăng bài trên <#C01BY57F29H>, bạn cần *`NHẬN XÉT`* cho 2 bài gần nhất, đăng trước bài đăng của bạn.\n\n 8) Bạn nhớ đổi tên file theo đúng form quy định để bot có thể nhận diện và phân loại bài dễ dàng hơn. Ví dụ: Ronaldo__Messi-task50-red-0109 (name-task-color-date_submitted).\n\n 9) Bạn còn có thể đăng bài, tương tác, 'chát chít' với các vietspeakers tại các kênh 7 -> 14. \n\n 10) Bạn không nên đăng các bài thu của mình liền nhau, nên cách nhau ít nhất 2 bài thu âm khác, để các thành viên có thể nhận xét giúp bạn \n\n Tui là <@U01HEMMPVK2>, bạn có thể gửi tin nhắn riêng như 'hi' hoặc 'help' tới tui. Tui cập nhật tình hình thời tiết, tin tức bốn phương, giúp tra từ điển, cung cấp truyện cười, quote, truyện ngắn tự động 🔥🔥🔥! \n\n Đồng đội của tui <@U01EVJFP0U8> cũng giúp bạn rất nhiều việc. Bạn có thể gửi 'help' tới ổng bot này để xem hướng dẫn!",
      });
      console.log(result.ok);
    } catch (error) {
      console.error(error);
    }
  }
);

app.event(
  "app_mention",
  async ({body, event, context, client, message, say}) => {
    let {
      client_msg_id,
      text,
      user,
      ts,
      team,
      thread_ts,
      parent_user_id,
      channel,
      events_ts,
    } = event;
    let lastWord;
    if (
      text.includes("faq") ||
      text.includes("FAQ") ||
      text.includes("Faq") ||
      text.includes("FAq")
    ) {
      text = text.trim().toLowerCase().split(" ");
      lastWord = text[text.length - 1];
    } else {
      return;
    }

    if (lastWord !== "faq") {
      return;
    }

    try {
      const result = await client.chat.postMessage({
        channel: channel,
        thread_ts: thread_ts,
        text: "Hệ thống FAQ của *`VietSpeak`* 💪💪💪\n\n 1) *`Tôi có thể giới thiệu link để bạn bè đăng ký tại địa chỉ nào? `*.\n\n Bạn có thể giới thiệu địa chỉ: https://vietspeak.org hoặc https://register.vietspeak.org \n\n 2) *`Nếu phải đăng ký lại, tôi có thể sử dụng địa chỉ email cũ không?`* \n\n Okey nhé, miễn là bạn vẫn sở hữu email đó. 🥰 \n\n 3) *`Tôi có thể sử dụng VietSpeak trên các hệ thống, nền tảng nào ?`* \n\n Bạn có thể sử dụng app Slack tải từ Apple Store hoặc Google Play, đăng nhập bằng tài khoản đã đăng kí cùng VietSpeak. Đa số các thành viên của VietSpeak còn sử dụng nền web với những trải nghiệm thú vị. Bạn có thể truy cập tại https://slack.vietspeak.org. \n\n4) *`Tôi phải làm việc gì bây giờ khi mới tham gia VietSpeak?`* \n\n Bạn cần thu âm, đính kèm file gửi tới kênh <#C01BY57F29H> theo deadline mỗi task. Bạn còn phải nhận xét cho 2 bài đăng liền kề trước bài đăng của bạn. \n\n 5) *`Tôi có cần phải đăng bài thu của mình ngay không khi deadline của task hiện tại đã cận kề?`* \n\n Với các thành viên mới tham gia, deadline của bạn sẽ ở task kế tiếp. Bạn có thể thu xếp để tham gia ngay task hiện tại nếu muốn.❤️‍🔥 \n\n 6) *`Ai sẽ giám sát việc đăng bài, thu bài của tôi? `* \n\n Hệ thống bot sẽ tự động giám sát việc đăng bài của các thành viên, có thể tự động đánh dấu các thành viên không nộp bài. \n\n 7) *`Tôi được biết VietSpeak có hệ thống đánh giá bài đọc bằng AI?`* \n\n Đúng vậy, bài đọc của bạn sẽ được hệ thống bot đánh giá điểm tự động. Điểm càng cao thì khả năng bài đọc của bạn sẽ được người bản xứ nghe càng dễ dàng hơn. \n\n 8) *`Tôi có thể nhờ bot <@U01EVJFP0U8> đánh giá bài đọc trước khi đăng lên channel <#C01BY57F29H> hay không?`* \n\n Tuyệt vời luôn, bạn có thể upload file và gửi riêng tới bot để luyện tập, trước khi gửi file cuối cùng lên channel <#C01BY57F29H> \n\n 9) *`Tôi có thể tham gia nhiều level mỗi task được hay không?`* \n\n Okey luôn bạn nhé. Luyện tập ở nhiều level giúp chúng ta tiến bộ nhanh hơn. \n\n 10) *`Tôi cần liên hệ với ai khi muốn nhận được sự hỗ trợ?`* \n\n Bạn có thể nhắn tin 'h' hoặc 'help' tới bot này <@U01HEMMPVK2>. \n\n 11) *`Các quy tắc ứng xử của VietSpeak ?`* \n\n a) Không thảo luận các nội dung không phù hợp, không có ích cho phần lớn các thành viên: chính trị, tôn giáo, vũ khí đạn dược, giới tính, buôn lậu... \n\n b) Không đả kích, khích bác, coi thường, khinh bỉ các thành viên khác trong nhóm. Không sử dụng các từ ngữ thô lậu. Không sử dụng các cách hành văn, hình ảnh mang tính thô lậu. Không khí thân thiện và tử tế của Việt Speak cần được gìn giữ, và, chắc chúng ta đều có thể đồng ý, rằng nó - cái cảm giác ấy - không miễn phí, hoặc không miễn phí một cách dễ dãi. Nó cần được bảo vệ. \n\n c) Mọi người đều bình đẳng. Tuy nhiên, các admin có trách nhiệm quản trị và do đó, được quyền xử lý cho các trường hợp sai luật. \n\n d) Không quảng cáo. \n\n e) Tất cả các trường hợp xử lý đều được công khai, nhưng sẽ không báo trước. \n\n f) Đội ngũ quản trị hiện tại gồm Trung Hiếu, dvbui, Hieu Nguyen và William Shakehand \n\n g) Nếu có thắc mắc, xin liên hệ bằng tin nhắn hoặc đăng bài hỏi đáp ở channel phù hợp.",
      });
      console.log(result.ok);
    } catch (error) {
      console.error(error);
    }
  }
);

// ==================================================bee===============================================
async function getSpelling(indexID) {
  let randomIndex;
  if (indexID === null) {
    const AirTable = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
      40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
    ];
    const lengthAirTable = AirTable.length;
    randomIndex = Math.ceil(Math.random() * lengthAirTable);
  } else {
    randomIndex = Math.ceil(indexID / 100);
  }

  console.log(randomIndex);

  if (!Number.isInteger(randomIndex)) {
    return;
  }

  let urlArray = [
    "appyDxosPktnRYGDm",
    "appVGBkxhCwEKKbpc",
    "appQkIQ7Dlg7BroD3",
    "app9n1xhg6YxzYI7p",
    "appEmqFGDFt1M55Kv",
  ];
  let tableIndex;

  if (randomIndex <= 12) {
    tableIndex = urlArray[0];
  }

  if (randomIndex > 12 && randomIndex <= 24) {
    tableIndex = urlArray[1];
  }

  if (randomIndex > 24 && randomIndex <= 36) {
    tableIndex = urlArray[2];
  }

  if (randomIndex > 36 && randomIndex <= 46) {
    tableIndex = urlArray[3];
  }

  if (randomIndex > 46 && randomIndex <= 58) {
    tableIndex = urlArray[4];
  }

  let urlAirTable = `https://api.airtable.com/v0/${tableIndex}/listening-challenge${randomIndex}?api_key=${AirTable_Api_key}`;

  const response = await axios.get(urlAirTable);
  const records = response.data.records;

  function getMinMax(number) {
    const data = {
      min: number * 100 - 99,
      max: number * 100,
    };

    return data;
  }

  function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  if (indexID === null) {
    indexID = getRndInteger(
      getMinMax(randomIndex).min,
      getMinMax(randomIndex).max
    );
  }

  const spelling = records.find((element) => element.fields.index === indexID);

  const transcript = {
    number: indexID,
    transcript: spelling.fields.transcript,
    audio: spelling.fields.audio[0].url,
  };
  return transcript;
}

let listenningChallengesChannel = "C01CDAFCQ3B";
async function postSpelling() {
  try {
    const {audio, number, transcript} = await getSpelling(null);

    await getAudioFileAxios(audio, "audio.mp3");
    let welcomeMessageList = [
      "◦•●◉✿✿◉●•◦",
      "🌠🌠🌠",
      "ⓋⒾⒺⓉⓈⓅⒺⒶⓀ",
      "💐💐💐",
      "🅗🅔🅛🅛🅞",
      "🅦🅔🅛🅒🅞🅜🅔",
      "🅆🄴🄻🄲🄾🄼🄴",
      "🄲🄷🄰🄻🄻🄴🄽🄶🄴",
      "ⓀⒾⓌⒾ",
      "ⒽⒺⓁⓁⓄ",
      "🍀🍀🍀",
      "🎃😊😍",
      "😘😘😘",
      "ⒷⒺⒺ",
      "ⓈⓅⒺⓁⓁⒾⓃⒼ",
    ];

    let random = Math.floor(Math.random() * welcomeMessageList.length);
    let randomwelcomeMessageList = welcomeMessageList[random];

    let thecomment = `${randomwelcomeMessageList} - Luyện tập tổng hợp cùng Spelling bee số ${number}`;

    //let thecomment = `${randomwelcomeMessageList} - WELCOME TO câu lạc bộ 3700 - spelling bee số ${number}`;

    const file = "audio.mp3";
    const result = await client.files.upload({
      channels: listenningChallengesChannel, //----> channels có s khi up load file
      //   thread_ts: thread_ts,
      filename: uuidv4() + ".mp3",
      initial_comment: thecomment,
      file: fs.createReadStream(file),
    });

    console.log(result.ok);
  } catch (error) {
    console.error(error);
  }
}

const rule = new schedule.RecurrenceRule();
rule.second = 0;
rule.minute = [0];
rule.hour = [7, 8, 9, 10, 11, 18, 19, 20, 21];
// rule.date = [1, 11, 21];
rule.tz = "Asia/Ho_Chi_Minh";
const jobPostVocabulary = schedule.scheduleJob(rule, function () {
  postSpelling();
});

function cleanText(textInput) {
  let result = textInput.trim().toLowerCase();
  const cong = /[‘’]/g;
  result = result.replace(cong, `'`);
  const regex = /[.,?!":–-]/g;
  result = result.replace(regex, "");
  return result;
}

// ===========================================================SYNTAX CŨ CẦN MENTION==================================================
app.event(
  "app_mention",
  async ({body, event, context, client, message, say}) => {
    let {
      client_msg_id,
      text,
      user,
      ts,
      team,
      thread_ts,
      parent_user_id,
      channel,
      events_ts,
    } = event;
    let lastWord;
    let getMark;

    let flag;

    if (
      text.includes("bee") ||
      text.includes("Bee") ||
      text.includes("BEE") ||
      text.includes("BeE")
    ) {
      flag = true;
    }

    if (!flag) {
      return;
    }

    let textSubmission = text.trim().toLowerCase();
    let index = textSubmission.indexOf("bee");
    textSubmission = textSubmission.substring(index + 3);
    textSubmission = textSubmission.trim();

    async function beeNumber() {
      //   Lấy message theo thread https://api.slack.com/methods/conversations.replies/test
      try {
        //  app.client.conversations.replies
        const result = await client.conversations.replies({
          channel: channel,
          ts: thread_ts,
          inclusive: true,
          limit: 1,
        });

        let questionNumber;
        let resultText = result.messages[0];
        resultText = resultText.text;
        const arrayText = resultText.split(" ");
        questionNumber = Number(arrayText[arrayText.length - 1]);
        return questionNumber;
      } catch (error) {
        console.error(error);
      }
    }

    async function checkMark(source, target) {
      let mark = stringSimilarity.compareTwoStrings(source, target);
      return mark;
    }

    // Trả về

    try {
      const questionID = await beeNumber();

      if (typeof questionID === "undefined") {
        console.log("Câu không có trong kho");
        return;
      }

      const {transcript} = await getSpelling(questionID);
      getMark = await checkMark(
        cleanText(textSubmission),
        cleanText(transcript)
      );
      getMark = Math.round(getMark * 100);
      let messageList = ["🔥🔥🔥", "Hi"];
      let firstMesssage;
      let endingMesssage;

      if (getMark === 100) {
        firstMesssage = messageList[0];
        endingMesssage = "💯";
      } else {
        firstMesssage = messageList[1];
        endingMesssage = getMark;

        if (endingMesssage < 30) {
          return;
        }
      }

      let messageResult = `${firstMesssage} <@${user}>, điểm spelling bee số ${questionID} là: ${endingMesssage}. Good news: bạn không còn cần mention Kiwi và từ khóa bee khi nộp bài.`;

      const result = await client.chat.postMessage({
        channel: channel,
        thread_ts: thread_ts,
        text: messageResult,
      });

      //console.log(result);
      //console.log(`ts là ${ts}`)
    } catch (error) {
      console.error(error);
    }

    const messageId = ts;
    const channelId = channel;

    if (typeof channelId === "undefined") {
      return;
    }

    if (typeof messageId === "undefined") {
      return;
    }

    if (typeof subtype !== "undefined") {
      if (subtype === "message_deleted") return;
    }

    if (getMark >= 40) {
      try {
        //Chú ý: Call the chat.delete method using the WebClient (clientUser với token user là admin thay vì app client)
        const result = await clientUser.chat.delete({
          channel: channelId,
          ts: messageId,
          as_user: true,
        });

        //console.log(result);
        console.log(`messageId khi xóa là ${messageId}`);
        console.log(`điểm số: ${getMark}`);
      } catch (error) {
        console.error(error);
      }
    }
  }
);

function displayCachelAll() {
  let cacheAll = cache.all();
  console.log("-----cacheAll------- 982");
  console.log(cacheAll);
  console.log("-----cacheAll------- 982");
}

////////////=================================SYNTAX MỚI KHÔNG CẦN MENTION /=================================//////////////
app.event("message", async ({body, event, context, client, message, say}) => {
  let {
    client_msg_id,
    text,
    user,
    ts,
    team,
    thread_ts,
    channel,
    events_ts,
    subtype,
  } = event;

  let {channel_type, bot_id, parent_user_id} = message;

  if (typeof subtype !== "undefined") {
    console.log(`subtype là ${subtype}`);
    //không xử lý khi type là xóa
    return;
  }

  if (channel != "C01CDAFCQ3B" && channel != "G01C73RT1PH") {
    return;
  }

  flatCache.clearAll();

  displayCachelAll();

  if (typeof text == "undefined") {
    return;
  }

  if (typeof thread_ts == "undefined") {
    console.log("main thread");
    return;
  }

  // Nếu là channel 8
  if (channel == "C01CDAFCQ3B") {
    let textSubmission = text.trim().toLowerCase();

    if (
      textSubmission.includes("<@u01hemmpvk2> bee") ||
      textSubmission.includes("<@u01hemmpvk2>bee") ||
      textSubmission.includes("<@u01hemmpvk2>  bee") ||
      textSubmission.includes("<@u01hemmpvk2>   bee")
    ) {
      return;
    }

    async function beeNumber() {
      //   Lấy message theo thread https://api.slack.com/methods/conversations.replies/test
      try {
        //  app.client.conversations.replies
        const result = await client.conversations.replies({
          channel: channel,
          ts: thread_ts,
          inclusive: true,
          limit: 1,
        });

        let questionNumber;
        let resultText = result.messages[0];
        resultText = resultText.text;
        const arrayText = resultText.split(" ");
        questionNumber = Number(arrayText[arrayText.length - 1]);

        if (!Number.isInteger(questionNumber)) {
          return;
        }

        return questionNumber;
      } catch (error) {
        console.error(error);
      }
    }

    async function checkMark(source, target) {
      let mark = stringSimilarity.compareTwoStrings(source, target);
      return mark;
    }

    // Trả về
    try {
      const questionID = await beeNumber();

      if (typeof questionID == "undefined") {
        return;
      }

      const {transcript} = await getSpelling(questionID);
      getMark = await checkMark(
        cleanText(textSubmission),
        cleanText(transcript)
      );
      getMark = Math.round(getMark * 100);
      let messageList = ["🔥🔥🔥", "Hi"];
      let firstMesssage;
      let endingMesssage;

      if (getMark === 100) {
        firstMesssage = messageList[0];
        endingMesssage = "💯";
      } else {
        firstMesssage = messageList[1];
        endingMesssage = getMark;

        if (endingMesssage < 40) {
          return;
        }
      }

      let messageResult = `${firstMesssage} <@${user}>, điểm spelling bee số ${questionID} là: ${endingMesssage}`;

      const result = await client.chat.postMessage({
        channel: channel,
        thread_ts: thread_ts,
        text: messageResult,
      });
    } catch (error) {
      console.error(error);
    }

    ////////////////////////Xóa CÂU TRẢ LỜI ///////////////////////////////

    if (typeof ts === "undefined") {
      return;
    }

    const messageId = ts;
    const channelId = channel;

    if (
      onlyHandlePublicEvent(channel_type) ||
      onlyHandleIfNotDeletingEvent(subtype)
    ) {
      return;
    }

    if (
      typeof messageId !== "undefined" &&
      messageId !== null &&
      getMark >= 40
    ) {
      try {
        const result = await clientUser.chat.delete({
          channel: channelId,
          ts: messageId,
          as_user: true,
        });
        console.log(`messageId khi xóa là ${messageId}`);
        console.log(`điểm số: ${getMark}`);
      } catch (error) {
        console.error(error);
      }
    }
    if (getMark >= 90) {
      if (typeof cache.getKey(user) !== "undefined") {
        if (cache.getKey(user) < 50) {
          try {
            const result = await client.chat.postMessage({
              channel: user, // gửi cho user
              text: `Hello <@${user}>, mức kí gửi của bạn với <@U02N47DMKRR> đang là ${cache.getKey(
                user
              )} coin, thấp hơn threshold (50) khuyến nghị. \n\n Khi kí gửi với <@U02N47DMKRR>, bạn có thể nhận được mức thưởng 10 coin tự động mỗi lần đạt 100 điểm, hoặc bị trừ 1 coin mỗi khi điểm trên 90 và chưa đạt 100. Bạn không bị trừ coin khi dưới 90 điểm. \n\n Bạn có thể kí gửi bằng cách soạn "trust <@U02N47DMKRR> 100" và gửi tới <@U01EVJFP0U8> để kí gửi 100 coin!`,
            });
            console.log(
              `Dữ liệu từ Cache , hiện có ${cache.getKey(
                user
              )} coin-> Sent: yêu cầu kí gửi tới ${user}!`
            );
          } catch (error) {
            console.error(error);
          }
        } else {
          //nếu user là Vietspeakbot
          if (user == "U01EVJFP0U8") {
            return;
          }

          //thường coin
          if (getMark === 100) {
            try {
              const result = await VietSpeakBankUser.chat.postMessage({
                channel: "U01EVJFP0U8", //gửi tới vietspeak bot
                text: `give <@${user}> 10`,
                as_user: true,
              });

              console.log("Đã tặng coin! cho: " + user);
              //console.log(result);
            } catch (error) {
              console.error(error);
            }
          } else {
            // lấy coin

            let amountTaken = randomIndex(5) + 1;

            try {
              const result = await VietSpeakBankUser.chat.postMessage({
                channel: "U01EVJFP0U8", //gửi tới vietspeak bot
                text: `take <@${user}> ${amountTaken}`,
                as_user: true,
              });

              console.log("Đã lấy coin của: " + user);
            } catch (error) {
              console.error(error);
            }
          }
        }
      } else {
        // set cache người dùng hiện tại
        let currentUser = {
          id: user,
          score: getMark,
        };

        myCache.set("currentUser", currentUser);

        try {
          const result = await VietSpeakBankUser.chat.postMessage({
            channel: `G01C73RT1PH`, // channel api
            text: `check_trust <@${user}>`,
            as_user: true,
          });
          console.log("1188: Ko có trong cache, gửi check_trust: " + user);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  /*=============================================================check_trust========================================================*/

  const getTrustValue = (textMessage) => {
    if (
      typeof bot_id === "undefined" ||
      typeof parent_user_id === "undefined" ||
      typeof textMessage === "undefined"
    ) {
      return false;
    }

    console.log("1213---check parent_user_id ? U02N47DMKRR");

    console.log(parent_user_id);

    if (parent_user_id != "U02N47DMKRR") {
      return false;
    }

    if (typeof channel === "undefined" || channel != "G01C73RT1PH") {
      return false;
    }

    let checking = textMessage.includes("đã kí gửi");

    if (!checking) {
      return;
    }

    let lastindex = textMessage.lastIndexOf(">");
    let firstindex = textMessage.indexOf("VS Coin");
    let trustAmount = textMessage.substring(lastindex + 1, firstindex);
    trustAmount = Number(trustAmount.trim());

    let userIndex = textMessage.indexOf("<@");
    let userChecked = textMessage.substring(userIndex + 2, userIndex + 13);

    //lưu vào 2 cached
    myCache.set(userChecked, trustAmount);

    cache.setKey(userChecked, trustAmount);
    cache.save(true);
    console.log(
      `1266 -> Đã lưu ${userChecked} - ${trustAmount} vào cache, dữ liệu từ  api channel`
    );

    return {
      trustAmount,
      userChecked,
    };
  };

  if (getTrustValue(text)) {
    let deposit = getTrustValue(text);
    if (deposit.trustAmount < 50) {
      try {
        const result = await client.chat.postMessage({
          channel: deposit.userChecked, // gửi cho user
          text: `Hi <@${deposit.userChecked}>, mức kí gửi của bạn với <@U02N47DMKRR> đang là ${deposit.trustAmount} coin, thấp hơn threshold (50) khuyến nghị. \n\n Khi kí gửi với <@U02N47DMKRR>, bạn có thể nhận được mức thưởng 10 coin tự động mỗi lần đạt 100 điểm, hoặc bị trừ 1 coin mỗi khi điểm trên 90 và chưa đạt 100. Bạn không bị trừ coin khi dưới 90 điểm. \n\n Bạn có thể kí gửi bằng cách soạn "trust <@U02N47DMKRR> 100" và gửi tới <@U01EVJFP0U8> để kí gửi 100 coin!`,
        });
        console.log(`Sent: yêu cầu kí gửi tới ${deposit.userChecked}!`);
      } catch (error) {
        console.error(error);
      }
    } else {
      let userCached = myCache.get("currentUser");

      if (typeof userCached === "undefined") {
        return;
      }

      if (userCached.score == 100) {
        try {
          const result = await VietSpeakBankUser.chat.postMessage({
            channel: "U01EVJFP0U8", //gửi tới vietspeak bot
            text: `give <@${userCached.id}> 10`,
            as_user: true,
          });

          console.log("Đã tặng coin!");
        } catch (error) {
          console.error(error);
        }

        return;
      }

      // lấy coin và set new trust_check
      try {
        let amountTaken = randomIndex(5) + 1;

        const result = await VietSpeakBankUser.chat.postMessage({
          channel: "U01EVJFP0U8", //gửi tới vietspeak bot
          text: `take <@${userCached.id}> ${amountTaken}`,
          as_user: true,
        });

        myCache.set(userCached.id, deposit.trustAmount - 1);

        console.log("Đã lấy coin!");
        //console.log(result);
      } catch (error) {
        console.error(error);
      }
    }
  }
});

/*=============================================================trust_amount========================================================*/
app.event("message", async ({body, event, context, client, message}) => {
  let {user, ts, text, channel, channel_type, subtype, thread_ts, bot_id} =
    message;

  if (
    typeof channel_type === "undefined" ||
    typeof channel === "undefined" ||
    typeof bot_id === "undefined" ||
    channel_type === "im" ||
    channel != "C01C44K85K6" ||
    typeof text === "undefined"
  ) {
    return;
  }

  // không lắng nghe sự kiện xóa
  if (typeof subtype !== "undefined" && subtype === "message_deleted") {
    return;
  }

  const depositChange = (textMessage) => {
    if (typeof textMessage === "undefined") {
      return false;
    }

    textMessage = textMessage.trim();
    let kigui = textMessage.includes("vừa kí gửi");

    if (kigui) {
      let sender = textMessage.indexOf("<@");
      sender = textMessage.substring(sender + 2, sender + 13);
      let receiver = textMessage.lastIndexOf("<@");
      receiver = textMessage.substring(receiver + 2, receiver + 13);
      let beforeAmount = textMessage.lastIndexOf(">");
      let afterAmount = textMessage.indexOf("VS Coin");
      let amount = textMessage.substring(beforeAmount + 1, afterAmount);
      amount = Number(amount.trim());
      return {
        sender,
        receiver,
        amount,
      };
    }
  };

  if (depositChange(text)) {
    let {sender, receiver, amount} = depositChange(text);

    if (typeof cache.getKey(sender) !== "undefined") {
      if (receiver != "U02N47DMKRR") {
        console.log(
          "1392: Không process vì người receiver không phải Will, là : " +
          receiver
        );
        return;
      }

      let currentAmount = Number(cache.getKey(sender));

      cache.setKey(sender, currentAmount + amount);
      cache.save(true);
      console.log(
        `1410- Có dữ liệu Cache: cũ ${currentAmount}, thêm vào ${amount}`
      );

      displayCachelAll();
    } else {
      try {
        const result = await VietSpeakBankUser.chat.postMessage({
          channel: `G01C73RT1PH`, // channel api
          text: `check_trust <@${sender}>`,
          as_user: true,
        });

        console.log(
          " 1423: Không có dữ liệu Cache, gửi request check_trust của: " +
          sender
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  //update khi trừ coin
  const takeCoin = (textMessage) => {
    if (typeof textMessage === "undefined") {
      return;
    }

    textMessage = textMessage.trim();
    let take = textMessage.includes("đã được chuyển cho");

    if (take) {
      let sender = textMessage.indexOf("<@");
      sender = textMessage.substring(sender + 2, sender + 13);
      let receiver = textMessage.lastIndexOf("<@");
      receiver = textMessage.substring(receiver + 2, receiver + 13);
      let afterAmount = textMessage.indexOf("VS");
      let amount = textMessage.substring(0, afterAmount);
      amount = Number(amount.trim());

      return {
        sender,
        receiver,
        amount,
      };
    }
  };

  if (takeCoin(text)) {
    let {sender, receiver, amount} = takeCoin(text);

    if (typeof cache.getKey(sender) !== "undefined") {
      let currentAmount = Number(cache.getKey(sender));
      cache.setKey(sender, currentAmount - amount);
      cache.save(true);
      console.log(
        `1460- Có dữ liệu Cache: cũ ${currentAmount}, trừ đi ${amount}`
      );
    } else {
      try {
        const result = await VietSpeakBankUser.chat.postMessage({
          channel: `G01C73RT1PH`, // channel api
          text: `check_trust <@${sender}>`,
          as_user: true,
        });

        console.log(
          " 1465: Không có dữ liệu Cache khi trừ  coin, gửi request check_trust của: " +
          sender
        );
      } catch (error) {
        console.error(error);
      }
    }
  }
});

//==========================================================GỬI TRANSCRIRIPT-==========================================================
app.event("message", async ({body, event, context, client, message, say}) => {
  let {
    client_msg_id,
    text,
    user,
    ts,
    team,
    thread_ts,
    parent_user_id,
    channel,
    events_ts,
  } = event;

  if (channel != "C01CDAFCQ3B") {
    return;
  }

  //khi xóa sẽ thành undefined, return để tránh lỗi event khi xóa;
  if (typeof text == "undefined") {
    return;
  }

  // nếu không có thread_ts tức là main message, không phải reply (có thể  dùng subtype);

  if (typeof thread_ts == "undefined") {
    console.log("main message");
    return;
  }

  let textSubmission = text.trim().toLowerCase();

  if (textSubmission.length > 3) {
    return;
  }

  if (!textSubmission.includes("bee")) {
    return;
  }

  async function beeNumber() {
    //   Lấy message theo thread https://api.slack.com/methods/conversations.replies/test
    try {
      //  app.client.conversations.replies
      const result = await client.conversations.replies({
        channel: channel,
        ts: thread_ts,
        inclusive: true,
        limit: 1,
      });

      let questionNumber;
      let resultText = result.messages[0];
      resultText = resultText.text;
      const arrayText = resultText.split(" ");
      questionNumber = Number(arrayText[arrayText.length - 1]);
      return questionNumber;
    } catch (error) {
      console.error(error);
    }
  }

  let indexNumber = await beeNumber();

  if (!Number.isInteger(indexNumber)) {
    console.log(`index là ${indexNumber} -> không phải bài challenge`);
    return;
  }

  // Trả về

  try {
    const questionID = await beeNumber();

    let {transcript} = await getSpelling(questionID);
    let transcriptClean = cleanText(transcript);
    const result = await client.chat.postMessage({
      channel: user,
      //   thread_ts: thread_ts,
      text: `Hi <@${user}>, transcript của spelling bee số ${questionID} là: \n ${transcript} \n \n Transcript đã được chuẩn hóa dùng để tính điểm là:  \n ${transcriptClean}`,
    });
  } catch (error) {
    console.error(error);
  }

  //   Xóa thread_ts đã mention @kiwi bee
  // The ts of the message you want to delete
  const messageId = ts;
  // The ID of the channel that contains the message
  const channelId = channel;

  try {
    //Chú ý: Call the chat.delete method using the WebClient (clientUser với token user là admin thay vì app client)
    const result = await clientUser.chat.delete({
      channel: channelId,
      ts: messageId,
      as_user: true,
    });

    //console.log(result);
  } catch (error) {
    console.error(error);
  }

  //end of xóa
});

/*===================================================================SENDING IPA AUDIO==============================================================*/
app.event("message", async ({body, event, context, client, message, say}) => {
  let {
    client_msg_id,
    text,
    user,
    ts,
    team,
    thread_ts,
    parent_user_id,
    channel,
    events_ts,
    channel_type,
  } = event;

  //khi xóa sẽ thành undefined, return để tránh lỗi event khi xóa;
  if (typeof text == "undefined") {
    return;
  }

  let textSubmission = text.trim().toLowerCase();

  const isCheckIpa = (input) => {
    if (typeof input === "undefined") {
      return false;
    }

    input = input.trim().toLowerCase();
    let howMuchSpace = input.match(/\s/g);
    //nếu không có, trả về null
    if (!howMuchSpace) {
      return false;
    }

    if (
      !input.includes("ipa") ||
      input.length <= 3 ||
      input.length > 28 ||
      howMuchSpace.length > 3
    ) {
      return false;
    }

    let inputArray = input.split(" ");
    let nonEmpty = inputArray.filter((e) => e.length > 0);
    if (nonEmpty.length > 2) {
      return false;
    }

    return nonEmpty[1];
  };

  if (isCheckIpa(textSubmission)) {
    let words = isCheckIpa(textSubmission);

    try {
      let destination;

      if (typeof thread_ts === "undefined") {
        destination = ts;
      } else {
        destination = thread_ts;
      }

      // không gửi reply khi gửi tin nhắn cho người dùng
      if (typeof channel_type !== "undefined" && channel_type === "im") {
        destination = user;
      }

      const file = `${__dirname}/data/audio/us/us/${words}.mp3`;

      if (!fs.existsSync(file)) {
        // không gửi reply khi gửi tin nhắn cho người dùng
        if (typeof channel_type !== "undefined" && channel_type === "im") {
          const result = await client.chat.postMessage({
            channel: user,
            text: `Hi <@${user}>, hiện chưa có file audio của từ ${words}. <@U01C3SA99FW> is notified. Sorry!`,
          });

          const notifyresult = await client.chat.postMessage({
            channel: `U01C3SA99FW`,
            text: `<@${user}> tìm audio từ ${words} nhưng không có trong hệ thống!!`,
          });

          return;
        }

        console.log("Không có file, từ: " + words);
        const result = await client.chat.postMessage({
          channel: channel,
          thread_ts: destination,
          text: `Hi <@${user}>, hiện chưa có file audio của từ ${words}. <@U01C3SA99FW> is notified. Sorry!`,
        });

        const notifyresult = await client.chat.postMessage({
          channel: `U01C3SA99FW`,
          text: `<@${user}> tìm audio từ ${words} nhưng không có trong hệ thống!!`,
        });

        return;
      }

      const result = await client.files.upload({
        channels: channel, //----> channels có s khi up load file
        thread_ts: destination,
        filename: `${words}.mp3`,
        file: fs.createReadStream(file),
      });
      //   console.log(result);
      console.log("send api file");
    } catch (error) {
      console.error(error);
    }
  }
});

/*===================================================================RANDOM==============================================================*/
app.event("message", async ({body, event, context, client, message, say}) => {
  let {
    client_msg_id,
    text,
    user,
    ts,
    team,
    thread_ts,
    parent_user_id,
    channel,
    events_ts,
    channel_type,
  } = event;

  if (typeof text == "undefined") {
    return;
  }

  let textSubmission = text.trim().toLowerCase();

  if (textSubmission === "random") {
    try {
      let destination;

      let randomIndex = function (max) {
        return Math.floor(Math.random() * max);
      };

      if (typeof thread_ts === "undefined") {
        destination = ts;
      } else {
        destination = thread_ts;
      }

      // không gửi reply khi gửi tin nhắn cho người dùng
      if (typeof channel_type !== "undefined" && channel_type === "im") {
        destination = user;
      }

      // không gửi reply khi gửi tin nhắn cho người dùng
      if (typeof channel_type !== "undefined" && channel_type === "im") {
        const result = await client.chat.postMessage({
          channel: user,
          text: `Hi <@${user}>, số ngẫu nhiên trong khoảng 0 tới 100 của bạn là ${randomIndex(100) + 1
            }`,
        });

        return;
      }

      const result = await client.chat.postMessage({
        channel: channel,
        thread_ts: destination,
        text: `Hi <@${user}>, số ngẫu nhiên trong khoảng 0 tới 100 của bạn là ${randomIndex(100) + 1
          }`,
      });

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
});

//////////////////=================================///////////TRANSLATION//////////////////=================================//////////////
app.event("message", async ({body, event, context, client, message, say}) => {
  let {
    client_msg_id,
    text,
    user,
    ts,
    team,
    thread_ts,
    parent_user_id,
    channel,
    events_ts,
    channel_type,
  } = event;

  //khi xóa sẽ thành undefined, return để tránh lỗi event khi xóa;
  if (typeof text == "undefined") {
    return;
  }

  let textSubmission = text.trim().toLowerCase();
  let textArray = textSubmission.split(" ");
  let targetLanguage = textArray[0];
  let transText = textArray.splice(1).join(" ");
  let mysource, mytarget;

  if (targetLanguage === "vi") {
    mytarget = "vi";
    mysource = "en";
  } else if (targetLanguage === "en") {
    mytarget = "en";
    mysource = "vi";
  } else {
    return;
  }

  let endpoint = "https://api.cognitive.microsofttranslator.com";
  let location = "southeastasia";

  const translating = async (
    options = {
      source,
      target,
      words,
    }
  ) => {
    let {source, target, words} = options;

    const res = await axios({
      baseURL: endpoint,
      url: "/translate",
      method: "post",
      headers: {
        "Ocp-Apim-Subscription-Key": MICROSOFT_TRANSLATION_token,
        "Ocp-Apim-Subscription-Region": location,
        "Content-type": "application/json",
        "X-ClientTraceId": uuidv4().toString(),
      },
      params: {
        "api-version": "3.0",
        from: source,
        to: target,
      },
      data: [
        {
          text: words,
        },
      ],
      responseType: "json",
    });

    const output = res.data[0].translations[0].text;

    console.log(output);

    return output;
  };

  const translatingInput = {
    source: mysource,
    target: mytarget,
    words: transText,
  };

  try {
    const dich = await translating(translatingInput);

    let destination;

    if (typeof thread_ts === "undefined") {
      destination = ts;
    } else {
      destination = thread_ts;
    }

    // không gửi reply khi gửi tin nhắn cho người dùng
    if (typeof channel_type !== "undefined" && channel_type === "im") {
      destination = user;
    }

    // không gửi reply khi gửi tin nhắn cho người dùng
    if (typeof channel_type !== "undefined" && channel_type === "im") {
      const result = await client.chat.postMessage({
        channel: user,
        text: dich,
      });

      return;
    }

    const result = await client.chat.postMessage({
      channel: channel,
      thread_ts: destination,
      text: dich,
    });

    // console.log(result);
  } catch (error) {
    console.error(error);
  }
});

////////////////=================================/////////////ECHO RHYMES/////////////=================================///////////////////
app.event("message", async ({body, event, context, client, message, say}) => {
  let {
    client_msg_id,
    text,
    user,
    ts,
    team,
    thread_ts,
    parent_user_id,
    channel,
    events_ts,
    channel_type,
  } = event;

  if (typeof text == "undefined") {
    return;
  }

  let textSubmission = text.trim().toLowerCase();
  let textArray = textSubmission.split(" ");
  let echoCommand = textArray[0];
  if (echoCommand !== "echo") {
    return;
  }

  let soundWord = textArray[1];

  let {rhymes, alliterations} = rhymesVietSpeak(soundWord);

  const rhy = rhymes.map((e) => {
    return e.word;
  });

  const alli = alliterations.map((e) => {
    return e.word;
  });

  let echoOutput = `${rhy.join(", ")} \n\n ${alli.join(", ")}`;

  try {
    let destination;

    if (typeof thread_ts === "undefined") {
      destination = ts;
    } else {
      destination = thread_ts;
    }

    // không gửi reply khi gửi tin nhắn cho người dùng
    if (typeof channel_type !== "undefined" && channel_type === "im") {
      destination = user;
    }

    // không gửi reply khi gửi tin nhắn cho người dùng
    if (typeof channel_type !== "undefined" && channel_type === "im") {
      const result = await client.chat.postMessage({
        channel: user,
        text: echoOutput,
      });
      return;
    }

    const result = await client.chat.postMessage({
      channel: channel,
      thread_ts: destination,
      text: echoOutput,
    });

    console.log("echo done");
  } catch (error) {
    console.error(error);
  }
});

////////////////=================================/////////////SEND AUDIO - TEXT TO SPEECH /////////////////=================================///////////////
app.event("message", async ({body, event, context, client, message, say}) => {
  let {
    client_msg_id,
    text,
    user,
    ts,
    team,
    thread_ts,
    parent_user_id,
    channel,
    events_ts,
    channel_type,
  } = event;

  if (typeof text == "undefined") {
    return;
  }

  let textSubmission = text.trim().toLowerCase();
  let textArray = textSubmission.split(" ");
  let soundCommand = textArray[0];
  let english, english1, english2, vietnamese, vietnamese1;

  if (soundCommand === "visound") {
    vietnamese = true;
  } else if (soundCommand === "ensound") {
    english = true;
  } else if (soundCommand === "ensound1") {
    english1 = true;
  } else if (soundCommand === "ensound2") {
    english2 = true;
  } else if (soundCommand === "visound1") {
    vietnamese1 = true;
  } else {
    return;
  }

  let soundText = textArray.splice(1).join(" ");
  //https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#prebuilt-neural-voices
  const vi = {
    id: "vi-VN",
    male: "vi-VN-NamMinhNeural",
    female: "vi-VN-HoaiMyNeural",
  };

  const en = {
    us: "en-US",
    uk: "en-GB",
    ryan: "en-GB-RyanNeural",
    male: "en-US-ChristopherNeural",
    female: "en-US-JennyNeural",
  };

  let languageChoice = {};

  if (vietnamese) {
    languageChoice.lang = vi.id;
    languageChoice.voice = vi.male;
  }

  if (vietnamese1) {
    languageChoice.lang = vi.id;
    languageChoice.voice = vi.female;
  }

  if (english) {
    languageChoice.lang = en.us;
    languageChoice.voice = en.male;
  }

  if (english1) {
    languageChoice.lang = en.uk;
    languageChoice.voice = en.ryan;
  }

  if (english2) {
    languageChoice.lang = en.us;
    languageChoice.voice = en.female;
  }

  let file_save = uuidv4() + ".mp3";

  function synthesizeSpeech() {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      MICROSOFT_Text_to_Speech_token,
      "eastus"
    );

    // setting quality https://docs.microsoft.com/en-us/javascript/api/microsoft-cognitiveservices-speech-sdk/speechsynthesisoutputformat?view=azure-node-latest
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;

    // Note: if only language is set, the default voice of that language is chosen.
    speechConfig.speechSynthesisLanguage = languageChoice.lang; // For example, "de-DE"
    // The voice setting will overwrite the language setting.
    // The voice setting will not overwrite the voice element in input SSML.
    speechConfig.speechSynthesisVoiceName = languageChoice.voice;

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(file_save);

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(
      soundText,
      (result) => {
        synthesizer.close();
        if (result) {
          // return result as stream
          console.log("done convert from text to speech");
          return fs.createReadStream(file_save);
        }
      },
      (error) => {
        console.log(error);
        synthesizer.close();
      }
    );
  }

  try {
    synthesizeSpeech();

    let file = __dirname + `/${file_save}`;

    let setCheckingFile = setInterval(async function () {
      fs.readFile(file, async function (err, data) {
        if (data.length == 0) {
          console.log("File is empty!");
        } else {
          clearInterval(setCheckingFile);

          let destination;

          if (typeof thread_ts === "undefined") {
            destination = ts;
          } else {
            destination = thread_ts;
          }

          // không gửi reply khi gửi tin nhắn cho người dùng
          if (typeof channel_type !== "undefined" && channel_type === "im") {
            destination = user;
          }

          // không gửi reply khi gửi tin nhắn cho người dùng
          if (typeof channel_type !== "undefined" && channel_type === "im") {
            const result = await client.files.upload({
              channels: channel, //----> channels có s khi up load file
              thread_ts: destination,
              filename: file_save,
              file: fs.createReadStream(file),
            });

            fs.unlink(file_save, function (err) {
              if (err) return console.log(err);
              console.log("file deleted successfully");
            });
            //   console.log(result);
            console.log("send audio file");

            return;
          }

          const result = await client.files.upload({
            channels: channel, //----> channels có s khi up load file
            thread_ts: destination,
            filename: file_save,
            file: fs.createReadStream(file),
          });

          fs.unlink(file_save, function (err) {
            if (err) return console.log(err);
            console.log("file deleted successfully");
          });
          //   console.log(result);
          console.log("send audio file");
        }
      });
    }, 5000);
  } catch (error) {
    console.error(error);
  }
});

//////////////=================================///////////////CHECK ĐIỂM SỐ KHI REACT EMOJI ///////////////////////////=================================///////////////////////]

app.event("reaction_added", async ({event, context, say}) => {
  let {type, user, item, reaction, item_user, event_ts} = event;

  if (item.channel != "C01BY57F29H") {
    return;
  }

  if (typeof reaction === "undefined" || reaction !== "bouquet") {
    return;
  }

  let userWhoClick = user;
  try {
    const result = await client.conversations.replies({
      channel: item.channel,
      ts: item.ts,
      inclusive: true,
      limit: 1000, // get the main thread only
    });

    let {ts, thread_ts} = result.messages[0];

    //thread_ts khong co --> tuc dang trong main thread;
    if (typeof thread_ts === "undefined" || ts == thread_ts) {
      console.log("re-action on main thread");

      let fileDetail = result.messages[0].files;
      let textSubmission = result.messages[0].text;

      if (typeof fileDetail === "undefined") {
        console.log("re-action on thread without file attached");
        return;
      }

      let textFromVietSpeakBot = result.messages.filter(
        (e) =>
          e.user == "U01EVJFP0U8" &&
          typeof e.files === "undefined" &&
          e.text.length > 80
      );

      let textFromVSB;

      if (textFromVietSpeakBot.length > 0) {
        textFromVSB = textFromVietSpeakBot[0].text;
      }

      let {title, transcription, vtt, url_private} = fileDetail[0];

      if (typeof transcription === "undefined") {
        return;
      }

      const checkingFile = setInterval(async function () {
        if (transcription.status === "complete") {
          let link = `${vtt}&t=${Slack_DOWNLOAD_TOKEN}`;

          const response = await axios.get(link);

          const transcriptResult = vttToPlainText(response.data);

          let transcribleText;

          if (typeof textFromVSB !== "undefined" && textFromVSB.length > 0) {
            let t = cleanTextToCompare(textFromVSB);
            let v = cleanTextToCompare(transcriptResult);
            let mark = stringSimilarity.compareTwoStrings(t, v);

            //convert to array
            t = t.split(` `);
            v = v.split(` `);

            let uniqueT = [...new Set(t)];
            let uniqueV = [...new Set(v)];

            //khong co
            let missingWords = uniqueT.filter((x) => !uniqueV.includes(x));
            missingWords = missingWords.join(", ");

            let redundantWords = uniqueV.filter((x) => !uniqueT.includes(x));
            redundantWords = redundantWords.join(", ");

            mark = mark * 100;
            mark = mark.toFixed(2);
            transcribleText = `Hi <@${userWhoClick}>, transcribe succeeded. Đây là những gì cụ *\`Slack\`* nghe được từ file từ bài của <@${item_user}> \n\n${transcriptResult} \n\n Các từ được khuyến nghị là nên được chú ý hơn khi phát âm: *\`${missingWords}\`* \n\n Các từ được phát âm nhưng không có trong bài: *\`${redundantWords}\`* \n\n Điểm số : ${mark}`;
          } else {
            transcribleText = `Hi <@${userWhoClick}>, transcribe succeeded. Đây là những gì cụ *\`Slack\`* nghe được từ file của <@${item_user}>:: \n\n${transcriptResult} \n\n `;
          }

          try {
            const result = await client.chat.postMessage({
              channel: userWhoClick,
              text: transcribleText,
            });

            console.log("send the mark!");
          } catch (error) {
            console.error(error);
          }

          clearInterval(checkingFile);
        } else {
          console.log("Checking transcription proccess");
        }
      }, 2000);
    } else {
      console.log("re-action is not on main thread, does not handle");
    }
  } catch (error) {
    console.error(error);
  }
});

///////////////=================================//////////////TAOEBA PROJECT////////////=================================////////////////////

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

async function postPhoneticChallenge() {
  let randomIndexArray = getRandomInt(150000, taoeba.length);

  console.log(taoeba[randomIndexArray]);

  let intialText = "ⓅⒽⓄⓃⒺⓉⒾⒸ ⒸⒽⒶⓁⓁⒺⓃⒼⒺ";

  let echoOutput =
    intialText +
    " - " +
    randomIndexArray +
    "\n \n" +
    "/" +
    convertIPA(taoeba[randomIndexArray].text) +
    "/";

  let link = taoeba[randomIndexArray].audio;

  let rightSlash = link.lastIndexOf("/") + 1;

  let fileName = `./data/taoeba/audio/${link.slice(rightSlash)}`;

  if (!fs.existsSync(fileName)) {
    return;
  }

  let textOuput = `phonetic-challenge-${taoeba[randomIndexArray].index - 1
    }.mp3`;

  let listenningChallengesChannel = "C01CDAFCQ3B"; //"C01CDAFCQ3B"; //("G01BPHWQ023" --> ban thong tin) C01J9D8RMD3==> channel 14

  try {
    const result = await client.files.upload({
      //channels: channel, //----> channels có s khi up load file
      channels: listenningChallengesChannel,
      //thread_ts: destination,
      filename: textOuput,
      initial_comment: echoOutput,
      file: fs.createReadStream(fileName),
    });

    console.log("send file Taoeba");
  } catch (error) {
    console.error(error);
  }
}

const rulePhonetics = new schedule.RecurrenceRule();
rulePhonetics.second = [0];
rulePhonetics.minute = [15];
rulePhonetics.hour = [6, 7, 8, 13, 14, 18, 19, 20, 21, 22];
// rule.date = [1, 11, 21];
rulePhonetics.tz = "Asia/Ho_Chi_Minh";

const jobPostPhonetics = schedule.scheduleJob(rulePhonetics, function () {
  postPhoneticChallenge();
});

/////////////////////////////TAOEBA PROJECT - CHECKING SUBMISION////////////////////////////////
app.event("message", async ({body, event, context, client, message, say}) => {
  let {
    client_msg_id,
    text,
    user,
    ts,
    team,
    thread_ts,
    parent_user_id,
    channel,
    events_ts,
    channel_type,
  } = event;

  //khi xóa sẽ thành undefined, return để tránh lỗi event khi xóa;
  if (typeof text == "undefined") {
    return;
  }

  //   only handle when replying, not the the message on the main thread
  if (typeof thread_ts === "undefined") {
    return;
  }

  //channel 8
  if (channel == "C01CDAFCQ3B" || channel == "G01BPHWQ023") {
    // return;
    let textSubmission = text.trim().toLowerCase();
    // Lấy message theo thread https://api.slack.com/methods/conversations.replies/test
    try {
      //  app.client.conversations.replies
      const result = await client.conversations.replies({
        channel: channel,
        ts: thread_ts,
        inclusive: true,
        limit: 1,
      });

      //console.log(result);

      let textAudio = result.messages[0].text;

      if (!textAudio.includes("ⓅⒽⓄⓃⒺⓉⒾⒸ ⒸⒽⒶⓁⓁⒺⓃⒼⒺ")) {
        return;
      }

      let left = textAudio.indexOf("ⒼⒺ -") + 5;

      let right = textAudio.indexOf("\n");

      //console.log(x.slice(left, right))

      let numberIndex = textAudio.slice(left, right);

      let correctText = cleanTextToCompare(taoeba[numberIndex].text);

      let textSubmit = cleanTextToCompare(result.messages[1].text);

      let mark = stringSimilarity.compareTwoStrings(correctText, textSubmit);

      mark = Math.round(mark * 100);

      let messageList = ["🔥🔥🔥", "Hi"];
      let firstMesssage;
      let endingMesssage;

      if (mark === 100) {
        firstMesssage = messageList[0];
        endingMesssage = "💯";
      } else {
        firstMesssage = messageList[1];
        endingMesssage = mark;

        if (endingMesssage < 30) {
          return;
        }
      }

      let messageResult = `${firstMesssage} <@${user}>, điểm phonetic challenge số ${numberIndex} là: ${endingMesssage}.`;
      // https://api.slack.com/methods/chat.postMessage/test --> nếu gửi dm cho user, thay channel bằng ID username U01C3SA99FW  (William)
      const resultDisplay = await client.chat.postMessage({
        channel: channel,
        thread_ts: thread_ts,
        text: messageResult,
      });

      const messageId = ts;
      // The ID of the channel that contains the message
      const channelId = channel;

      if (
        typeof messageId !== "undefined" &&
        messageId !== null &&
        mark >= 40
      ) {
        try {
          //Chú ý: Call the chat.delete method using the WebClient (clientUser với token user là admin thay vì app client)
          const result = await clientUser.chat.delete({
            channel: channelId,
            ts: messageId,
            as_user: true,
          });

          //console.log(result);
          console.log(`messageId khi xóa là ${messageId}`);
          console.log(`điểm số: ${mark}`);
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
});

/////////////////////////////=================================THANOS --> deleting the thread=================================////////////////////////////////
app.event("message", async ({body, event, context, client, message, say}) => {
  let {
    client_msg_id,
    text,
    user,
    ts,
    team,
    thread_ts,
    parent_user_id,
    channel,
    events_ts,
    channel_type,
  } = event;

  //khi xóa sẽ thành undefined, return để tránh lỗi event khi xóa;
  if (typeof text == "undefined") {
    return;
  }

  //   only handle when replying, not the the message on the main thread
  if (typeof thread_ts === "undefined") {
    return;
  }

  // return;
  let textSubmission = text.trim().toLowerCase();

  if (textSubmission !== "thanos") {
    return;
  }

  //Dont handle if the user is Voice U02K40CRMFB
  if (
    typeof user === "undefined" ||
    typeof parent_user_id === "undefined" ||
    user == "U02K40CRMFB"
  ) {
    console.log("user is - Voice - U02K40CRMFB: " + user);

    return;
  }

  //only allow those who originally created the thread remove it
  if (parent_user_id != user) {
    if (user != "U01C3SA99FW") {
      return;
    }
  }

  // Lấy message theo thread https://api.slack.com/methods/conversations.replies/test
  try {
    //  app.client.conversations.replies
    const result = await client.conversations.replies({
      channel: channel,
      ts: thread_ts,
      inclusive: true,
      limit: 1000,
    });

    const listOfMessage = await result.messages;

    async function deleting(item, channel) {
      try {
        //Chú ý: Call the chat.delete method using the WebClient (clientUser với token user là admin thay vì app client)
        const result = await clientUser.chat.delete({
          channel: channel,
          ts: item.ts,
          as_user: true,
        });

        //console.log(result);
      } catch (error) {
        console.error(error);
      }
    }

    for (let i = 0; i < listOfMessage.length; i++) {
      let currentItem = listOfMessage[i];
      if (typeof currentItem !== "undefined") {
        await deleting(currentItem, channel);
      }
    }

    console.log(`THANOS by ${user}`);
  } catch (error) {
    console.error(error);
  }
});

///////////////////////////////////////=================================KIWI DAP AN=================================/////////////////////////////////////
app.event(
  "app_mention",
  async ({body, event, context, client, message, say}) => {
    let {
      client_msg_id,
      text,
      user,
      ts,
      team,
      thread_ts,
      parent_user_id,
      channel,
      events_ts,
    } = event;
    let lastWord;
    let flag;
    if (
      text.includes("transcript") ||
      text.includes("Transcript") ||
      text.includes("TRANSCRIPT") ||
      text.includes("TransCript")
    ) {
      flag = true;
    }

    if (!flag) {
      return;
    }

    //   biến text có sẵn từ app.event
    let textSubmission = text.trim().toLowerCase();
    //textSubmission = textSubmission.split("transcript");
    //textSubmission = textSubmission[1];

    async function beeNumber() {
      //   Lấy message theo thread https://api.slack.com/methods/conversations.replies/test
      try {
        //  app.client.conversations.replies
        const result = await client.conversations.replies({
          channel: channel,
          ts: thread_ts,
          inclusive: true,
          limit: 1,
        });

        let questionNumber;
        let resultText = result.messages[0];
        resultText = resultText.text;
        const arrayText = resultText.split(" ");
        questionNumber = Number(arrayText[arrayText.length - 1]);
        return questionNumber;
      } catch (error) {
        console.error(error);
      }
    }

    try {
      const questionID = await beeNumber();
      let {transcript} = await getSpelling(questionID);
      let transcriptClean = cleanText(transcript);

      // https://api.slack.com/methods/chat.postMessage/test --> nếu gửi dm cho user, thay channel bằng ID username U01C3SA99FW  (William)

      const result = await client.chat.postMessage({
        channel: user,
        //   thread_ts: thread_ts,
        text: `Hi <@${user}>, transcript của spelling bee số ${questionID} là: \n ${transcript} \n \n Transcript đã được chuẩn hóa dùng để tính điểm là:  \n ${transcriptClean}`,
      });
    } catch (error) {
      console.error(error);
    }

    //   Xóa thread_ts đã mention @kiwi bee
    // The ts of the message you want to delete
    const messageId = ts;
    // The ID of the channel that contains the message
    const channelId = channel;

    try {
      //Chú ý: Call the chat.delete method using the WebClient (clientUser với token user là admin thay vì app client)
      const result = await clientUser.chat.delete({
        channel: channelId,
        ts: messageId,
        as_user: true,
      });

      //console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
);

// ===================================================OBJECTIVE TEST LISTENING TO ACTION --> WORK IN PROGRESS ===============================================

app.action("block_actions", async ({ack}) => {
  await ack();

  console.log("testing action click on button");
});

app.event("message", async ({body, event, context, client, message}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleFollowingSingleWord(text, ["vuong"])) return;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  let blockContent = `[
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Chew choo! @scott started a train to Deli Board at 11:30. Will you join?"
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Yes",
						"emoji": true
					}
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "No",
						"emoji": true
					}
				}
			]
		}
	]`;

  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: "hello world",
      blocks: blockContent,
    });
  } catch (error) {
    console.error(error);
  }
});

// ===================================================ENDING TASK===============================================

function getRandomQuoteEndingTask(Randomeindex) {
  return `Quote for another chapter of VietSpeak: _${quote[Randomeindex].quoteText}_ - *${quote[Randomeindex].quoteAuthor}*`;
}

async function postMessageEndingTask() {
  let task_minus = getCurrentTask(currentTimeStamp()) - 1;

  let dataSentObject = {
    text:
      " *`=======🔥🔥🔥TASK ENDED🔥🔥🔥=======`* \nNhững bài nộp sau thanh này sẽ tính là không nộp bài cho task " +
      task_minus +
      " 😊😊😊. \n\n" +
      getRandomQuoteEndingTask(randomIndex(quoteCount)),
  };

  axios
    .post(Slack_HOOK_Channel2, dataSentObject)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

const ruleEndingTask = new schedule.RecurrenceRule();

ruleEndingTask.second = 5;
ruleEndingTask.minute = 0;
ruleEndingTask.hour = 0;
ruleEndingTask.date = [1, 11, 21];
ruleEndingTask.tz = "Asia/Ho_Chi_Minh";

const jobEndingTask = schedule.scheduleJob(ruleEndingTask, function () {
  postMessageEndingTask();
});

/*============================================================================================================================*/
app.event(
  "app_mention",
  async ({body, event, context, client, message, say}) => {
    let {
      client_msg_id,
      text,
      user,
      ts,
      team,
      thread_ts,
      parent_user_id,
      channel,
      events_ts,
    } = event;
    let lastWord;
    if (
      text.includes("toefl") ||
      text.includes("Toefl") ||
      text.includes("TOEFL") ||
      text.includes("TOefl")
    ) {
      text = text.trim().toLowerCase().split(" ");
      lastWord = text[text.length - 1];
    } else {
      return;
    }

    if (lastWord !== "toefl") {
      return;
    }

    try {
      let wordTOELF = await getRandomTOEFL(lengthTOEFL);
      const file = `${__dirname}/data/audio/us/us/${wordTOELF}.mp3`;

      const result = await client.files.upload({
        channels: channel, //----> channels có s khi up load file
        thread_ts: thread_ts,
        filename: uuidv4(),
        initial_comment: "400 must-have words for the TOEFL",
        file: fs.createReadStream(file),
      });

      //console.log(result);
      console.log(fileName);
    } catch (error) {
      console.error(error);
    }
  }
);

/*======================================= SEND THE TRANSCRIPT  =====================================================*/
app.event("message", async ({body, event, context, client, message, say}) => {
  let {
    client_msg_id,
    text,
    user,
    ts,
    team,
    thread_ts,
    parent_user_id,
    channel,
    events_ts,
    channel_type,
  } = event;

  //khi xóa sẽ thành undefined, return để tránh lỗi event khi xóa;
  if (typeof text == "undefined") {
    return;
  }

  //   only handle when replying, not the the message on the main thread
  if (typeof thread_ts === "undefined") {
    return;
  }

  let textSubmission = text.trim().toLowerCase();

  if (textSubmission.length > 6) {
    return;
  }

  let acceptedCommands = ["yellow", "green", "blue", "red"];

  if (!acceptedCommands.includes(textSubmission)) {
    return;
  }

  // let linkAPI = `https://api.vietspeak.org/v1/task/transcript.php`;
  let linkAPI = `https://api.vuongnguyen.net/airtable/vietspeak_transcript.php`

  const response = await axios.get(linkAPI);

  let task_number_tracking = getCurrentTask(currentTimeStamp());

  const currentTranscript = response.data.find(
    (element) => element.fields.task_number == task_number_tracking
  );

  let outputTranScript = currentTranscript.fields[textSubmission];

  if (typeof outputTranScript === "undefined") {
    outputTranScript = "Hiện chưa có transcript mà bạn đang yêu cầu.";
  }

  try {
    //  app.client.conversations.replies

    await later(2000);

    const result = await client.chat.postMessage({
      channel: channel,
      thread_ts: ts,
      text: outputTranScript,
    });

    console.log(result.ok);

    await later(2000);

    //Deleting the keyword people type
    const deleting_result = await clientUser.chat.delete({
      channel: channel,
      ts: ts,
      as_user: true,
    });

    console.log(`Transcript added by ${user}`);
  } catch (error) {
    console.error(error);
  }
});


/*=========================Update 03/2023 SEND THE transcript automatically =================================*/
// Should also implement the function comparing the vtt and the transcript added beforehand.
function checkLevelTranscript(title = "", text = "") {
  let level = ["yellow", "green", "blue", "red"];
  if (typeof title !== "undefined") {
    title = title.trim().toLowerCase();
    let filter = level.filter((e) => title.includes(e));
    if (filter.length === 1) {
      return filter[0];
    }
  }

  if (typeof text !== "undefined") {
    text = text.trim().toLowerCase();
    let filter = level.filter((e) => text.includes(e));
    if (filter.length === 1) {
      return filter[0];
    }
  }
  return "yellow"; //if unknown
}

app.event("message", async ({body, event, context, client, message}) => {
  let {subtype, files, thread_ts} = event;
  let {user, ts, text, channel, channel_type} = message;

  if (typeof channel_type === "undefined") {
    console.log("không có channel_type");
    return;
  }

  //if(development(user, event)) return;
  if (
    onlyHandleMainThreadEvent(thread_ts) ||
    onlyHandlePublicEvent(channel_type) ||
    onlyHandleIfUploadFile(files) ||
    onlyHandleIfNotBot(user) ||
    onlyHandleChannel2(channel) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
    return;
  }

  let {
    display_as_bot,
    name,
    url_private_download,
    timestamp,
    title,
    filetype,
    id,
  } = files[0];

  let color = checkLevelTranscript(title, text);

  if (typeof display_as_bot !== "undefined" && display_as_bot) {
    return;
  }

  if (typeof suptype !== "undefined") {
    if (suptype === "message_deleted" || suptype === "message_changed") return;
  }

  let taskNumber = getCurrentTask(currentTimeStamp());

  let link_trancript = `https://api.vuongnguyen.net/airtable/vietspeak_transcript.php?task=${taskNumber}`;
  const response = await axios.get(link_trancript);
  
  let outputTranScript = response.data[0].fields[color];
  if (typeof outputTranScript === "undefined") {
    outputTranScript = "Hiện chưa có transcript trên api của hệ thống cho task hiện tại.!";
  }
  try {
    await later(3000);
    const result = await client.chat.postMessage({
      channel: channel,
      thread_ts: ts,
      text: outputTranScript,
    });
    console.log(`Send the transcript task ${taskNumber} level ${color}`);
    console.log("color", color);
    console.log("title", title)
    console.log("text", text)
  } catch (error) {
    console.error(error);
  }
});


/*======================================= STORE USER TO DATABASE CLOUDANT NOSQL  =====================================================*/
const createDbAndDoc = async (dbName, documentId, documentCreated) => {
  // Try to create database if it doesn't exist
  try {
    const putDatabaseResult = (
      await clientcloudant.putDatabase({
        db: dbName,
      })
    ).result;
    if (putDatabaseResult.ok) {
      console.log(`"${dbName}" database created.`);
    }
  } catch (err) {
    if (err.code === 412) {
      console.log(`Cannot create "${dbName}" database, it already exists.`);
    }
  }

  // Setting `_id` for the document is optional when "postDocument" function is used for CREATE.
  //   // When `_id` is not provided the server will generate one for your document.
  let insertData = {
    _id: documentId,
  };
  insertData.user = documentCreated;

  // Save the document in the database with "postDocument" function
  const createDocumentResponse = await clientcloudant.postDocument({
    db: dbName,
    document: insertData,
  });

  // is necessary for further UPDATE/DELETE operations:
  documentCreated._rev = createDocumentResponse.result.rev;

  console.log(
    "You have created the document:\n" +
    JSON.stringify(documentCreated, null, 2)
  );
};

app.event("message", async ({body, event, context, client, message, say}) => {
  let {
    client_msg_id,
    text,
    user,
    ts,
    team,
    thread_ts,
    parent_user_id,
    channel,
    events_ts,
    channel_type,
  } = event;

  if (typeof text == "undefined") {
    return;
  }

  if (user != "U01C3SA99FW") {
    return;
  }

  let textSubmission = text.trim().toLowerCase();

  if (textSubmission !== "user") {
    return;
  }

  let usersStore = {};
  function saveUsers(usersArray) {
    let userId = "";

    usersArray.forEach(function (user) {
      userId = user["id"];
      usersStore[userId] = {};
      usersStore[userId].name = user["name"];
      usersStore[userId].slackId = userId;
      usersStore[userId].real_name = user["profile"]["real_name"];
      usersStore[userId].deleted = user["deleted"];
      usersStore[userId].last_time_deactivated = user["updated"];
      usersStore[userId].following = [];
      usersStore[userId].followers = [];
      usersStore[userId].anonymous = "me_" + nanoid();
      usersStore[userId].changeanonymous = false;
      usersStore[userId].backup = false;
      usersStore[userId].saveme = false;
    });
  }

  try {
    async function getUserList() {
      let resultList = [];
      let condition = false;

      let x = 0;
      do {
        x++;

        console.log(x);

        if (condition === false) {
          const result = await client.users.list({
            limit: 1000,
          });

          resultList.push(result.members);
          condition = result.response_metadata.next_cursor ?? false;
        } else {
          const result = await client.users.list({
            cursor: condition,
            limit: 1000,
          });
          resultList.push(result.members);

          condition = result.response_metadata.next_cursor ?? false;
        }
      } while (condition != false);

      return resultList;
    }

    let resultUser = await getUserList();
    resultUser = resultUser.flat();
    saveUsers(resultUser);
    await createDbAndDoc("users", "vietspeak_user", usersStore);

    console.log("Save users to the Cloudant");
  } catch (error) {
    console.error(error);
  }
});

/*======================================= UPDATING USER EVENT  =====================================================*/
app.event(
  "user_change",
  async ({body, event, context, client, message, say}) => {
    let {id, deleted, real_name, name, updated} = event.user;

    let sayReturn;

    if (deleted) {
      sayReturn = "disabled: " + id + " - " + name;
    } else {
      sayReturn = "activate " + id + " - " + name + " - " + real_name;
    }

    const updatingVietSpeakUser = async (dbName, docID, userID) => {
      try {
        const document = (
          await clientcloudant.getDocument({
            docId: docID,
            db: dbName,
          })
        ).result;

        let {user} = document;
        if (user.hasOwnProperty(userID)) {
          document.user[userID].deleted = deleted;
          document.user[userID].last_time_deactivated = updated;
          if (deleted == false) {
            document.user[userID].real_name = real_name;
          }

          document._rev = (
            await clientcloudant.postDocument({
              db: dbName,
              document, // _id and _rev MUST be inside the document object
            })
          ).result.rev;
          console.log(
            "=========== UPDATING USER IN THE DATABASE: ===========: " +
            userID +
            " - " +
            real_name
          );
        } else {
          let real_name_property = real_name ?? name;
          document.user[userID] = {};
          document.user[userID].name = name;
          document.user[userID].slackId = userID;
          document.user[userID].real_name = real_name_property;
          document.user[userID].last_time_deactivated = updated;
          document.user[userID].deleted = deleted;
          document.user[userID].following = [];
          document.user[userID].followers = [];
          document.user[userID].followers = [];
          document.user[userID].anonymous = "me_" + nanoid();
          document.user[userID].changeanonymous = false;
          document.user[userID].backup = false;
          document.user[userID].saveme = false;
          document.user[userID].message = "";
          document.user[userID].volunteer = false;

          document._rev = (
            await clientcloudant.postDocument({
              db: dbName,
              document, // _id and _rev MUST be inside the document object
            })
          ).result.rev;
          console.log(
            "=========== CREATING NEW USER IN THE DATABASE: ===========" +
            userID +
            " - " +
            real_name
          );
        }
      } catch (err) {
        if (err.code === 404) {
          console.log(
            `Cannot update document because either "${dbName}" database or the "document" ` +
            `document was not found.`
          );
        }
      }
    };

    try {
      await updatingVietSpeakUser("users", "vietspeak_user", id);
      const result = await client.chat.postMessage({
        channel: "U01C3SA99FW",
        text: sayReturn,
      });
      console.log(result.ok);
    } catch (error) {
      console.error(error);
    }
  }
);

/*======================================= ABOUT ME =====================================================*/
app.event("message", async ({body, event, context, client, message, say}) => {
  let {
    client_msg_id,
    text,
    user,
    ts,
    team,
    thread_ts,
    parent_user_id,
    channel,
    events_ts,
    channel_type,
  } = event;

  if (typeof text == "undefined") {
    return;
  }

  if (typeof channel_type === "undefined" || channel_type !== "im") {
    return;
  }

  let textSubmission = text.trim().toLowerCase();

  if (textSubmission !== "me") {
    return;
  }

  const getInfoFromExistingDatabase = async (userID = "") => {
    const dbName = "users";
    const dbInfo = await clientcloudant.getDatabaseInformation({
      db: dbName,
    });
    const documentCount = dbInfo.result.doc_count;
    const dbNameResult = dbInfo.result.db_name;

    console.log(
      `Document count in "${dbNameResult}" database is ${documentCount}.`
    );

    const getDocParams = {
      db: dbName,
      docId: "vietspeak_user",
    };
    const documentAboutZebra = await clientcloudant.getDocument(getDocParams);
    const {result} = documentAboutZebra;

    console.log(result.user[userID]);

    return result.user[userID];
  };

  try {
    let aboutMe = await getInfoFromExistingDatabase(user);

    let followingList = aboutMe.following;

    let follower = aboutMe.followers;

    let volunteer = aboutMe.volunteer;

    if (volunteer == true) {
      volunteer = `\n\nBạn có thuộc nhóm volunteer hay không? Có.`;
    } else {
      volunteer = `\n\nBạn có thuộc nhóm volunteer hay không? Không. Soạn "volunteer" và gửi tới Kiwi để tham gia tình nguyện giúp đỡ các bạn khác!`;
    }

    if (followingList.length > 0) {
      followingList = followingList.map((e) => `<@${e}>`);

      followingList = `\n\nBạn đang follow ${followingList.length
        } người: ${followingList.join(", ")}`;
    } else {
      followingList =
        "\n\nFollowing: 0. Hãy soạn follow và mention người bạn muốn follow. Soạn unfollow và mention nếu muốn dừng follow ai đó.";
    }

    if (follower.length > 0) {
      follower = `\n\nBạn đang có ${follower.length} followers.`;
    } else {
      follower = "\n\nFollower: 0";
    }

    let updateandanh = aboutMe.changeanonymous
      ? ""
      : `\n\nBạn có thể thay đổi id ẩn danh của mình *\`MỘT LẦN\`* bằng cách soạn me_yourid và gửi tới KIWI! Chú ý yourid cần nhiều hơn 4 kí tự và ít hơn 40 kí tự, không viết hoa, không có dấu tiếng Việt, không khoảng cách giữa các kí tự, có thể dùng số và chữ`;

    let textOutput = `Hello <@${user}> \n\nTên hiển thị của bạn là: *\`${aboutMe.real_name}\`* \n\n ID ẩn danh của bạn là: *\`${aboutMe.anonymous}\`* ${updateandanh} ${followingList} ${follower} ${volunteer}`;
    const result = await client.chat.postMessage({
      channel: user,
      text: textOutput,
    });
  } catch (error) {
    console.error(error);
  }
});

/*======================================= UPDATING ANONYMOUS ID  =====================================================*/
app.event("message", async ({body, event, context, client, message, say}) => {
  let {text, user, channel_type} = message;

  // if(development(user, event)) return;

  if (onlyHandleIfIM(channel_type)) return;
  if (typeof text === "undefined") return;
  text = text.trim().toLowerCase();
  if (!text.includes("me_")) return;
  let arrayText = text.split("_");
  let error = false;
  let errorMessage;
  const updatingPrivateID = async (dbName, docID, userID) => {
    let handle;

    try {
      const document = (
        await clientcloudant.getDocument({
          docId: docID,
          db: dbName,
        })
      ).result;

      let {user} = document;

      let listofID = [];

      for (let u in user) {
        listofID.push(user[u].anonymous);
      }

      if (user.hasOwnProperty(userID)) {
        if (user[userID].changeanonymous == true) {
          handle = user[userID].anonymous;
        } else {
          if (arrayText[1].length < 1) {
            error = true;
            errorMessage = "Bạn chưa nhập id sau me_";
            handle = false;
            return;
          }
          if (arrayText[1].length < 4 || arrayText[1].length > 40) {
            error = true;
            errorMessage =
              "ID sau me_ cần có từ 4 kí tự trở lên và không dài quá 40 kí tự";
            handle = false;
            return;
          }
          if (!allowingString(arrayText[1])) {
            error = true;
            errorMessage =
              "ID sau me_của bạn không được chứa khoảng trống, tiếng Việt có dấu hoặc kí tự lạ ngoại từ - và _";
            handle = false;
            return;
          }
          if (listofID.includes(text) == true) {
            console.log("có trùng");
            error = true;
            errorMessage = "ID bạn vừa chọn đã có người sử dụng";
            handle = false;
            return;
          }
          text = stringToSlug(text);

          document.user[userID].anonymous = text;
          document.user[userID].changeanonymous = true;
          document._rev = (
            await clientcloudant.postDocument({
              db: dbName,
              document, // _id and _rev MUST be inside the document object
            })
          ).result.rev;
          handle = false;
        }
        console.log(
          "=========== UPDATING annonymous ID IN THE DATABASE: ===========: " +
          userID +
          " - "
        );
      }

      return handle;
    } catch (err) {
      if (err.code === 404) {
        console.log(
          `Cannot update document because either "${dbName}" database or the "document" ` +
          `document was not found.`
        );
      }
    }
  };

  try {
    let sayReturn;
    let waithandle = await updatingPrivateID("users", "vietspeak_user", user);
    if (waithandle !== false) {
      sayReturn = "ID ẩn danh của bạn đã được thiết lập  : " + waithandle;
    } else {
      if (error) {
        sayReturn = errorMessage;
      } else {
        sayReturn = "ID ẩn danh mới của bạn là :" + text;
      }
    }

    const result = await client.chat.postMessage({
      channel: user,
      text: error ? errorMessage : sayReturn,
    });
    console.log(result.ok);
  } catch (error) {
    console.error(error);
  }
});

// https://github.com/IBM/cloudant-node-sdk
/*======================================= FOLLOWING, FOLLOWER =====================================================*/
app.event("message", async ({body, event, context, client, message, say}) => {
  let {text, user, channel_type} = message;

  // if(development(user, event)) return;

  if (onlyHandleIfIM(channel_type)) return;

  if (typeof text === "undefined") return;

  function validateAndGetFollowList(str) {
    let lowercase = str.trim().toLowerCase();
    const userToFollow = [];
    if (!lowercase.includes("unfollow")) {
      if (!lowercase.includes("follow")) {
        return false;
      } else {
        userToFollow.push("follow");
      }
    } else {
      userToFollow.push("unfollow");
    }

    const indexes = [];

    for (let i = 0; i < str.length; i++) {
      if (str[i] + str[i + 1] == "<@") {
        indexes.push(i);
      }
    }
    if (indexes.length > 0) {
      indexes.forEach((e) => {
        userToFollow.push(str.substring(e + 2, e + 13));
      });
      return userToFollow;
    } else {
      return false;
    }
  }

  if (validateAndGetFollowList(text) === false) return;

  let error = false;
  let errorMessage;
  let currentList;
  let resultDisplay = {};

  const updatingFollower = async (dbName, docID, userID) => {
    try {
      const document = (
        await clientcloudant.getDocument({
          docId: docID,
          db: dbName,
        })
      ).result;

      let {user} = document;

      if (user.hasOwnProperty(userID)) {
        let listToFollow = validateAndGetFollowList(text);
        const firstElement = listToFollow.shift();
        currentList = user[userID].following;

        if (firstElement === "follow") {
          let listNotification = [];

          listToFollow.forEach((e) => {
            if (!currentList.includes(e)) {
              user[userID].following.push(e);
              user[e].followers.push(user[userID].slackId);

              listNotification.push(user[e]);
            }
          });

          listNotification.forEach(async function (each) {
            try {
              let saying = "Bạn vừa có một follower mới trên VietSpeak";
              const result = await client.chat.postMessage({
                channel: each.slackId,
                text: saying,
              });
              console.log(result.ok);
            } catch (error) {
              console.error(error);
            }
          });
        } else {
          let listtodelete = [];
          currentList.forEach((e, index) => {
            listToFollow.forEach((each) => {
              if (e == each) {
                listtodelete.push(index);
              }
            });
          });

          let originalList = [...currentList];
          for (let i = listtodelete.length - 1; i >= 0; i--) {
            currentList.splice(listtodelete[i], 1);
          }

          listToFollow.forEach((e) => {
            console.log(user[e].followers);
            let indexRemove = user[e].followers.indexOf(userID);
            user[e].followers.splice(indexRemove, 1);
            console.log(user[e].followers);
          });
        }

        resultDisplay.total = currentList.length;

        document._rev = (
          await clientcloudant.postDocument({
            db: dbName,
            document, // _id and _rev MUST be inside the document object
          })
        ).result.rev;

        console.log(
          "=========== UPDATING FOLLOWING IN THE DATABASE: ===========: " +
          userID +
          " - "
        );
      }
      return resultDisplay;
    } catch (err) {
      if (err.code === 404) {
        console.log(
          `Cannot update document because either "${dbName}" database or the "document" ` +
          `document was not found.`
        );
      }
    }
  };

  try {
    let waithandle = await updatingFollower("users", "vietspeak_user", user);
    let saying = "Bạn đang follow " + waithandle.total + " người";
    const result = await client.chat.postMessage({
      channel: user,
      text: saying,
    });
    console.log(result.ok);
  } catch (error) {
    console.error(error);
  }
});

/*=================================================================TRACKING SUBMISION ===================================================================*/
function getLevel(title = "", text = "") {
  let level = ["yellow", "green", "blue", "red"];
  if (typeof title !== "undefined") {
    title = title.trim().toLowerCase();
    let filter = level.filter((e) => title.includes(e));
    if (filter.length === 1) {
      return filter[0];
    }
  }

  if (typeof text !== "undefined") {
    text = text.trim().toLowerCase();
    let filter = level.filter((e) => text.includes(e));
    if (filter.length === 1) {
      return filter[0];
    }
  }
  return "unknown";
}

const checkIfDocumentExisting = async (dbName, documentID) => {
  try {
    const document = await clientcloudant.headDocument({
      docId: documentID,
      db: dbName,
    });
    console.log("document existing");
    return true;
  } catch (err) {
    if (err.code === 404) {
      return false;
      console.log(`there is no document with id: ` + documentID);
    }
  }
};

const tracking_createOrupdateDocIfExist = async (
  dbName,
  docID,
  user,
  dataUpdate = {}
) => {
  try {
    const document = (
      await clientcloudant.getDocument({
        docId: docID,
        db: dbName,
      })
    ).result;

    let {userSumitted} = document;

    if (userSumitted.hasOwnProperty(user)) {
      document.userSumitted[user].level.push(dataUpdate[user].level[0]);

      document._rev = (
        await clientcloudant.postDocument({
          db: dbName,
          document, // _id and _rev MUST be inside the document object
        })
      ).result.rev;

      console.log(
        `You have updated the document:\n${JSON.stringify(document, null, 2)}`
      );
      console.log("người đã nộp bài");
    } else {
      document.userSumitted[user] = {};
      document.userSumitted[user].level = [dataUpdate[user].level[0]];

      console.log(document.userSumitted[user]);

      document._rev = (
        await clientcloudant.postDocument({
          db: dbName,
          document, // _id and _rev MUST be inside the document object
        })
      ).result.rev;

      console.log(
        `You have updated the document:\n${JSON.stringify(document, null, 2)}`
      );
    }
  } catch (err) {
    if (err.code === 404) {
      console.log(
        `Cannot update document because either "${dbName}" database or the "document" ` +
        `document was not found.`
      );
    }
  }
};

const tracking_createNewTask = async (
  dbName,
  task_id,
  documentCreated = {}
) => {
  try {
    let insertData = {
      _id: task_id,
    };
    insertData.userSumitted = documentCreated;

    const createDocumentResponse = await clientcloudant.postDocument({
      db: dbName,
      document: insertData,
    });

    documentCreated._rev = createDocumentResponse.result.rev;
    console.log(
      "You have created the document:\n" +
      JSON.stringify(documentCreated, null, 2)
    );
  } catch (err) {
    if (err.code === 404) {
      console.log(
        `Cannot update creat document because either "${dbName}" database or the "document" ` +
        `document was not found.`
      );
    }
  }
};

app.event("message", async ({body, event, context, client, message}) => {
  let {subtype, files, thread_ts} = event;
  let {user, ts, text, channel, channel_type} = message;

  if (typeof channel_type === "undefined") {
    console.log("không có channel_type");
    return;
  }

  //if(development(user, event)) return;
  if (
    onlyHandleMainThreadEvent(thread_ts) ||
    onlyHandlePublicEvent(channel_type) ||
    onlyHandleIfUploadFile(files) ||
    onlyHandleIfNotBot(user) ||
    onlyHandleChannel2(channel) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
    return;
  }

  let {
    display_as_bot,
    name,
    url_private_download,
    timestamp,
    title,
    filetype,
    id,
  } = files[0];

  let color = getLevel(title, text);

  if (typeof display_as_bot !== "undefined" && display_as_bot) {
    return;
  }

  let taskNumber = "task_" + getCurrentTask(currentTimeStamp());

  if (typeof suptype !== "undefined") {
    if (suptype === "message_deleted" || suptype === "message_changed") return;
  }

  let task_existing = await checkIfDocumentExisting("tracking", taskNumber);
  let dataUpdate = {};
  dataUpdate[user] = {};

  let levelStore = {};

  levelStore[color] = currentTimeStamp();

  dataUpdate[user].level = [levelStore];

  if (task_existing) {
    await tracking_createOrupdateDocIfExist(
      "tracking",
      taskNumber,
      user,
      dataUpdate
    );
  } else {
    await tracking_createNewTask("tracking", taskNumber, dataUpdate);
  }
});

/*================================================================= COMMON SHARED FUNCTION USED WITH CLOUDANT  ===================================================================*/
async function gettingDocsFromDatabase(dbName, docID) {
  const getDocParams = {
    db: dbName,
    docId: docID,
  };
  const documentAboutZebra = await clientcloudant.getDocument(getDocParams);
  const {result} = documentAboutZebra;
  return result;
}

async function getUserDatabase(userId) {
  let list = await gettingDocsFromDatabase("users", "vietspeak_user");
  return list.user[userId];
}

/*=================================================================VERIFYING USER'S SUBMISION  ===================================================================*/

app.event("message", async ({body, event, context, client, message}) => {
  let {subtype, files, thread_ts} = event;

  let {user, ts, text, channel, channel_type} = message;

  if (typeof channel_type === "undefined") {
    console.log("không có channel_type");
    return;
  }

  return;

  if (development(user, event)) return;
  // if(onlyHandleMainThreadEvent(thread_ts)
  //   || onlyHandlePublicEvent(channel_type)
  //   || onlyHandleIfUploadFile(files)
  //   || onlyHandleIfNotBot(user)
  //   || onlyHandleChannel2(channel)
  //   || onlyHandleIfNotDeletingEvent(subtype)
  //   ){
  //  return;
  // }

  if (typeof display_as_bot !== "undefined" && display_as_bot) {
    return;
  }

  let taskNumber = "task_" + getCurrentTask(currentTimeStamp());
  if (typeof suptype !== "undefined") {
    if (suptype === "message_deleted" || suptype === "message_changed") return;
  }
  await gettingDocsFromDatabase("users", "vietspeak_user");
});

// ==============================DEBUGGING FOR IMPLEMENTING MORE FEATURES FOR REPORT ==============================

async function getEmailFromUser(userID) {
  const result = await client.users.profile.get({
    user: userID,
  });
  let email = result.profile.email;
  console.log("emailr: " + email);
  return email;
}

app.event("message", async ({message, event}) => {
  let {
    user,
    ts,
    text,
    thread_ts,
    subtype,
    channel,
    channel_type,
    bot_id,
    parent_user_id,
  } = message;

  if (onlyHandleFollowingSingleWord(text, ["test", "Test"])) return;

  if (onlyHandleIfIM(channel_type) || onlyHandleIfNotDeletingEvent(subtype)) {
    return;
  }

  try {
    let email = await getEmailFromUser("U03L0SUPVL7");
    console.log(email);

    let sayReturn = await getUserNotPost();
    const response = await axios.get(apiEmailSorted);
    const data = await response.data.records;
    const data$ = from(data)
      .pipe(
        tap((data) => {
          console.log("Debug");
          //console.log(data)
        }),
        take(4),
        filter((user) => {
          return Date.parse(user.createdTime) > 1659346351000;
        }),
        map((user) => {
          return user;
        }),
        // scan((acc, current) => acc.concat(current), []), //combine to whole array before emit out https://stackoverflow.com/questions/62438181/how-to-combine-each-inner-observable-rxjs-with-outer-and-emit-one-array
        // last(),
        toArray()
      )
      .subscribe(async (output) => {
        console.log(output);
        const result = await client.chat.postMessage({
          channel: user,
          text: sayReturn,
        });
      })
      .unsubscribe();
  } catch (error) {
    console.error(error);
  }
});

/*==============================================================RANK, REPORT AND WARNING ABOUT THE DEADLINE ========================================================*/

async function getUserChannel(channelNumber) {
  const result = await client.conversations.members({
    channel: channelNumber,
    limit: 1000,
  });

  let members = result.members;
  let cursor = result.response_metadata.next_cursor;
  console.log("cusor: " + cursor);

  return members;
}

async function getListPosters(beginning, ending) {
  let channelId = "C01BY57F29H";
  let resultList = [];
  let condition = false;
  do {
    if (condition === false) {
      const result = await client.conversations.history({
        oldest: beginning,
        latest: ending,
        channel: channelId,
      });
      resultList.push(result.messages);
      condition = result.response_metadata.next_cursor ?? false;
    } else {
      const result = await client.conversations.history({
        oldest: beginning,
        latest: ending,
        channel: channelId,
        cursor: condition,
      });

      resultList.push(result.messages);
      condition = result.response_metadata.next_cursor ?? false;
    }
  } while (condition != false);
  return resultList;
}

async function getTopFollower() {
  let activeUser = await gettingDocsFromDatabase("users", "vietspeak_user");
  let topFollower = [];
  for (let u in activeUser.user) {
    if (activeUser.user[u].followers.length > 0) {
      let followerCount = {};
      followerCount[activeUser.user[u].slackId] =
        activeUser.user[u].followers.length;
      topFollower.push(followerCount);
    }
  }
  topFollower.sort(function (a, b) {
    return Object.values(b) - Object.values(a);
  });
  let originaltopFollower = [...topFollower];
  topFollower = topFollower.slice(0, 10);

  originaltopFollower.forEach((e) => {
    if (
      Object.values(e) == Object.values(topFollower[topFollower.length - 1])[0]
    ) {
      topFollower.push(e);
    }
  });
  topFollower = [...new Set(topFollower)]; //remove duplicate
  topFollower = topFollower.map(
    (e, index) => `${index + 1}. <@${Object.keys(e)}>: ${Object.values(e)}`
  );
  topFollower = `\n\n Top *\`followers\`*: \n\n${topFollower.join("\n")}`;
  return topFollower;
}

async function getListofVolunteer() {
  let activeUser = await gettingDocsFromDatabase("users", "vietspeak_user");

  let topVolunteer = [];

  for (let u in activeUser.user) {
    if (activeUser.user[u].volunteer === true) {
      topVolunteer.push(activeUser.user[u].slackId);
    }
  }

  topVolunteer = topVolunteer.map((e, index) => `${index + 1}. <@${e}>`);
  topVolunteer = `\n\n Danh sách *\`volunteer\`*: \n\n${topVolunteer.join(
    "\n"
  )}`;
  return topVolunteer + "\n\n";
}

function findDuplicatedandCount(array = []) {
  if (!Array.isArray(array)) return;
  let result = {};
  let listLength = array.length;
  for (let i = 0; i < listLength; i++) {
    for (let j = 0; j < listLength; j++) {
      //data mixed of string and number, so using ==
      if (array[i] == array[j] && i !== j) {
        result[array[i]] = result[array[i]] ? result[array[i]] + 1 : 1;
        break;
      }
    }
  }

  return result;
}

async function postReportTaskList(destination, taskNumber) {
  try {
    let topFollowerDisplay = await getTopFollower();
    let volunteerList = await getListofVolunteer();

    let channel00_Announcement = `C01BY4ZQ7TM`;
    let currentTaskNow = getCurrentTask(currentTimeStamp());
    let beginning, ending;
    let listMising = true;

    if (
      typeof taskNumber === "undefined" ||
      taskNumber > currentTaskNow ||
      taskNumber < 68
    ) {
      taskNumber = currentTaskNow;
    }

    if (Number(currentTaskNow) !== Number(taskNumber)) {
      beginning = getTimeStampFromTaskNumber(taskNumber).beginning;
      ending = getTimeStampFromTaskNumber(taskNumber).ending;
      currentTaskNow = taskNumber;
    } else {
      beginning = getBeginningAndEndingTask(currentTimeStamp()).beginning;
      ending = getBeginningAndEndingTask(currentTimeStamp()).ending;
    }

    let list = await getListPosters(beginning, ending);
    list = list.flat();
    let postByUsers = list.filter((e) => typeof e.files !== "undefined");
    /* User*/
    let usersList = postByUsers.map((e) => e.user);

    /* ===============Not submitted ===============*/
    let memberInChannel = await getUserChannel("C01BY57F29H");
    memberInChannel = memberInChannel.filter((e) => {
      // also not check @trunghieu, @hieunguyen: "U01BXJNDETU", "U01CA8D5D3K",
      let notcheck = [
        "U01BXJNDETU",
        "U01CA8D5D3K",
        "U03SSC0NQPP",
        "U01EVJFP0U8",
        "U01HEMMPVK2",
        "U02K40CRMFB",
        "U02N7T5PRRS",
        "U01DS209G1Y",
        "U01CYMZM3FV",
        "U02N47DMKRR",
        "U02PQ7A3YB0",
        "U01D4RB4EHM",
      ];
      for (b of notcheck) {
        if (b === e) return false;
      }
      return true;
    });

    let uniqueUsers = [...new Set(usersList)];
    let notsubmitted = memberInChannel.filter((x) => !uniqueUsers.includes(x));
    let totalnotsubmitted = notsubmitted.length;
    notsubmitted = notsubmitted.map((e) => `<@${e}>`);
    notsubmitted = listMising
      ? `Danh sách ${totalnotsubmitted} quý khách *\`lỡ xe\`*:  ${notsubmitted.join(
        ", "
      )}`
      : "";

    /*===============cô tấm===============*/
    let rsorted = findDuplicatedandCount(usersList);
    let top4 = [];
    let top3 = [];
    let top2 = [];
    for (let item in rsorted) {
      if (rsorted[item] >= 4) {
        top4.push(item);
      }
      if (rsorted[item] === 3) {
        top3.push(item);
      }
      if (rsorted[item] === 2) {
        top2.push(item);
      }
    }

    top4 = top4.map((e) => `<@${e}>`);
    top3 = top3.map((e) => `<@${e}>`);
    top2 = top2.map((e) => `<@${e}>`);

    top4 =
      top4.length > 0
        ? `\n\nTop *\`cô Tấm\`* chăm chỉ 4 màu: ${top4.join(", ")}`
        : "";
    top3 =
      top3.length > 0
        ? `\n\nTop *\`ong đất\`* tảo tần 3 màu: ${top3.join(", ")}`
        : "";
    top2 =
      top2.length > 0
        ? `\n\nTop *\`kiến càng\`* chịu khó 2 màu: ${top2.join(", ")}`
        : "";

    /* =======================================================*/
    // sorting array and keep the original index https://stackoverflow.com/questions/44613846/how-to-keep-array-indexvalue-after-sorting
    function sortAndKeepIndex(numArray) {
      let mapped = numArray.map(function (el, i) {
        return {
          index: i,
          value: el,
        };
      });
      // sorting the mapped array containing the reduced values
      mapped.sort(function (a, b) {
        return a.value - b.value;
      });
      // container for the resulting order
      const result = mapped.map(function (el) {
        return numArray[el.index];
      });

      let start = mapped.length - 10;
      if (start < 0) {
        start = 0;
      }

      mapped = mapped.slice(start, mapped.length);
      mapped.reverse();
      return mapped;
    }

    function counting(obj) {
      let number = 0;
      for (each in obj) {
        number = number + obj[each].count;
      }
      return number;
    }

    /* ===============Reaction ===============*/
    let reactionList = postByUsers.map((e) => e.reactions);
    let reactionCounting = reactionList.map((e) => counting(e));
    let topReactionIndex = sortAndKeepIndex(reactionCounting);
    topReactionIndex = topReactionIndex.map(
      (e, i) => `${i + 1}. <@${usersList[e.index]}> : ${e.value} reactions`
    );
    topReactionIndex = `Top 10 bài được *\`quan tâm\`* nhất: \n\n ${topReactionIndex.join(
      "\n"
    )}`;

    /*===============Reply counting===============*/
    let reply_count = postByUsers.map((e) => e.reply_count);
    let reply_countIndex = sortAndKeepIndex(reply_count);
    reply_countIndex = reply_countIndex.map(
      (e, i) => `${i + 1}. <@${usersList[e.index]}> : ${e.value} comments`
    );
    reply_countIndex = `Top 10 bài được *\`bà tám\`* nhất: \n\n ${reply_countIndex.join(
      "\n"
    )}`;

    /*===============Reply reply_users===============*/
    let reply_users = postByUsers.map((e) => e.reply_users);
    reply_users = reply_users.flat();

    const counts = {};
    reply_users.forEach(function (x) {
      counts[x] = (counts[x] || 0) + 1;
    });
    const arrayList = Object.entries(counts);
    arrayList.sort(function (a, b) {
      return b[1] - a[1];
    });

    // filter bots
    let arrayListFilter = arrayList.filter((e) => {
      let bot = [
        "U01EVJFP0U8",
        "U01HEMMPVK2",
        "U02K40CRMFB",
        "U02N7T5PRRS",
        "U01CYMZM3FV",
        "U01DS209G1Y",
        "U01D4RB4EHM",
      ];
      for (b of bot) {
        if (b == e[0]) return false;
      }
      return true;
    });

    let chimse = arrayListFilter.slice(0, 10);
    let niceComments = chimse.map(
      (e, i) => `${i + 1}. <@${e[0]}> : comment giúp ${e[1]} bạn`
    );
    niceComments = `Top 10 *\`chim sẻ\`* đi nắng: \n\n ${niceComments.join(
      "\n"
    )}`;

    /*===============mèo lười===============*/
    let lazyCat = arrayListFilter.filter((e) => e[1] < 2);
    lazyCat = lazyCat.map((e, i) => `<@${e[0]}>`);
    lazyCat = `Top *\`mèo lười\`* phơi nắng dưới 2 comment: ${lazyCat.join(
      ", "
    )}`;

    /*===============quái xế===============*/
    let earlyBirdUser = postByUsers.filter(
      (e) => e.ts <= Number(beginning) + 86400
    );
    earlyBirdUser.reverse();
    earlyBirdUser = earlyBirdUser.map((e) => `<@${e.user}>`);
    earlyBirdUser = `Top *\`quái xế \`* tốc độ: ${earlyBirdUser.join(", ")}`;

    /*===============ốc sên===============*/
    let lateBirdUser = postByUsers.filter(
      (e) => e.ts >= Number(ending) - 10800
    );
    lateBirdUser.reverse();
    lateBirdUser = lateBirdUser.map((e) => `<@${e.user}>`);
    lateBirdUser =
      lateBirdUser.length > 0
        ? `\n\nTop *\`ốc sên\`* kẹt xe: ${lateBirdUser.join(", ")}`
        : "";
    let decorationText = `*✧･ﾟ: *✧･ﾟ🅡🅔🅟🅞🅡🅣* *:･ﾟ✧*:･ﾟ✧*`;

    let sayReturn = `${decorationText} ${topFollowerDisplay}\n\n ${volunteerList} ${postByUsers.length} là số *\`bài đăng\`* của ${uniqueUsers.length}/${memberInChannel.length} tổng số thành viên trong task ${currentTaskNow}. ${top4}${top3}${top2}\n\n ${topReactionIndex}\n\n ${reply_countIndex}\n\n ${niceComments}\n\n ${lazyCat}\n\n ${earlyBirdUser}  ${lateBirdUser}\n\n${notsubmitted}`;

    try {
      const result = await client.chat.postMessage({
        channel: destination,
        text: sayReturn,
      });
      console.log(result.ok);
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
  }
}

app.event("message", async ({body, event, context, client, message}) => {
  let {subtype, files, thread_ts} = event;

  let {user, ts, text, channel, channel_type} = message;

  if (typeof channel_type === "undefined") {
    return;
  }

  if (typeof text === "undefined") return;
  text = text
    .trim()
    .toLowerCase()
    .split(" ")
    .filter((e) => e.length > 0);
  if (text.length >= 3) return;
  if (text[0] !== "rank") return;

  //   if (development(user, event)) return;
  console.log(user + " is checking rank");

  if (
    onlyHandleIfIM(channel_type) ||
    onlyHandleIfNotBot(user) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
    return;
  }

  await postReportTaskList(user, text[1]);
});

/*======================================================== ENDING TASK REPORT ========================================================*/
const ruleReport = new schedule.RecurrenceRule();
ruleReport.second = 0;
ruleReport.minute = [1];
ruleReport.hour = [0];
ruleReport.date = [1, 11, 21];
ruleReport.tz = "Asia/Ho_Chi_Minh";

const jobruleReport = schedule.scheduleJob(ruleReport, function () {
  let previousTask = getCurrentTask(currentTimeStamp()) - 1;
  let channel00_Announcement = `C01BY4ZQ7TM`;
  postReportTaskList(channel00_Announcement, previousTask);
});

/*======================================================== WARNING ABOUT THE DEADLINE ==================================================*/
async function getUserNotPost() {
  let currentTask = getCurrentTask(currentTimeStamp());
  let timetable = getTimeStampFromTaskNumber(currentTask);
  let beginning = timetable.beginning;
  let ending = timetable.ending;

  let list = await getListPosters(beginning, ending);
  list = list.flat();
  let postByUsers = list.filter((e) => typeof e.files !== "undefined");
  let usersList = postByUsers.map((e) => e.user);

  /* ===============Not submitted ===============*/
  let memberInChannel = await getUserChannel("C01BY57F29H");
  memberInChannel = memberInChannel.filter((e) => {
    // also not check @trunghieu, @hieunguyen: "U01BXJNDETU", "U01CA8D5D3K",
    let notcheck = [
      "U01BXJNDETU",
      "U01CA8D5D3K",
      "U03SSC0NQPP",
      "U01EVJFP0U8",
      "U01HEMMPVK2",
      "U02K40CRMFB",
      "U02N7T5PRRS",
      "U01DS209G1Y",
      "U01CYMZM3FV",
      "U02N47DMKRR",
      "U02PQ7A3YB0",
      "U01D4RB4EHM",
    ];
    for (b of notcheck) {
      if (b === e) return false;
    }
    return true;
  });

  let uniqueUsers = [...new Set(usersList)];
  let notsubmitted = memberInChannel.filter((x) => !uniqueUsers.includes(x));

  return notsubmitted;
}

async function postWarningList() {
  let currentTask = getCurrentTask(currentTimeStamp());
  let notsubmitted = await getUserNotPost();
  let totalnotsubmitted = notsubmitted.length;
  notsubmitted = notsubmitted.map((e) => `<@${e}>`);
  notsubmitted = `*\`*===**-^^WARNING^^-**===*\`*\n\n Danh sách ${totalnotsubmitted} quý khách *\`kẹt xe\`* chưa nộp bài task ${currentTask}: \n\n ${notsubmitted.join(
    ", "
  )} \n\n Các bạn còn 6 giờ đồng hồ để thu và nộp bài hoàn thành task ${currentTask}. \n\n Chúc các bạn sớm về đích dù trời nắng hay mưa, chắc là Internet vẫn chạy`;
  return notsubmitted;
}

const ruleReportWarning = new schedule.RecurrenceRule();
ruleReportWarning.second = 0;
ruleReportWarning.minute = [0];
ruleReportWarning.hour = [18];
ruleReportWarning.date = [10, 20, getTheLastDayOfTheMonth()];
ruleReportWarning.tz = "Asia/Ho_Chi_Minh";

const jobruleReportWarning = schedule.scheduleJob(
  ruleReportWarning,
  async function () {
    //channel1:  G01BPHWQ023 //will U01C3SA99FW
    let channel00_Announcement = `C01BY4ZQ7TM`;
    try {
      let sayReturn = await postWarningList();

      const result = await app.client.chat.postMessage({
        channel: channel00_Announcement,
        text: sayReturn,
      });
      console.log("warning: " + result.ok);
    } catch (error) {
      console.error(error);
    }
  }
);

/*=================================================================NOTIFY FOLLOWER =============================================================*/
app.event("message", async ({body, event, context, client, message}) => {
  let {subtype, files, thread_ts} = event;
  //console.log(event);
  let {user, ts, text, channel, channel_type} = message;

  if (
    onlyHandleMainThreadEvent(thread_ts) ||
    onlyHandlePublicEvent(channel_type) ||
    onlyHandleIfUploadFile(files) ||
    onlyHandleIfNotBot(user) ||
    onlyHandleChannel2(channel) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
    return;
  }

  let {name, title} = files[0];

  let color = getLevel(title, text);
  if (color === "unknown") {
    color = "";
  }

  async function getMessageLink() {
    try {
      const resultLink = await client.chat.getPermalink({
        channel: channel,
        message_ts: ts,
      });
      return resultLink;
    } catch (error) {
      console.error(error);
    }
  }

  let {permalink} = await getMessageLink();
  let currentTaskNow = getCurrentTask(currentTimeStamp());
  let userInfo = await getUserDatabase(user);

  let followerList = userInfo.followers;
  if (followerList.length > 0) {
    followerList.forEach(async function (eachFollower) {
      let outputText = `Hi <@${eachFollower}>, <@${user}> mới đăng bài thu âm ${color} task ${currentTaskNow}. \n\n ${permalink}`;
      try {
        const result = await client.chat.postMessage({
          channel: eachFollower,
          text: outputText,
        });
      } catch (error) {
        console.error(error);
      }
    });
  }
});

/*======================================= VOLUNTEER =====================================================*/
app.event("message", async ({body, event, context, client, message, say}) => {
  let {text, user, channel_type} = message;

  if (onlyHandleIfIM(channel_type)) return;

  if (onlyHandleFollowingSingleWord(text, ["volunteer"])) return;

  const updatingPrivateID = async (dbName, docID, userID) => {
    try {
      const document = (
        await clientcloudant.getDocument({
          docId: docID,
          db: dbName,
        })
      ).result;

      let {user} = document;

      let listofID = [];

      for (let u in user) {
        listofID.push(user[u].anonymous);
      }

      if (user.hasOwnProperty(userID)) {
        if (user[userID].volunteer == true) {
          document.user[userID].volunteer = false;
          document._rev = (
            await clientcloudant.postDocument({
              db: dbName,
              document, // _id and _rev MUST be inside the document object
            })
          ).result.rev;

          return false;
        } else {
          document.user[userID].volunteer = true;
          document._rev = (
            await clientcloudant.postDocument({
              db: dbName,
              document, // _id and _rev MUST be inside the document object
            })
          ).result.rev;
          return true;
        }

        console.log(
          "=========== UPDATING annonymous ID IN THE DATABASE: ===========: " +
          userID +
          " - "
        );
      }
    } catch (err) {
      if (err.code === 404) {
        console.log(
          `Cannot update document because either "${dbName}" database or the "document" ` +
          `document was not found.`
        );
      }
    }
  };

  try {
    let status_volunteer = await updatingPrivateID(
      "users",
      "vietspeak_user",
      user
    );
    const result = await client.chat.postMessage({
      channel: user,
      text: status_volunteer
        ? `Bạn vừa tham gia nhóm volunteer comment hỗ trợ các bạn trên VietSpeak. Soạn "volunteer" để rời nhóm!. Soạn "me" gửi KIWI để xem profile của bạn.`
        : `Bạn vừa rời nhóm volunteer comment hỗ trợ các bạn trên VietSpeak. Soạn "volunteer" để tham gia lại! Soạn "me" gửi KIWI để xem profile của bạn.`,
    });
    console.log(result.ok);
  } catch (error) {
    console.error(error);
  }
});

/*======================================================== DISPATCHING VOLUNTEER ==================================================*/
async function postDispathchingVolunteerComment() {
  let currentTask = getCurrentTask(currentTimeStamp());
  let timetable = getTimeStampFromTaskNumber(currentTask);
  let beginning = timetable.beginning;
  let ending = timetable.ending;

  let list = await getListPosters(beginning, ending);
  list = list.flat();

  let postNeedComments = list.filter((e) => {
    let listReplyUser = e.reply_users;

    let botslist = [
      "U01EVJFP0U8",
      "U01HEMMPVK2",
      "U02K40CRMFB",
      "U02N7T5PRRS",
      "U01DS209G1Y",
      "U01CYMZM3FV",
      "U02N47DMKRR",
      "U01D4RB4EHM",
    ];

    listReplyUser = listReplyUser.filter((eachreplyUser) => {
      if (botslist.includes(eachreplyUser)) return false;

      return true;
    });

    if (typeof e.files !== "undefined" && listReplyUser.length < 2) {
      return true;
    } else {
      return false;
    }
  });

  console.log(postNeedComments);
}

const rulepostDispathchingVolunteerComment = new schedule.RecurrenceRule();
rulepostDispathchingVolunteerComment.second = 0;
rulepostDispathchingVolunteerComment.minute = [
  6, 8, 44, 45, 48, 50, 52, 53, 54, 58, 59,
];
rulepostDispathchingVolunteerComment.hour = [13];
rulepostDispathchingVolunteerComment.date = [
  4,
  8,
  14,
  18,
  24,
  getTheLastDayOfTheMonth() - 2,
];
rulepostDispathchingVolunteerComment.tz = "Asia/Ho_Chi_Minh";

const scheduleDispathchingVolunteerComment = schedule.scheduleJob(
  rulepostDispathchingVolunteerComment,
  async function () {
    //channel1:  G01BPHWQ023 //will U01C3SA99FW
    let channel00_Announcement = `C01BY4ZQ7TM`;
    try {
      let sayReturn = await postDispathchingVolunteerComment();

      const result = await app.client.chat.postMessage({
        channel: "U01C3SA99FW", //testing
        text: "sayReturn",
      });
      console.log("Dispatching: " + result.ok);
    } catch (error) {
      console.error(error);
    }
  }
);

/*==============================================================================================================================*/
(async () => {
  try {
    await app.start();
    console.log("⚡️ KIWI app started");
    console.log(getCurrentTask(currentTimeStamp()));
  } catch (err) {
    console.log("ERROR OCCURRING ====>", err);
  }
})();
