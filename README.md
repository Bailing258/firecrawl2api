# Firecrawl Router Station

本项目是一个基于 Firecrawl 官方 v2 路径的本地中转站，提供：

- WebUI：`13456`
- API：`13457`
- MCP Streamable HTTP：`13458`
- MCP stdio
- 多 Key 轮询（round-robin）
- 批量导入/导出 key
- 余额 / 用量查询
- info / error 日志
- Firecrawl skill

## 功能概览

### WebUI

访问：`http://127.0.0.1:13456`

支持：
- 批量导入 key（每行一个）
- 批量导出 key
- 查看每个 key 的剩余 Credits / Tokens
- 查看累计请求数、最近使用时间、错误状态
- 查看 info / error 日志
- 15 秒轮询刷新

### API

访问：`http://127.0.0.1:13457`

管理接口：
- `POST /admin/keys/import`
- `GET /admin/keys`
- `DELETE /admin/keys/:id`
- `GET /admin/keys/export`
- `GET /admin/overview`
- `GET /admin/logs`
- `GET /health`

代理的 Firecrawl 路径：
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

## 运行

> 仓库不会提交 `node_modules` 等已安装依赖。

```bash
npm install
npm start
```

启动后：
- WebUI: `http://127.0.0.1:13456`
- API: `http://127.0.0.1:13457`
- MCP HTTP: `http://127.0.0.1:13458/mcp`

## MCP 配置

### stdio

文件：`mcp/firecrawl-router-stdio.json`

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

文件：`mcp/firecrawl-router-http.json`

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

路径：`skills/firecrawl-router/SKILL.md`

适用于：
- scrape / map / search / crawl / extract / batch scrape
- Firecrawl 余额 / 用量查询
- 本地中转站工作流

## 目录结构

```text
src/        服务端与 MCP
public/     WebUI
skills/     Skill
mcp/        MCP 配置样例
data/       本地存储
```

## 自检

```bash
npm run check
```

## 说明

- Key 在本地 `data/store.json` 管理。
- 中转站请求会按 key 轮询。
- WebUI 使用暖色系设计，未使用紫/蓝暗色调。

## 参考文档

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
