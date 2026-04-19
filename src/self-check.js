const { app: apiApp } = require('./api-server');
const { app: webApp } = require('./ui-server');
const { createServer } = require('./mcp-common');
const { initializeStore } = require('./store');

(async () => {
  await initializeStore();
  console.log('api routes ok:', typeof apiApp === 'function');
  console.log('web routes ok:', typeof webApp === 'function');
  console.log('mcp server ok:', !!createServer());
})().catch((error) => {
  console.error('self-check failed:', error);
  process.exit(1);
});
