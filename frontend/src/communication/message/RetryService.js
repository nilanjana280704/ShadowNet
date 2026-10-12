/**
 * RetryService — the retry policy. Exponential backoff with jitter and a max
 * attempt cap. Decides whether a failed message should be retried and when.
 */
export default class RetryService {
  constructor({ maxAttempts = 4, baseDelayMs = 1000, maxDelayMs = 30000 } = {}) {
    this.maxAttempts = maxAttempts;
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
  }

  shouldRetry(attempts) {
    return attempts < this.maxAttempts;
  }

  /** Backoff delay (ms) for the given attempt number (1-based). */
  nextDelay(attempts) {
    const exp = Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** Math.max(0, attempts - 1));
    const jitter = exp * 0.2 * Math.random();
    return Math.round(exp + jitter);
  }
}
