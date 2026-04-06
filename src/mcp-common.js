const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const z = require('zod/v4');
const { firecrawlFetch } = require('./firecrawl-client');

function toText(data) {
  return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

function okResult(data) {
  return { content: [{ type: 'text', text: toText(data) }] };
}

function createServer() {
  const server = new McpServer({
    name: 'firecrawl-router-mcp',
    version: '1.0.0',
  }, {
    capabilities: { logging: {} },
  });

  server.registerTool('scrape_url', {
    description: '调用 POST /v2/scrape 抓取单个页面。',
    inputSchema: {
      url: z.string().url(),
      formats: z.array(z.string()).optional(),
      onlyMainContent: z.boolean().optional(),
      waitFor: z.number().optional()
    },
  }, async (input) => okResult((await firecrawlFetch('/v2/scrape', { method: 'POST', body: input })).data));

  server.registerTool('map_site', {
    description: '调用 POST /v2/map 获取站点链接映射。',
    inputSchema: {
      url: z.string().url(),
      search: z.string().optional(),
      limit: z.number().optional()
    },
  }, async (input) => okResult((await firecrawlFetch('/v2/map', { method: 'POST', body: input })).data));

  server.registerTool('search_web', {
    description: '调用 POST /v2/search 执行搜索。',
    inputSchema: {
      query: z.string(),
      limit: z.number().optional(),
      lang: z.string().optional(),
      location: z.string().optional()
    },
  }, async (input) => okResult((await firecrawlFetch('/v2/search', { method: 'POST', body: input })).data));

  server.registerTool('crawl_site', {
    description: '调用 POST /v2/crawl 发起站点抓取任务。',
    inputSchema: {
      url: z.string().url(),
      limit: z.number().optional(),
      maxDepth: z.number().optional(),
      scrapeOptions: z.record(z.string(), z.any()).optional()
    },
  }, async (input) => okResult((await firecrawlFetch('/v2/crawl', { method: 'POST', body: input })).data));

  server.registerTool('get_crawl_status', {
    description: '调用 GET /v2/crawl/{id} 查询抓取任务状态。',
    inputSchema: { id: z.string() },
  }, async ({ id }) => okResult((await firecrawlFetch(`/v2/crawl/${id}`, { method: 'GET' })).data));

  server.registerTool('extract_data', {
    description: '调用 POST /v2/extract 发起抽取任务。',
    inputSchema: {
      urls: z.array(z.string().url()).min(1),
      prompt: z.string().optional(),
      schema: z.record(z.string(), z.any()).optional()
    },
  }, async (input) => okResult((await firecrawlFetch('/v2/extract', { method: 'POST', body: input })).data));

  server.registerTool('get_extract_status', {
    description: '调用 GET /v2/extract/{id} 查询抽取任务状态。',
    inputSchema: { id: z.string() },
  }, async ({ id }) => okResult((await firecrawlFetch(`/v2/extract/${id}`, { method: 'GET' })).data));

  server.registerTool('batch_scrape', {
    description: '调用 POST /v2/batch/scrape 发起批量抓取。',
    inputSchema: {
      urls: z.array(z.string().url()).min(1),
      formats: z.array(z.string()).optional(),
      onlyMainContent: z.boolean().optional()
    },
  }, async (input) => okResult((await firecrawlFetch('/v2/batch/scrape', { method: 'POST', body: input })).data));

  server.registerTool('get_batch_scrape_status', {
    description: '调用 GET /v2/batch/scrape/{id} 查询批量抓取状态。',
    inputSchema: { id: z.string() },
  }, async ({ id }) => okResult((await firecrawlFetch(`/v2/batch/scrape/${id}`, { method: 'GET' })).data));

  server.registerTool('get_credit_usage', {
    description: '调用 GET /v2/team/credit-usage 查询 credits。',
    inputSchema: {},
  }, async () => okResult((await firecrawlFetch('/v2/team/credit-usage', { method: 'GET' })).data));

  server.registerTool('get_token_usage', {
    description: '调用 GET /v2/team/token-usage 查询 token 用量。',
    inputSchema: {},
  }, async () => okResult((await firecrawlFetch('/v2/team/token-usage', { method: 'GET' })).data));

  server.registerTool('get_activity', {
    description: '调用 GET /v2/team/activity 查询活动记录。',
    inputSchema: {},
  }, async () => okResult((await firecrawlFetch('/v2/team/activity', { method: 'GET' })).data));

  return server;
}

module.exports = { createServer };
