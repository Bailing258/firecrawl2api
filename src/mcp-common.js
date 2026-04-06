const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const z = require('zod');
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
    description: 'Call POST /v2/scrape on the Firecrawl router.',
    inputSchema: { url: z.string().url(), formats: z.array(z.string()).optional(), onlyMainContent: z.boolean().optional(), waitFor: z.number().optional() },
  }, async (input) => okResult((await firecrawlFetch('/v2/scrape', { method: 'POST', body: input })).data));

  server.registerTool('map_site', {
    description: 'Call POST /v2/map on the Firecrawl router.',
    inputSchema: { url: z.string().url(), search: z.string().optional(), limit: z.number().optional() },
  }, async (input) => okResult((await firecrawlFetch('/v2/map', { method: 'POST', body: input })).data));

  server.registerTool('search_web', {
    description: 'Call POST /v2/search on the Firecrawl router.',
    inputSchema: { query: z.string(), limit: z.number().optional(), lang: z.string().optional(), location: z.string().optional() },
  }, async (input) => okResult((await firecrawlFetch('/v2/search', { method: 'POST', body: input })).data));

  server.registerTool('crawl_site', {
    description: 'Start a crawl via POST /v2/crawl.',
    inputSchema: { url: z.string().url(), limit: z.number().optional(), maxDepth: z.number().optional(), scrapeOptions: z.record(z.any()).optional() },
  }, async (input) => okResult((await firecrawlFetch('/v2/crawl', { method: 'POST', body: input })).data));

  server.registerTool('get_crawl_status', {
    description: 'Read crawl status via GET /v2/crawl/{id}.',
    inputSchema: { id: z.string() },
  }, async ({ id }) => okResult((await firecrawlFetch(`/v2/crawl/${id}`, { method: 'GET' })).data));

  server.registerTool('extract_data', {
    description: 'Start extraction via POST /v2/extract.',
    inputSchema: { urls: z.array(z.string().url()).min(1), prompt: z.string().optional(), schema: z.record(z.any()).optional() },
  }, async (input) => okResult((await firecrawlFetch('/v2/extract', { method: 'POST', body: input })).data));

  server.registerTool('get_extract_status', {
    description: 'Read extract status via GET /v2/extract/{id}.',
    inputSchema: { id: z.string() },
  }, async ({ id }) => okResult((await firecrawlFetch(`/v2/extract/${id}`, { method: 'GET' })).data));

  server.registerTool('batch_scrape', {
    description: 'Start batch scrape via POST /v2/batch/scrape.',
    inputSchema: { urls: z.array(z.string().url()).min(1), formats: z.array(z.string()).optional(), onlyMainContent: z.boolean().optional() },
  }, async (input) => okResult((await firecrawlFetch('/v2/batch/scrape', { method: 'POST', body: input })).data));

  server.registerTool('get_batch_scrape_status', {
    description: 'Read batch scrape status via GET /v2/batch/scrape/{id}.',
    inputSchema: { id: z.string() },
  }, async ({ id }) => okResult((await firecrawlFetch(`/v2/batch/scrape/${id}`, { method: 'GET' })).data));

  server.registerTool('get_credit_usage', {
    description: 'Query credit usage via GET /v2/team/credit-usage.',
    inputSchema: {},
  }, async () => okResult((await firecrawlFetch('/v2/team/credit-usage', { method: 'GET' })).data));

  server.registerTool('get_token_usage', {
    description: 'Query token usage via GET /v2/team/token-usage.',
    inputSchema: {},
  }, async () => okResult((await firecrawlFetch('/v2/team/token-usage', { method: 'GET' })).data));

  server.registerTool('get_activity', {
    description: 'Query activity via GET /v2/team/activity.',
    inputSchema: {},
  }, async () => okResult((await firecrawlFetch('/v2/team/activity', { method: 'GET' })).data));

  return server;
}

module.exports = { createServer };
