require("dotenv").config();
const fetch = require('cross-fetch');
const FormData = require('form-data');
const fs = require('fs');

const AUTH_TOKEN = process.env.API_Speechmatics;
const PATH_TO_FILE = 'example/William_Shakehand_Green_107.mp3';

const formData = new FormData();
formData.append('data_file', fs.createReadStream(PATH_TO_FILE));
formData.append('config', JSON.stringify({
  type: 'transcription',
  transcription_config: {
    operating_point: 'enhanced',
    language: 'en',
    enable_entities: true
  }
}));

fetch('https://asr.api.speechmatics.com/v2/jobs/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    ...formData.getHeaders()
  },
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));


const JOB_ID = 'i0w6nivmbd';


fetch(`https://asr.api.speechmatics.com/v2/jobs/${JOB_ID}/transcript?format=txt`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
})
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.error(error));
