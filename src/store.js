const fs = require('node:fs');
const crypto = require('node:crypto');
const { Pool } = require('pg');
const { DATABASE_URL, LEGACY_STORE_FILE } = require('./config');

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
});

let initPromise = null;

function maskKey(key) {
  if (!key) return '';
  if (key.length <= 10) return `${key.slice(0, 3)}***${key.slice(-2)}`;
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

function fingerprint(key) {
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 16);
}

function normalizeKeys(text) {
  return [...new Set(String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean))];
}

function createKeyRecord(key) {
  return {
    id: crypto.randomUUID(),
    key,
    fingerprint: fingerprint(key),
    maskedKey: maskKey(key),
    addedAt: new Date().toISOString(),
    lastUsedAt: null,
    requestCount: 0,
    lastStatus: 'idle',
    lastError: null,
    balance: {
      remainingCredits: null,
      planCredits: null,
      usedCredits: null,
      remainingTokens: null,
      planTokens: null,
      usedTokens: null,
      billingPeriodStart: null,
      billingPeriodEnd: null,
      lastCheckedAt: null,
    },
  };
}

function sanitizeKey(item) {
  const { key, ...safe } = item;
  return safe;
}

function toIso(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function normalizeBalance(balance) {
  const base = {
    remainingCredits: null,
    planCredits: null,
    usedCredits: null,
    remainingTokens: null,
    planTokens: null,
    usedTokens: null,
    billingPeriodStart: null,
    billingPeriodEnd: null,
    lastCheckedAt: null,
  };
  if (!balance || typeof balance !== 'object' || Array.isArray(balance)) {
    return base;
  }
  return { ...base, ...balance };
}

function rowToKeyRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    key: row.key,
    fingerprint: row.fingerprint,
    maskedKey: row.masked_key,
    addedAt: toIso(row.added_at),
    lastUsedAt: toIso(row.last_used_at),
    requestCount: Number(row.request_count || 0),
    lastStatus: row.last_status || 'idle',
    lastError: row.last_error || null,
    balance: normalizeBalance(row.balance),
  };
}

async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function ensureStore() {
  if (!initPromise) {
    initPromise = initializeStore().catch((error) => {
      initPromise = null;
      throw error;
    });
  }
  await initPromise;
}

