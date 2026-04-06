---
name: firecrawl-browser
description: 使用远程 Firecrawl Router MCP 的 browser 能力创建会话、执行浏览器动作、查看或删除会话，适合必须依赖浏览器上下文的任务。
---

# Firecrawl Browser

优先使用：
- `browser_list`
- `browser_create`
- `browser_execute`
- `browser_delete`

## 适用场景

- 页面必须依赖真实浏览器渲染
- 需要执行浏览器动作 / 代码
- 需要保留一个 browser session 做多步操作

## 工作流

1. 先 `browser_create`
2. 拿到 session id
3. 用 `browser_execute` 做动作
4. 完成后 `browser_delete`

## 注意

- 如果任务只需要普通抓取，不要滥用 browser
- 结束时提醒是否要清理 session
