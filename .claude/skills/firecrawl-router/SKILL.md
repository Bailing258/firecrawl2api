---
name: firecrawl-router
description: 使用远程 Firecrawl Router MCP 作为统一入口，默认连接 https://fire.bailingzzz.us.ci/mcp，适合不确定该选哪个 Firecrawl 能力、想让 Claude 自动挑选 scrape/map/search/crawl/extract/browser/interact/agent/raw-request 工具时使用。
---

# Firecrawl Router

这个 skill 是总入口。它假设 Claude Code 已通过 `.mcp.json` 连接到远程 MCP：

- 服务名：`firecrawl-router-http`
- MCP 地址：`https://fire.bailingzzz.us.ci/mcp`
- API 域名：`https://fire.bailingzzz.us.ci`

## 默认策略

1. 优先使用专用工具，而不是 `firecrawl_raw_request`。
2. 只有在不确定官方端点、或 SDK / 新能力还没做专用封装时，才退回 `firecrawl_raw_request`。
3. 对异步任务（crawl / extract / batch scrape / agent / deep research）必须返回：
   - 发起路径
   - 任务 id
   - 当前状态

## 工具选择

- 页面抓取：`scrape_url`
- 单次抓取结果：`get_scrape_status`
- 站点映射：`map_site`
- 搜索：`search_web`
- 全站抓取：`crawl_site` / `get_crawl_status`
- 提取结构化数据：`extract_data` / `get_extract_status`
- 批量抓取：`batch_scrape` / `get_batch_scrape_status`
- 浏览器：`browser_list` / `browser_create` / `browser_execute` / `browser_delete`
- 交互：`interact_start` / `interact_stop`
- Agent：`agent_run` / `agent_status`
- 用量：`get_credit_usage` / `get_token_usage` / `get_activity` / `get_queue_status`
- 原始请求：`firecrawl_raw_request`
