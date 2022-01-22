const { App } = require("@slack/bolt");
const { WebClient, LogLevel } = require("@slack/web-api");
const stringSimilarity = require("string-similarity");
const { v4: uuidv4 } = require("uuid");
const schedule = require("node-schedule");
const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

const NodeCache = require("node-cache");
const myCache = new NodeCache();

const flatCache = require("flat-cache");
const cache = flatCache.load("vietspeak");

//========================== CONFIDENTIAL INFORMATION =====================================
require("dotenv").config();

const slack_kiwi_token_client = process.env.KIWI_TOKEN_CLIENT;
const slack_kiwi_token_app = process.env.KIWI_TOKEN_APP;

const slack_kiwi_token_client_user_william =
  process.env.KIWI_TOKEN_CLIENT_USER_WILLIAM;

const slack_kiwi_token_user_vietspeakbank =
  process.env.KIWI_TOKEN_CLIENT_USER_VIETSPEAKBANK;

const airtable_api_key = process.env.AIRTABLE_API_KEY;

const channel_2_hook = process.env.KIWI_TOKEN_CLIENT_CHANNEL_2_HOOK;

// ============================================================
const client = new WebClient(slack_kiwi_token_client, {
  logLevel: LogLevel.DEBUG,
});

// dùng để gọi chat.delete API với token của user
const clientUser = new WebClient(slack_kiwi_token_client_user_william, {
  logLevel: LogLevel.DEBUG,
});

// ============================================================

let VSBankToken = slack_kiwi_token_user_vietspeakbank;

const VietSpeakBankUser = new WebClient(VSBankToken, {
  logLevel: LogLevel.DEBUG,
});

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
  token: slack_kiwi_token_client, //botOAuth Tokens for Your Workspace
  appToken: slack_kiwi_token_app,
});

