# Claude Code 远程接入说明

这个目录和根目录下的 `.claude/skills` / `.mcp.json.example` 用于 Claude Code。

## 1. MCP 配置

把根目录的 `.mcp.json.example` 复制为你的 `.mcp.json`：

```json
{
  "mcpServers": {
    "firecrawl-router-http": {
      "type": "http",
      "url": "https://fire.bailingzzz.us.ci/mcp"
    }
  }
}
```

## 2. Skills 目录

Claude Code 可直接读取：

```text
.claude/skills/
```

当前已提供：
- firecrawl-router
- firecrawl-scrape
- firecrawl-search-map
- firecrawl-crawl
- firecrawl-extract
- firecrawl-browser
- firecrawl-interact
- firecrawl-agent
- firecrawl-usage
- firecrawl-raw-request
- firecrawl-sdk-router
