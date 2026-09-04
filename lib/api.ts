// A fetch wrapper that fails correctly: response.ok is checked (a 500 rejects,
// it doesn't resolve), JSON parsing is guarded, requests time out via
// AbortController, and 5xx/network failures retry with exponential backoff.
// 4xx never retries — that's a client bug, retrying it just hammers the server.

export class HttpError extends Error {
  status: number;
  body: string;
  url: string;

  constructor(status: number, body: string, url: string) {
    super(`HTTP ${status} for ${url}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

export class TimeoutError extends Error {
  url: string;
  timeoutMs: number;

  constructor(url: string, timeoutMs: number) {
    super(`Request to ${url} timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
    this.url = url;
    this.timeoutMs = timeoutMs;
  }
}

export class ParseError extends Error {
  url: string;
  cause: unknown;

  constructor(url: string, cause: unknown) {
    super(`Failed to parse JSON response from ${url}`);
    this.name = 'ParseError';
    this.url = url;
    this.cause = cause;
  }
}

export type LogEvent =
  | { type: 'request'; method: string; url: string }
  | { type: 'response'; method: string; url: string; status: number; durationMs: number }
  | { type: 'error'; method: string; url: string; error: unknown; durationMs: number };

export type Logger = (event: LogEvent) => void;

const noopLogger: Logger = () => {};

const defaultLogger: Logger = (event) => {
  if (event.type === 'error') {
    console.warn('[api]', event);
  } else {
    console.log('[api]', event);
  }
};

const isProduction = () =>
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';

export type RequestOptions = {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  logger?: Logger;
};

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error: unknown): boolean {
  if (error instanceof HttpError) return error.status >= 500;
  if (error instanceof TimeoutError) return true;
  if (error instanceof ParseError) return false;
  // Anything else here is a rejected fetch: DNS failure, connection refused, offline.
  return true;
}

export async function request<T>(
  url: string,
  init: RequestInit = {},
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    logger = isProduction() ? noopLogger : defaultLogger,
  } = options;

  const method = init.method ?? 'GET';
  let attempt = 0;

  for (;;) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = Date.now();

    try {
      logger({ type: 'request', method, url });
      const response = await fetch(url, { ...init, signal: controller.signal });

      // The whole point of the lesson: a 500 arrives here, not in the catch.
      if (!response.ok) {
        const body = await response.text();
        throw new HttpError(response.status, body, url);
      }

      let data: T;
      try {
        data = (await response.json()) as T;
      } catch (cause) {
        throw new ParseError(url, cause);
      }

      logger({
        type: 'response',
        method,
        url,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });
      return data;
    } catch (rawError) {
      const error =
        rawError instanceof DOMException && rawError.name === 'AbortError'
          ? new TimeoutError(url, timeoutMs)
          : rawError;

      logger({ type: 'error', method, url, error, durationMs: Date.now() - startedAt });

      if (attempt >= retries || !isRetryable(error)) throw error;

      attempt += 1;
      await sleep(retryDelayMs * 2 ** (attempt - 1));
    } finally {
      clearTimeout(timer);
    }
  }
}
