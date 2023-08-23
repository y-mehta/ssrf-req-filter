const http = require('http');
const https = require('https');
const axios = require('axios');
const expect = require('chai').expect;

const ssrfFilter = require('../lib/index.js');
const {requestFilterHandler} = require('../lib/index.js');

const blockedUrls = require('./fixtures/blockedUrls.js');
const allowedUrls = require('./fixtures/allowedUrls.js');

describe('SSRF Filtering', () => {
  let httpAgent;
  let httpsAgent;

  before(() => {
    httpAgent = new http.Agent();
    httpsAgent = new https.Agent();
  });

  describe('ssrfFilter Blocked', () => {
    blockedUrls.forEach((url) => {
      it(url, async () => {
        let check = 0;

        const response = await axios
            .get(url, {
              httpAgent: ssrfFilter(url),
              httpsAgent: ssrfFilter(url),
            })
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
  });

  describe('ssrfFilter Allowed', () => {
    allowedUrls.forEach((url) => {
      it(url, async () => {
        let check = 0;

        const response = await axios
            .get(url, {
              httpAgent: ssrfFilter(url),
              httpsAgent: ssrfFilter(url),
            })
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
  });

  describe('ssrfFilter DNS Rebinding', () => {
    it('With rebind.it: ', async function () {
      let check = 0;
      const rebindingUrl = 'http://s-35.185.206.165-127.0.0.1-' + new Date().valueOf() + '-rr-e.d.rebind.it';
      this._runnable.title = this._runnable.title + rebindingUrl;

      const response = await axios
          .get(rebindingUrl, {
            httpAgent: ssrfFilter(rebindingUrl),
            httpsAgent: ssrfFilter(rebindingUrl),
          })
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
  });

  describe('requestFilterHandler Blocked', () => {
    blockedUrls.forEach((url) => {
      it(`${url} is Blocked`, async () => {
        let check = 0;

        const response = await axios
            .get(url, {
              httpAgent: requestFilterHandler(httpAgent),
              httpsAgent: requestFilterHandler(httpsAgent),
            })
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
  });

  describe('requestFilterHandler Allowed', () => {
    allowedUrls.forEach((url) => {
      it(`${url} is Allowed`, async () => {
        let check = 0;

        const response = await axios
            .get(url, {
              httpAgent: requestFilterHandler(httpAgent),
              httpsAgent: requestFilterHandler(httpsAgent),
            })
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
  });
});
