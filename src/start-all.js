const { app: apiApp } = require('./api-server');
const { app: webApp } = require('./ui-server');
const { app: mcpHttpApp } = require('./mcp-http');
const { API_PORT, WEB_PORT, MCP_HTTP_PORT } = require('./config');
const { initializeStore } = require('./store');

(async () => {
  await initializeStore();

  apiApp.listen(API_PORT, () => {
    console.log(`Firecrawl Router API listening on http://127.0.0.1:${API_PORT}`);
  });

  webApp.listen(WEB_PORT, () => {
    console.log(`Firecrawl Router WebUI listening on http://127.0.0.1:${WEB_PORT}`);
    console.log(`Firecrawl Router MCP HTTP listening on http://127.0.0.1:${WEB_PORT}/mcp`);
  });

  mcpHttpApp.listen(MCP_HTTP_PORT, () => {
    console.log(`Firecrawl Router MCP HTTP compatibility listening on http://127.0.0.1:${MCP_HTTP_PORT}/mcp`);
  });
})().catch((error) => {
  console.error('Failed to initialize store:', error);
  process.exit(1);
});
