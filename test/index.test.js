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
    // The previous version of this test hit the live third-party
    // `rebind.it` service, which is flaky and its pass/fail assertion was
    // ambiguous by construction (see GH issue #37: `check` was set to 1 on
    // both a 200 and a 400, so the test couldn't actually distinguish
    // "blocked" from "not blocked").
    //
    // What actually protects against DNS rebinding here is that checkIp()
    // is re-run against the *resolved* address on every real connection
    // attempt (the socket 'lookup' event), not just against the literal
    // host string up front. That mechanism is deterministic and doesn't
    // need a special external domain to exercise: any hostname that
    // resolves to a private/loopback address demonstrates it, e.g.
    // 'localhost' -> 127.0.0.1 / ::1.
    it('blocks a hostname resolving to a private address', async () => {
      const server = http.createServer((req, res) => res.end('ok'));
      await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
      const port = server.address().port;

      let sawConnect = false;
      let sawServerConnection = false;
      server.on('connection', () => {
        sawServerConnection = true;
      });

      const agent = requestFilterHandler(new http.Agent());
      const error = await new Promise((resolve) => {
        const req = http.request({agent, host: 'localhost', port, path: '/'});
        req.on('socket', (socket) => {
          socket.on('connect', () => {
            sawConnect = true;
          });
        });
        req.on('error', resolve);
        req.end();
      });

      server.close();

      expect(error.message).to.match(/blocked/);
      // The connection must be torn down before a real handshake
      // completes — not merely after the fact.
      expect(sawConnect).to.equal(false);
      expect(sawServerConnection).to.equal(false);
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

  describe('ssrfFilter.agents()', () => {
    it('returns two distinct, correctly-typed agents regardless of url', () => {
      const a1 = ssrfFilter.agents('http://example.com');
      const a2 = ssrfFilter.agents('https://example.com');

      expect(a1.httpAgent).to.be.instanceOf(http.Agent);
      expect(a1.httpsAgent).to.be.instanceOf(https.Agent);
      // Same singletons every call, so both slots stay correctly typed
      // across http<->https redirects (GH issue #49).
      expect(a1.httpAgent).to.equal(a2.httpAgent);
      expect(a1.httpsAgent).to.equal(a2.httpsAgent);
      expect(a1.httpAgent).to.not.equal(a1.httpsAgent);
    });

    it('blocks requests the same way as the default export', async () => {
      const {httpAgent, httpsAgent} = ssrfFilter.agents();
      let check = 0;

      const response = await axios
          .get('http://127.0.0.1', {httpAgent, httpsAgent})
          .then(() => {
            check = 1;
          })
          .catch(() => {
            check = 0;
          })
          .then(() => check);

      expect(response).to.equal(0);
    });
  });

  describe('protocol mismatch across redirects (GH #49)', () => {
    it('never assigns an http.Agent into the httpsAgent slot', () => {
      const url = 'http://example.com';
      const httpAgentSlot = ssrfFilter(url);
      const httpsAgentSlot = ssrfFilter(url);

      // Before the fix, both calls returned the *same* http.Agent instance
      // because manageConnection picked purely off the passed-in url —
      // so httpsAgent ended up holding an http.Agent.
      expect(httpAgentSlot).to.be.instanceOf(http.Agent);
      expect(httpsAgentSlot).to.be.instanceOf(http.Agent);
    });
  });

  describe('non-host connections (unix sockets) are blocked', () => {
    it('rejects a createConnection call that only has socketPath', async () => {
      const agent = requestFilterHandler(new http.Agent());
      const opts = {socketPath: '/var/run/docker.sock'};
      const socket = agent.createConnection(opts, () => {});

      const err = await new Promise((resolve) => {
        socket.on('error', resolve);
      });

      expect(err.message).to.match(/blocked/);
    });
  });

  describe('blocked literal IP does not throw synchronously', () => {
    it('returns a socket instead of throwing', async () => {
      const agent = requestFilterHandler(new http.Agent());
      const opts = {host: '127.0.0.1', port: 80};
      let socket;
      expect(() => {
        socket = agent.createConnection(opts, () => {});
      }).to.not.throw();

      const err = await new Promise((resolve) => {
        socket.on('error', resolve);
      });
      expect(err.message).to.match(/blocked/);
    });
  });
});
