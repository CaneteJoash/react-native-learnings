import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import { HttpError, ParseError, TimeoutError, request } from '../api.ts';

type Handler = (req: http.IncomingMessage, res: http.ServerResponse, hitNumber: number) => void;

function startServer(handler: Handler) {
  let hits = 0;
  const server = http.createServer((req, res) => {
    hits += 1;
    handler(req, res, hits);
  });

  return new Promise<{ url: string; getHits: () => number; close: () => Promise<void> }>(
    (resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const { port } = server.address() as AddressInfo;
        resolve({
          url: `http://127.0.0.1:${port}`,
          getHits: () => hits,
          close: () => new Promise((r) => server.close(() => r())),
        });
      });
    }
  );
}

// The naive version every fetch tutorial teaches. It never checks response.ok.
async function naiveFetch<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json() as Promise<T>;
}

test('naive fetch swallows a 500; the typed client throws HttpError', async () => {
  const server = await startServer((_req, res) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'boom' }));
  });

  try {
    const naiveResult = await naiveFetch<{ error: string }>(server.url);
    assert.deepEqual(naiveResult, { error: 'boom' }); // "succeeded" — the bug this drill is about

    await assert.rejects(
      () => request(server.url, {}, { retries: 0 }),
      (error: unknown) => {
        assert.ok(error instanceof HttpError);
        assert.equal((error as HttpError).status, 500);
        return true;
      }
    );
  } finally {
    await server.close();
  }
});

test('a slow response is aborted by the timeout and surfaces a TimeoutError', async () => {
  const server = await startServer((_req, res) => {
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    }, 200);
  });

  try {
    await assert.rejects(
      () => request(server.url, {}, { timeoutMs: 30, retries: 0 }),
      (error: unknown) => error instanceof TimeoutError
    );
  } finally {
    await server.close();
  }
});

test('a 200 with unparsable JSON throws ParseError and does not retry', async () => {
  const server = await startServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('not json{');
  });

  try {
    await assert.rejects(
      () => request(server.url, {}, { retries: 2, retryDelayMs: 5 }),
      (error: unknown) => error instanceof ParseError
    );
    assert.equal(server.getHits(), 1);
  } finally {
    await server.close();
  }
});

test('retries on 5xx with backoff until it succeeds', async () => {
  const server = await startServer((_req, res, hitNumber) => {
    if (hitNumber < 3) {
      res.writeHead(503);
      res.end('unavailable');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  });

  try {
    const result = await request<{ ok: boolean }>(
      server.url,
      {},
      { retries: 3, retryDelayMs: 5 }
    );
    assert.deepEqual(result, { ok: true });
    assert.equal(server.getHits(), 3);
  } finally {
    await server.close();
  }
});

test('never retries a 4xx', async () => {
  const server = await startServer((_req, res) => {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'bad request' }));
  });

  try {
    await assert.rejects(() => request(server.url, {}, { retries: 3, retryDelayMs: 5 }));
    assert.equal(server.getHits(), 1);
  } finally {
    await server.close();
  }
});

test('retries a network failure (connection refused)', async () => {
  const deadUrl = 'http://127.0.0.1:1'; // nothing listens here
  const events: string[] = [];

  await assert.rejects(() =>
    request(
      deadUrl,
      {},
      {
        retries: 2,
        retryDelayMs: 5,
        logger: (event) => events.push(event.type),
      }
    )
  );

  assert.equal(events.filter((type) => type === 'request').length, 3); // initial + 2 retries
});

test('the default logger is a no-op when NODE_ENV=production', async () => {
  const server = await startServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  });

  const originalEnv = process.env.NODE_ENV;
  const originalLog = console.log;
  const originalWarn = console.warn;
  let called = false;
  console.log = () => {
    called = true;
  };
  console.warn = () => {
    called = true;
  };

  try {
    process.env.NODE_ENV = 'production';
    await request(server.url);
    assert.equal(called, false);
  } finally {
    process.env.NODE_ENV = originalEnv;
    console.log = originalLog;
    console.warn = originalWarn;
    await server.close();
  }
});
