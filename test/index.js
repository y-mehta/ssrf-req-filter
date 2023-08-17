const ssrfFilter = require('../lib/index.js');
const {requestFilterHandler} = require('../lib/index.js');
const http = require('http');
const https = require('https');
const axios = require('axios');
const fs = require('fs');
const expect = require('chai').expect;
const blockUrlsFile = `${__dirname}/blockUrls.txt`;
const allowedUrlsFile = `${__dirname}/allowedUrls.txt`;
let blockUrls;
let allowedUrls;


const httpAgent = new http.Agent();
const httpsAgent = new https.Agent();

// ssrfFilter: Test: Blocked URLs
try {
  blockUrls = JSON.parse(fs.readFileSync(blockUrlsFile));
} catch (err) {
  console.log(err);
}

blockUrls.forEach((url)=>{
  it(`${url} is Blocked`, async () => {
    let check = 0;
    // eslint-disable-next-line max-len
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
    expect(response).to.equal(0);
  });
});

// ssrfFilter: Test: Allowed URLs
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

// ssrfFilter: Test: DNS Rebind
it(`Test DNS Rebind`, async () => {
  let check = 0;
  const url = 'http://s-35.185.206.165-127.0.0.1-'+ new Date().valueOf() +'-rr-e.d.rebind.it';
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

// requestFilterHandler: Test: Blocked URLs
try {
  blockUrls = JSON.parse(fs.readFileSync(blockUrlsFile));
} catch (err) {
  console.log(err);
}

blockUrls.forEach((url)=>{
  it(`${url} is Blocked`, async () => {
    let check = 0;
    // eslint-disable-next-line max-len
    const response = await axios.get(url, {httpAgent: requestFilterHandler(httpAgent),
      httpsAgent: requestFilterHandler(httpsAgent)})
        .then((response) => {
          check = 1;
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

// requestFilterHandler: Test: Allowed URLs
try {
  allowedUrls = JSON.parse(fs.readFileSync(allowedUrlsFile));
} catch (err) {
  console.log(err);
}

allowedUrls.forEach((url)=>{
  it(`${url} is Allowed`, async () => {
    let check = 0;
    // eslint-disable-next-line max-len
    const response = await axios.get(url, {httpAgent: requestFilterHandler(httpAgent),
      httpsAgent: requestFilterHandler(httpsAgent)})
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
