import {Agent as HttpAgent} from 'http';
import {Agent as HttpsAgent} from 'https';

type SsrfFilterAgent = HttpAgent | HttpsAgent;

/**
 * Returns an SSRF-filtered agent for the given url — an http.Agent for
 * `http:` urls, an https.Agent for `https:` urls. The returned agent is a
 * shared singleton per protocol.
 *
 * When passing both `httpAgent` and `httpsAgent` to a client (e.g. axios),
 * prefer `ssrfFilter.agents()` instead, so cross-protocol redirects keep
 * using a filtered agent of the correct type.
 */
declare function ssrfFilter(url: string): SsrfFilterAgent;

declare namespace ssrfFilter {
  /**
   * Wraps an existing http.Agent or https.Agent in-place with the SSRF
   * filter and returns it. Idempotent — wrapping an already-wrapped agent
   * is a no-op.
   */
  function requestFilterHandler<T extends SsrfFilterAgent>(agent: T): T;

  /**
   * Returns the filtered http and https singleton agents together, both
   * correctly typed regardless of any url. Safe to pass directly as
   * `{ httpAgent, httpsAgent }` to a client that may follow cross-protocol
   * redirects.
   */
  function agents(url?: string): {
    httpAgent: HttpAgent;
    httpsAgent: HttpsAgent;
  };
}

export = ssrfFilter;
