const fs = require('node:fs');
const path = require('node:path');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const ROOT = process.cwd();
loadEnvFile(path.join(ROOT, '.env'));

module.exports = {
  ROOT,
  WEB_PORT: 13456,
  API_PORT: 13457,
  MCP_HTTP_PORT: 13458,
  FIRECRAWL_BASE_URL: process.env.FIRECRAWL_BASE_URL || 'https://api.firecrawl.dev',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://root:123456@192.168.5.20:7726/new-api',
  STORE_FILE: path.join(ROOT, 'data', 'store.json'),
  LEGACY_STORE_FILE: path.join(ROOT, 'data', 'store.json'),
  LOG_FILE: path.join(ROOT, 'data', 'router.log'),
  UI_DIR: path.join(ROOT, 'public'),
  APP_NAME: 'Firecrawl Router Station',
  API_ACCESS_KEY: process.env.API_ACCESS_KEY || '2669521609',
  WEB_LOGIN_PASSWORD: process.env.WEB_LOGIN_PASSWORD || 'Aa:2669521609',
  SESSION_COOKIE_NAME: 'firecrawl_router_session',
};
