const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { createServer } = require('./mcp-common');

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('MCP stdio server failed:', error);
  process.exit(1);
});