async function initializeStore() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS router_store_state (
      id INTEGER PRIMARY KEY,
      round_robin_index INTEGER NOT NULL DEFAULT 0,
      legacy_imported_at TIMESTAMPTZ NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS firecrawl_keys (
      id UUID PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      fingerprint TEXT NOT NULL,
      masked_key TEXT NOT NULL,
      added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_used_at TIMESTAMPTZ NULL,
      request_count INTEGER NOT NULL DEFAULT 0,
      last_status TEXT NOT NULL DEFAULT 'idle',
      last_error TEXT NULL,
      balance JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `);

  await pool.query(`
    INSERT INTO router_store_state (id, round_robin_index)
    VALUES (1, 0)
    ON CONFLICT (id) DO NOTHING
  `);

  await migrateLegacyStoreIfNeeded();
}

async function migrateLegacyStoreIfNeeded() {
  const stateResult = await pool.query(
    'SELECT legacy_imported_at FROM router_store_state WHERE id = 1'
  );
  const alreadyImported = stateResult.rows[0]?.legacy_imported_at;
  if (alreadyImported) return;

  let importedRoundRobinIndex = 0;
  let legacyKeys = [];

  if (fs.existsSync(LEGACY_STORE_FILE)) {
    const raw = fs.readFileSync(LEGACY_STORE_FILE, 'utf8').trim();
    if (raw) {
      const parsed = JSON.parse(raw);
      importedRoundRobinIndex = Number(parsed.roundRobinIndex || 0);
      legacyKeys = Array.isArray(parsed.keys) ? parsed.keys : [];
    }
  }

  await withTransaction(async (client) => {
    const countResult = await client.query('SELECT COUNT(*)::int AS count FROM firecrawl_keys');
    const existingCount = Number(countResult.rows[0]?.count || 0);

    for (const item of legacyKeys) {
      const record = {
        ...createKeyRecord(item.key),
        ...item,
        fingerprint: item.fingerprint || fingerprint(item.key),
        maskedKey: item.maskedKey || maskKey(item.key),
        balance: normalizeBalance(item.balance),
      };
      await upsertKeyRecord(record, client);
    }

    if (!existingCount) {
      await client.query(
        `UPDATE router_store_state
         SET round_robin_index = $1,
             legacy_imported_at = NOW(),
             updated_at = NOW()
         WHERE id = 1`,
        [Math.max(0, importedRoundRobinIndex)]
      );
    } else {
      await client.query(
        `UPDATE router_store_state
         SET legacy_imported_at = NOW(),
             updated_at = NOW()
         WHERE id = 1`
      );
    }
  });
}

async function upsertKeyRecord(record, executor = pool) {
  await executor.query(
    `INSERT INTO firecrawl_keys (
      id, key, fingerprint, masked_key, added_at, last_used_at,
      request_count, last_status, last_error, balance
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
    ON CONFLICT (key) DO UPDATE SET
      fingerprint = EXCLUDED.fingerprint,
      masked_key = EXCLUDED.masked_key,
      added_at = COALESCE(firecrawl_keys.added_at, EXCLUDED.added_at),
      last_used_at = COALESCE(EXCLUDED.last_used_at, firecrawl_keys.last_used_at),
      request_count = GREATEST(firecrawl_keys.request_count, EXCLUDED.request_count),
      last_status = COALESCE(EXCLUDED.last_status, firecrawl_keys.last_status),
      last_error = COALESCE(EXCLUDED.last_error, firecrawl_keys.last_error),
      balance = CASE
        WHEN firecrawl_keys.balance = '{}'::jsonb THEN EXCLUDED.balance
        ELSE firecrawl_keys.balance
      END`,
    [
      record.id,
      record.key,
      record.fingerprint,
      record.maskedKey,
      record.addedAt || new Date().toISOString(),
      record.lastUsedAt,
      Number(record.requestCount || 0),
      record.lastStatus || 'idle',
      record.lastError || null,
      JSON.stringify(normalizeBalance(record.balance)),
    ]
  );
}

async function readStore() {
  await ensureStore();
  const [keysResult, stateResult] = await Promise.all([
    pool.query('SELECT * FROM firecrawl_keys ORDER BY added_at, id'),
    pool.query('SELECT round_robin_index FROM router_store_state WHERE id = 1'),
  ]);
  return {
    keys: keysResult.rows.map(rowToKeyRecord),
    roundRobinIndex: Number(stateResult.rows[0]?.round_robin_index || 0),
  };
}

async function writeStore(store) {
  await ensureStore();
  const keys = Array.isArray(store?.keys) ? store.keys : [];
  const roundRobinIndex = Math.max(0, Number(store?.roundRobinIndex || 0));

  await withTransaction(async (client) => {
    await client.query('DELETE FROM firecrawl_keys');
    for (const item of keys) {
      const record = {
        ...createKeyRecord(item.key),
        ...item,
        fingerprint: item.fingerprint || fingerprint(item.key),
        maskedKey: item.maskedKey || maskKey(item.key),
        balance: normalizeBalance(item.balance),
      };
      await upsertKeyRecord(record, client);
    }
    await client.query(
      `UPDATE router_store_state
       SET round_robin_index = $1,
           updated_at = NOW()
       WHERE id = 1`,
      [roundRobinIndex]
    );
  });
}

async function importKeys(text) {
  await ensureStore();
  const incoming = normalizeKeys(text);
  let added = 0;

  for (const key of incoming) {
    const result = await pool.query(
      `INSERT INTO firecrawl_keys (
        id, key, fingerprint, masked_key, added_at, request_count, last_status, balance
      )
      VALUES ($1, $2, $3, $4, NOW(), 0, 'idle', $5::jsonb)
      ON CONFLICT (key) DO NOTHING`,
      [
        crypto.randomUUID(),
        key,
        fingerprint(key),
        maskKey(key),
        JSON.stringify(normalizeBalance(null)),
      ]
    );
    added += result.rowCount || 0;
  }

  const totalResult = await pool.query('SELECT COUNT(*)::int AS count FROM firecrawl_keys');
  return { added, total: Number(totalResult.rows[0]?.count || 0) };
}

async function exportKeys() {
  await ensureStore();
  const result = await pool.query('SELECT key FROM firecrawl_keys ORDER BY added_at, id');
  return result.rows.map((item) => item.key).join('\n');
}

async function listKeys() {
  await ensureStore();
  const result = await pool.query('SELECT * FROM firecrawl_keys ORDER BY added_at, id');
  return result.rows.map((row) => sanitizeKey(rowToKeyRecord(row)));
}

async function listKeysWithSecrets() {
  await ensureStore();
  const result = await pool.query('SELECT * FROM firecrawl_keys ORDER BY added_at, id');
  return result.rows.map(rowToKeyRecord);
}

async function getKeyById(id) {
  await ensureStore();
  const result = await pool.query('SELECT * FROM firecrawl_keys WHERE id = $1 LIMIT 1', [id]);
  return rowToKeyRecord(result.rows[0]);
}

async function updateKey(id, patch) {
  await ensureStore();
  const current = await getKeyById(id);
  if (!current) return null;

  const merged = {
    ...current,
    ...patch,
    key: patch?.key || current.key,
    fingerprint: patch?.fingerprint || current.fingerprint || fingerprint(patch?.key || current.key),
    maskedKey: patch?.maskedKey || current.maskedKey || maskKey(patch?.key || current.key),
    balance: patch?.balance ? normalizeBalance(patch.balance) : normalizeBalance(current.balance),
  };

  const result = await pool.query(
    `UPDATE firecrawl_keys
     SET key = $2,
         fingerprint = $3,
         masked_key = $4,
         added_at = $5,
         last_used_at = $6,
         request_count = $7,
         last_status = $8,
         last_error = $9,
         balance = $10::jsonb
     WHERE id = $1
     RETURNING *`,
    [
      id,
      merged.key,
      merged.fingerprint,
      merged.maskedKey,
      merged.addedAt || current.addedAt || new Date().toISOString(),
      merged.lastUsedAt,
      Number(merged.requestCount || 0),
      merged.lastStatus || 'idle',
      merged.lastError || null,
      JSON.stringify(merged.balance),
    ]
  );
  return sanitizeKey(rowToKeyRecord(result.rows[0]));
}

async function removeKey(id) {
  await ensureStore();
  return withTransaction(async (client) => {
    const deleteResult = await client.query('DELETE FROM firecrawl_keys WHERE id = $1', [id]);
    const totalResult = await client.query('SELECT COUNT(*)::int AS count FROM firecrawl_keys');
    const total = Number(totalResult.rows[0]?.count || 0);
    await client.query(
      `UPDATE router_store_state
       SET round_robin_index = CASE
         WHEN $1 <= 0 THEN 0
         WHEN round_robin_index >= $1 THEN 0
         ELSE round_robin_index
       END,
       updated_at = NOW()
       WHERE id = 1`,
      [total]
    );
    return deleteResult.rowCount > 0;
  });
}

async function nextKey() {
  await ensureStore();
  return withTransaction(async (client) => {
    const stateResult = await client.query(
      'SELECT round_robin_index FROM router_store_state WHERE id = 1 FOR UPDATE'
    );
    const currentIndex = Number(stateResult.rows[0]?.round_robin_index || 0);

    const countResult = await client.query('SELECT COUNT(*)::int AS count FROM firecrawl_keys');
    const total = Number(countResult.rows[0]?.count || 0);
    if (!total) {
      throw new Error('No Firecrawl API keys configured');
    }

    const effectiveIndex = ((currentIndex % total) + total) % total;
    const selectedResult = await client.query(
      `SELECT * FROM firecrawl_keys
       ORDER BY added_at, id
       OFFSET $1
       LIMIT 1`,
      [effectiveIndex]
    );
    const selected = selectedResult.rows[0];
    if (!selected) {
      throw new Error('No Firecrawl API keys configured');
    }

    const updatedKeyResult = await client.query(
      `UPDATE firecrawl_keys
       SET last_used_at = NOW(),
           request_count = request_count + 1
       WHERE id = $1
       RETURNING *`,
      [selected.id]
    );

    await client.query(
      `UPDATE router_store_state
       SET round_robin_index = $1,
           updated_at = NOW()
       WHERE id = 1`,
      [(effectiveIndex + 1) % total]
    );

    return rowToKeyRecord(updatedKeyResult.rows[0]);
  });
}

module.exports = {
  ensureStore,
  initializeStore,
  readStore,
  writeStore,
  importKeys,
  exportKeys,
  listKeys,
  listKeysWithSecrets,
  getKeyById,
  updateKey,
  removeKey,
  nextKey,
  maskKey,
  pool,
};
