const ssrfFilter = require('../lib/index.js');
const axios = require('axios');
const fs = require('fs');
const expect = require('chai').expect;
const blockUrlsFile = `${__dirname}/blockUrls.txt`;
const allowedUrlsFile = `${__dirname}/allowedUrls.txt`;
let blockUrls;
let allowedUrls;

// Test: Blocked URLs
try {
  blockUrls = JSON.parse(fs.readFileSync(blockUrlsFile));
} catch (err) {
  console.log(err);
}

blockUrls.forEach((url)=>{
  it(`${url} is Blocked`, async () => {
    let check = 0;
    const response = await axios.get(url, {httpAgent: ssrfFilter(url),
      httpsAgent: ssrfFilter(url)})
        .then((response) => {
          check = 1;
          console.log(response);
        })
        .catch((error) => {
          check = 0;
        })
        .then(() => {
          return check;
        });
    expect(response).to.equal(0);
  });
});

// Test: Allowed URLs
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
        })
        .catch((error) => {
          check = 0;
        })
        .then(() => {
          return check;
        });
    expect(response).to.equal(1);
  });
});

// Test: DNS Rebind
it(`Test DNS Rebind`, async () => {
  let check = 0;
  const url = 'http://A.49.44.166.234.1time.10.0.0.1.1time.repeat.'+ new Date().valueOf() +'.rebind.network';
  console.log(url);
  const response = await axios.get(url, {httpAgent: ssrfFilter(url),
    httpsAgent: ssrfFilter(url)})
      .then((response) => {
        check = 1;
      })
      .catch((error) => {
        if (error.message === 'Request failed with status code 400') {
          check = 1;
        } else {
          check = 0;
        }
      })
      .then(() => {
        return check;
      });
  expect(response).to.equal(1);
});
