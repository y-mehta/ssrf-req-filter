const ssrfFilter = require('ssrf-req-filter');
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
// const http = require('http');

const file = readline.createInterface({
  input: fs.createReadStream('testUrls.txt'),
  output: process.stdout,
  terminal: false,
});

file.on('line', (line) => {
  axios.get(line, {httpAgent: ssrfFilter(line), httpsAgent: ssrfFilter(line)})
      .then((response) => {
        console.log(`Success: ${line}`);
      })
      .catch((error) => {
        console.log(`${line} : ${error.toString().split('\n')[0]}`);
      })
      .then(() => {

      });
});

/* file.on('line', (line) => {
  try {
    http.get(line, {agent: customAgent(line)}, (res) => {
      console.log(`Success: ${line}`);
    }).on('error', (e) =>{
      console.log(`${line} : ${e.toString().split('\n')[0]}`);
    });
  } catch (err) {
    console.log(`${line} : ${err.toString().split('\n')[0]}`);
  }
});*/
