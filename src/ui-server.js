const express = require('express');
const path = require('node:path');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { WEB_PORT, UI_DIR } = require('./config');
const { createServer } = require('./mcp-common');

const app = express();
app.use(express.json({ limit: '8mb' }));

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
app.get(/.*/, (_, res) => res.sendFile(path.join(UI_DIR, 'index.html')));

if (require.main === module) {
  app.listen(WEB_PORT, () => {
    console.log(`Firecrawl Router WebUI listening on http://127.0.0.1:${WEB_PORT}`);
    console.log(`Firecrawl Router MCP HTTP listening on http://127.0.0.1:${WEB_PORT}/mcp`);
  });
}

module.exports = { app };
