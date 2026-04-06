# Firecrawl Router Station

A local Firecrawl v2 proxy station with WebUI, key rotation, MCP, and skill support.

## Ports

- WebUI: `13456`
- API: `13457`
- MCP Streamable HTTP: `13458`
- MCP stdio: local process mode

## Features

- Batch import Firecrawl keys, one key per line
- Batch export all stored keys
- Round-robin key rotation
- Credit usage and token usage overview
- info / error logs
- Firecrawl MCP server
- Firecrawl skill
- Warm light UI theme

## WebUI

Open: `http://127.0.0.1:13456`

Supports:
- batch import keys
- batch export keys
- per-key remaining credits / tokens
- request count, last used time, last error
- info / error logs
- 15-second polling refresh

## API

Base URL: `http://127.0.0.1:13457`

### Admin endpoints

- `POST /admin/keys/import`
- `GET /admin/keys`
- `DELETE /admin/keys/:id`
- `GET /admin/keys/export`
- `GET /admin/overview`
- `GET /admin/logs`
- `GET /health`

### Proxied Firecrawl endpoints

- `POST /v2/scrape`
- `GET /v2/scrape/:id`
- `POST /v2/map`
- `POST /v2/search`
- `POST /v2/crawl`
- `GET /v2/crawl/:id`
- `DELETE /v2/crawl/:id`
- `GET /v2/crawl/:id/errors`
- `GET /v2/crawl/active`
- `POST /v2/extract`
- `GET /v2/extract/:id`
- `POST /v2/batch/scrape`
- `GET /v2/batch/scrape/:id`
- `GET /v2/batch/scrape/:id/errors`
- `DELETE /v2/batch/scrape/:id`
- `GET /v2/team/credit-usage`
- `GET /v2/team/token-usage`
- `GET /v2/team/queue-status`
- `GET /v2/team/activity`

## Run

This repository does not commit installed dependencies such as `node_modules`.

```bash
npm install
npm start
```

After startup:
- WebUI: `http://127.0.0.1:13456`
- API: `http://127.0.0.1:13457`
- MCP HTTP: `http://127.0.0.1:13458/mcp`

## MCP configs

### stdio

File: `mcp/firecrawl-router-stdio.json`

```json
{
  "mcpServers": {
    "firecrawl-router-stdio": {
      "command": "node",
      "args": ["E:/github/firecrawl/src/mcp-stdio.js"]
    }
  }
}
```

### streamable HTTP

File: `mcp/firecrawl-router-http.json`

```json
{
  "mcpServers": {
    "firecrawl-router-http": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:13458/mcp"
    }
  }
}
```

## Skill

Path: `skills/firecrawl-router/SKILL.md`

Use cases:
- scrape / map / search / crawl / extract / batch scrape
- credit usage / token usage
- local Firecrawl router workflow

## Structure

```text
src/        backend and MCP
public/     WebUI
skills/     skill files
mcp/        MCP config examples
data/       local storage
```

## Self-check

```bash
npm run check
```

## Notes

- Keys are stored in `data/store.json`.
- Requests are dispatched by round-robin.
- The UI uses a warm light palette, not purple/blue dark themes.

## References

- Scrape: https://docs.firecrawl.dev/api-reference/endpoint/scrape
- Map: https://docs.firecrawl.dev/api-reference/endpoint/map
- Search: https://docs.firecrawl.dev/api-reference/endpoint/search
- Crawl POST: https://docs.firecrawl.dev/api-reference/endpoint/crawl-post
- Crawl GET: https://docs.firecrawl.dev/api-reference/endpoint/crawl-get
- Crawl DELETE: https://docs.firecrawl.dev/api-reference/endpoint/crawl-delete
- Extract GET: https://docs.firecrawl.dev/api-reference/endpoint/extract-get
- Batch Scrape GET: https://docs.firecrawl.dev/api-reference/endpoint/batch-scrape-get
- Activity: https://docs.firecrawl.dev/api-reference/endpoint/activity
- Credit Usage: https://docs.firecrawl.dev/api-reference/endpoint/credit-usage
- Token Usage: https://docs.firecrawl.dev/api-reference/endpoint/token-usage
