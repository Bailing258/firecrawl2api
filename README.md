# Firecrawl Router Station

这是一个基于 Firecrawl 官方 v2 路径的本地中转站，目标是：以后无论写 SDK、脚本、MCP 还是人工调试，都尽量只走你自己的本地中转，而不是直接依赖远端 Firecrawl 域名。

## 端口

- WebUI：`13456`
- API：`13457`
- MCP Streamable HTTP：`13456/mcp`
- MCP 兼容旧地址：`13458/mcp`
- MCP stdio：本地进程模式

## 功能

- 批量导入 Firecrawl Key（每行一个）
- 批量导出所有已保存 Key
- Round-Robin 轮询分发
- Credits / Tokens 用量概览
- 单个 key 查询余额
- 批量并行查询余额（每批 50 个，实时刷新返回进度）
- info / error 日志
- WebUI 登录密码保护
- API 调用密钥保护
- Firecrawl MCP Server（stdio + streamable HTTP）
- Firecrawl Skill
- 暖色系中文界面
- Key 列表分页显示
- 日志第二选项卡滚动查看，命令行风格配色
- 通用 ` /v2/* ` 原始代理能力，方便未来 SDK 直接走本地

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

## 启动

```bash
npm install
npm start
```

启动后：
- WebUI：`http://127.0.0.1:13456`
- API：`http://127.0.0.1:13457`
- MCP HTTP（推荐）：`http://127.0.0.1:13456/mcp`
- MCP HTTP（兼容旧地址）：`http://127.0.0.1:13458/mcp`

## SDK / MCP 建议接入方式

推荐以后统一把 MCP 挂到与 WebUI 同域的：

```text
http://127.0.0.1:13456/mcp
```

这样后续你挂域名时，可以直接使用：

```text
https://你的域名/mcp
```

而不必额外暴露单独端口。

## MCP

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

### streamable HTTP（推荐）

文件：`mcp/firecrawl-router-http.json`

```json
{
  "mcpServers": {
    "firecrawl-router-http": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:13456/mcp"
    }
  }
}
```

## Skill

仓库内已有 skill：
- `skills/firecrawl-router/SKILL.md`

该 skill 现在默认使用：
- Router API：`http://127.0.0.1:13457`
- MCP HTTP：`http://127.0.0.1:13456/mcp`

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
- Browser feature: https://docs.firecrawl.dev/features/browser
- Interact feature: https://docs.firecrawl.dev/features/interact
- Agent feature: https://docs.firecrawl.dev/features/agent
- LLMs.txt alpha: https://docs.firecrawl.dev/features/alpha/llmstxt
- Deep Research alpha: https://docs.firecrawl.dev/features/alpha/deep-research

## Claude Code Skills（远程）

仓库已新增一整套面向 Claude Code 的 skills，放在：

```text
.claude/skills/
```

已提供：
- `firecrawl-router`
- `firecrawl-scrape`
- `firecrawl-search-map`
- `firecrawl-crawl`
- `firecrawl-extract`
- `firecrawl-browser`
- `firecrawl-interact`
- `firecrawl-agent`
- `firecrawl-usage`
- `firecrawl-raw-request`
- `firecrawl-sdk-router`

同时提供远程 MCP 配置示例：

- `.mcp.json.example`

示例：

```json
{
  "mcpServers": {
    "firecrawl-router-http": {
      "type": "http",
      "url": "https://你的域名/mcp"
    }
  }
}
```

这样 Claude Code 可直接远程调用你的服务器，而不是在本地堆很多额外工具文件。
# Firecrawl Router Station

这是一个基于 Firecrawl 官方 v2 路径的本地中转站，目标是：以后无论写 SDK、脚本、MCP 还是人工调试，都尽量只走你自己的本地中转，而不是直接依赖远端 Firecrawl 域名。

## 端口

- WebUI：`13456`
- API：`13457`
- MCP Streamable HTTP：`13456/mcp`
- MCP 兼容旧地址：`13458/mcp`
- MCP stdio：本地进程模式

## 同域部署建议

如果你已经挂了域名，前端现在会自动优先使用：

```text
window.location.origin
```

也就是：
- 页面在 `https://你的域名` 打开时
- 登录、管理接口、状态查询都会自动走同域
- MCP 也走 `https://你的域名/mcp`

这样可以避免：
- CORS
- 跨站 Cookie
- `127.0.0.1` 写死导致的登录失败

本地开发时仍会自动回落到：
- API：`http://127.0.0.1:13457`
- MCP：`http://127.0.0.1:13456/mcp`

## 反向代理建议

推荐把域名代理成：
- `/` -> WebUI 13456
- `/mcp` -> WebUI 13456 上挂载的 MCP
- `/auth/*` -> API 13457
- `/admin/*` -> API 13457
- `/v2/*` -> API 13457

## Cookie / 登录

后端现在已支持：
- `trust proxy`
- 根据 `x-forwarded-proto=https` 自动切换 Cookie 为
  - `SameSite=None`
  - `Secure`

这样 HTTPS 域名反代后，登录 cookie 可以正常工作。
