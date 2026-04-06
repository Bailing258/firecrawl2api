---
name: firecrawl-crawl
description: 使用远程 Firecrawl Router MCP 发起和跟踪全站 crawl / batch scrape 任务，适合异步抓站、批量处理和状态轮询场景。
---

# Firecrawl Crawl

优先使用：
- `crawl_site`
- `get_crawl_status`
- `cancel_crawl`
- `get_crawl_errors`
- `get_active_crawls`
- `batch_scrape`
- `get_batch_scrape_status`
- `get_batch_scrape_errors`
- `cancel_batch_scrape`

## 工作流

1. 先发起任务
2. 记录任务 id
3. 如果用户要求等待结果，继续轮询状态
4. 如果失败，查询 errors

## 输出模板

- 类型：crawl / batch scrape
- 本地路径：`/v2/...`
- 任务 id
- 状态
- 已完成量 / 失败量（如有）
- 下一步建议
