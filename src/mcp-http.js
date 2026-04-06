const { createMcpExpressApp } = require('@modelcontextprotocol/sdk/server/express.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { createServer } = require('./mcp-common');
const { MCP_HTTP_PORT } = require('./config');

const app = createMcpExpressApp();

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

if (require.main === module) {
  app.listen(MCP_HTTP_PORT, () => {
    console.log(`Firecrawl Router MCP HTTP listening on http://127.0.0.1:${MCP_HTTP_PORT}/mcp`);
  });
}

module.exports = { app };
