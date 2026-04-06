---
name: firecrawl-agent
description: 使用远程 Firecrawl Router MCP 发起和跟踪 Firecrawl agent / deep research 任务，适合多步骤网页研究与代理式任务执行。
---

# Firecrawl Agent

优先使用：
- `agent_run`
- `agent_status`
- `deep_research_run`
- `deep_research_status`

## 区分

- 普通 agent：优先 `agent_run`
- deep research：只在用户明确需要，且接受 alpha/deprecated 能力时使用

## 输出要求

- 标明任务类型
- 标明是否为 alpha/deprecated
- 返回任务 id 与状态
