require('dotenv').config()

let IBM_Cloudant_VietSpeak_Url = process.env.IBM_Cloudant_VietSpeak_Url;
let IBM_Cloudant_Vietspeak_APIKEY = process.env.IBM_Cloudant_Vietspeak_APIKEY;

let Slack_KIWI_UserClient_token = process.env.Slack_KIWI_UserClient_token;
let Slack_KIWI_Client_token = process.env.Slack_KIWI_Client_token;
let Slack_User_VietSpeakBank_token = process.env.Slack_User_VietSpeakBank_token;
let Slack_KIWI_Bot_token = process.env.Slack_KIWI_Bot_token
let Slack_KIWI_App_token = process.env.Slack_KIWI_App_token
let Slack_HOOK_Channel2 = process.env.Slack_HOOK_Channel2
let Slack_DOWNLOAD_TOKEN = process.env.Slack_DOWNLOAD_TOKEN;

let AirTable_Api_key = process.env.AirTable_Api_key
let MICROSOFT_Text_to_Speech_token = process.env.MICROSOFT_Text_to_Speech_token
let MICROSOFT_TRANSLATION_token = process.env.MICROSOFT_TRANSLATION_token;
let WEATHER_API = process.env.WEATHER_API

// ====================================================================
const {
  App
} = require("@slack/bolt");
const {
  WebClient,
  LogLevel
} = require("@slack/web-api");

const NodeCache = require("node-cache");

const myCache = new NodeCache();

const flatCache = require("flat-cache");
const cache = flatCache.load("vietspeak");

const {
  customAlphabet
} = require("nanoid");
const alphabet = 'abcdefghijklmnopqrstuvwxyz123456789';
const nanoid = customAlphabet(alphabet, 11);

// ===========================clientcloudant=================================
const {
  CloudantV1
} = require("@ibm-cloud/cloudant");
const {
  IamAuthenticator
} = require("ibm-cloud-sdk-core");

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
  onlyHandleFollowingSingleWord
} = require("./utilities");

// ============================================================

const client = new WebClient(
  Slack_KIWI_Client_token, {
  logLevel: LogLevel.DEBUG,
}
);

// d??ng ????? g???i chat.delete API v???i token c???a user
const clientUser = new WebClient(
  Slack_KIWI_UserClient_token, {
  logLevel: LogLevel.DEBUG,
}
);

// ============================================================
const VietSpeakBankUser = new WebClient(Slack_User_VietSpeakBank_token, {
  logLevel: LogLevel.DEBUG,
});

const stringSimilarity = require("string-similarity");
const {
  v4: uuidv4
} = require("uuid");
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
  appToken: Slack_KIWI_App_token
});



