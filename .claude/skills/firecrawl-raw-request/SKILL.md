---
name: firecrawl-raw-request
description: 使用远程 Firecrawl Router MCP 的 firecrawl_raw_request 工具访问任意 /v2/* 路径，适合新端点、实验端点、未封装路径、SDK 调试场景。
---

# Firecrawl Raw Request

当专用工具不够用、官方新增端点还没做专门封装、或者用户明确给出某个 `/v2/...` 路径时，使用：
- `firecrawl_raw_request`

## 使用原则

1. `path` 必须明确
2. `method` 必须明确
3. `body` 仅在非 GET / DELETE 时提供
4. 回答里必须写出实际调用的本地 `/v2/...` 路径

## 适合的请求

- browser 新端点
- agent 新参数
- alpha / beta / deprecated 端点
- 未来官方新增但仍在 `/v2/*` 下的端点
