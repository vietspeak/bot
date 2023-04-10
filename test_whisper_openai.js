const {Configuration, OpenAIApi} = require("openai");
require("dotenv").config();
const fs = require('fs');
let api_key = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
    apiKey: api_key,
});
const openai = new OpenAIApi(configuration);

const file = fs.createReadStream('example/William_Shakehand_Green_107.mp3');

async function test() {
    const resp = await openai.createTranscription(
        file,
        "whisper-1"
    );
    let text = resp.data.text;
    console.log(text);
}

test();

// Reference: https://platform.openai.com/docs/api-reference/audio/create?lang=node