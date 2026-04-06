const express = require('express');
const path = require('node:path');
const { WEB_PORT, UI_DIR } = require('./config');

const app = express();
app.use(express.static(UI_DIR));
app.get(/.*/, (_, res) => res.sendFile(path.join(UI_DIR, 'index.html')));

if (require.main === module) {
  app.listen(WEB_PORT, () => {
    console.log(`Firecrawl Router WebUI listening on http://127.0.0.1:${WEB_PORT}`);
  });
}

module.exports = { app };
