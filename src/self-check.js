const { app: apiApp } = require('./api-server');
const { app: webApp } = require('./ui-server');
const { createServer } = require('./mcp-common');

console.log('api routes ok:', typeof apiApp === 'function');
console.log('web routes ok:', typeof webApp === 'function');
console.log('mcp server ok:', !!createServer());
