import assert from 'node:assert/strict';
import { exceedsCircuitBreakerCap } from '../src/lib/ask/circuit-breaker';
import { askConfig } from '../src/lib/ask/config';
import {
  createAnonCookieValue,
  generateSlug,
  hashIp,
  verifyAnonCookieValue,
} from '../src/lib/ask/crypto';
import {
  allCapsRatio,
  computeHeuristicsScore,
  countLinks,
  hasExcessiveRepeats,
  hasObsceneMatch,
  isSpam,
} from '../src/lib/ask/heuristics';
import {
  isElapsedWithinWindow,
  isHoneypotTriggered,
} from '../src/lib/ask/honeypot';
import { resolveIdentity } from '../src/lib/ask/identity';

const secret = 'ask-selfcheck-secret-do-not-use-in-prod-00000000';

// crypto: cookie signing round-trips and rejects tampering
const cookie = createAnonCookieValue(secret);
assert.equal(verifyAnonCookieValue(cookie.value, secret), cookie.id);
assert.equal(verifyAnonCookieValue(`${cookie.value}x`, secret), null);
assert.equal(verifyAnonCookieValue('garbage', secret), null);
assert.equal(hashIp('1.2.3.4', secret), hashIp('1.2.3.4', secret));
assert.notEqual(hashIp('1.2.3.4', secret), hashIp('5.6.7.8', secret));
assert.match(generateSlug(), /^[0-9a-f]{8}$/);

// identity: falls back to a stable ip hash until a valid cookie exists
const fresh = resolveIdentity(undefined, '1.2.3.4', secret);
assert.equal(fresh.providerId, hashIp('1.2.3.4', secret));
assert.notEqual(fresh.newCookieValue, null);
const returning = resolveIdentity(cookie.value, '9.9.9.9', secret);
assert.equal(returning.providerId, cookie.id);
assert.equal(returning.newCookieValue, null);

// honeypot and timing window
assert.equal(isHoneypotTriggered(''), false);
assert.equal(isHoneypotTriggered('  filled  '), true);
const now = Date.now();
assert.equal(
  isElapsedWithinWindow(now - 4_000, now, askConfig.elapsedMs.min, askConfig.elapsedMs.max),
  true,
);
assert.equal(
  isElapsedWithinWindow(now - 1_000, now, askConfig.elapsedMs.min, askConfig.elapsedMs.max),
  false,
);
assert.equal(
  isElapsedWithinWindow(now - 7 * 3_600_000, now, askConfig.elapsedMs.min, askConfig.elapsedMs.max),
  false,
);

// heuristics: three links alone crosses the spam threshold
assert.equal(countLinks('see http://a.example and http://b.example'), 2);
assert.equal(hasExcessiveRepeats('soooooooo good'), true);
assert.equal(hasExcessiveRepeats('so good'), false);
assert.ok(allCapsRatio('HELLO THERE') > 0.9);
assert.ok(allCapsRatio('hello there') < 0.1);
assert.equal(hasObsceneMatch('a perfectly normal question'), false);
const spamBody =
  'buy now http://a.example http://b.example http://c.example limited deals';
assert.equal(isSpam(computeHeuristicsScore(spamBody)), true);
assert.equal(isSpam(computeHeuristicsScore('a perfectly normal question')), false);

// circuit breaker: trips exactly at the configured cap
assert.equal(exceedsCircuitBreakerCap(askConfig.circuitBreaker.cap - 1), false);
assert.equal(exceedsCircuitBreakerCap(askConfig.circuitBreaker.cap), true);

console.log('ask self-check: all assertions passed');
