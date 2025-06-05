// Bridge Tools with API Parity
// Bridge version of the 7 main MCP server tools + invoke_tool
// These tools call the REST API instead of services directly

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

/**
 * Bridge tools with API parity to main MCP server
 * Same 7 tools but using API calls instead of direct service calls
 * Plus invoke_tool for calling streaming HTTP MCP servers
 */
export class BridgeToolsWithAPIParity {
  private server: McpServer;
  private apiBaseUrl: string;
  private apiKey?: string;

  constructor(server: McpServer, apiBaseUrl: string = 'https://mcplookup.org/api', apiKey?: string) {
    this.server = server;
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey;
    this.setupBridgeTools();
  }

  /**
   * Setup the 7 main tools + invoke_tool
   */
  private setupBridgeTools(): void {
    // Tool 1: discover_mcp_servers - Same as main server but calls API
    this.server.tool(
      'discover_mcp_servers',
      'Flexible MCP server discovery with natural language queries, similarity search, complex capability matching, and performance constraints. Express any search requirement naturally.',
      {
        // Natural language query (most flexible)
        query: z.string().optional().describe('Natural language query: "Find email servers like Gmail but faster", "I need document collaboration tools", "Show me alternatives to Slack"'),

        // Exact lookups
        domain: z.string().optional().describe('Exact domain lookup (e.g., "gmail.com")'),
        domains: z.array(z.string()).optional().describe('Multiple domain lookups'),

        // Capability-based search
        capability: z.string().optional().describe('Required capability (e.g., "email", "calendar", "storage")'),
        capabilities: z.array(z.string()).optional().describe('Multiple required capabilities'),

        // Performance and reliability filters
        min_trust_score: z.number().min(0).max(100).optional().describe('Minimum trust score (0-100)'),
        max_response_time: z.number().optional().describe('Maximum acceptable response time in milliseconds'),
        require_ssl: z.boolean().optional().describe('Require SSL/TLS encryption'),
        require_verified: z.boolean().optional().describe('Only show domain-verified servers'),

        // Result formatting
        limit: z.number().min(1).max(100).default(10).describe('Maximum number of results'),
        include_health: z.boolean().default(true).describe('Include real-time health status'),
        include_examples: z.boolean().default(false).describe('Include usage examples'),
        sort_by: z.enum(['relevance', 'trust_score', 'response_time', 'popularity']).default('relevance')
      },
      async (args) => {
        try {
          const result = await this.makeApiRequest('/v1/discover', 'GET', args);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error discovering servers: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Tool 2: register_mcp_server - Same as main server but calls API
    this.server.tool(
      'register_mcp_server',
      'Register a new MCP server in the global registry. Requires authentication and domain ownership verification.',
      {
        domain: z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/).describe('Domain name you control (e.g., "mycompany.com")'),
        endpoint: z.string().url().describe('Full URL to your MCP server endpoint'),
        capabilities: z.array(z.string()).optional().describe('List of capabilities your server provides'),
        category: z.enum(['communication', 'productivity', 'development', 'finance', 'social', 'storage', 'other']).optional(),
        auth_type: z.enum(['none', 'api_key', 'oauth2', 'basic']).default('none'),
        contact_email: z.string().email().optional().describe('Contact email for verification and issues'),
        description: z.string().max(500).optional().describe('Brief description of your MCP server\'s purpose'),
        user_id: z.string().describe('User ID for authentication')
      },
      async (args) => {
        try {
          const result = await this.makeApiRequest('/v1/register', 'POST', args);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error registering server: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Tool 3: verify_domain_ownership - Same as main server but calls API
    this.server.tool(
      'verify_domain_ownership',
      'Check the DNS verification status for a domain registration.',
      {
        domain: z.string().describe('Domain to check verification status'),
        challenge_id: z.string().optional().describe('Specific challenge ID to check')
      },
      async (args) => {
        try {
          const result = await this.makeApiRequest('/v1/verify', 'POST', args);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error verifying domain: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Tool 4: get_server_health - Same as main server but calls API
    this.server.tool(
      'get_server_health',
      'Get real-time health, performance, and reliability metrics for MCP servers.',
      {
        domain: z.string().optional().describe('Specific domain to check'),
        domains: z.array(z.string()).optional().describe('Multiple domains to check')
      },
      async (args) => {
        try {
          const result = await this.makeApiRequest('/v1/health', 'GET', args);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error getting server health: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Tool 5: browse_capabilities - Same as main server but calls API
    this.server.tool(
      'browse_capabilities',
      'Browse and search the taxonomy of available MCP capabilities across all registered servers.',
      {
        category: z.string().optional().describe('Filter by category'),
        search: z.string().optional().describe('Search capability names and descriptions'),
        popular: z.boolean().optional().describe('Show most popular capabilities')
      },
      async (args) => {
        try {
          const result = await this.makeApiRequest('/v1/capabilities', 'GET', args);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error browsing capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Tool 6: get_discovery_stats - Same as main server but calls API
    this.server.tool(
      'get_discovery_stats',
      'Get analytics about MCP server discovery patterns and usage statistics.',
      {
        timeframe: z.enum(['hour', 'day', 'week', 'month']).default('day'),
        metric: z.enum(['discoveries', 'registrations', 'health_checks', 'popular_domains']).default('discoveries')
      },
      async (args) => {
        try {
          const result = await this.makeApiRequest('/v1/stats', 'GET', args);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error getting discovery stats: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Tool 7: list_mcp_tools - Same as main server but calls API
    this.server.tool(
      'list_mcp_tools',
      'List all available MCP tools provided by this discovery server with descriptions and parameters.',
      {},
      async () => {
        try {
          const result = await this.makeApiRequest('/v1/tools', 'GET', {});
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error listing MCP tools: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Tool 8: invoke_tool - Call tools on streaming HTTP MCP servers
    this.server.tool(
      'invoke_tool',
      'Call any tool on any streaming HTTP MCP server. This is the bridge-specific tool for connecting to external MCP servers.',
      {
        endpoint: z.string().url().describe('MCP server endpoint URL'),
        tool_name: z.string().describe('Name of the tool to call'),
        arguments: z.record(z.any()).optional().describe('Arguments to pass to the tool'),
        auth_headers: z.record(z.string()).optional().describe('Optional authentication headers')
      },
      async (args) => {
        try {
          const { endpoint, tool_name, arguments: toolArgs = {}, auth_headers = {} } = args;

          // Create MCP client for the target server
          const client = new Client({
            name: 'mcplookup-bridge',
            version: '1.0.0'
          }, {
            capabilities: {}
          });

          let transport;
          try {
            // Try Streamable HTTP first
            transport = new StreamableHTTPClientTransport(endpoint, auth_headers);
          } catch {
            // Fallback to SSE
            transport = new SSEClientTransport(endpoint, auth_headers);
          }

          await client.connect(transport);

          // Call the tool
          const result = await client.callTool({
            name: tool_name,
            arguments: toolArgs
          });

          await client.close();

          return {
            content: result.content || [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }],
            isError: result.isError || false
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error invoking tool ${args.tool_name} on ${args.endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );
  }

  /**
   * Make HTTP request to API endpoint with authentication
   */
  private async makeApiRequest(path: string, method: string, params: any = {}): Promise<any> {
    const url = new URL(path, this.apiBaseUrl);

    // Add query parameters for GET requests
    if (method === 'GET' && params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'MCPLookup-Bridge/1.0'
    };

    // Add API key if available
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers
    };

    // Add body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method) && params) {
      requestOptions.body = JSON.stringify(params);
    }

    try {
      const response = await fetch(url.toString(), requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${data.error || response.statusText}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Bridge API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export for use in bridge
export default BridgeToolsWithAPIParity;