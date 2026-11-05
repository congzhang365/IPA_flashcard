/** Public hearts API. Database access stays inside this Worker. No account/login API. */
const READ_LIKES_SQL = `SELECT total,
  COALESCE((SELECT hearts FROM like_contributions WHERE client_id = ?1), 0) AS mine
  FROM like_totals WHERE id = 1`;
const SAVE_LIKES_SQL = `INSERT INTO like_contributions (client_id, hearts) VALUES (?1, ?2)
  ON CONFLICT(client_id) DO UPDATE SET hearts = excluded.hearts, updated_at = CURRENT_TIMESTAMP
  WHERE excluded.hearts > like_contributions.hearts`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const count = value => Number.isSafeInteger(value) && value >= 0;

function response(body, status, origin, extra = {}) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status, headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin',
      ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}), ...extra,
    },
  });
}

function checkedResult(row) {
  if (!row || !count(row.total) || !count(row.mine) || row.mine > row.total) throw new Error('Counter unavailable');
  return { total: row.total, mine: row.mine };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || 'https://congzhang365.github.io')
      .split(',').map(value => value.trim()).filter(Boolean);
    if (origin && !allowed.includes(origin)) return response({ error: 'Origin not allowed' }, 403, null);
    const url = new URL(request.url);
    if (url.pathname !== '/likes') return response({ error: 'Not found' }, 404, origin);
    if (request.method === 'OPTIONS') return response(null, 204, origin, {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400',
    });
    if (!['GET', 'POST'].includes(request.method)) return response({ error: 'Method not allowed' }, 405, origin, { Allow: 'GET, POST, OPTIONS' });
    if (!env.LIKES_DB) return response({ error: 'Counter temporarily unavailable' }, 503, origin, { 'Retry-After': '60' });

    try {
      if (request.method === 'GET') {
        const id = url.searchParams.get('clientId') || '';
        if (id && !UUID.test(id)) return response({ error: 'Invalid counter identifier' }, 400, origin);
        const row = await env.LIKES_DB.prepare(READ_LIKES_SQL).bind(id.toLowerCase()).first();
        return response(checkedResult(row), 200, origin);
      }

      if (!origin) return response({ error: 'Origin required' }, 403, null);
      if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') {
        return response({ error: 'JSON required' }, 415, origin);
      }
      if (Number(request.headers.get('Content-Length')) > 512) return response({ error: 'Request too large' }, 413, origin);
      // Bound streamed bodies too; do not allocate an arbitrarily large request.
      const reader = request.body?.getReader();
      if (!reader) return response({ error: 'Missing request body' }, 400, origin);
      const chunks = [];
      let length = 0;
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        length += next.value.byteLength;
        if (length > 512) { await reader.cancel(); return response({ error: 'Request too large' }, 413, origin); }
        chunks.push(next.value);
      }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      let body;
      try { body = JSON.parse(new TextDecoder().decode(bytes)); }
      catch { return response({ error: 'Invalid JSON' }, 400, origin); }
      if (!body || typeof body.clientId !== 'string' || !UUID.test(body.clientId) || !count(body.count)) {
        return response({ error: 'Invalid heart count' }, 400, origin);
      }
      const id = body.clientId.toLowerCase();
      // D1 batches are atomic. SQL triggers add only the new contribution delta.
      const results = await env.LIKES_DB.batch([
        env.LIKES_DB.prepare(SAVE_LIKES_SQL).bind(id, body.count),
        env.LIKES_DB.prepare(READ_LIKES_SQL).bind(id),
      ]);
      return response(checkedResult(results[1]?.results?.[0]), 200, origin);
    } catch (error) {
      if (String(error).includes('heart_increment_too_large')) return response({ error: 'Please sync hearts in smaller batches' }, 409, origin);
      return response({ error: 'Counter temporarily unavailable' }, 503, origin, { 'Retry-After': '60' });
    }
  },
};
