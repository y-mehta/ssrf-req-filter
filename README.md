# ssrf-req-filter - Prevent SSRF Attacks :shield:

![David](https://img.shields.io/david/y-mehta/ssrf-req-filter?style=for-the-badge) ![npm](https://img.shields.io/npm/v/ssrf-req-filter?style=for-the-badge) ![NPM](https://img.shields.io/npm/l/ssrf-req-filter?style=for-the-badge) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/y-mehta/ssrf-req-filter/Node.js%20CI?style=for-the-badge)

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

*Credits*: Implementation inspired By https://github.com/welefen/ssrf-agent
