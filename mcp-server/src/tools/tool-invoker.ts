// Tool invoker for dynamic MCP server calls

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { InvokeToolOptions, ToolCallResult } from '@mcplookup-org/mcp-sdk';

export class ToolInvoker {
  private clientCache = new Map<string, Client>();

  /**
   * Invoke a tool on any MCP server
   */
  async invoke(options: InvokeToolOptions): Promise<ToolCallResult> {
    try {
      const client = await this.getOrCreateClient(options.endpoint, options.headers);
      
      const result = await client.callTool({
        name: options.tool_name,
        arguments: options.arguments
      });

      return {
        content: Array.isArray(result.content) && result.content.length > 0
          ? result.content.map((item: any) => ({ ...item, type: item.type as 'text' }))
          : [{ type: 'text' as const, text: JSON.stringify(result) }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: `❌ Failed to invoke ${options.tool_name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  /**
   * Get or create a client for the given endpoint
   */
  private async getOrCreateClient(endpoint: string, headers?: Record<string, string>): Promise<Client> {
    const cacheKey = `${endpoint}:${JSON.stringify(headers || {})}`;
    
    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey)!;
    }

    const client = new Client({
      name: 'mcp-bridge-invoker',
      version: '1.0.0'
    });

    // Try Streamable HTTP first, fall back to SSE
    let transport;
    try {
      transport = new StreamableHTTPClientTransport(new URL(endpoint));
      await client.connect(transport);
    } catch (error) {
      console.log(`Streamable HTTP failed for ${endpoint}, trying SSE...`);
      try {
        transport = new SSEClientTransport(new URL(endpoint));
        await client.connect(transport);
      } catch (sseError) {
        throw new Error(`Failed to connect to ${endpoint} via both Streamable HTTP and SSE: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    this.clientCache.set(cacheKey, client);
    return client;
  }

  /**
   * Clear the client cache
   */
  clearCache(): void {
    for (const client of this.clientCache.values()) {
      client.close().catch(console.error);
    }
    this.clientCache.clear();
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    const closePromises = Array.from(this.clientCache.values()).map(client => 
      client.close().catch(console.error)
    );
    await Promise.all(closePromises);
    this.clientCache.clear();
  }
}
