// Next.js API Route - The One Ring MCP Server HTTP Endpoint
// Using official Vercel MCP adapter for proper HTTP streaming support

import { createMcpHandler } from '@vercel/mcp-adapter';
import { createMCPLookupServer } from '@/server-clean';

// Create the Vercel MCP adapter with our server initialization
const handler = createMcpHandler(
  (server) => {
    // Initialize our MCP server with the provided McpServer instance
    const mcpLookupServer = createMCPLookupServer();
    
    // Copy tools and resources from our server to the adapter's server
    // This bridges the gap between our Server instance and the adapter's McpServer
    return mcpLookupServer.initializeWithServer(server);
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
  {
    verboseLogs: true,
    maxDuration: 60,
  }
);

export { handler as GET, handler as POST };
