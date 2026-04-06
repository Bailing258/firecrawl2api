const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const z = require('zod/v4');
const { firecrawlFetch } = require('./firecrawl-client');

function toText(data) {
  return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

function okResult(data) {
  return { content: [{ type: 'text', text: toText(data) }] };
}

function registerSimpleTool(server, name, description, path, method, inputSchema) {
  server.registerTool(name, { description, inputSchema }, async (input = {}) => {
    const url = typeof path === 'function' ? path(input) : path;
    const body = ['GET', 'DELETE'].includes(method) ? undefined : input;
    return okResult((await firecrawlFetch(url, { method, body })).data);
  });
}

function createServer() {
  const server = new McpServer({ name: 'firecrawl-router-mcp', version: '1.0.0' }, { capabilities: { logging: {} } });

  registerSimpleTool(server, 'scrape_url', '调用 POST /v2/scrape 抓取单个页面。', '/v2/scrape', 'POST', {
    url: z.string().url(), formats: z.array(z.string()).optional(), onlyMainContent: z.boolean().optional(), waitFor: z.number().optional()
  });
  registerSimpleTool(server, 'get_scrape_status', '调用 GET /v2/scrape/{id} 查询单次抓取结果。', ({ id }) => `/v2/scrape/${id}`, 'GET', { id: z.string() });
  registerSimpleTool(server, 'map_site', '调用 POST /v2/map 获取站点链接映射。', '/v2/map', 'POST', {
    url: z.string().url(), search: z.string().optional(), limit: z.number().optional()
  });
  registerSimpleTool(server, 'search_web', '调用 POST /v2/search 执行搜索。', '/v2/search', 'POST', {
    query: z.string(), limit: z.number().optional(), lang: z.string().optional(), location: z.string().optional()
  });
  registerSimpleTool(server, 'crawl_site', '调用 POST /v2/crawl 发起站点抓取任务。', '/v2/crawl', 'POST', {
    url: z.string().url(), limit: z.number().optional(), maxDepth: z.number().optional(), scrapeOptions: z.record(z.string(), z.any()).optional()
  });
  registerSimpleTool(server, 'get_crawl_status', '调用 GET /v2/crawl/{id} 查询抓取任务状态。', ({ id }) => `/v2/crawl/${id}`, 'GET', { id: z.string() });
  registerSimpleTool(server, 'cancel_crawl', '调用 DELETE /v2/crawl/{id} 取消抓取任务。', ({ id }) => `/v2/crawl/${id}`, 'DELETE', { id: z.string() });
  registerSimpleTool(server, 'get_crawl_errors', '调用 GET /v2/crawl/{id}/errors 查询抓取错误。', ({ id }) => `/v2/crawl/${id}/errors`, 'GET', { id: z.string() });
  registerSimpleTool(server, 'get_active_crawls', '调用 GET /v2/crawl/active 查询活跃抓取。', '/v2/crawl/active', 'GET', {});
  registerSimpleTool(server, 'extract_data', '调用 POST /v2/extract 发起抽取任务。', '/v2/extract', 'POST', {
    urls: z.array(z.string().url()).min(1), prompt: z.string().optional(), schema: z.record(z.string(), z.any()).optional()
  });
  registerSimpleTool(server, 'get_extract_status', '调用 GET /v2/extract/{id} 查询抽取任务状态。', ({ id }) => `/v2/extract/${id}`, 'GET', { id: z.string() });
  registerSimpleTool(server, 'batch_scrape', '调用 POST /v2/batch/scrape 发起批量抓取。', '/v2/batch/scrape', 'POST', {
    urls: z.array(z.string().url()).min(1), formats: z.array(z.string()).optional(), onlyMainContent: z.boolean().optional()
  });
  registerSimpleTool(server, 'get_batch_scrape_status', '调用 GET /v2/batch/scrape/{id} 查询批量抓取状态。', ({ id }) => `/v2/batch/scrape/${id}`, 'GET', { id: z.string() });
  registerSimpleTool(server, 'get_batch_scrape_errors', '调用 GET /v2/batch/scrape/{id}/errors 查询批量抓取错误。', ({ id }) => `/v2/batch/scrape/${id}/errors`, 'GET', { id: z.string() });
  registerSimpleTool(server, 'cancel_batch_scrape', '调用 DELETE /v2/batch/scrape/{id} 取消批量抓取。', ({ id }) => `/v2/batch/scrape/${id}`, 'DELETE', { id: z.string() });

  registerSimpleTool(server, 'browser_list', '调用 GET /v2/browser 获取浏览器会话列表。', '/v2/browser', 'GET', {});
  registerSimpleTool(server, 'browser_create', '调用 POST /v2/browser 创建浏览器会话。', '/v2/browser', 'POST', {
    url: z.string().optional(), sessionOptions: z.record(z.string(), z.any()).optional()
  });
  registerSimpleTool(server, 'browser_execute', '调用 POST /v2/browser/{id}/execute 执行浏览器动作。', ({ id }) => `/v2/browser/${id}/execute`, 'POST', {
    id: z.string(), action: z.string().optional(), code: z.string().optional(), args: z.array(z.any()).optional(), payload: z.record(z.string(), z.any()).optional()
  });
  registerSimpleTool(server, 'browser_delete', '调用 DELETE /v2/browser/{id} 删除浏览器会话。', ({ id }) => `/v2/browser/${id}`, 'DELETE', { id: z.string() });

  registerSimpleTool(server, 'interact_start', '调用 POST /v2/scrape/{id}/interact 对页面执行交互。', ({ id }) => `/v2/scrape/${id}/interact`, 'POST', {
    id: z.string(), steps: z.array(z.any()).optional(), prompt: z.string().optional(), actions: z.array(z.any()).optional()
  });
  registerSimpleTool(server, 'interact_stop', '调用 DELETE /v2/scrape/{id}/interact 结束交互。', ({ id }) => `/v2/scrape/${id}/interact`, 'DELETE', { id: z.string() });

  registerSimpleTool(server, 'agent_run', '调用 POST /v2/agent 发起 agent 任务。', '/v2/agent', 'POST', {
    prompt: z.string(), url: z.string().optional(), urls: z.array(z.string()).optional(), config: z.record(z.string(), z.any()).optional()
  });
  registerSimpleTool(server, 'agent_status', '调用 GET /v2/agent/{id} 查询 agent 状态。', ({ id }) => `/v2/agent/${id}`, 'GET', { id: z.string() });

  registerSimpleTool(server, 'llmstxt_generate', '调用 POST /v2/llmstxt 生成 llmstxt（官方 alpha/deprecated）。', '/v2/llmstxt', 'POST', {
    url: z.string().url(), options: z.record(z.string(), z.any()).optional()
  });
  registerSimpleTool(server, 'deep_research_run', '调用 POST /v2/deep-research 发起 deep research（官方 alpha/deprecated）。', '/v2/deep-research', 'POST', {
    query: z.string(), options: z.record(z.string(), z.any()).optional()
  });
  registerSimpleTool(server, 'deep_research_status', '调用 GET /v2/deep-research/{id} 查询 deep research 状态。', ({ id }) => `/v2/deep-research/${id}`, 'GET', { id: z.string() });

  registerSimpleTool(server, 'get_credit_usage', '调用 GET /v2/team/credit-usage 查询 credits。', '/v2/team/credit-usage', 'GET', {});
  registerSimpleTool(server, 'get_token_usage', '调用 GET /v2/team/token-usage 查询 token 用量。', '/v2/team/token-usage', 'GET', {});
  registerSimpleTool(server, 'get_activity', '调用 GET /v2/team/activity 查询活动记录。', '/v2/team/activity', 'GET', {});
  registerSimpleTool(server, 'get_queue_status', '调用 GET /v2/team/queue-status 查询队列状态。', '/v2/team/queue-status', 'GET', {});

  server.registerTool('firecrawl_raw_request', {
    description: '通用 Firecrawl 原始请求工具。可访问任意 /v2/* 路径，以便 SDK 或新端点也能经由本地中转使用。',
    inputSchema: {
      path: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
      body: z.record(z.string(), z.any()).optional()
    }
  }, async ({ path, method, body }) => {
    const normalizedPath = path.startsWith('/v2/') ? path : `/v2/${path.replace(/^\/+/, '')}`;
    return okResult((await firecrawlFetch(normalizedPath, { method, body: ['GET', 'DELETE'].includes(method) ? undefined : body })).data);
  });

  return server;
}

module.exports = { createServer };
