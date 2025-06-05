// MCP STDIO-TO-HTTP BRIDGE
// Uses @modelcontextprotocol/sdk to create a stdio server that proxies to HTTP streaming endpoints
// Enables legacy agents to use modern HTTP MCP servers through stdio interface
// Now enhanced with auto-generated bridge tools from OpenAPI spec

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { z } from 'zod';
import { IntegratedBridge, setupIntegratedBridge } from './bridge-integration';

/**
 * Enhanced MCP Stdio-to-HTTP Bridge
 *
 * Creates a stdio MCP server that proxies all requests to an HTTP MCP server.
 * Legacy agents can connect via stdio, while the actual server runs over HTTP streaming.
 * Now includes auto-generated bridge tools from OpenAPI spec for complete API coverage.
 *
 * Usage:
 * ```
 * const bridge = new MCPHttpBridge('https://api.example.com/mcp');
 * await bridge.run();
 * ```
 */
export class MCPHttpBridge {
  private server: McpServer;
  private client: Client | null = null;
  private httpEndpoint: string;
  private authHeaders: Record<string, string>;
  private connected = false;
  private integratedBridge: IntegratedBridge;

  constructor(httpEndpoint: string, authHeaders: Record<string, string> = {}) {
    this.httpEndpoint = httpEndpoint.replace(/\/$/, ''); // Remove trailing slash

    // Merge provided auth headers with environment variables
    this.authHeaders = {
      ...this.getAuthHeadersFromEnv(),
      ...authHeaders // Provided headers override env vars
    };

    this.server = new McpServer({
      name: 'mcp-http-bridge-enhanced',
      version: '2.1.0',
    });

    // Initialize integrated bridge with generated tools
    this.integratedBridge = setupIntegratedBridge(this.server);

    this.setupBridgeTools();
  }

  /**
   * Get authentication headers from environment variables
   */
  private getAuthHeadersFromEnv(): Record<string, string> {
    const authHeaders: Record<string, string> = {};

    // Check for MCP API key in environment variables
    const apiKey = process.env.MCP_API_KEY ||
                   process.env.MCPLOOKUP_API_KEY ||
                   process.env.API_KEY;

    if (apiKey) {
      authHeaders['Authorization'] = `Bearer ${apiKey}`;
      authHeaders['X-API-Key'] = apiKey;
    }

    // Check for custom auth headers from environment
    const customAuth = process.env.MCP_AUTH_HEADERS;
    if (customAuth) {
      try {
        const parsed = JSON.parse(customAuth);
        Object.assign(authHeaders, parsed);
      } catch (error) {
        console.warn('Failed to parse MCP_AUTH_HEADERS environment variable:', error);
      }
    }

    return authHeaders;
  }

