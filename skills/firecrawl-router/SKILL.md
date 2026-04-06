---
name: firecrawl-router-station
description: Use the local Firecrawl Router Station (API 13457, MCP 13458) for scrape, map, search, crawl, extract, batch scrape, and usage queries. Trigger when the task mentions Firecrawl, local proxy routing, key rotation, or usage checks.
---

# Firecrawl Router Station

Prefer the local router instead of calling the remote Firecrawl endpoint directly.

## Connection

- Router API: `http://127.0.0.1:13457`
- MCP Streamable HTTP: `http://127.0.0.1:13458/mcp`
- Rotation mode: internal round-robin across keys

## Workflow

1. Identify the task type: `scrape`, `map`, `search`, `crawl`, `extract`, `batch scrape`, or `usage`.
2. For direct HTTP calls, use these local paths:
   - `POST /v2/scrape`
   - `GET /v2/scrape/{id}`
   - `POST /v2/map`
   - `POST /v2/search`
   - `POST /v2/crawl`
   - `GET /v2/crawl/{id}`
   - `DELETE /v2/crawl/{id}`
   - `GET /v2/crawl/{id}/errors`
   - `POST /v2/extract`
   - `GET /v2/extract/{id}`
   - `POST /v2/batch/scrape`
   - `GET /v2/batch/scrape/{id}`
   - `GET /v2/team/credit-usage`
   - `GET /v2/team/token-usage`
   - `GET /v2/team/activity`
3. For async jobs (crawl / extract / batch scrape), start the job first, then poll the matching GET status endpoint until completion or failure.
4. In the final answer, include the local path used, key parameters, job id, and final status.

## Output style

- Default to concise summaries.
- Include raw JSON only when the user asks for it.
- For usage queries, prioritize `remainingCredits` and `remainingTokens`.
