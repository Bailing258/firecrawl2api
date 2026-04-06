const path = require('node:path');

const ROOT = process.cwd();

module.exports = {
  ROOT,
  WEB_PORT: 13456,
  API_PORT: 13457,
  MCP_HTTP_PORT: 13458,
  FIRECRAWL_BASE_URL: process.env.FIRECRAWL_BASE_URL || 'https://api.firecrawl.dev',
  STORE_FILE: path.join(ROOT, 'data', 'store.json'),
  LOG_FILE: path.join(ROOT, 'data', 'router.log'),
  UI_DIR: path.join(ROOT, 'public'),
  APP_NAME: 'Firecrawl Router Station',
};
