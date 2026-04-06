---
name: firecrawl-scrape
description: 使用远程 Firecrawl Router MCP 执行单页抓取、抓取结果查询和主内容提取，适合 scrape、markdown/html/json 内容获取场景。
---

# Firecrawl Scrape

优先使用：
- `scrape_url`
- `get_scrape_status`

## 使用模式

### 直接抓取页面
当用户要抓一个页面内容、转 markdown、取正文、取 html/json 时：
- 调用 `scrape_url`
- 常用参数：`url`、`formats`、`onlyMainContent`、`waitFor`

### 查询抓取结果
当用户给了 scrape id 或要求查之前的结果时：
- 调用 `get_scrape_status`

## 返回内容

尽量提炼：
- 标题
- URL
- 主要正文长度
- 是否成功
- 关键结构化字段

如果用户要求完整原文，再补 JSON 片段。
