# ssrf-req-filter - Prevent SSRF Attacks :shield:

## Server-Side Request Forgery (SSRF)
SSRF is an attack vector that abuses an application to interact with the internal/external network or the machine itself. One of the enablers for this vector is the mishandling of URLs. [Read More](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

## Install
`npm install ssrf-req-filter`

## Usage
- Axios:
```
const ssrfFilter = require('ssrf-req-filter');
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

*Credits*: Implementation inspired By https://github.com/welefen/ssrf-agent
