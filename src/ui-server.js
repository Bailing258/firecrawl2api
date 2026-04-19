const express = require('express');
const path = require('node:path');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { API_PORT, UI_DIR } = require('./config');
const { createServer } = require('./mcp-common');
const { app: apiApp } = require('./api-server');

const app = express();
app.use(express.json({ limit: '8mb' }));
app.use('/api', apiApp);

app.post('/mcp', async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on('close', () => {
      transport.close();
      server.close();
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: error.message }, id: null });
    }
  }
});

app.get('/mcp', (req, res) => {
  res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null });
});

app.use(express.static(UI_DIR));
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/mcp')) return next();
  return res.sendFile(path.join(UI_DIR, 'index.html'));
});

if (require.main === module) {
  app.listen(API_PORT, () => {
    console.log(`Firecrawl Router WebUI listening on http://127.0.0.1:${API_PORT}`);
    console.log(`Firecrawl Router API listening on http://127.0.0.1:${API_PORT}/api`);
    console.log(`Firecrawl Router MCP HTTP listening on http://127.0.0.1:${API_PORT}/mcp`);
  });
}

module.exports = { app };
