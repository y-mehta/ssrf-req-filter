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

// prevent memory leak
const ACTIVE = Symbol('active');

const requestFilterHandler = (agent)=>{
  if (agent[ACTIVE]) return agent;
  agent[ACTIVE] = true;
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

const manageConnection = (url) => {
  const httpAgent = new http.Agent();
  const httpsAgent = new https.Agent();
  const agent = url.startsWith('https') ? httpsAgent : httpAgent;
  return requestFilterHandler(agent);
};

module.exports = (url) => manageConnection(url);
module.exports.requestFilterHandler = (agent) => requestFilterHandler(agent);
