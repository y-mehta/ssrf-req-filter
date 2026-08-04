# ssrf-req-filter - Prevent SSRF Attacks :shield:

![npm](https://img.shields.io/npm/v/ssrf-req-filter?style=for-the-badge) ![NPM](https://img.shields.io/npm/l/ssrf-req-filter?style=for-the-badge)

## Server-Side Request Forgery (SSRF)

SSRF is an attack vector that abuses an application to interact with the internal/external network or the machine itself. One of the enablers for this vector is the mishandling of URLs. [Read More](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

## Install

`npm install ssrf-req-filter`

## Usage

- Axios:

```
const ssrfFilter = require('ssrf-req-filter');
const url = 'https://127.0.0.1'
const {httpAgent, httpsAgent} = ssrfFilter.agents();
axios.get(url, {httpAgent, httpsAgent})
      .then((response) => {
        console.log(`Success`);
      })
      .catch((error) => {
        console.log(`${error.toString().split('\n')[0]}`);
      })
      .then(() => {

      });
```

*Note: use `ssrfFilter.agents()` (not `ssrfFilter(url)` for both slots) when passing both `httpAgent` and `httpsAgent` to Axios. Always set both — otherwise SSRF mitigation can be bypassed via cross-protocol redirects, see [Doyensec's research](https://blog.doyensec.com/2023/03/16/ssrf-remediation-bypass.html). `ssrfFilter.agents()` always returns two distinct, correctly-typed, filtered agents, so a cross-protocol redirect (http\<->https) keeps being filtered instead of erroring out or falling back to an unfiltered agent. `ssrfFilter(url)` still works as before for single-agent use (e.g. node-fetch below).*


- Node-fetch:

```
const ssrfFilter = require('ssrf-req-filter');
const fetch = require("node-fetch");
const url = 'https://127.0.0.1'
fetch(url, {
    agent: ssrfFilter(url)
  })
  .then((response) => {
    console.log(`Success`);
  })
  .catch(error => {
    console.log(`${error.toString().split('\n')[0]}`);
  });
```

## Known limitations

- SSRF protection does not apply when a custom `lookup` option is supplied on the request/agent (e.g. via DNS-caching libraries like [`cacheable-lookup`](https://www.npmjs.com/package/cacheable-lookup), which axios and others support integrating as `config.lookup`). Node does not emit the `'lookup'` socket event for custom resolvers, so the resolved address is never checked against the block list in that case.

*Credits*: Implementation inspired By https://github.com/welefen/ssrf-agent