app.event("message",
  async ({
    body,
    event,
    context,
    client,
    message
  }) => {
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

    if (onlyHandleIfIM(channel_type) ||
      onlyHandleIfNotDeletingEvent(subtype)
    ) {
      return;
    }

    const sayGreetings = [
      `how are you ? `,
      `b???n c?? kh???e h??ng?! `,
      `what's up?`,
      `nice to see you here! `,
      `how is it going?`,
      `tui bi???t x??i ti???ng Vi???t nha.! `,
      `h??? nh?? h??? nh??!`,
      `ch??c m???t ng??y t???t l??nh nha!`,
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
  }
);

app.event("message",
  async ({
    body,
    event,
    context,
    client,
    message
  }) => {
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


    if (onlyHandleIfIM(channel_type) ||
      onlyHandleIfNotDeletingEvent(subtype)
    ) {
      return;
    }


    const thanks = [
      `You are welcome <@${message.user}>! `,
      `H??ng c?? chi <@${message.user}>! `,
      `Chi???n nh??? ?? <@${message.user}>! `,
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
  }
);

//=========================================GRE================================================================

app.event("message", async ({ message, say }) => {
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

  if (onlyHandleIfIM(channel_type) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
    return;
  }

  fs.readFile('data/gre-vocabulary.json', 'utf8', async (err, data) => {
    if (err) {
      console.error(err)
      return
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
  })
});

// ==============================weather ==============================
app.message(/(w|W)\s[a-zA-Z]+/, async ({ context, body, message, say }) => {

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

  if (onlyHandleIfIM(channel_type) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
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
app.event("message", async ({ message, say }) => {
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

  if (onlyHandleIfIM(channel_type) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
    return;
  }

  let words = funFact(randomIndex(factCount))

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
app.event("message", async ({ message, say }) => {
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

  if (onlyHandleIfIM(channel_type) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
    return;
  }

  let words = getRandomQuote(randomIndex(quoteCount))

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
app.event("message", async ({ message, say }) => {
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

  if (onlyHandleIfIM(channel_type) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
    return;
  }

  let words = getRandomStories(randomIndex(storiesCount))

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
app.event("message", async ({ message, event }) => {
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

  if (onlyHandleIfIM(channel_type) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
    return;
  }

  let jokeFetched = joke[randomIndex(jokeLength)];
  let jokeSetup = jokeFetched.setup;
  let jokePunchline = jokeFetched.punchline;
  let words = `*-* ${jokeSetup}\n *-* ${jokePunchline}`

  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: words,
    });
  } catch (error) {
    console.error(error);
  }

});


app.event("message", async ({ message, say }) => {
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

  if (onlyHandleIfIM(channel_type) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
    return;
  }

  let words = `1) Type *\`d love\`* to check the dictionary of the word \`love\`.\n 2) Type *\`v\`* to receive a random GRE vocabulary. \n 3) Type *\`f\`* to receive a random fun fact. \n 4) Type *\`j\`* to receive a random joke. \n 5) Type *\`q\`* to receive a random quote. \n 6) Type *\`w x\`* to receive a x' weather condition. Try *\`w saigon\`*.\n 7) Type *\`h\`* to receive help. Here you are. \n 8) Type *\`s\`* to receive a random story written by Aesop. Enjoy reading!. \n 9) Type *\`e\`* .to receive a random article published by Economist. Enjoy reading!. \n 10) Type *\`hi\`*, *\`hello\`* or *\`thanks\`* if you wish. \n 11) Type *\`me\`*, to set up your profile. \n 12) Type *\`follow\`* or *\`unfollow\`* and mention the users you want to follow or unfollow. \n 13) Click on the bouque icon to receive the mark of the current audio.\n 14) Send *\`"vi English sentence"\`* to translate English to Vietnamese.\n 15) Send *\`"en xin ch??o"\`* to translate Vietnamese to English.\n 16) Send *\`"visound  xin ch??o"\`* to convert text to Vietnamese speech.\n 17) Send *\`"ensound hello world"\`* to convert text to English speech.\n 18) Send *\`"me_yourid"\`* to set up your own anonymous ID.\n 19) Type *\`"thanos"\`* in the thread created by you to eliminate the whole thread.\n 20) Type your transcript in the channel #8 to receive your mark when listening to the audio.\n 21) Type *\`"bee"\`* when you want to receive the transcript.`

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


app.message(/^(d|D)\s[a-zA-Z]+/, async ({ body, message, say }) => {
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

  if (onlyHandleIfIM(channel_type) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
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
app.event("message", async ({ message, say }) => {
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

  if (onlyHandleIfIM(channel_type) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
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

  console.log(economistResponse)

  let objectURL = economistResponse.data.channel.item;
  return {
    objectURL
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
    audio
  };
  return resultObject;
}


app.event("message", async ({
  event,
  message,
  body,
  say
}) => {

  let {
    text,
    channel_type,
    user
  } = event;
  
  
  if (onlyHandleFollowingSingleWord(text, ["e"])) return;

  if (onlyHandleIfIM(channel_type)) return;
  let randomIndexEconomist = randomIndex(totalItem);
  let dataReturn = await getItemEconomist(randomIndexEconomist);


  let sayReturn =
    `*\`${dataReturn.headline}\`*\n
  _${dataReturn.description}_\n
  ${dataReturn.articleBodyCombined}\n
  Published: ${dataReturn.publishedDate}\n
  Link: ${dataReturn.randomLink}
  `;

  try {
    const result = await client.chat.postMessage({
      channel: user,
      text: sayReturn
    });
    console.log(result.ok);
  } catch (error) {
    console.error(error);
  }
});

// =========================================================SEND NEWS FROM ECONOMIST============================================================================
async function getAudioFileAxios(fileUrl, localFile) {
  //l??u ?? stream kh??ng h??? tr??j promise, c?? th??? d??ng pipeline ho???c c??ch sau. ref: https://stackoverflow.com/questions/55374755/node-js-axios-download-file-stream-and-writefile
  const writer = fs.createWriteStream(localFile);
  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  }).then((response) => {//ensure that the user can call `then()` only when the file has been downloaded entirely.
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


    let sayReturn =
      `${dataReturn.articleBodyCombined}\n
    Published: ${dataReturn.publishedDate}\n
    Link: ${dataReturn.randomLink}
    `;

    await getAudioFileAxios(dataReturn.audio, "economist_audio.mp3");
    let thecomment = `Luy???n t???p t???ng h???p v???i b???n tin audio \n\n *${dataReturn.headline}*`;


    const file = "economist_audio.mp3";

    const result = await client.files.upload({
      channels: channel9__vocabulary, //----> channels c?? s khi up load file
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
  async ({
    body,
    event,
    context,
    client,
    message,
    say
  }) => {
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
        text: "Ch??o m???ng b???n ?????n v???i *`VietSpeak`* ????????????\n\n 1) B???n c?? th??? gh?? k??nh <#C01BY57F29H>: ????? nghe b??i thu ??m c???a c??c vietspeaker. ????y c??ng l?? n??i duy nh???t b???n s??? *`????NG B??I`* thu c???a m??nh theo y??u c???u c???a t???ng task.\n\n 2) C??c k??nh <#C01BXLFCUP4>, <#C01CMFUGHUG>, <#C01BXSK7URZ> v?? <#C01BQUD8ALE> l?? n??i b???n *`XEM ?????`*.\n\n 3) B???n c?? c???n ph???i ????ng b??i ngay ??? task hi???n t???i? V???i c??c th??nh vi??n m???i gia nh???p, deadline c???a b???n s??? ??? task sau. B???n c??ng c?? th??? ????ng b??i nh??ng kh??ng b???t bu???c.????????????????????????\n\n 4) M???i task k??o d??i bao l??u? 10 ng??y. *`DEADLINE`* c??c task lu??n r??i v??o ng??y th??? 10, 20 v?? ng??y cu???i c??ng c???a th??ng, t??y t???ng th??ng.\n\n 5) T??i n??n thu ??m b???ng c??ch n??o? B???n n??n d??ng app ??i???n tho???i ho???c b???t k?? ph???n m???m n??o c?? th??? thu ??m ????? g???i file t???i k??nh 2. \n\n 6) B???n c?? th??? g???i file cho bot <@U01EVJFP0U8> ????? check ??i???m tr?????c khi g???i b??i. \n\n 7) Sau khi ????ng b??i tr??n <#C01BY57F29H>, b???n c???n *`NH???N X??T`* cho 2 b??i g???n nh???t, ????ng tr?????c b??i ????ng c???a b???n.\n\n 8) B???n nh??? ?????i t??n file theo ????ng form quy ?????nh ????? bot c?? th??? nh???n di???n v?? ph??n lo???i b??i d??? d??ng h??n. V?? d???: Ronaldo__Messi-task50-red-0109 (name-task-color-date_submitted).\n\n 9) B???n c??n c?? th??? ????ng b??i, t????ng t??c, 'ch??t ch??t' v???i c??c vietspeakers t???i c??c k??nh 7 -> 14. \n\n 10) B???n kh??ng n??n ????ng c??c b??i thu c???a m??nh li???n nhau, n??n c??ch nhau ??t nh???t 2 b??i thu ??m kh??c, ????? c??c th??nh vi??n c?? th??? nh???n x??t gi??p b???n \n\n Tui l?? <@U01HEMMPVK2>, b???n c?? th??? g???i tin nh???n ri??ng nh?? 'hi' ho???c 'help' t???i tui. Tui c???p nh???t t??nh h??nh th???i ti???t, tin t???c b???n ph????ng, gi??p tra t??? ??i???n, cung c???p truy???n c?????i, quote, truy???n ng???n t??? ?????ng ????????????! \n\n ?????ng ?????i c???a tui <@U01EVJFP0U8> c??ng gi??p b???n r???t nhi???u vi???c. B???n c?? th??? g???i 'help' t???i ???ng bot n??y ????? xem h?????ng d???n!",
      });
      console.log(result.ok);
    } catch (error) {
      console.error(error);
    }
  }
);

app.event(
  "app_mention",
  async ({
    body,
    event,
    context,
    client,
    message,
    say
  }) => {
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
        text: "H??? th???ng FAQ c???a *`VietSpeak`* ????????????\n\n 1) *`T??i c?? th??? gi???i thi???u link ????? b???n b?? ????ng k?? t???i ?????a ch??? n??o? `*.\n\n B???n c?? th??? gi???i thi???u ?????a ch???: https://vietspeak.org ho???c https://register.vietspeak.org \n\n 2) *`N???u ph???i ????ng k?? l???i, t??i c?? th??? s??? d???ng ?????a ch??? email c?? kh??ng?`* \n\n Okey nh??, mi???n l?? b???n v???n s??? h???u email ????. ???? \n\n 3) *`T??i c?? th??? s??? d???ng VietSpeak tr??n c??c h??? th???ng, n???n t???ng n??o ?`* \n\n B???n c?? th??? s??? d???ng app Slack t???i t??? Apple Store ho???c Google Play, ????ng nh???p b???ng t??i kho???n ???? ????ng k?? c??ng VietSpeak. ??a s??? c??c th??nh vi??n c???a VietSpeak c??n s??? d???ng n???n web v???i nh???ng tr???i nghi???m th?? v???. B???n c?? th??? truy c???p t???i https://slack.vietspeak.org. \n\n4) *`T??i ph???i l??m vi???c g?? b??y gi??? khi m???i tham gia VietSpeak?`* \n\n B???n c???n thu ??m, ????nh k??m file g???i t???i k??nh <#C01BY57F29H> theo deadline m???i task. B???n c??n ph???i nh???n x??t cho 2 b??i ????ng li???n k??? tr?????c b??i ????ng c???a b???n. \n\n 5) *`T??i c?? c???n ph???i ????ng b??i thu c???a m??nh ngay kh??ng khi deadline c???a task hi???n t???i ???? c???n k????`* \n\n V???i c??c th??nh vi??n m???i tham gia, deadline c???a b???n s??? ??? task k??? ti???p. B???n c?? th??? thu x???p ????? tham gia ngay task hi???n t???i n???u mu???n.????????????? \n\n 6) *`Ai s??? gi??m s??t vi???c ????ng b??i, thu b??i c???a t??i? `* \n\n H??? th???ng bot s??? t??? ?????ng gi??m s??t vi???c ????ng b??i c???a c??c th??nh vi??n, c?? th??? t??? ?????ng ????nh d???u c??c th??nh vi??n kh??ng n???p b??i. \n\n 7) *`T??i ???????c bi???t VietSpeak c?? h??? th???ng ????nh gi?? b??i ?????c b???ng AI?`* \n\n ????ng v???y, b??i ?????c c???a b???n s??? ???????c h??? th???ng bot ????nh gi?? ??i???m t??? ?????ng. ??i???m c??ng cao th?? kh??? n??ng b??i ?????c c???a b???n s??? ???????c ng?????i b???n x??? nghe c??ng d??? d??ng h??n. \n\n 8) *`T??i c?? th??? nh??? bot <@U01EVJFP0U8> ????nh gi?? b??i ?????c tr?????c khi ????ng l??n channel <#C01BY57F29H> hay kh??ng?`* \n\n Tuy???t v???i lu??n, b???n c?? th??? upload file v?? g???i ri??ng t???i bot ????? luy???n t???p, tr?????c khi g???i file cu???i c??ng l??n channel <#C01BY57F29H> \n\n 9) *`T??i c?? th??? tham gia nhi???u level m???i task ???????c hay kh??ng?`* \n\n Okey lu??n b???n nh??. Luy???n t???p ??? nhi???u level gi??p ch??ng ta ti???n b??? nhanh h??n. \n\n 10) *`T??i c???n li??n h??? v???i ai khi mu???n nh???n ???????c s??? h??? tr????`* \n\n B???n c?? th??? nh???n tin 'h' ho???c 'help' t???i bot n??y <@U01HEMMPVK2>. \n\n 11) *`C??c quy t???c ???ng x??? c???a VietSpeak ?`* \n\n a) Kh??ng th???o lu???n c??c n???i dung kh??ng ph?? h???p, kh??ng c?? ??ch cho ph???n l???n c??c th??nh vi??n: ch??nh tr???, t??n gi??o, v?? kh?? ?????n d?????c, gi???i t??nh, bu??n l???u... \n\n b) Kh??ng ????? k??ch, kh??ch b??c, coi th?????ng, khinh b??? c??c th??nh vi??n kh??c trong nh??m. Kh??ng s??? d???ng c??c t??? ng??? th?? l???u. Kh??ng s??? d???ng c??c c??ch h??nh v??n, h??nh ???nh mang t??nh th?? l???u. Kh??ng kh?? th??n thi???n v?? t??? t??? c???a Vi???t Speak c???n ???????c g??n gi???, v??, ch???c ch??ng ta ?????u c?? th??? ?????ng ??, r???ng n?? - c??i c???m gi??c ???y - kh??ng mi???n ph??, ho???c kh??ng mi???n ph?? m???t c??ch d??? d??i. N?? c???n ???????c b???o v???. \n\n c) M???i ng?????i ?????u b??nh ?????ng. Tuy nhi??n, c??c admin c?? tr??ch nhi???m qu???n tr??? v?? do ????, ???????c quy???n x??? l?? cho c??c tr?????ng h???p sai lu???t. \n\n d) Kh??ng qu???ng c??o. \n\n e) T???t c??? c??c tr?????ng h???p x??? l?? ?????u ???????c c??ng khai, nh??ng s??? kh??ng b??o tr?????c. \n\n f) ?????i ng?? qu???n tr??? hi???n t???i g???m Trung Hi???u, dvbui, Hieu Nguyen v?? William Shakehand \n\n g) N???u c?? th???c m???c, xin li??n h??? b???ng tin nh???n ho???c ????ng b??i h???i ????p ??? channel ph?? h???p.",
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
    const {
      audio,
      number,
      transcript
    } = await getSpelling(null);

    await getAudioFileAxios(audio, "audio.mp3")
    let welcomeMessageList = [
      "??????????????????????????????",
      "????????????",
      "???????????????????????????",
      "????????????",
      "????????????????????",
      "????????????????????????????",
      "????????????????????????????",
      "????????????????????????????????????",
      "????????????",
      "???????????????",
      "????????????",
      "????????????",
      "????????????",
      "?????????",
      "????????????????????????",
    ];

    let random = Math.floor(Math.random() * welcomeMessageList.length);
    let randomwelcomeMessageList = welcomeMessageList[random];

    let thecomment = `${randomwelcomeMessageList} - Luy???n t???p t???ng h???p c??ng Spelling bee s??? ${number}`;

    //let thecomment = `${randomwelcomeMessageList} - WELCOME TO c??u l???c b??? 3700 - spelling bee s??? ${number}`;

    const file = "audio.mp3";
    const result = await client.files.upload({
      channels: listenningChallengesChannel, //----> channels c?? s khi up load file
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
  const cong = /[??????]/g;
  result = result.replace(cong, `'`);
  const regex = /[.,?!":???-]/g;
  result = result.replace(regex, "");
  return result;
}

// ===========================================================SYNTAX C?? C???N MENTION==================================================
app.event(
  "app_mention",
  async ({
    body,
    event,
    context,
    client,
    message,
    say
  }) => {
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
      //   L???y message theo thread https://api.slack.com/methods/conversations.replies/test
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

    // Tr??? v???

    try {
      const questionID = await beeNumber();

      if (typeof questionID === "undefined") {
        console.log("C??u kh??ng c?? trong kho");
        return;
      }

      const {
        transcript
      } = await getSpelling(questionID);
      getMark = await checkMark(
        cleanText(textSubmission),
        cleanText(transcript)
      );
      getMark = Math.round(getMark * 100);
      let messageList = ["????????????", "Hi"];
      let firstMesssage;
      let endingMesssage;

      if (getMark === 100) {
        firstMesssage = messageList[0];
        endingMesssage = "????";
      } else {
        firstMesssage = messageList[1];
        endingMesssage = getMark;

        if (endingMesssage < 30) {
          return;
        }
      }

      let messageResult = `${firstMesssage} <@${user}>, ??i???m spelling bee s??? ${questionID} l??: ${endingMesssage}. Good news: b???n kh??ng c??n c???n mention Kiwi v?? t??? kh??a bee khi n???p b??i.`;

      const result = await client.chat.postMessage({
        channel: channel,
        thread_ts: thread_ts,
        text: messageResult,
      });

      //console.log(result);
      //console.log(`ts l?? ${ts}`)
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
        //Ch?? ??: Call the chat.delete method using the WebClient (clientUser v???i token user l?? admin thay v?? app client)
        const result = await clientUser.chat.delete({
          channel: channelId,
          ts: messageId,
          as_user: true,
        });

        //console.log(result);
        console.log(`messageId khi x??a l?? ${messageId}`);
        console.log(`??i???m s???: ${getMark}`);
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

////////////=================================SYNTAX M???I KH??NG C???N MENTION /=================================//////////////
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {
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

  let {
    channel_type,
    bot_id,
    parent_user_id
  } = message;

  if (typeof subtype !== "undefined") {
    console.log(`subtype l?? ${subtype}`);
    //kh??ng x??? l?? khi type l?? x??a
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

  // N???u l?? channel 8
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
      //   L???y message theo thread https://api.slack.com/methods/conversations.replies/test
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

    // Tr??? v???
    try {
      const questionID = await beeNumber();

      if (typeof questionID == "undefined") {
        return;
      }

      const {
        transcript
      } = await getSpelling(questionID);
      getMark = await checkMark(
        cleanText(textSubmission),
        cleanText(transcript)
      );
      getMark = Math.round(getMark * 100);
      let messageList = ["????????????", "Hi"];
      let firstMesssage;
      let endingMesssage;

      if (getMark === 100) {
        firstMesssage = messageList[0];
        endingMesssage = "????";
      } else {
        firstMesssage = messageList[1];
        endingMesssage = getMark;

        if (endingMesssage < 40) {
          return;
        }
      }

      let messageResult = `${firstMesssage} <@${user}>, ??i???m spelling bee s??? ${questionID} l??: ${endingMesssage}`;

      const result = await client.chat.postMessage({
        channel: channel,
        thread_ts: thread_ts,
        text: messageResult,
      });
      
    } catch (error) {
      console.error(error);
    }

    ////////////////////////X??a C??U TR??? L???I ///////////////////////////////

    if (typeof ts === "undefined") {
      return;
    }

    const messageId = ts;
    const channelId = channel;

    if (onlyHandlePublicEvent(channel_type) ||
      onlyHandleIfNotDeletingEvent(subtype)) {
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
        console.log(`messageId khi x??a l?? ${messageId}`);
        console.log(`??i???m s???: ${getMark}`);
      } catch (error) {
        console.error(error);
      }
    }
    if (getMark >= 90) {
      if (typeof cache.getKey(user) !== "undefined") {
        if (cache.getKey(user) < 50) {
          try {
            const result = await client.chat.postMessage({
              channel: user, // g???i cho user
              text: `Hello <@${user}>, m???c k?? g???i c???a b???n v???i <@U02N47DMKRR> ??ang l?? ${cache.getKey(
                user
              )} coin, th???p h??n threshold (50) khuy???n ngh???. \n\n Khi k?? g???i v???i <@U02N47DMKRR>, b???n c?? th??? nh???n ???????c m???c th?????ng 10 coin t??? ?????ng m???i l???n ?????t 100 ??i???m, ho???c b??? tr??? 1 coin m???i khi ??i???m tr??n 90 v?? ch??a ?????t 100. B???n kh??ng b??? tr??? coin khi d?????i 90 ??i???m. \n\n B???n c?? th??? k?? g???i b???ng c??ch so???n "trust <@U02N47DMKRR> 100" v?? g???i t???i <@U01EVJFP0U8> ????? k?? g???i 100 coin!`,
            });
            console.log(
              `D??? li???u t??? Cache , hi???n c?? ${cache.getKey(
                user
              )} coin-> Sent: y??u c???u k?? g???i t???i ${user}!`
            );
          } catch (error) {
            console.error(error);
          }
        } else {
          //n???u user l?? Vietspeakbot
          if (user == "U01EVJFP0U8") {
            return;
          }

          //th?????ng coin
          if (getMark === 100) {
            try {
              const result = await VietSpeakBankUser.chat.postMessage({
                channel: "U01EVJFP0U8", //g???i t???i vietspeak bot
                text: `give <@${user}> 10`,
                as_user: true,
              });

              console.log("???? t???ng coin! cho: " + user);
              //console.log(result);
            } catch (error) {
              console.error(error);
            }
          } else {
            // l???y coin

            let amountTaken = randomIndex(5) + 1;

            try {
              const result = await VietSpeakBankUser.chat.postMessage({
                channel: "U01EVJFP0U8", //g???i t???i vietspeak bot
                text: `take <@${user}> ${amountTaken}`,
                as_user: true,
              });

              console.log("???? l???y coin c???a: " + user);
            } catch (error) {
              console.error(error);
            }
          }
        }
      } else {
        // set cache ng?????i d??ng hi???n t???i
        let currentUser = {
          id: user,
          score: getMark
        };

        myCache.set("currentUser", currentUser);

        try {
          const result = await VietSpeakBankUser.chat.postMessage({
            channel: `G01C73RT1PH`, // channel api
            text: `check_trust <@${user}>`,
            as_user: true,
          });
          console.log("1188: Ko c?? trong cache, g???i check_trust: " + user);
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

    let checking = textMessage.includes("???? k?? g???i");

    if (!checking) {
      return;
    }

    let lastindex = textMessage.lastIndexOf(">");
    let firstindex = textMessage.indexOf("VS Coin");
    let trustAmount = textMessage.substring(lastindex + 1, firstindex);
    trustAmount = Number(trustAmount.trim());

    let userIndex = textMessage.indexOf("<@");
    let userChecked = textMessage.substring(userIndex + 2, userIndex + 13);

    //l??u v??o 2 cached
    myCache.set(userChecked, trustAmount);

    cache.setKey(userChecked, trustAmount);
    cache.save(true);
    console.log(
      `1266 -> ???? l??u ${userChecked} - ${trustAmount} v??o cache, d??? li???u t???  api channel`
    );

    return {
      trustAmount,
      userChecked
    };
  };

  if (getTrustValue(text)) {
    let deposit = getTrustValue(text);
    if (deposit.trustAmount < 50) {
      try {
        const result = await client.chat.postMessage({
          channel: deposit.userChecked, // g???i cho user
          text: `Hi <@${deposit.userChecked}>, m???c k?? g???i c???a b???n v???i <@U02N47DMKRR> ??ang l?? ${deposit.trustAmount} coin, th???p h??n threshold (50) khuy???n ngh???. \n\n Khi k?? g???i v???i <@U02N47DMKRR>, b???n c?? th??? nh???n ???????c m???c th?????ng 10 coin t??? ?????ng m???i l???n ?????t 100 ??i???m, ho???c b??? tr??? 1 coin m???i khi ??i???m tr??n 90 v?? ch??a ?????t 100. B???n kh??ng b??? tr??? coin khi d?????i 90 ??i???m. \n\n B???n c?? th??? k?? g???i b???ng c??ch so???n "trust <@U02N47DMKRR> 100" v?? g???i t???i <@U01EVJFP0U8> ????? k?? g???i 100 coin!`,
        });
        console.log(`Sent: y??u c???u k?? g???i t???i ${deposit.userChecked}!`);
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
            channel: "U01EVJFP0U8", //g???i t???i vietspeak bot
            text: `give <@${userCached.id}> 10`,
            as_user: true,
          });

          console.log("???? t???ng coin!");
        } catch (error) {
          console.error(error);
        }

        return;
      }

      // l???y coin v?? set new trust_check
      try {
        let amountTaken = randomIndex(5) + 1;

        const result = await VietSpeakBankUser.chat.postMessage({
          channel: "U01EVJFP0U8", //g???i t???i vietspeak bot
          text: `take <@${userCached.id}> ${amountTaken}`,
          as_user: true,
        });

        myCache.set(userCached.id, deposit.trustAmount - 1);

        console.log("???? l???y coin!");
        //console.log(result);
      } catch (error) {
        console.error(error);
      }
    }
  }

});

/*=============================================================trust_amount========================================================*/
app.event("message", async ({
  body,
  event,
  context,
  client,
  message
}) => {
  let {
    user,
    ts,
    text,
    channel,
    channel_type,
    subtype,
    thread_ts,
    bot_id
  } =
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

  // kh??ng l???ng nghe s??? ki???n x??a
  if (typeof subtype !== "undefined" && subtype === "message_deleted") {
    return;
  }

  const depositChange = (textMessage) => {
    if (typeof textMessage === "undefined") {
      return false;
    }

    textMessage = textMessage.trim();
    let kigui = textMessage.includes("v???a k?? g???i");

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
    let {
      sender,
      receiver,
      amount
    } = depositChange(text);

    if (typeof cache.getKey(sender) !== "undefined") {
      if (receiver != "U02N47DMKRR") {
        console.log(
          "1392: Kh??ng process v?? ng?????i receiver kh??ng ph???i Will, l?? : " +
          receiver
        );
        return;
      }

      let currentAmount = Number(cache.getKey(sender));

      cache.setKey(sender, currentAmount + amount);
      cache.save(true);
      console.log(
        `1410- C?? d??? li???u Cache: c?? ${currentAmount}, th??m v??o ${amount}`
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
          " 1423: Kh??ng c?? d??? li???u Cache, g???i request check_trust c???a: " +
          sender
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  //update khi tr??? coin
  const takeCoin = (textMessage) => {
    if (typeof textMessage === "undefined") {
      return;
    }

    textMessage = textMessage.trim();
    let take = textMessage.includes("???? ???????c chuy???n cho");

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
    let {
      sender,
      receiver,
      amount
    } = takeCoin(text);

    if (typeof cache.getKey(sender) !== "undefined") {
      let currentAmount = Number(cache.getKey(sender));
      cache.setKey(sender, currentAmount - amount);
      cache.save(true);
      console.log(
        `1460- C?? d??? li???u Cache: c?? ${currentAmount}, tr??? ??i ${amount}`
      );
    } else {
      try {
        const result = await VietSpeakBankUser.chat.postMessage({
          channel: `G01C73RT1PH`, // channel api
          text: `check_trust <@${sender}>`,
          as_user: true,
        });

        console.log(
          " 1465: Kh??ng c?? d??? li???u Cache khi tr???  coin, g???i request check_trust c???a: " +
          sender
        );
      } catch (error) {
        console.error(error);
      }
    }
  }
});


//==========================================================G???I TRANSCRIRIPT-==========================================================
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {
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

  //khi x??a s??? th??nh undefined, return ????? tr??nh l???i event khi x??a;
  if (typeof text == "undefined") {
    return;
  }

  // n???u kh??ng c?? thread_ts t???c l?? main message, kh??ng ph???i reply (c?? th???  d??ng subtype);

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
    //   L???y message theo thread https://api.slack.com/methods/conversations.replies/test
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
    console.log(`index l?? ${indexNumber} -> kh??ng ph???i b??i challenge`);
    return;
  }

  // Tr??? v???

  try {
    const questionID = await beeNumber();

    let {
      transcript
    } = await getSpelling(questionID);
    let transcriptClean = cleanText(transcript);
    const result = await client.chat.postMessage({
      channel: user,
      //   thread_ts: thread_ts,
      text: `Hi <@${user}>, transcript c???a spelling bee s??? ${questionID} l??: \n ${transcript} \n \n Transcript ???? ???????c chu???n h??a d??ng ????? t??nh ??i???m l??:  \n ${transcriptClean}`,
    });
  } catch (error) {
    console.error(error);
  }

  //   X??a thread_ts ???? mention @kiwi bee
  // The ts of the message you want to delete
  const messageId = ts;
  // The ID of the channel that contains the message
  const channelId = channel;

  try {
    //Ch?? ??: Call the chat.delete method using the WebClient (clientUser v???i token user l?? admin thay v?? app client)
    const result = await clientUser.chat.delete({
      channel: channelId,
      ts: messageId,
      as_user: true,
    });

    //console.log(result);
  } catch (error) {
    console.error(error);
  }

  //end of x??a
});


/*===================================================================SENDING IPA AUDIO==============================================================*/
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {
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

  //khi x??a s??? th??nh undefined, return ????? tr??nh l???i event khi x??a;
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
    //n???u kh??ng c??, tr??? v??? null
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

      // kh??ng g???i reply khi g???i tin nh???n cho ng?????i d??ng
      if (typeof channel_type !== "undefined" && channel_type === "im") {
        destination = user;
      }

      const file = `${__dirname}/data/audio/us/us/${words}.mp3`;

      if (!fs.existsSync(file)) {
        // kh??ng g???i reply khi g???i tin nh???n cho ng?????i d??ng
        if (typeof channel_type !== "undefined" && channel_type === "im") {
          const result = await client.chat.postMessage({
            channel: user,
            text: `Hi <@${user}>, hi???n ch??a c?? file audio c???a t??? ${words}. <@U01C3SA99FW> is notified. Sorry!`,
          });

          const notifyresult = await client.chat.postMessage({
            channel: `U01C3SA99FW`,
            text: `<@${user}> t??m audio t??? ${words} nh??ng kh??ng c?? trong h??? th???ng!!`,
          });

          return;
        }

        console.log("Kh??ng c?? file, t???: " + words);
        const result = await client.chat.postMessage({
          channel: channel,
          thread_ts: destination,
          text: `Hi <@${user}>, hi???n ch??a c?? file audio c???a t??? ${words}. <@U01C3SA99FW> is notified. Sorry!`,
        });

        const notifyresult = await client.chat.postMessage({
          channel: `U01C3SA99FW`,
          text: `<@${user}> t??m audio t??? ${words} nh??ng kh??ng c?? trong h??? th???ng!!`,
        });

        return;
      }

      const result = await client.files.upload({
        channels: channel, //----> channels c?? s khi up load file
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
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {
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

      // kh??ng g???i reply khi g???i tin nh???n cho ng?????i d??ng
      if (typeof channel_type !== "undefined" && channel_type === "im") {
        destination = user;
      }

      // kh??ng g???i reply khi g???i tin nh???n cho ng?????i d??ng
      if (typeof channel_type !== "undefined" && channel_type === "im") {
        const result = await client.chat.postMessage({
          channel: user,
          text: `Hi <@${user}>, s??? ng???u nhi??n trong kho???ng 0 t???i 100 c???a b???n l?? ${randomIndex(100) + 1
            }`,
        });

        return;
      }

      const result = await client.chat.postMessage({
        channel: channel,
        thread_ts: destination,
        text: `Hi <@${user}>, s??? ng???u nhi??n trong kho???ng 0 t???i 100 c???a b???n l?? ${randomIndex(100) + 1
          }`,
      });

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
});


//////////////////=================================///////////TRANSLATION//////////////////=================================//////////////
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {
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

  //khi x??a s??? th??nh undefined, return ????? tr??nh l???i event khi x??a;
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

  const translating = async (options = {
    source,
    target,
    words
  }) => {
    let {
      source,
      target,
      words
    } = options;

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
      data: [{
        text: words,
      },],
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

    // kh??ng g???i reply khi g???i tin nh???n cho ng?????i d??ng
    if (typeof channel_type !== "undefined" && channel_type === "im") {
      destination = user;
    }

    // kh??ng g???i reply khi g???i tin nh???n cho ng?????i d??ng
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
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {
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

  let {
    rhymes,
    alliterations
  } = rhymesVietSpeak(soundWord);

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

    // kh??ng g???i reply khi g???i tin nh???n cho ng?????i d??ng
    if (typeof channel_type !== "undefined" && channel_type === "im") {
      destination = user;
    }

    // kh??ng g???i reply khi g???i tin nh???n cho ng?????i d??ng
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
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {
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
    female: "vi-VN-HoaiMyNeural"
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

          // kh??ng g???i reply khi g???i tin nh???n cho ng?????i d??ng
          if (typeof channel_type !== "undefined" && channel_type === "im") {
            destination = user;
          }

          // kh??ng g???i reply khi g???i tin nh???n cho ng?????i d??ng
          if (typeof channel_type !== "undefined" && channel_type === "im") {
            const result = await client.files.upload({
              channels: channel, //----> channels c?? s khi up load file
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
            channels: channel, //----> channels c?? s khi up load file
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


//////////////=================================///////////////CHECK ??I???M S??? KHI REACT EMOJI ///////////////////////////=================================///////////////////////]

app.event("reaction_added", async ({
  event,
  context,
  say
}) => {
  let {
    type,
    user,
    item,
    reaction,
    item_user,
    event_ts
  } = event;

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

    let {
      ts,
      thread_ts
    } = result.messages[0];

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

      let {
        title,
        transcription,
        vtt,
        url_private
      } = fileDetail[0];

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
            transcribleText = `Hi <@${userWhoClick}>, transcribe succeeded. ????y l?? nh???ng g?? c??? *\`Slack\`* nghe ???????c t??? file t??? b??i c???a <@${item_user}> \n\n${transcriptResult} \n\n C??c t??? ???????c khuy???n ngh??? l?? n??n ???????c ch?? ?? h??n khi ph??t ??m: *\`${missingWords}\`* \n\n C??c t??? ???????c ph??t ??m nh??ng kh??ng c?? trong b??i: *\`${redundantWords}\`* \n\n ??i???m s??? : ${mark}`;
          } else {
            transcribleText = `Hi <@${userWhoClick}>, transcribe succeeded. ????y l?? nh???ng g?? c??? *\`Slack\`* nghe ???????c t??? file c???a <@${item_user}>:: \n\n${transcriptResult} \n\n `;
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

  let intialText = "???????????????????????? ???????????????????????????";

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
      //channels: channel, //----> channels c?? s khi up load file
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
rulePhonetics.hour = [
  6, 7, 8, 13, 14, 18, 19, 20, 21, 22,
];
// rule.date = [1, 11, 21];
rulePhonetics.tz = "Asia/Ho_Chi_Minh";

const jobPostPhonetics = schedule.scheduleJob(rulePhonetics, function () {
  postPhoneticChallenge();
});



/////////////////////////////TAOEBA PROJECT - CHECKING SUBMISION////////////////////////////////
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {
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

  //khi x??a s??? th??nh undefined, return ????? tr??nh l???i event khi x??a;
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
    // L???y message theo thread https://api.slack.com/methods/conversations.replies/test
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

      if (!textAudio.includes("???????????????????????? ???????????????????????????")) {
        return;
      }

      let left = textAudio.indexOf("?????? -") + 5;

      let right = textAudio.indexOf("\n");

      //console.log(x.slice(left, right))

      let numberIndex = textAudio.slice(left, right);

      let correctText = cleanTextToCompare(taoeba[numberIndex].text);

      let textSubmit = cleanTextToCompare(result.messages[1].text);

      let mark = stringSimilarity.compareTwoStrings(correctText, textSubmit);

      mark = Math.round(mark * 100);

      let messageList = ["????????????", "Hi"];
      let firstMesssage;
      let endingMesssage;

      if (mark === 100) {
        firstMesssage = messageList[0];
        endingMesssage = "????";
      } else {
        firstMesssage = messageList[1];
        endingMesssage = mark;

        if (endingMesssage < 30) {
          return;
        }
      }

      let messageResult = `${firstMesssage} <@${user}>, ??i???m phonetic challenge s??? ${numberIndex} l??: ${endingMesssage}.`;
      // https://api.slack.com/methods/chat.postMessage/test --> n???u g???i dm cho user, thay channel b???ng ID username U01C3SA99FW  (William)
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
          //Ch?? ??: Call the chat.delete method using the WebClient (clientUser v???i token user l?? admin thay v?? app client)
          const result = await clientUser.chat.delete({
            channel: channelId,
            ts: messageId,
            as_user: true,
          });

          //console.log(result);
          console.log(`messageId khi x??a l?? ${messageId}`);
          console.log(`??i???m s???: ${mark}`);
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
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {
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

  //khi x??a s??? th??nh undefined, return ????? tr??nh l???i event khi x??a;
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

  // L???y message theo thread https://api.slack.com/methods/conversations.replies/test
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
        //Ch?? ??: Call the chat.delete method using the WebClient (clientUser v???i token user l?? admin thay v?? app client)
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
  async ({
    body,
    event,
    context,
    client,
    message,
    say
  }) => {
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

    //   bi???n text c?? s???n t??? app.event
    let textSubmission = text.trim().toLowerCase();
    //textSubmission = textSubmission.split("transcript");
    //textSubmission = textSubmission[1];

    async function beeNumber() {
      //   L???y message theo thread https://api.slack.com/methods/conversations.replies/test
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
      let {
        transcript
      } = await getSpelling(questionID);
      let transcriptClean = cleanText(transcript);

      // https://api.slack.com/methods/chat.postMessage/test --> n???u g???i dm cho user, thay channel b???ng ID username U01C3SA99FW  (William)

      const result = await client.chat.postMessage({
        channel: user,
        //   thread_ts: thread_ts,
        text: `Hi <@${user}>, transcript c???a spelling bee s??? ${questionID} l??: \n ${transcript} \n \n Transcript ???? ???????c chu???n h??a d??ng ????? t??nh ??i???m l??:  \n ${transcriptClean}`,
      });
    } catch (error) {
      console.error(error);
    }

    //   X??a thread_ts ???? mention @kiwi bee
    // The ts of the message you want to delete
    const messageId = ts;
    // The ID of the channel that contains the message
    const channelId = channel;

    try {
      //Ch?? ??: Call the chat.delete method using the WebClient (clientUser v???i token user l?? admin thay v?? app client)
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

app.action("block_actions", async ({
  ack
}) => {
  await ack();

  console.log("testing action click on button");

});


app.event("message",
  async ({
    body,
    event,
    context,
    client,
    message
  }) => {
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


    if (onlyHandleIfIM(channel_type) ||
      onlyHandleIfNotDeletingEvent(subtype)
    ) {
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
	]`

    try {
      const result = await client.chat.postMessage({
        channel: user,
        text: "hello world",
        blocks: blockContent
      });
    } catch (error) {
      console.error(error);
    }
  }
);



// ===================================================ENDING TASK===============================================

function getRandomQuoteEndingTask(Randomeindex) {
  return `Quote for another chapter of VietSpeak: _${quote[Randomeindex].quoteText}_ - *${quote[Randomeindex].quoteAuthor}*`;
}

async function postMessageEndingTask() {

  let task_minus = getCurrentTask(currentTimeStamp()) - 1;

  let dataSentObject = {
    text: " *`=======????????????TASK ENDED????????????=======`* \nNh???ng b??i n???p sau thanh n??y s??? t??nh l?? kh??ng n???p b??i cho task " +
      task_minus +
      " ????????????. \n\n" +
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
  async ({
    body,
    event,
    context,
    client,
    message,
    say
  }) => {
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
        channels: channel, //----> channels c?? s khi up load file
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
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {
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

  //khi x??a s??? th??nh undefined, return ????? tr??nh l???i event khi x??a;
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


  let linkAPI = `https://api.vietspeak.org/v1/task/transcript.php`;

  const response = await axios.get(linkAPI);

  let task_number_tracking = getCurrentTask(currentTimeStamp());

  const currentTranscript = response.data.find((element) => element.fields.task_number == task_number_tracking);


  let outputTranScript = currentTranscript.fields[textSubmission];

  if (typeof outputTranScript === "undefined") {
    outputTranScript = "Hi???n ch??a c?? transcript m?? b???n ??ang y??u c???u."
  }

  try {
    //  app.client.conversations.replies

    await later(2000);

    const result = await client.chat.postMessage({
      channel: channel,
      thread_ts: ts,
      text: outputTranScript
    });

    console.log(result.ok);


    await later(2000);

    //Deleting the keyword people type    
    const deleting_result = await clientUser.chat.delete({
      channel: channel,
      ts: ts,
      as_user: true,
    });

    console.log(`Adding the transcript by ${user}`);

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
    _id: documentId
  };
  insertData.user = documentCreated


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


app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {
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
    let userId = '';

    usersArray.forEach(function (user) {
      userId = user["id"];
      usersStore[userId] = {};
      usersStore[userId].name = user["name"]
      usersStore[userId].slackId = userId
      usersStore[userId].real_name = user["profile"]["real_name"];
      usersStore[userId].deleted = user["deleted"]
      usersStore[userId].last_time_deactivated = user["updated"]
      usersStore[userId].following = []
      usersStore[userId].followers = []
      usersStore[userId].anonymous = "me_" + nanoid();
      usersStore[userId].changeanonymous = false;
      usersStore[userId].backup = false;
      usersStore[userId].saveme = false;
    });

  }

  try {

    async function getUserList() {
      let resultList = []
      let condition = false;

      let x = 0;
      do {
        x++;

        console.log(x)

        if (condition === false) {
          const result = await client.users.list({
            limit: 1000
          })

          resultList.push(result.members);
          condition = result.response_metadata.next_cursor ?? false;

        } else {

          const result = await client.users.list({
            cursor: condition,
            limit: 1000
          })
          resultList.push(result.members);


          condition = result.response_metadata.next_cursor ?? false;
        }

      } while (condition != false);

      return resultList;
    }

    let resultUser = await getUserList();
    resultUser = resultUser.flat();
    saveUsers(resultUser);
    await createDbAndDoc("users", "vietspeak_user", usersStore)

    console.log("Save users to the Cloudant")

  } catch (error) {
    console.error(error);
  }

});

/*======================================= UPDATING USER EVENT  =====================================================*/
app.event("user_change", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {

  let {
    id,
    deleted,
    real_name,
    name,
    updated

  } = event.user;

  let sayReturn;

  if (deleted) {
    sayReturn = "disabled: " + id + " - " + name
  } else {
    sayReturn = "activate " + id + " - " + name + " - " + real_name
  }

  const updatingVietSpeakUser = async (dbName, docID, userID) => {
    try {

      const document = (
        await clientcloudant.getDocument({
          docId: docID,
          db: dbName,
        })
      ).result;

      let {
        user
      } = document;
      if (user.hasOwnProperty(userID)) {
        document.user[userID].deleted = deleted;
        document.user[userID].last_time_deactivated = updated;
        if (deleted == false) {
          document.user[userID].real_name = real_name
        }

        document._rev = (
          await clientcloudant.postDocument({
            db: dbName,
            document, // _id and _rev MUST be inside the document object
          })
        ).result.rev;
        console.log("=========== UPDATING USER IN THE DATABASE: ===========: " + userID + " - " + real_name);
      } else {
        let real_name_property = real_name ?? name
        document.user[userID] = {}
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
        console.log("=========== CREATING NEW USER IN THE DATABASE: ===========" + userID + " - " + real_name)
      }

    } catch (err) {
      if (err.code === 404) {
        console.log(
          `Cannot update document because either "${dbName}" database or the "document" ` + `document was not found.`
        );
      }
    }
  }

  try {
    await updatingVietSpeakUser("users", "vietspeak_user", id)
    const result = await client.chat.postMessage({
      channel: 'U01C3SA99FW',
      text: sayReturn,
    });
    console.log(result.ok);

  } catch (error) {
    console.error(error);
  }

});

/*======================================= ABOUT ME =====================================================*/
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {
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
      db: dbName
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
    const {
      result
    } = documentAboutZebra;

    console.log(result.user[userID]);

    return result.user[userID]

  };

  try {

    let aboutMe = await getInfoFromExistingDatabase(user);

    let followingList = aboutMe.following;
    
    let follower = aboutMe.followers;
    
    let volunteer = aboutMe.volunteer;
    
    if (volunteer == true) {
      volunteer = `\n\nB???n c?? thu???c nh??m volunteer hay kh??ng? C??.`
    } else {
      volunteer = `\n\nB???n c?? thu???c nh??m volunteer hay kh??ng? Kh??ng. So???n "volunteer" v?? g???i t???i Kiwi ????? tham gia t??nh nguy???n gi??p ????? c??c b???n kh??c!`
    }
    
    if (followingList.length > 0) {
      followingList = followingList.map((e) => `<@${e}>`)

      followingList = `\n\nB???n ??ang follow ${followingList.length} ng?????i: ${followingList.join(", ")}`
    } else {
      followingList = "\n\nFollowing: 0. H??y so???n follow v?? mention ng?????i b???n mu???n follow. So???n unfollow v?? mention n???u mu???n d???ng follow ai ????.";
    }

    if (follower.length > 0) {
      follower = `\n\nB???n ??ang c?? ${follower.length} followers.`
    } else {
      follower = "\n\nFollower: 0"
    }

    let updateandanh = aboutMe.changeanonymous ? "" : `\n\nB???n c?? th??? thay ?????i id ???n danh c???a m??nh *\`M???T L???N\`* b???ng c??ch so???n me_yourid v?? g???i t???i KIWI! Ch?? ?? yourid c???n nhi???u h??n 4 k?? t??? v?? ??t h??n 40 k?? t???, kh??ng vi???t hoa, kh??ng c?? d???u ti???ng Vi???t, kh??ng kho???ng c??ch gi???a c??c k?? t???, c?? th??? d??ng s??? v?? ch???`

    let textOutput = `Hello <@${user}> \n\nT??n hi???n th??? c???a b???n l??: *\`${aboutMe.real_name}\`* \n\n ID ???n danh c???a b???n l??: *\`${aboutMe.anonymous}\`* ${updateandanh} ${followingList} ${follower} ${volunteer}`
    const result = await client.chat.postMessage({
      channel: user,
      text: textOutput,
    });
  } catch (error) {
    console.error(error);
  }

});

/*======================================= UPDATING ANONYMOUS ID  =====================================================*/
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {

  let {
    text,
    user,
    channel_type
  } = message;

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

      let {
        user
      } = document;

      let listofID = [];

      for (let u in user) {
        listofID.push(user[u].anonymous)
      }

      if (user.hasOwnProperty(userID)) {

        if (user[userID].changeanonymous == true) {

          handle = user[userID].anonymous;

        } else {

          if (arrayText[1].length < 1) {
            error = true;
            errorMessage = "B???n ch??a nh???p id sau me_";
            handle = false;
            return;
          }
          if (arrayText[1].length < 4 || arrayText[1].length > 40) {
            error = true;
            errorMessage = "ID sau me_ c???n c?? t??? 4 k?? t??? tr??? l??n v?? kh??ng d??i qu?? 40 k?? t???";
            handle = false;
            return;
          }
          if (!allowingString(arrayText[1])) {
            error = true;
            errorMessage = "ID sau me_c???a b???n kh??ng ???????c ch???a kho???ng tr???ng, ti???ng Vi???t c?? d???u ho???c k?? t??? l??? ngo???i t??? - v?? _";
            handle = false;
            return;
          }
          if (listofID.includes(text) == true) {
            console.log("c?? tr??ng")
            error = true;
            errorMessage = "ID b???n v???a ch???n ???? c?? ng?????i s??? d???ng"
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
        console.log("=========== UPDATING annonymous ID IN THE DATABASE: ===========: " + userID + " - ");
      }

      return handle;

    } catch (err) {
      if (err.code === 404) {
        console.log(
          `Cannot update document because either "${dbName}" database or the "document" ` + `document was not found.`
        );
      }
    }
  }

  try {
    let sayReturn;
    let waithandle = await updatingPrivateID("users", "vietspeak_user", user);
    if (waithandle !== false) {
      sayReturn = "ID ???n danh c???a b???n ???? ???????c thi???t l???p  : " + waithandle
    } else {

      if (error) {
        sayReturn = errorMessage
      } else {
        sayReturn = "ID ???n danh m???i c???a b???n l?? :" + text
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
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {

  let {
    text,
    user,
    channel_type
  } = message;

  // if(development(user, event)) return;

  if (onlyHandleIfIM(channel_type)) return;

  if (typeof text === "undefined") return;


  function validateAndGetFollowList(str) {
    let lowercase = str.trim().toLowerCase()
    const userToFollow = []
    if (!lowercase.includes("unfollow")) {
      if (!lowercase.includes("follow")) {
        return false;
      } else {
        userToFollow.push("follow")
      }
    } else {
      userToFollow.push("unfollow")
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
      })
      return userToFollow;
    } else {
      return false
    }

  }

  if (validateAndGetFollowList(text) === false) return;

  let error = false;
  let errorMessage;
  let currentList;
  let resultDisplay = {}

  const updatingFollower = async (dbName, docID, userID) => {
    try {

      const document = (
        await clientcloudant.getDocument({
          docId: docID,
          db: dbName,
        })
      ).result;

      let {
        user
      } = document;

      if (user.hasOwnProperty(userID)) {
        let listToFollow = validateAndGetFollowList(text);
        const firstElement = listToFollow.shift();
        currentList = user[userID].following;

        if (firstElement === "follow") {
          let listNotification = []

          listToFollow.forEach((e) => {
            if (!currentList.includes(e)) {
              user[userID].following.push(e)
              user[e].followers.push(user[userID].slackId)

              listNotification.push(user[e])
            }

          })

          listNotification.forEach(async function (each) {
            try {

              let saying = "B???n v???a c?? m???t follower m???i tr??n VietSpeak"
              const result = await client.chat.postMessage({
                channel: each.slackId,
                text: saying,
              });
              console.log(result.ok);

            } catch (error) {
              console.error(error);
            }

          })

        } else {
          let listtodelete = []
          currentList.forEach((e, index) => {
            listToFollow.forEach((each) => {
              if (e == each) {
                listtodelete.push(index)
              }
            })
          })

          let originalList = [...currentList]
          for (let i = listtodelete.length - 1; i >= 0; i--) {
            currentList.splice(listtodelete[i], 1);
          }

          listToFollow.forEach((e) => {
            console.log(user[e].followers)
            let indexRemove = user[e].followers.indexOf(userID);
            user[e].followers.splice(indexRemove, 1)
            console.log(user[e].followers)
          })

        }

        resultDisplay.total = currentList.length

        document._rev = (
          await clientcloudant.postDocument({
            db: dbName,
            document, // _id and _rev MUST be inside the document object
          })
        ).result.rev;


        console.log("=========== UPDATING FOLLOWING IN THE DATABASE: ===========: " + userID + " - ");
      }
      return resultDisplay;

    } catch (err) {
      if (err.code === 404) {
        console.log(
          `Cannot update document because either "${dbName}" database or the "document" ` + `document was not found.`
        );
      }
    }
  }

  try {
    let waithandle = await updatingFollower("users", "vietspeak_user", user);
    let saying = "B???n ??ang follow " + waithandle.total + " ng?????i";
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
    let filter = level.filter((e) => title.includes(e))
    if (filter.length === 1) {
      return filter[0]
    }

  }

  if (typeof text !== "undefined") {
    text = text.trim().toLowerCase();
    let filter = level.filter((e) => text.includes(e))
    if (filter.length === 1) {
      return filter[0]
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
    console.log("document existing")
    return true;

  } catch (err) {
    if (err.code === 404) {
      return false;
      console.log(
        `there is no document with id: ` + documentID
      );
    }
  }
};


const tracking_createOrupdateDocIfExist = async (dbName, docID, user, dataUpdate = {}) => {
  try {
    const document = (
      await clientcloudant.getDocument({
        docId: docID,
        db: dbName,
      })
    ).result;

    let {
      userSumitted
    } = document;

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
      console.log("ng?????i ???? n???p b??i")

    } else {

      document.userSumitted[user] = {}
      document.userSumitted[user].level = [dataUpdate[user].level[0]]

      console.log(document.userSumitted[user])

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
}

const tracking_createNewTask = async (dbName, task_id, documentCreated = {}) => {
  try {

    let insertData = {
      _id: task_id
    };
    insertData.userSumitted = documentCreated

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
}

app.event("message", async ({
  body,
  event,
  context,
  client,
  message
}) => {
  let {
    subtype,
    files,
    thread_ts
  } = event;
  let {
    user,
    ts,
    text,
    channel,
    channel_type
  } = message;

  if (typeof channel_type === "undefined") {
    console.log("kh??ng c?? channel_type");
    return;
  }

  //if(development(user, event)) return;
  if (onlyHandleMainThreadEvent(thread_ts) ||
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

  let task_existing = await checkIfDocumentExisting("tracking", taskNumber)
  let dataUpdate = {}
  dataUpdate[user] = {}

  let levelStore = {};

  levelStore[color] = currentTimeStamp()

  dataUpdate[user].level = [levelStore]

  if (task_existing) {
    await tracking_createOrupdateDocIfExist("tracking", taskNumber, user, dataUpdate)
  } else {
    await tracking_createNewTask("tracking", taskNumber, dataUpdate);
  }

});

/*================================================================= COMMON SHARED FUNCTION USED WITH CLOUDANT  ===================================================================*/
async function gettingDocsFromDatabase(dbName, docID) {
  const getDocParams = {
    db: dbName,
    docId: docID
  };
  const documentAboutZebra = await clientcloudant.getDocument(getDocParams);
  const {
    result
  } = documentAboutZebra;
  return result;
}

async function getUserDatabase(userId) {
  let list = await gettingDocsFromDatabase("users", "vietspeak_user")
  return list.user[userId]
}

/*=================================================================VERIFYING USER'S SUBMISION  ===================================================================*/

app.event("message", async ({
  body,
  event,
  context,
  client,
  message
}) => {
  let {
    subtype,
    files,
    thread_ts
  } = event;

  let {
    user,
    ts,
    text,
    channel,
    channel_type
  } = message;

  if (typeof channel_type === "undefined") {
    console.log("kh??ng c?? channel_type");
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

  await gettingDocsFromDatabase("users", "vietspeak_user")


});


/*==============================================================RANK, REPORT AND WARNING ABOUT THE DEADLINE ========================================================*/
async function getUserChannel(channelNumber) {
  const result = await client.conversations.members({
    channel: channelNumber,
    limit: 1000
  });

  let members = result.members;
  let cursor = result.response_metadata.next_cursor;
  console.log("cusor: " + cursor)

  return members;
}

async function getListPosters(beginning, ending) {
  let channelId = "C01BY57F29H"
  let resultList = []
  let condition = false;
  do {
    if (condition === false) {
      const result = await client.conversations.history({
        oldest: beginning,
        latest: ending,
        channel: channelId
      });
      resultList.push(result.messages);
      condition = result.response_metadata.next_cursor ?? false;

    } else {
      const result = await client.conversations.history({
        oldest: beginning,
        latest: ending,
        channel: channelId,
        cursor: condition
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
      let followerCount = {}
      followerCount[activeUser.user[u].slackId] = activeUser.user[u].followers.length
      topFollower.push(followerCount)
    }
  }
  topFollower.sort(function (a, b) {
    return Object.values(b) - Object.values(a);
  })
  let originaltopFollower = [...topFollower];
  topFollower = topFollower.slice(0, 10)

  originaltopFollower.forEach((e) => {
    if (Object.values(e) == Object.values(topFollower[topFollower.length - 1])[0]) {
      topFollower.push(e)
    }
  })
  topFollower = [...new Set(topFollower)] //remove duplicate
  topFollower = topFollower.map((e, index) => `${index + 1}. <@${Object.keys(e)}>: ${Object.values(e)}`)
  topFollower = `\n\n Top *\`followers\`*: \n\n${topFollower.join("\n")}`
  return topFollower;
}

async function getListofVolunteer() {
  let activeUser = await gettingDocsFromDatabase("users", "vietspeak_user");
  
  let topVolunteer = [];
  
  for (let u in activeUser.user) {
    if (activeUser.user[u].volunteer === true) {
      topVolunteer.push(activeUser.user[u].slackId)
    }
  }
  
  topVolunteer = topVolunteer.map((e, index) => `${index + 1}. <@${e}>`)
  topVolunteer = `\n\n Danh s??ch *\`volunteer\`*: \n\n${topVolunteer.join("\n")}`
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
    let volunteerList = await getListofVolunteer()
    
    let channel00_Announcement = `C01BY4ZQ7TM`;
    let currentTaskNow = getCurrentTask(currentTimeStamp());
    let beginning, ending;
    let listMising = true;

    if (typeof taskNumber === "undefined" || taskNumber > currentTaskNow || taskNumber < 68) {
      taskNumber = currentTaskNow
    }

    if (Number(currentTaskNow) !== Number(taskNumber)) {
      beginning = getTimeStampFromTaskNumber(taskNumber).beginning
      ending = getTimeStampFromTaskNumber(taskNumber).ending
      currentTaskNow = taskNumber

    } else {
      beginning = getBeginningAndEndingTask(currentTimeStamp()).beginning;
      ending = getBeginningAndEndingTask(currentTimeStamp()).ending;
    }

    let list = await getListPosters(beginning, ending);
    list = list.flat()
    let postByUsers = list.filter((e) => typeof e.files !== "undefined");
    /* User*/
    let usersList = postByUsers.map((e) => e.user);

    /* ===============Not submitted ===============*/
    let memberInChannel = await getUserChannel("C01BY57F29H");
    memberInChannel = memberInChannel.filter((e) => {
      let notcheck = ["U01EVJFP0U8", "U01HEMMPVK2", "U02K40CRMFB", "U02N7T5PRRS", "U01DS209G1Y", "U01CYMZM3FV", "U02N47DMKRR", "U02PQ7A3YB0", "U01D4RB4EHM"]
      for (b of notcheck) {
        if (b === e) return false;
      }
      return true;
    })

    let uniqueUsers = [...new Set(usersList)];
    let notsubmitted = memberInChannel.filter(x => !uniqueUsers.includes(x));
    let totalnotsubmitted = notsubmitted.length;
    notsubmitted = notsubmitted.map((e) => `<@${e}>`);
    notsubmitted = listMising ? `Danh s??ch ${totalnotsubmitted} qu?? kh??ch *\`l??? xe\`*:  ${notsubmitted.join(", ")}` : ''

    /*===============c?? t???m===============*/
    let rsorted = findDuplicatedandCount(usersList)
    let top4 = [];
    let top3 = [];
    let top2 = [];
    for (let item in rsorted) {
      if (rsorted[item] >= 4) {
        top4.push(item)
      }
      if (rsorted[item] === 3) {
        top3.push(item)
      }
      if (rsorted[item] === 2) {
        top2.push(item)
      }
    }

    top4 = top4.map(e => `<@${e}>`)
    top3 = top3.map(e => `<@${e}>`)
    top2 = top2.map(e => `<@${e}>`)

    top4 = top4.length > 0 ? `\n\nTop *\`c?? T???m\`* ch??m ch??? 4 m??u: ${top4.join(", ")}` : ""
    top3 = top3.length > 0 ? `\n\nTop *\`ong ?????t\`* t???o t???n 3 m??u: ${top3.join(", ")}` : ""
    top2 = top2.length > 0 ? `\n\nTop *\`ki???n c??ng\`* ch???u kh?? 2 m??u: ${top2.join(", ")}` : ""

    /* =======================================================*/
    // sorting array and keep the original index https://stackoverflow.com/questions/44613846/how-to-keep-array-indexvalue-after-sorting
    function sortAndKeepIndex(numArray) {
      let mapped = numArray.map(function (el, i) {
        return {
          index: i,
          value: el
        };
      })
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
        start = 0
      }

      mapped = mapped.slice(start, mapped.length)
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
    topReactionIndex = topReactionIndex.map((e, i) => `${i + 1}. <@${usersList[e.index]}> : ${e.value} reactions`);
    topReactionIndex = `Top 10 b??i ???????c *\`quan t??m\`* nh???t: \n\n ${topReactionIndex.join("\n")}`

    /*===============Reply counting===============*/
    let reply_count = postByUsers.map((e) => e.reply_count);
    let reply_countIndex = sortAndKeepIndex(reply_count);
    reply_countIndex = reply_countIndex.map((e, i) => `${i + 1}. <@${usersList[e.index]}> : ${e.value} comments`);
    reply_countIndex = `Top 10 b??i ???????c *\`b?? t??m\`* nh???t: \n\n ${reply_countIndex.join("\n")}`

    /*===============Reply reply_users===============*/
    let reply_users = postByUsers.map((e) => e.reply_users);
    reply_users = reply_users.flat();

    const counts = {};
    reply_users.forEach(function (x) {
      counts[x] = (counts[x] || 0) + 1;
    });
    const arrayList = Object.entries(counts)
    arrayList.sort(function (a, b) {
      return b[1] - a[1];
    });

    // filter bots
    let arrayListFilter = arrayList.filter((e) => {
      let bot = ["U01EVJFP0U8", "U01HEMMPVK2", "U02K40CRMFB", "U02N7T5PRRS", "U01CYMZM3FV", "U01DS209G1Y", "U01D4RB4EHM"]
      for (b of bot) {
        if (b == e[0]) return false;
      }
      return true;
    })

    let chimse = arrayListFilter.slice(0, 10);
    let niceComments = chimse.map((e, i) => `${i + 1}. <@${e[0]}> : comment gi??p ${e[1]} b???n`);
    niceComments = `Top 10 *\`chim s???\`* ??i n???ng: \n\n ${niceComments.join("\n")}`

    /*===============m??o l?????i===============*/
    let lazyCat = arrayListFilter.filter((e) => e[1] < 2);
    lazyCat = lazyCat.map((e, i) => `<@${e[0]}>`);
    lazyCat = `Top *\`m??o l?????i\`* ph??i n???ng d?????i 2 comment: ${lazyCat.join(", ")}`

    /*===============qu??i x???===============*/
    let earlyBirdUser = postByUsers.filter((e) => e.ts <= Number(beginning) + 86400);
    earlyBirdUser.reverse();
    earlyBirdUser = earlyBirdUser.map((e) => `<@${e.user}>`)
    earlyBirdUser = `Top *\`qu??i x??? \`* t???c ?????: ${earlyBirdUser.join(", ")}`

    /*===============???c s??n===============*/
    let lateBirdUser = postByUsers.filter((e) => e.ts >= Number(ending) - 10800);
    lateBirdUser.reverse();
    lateBirdUser = lateBirdUser.map((e) => `<@${e.user}>`)
    lateBirdUser = lateBirdUser.length > 0 ? `\n\nTop *\`???c s??n\`* k???t xe: ${lateBirdUser.join(", ")}` : "";
    let decorationText = `*?????????: *?????????????????????????????????* *:?????????*:?????????*`;

    let sayReturn = `${decorationText} ${topFollowerDisplay}\n\n ${volunteerList} ${postByUsers.length} l?? s??? *\`b??i ????ng\`* c???a ${uniqueUsers.length}/${memberInChannel.length} t???ng s??? th??nh vi??n trong task ${currentTaskNow}. ${top4}${top3}${top2}\n\n ${topReactionIndex}\n\n ${reply_countIndex}\n\n ${niceComments}\n\n ${lazyCat}\n\n ${earlyBirdUser}  ${lateBirdUser}\n\n${notsubmitted}`

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

app.event("message", async ({
  body,
  event,
  context,
  client,
  message
}) => {
  let {
    subtype,
    files,
    thread_ts
  } = event;

  let {
    user,
    ts,
    text,
    channel,
    channel_type
  } = message;

  if (typeof channel_type === "undefined") {
    return;
  }

  if (typeof text === "undefined") return;
  text = text.trim().toLowerCase().split(" ").filter((e) => e.length > 0)
  if (text.length >= 3) return;
  if (text[0] !== "rank") return;
  
//   if (development(user, event)) return;
    console.log(user + " is checking rank");

  if (onlyHandleIfIM(channel_type) ||
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
  postReportTaskList(channel00_Announcement, previousTask)
});

/*======================================================== WARNING ABOUT THE DEADLINE ==================================================*/
async function postWarningList() {
  let currentTask = getCurrentTask(currentTimeStamp());
  let timetable = getTimeStampFromTaskNumber(currentTask);
  let beginning = timetable.beginning;
  let ending = timetable.ending;

  let list = await getListPosters(beginning, ending);
  list = list.flat()
  let postByUsers = list.filter((e) => typeof e.files !== "undefined");
  let usersList = postByUsers.map((e) => e.user);

  /* ===============Not submitted ===============*/
  let memberInChannel = await getUserChannel("C01BY57F29H");
  memberInChannel = memberInChannel.filter((e) => {
    let notcheck = ["U01EVJFP0U8", "U01HEMMPVK2", "U02K40CRMFB", "U02N7T5PRRS", "U01DS209G1Y", "U01CYMZM3FV", "U02N47DMKRR", "U02PQ7A3YB0", "U01D4RB4EHM"]
    for (b of notcheck) {
      if (b === e) return false;
    }
    return true;
  })

  let uniqueUsers = [...new Set(usersList)];
  let notsubmitted = memberInChannel.filter(x => !uniqueUsers.includes(x));
  let totalnotsubmitted = notsubmitted.length;
  notsubmitted = notsubmitted.map((e) => `<@${e}>`);

  notsubmitted = `*\`*===**-^^WARNING^^-**===*\`*\n\n Danh s??ch ${totalnotsubmitted} qu?? kh??ch *\`k???t xe\`* ch??a n???p b??i task ${currentTask}: \n\n ${notsubmitted.join(", ")} \n\n C??c b???n c??n 6 gi??? ?????ng h??? ????? thu v?? n???p b??i ho??n th??nh task ${currentTask}. \n\n Ch??c c??c b???n s???m v??? ????ch d?? tr???i n???ng hay m??a, ch???c l?? Internet v???n ch???y`;
  return notsubmitted;
}

const ruleReportWarning = new schedule.RecurrenceRule();
ruleReportWarning.second = 0;
ruleReportWarning.minute = [0];
ruleReportWarning.hour = [18];
ruleReportWarning.date = [10, 20, getTheLastDayOfTheMonth()];
ruleReportWarning.tz = "Asia/Ho_Chi_Minh";

const jobruleReportWarning = schedule.scheduleJob(ruleReportWarning, async function () {
  //channel1:  G01BPHWQ023 //will U01C3SA99FW 
  let channel00_Announcement = `C01BY4ZQ7TM`;
  try {
    let sayReturn = await postWarningList()

    const result = await app.client.chat.postMessage({
      channel: channel00_Announcement,
      text: sayReturn,
    });
    console.log("warning: " + result.ok);

  } catch (error) {
    console.error(error);
  }
});

/*=================================================================NOTIFY FOLLOWER =============================================================*/
app.event("message", async ({
  body,
  event,
  context,
  client,
  message
}) => {
  let {
    subtype,
    files,
    thread_ts
  } = event;
  //console.log(event);
  let {
    user,
    ts,
    text,
    channel,
    channel_type
  } = message;

  if (onlyHandleMainThreadEvent(thread_ts) ||
    onlyHandlePublicEvent(channel_type) ||
    onlyHandleIfUploadFile(files) ||
    onlyHandleIfNotBot(user) ||
    onlyHandleChannel2(channel) ||
    onlyHandleIfNotDeletingEvent(subtype)
  ) {
    return;
  }

  let {
    name,
    title,
  } = files[0];

  let color = getLevel(title, text);
  if (color === "unknown") {
    color = ""
  }

  async function getMessageLink() {
    try {
      const resultLink = await client.chat.getPermalink({
        channel: channel,
        message_ts: ts
      });
      return resultLink;
    } catch (error) {
      console.error(error);
    }

  }

  let { permalink } = await getMessageLink();
  let currentTaskNow = getCurrentTask(currentTimeStamp());
  let userInfo = await getUserDatabase(user);

  let followerList = userInfo.followers;
  if (followerList.length > 0) {
    followerList.forEach(async function (eachFollower) {
      let outputText = `Hi <@${eachFollower}>, <@${user}> m???i ????ng b??i thu ??m ${color} task ${currentTaskNow}. \n\n ${permalink}`;
      try {
        const result = await client.chat.postMessage({
          channel: eachFollower,
          text: outputText,
        });
      } catch (error) {
        console.error(error);
      }

    })
  }
});


/*======================================= VOLUNTEER =====================================================*/
app.event("message", async ({
  body,
  event,
  context,
  client,
  message,
  say
}) => {

  let {
    text,
    user,
    channel_type
  } = message;

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

      let {
        user
      } = document;

      let listofID = [];

      for (let u in user) {
        listofID.push(user[u].anonymous)
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
        
        console.log("=========== UPDATING annonymous ID IN THE DATABASE: ===========: " + userID + " - ");
      }

    } catch (err) {
      if (err.code === 404) {
        console.log(
          `Cannot update document because either "${dbName}" database or the "document" ` + `document was not found.`
        );
      }
    }
  }

  try {
    
    let status_volunteer = await updatingPrivateID("users", "vietspeak_user", user);
    const result = await client.chat.postMessage({
      channel: user,
      text: status_volunteer ? `B???n v???a tham gia nh??m volunteer comment h??? tr??? c??c b???n tr??n VietSpeak. So???n "volunteer" ????? r???i nh??m!. So???n "me" g???i KIWI ????? xem profile c???a b???n.` : `B???n v???a r???i nh??m volunteer comment h??? tr??? c??c b???n tr??n VietSpeak. So???n "volunteer" ????? tham gia l???i! So???n "me" g???i KIWI ????? xem profile c???a b???n.`
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
  list = list.flat()
  
  let postNeedComments = list.filter(e => {
     let listReplyUser = e.reply_users;
     
     let botslist = ["U01EVJFP0U8", "U01HEMMPVK2", "U02K40CRMFB", "U02N7T5PRRS", "U01DS209G1Y", "U01CYMZM3FV", "U02N47DMKRR", "U01D4RB4EHM"]
     
     listReplyUser = listReplyUser.filter((eachreplyUser) => {
         if(botslist.includes(eachreplyUser)) return false;
         
         return true;
     })
    
    if(typeof e.files !== "undefined" && listReplyUser.length < 2){
        return true;
          
      }else{
          return false;
    }
      
  });
      
  console.log(postNeedComments)

}

const rulepostDispathchingVolunteerComment = new schedule.RecurrenceRule();
    rulepostDispathchingVolunteerComment.second = 0;
    rulepostDispathchingVolunteerComment.minute = [6, 8, 44, 45, 48, 50, 52, 53, 54, 58, 59];
    rulepostDispathchingVolunteerComment.hour = [13];
    rulepostDispathchingVolunteerComment.date = [4, 8, 14, 18, 24, getTheLastDayOfTheMonth()- 2];
    rulepostDispathchingVolunteerComment.tz = "Asia/Ho_Chi_Minh";

const scheduleDispathchingVolunteerComment = schedule.scheduleJob(rulepostDispathchingVolunteerComment, async function () {
  //channel1:  G01BPHWQ023 //will U01C3SA99FW 
  let channel00_Announcement = `C01BY4ZQ7TM`;
  try {
    let sayReturn = await postDispathchingVolunteerComment()
    
    const result = await app.client.chat.postMessage({
      channel: 'U01C3SA99FW', //testing
      text: "sayReturn",
    });
    console.log("Dispatching: " + result.ok);

  } catch (error) {
    console.error(error);
  }
});


/*==============================================================================================================================*/
(async () => {
  try {
    await app.start();
    console.log("?????? KIWI app started");
    console.log(getCurrentTask(currentTimeStamp()));

  } catch (err) {
    console.log("ERROR OCCURRING ====>", err);
  }
})();