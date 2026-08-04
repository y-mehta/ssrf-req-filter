const net = require('net');
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

// A connection request that isn't going to a network host (e.g. a unix
// domain socket via `socketPath`/`path`) has no IP for checkIp to validate,
// so it must be rejected explicitly instead of silently passing the filter.
const isNonHostConnection = (options) => {
  return !options.host && Boolean(options.socketPath || options.path);
};

// destroy() must not run synchronously inside the 'lookup' callback: doing so
// races Node's internal connect state machine on newer Node versions and can
// crash the process with ERR_INTERNAL_ASSERTION (nodejs/node#50841).
const destroyBlocked = (socket, address) => {
  process.nextTick(() => {
    socket.destroy(new Error(`Call to ${address} is blocked.`));
  });
};

// prevent memory leak
const ACTIVE = Symbol('active');

const requestFilterHandler = (agent) => {
  if (agent[ACTIVE]) return agent;
  agent[ACTIVE] = true;
  const {createConnection} = agent;
  agent.createConnection = function(options, func) {
    const {host: address} = options;

    if (isNonHostConnection(options)) {
      const socket = new net.Socket();
      destroyBlocked(socket, options.socketPath || options.path);
      return socket;
    }

    if (!checkIp(address)) {
      // Don't attempt the real connection at all, and don't throw
      // synchronously (a throw here can surface as an uncaught exception
      // instead of a normal request error, depending on the HTTP client).
      const socket = new net.Socket();
      destroyBlocked(socket, address);
      return socket;
    }

    const socket = createConnection.call(this, options, func);
    socket.on('lookup', (error, address) => {
      if (error || checkIp(address)) {
        return false;
      }
      return destroyBlocked(socket, address);
    });
    return socket;
  };
  return agent;
};

// Singleton, already-filtered agents. Reused across calls so that the http
// and https agents stay two distinct, correctly-typed instances no matter
// how many times/urls this module is called with.
const filteredHttpAgent = requestFilterHandler(new http.Agent());
const filteredHttpsAgent = requestFilterHandler(new https.Agent());

const manageConnection = (url) => {
  return url.startsWith('https') ? filteredHttpsAgent : filteredHttpAgent;
};

module.exports = (url) => manageConnection(url);
module.exports.requestFilterHandler = (agent) => requestFilterHandler(agent);
// Always returns both agents, correctly typed, so http<->https redirects
// keep using a filtered agent instead of falling back to an unfiltered one
// or an agent of the wrong protocol (see GH issue #49).
module.exports.agents = () => ({
  httpAgent: filteredHttpAgent,
  httpsAgent: filteredHttpsAgent,
});
