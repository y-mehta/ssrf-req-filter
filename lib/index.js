const http = require('http');
const https = require('https');
const ipaddr = require('ipaddr.js');

const checkIp = (ip) => {
  if (!ipaddr.isValid(ip)) {
    return true;
  }
  try {
    const addr = ipaddr.parse(ip);
    const range = addr.range();
    if (range !== 'unicast') {
      return false; // Private IP Range
    }
  } catch (err) {
    return false;
  }
  return true;
};

const manageConnection = (url) => {
  const httpAgent = new http.Agent();
  const httpsAgent = new https.Agent();
  const agent = url.startsWith('https') ? httpsAgent : httpAgent;
  const {createConnection} = agent;
  agent.createConnection = function(options, func) {
    const {host: address} = options;
    if (!checkIp(address)) {
      throw new Error(`Call to ${address} is blocked.`);
    }
    const socket = createConnection.call(this, options, func);
    socket.on('lookup', (error, address) => {
      if (error || checkIp(address)) {
        return false;
      }
      return socket.destroy(new Error(`Call to ${address} is blocked.`));
    });
    return socket;
  };
  return agent;
};

module.exports = (url) => manageConnection(url);
