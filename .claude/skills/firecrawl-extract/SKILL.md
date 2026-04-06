---
name: firecrawl-extract
description: 使用远程 Firecrawl Router MCP 提取结构化数据，适合从多个 URL 中抽字段、做 schema 抽取、生成结构化 JSON 时使用。
---

# Firecrawl Extract

优先使用：
- `extract_data`
- `get_extract_status`

## 工作流

1. 明确输入 URL 列表
2. 明确 prompt 或 schema
3. 调用 `extract_data`
4. 若是异步执行，轮询 `get_extract_status`

## 输出建议

- 先给提取结果摘要
- 再给结构化字段
- 字段缺失时要明确说明缺失，而不是默认为空
