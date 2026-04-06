const fs = require('node:fs');
const path = require('node:path');
const { LOG_FILE } = require('./config');

const logs = [];
const MAX_LOGS = 1000;

function ensureLogFile() {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '');
}

function log(level, message, meta = {}) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    time: new Date().toISOString(),
    level,
    message,
    meta,
  };
  logs.unshift(entry);
  if (logs.length > MAX_LOGS) logs.pop();
  ensureLogFile();
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
  return entry;
}

function info(message, meta) {
  return log('info', message, meta);
}

function error(message, meta) {
  return log('error', message, meta);
}

function getLogs(level, limit = 200) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 200, 500));
  return logs.filter((item) => !level || item.level === level).slice(0, safeLimit);
}

function clearLogs() {
  logs.length = 0;
  ensureLogFile();
  fs.writeFileSync(LOG_FILE, '');
}

module.exports = { info, error, getLogs, clearLogs };
