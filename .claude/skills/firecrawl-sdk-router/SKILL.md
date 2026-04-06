---
name: firecrawl-sdk-router
description: 在设计 SDK、封装 client、写示例代码时，让所有 Firecrawl 调用统一走远程 Firecrawl Router，而不是直连官方域名。
---

# Firecrawl SDK Router

这个 skill 不是直接做抓取，而是用于“写 SDK / client / sample code”。

## 目标

以后代码中统一使用你自己的服务，而不是官方域名：

- API base URL：`https://你的域名` 或 `http://127.0.0.1:13457`
- MCP URL：`https://你的域名/mcp` 或 `http://127.0.0.1:13456/mcp`

## 约束

1. 新写的 SDK 默认指向你的中转站
2. 如果用户要兼容官方，也应把官方作为可选后备，而不是默认主路径
3. 文档、示例、curl、TS/JS/Python client 都优先展示你的中转地址

## API 设计建议

- REST 层：直接调用你的 `/v2/*`
- Agent / IDE 层：走你的 `/mcp`
- 新端点不确定时：先用 `firecrawl_raw_request` 验证，再补专门封装
