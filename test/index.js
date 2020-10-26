const ssrfFilter = require('../index');
const axios = require('axios');
const fs = require('fs');
const expect = require('chai').expect;
const blockUrlsFile = `${__dirname}/blockUrls.txt`;
const allowedUrlsFile = `${__dirname}/allowedUrls.txt`;
let blockUrls;
let allowedUrls;

try {
  blockUrls = JSON.parse(fs.readFileSync(blockUrlsFile));
} catch (err) {
  console.log(err);
}

blockUrls.forEach((url)=>{
  it(`${url} Is Blocked`, async () => {
    let check = 0;
    const response = await axios.get(url, {httpAgent: ssrfFilter(url),
      httpsAgent: ssrfFilter(url)})
        .then((response) => {
          check = 1;
          // console.log(`Success: ${url}`);
        })
        .catch((error) => {
          check = 0;
          // console.log('Error');
        })
        .then(() => {
          return check;
        });
    expect(response).to.equal(0);
  });
});

try {
  allowedUrls = JSON.parse(fs.readFileSync(allowedUrlsFile));
} catch (err) {
  console.log(err);
}

allowedUrls.forEach((url)=>{
  it(`${url} is Allowed`, async () => {
    let check = 0;
    const response = await axios.get(url, {httpAgent: ssrfFilter(url),
      httpsAgent: ssrfFilter(url)})
        .then((response) => {
          check = 1;
          // console.log(`Success: ${url}`);
        })
        .catch((error) => {
          check = 0;
          // console.log(error);
        })
        .then(() => {
          return check;
        });
    expect(response).to.equal(1);
  });
});