  /**
   * Set up the bridge tools that proxy to the HTTP server
   */
  private setupBridgeTools(): void {
    // Tool 1: Discover MCP servers using mcplookup.org
    this.server.tool(
      'discover_mcp_servers',
      {
        query: z.string().optional().describe('Natural language query: "Find email servers like Gmail", "I need document tools"'),
        domain: z.string().optional().describe('Specific domain to look up (e.g., gmail.com)'),
        capability: z.string().optional().describe('Specific capability to search for (e.g., email, code_repository)'),
        limit: z.number().optional().describe('Maximum number of servers to return (default: 10)')
      },
      async ({ query, domain, capability, limit = 10 }) => {
        try {
          const discoveryUrl = 'https://mcplookup.org/api/mcp';
          const discoveryClient = new Client({
            name: 'bridge-discovery-client',
            version: '1.0.0'
          });

          // Connect to mcplookup.org discovery server
          const transport = new StreamableHTTPClientTransport(new URL(discoveryUrl));
          await discoveryClient.connect(transport);

          // Call the discovery tool
          const result = await discoveryClient.callTool({
            name: 'discover_mcp_servers',
            arguments: { query, domain, capability, limit }
          });

          await discoveryClient.close();

          return {
            content: result.content || [{ type: 'text', text: JSON.stringify(result) }]
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

    // Tool 2: Connect to a discovered server and list its tools
    this.server.tool(
      'connect_and_list_tools',
      {
        endpoint: z.string().describe('MCP server endpoint URL to connect to'),
        auth_headers: z.record(z.string()).optional().describe('Optional authentication headers')
      },
      async ({ endpoint, auth_headers = {} }) => {
        try {
          // Create a temporary client for this specific server
          const tempClient = new Client({
            name: 'bridge-temp-client',
            version: '1.0.0'
          });

          let transport;
          try {
            // Try Streamable HTTP first
            transport = new StreamableHTTPClientTransport(new URL(endpoint));
            await tempClient.connect(transport);
          } catch (error) {
            // Fallback to SSE
            transport = new SSEClientTransport(new URL(endpoint));
            await tempClient.connect(transport);
          }

          // List tools from the connected server
          const tools = await tempClient.listTools();
          const resources = await tempClient.listResources();

          await tempClient.close();

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                endpoint,
                connected: true,
                tools: tools.tools || [],
                resources: resources.resources || [],
                tool_count: tools.tools?.length || 0,
                resource_count: resources.resources?.length || 0
              }, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error connecting to ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Tool 3: Call a tool on any MCP server
    this.server.tool(
      'call_tool_on_server',
      {
        endpoint: z.string().describe('MCP server endpoint URL'),
        tool_name: z.string().describe('Name of the tool to call'),
        arguments: z.record(z.any()).optional().describe('Arguments to pass to the tool'),
        auth_headers: z.record(z.string()).optional().describe('Optional authentication headers')
      },
      async ({ endpoint, tool_name, arguments: args = {}, auth_headers = {} }) => {
        try {
          // Create a temporary client for this specific server
          const tempClient = new Client({
            name: 'bridge-tool-client',
            version: '1.0.0'
          });

          let transport;
          try {
            // Try Streamable HTTP first
            transport = new StreamableHTTPClientTransport(new URL(endpoint));
            await tempClient.connect(transport);
          } catch (error) {
            // Fallback to SSE
            transport = new SSEClientTransport(new URL(endpoint));
            await tempClient.connect(transport);
          }

          // Call the tool
          const result = await tempClient.callTool({
            name: tool_name,
            arguments: args
          });

          await tempClient.close();

          return {
            content: result.content || [{ type: 'text', text: JSON.stringify(result) }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error calling tool '${tool_name}' on ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Tool 4: Read a resource from any MCP server
    this.server.tool(
      'read_resource_from_server',
      {
        endpoint: z.string().describe('MCP server endpoint URL'),
        uri: z.string().describe('URI of the resource to read'),
        auth_headers: z.record(z.string()).optional().describe('Optional authentication headers')
      },
      async ({ endpoint, uri, auth_headers = {} }) => {
        try {
          // Create a temporary client for this specific server
          const tempClient = new Client({
            name: 'bridge-resource-client',
            version: '1.0.0'
          });

          let transport;
          try {
            // Try Streamable HTTP first
            transport = new StreamableHTTPClientTransport(new URL(endpoint));
            await tempClient.connect(transport);
          } catch (error) {
            // Fallback to SSE
            transport = new SSEClientTransport(new URL(endpoint));
            await tempClient.connect(transport);
          }

          // Read the resource
          const resource = await tempClient.readResource({ uri });

          await tempClient.close();

          return {
            content: resource.contents || [{ type: 'text', text: JSON.stringify(resource) }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error reading resource '${uri}' from ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Legacy tool for backward compatibility (if someone sets a default endpoint)
    this.server.tool(
      'call_remote_tool',
      {
        tool_name: z.string().describe('Name of the tool to call on the configured remote MCP server'),
        arguments: z.record(z.any()).optional().describe('Arguments to pass to the remote tool')
      },
      async ({ tool_name, arguments: args = {} }) => {
        try {
          if (!this.client || !this.connected) {
            await this.connectToHttpServer();
          }

          const result = await this.client!.callTool({
            name: tool_name,
            arguments: args
          });

          return {
            content: result.content || [{ type: 'text', text: JSON.stringify(result) }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error calling remote tool '${tool_name}': ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );



    // Tool 5: Universal workflow - discover, connect, and call in one step
    this.server.tool(
      'discover_and_call_tool',
      {
        query: z.string().optional().describe('Natural language query to find servers'),
        domain: z.string().optional().describe('Specific domain to look up'),
        capability: z.string().optional().describe('Specific capability to search for'),
        tool_name: z.string().describe('Name of the tool to call on the discovered server'),
        arguments: z.record(z.any()).optional().describe('Arguments to pass to the tool'),
        server_index: z.number().optional().describe('Which discovered server to use (default: 0 = first/best)')
      },
      async ({ query, domain, capability, tool_name, arguments: args = {}, server_index = 0 }) => {
        try {
          // Step 1: Discover servers
          const discoveryUrl = 'https://mcplookup.org/api/mcp';
          const discoveryClient = new Client({
            name: 'bridge-workflow-client',
            version: '1.0.0'
          });

          const transport = new StreamableHTTPClientTransport(new URL(discoveryUrl));
          await discoveryClient.connect(transport);

          const discoveryResult = await discoveryClient.callTool({
            name: 'discover_mcp_servers',
            arguments: { query, domain, capability, limit: 5 }
          });

          await discoveryClient.close();

          // Parse discovery results
          const discoveryData = JSON.parse(discoveryResult.content?.[0]?.text || '{}');
          const servers = discoveryData.results || [];

          if (servers.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `No servers found for query: ${query || domain || capability}`
              }],
              isError: true
            };
          }

          if (server_index >= servers.length) {
            return {
              content: [{
                type: 'text',
                text: `Server index ${server_index} out of range. Found ${servers.length} servers.`
              }],
              isError: true
            };
          }

          // Step 2: Connect to the selected server and call the tool
          const selectedServer = servers[server_index];
          const endpoint = selectedServer.endpoint;

          const toolClient = new Client({
            name: 'bridge-workflow-tool-client',
            version: '1.0.0'
          });

          let toolTransport;
          try {
            toolTransport = new StreamableHTTPClientTransport(new URL(endpoint));
            await toolClient.connect(toolTransport);
          } catch (error) {
            toolTransport = new SSEClientTransport(new URL(endpoint));
            await toolClient.connect(toolTransport);
          }

          const result = await toolClient.callTool({
            name: tool_name,
            arguments: args
          });

          await toolClient.close();

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                workflow: 'discover_and_call_tool',
                discovered_servers: servers.length,
                selected_server: {
                  domain: selectedServer.domain,
                  endpoint: selectedServer.endpoint,
                  index: server_index
                },
                tool_called: tool_name,
                result: result
              }, null, 2)
            }]
          };

        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Workflow error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );


  }

  /**
   * Connect to the HTTP MCP server with fallback support
   */
  private async connectToHttpServer(): Promise<void> {
    if (this.connected && this.client) {
      return; // Already connected
    }

    const baseUrl = new URL(this.httpEndpoint);
    
    try {
      // Try modern Streamable HTTP transport first
      this.client = new Client({
        name: 'mcp-bridge-client',
        version: '1.0.0'
      });

      const transport = new StreamableHTTPClientTransport(baseUrl);
      await this.client.connect(transport);
      this.connected = true;
      console.log('✅ Connected using Streamable HTTP transport');
      
    } catch (error) {
      console.log('⚠️  Streamable HTTP connection failed, trying SSE transport...');
      
      try {
        // Fallback to SSE transport for older servers
        this.client = new Client({
          name: 'mcp-bridge-client-sse',
          version: '1.0.0'
        });

        const sseTransport = new SSEClientTransport(baseUrl);
        await this.client.connect(sseTransport);
        this.connected = true;
        console.log('✅ Connected using SSE transport');
        
      } catch (sseError) {
        this.connected = false;
        throw new Error(`Failed to connect to MCP server at ${this.httpEndpoint}. Tried both Streamable HTTP and SSE transports. Last error: ${sseError instanceof Error ? sseError.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Start the enhanced bridge server on stdio
   */
  async run(): Promise<void> {
    try {
      const availableTools = this.integratedBridge.getAvailableTools();
      const toolCount = availableTools.length;

      console.log(`🌉 Starting Enhanced MCP HTTP Bridge v2.1.0`);
      console.log(`📡 Target endpoint: ${this.httpEndpoint}`);
      console.log(`🔧 Bridge tools: ${toolCount} tools (6 main + invoke_tool)`);
      console.log(`🎯 Tools call REST API instead of services directly`);
      console.log(`🔌 Listening on stdio...`);

      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      console.log('✅ Enhanced bridge server started successfully');
      console.log('🎯 Key features:');
      console.log('  • 7 main MCP tools with API parity');
      console.log('  • invoke_tool for calling streaming HTTP MCP servers');
      console.log('  • REST API calls instead of direct service calls');
      console.log('  • Type-safe tool implementations');

    } catch (error) {
      console.error('❌ Failed to start enhanced bridge server:', error);
      throw error;
    }
  }

  /**
   * Close the bridge connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    this.connected = false;
    console.log('🔌 Bridge connection closed');
  }
}

/**
 * Enhanced Bridge with Auto-Generated Tools
 *
 * This is the new recommended bridge that includes all auto-generated tools
 * from the OpenAPI spec plus the original manual bridge tools.
 */
export class EnhancedMCPBridge {
  private server: McpServer;
  private integratedBridge: IntegratedBridge;
  private httpEndpoint: string;
  private authHeaders: Record<string, string>;

  constructor(httpEndpoint: string = '', authHeaders: Record<string, string> = {}) {
    this.httpEndpoint = httpEndpoint;
    this.authHeaders = authHeaders;

    this.server = new McpServer({
      name: 'enhanced-mcp-bridge',
      version: '2.1.0',
    });

    // Setup integrated bridge with all tools
    this.integratedBridge = setupIntegratedBridge(this.server);
  }

  /**
   * Get all available tools
   */
  getAvailableTools() {
    return this.integratedBridge.getAvailableTools();
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string) {
    return this.integratedBridge.getToolsByCategory(category);
  }

  /**
   * Check if a tool is available
   */
  hasToolAvailable(toolName: string) {
    return this.integratedBridge.hasToolAvailable(toolName);
  }

  /**
   * Get tool metadata
   */
  getToolMetadata(toolName: string) {
    return this.integratedBridge.getToolMetadata(toolName);
  }

  /**
   * Start the enhanced bridge server
   */
  async run(): Promise<void> {
    try {
      const availableTools = this.getAvailableTools();
      const categories = new Set(availableTools.map(t => t.category));

      console.log(`🚀 Starting Enhanced MCP Bridge v2.1.0`);
      console.log(`🛠️ Total tools: ${availableTools.length}`);
      console.log(`📂 Categories: ${Array.from(categories).join(', ')}`);
      console.log(`🔌 Listening on stdio...`);

      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      console.log('✅ Enhanced MCP Bridge started successfully');
      console.log('🎯 Features:');
      console.log('  • Complete REST API coverage via auto-generated tools');
      console.log('  • Universal MCP server discovery and connection');
      console.log('  • Type-safe tool implementations');
      console.log('  • Bidirectional sync with OpenAPI spec');
      console.log('💡 Bridge provides API parity with main MCP server');

    } catch (error) {
      console.error('❌ Failed to start enhanced bridge:', error);
      throw error;
    }
  }

  /**
   * Close the bridge
   */
  async close(): Promise<void> {
    console.log('🔌 Enhanced bridge closed');
  }
}

/**
 * Enhanced Bridge with Discovery Integration
 *
 * This version can discover HTTP endpoints automatically using mcplookup.org
 */
export class MCPDiscoveryBridge {
  private discoveryEndpoint: string;

  constructor(discoveryEndpoint: string = 'https://mcplookup.org/api/v1') {
    this.discoveryEndpoint = discoveryEndpoint;
  }

  /**
   * Create a bridge to a server discovered by domain
   */
  async createBridgeForDomain(domain: string, authHeaders: Record<string, string> = {}): Promise<MCPHttpBridge> {
    const endpoint = await this.discoverServerEndpoint(domain);
    return new MCPHttpBridge(endpoint, authHeaders);
  }

  /**
   * Create a bridge for domain using environment variables for authentication
   */
  async createBridgeForDomainWithEnvAuth(domain: string): Promise<MCPHttpBridge> {
    const endpoint = await this.discoverServerEndpoint(domain);
    // MCPHttpBridge constructor will automatically pick up env vars
    return new MCPHttpBridge(endpoint);
  }

  /**
   * Create a bridge with API key authentication
   */
  async createBridgeWithApiKey(domain: string, apiKey: string): Promise<MCPHttpBridge> {
    const endpoint = await this.discoverServerEndpoint(domain);
    const authHeaders = {
      'Authorization': `Bearer ${apiKey}`,
      'X-API-Key': apiKey
    };
    return new MCPHttpBridge(endpoint, authHeaders);
  }

  /**
   * Create a bridge to a server discovered by capability
   */
  async createBridgeForCapability(capability: string, authHeaders: Record<string, string> = {}): Promise<MCPHttpBridge> {
    const servers = await this.discoverServersByCapability(capability);

    if (servers.length === 0) {
      throw new Error(`No servers found with capability: ${capability}`);
    }

    // Use the first (most relevant) server
    const endpoint = servers[0].endpoint;
    return new MCPHttpBridge(endpoint, authHeaders);
  }

  /**
   * Create a bridge for capability with API key authentication
   */
  async createBridgeForCapabilityWithApiKey(capability: string, apiKey: string): Promise<MCPHttpBridge> {
    const servers = await this.discoverServersByCapability(capability);

    if (servers.length === 0) {
      throw new Error(`No servers found with capability: ${capability}`);
    }

    // Use the first (most relevant) server
    const endpoint = servers[0].endpoint;
    const authHeaders = {
      'Authorization': `Bearer ${apiKey}`,
      'X-API-Key': apiKey
    };
    return new MCPHttpBridge(endpoint, authHeaders);
  }

  /**
   * Create a bridge for capability using environment variables for authentication
   */
  async createBridgeForCapabilityWithEnvAuth(capability: string): Promise<MCPHttpBridge> {
    const servers = await this.discoverServersByCapability(capability);

    if (servers.length === 0) {
      throw new Error(`No servers found with capability: ${capability}`);
    }

    // Use the first (most relevant) server
    const endpoint = servers[0].endpoint;
    // MCPHttpBridge constructor will automatically pick up env vars
    return new MCPHttpBridge(endpoint);
  }

  /**
   * Discover server endpoint by domain
   */
  private async discoverServerEndpoint(domain: string): Promise<string> {
    const response = await fetch(`${this.discoveryEndpoint}/discover/domain/${domain}`);
    
    if (!response.ok) {
      throw new Error(`Failed to discover server for domain ${domain}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.endpoint) {
      throw new Error(`No MCP endpoint found for domain: ${domain}`);
    }

    return data.endpoint;
  }

  /**
   * Discover servers by capability
   */
  private async discoverServersByCapability(capability: string): Promise<Array<{ endpoint: string; domain: string }>> {
    const response = await fetch(`${this.discoveryEndpoint}/discover/capability/${capability}`);
    
    if (!response.ok) {
      throw new Error(`Failed to discover servers with capability ${capability}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.servers || [];
  }
}
