const express = require('express');
const cors = require('cors');
const { API_PORT } = require('./config');
const { importKeys, exportKeys, listKeys, removeKey } = require('./store');
const { buildDashboardOverview, firecrawlFetch } = require('./firecrawl-client');
const logger = require('./logger');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.text({ type: 'text/plain', limit: '2mb' }));

app.get('/health', (_, res) => {
  res.json({ ok: true, port: API_PORT, now: new Date().toISOString() });
});

app.post('/admin/keys/import', (req, res) => {
  const text = typeof req.body === 'string' ? req.body : req.body?.keysText;
  const result = importKeys(text || '');
  logger.info('Imported Firecrawl keys', result);
  res.json({ ok: true, ...result });
});

app.get('/admin/keys', (_, res) => {
  res.json({ ok: true, keys: listKeys() });
});

app.delete('/admin/keys/:id', (req, res) => {
  const ok = removeKey(req.params.id);
  if (!ok) return res.status(404).json({ ok: false, message: 'Key not found' });
  logger.info('Removed Firecrawl key', { id: req.params.id });
  res.json({ ok: true });
});

app.get('/admin/keys/export', (_, res) => {
  const keys = exportKeys();
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="firecrawl-keys.txt"');
  res.send(keys);
});

app.get('/admin/overview', async (_, res) => {
  try {
    const data = await buildDashboardOverview();
    res.json({ ok: true, ...data });
  } catch (err) {
    logger.error('Overview query failed', { message: err.message });
    res.status(500).json({ ok: false, message: err.message });
  }
});

app.get('/admin/logs', (req, res) => {
  const { level, limit } = req.query;
  res.json({ ok: true, logs: logger.getLogs(level, limit) });
});

const passthroughRoutes = [
  ['POST', '/v2/scrape'],
  ['GET', '/v2/scrape/:id'],
  ['POST', '/v2/map'],
  ['POST', '/v2/search'],
  ['POST', '/v2/crawl'],
  ['GET', '/v2/crawl/:id'],
  ['DELETE', '/v2/crawl/:id'],
  ['GET', '/v2/crawl/:id/errors'],
  ['GET', '/v2/crawl/active'],
  ['POST', '/v2/extract'],
  ['GET', '/v2/extract/:id'],
  ['POST', '/v2/batch/scrape'],
  ['GET', '/v2/batch/scrape/:id'],
  ['GET', '/v2/batch/scrape/:id/errors'],
  ['DELETE', '/v2/batch/scrape/:id'],
  ['GET', '/v2/team/credit-usage'],
  ['GET', '/v2/team/token-usage'],
  ['GET', '/v2/team/queue-status'],
  ['GET', '/v2/team/activity'],
];

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

for (const [method, route] of passthroughRoutes) {
  app[method.toLowerCase()](route, proxyHandler);
}

if (require.main === module) {
  app.listen(API_PORT, () => {
    logger.info('API server started', { port: API_PORT });
    console.log(`Firecrawl Router API listening on http://127.0.0.1:${API_PORT}`);
  });
}

module.exports = { app };
