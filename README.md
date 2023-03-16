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
axios.get(url, {httpAgent: ssrfFilter(url), httpsAgent: ssrfFilter(url)})
      .then((response) => {
        console.log(`Success`);
      })
      .catch((error) => {
        console.log(`${error.toString().split('\n')[0]}`);
      })
      .then(() => {

      });
```


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

*Note: It's recommended to overwrite both httpAgent and httpsAgent in Axios with ssrf-req-filter. Otherwise, SSRF mitigation can be bypassed via cross protocol redirects. Refer to [Doyensec's research](https://blog.doyensec.com/2023/03/16/ssrf-remediation-bypass.html) for more information.*

*Credits*: Implementation inspired By https://github.com/welefen/ssrf-agent
