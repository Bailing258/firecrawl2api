---
name: firecrawl-usage
description: 使用远程 Firecrawl Router MCP 查询 credits、tokens、activity、queue status，适合余额、用量、队列、调用记录排查场景。
---

# Firecrawl Usage

优先使用：
- `get_credit_usage`
- `get_token_usage`
- `get_activity`
- `get_queue_status`

## 输出重点

优先说明：
- `remainingCredits`
- `usedCredits`（若可推导）
- `remainingTokens`
- `usedTokens`（若可推导）
- 当前队列状态
- 最近活动概览
