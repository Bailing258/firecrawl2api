---
name: firecrawl-interact
description: 使用远程 Firecrawl Router MCP 对已抓取页面执行 interact 动作，适合点击、填写、触发动态内容等交互场景。
---

# Firecrawl Interact

优先使用：
- `interact_start`
- `interact_stop`

## 适用场景

- 抓取后的页面还需要点击、输入、加载更多
- 需要让 Claude 对页面执行操作链

## 工作流

1. 确认已有 scrape id
2. 调用 `interact_start`
3. 输出交互结果
4. 如用户要求结束或重置，调用 `interact_stop`
