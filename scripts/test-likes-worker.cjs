const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');

let worker;
let readSql;
let saveSql;
before(async () => {
  const filename = path.resolve(__dirname, '../backend/likes/worker.mjs');
  const module = await import(pathToFileURL(filename).href);
  worker = module.default;
  const source = fs.readFileSync(filename, 'utf8');
  readSql = source.match(/const READ_LIKES_SQL = `([\s\S]*?)`;/)[1];
  saveSql = source.match(/const SAVE_LIKES_SQL = `([\s\S]*?)`;/)[1];
  assert.deepEqual(Object.keys(module), ['default']);
});
const origin = 'https://congzhang365.github.io';
const id = '00000000-0000-4000-8000-000000000001';
function database({ total = 8, mine = 3, error } = {}) {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      return { bind(...values) {
        const statement = { sql, values, first: async () => { calls.push({ sql, values }); if (error) throw error; return { total, mine }; } };
        return statement;
      } };
    },
    async batch(statements) {
      calls.push(...statements);
      if (error) throw error;
      return [{ success: true }, { success: true, results: [{ total, mine }] }];
    },
  };
}
function request(method = 'GET', body, extra = {}) {
  return new Request(`https://counter.example/likes${method === 'GET' ? `?clientId=${id}` : ''}`, {
    method, headers: { Origin: origin, ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}), ...extra },
    ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
  });
}

test('GET returns the aggregate and this browser count, with exact-origin CORS and no caching', async () => {
  const db = database();
  const response = await worker.fetch(request(), { LIKES_DB: db });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { total: 8, mine: 3 });
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('Vary'), 'Origin');
  assert.equal(db.calls[0].sql, readSql);
  assert.deepEqual(db.calls[0].values, [id]);
});

test('POST uses one atomic database batch with bound values and returns confirmed counts', async () => {
  const db = database();
  const response = await worker.fetch(request('POST', { clientId: id, count: 3 }), { LIKES_DB: db });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { total: 8, mine: 3 });
  assert.equal(db.calls.length, 2);
  assert.equal(db.calls[0].sql, saveSql);
  assert.deepEqual(db.calls[0].values, [id, 3]);
  assert.equal(db.calls[1].sql, readSql);
});

test('unknown origins cannot read or submit through browser CORS', async () => {
  const db = database();
  const response = await worker.fetch(request('POST', { clientId: id, count: 1 }, { Origin: 'https://unrelated.example' }), { LIKES_DB: db });
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal(db.calls.length, 0);
});

test('preflight supports only the intended methods and content type', async () => {
  const response = await worker.fetch(request('OPTIONS'), {});
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
  assert.equal(response.headers.get('Access-Control-Allow-Methods'), 'GET, POST, OPTIONS');
  assert.equal(response.headers.get('Access-Control-Allow-Headers'), 'Content-Type');
});

test('custom local preview origins must be explicitly allowed', async () => {
  const req = () => request('GET', undefined, { Origin: 'http://127.0.0.1:5174' });
  assert.equal((await worker.fetch(req(), { LIKES_DB: database() })).status, 403);
  const response = await worker.fetch(req(), { LIKES_DB: database(), ALLOWED_ORIGINS: `${origin},http://127.0.0.1:5174` });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'http://127.0.0.1:5174');
});

test('invalid IDs and non-integer or negative counts never reach the database', async () => {
  for (const body of [null, {}, { clientId: 'not-an-id', count: 1 },
    { clientId: id, count: -1 }, { clientId: id, count: 0.5 }, { clientId: id, count: '1' },
    { clientId: id, count: Number.MAX_SAFE_INTEGER + 1 }]) {
    const db = database();
    const response = await worker.fetch(request('POST', JSON.stringify(body)), { LIKES_DB: db });
    assert.equal(response.status, 400);
    assert.equal(db.calls.length, 0);
  }
});

test('malformed JSON, wrong content type, and oversized bodies are rejected', async () => {
  const db = database();
  assert.equal((await worker.fetch(request('POST', '{'), { LIKES_DB: db })).status, 400);
  assert.equal((await worker.fetch(request('POST', '{}', { 'Content-Type': 'text/plain' }), { LIKES_DB: db })).status, 415);
  assert.equal((await worker.fetch(request('POST', 'x'.repeat(513)), { LIKES_DB: db })).status, 413);
  assert.equal(db.calls.length, 0);
});

test('missing bindings and database failures return a recoverable response without SQL details', async () => {
  assert.equal((await worker.fetch(request(), {})).status, 503);
  const response = await worker.fetch(request(), { LIKES_DB: database({ error: new Error('private database internals') }) });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.doesNotMatch(await response.text(), /private|SELECT|like_totals/);
});

test('the database batch-size guard produces a clear response', async () => {
  const response = await worker.fetch(request('POST', { clientId: id, count: 251 }), {
    LIKES_DB: database({ error: new Error('D1_ERROR: heart_increment_too_large') }),
  });
  assert.equal(response.status, 409);
});

test('unknown paths and administrative methods do not expose database operations', async () => {
  assert.equal((await worker.fetch(new Request('https://counter.example/contributors'), {})).status, 404);
  const db = database();
  assert.equal((await worker.fetch(request('DELETE'), { LIKES_DB: db })).status, 405);
  assert.equal(db.calls.length, 0);
});
