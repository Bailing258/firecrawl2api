const { app: webApp } = require('./ui-server');
const { API_PORT } = require('./config');
const { initializeStore } = require('./store');

(async () => {
  await initializeStore();

  webApp.listen(API_PORT, () => {
    console.log(`Firecrawl Router WebUI listening on http://127.0.0.1:${API_PORT}`);
    console.log(`Firecrawl Router API listening on http://127.0.0.1:${API_PORT}/api`);
    console.log(`Firecrawl Router MCP HTTP listening on http://127.0.0.1:${API_PORT}/mcp`);
  });
})().catch((error) => {
  console.error('Failed to initialize store:', error);
  process.exit(1);
});
