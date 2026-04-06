---
name: firecrawl-router-station
description: 使用本地 Firecrawl Router Station（API 13457，MCP 走 WebUI 同域的 /mcp，即 13456/mcp）访问 Firecrawl 的完整 /v2 API 面，包括 scrape、map、search、crawl、extract、batch scrape、browser、interact、agent、team usage，以及通用原始请求。提到 firecrawl、本地中转、SDK 走本地代理、browser/interact/agent、余额/用量查询时使用。
---

# Firecrawl Router Station

优先走本地中转站，而不是直接请求远端 Firecrawl。目标是让 SDK、脚本和人工调试都只依赖本地中转。

## 连接约定

- Router API：`http://127.0.0.1:13457`
- MCP Streamable HTTP：`http://127.0.0.1:13456/mcp`
- 轮询策略：中转站内部按 key round-robin
- API 调用密码：请求头 `x-api-key` 或 `Authorization: Bearer ...`

## 能力范围

本地中转对外暴露完整 ` /v2/* ` 代理面，因此后续官方新增的同类 v2 端点也可以直接从本地走通。当前重点已覆盖：

- `scrape`
- `map`
- `search`
- `crawl`
- `extract`
- `batch/scrape`
- `browser`
- `interact`
- `agent`
- `team/credit-usage`
- `team/token-usage`
- `team/activity`
- `team/queue-status`
- `llmstxt`（alpha / deprecated）
- `deep-research`（alpha / deprecated）

## 工作流

1. 先判断任务类型：`scrape` / `map` / `search` / `crawl` / `extract` / `batch scrape` / `browser` / `interact` / `agent` / `usage`。
2. 若是常规任务，优先调用对应本地路径，如：
   - `POST /v2/scrape`
   - `POST /v2/browser`
   - `POST /v2/agent`
   - `POST /v2/scrape/{id}/interact`
3. 若是异步任务（crawl / extract / batch scrape / agent / deep-research），先发起任务，再轮询对应 GET 状态路径直到完成或失败。
4. 若官方新增路径、SDK 内部路径、或你不确定路径是否已被专门封装，直接使用本地 ` /v2/* ` 原始请求能力，不必绕过中转。
5. 汇报结果时同时给出：调用的本地路径、关键参数、任务 id、最终状态。

## MCP 使用建议

- 常见任务优先用专门 tool：如 `scrape_url`、`browser_create`、`agent_run`、`interact_start`。
- 不确定端点时，使用 `firecrawl_raw_request`。
- 查询余额/用量时，优先说明 `remainingCredits`、`usedCredits`、`remainingTokens`、`usedTokens`。

## 输出偏好

- 默认返回精简摘要。
- 如果用户要原始结果，再附 JSON 片段。
- 对于 alpha/deprecated 能力，要注明它来自 Firecrawl 官方 alpha/deprecated 区域。