let randomIndex = function (max) {
  return Math.floor(Math.random() * max);
};
app.message(
  /^(hi|hello|hey|Hi|Hello|Hey)+/,
  async ({ body, event, context, client, message }) => {
    let {
      user,
      ts,
      text,
      thread_ts,
      channel,
      channel_type,
      bot_id,
      parent_user_id,
    } = message;

    if (typeof channel_type === "undefined") {
      console.log("không có channel_type");
      return;
    }

    //Only send the reply in im
    if (channel_type !== "im") {
      return;
    }

    const greeting = context.matches[0];
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

    let botReplyGreeting = `${greeting} <@${message.user}>, ${randomsayGreetings}`;

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

// app.message(/^(thank|Thank|thanks|Thanks|THANK|THANKS)+/, async ({ message, say }) => {
//   const thanks = [
//   `You are welcome <@${message.user}>! `,
//   `Hông có chi <@${message.user}>! `,
//   `Chiện nhỏ á <@${message.user}>! `,
//   `Okey bro <@${message.user}>! `,
//   `Sure <@${message.user}>! `,
//   `No worry <@${message.user}>! `,
//   ];
//   await say(thanks[randomIndex(thanks.length)]);
// });

// app.message(/^(v|V)+/, async ({ message, say }) => {
//   fs.readFile('data/gre-vocabulary.json', 'utf8' , async(err, data) => {
//     if (err) {
//       console.error(err)
//       return
//     }
//     const databases = JSON.parse(data);
//     let random = Math.floor(Math.random()*databases.length);
//     let word = `*${databases[random].word}* - /${databases[random].pronunciation}/ - *Synonyms:* ${databases[random].synonyms}- *Meaning:* ${databases[random].definition} - *Example: * ${databases[random].passage}`;
//     await say(word);
//   })

// });

// app.message(/(w|W)\s[a-zA-Z]+/, async ({context, body, message, say }) => {

//   let textInput = body.event.text;
//   let location = textInput.split(" ")[1].toLowerCase();
//   if(location === "hochiminh"){
//     location = "saigon";
//   }

//   if(location === "sg"){
//     location = "saigon";
//   }

//   if(location === "hcm"){
//     location = "saigon";
//   }

//   if(location === "hue"){
//     location = "hue-vietnam";
//   }

//   if(location === "danang"){
//     location = "da nang";
//   }

//   if(location === "phanthiet"){
//     location = "phan thiet";
//   }

//   if(location === "quangtri"){
//     location = "quang tri";
//   }

//   if(location === "dongnai"){
//     location = "dong nai";
//   }
//   let urlWeatherAPI = `https://api.weatherapi.com/v1/current.json?key=c954edb2c4774a4f9e383953212305&q=${location}`;
//   async function getUser() {
//     try {
//       const response =     axios.get(urlWeatherAPI);
//       let locationResponse = `${response.data.location.name} - ${response.data.location.country}`;
//       let condition = response.data.current.condition.text;
//       let updated = response.data.current.last_updated;
//       let tempc = response.data.current.temp_c;
//       let tempf = response.data.current.temp_f;
//       let humidity = response.data.current.humidity;
//       let feelslikeC = response.data.current.feelslike_c;
//       let feelslikeF = response.data.current.feelslike_f;

//         // console.log(response);
//         let weatherResponse = `The weather condition in ${locationResponse}: \n
//         *Temperature*: ${tempc}C/${tempf}F \n
//         *Feel like*: ${feelslikeC}C/${feelslikeF}F \n
//         *Overall*: ${condition} \n
//         *Humidity*: ${humidity} \n
//         *Updated*: ${updated}
//         `;
//         // console.log(weatherResponse)
//         await say(weatherResponse);
//       } catch (error) {
//         console.error(error);
//       }
//     }
//     getUser();

//   });

// app.message(/^(f|F|ff|Ff|FF)+/, async ({ message, say }) => {
//   await say(funFact(randomIndex(factCount)));
// });

// app.message(/^(q|Q|quote|Quote)+/, async ({ message, say }) => {
//   await say(getRandomQuote(randomIndex(quoteCount)));
// });

// app.message(/^(s|S|story|Story)+/, async ({ message, say }) => {
//   await say(getRandomStories(randomIndex(storiesCount)));
// });

// app.message(/^(j|J|joke|Joke)+/, async ({ message, say }) => {
//   let jokeFetched = joke[randomIndex(jokeLength)];
//   let jokeSetup = jokeFetched.setup;
//   let jokePunchline = jokeFetched.punchline;

//   await say(`
//     *-* ${jokeSetup}\n *-* ${jokePunchline}
//     `);
// });

// Listens to incoming messages that contain "hello"

// app.message(/(^(help|Help|HELP|h|H)$)+/, async ({ message, say }) => {
//   await say(
//   {
//     "blocks": [
//     {
//       "type": "section",
//       "text": {
//         "type": "plain_text",
//         "text": "Hi there, welcome to KIWI - another Vietspeak Bot.",
//         "emoji": true
//       }
//     },
//     {
//       "type": "section",
//       "text": {
//         "type": "mrkdwn",
//         "text": "\n 1) Type *`d love`* to check the dictionary of the word `love`.\n 2) Type *`v`* to receive a random GRE vocabulary. \n 3) Type *`f`* to receive a random fun fact. \n 4) Type *`j`* to receive a random joke. \n 5) Type *`q`* to receive a random quote. \n 6) Type *`w x`* to receive a x' weather condition. Try *`w saigon`*.\n 7) Type *`h`* to receive help. Here you are. \n 8) Type *`s`* to receive a random story written by Aesop. Enjoy reading!. \n 9) Type *`e`* or *`e0`* (newest), *`e1`* etc...to receive a random article published by Economist. Enjoy reading!. \n 10) Say *`hi`*, *`hello`* or *`thanks`* if you wish. \n"
//       }
//     }
//     ]
//   }
//   );
// });

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

//getDictionary("love");

// app.message(/^(d|D)\s[a-zA-Z]+/, async ({ message, body, say }) => {
//   let textInput = body.event.text;
//   let wordToCheck = textInput.split(" ")[1].toLowerCase();
//   let dataReturn = await getDictionary(wordToCheck);
//   await say(dataReturn)
// });

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

// app.message(/^(n|N|news|News)+/, async ({ message, body, say }) => {
//   let dataReturnNYT = await getItem(randomIndex(10));
//   await say(dataReturnNYT)
// });

//=========================nytimes========================================================

// ======================== economist =====================================================

let economistAPI = "https://kiwi.vietspeak.org/api/economist.php";

let totalItem = 100;
async function getEconomistExplain(url) {
  const economistResponse = await axios.get(url);
  let objectURL = economistResponse.data.channel.item;
  return { objectURL };
}

async function getItemEconomist(randomIndex) {
  let ObjectLink = await getEconomistExplain(economistAPI);
  let randomLink = ObjectLink.objectURL[randomIndex].link;
  let publishedDate = ObjectLink.objectURL[randomIndex].pubDate;

  let htmlResponse = await axios.get(randomLink);
  const $ = cheerio.load(htmlResponse.data);
  const headline = $(".article__headline").text();
  const articles = $(".article__body-text");
  const description = $(".article__description").text();
  const textEconomist = [];
  articles.each(function (index, element) {
    textEconomist.push($(this).text());
  });
  let articleBodyCombined = textEconomist.join("\n");
  const resultObject = {
    headline,
    description,
    articleBodyCombined,
    publishedDate,
  };
  return resultObject;
}

// app.message(/^(e|E)$/, async ({ message, body, say }) => {
//   // let textInput = body.event.text;
//   // let wordToCheck = textInput.split(" ")[1].toLowerCase();

//   let randomIndexEconomist = randomIndex(totalItem);
//   let dataReturn = await getItemEconomist(randomIndexEconomist);

//   let sayReturn =
//   `*${dataReturn.headline}*\n
//   ${dataReturn.description}\n
//   ${dataReturn.articleBodyCombined}\n
//   Published: ${dataReturn.publishedDate}
//   `;

//   await say(sayReturn)
// });

// app.message(/^(E[0-9]+|e[0-9]+)+/, async ({ message, body, say }) => {
//   let textInput = body.event.text;
//   let indexNumber = Number(`${textInput[1]}${textInput[2]?textInput[2]:""}`);

//   if(textInput.length >=4){
//     await say(`Please type "ex" with x < 100, say "x1"`);
//     return;
//   }

//   let dataReturn = await getItemEconomist(indexNumber);

//   let sayReturn =
//   `*${dataReturn.headline}*\n
//   ${dataReturn.description}\n
//   ${dataReturn.articleBodyCombined}\n
//   Published: ${dataReturn.publishedDate}
//   `;

//   await say(sayReturn)
// });
/*======================== end of economist =====================================================*/

/*======================== Upload file =====================================================*/
app.message(/^up+/, async ({ message, body, say, client }) => {
  let user = body.event.user;

  const fileName = "data/audio/hello_us_2_rr.mp3";
  // ID of channel that you want to upload file to
  const channelIdbanthongtin = "G01BPHWQ023";

  try {
    // Call the files.upload method using the WebClient
    const result = await client.files.upload({
      channels: user,
      initial_comment: "Here's my file :smile:",
      // Include your filename in a ReadStream here
      file: fs.createReadStream(fileName),
    });

    //console.log(result);
  } catch (error) {
    console.error(error);
  }
});
/*======================== Upload file =====================================================*/

/*======================== // Send image IPA  =====================================================*/

// app.message(/^(ipa|Ipa|IPa|IPA)+/, async ({ message, body, say }) => {
//   let user = body.event.user;
//   let linkURL = `${__dirname}/data/ipa.jpg`;
//   try {
//     const result = await client.files.upload({
//       channels: user,
//       initial_comment: "The IPA",
//       file: fs.createReadStream(linkURL)

//     });
//     console.log("send ipa: " + result.ok);
//   }
//   catch (error) {
//     console.error(error);
//   }
// });

// /*======================== Upload file =====================================================*/
// app.message(/^user+/, async ({ message, body, say, client }) => {

//       // You probably want to use a database to store any user information ;)
//       let usersStore = {};

//       try {
//         // Call the users.list method using the WebClient
//         const result = await client.users.list();

//         saveUsers(result.members);

//         console.log(usersStore);
//       }
//       catch (error) {
//         console.error(error);
//       }

//       // Put users into the JavaScript object
//       function saveUsers(usersArray) {
//         let userId = '';
//         usersArray.forEach(function(user){
//           // Key user info on their unique user ID
//           userId = user["id"];

//           // Store the entire user object (you may not need all of the info)
//           usersStore[userId] = user;
//         });
//       }

//     });

/*======================== trigger event  =====================================================*/

async function getIPA(wordInput) {
  let urlDict = `https://api.dictionaryapi.dev/api/v2/entries/en/${wordInput}`;
  const dictResponse = await axios.get(urlDict);
  let word = dictResponse.data[0].word;
  let phonetic = dictResponse.data[0].phonetic;
  return phonetic;
}

// app.event('app_mention', async ({body, event, context, client, message, say }) => {
//   console.log(event)

//   let {client_msg_id, text, user, ts, team, thread_ts, parent_user_id, channel, events_ts} =  event;

//   let phoneticResult;
//   let lastWord;
//   if(text.includes("ipa")||text.includes("Ipa")||text.includes("IPa")||text.includes("IPA")){
//     text = text.trim().toLowerCase().split(" ");
//     lastWord = text[text.length-1];
//   }else{
//     return;
//   }

//   if(lastWord === "ipa"){
//     let linkURL = `${__dirname}/data/ipa.jpg`;
//     try {
//       const result = await client.files.upload({
//         channels: channel,
//         initial_comment: "The IPA",
//         thread_ts: thread_ts,
//         file: fs.createReadStream(linkURL)

//       });
//       console.log("send ipa: " + result.ok);
//     }
//     catch (error) {
//       console.error(error);
//     }
//   }else{
//     try {
//       phoneticResult = await getIPA(lastWord);
//       const result = await client.chat.postMessage({
//         channel: channel,
//         thread_ts: thread_ts,
//         text: `${lastWord}: /${phoneticResult}/`,
//       });
//       console.log(result.ok);
//     }
//     catch (error) {
//       console.error(error);
//     }
//   }
// });

app.event(
  "app_mention",
  async ({ body, event, context, client, message, say }) => {
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
  async ({ body, event, context, client, message, say }) => {
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

/////////BEE//////////////////

// ================bee===================

async function getSpelling(indexID) {
  let randomIndex;
  if (indexID === null) {
    const AirTable = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
      40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
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

  let urlAirTable = `https://api.airtable.com/v0/${tableIndex}/listening-challenge${randomIndex}?api_key=${airtable_api_key}`;

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

async function getAudioFile(fileUrl) {
  const writer = fs.createWriteStream("audio.mp3");

  //lưu ý stream không hỗ trợ promise, có thể dùng pipeline hoặc cách sau. ref: https://stackoverflow.com/questions/55374755/node-js-axios-download-file-stream-and-writefile
  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  }).then((response) => {
    //ensure that the user can call `then()` only when the file has
    //been downloaded entirely.
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

let listenningChallengesChannel = "C01CDAFCQ3B"; 

async function postSpelling() {
  try {
    const { audio, number, transcript } = await getSpelling(null);

    await getAudioFile(audio);

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
    const file = "audio.mp3";
    const result = await client.files.upload({
      channels: listenningChallengesChannel, //----> channels có s khi up load file      
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
rule.minute = [5];
rule.hour = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23];
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

// SYNTAX CŨ CẦN MENTION
app.event(
  "app_mention",
  async ({ body, event, context, client, message, say }) => {
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

    //   biến text có sẵn từ app.event
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

      const { transcript } = await getSpelling(questionID);
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

      // https://api.slack.com/methods/chat.postMessage/test --> nếu gửi dm cho user, thay channel bằng ID username U01C3SA99FW  (William)

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

    //   Xóa thread_ts đã mention @kiwi bee
    // The ts of the message you want to delete
    const messageId = ts;
    // The ID of the channel that contains the message
    const channelId = channel;

    if (
      typeof messageId !== "undefined" &&
      messageId !== null &&
      getMark >= 40
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

////////////SYNTAX MỚI KHÔNG CẦN MENTION ///////////////
app.event("message", async ({ body, event, context, client, message, say }) => {
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

  let { channel_type, bot_id, parent_user_id } = message;

  if (typeof subtype !== "undefined") {
    console.log(`subtype là ${subtype}`);
    //không xử lý khi type là xóa
    return;
  }

  //   only listen to event on channel #8 and #api
  if (channel != "C01CDAFCQ3B" && channel != "G01C73RT1PH") {
    return;
  }
  //Phải reload của file reaction mới xóa hoàn toàn cache

  flatCache.clearAll();
  // Hiển thị cache
  displayCachelAll();

  //khi xóa sẽ thành undefined;
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

      const { transcript } = await getSpelling(questionID);
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

      // https://api.slack.com/methods/chat.postMessage/test --> nếu gửi dm cho user, thay channel bằng ID username U01C3SA99FW  (William)

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

    ////////////////////////Xóa CÂU TRẢ LỜI ///////////////////////////////

    if (typeof ts === "undefined") {
      return;
    }

    const messageId = ts;
    // The ID of the channel that contains the message
    const channelId = channel;

    if (
      typeof messageId !== "undefined" &&
      messageId !== null &&
      getMark >= 40
    ) {
      try {
        //Chú ý: Call the chat.delete method using the WebClient (clientUser với token user là admin thay vì app client)
        const result = await clientUser.chat.delete({
          channel: channelId,
          ts: messageId,
          as_user: true,
        });

        // console.log(result);
        console.log(`messageId khi xóa là ${messageId}`);
        console.log(`điểm số: ${getMark}`);
      } catch (error) {
        console.error(error);
      }
    }

    //end of xóa
    /////NẾU TRÊN 90 ĐIỂM
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
              //console.log(result);
            } catch (error) {
              console.error(error);
            }
          }
        }
      } else {
        // set cache người dùng hiện tại
        let currentUser = { id: user, score: getMark };

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

  /////////check_trustKIỂM TRA KÍ GỬI//////////////////////////////////

  const getTrustValue = (textMessage) => {
    if (
      typeof bot_id === "undefined" ||
      typeof parent_user_id === "undefined" ||
      typeof textMessage === "undefined"
    ) {
      return false;
    }

    if (parent_user_id != "U02N47DMKRR") {
      return false;
    }

    if (typeof channel === "undefined" || channel != "G01C73RT1PH") {
      return false;
    }

    let checking = textMessage.includes("đã kí gửi");

    if (!checking) {
      console.log("1217 - Không phải dữ liệu kí gửi");
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

    return { trustAmount, userChecked };
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

//TRACKING trust_amount, cập nhật từ vietspeakbot
app.event("message", async ({ body, event, context, client, message }) => {
  let { user, ts, text, channel, channel_type, subtype, thread_ts, bot_id } =
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
    let { sender, receiver, amount } = depositChange(text);

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
    let { sender, receiver, amount } = takeCoin(text);

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

///////////////////////////// GỬI TRANSCRIRIPT
app.event("message", async ({ body, event, context, client, message, say }) => {
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

    let { transcript } = await getSpelling(questionID);
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

  //end of xóa
});

////////////////////////////

///////////////////////////GỬI IPA AUDIO////////////////////////////////

app.event("message", async ({ body, event, context, client, message, say }) => {
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
        filename: words,
        file: fs.createReadStream(file),
      });
      //   console.log(result);
      console.log("send api file");
    } catch (error) {
      console.error(error);
    }
  }
});

////////////////////////////////////////////////////////////////////

app.event(
  "app_mention",
  async ({ body, event, context, client, message, say }) => {
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

    // Trả về

    try {
      const questionID = await beeNumber();
      let { transcript } = await getSpelling(questionID);
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

// ================BEE===================

/*======================== trigger event  =====================================================*/

//IPA
//http://www.phonetics.ucla.edu/course/chapter2/linkschapter2.htm

// ================TOELF===================

// async function getRandomTOEFL(random){
//   return TOEFL.words[randomIndex(random)]
// }

app.event(
  "app_mention",
  async ({ body, event, context, client, message, say }) => {
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

//============================================ Ending task ============================================
function getRandomQuoteEndingTask(Randomeindex) {
  return `Quote for another chapter of VietSpeak: _${quote[Randomeindex].quoteText}_ - *${quote[Randomeindex].quoteAuthor}*`;
}

async function postMessageEndingTask(currentTask) {
  let audioPost = channel_2_hook;
  let dataSentObject = {
    text:
      " *`=======🔥🔥🔥TASK ENDED🔥🔥🔥=======`* \nNhững bài nộp sau thanh này sẽ tính là không nộp bài cho task " +
      currentTask +
      " 😊😊😊. \n\n" +
      getRandomQuoteEndingTask(randomIndex(quoteCount)),
  };

  axios
    .post(audioPost, dataSentObject)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

const ruleEndingTask = new schedule.RecurrenceRule();
ruleEndingTask.second = 0;
ruleEndingTask.minute = 0;
ruleEndingTask.hour = 0;
ruleEndingTask.date = [1, 11, 21];
ruleEndingTask.tz = "Asia/Ho_Chi_Minh";

let currentTask = 63;

const jobEndingTask = schedule.scheduleJob(ruleEndingTask, function () {
  postMessageEndingTask(currentTask);
});

/*======================== trigger event  =====================================================*/

(async () => {
  try {
    await app.start();
    console.log("⚡️ Bolt app started");
  } catch (err) {
    console.log("LỖI <----------------====>", err);
  }
})();
