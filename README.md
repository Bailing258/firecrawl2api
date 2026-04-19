# Firecrawl Router Station

这是一个基于 Firecrawl 官方 v2 路径的本地中转站。现在默认采用**单端口**方案：

- WebUI：`http://127.0.0.1:13457/`
- API：`http://127.0.0.1:13457/api`
- MCP HTTP：`http://127.0.0.1:13457/mcp`
- MCP stdio：本地进程模式

## 功能

- 批量导入 Firecrawl Key（每行一个）
- PostgreSQL 存储 Key
- Round-Robin 轮询分发
- Credits / Tokens 用量概览
- 单个 key 查询余额
- 批量并行查询余额
- 日志查看与清空
- WebUI 登录密码保护
- API 调用密钥保护
- Firecrawl MCP Server（stdio + streamable HTTP）
- Skill / MCP / SDK 统一走本地中转
- 通用 `/api/v2/*` 原始代理能力

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

默认值：

```env
FIRECRAWL_BASE_URL=https://api.firecrawl.dev
DATABASE_URL=postgresql://root:123456@192.168.5.20:7726/new-api
API_ACCESS_KEY=2669521609
WEB_LOGIN_PASSWORD=Aa:2669521609
```

## 启动

```bash
npm install
npm start
```

启动后访问：

- WebUI：`http://127.0.0.1:13457/`
- API 健康检查：`http://127.0.0.1:13457/api/health`
- MCP HTTP：`http://127.0.0.1:13457/mcp`

## 路由约定

- `/` -> WebUI
- `/api/auth/*` -> 登录接口
- `/api/admin/*` -> 管理接口
- `/api/v2/*` -> Firecrawl 代理接口
- `/mcp` -> MCP Streamable HTTP

## MCP

### stdio

文件：`mcp/firecrawl-router-stdio.json`

### streamable HTTP

文件：`mcp/firecrawl-router-http.json`

```json
{
  "mcpServers": {
    "firecrawl-router-http": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:13457/mcp"
    }
  }
}
```

## Skill

仓库内默认总入口 skill：

- `skills/firecrawl-router/SKILL.md`

如果你要给 Claude Code 用，参考：

- `.mcp.json.example`
- `.claude/skills/firecrawl-router/SKILL.md`

## 自定义域名 / MCP 修改位置

如果以后你改成自己的域名，例如 `https://your-domain.com`，主要改这些文件：

- `.mcp.json.example`
- `mcp/firecrawl-router-http.json`
- `skills/firecrawl-router/SKILL.md`
- `.claude/skills/firecrawl-router/SKILL.md`
- `.claude/skills/firecrawl-sdk-router/SKILL.md`
- `claude-code/README.md`

把：

- `http://127.0.0.1:13457/api`
- `http://127.0.0.1:13457/mcp`

替换成你的实际地址即可。
