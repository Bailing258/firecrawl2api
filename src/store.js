const fs = require('node:fs');
const crypto = require('node:crypto');
const { STORE_FILE } = require('./config');

function ensureStore() {
  if (!fs.existsSync(STORE_FILE)) {
    fs.mkdirSync(require('node:path').dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify({ keys: [], roundRobinIndex: 0 }, null, 2));
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
}

function writeStore(store) {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

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

function importKeys(text) {
  const incoming = normalizeKeys(text);
  const store = readStore();
  const existing = new Set(store.keys.map((item) => item.key));
  let added = 0;

  for (const key of incoming) {
    if (existing.has(key)) continue;
    store.keys.push({
      id: crypto.randomUUID(),
      key,
      fingerprint: fingerprint(key),
      maskedKey: maskKey(key),
      addedAt: new Date().toISOString(),
      lastUsedAt: null,
      requestCount: 0,
      lastStatus: 'idle',
      lastError: null,
    });
    existing.add(key);
    added += 1;
  }

  writeStore(store);
  return { added, total: store.keys.length };
}

function exportKeys() {
  return readStore().keys.map((item) => item.key).join('\n');
}

function listKeys() {
  return readStore().keys.map(({ key, ...safe }) => safe);
}

function listKeysWithSecrets() {
  return readStore().keys;
}

function updateKey(id, patch) {
  const store = readStore();
  const idx = store.keys.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  store.keys[idx] = { ...store.keys[idx], ...patch };
  writeStore(store);
  const { key, ...safe } = store.keys[idx];
  return safe;
}

function removeKey(id) {
  const store = readStore();
  const before = store.keys.length;
  store.keys = store.keys.filter((item) => item.id !== id);
  if (store.roundRobinIndex >= store.keys.length) {
    store.roundRobinIndex = 0;
  }
  writeStore(store);
  return before !== store.keys.length;
}

function nextKey() {
  const store = readStore();
  if (!store.keys.length) {
    throw new Error('No Firecrawl API keys configured');
  }
  const index = store.roundRobinIndex % store.keys.length;
  const selected = store.keys[index];
  selected.lastUsedAt = new Date().toISOString();
  selected.requestCount = (selected.requestCount || 0) + 1;
  store.roundRobinIndex = (index + 1) % store.keys.length;
  writeStore(store);
  return selected;
}

module.exports = {
  ensureStore,
  readStore,
  writeStore,
  importKeys,
  exportKeys,
  listKeys,
  listKeysWithSecrets,
  updateKey,
  removeKey,
  nextKey,
  maskKey,
};
