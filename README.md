# Firecrawl Router Station

这是一个基于 Firecrawl 官方 v2 路径的本地中转站，提供：中文 WebUI、多 Key 轮询、MCP、Skill，以及基于环境变量的登录密码 / API 密钥保护。

## 端口

- WebUI：`13456`
- API：`13457`
- MCP Streamable HTTP：`13458`
- MCP stdio：本地进程模式

## 功能

- 批量导入 Firecrawl Key（每行一个）
- 批量导出所有已保存 Key
- Round-Robin 轮询分发
- Credits / Tokens 用量概览
- info / error 日志
- WebUI 登录密码保护
- API 调用密钥保护
- Firecrawl MCP Server
- Firecrawl Skill
- 暖色系中文界面

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

当前默认值：

```env
FIRECRAWL_BASE_URL=https://api.firecrawl.dev
API_ACCESS_KEY=2669521609
WEB_LOGIN_PASSWORD=Aa:2669521609
```

说明：
- `WEB_LOGIN_PASSWORD`：WebUI 登录密码
- `API_ACCESS_KEY`：直连 API 时的调用密钥

## 启动

仓库不会提交已安装依赖（如 `node_modules`）和本地敏感配置（如 `.env`）。

```bash
npm install
npm start
```

启动后：
- WebUI：`http://127.0.0.1:13456`
- API：`http://127.0.0.1:13457`
- MCP HTTP：`http://127.0.0.1:13458/mcp`

## WebUI 登录

打开：`http://127.0.0.1:13456`

输入登录密码：

```text
Aa:2669521609
```

登录后可使用：
- 批量导入 / 导出 key
- 查看余额 / 用量
- 查看日志
- 删除 key

## API 调用鉴权

调用 `13457` 的 Firecrawl 代理接口时，需要带上 API 密钥。

两种写法任选其一：

### 方式 1：`x-api-key`

```bash
curl -X POST http://127.0.0.1:13457/v2/scrape \
  -H "Content-Type: application/json" \
  -H "x-api-key: 2669521609" \
  -d '{"url":"https://example.com"}'
```

### 方式 2：Bearer Token

```bash
curl -X POST http://127.0.0.1:13457/v2/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2669521609" \
  -d '{"url":"https://example.com"}'
```

## 管理接口

以下接口需要先通过 WebUI 登录建立会话：

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /admin/keys/import`
- `GET /admin/keys`
- `DELETE /admin/keys/:id`
- `GET /admin/keys/export`
- `GET /admin/overview`
- `GET /admin/logs`
- `GET /health`

## 代理的 Firecrawl 路径

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

## 目录结构

```text
src/        后端服务与 MCP
public/     中文 WebUI
skills/     Skill 文件
mcp/        MCP 配置示例
data/       本地存储
```

## 自检

```bash
npm run check
```

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
