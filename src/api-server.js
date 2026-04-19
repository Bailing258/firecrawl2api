const express = require('express');
const cors = require('cors');
const { API_PORT } = require('./config');
const { initializeStore, importKeys, exportKeys, listKeys, removeKey } = require('./store');
const { buildDashboardOverview, firecrawlFetch, queryBalanceForKeyId } = require('./firecrawl-client');
const logger = require('./logger');
const { requireLogin, requireApiKey, loginHandler, logoutHandler, meHandler } = require('./auth');

const app = express();
app.set('trust proxy', true);

const allowlist = new Set([
  'http://127.0.0.1:13456',
  'http://localhost:13456',
  'https://fire.bailingzzz.us.ci'
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowlist.has(origin)) return callback(null, true);
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '8mb' }));
app.use(express.text({ type: 'text/plain', limit: '8mb' }));

app.get('/health', (_, res) => {
  res.json({ ok: true, port: API_PORT, now: new Date().toISOString() });
});

app.post('/auth/login', loginHandler);
app.post('/auth/logout', logoutHandler);
app.get('/auth/me', meHandler);

app.post('/admin/keys/import', requireLogin, async (req, res) => {
  try {
    const text = typeof req.body === 'string' ? req.body : req.body?.keysText;
    const result = await importKeys(text || '');
    logger.info('Imported Firecrawl keys', result);
    res.json({ ok: true, ...result });
  } catch (err) {
    logger.error('Import keys failed', { message: err.message });
    res.status(500).json({ ok: false, message: err.message });
  }
});
app.get('/admin/keys', requireLogin, async (_, res) => {
  try {
    res.json({ ok: true, keys: await listKeys() });
  } catch (err) {
    logger.error('List keys failed', { message: err.message });
    res.status(500).json({ ok: false, message: err.message });
  }
});
app.get('/admin/keys/:id/balance', requireLogin, async (req, res) => {
  try {
    const key = await queryBalanceForKeyId(req.params.id);
    res.json({ ok: true, key });
  } catch (err) {
    logger.error('Balance query failed', { id: req.params.id, message: err.message });
    res.status(500).json({ ok: false, message: err.message });
  }
});
app.delete('/admin/keys/:id', requireLogin, async (req, res) => {
  try {
    const ok = await removeKey(req.params.id);
    if (!ok) return res.status(404).json({ ok: false, message: 'Key not found' });
    logger.info('Removed Firecrawl key', { id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    logger.error('Remove key failed', { id: req.params.id, message: err.message });
    res.status(500).json({ ok: false, message: err.message });
  }
});
app.get('/admin/keys/export', requireLogin, async (_, res) => {
  try {
    const keys = await exportKeys();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="firecrawl-keys.txt"');
    res.send(keys);
  } catch (err) {
    logger.error('Export keys failed', { message: err.message });
    res.status(500).json({ ok: false, message: err.message });
  }
});
app.get('/admin/overview', requireLogin, async (_, res) => {
  try {
    const data = await buildDashboardOverview();
    res.json({ ok: true, ...data });
  } catch (err) {
    logger.error('Overview query failed', { message: err.message });
    res.status(500).json({ ok: false, message: err.message });
  }
});
app.get('/admin/logs', requireLogin, (req, res) => {
  const { level, limit } = req.query;
  res.json({ ok: true, logs: logger.getLogs(level, limit) });
});
app.post('/admin/logs/clear', requireLogin, (_, res) => {
  logger.clearLogs();
  res.json({ ok: true, message: '日志已清空' });
});

async function proxyHandler(req, res) {
  try {
    const result = await firecrawlFetch(req.originalUrl, {
      method: req.method,
      body: ['GET', 'DELETE'].includes(req.method) ? undefined : req.body,
    });
    res.status(result.status).json(result.data);
  } catch (err) {
    logger.error('Unhandled proxy error', { path: req.originalUrl, message: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
}

app.use('/v2', requireApiKey, proxyHandler);

if (require.main === module) {
  initializeStore()
    .then(() => {
      app.listen(API_PORT, () => {
        logger.info('API server started', { port: API_PORT });
        console.log(`Firecrawl Router API listening on http://127.0.0.1:${API_PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to initialize store:', err);
      process.exit(1);
    });
}

module.exports = { app };
