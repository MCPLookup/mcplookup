// MCP STDIO-TO-HTTP BRIDGE
// Enables legacy agents to use HTTP MCP servers through stdio interface
// Bridge between old agents and new streaming HTTP servers

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP Stdio-to-HTTP Bridge
 * 
 * This creates a stdio MCP server that proxies all requests to an HTTP MCP server.
 * Legacy agents can connect via stdio, while the actual server runs over HTTP.
 * 
 * Usage:
 * ```
 * const bridge = new MCPHttpBridge('https://api.example.com/mcp');
 * await bridge.run();
 * ```
 */
export class MCPHttpBridge {
  private server: Server;
  private httpEndpoint: string;
  private authHeaders: Record<string, string>;

  constructor(httpEndpoint: string, authHeaders: Record<string, string> = {}) {
    this.httpEndpoint = httpEndpoint.replace(/\/$/, ''); // Remove trailing slash
    this.authHeaders = authHeaders;
    
    this.server = new Server(
      {
        name: 'mcp-http-bridge',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupRequestHandlers();
    this.setupErrorHandling();
  }

  private setupRequestHandlers(): void {
    // Initialize - Get server capabilities from HTTP endpoint
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        const response = await this.makeHttpRequest('tools/list', {});
        return response.result || { tools: [] };
      } catch (error) {
        console.error('Failed to list tools from HTTP server:', error);
        return { tools: [] };
      }
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      try {
        const response = await this.makeHttpRequest('resources/list', {});
        return response.result || { resources: [] };
      } catch (error) {
        console.error('Failed to list resources from HTTP server:', error);
        return { resources: [] };
      }
    });

    // Tool execution - Forward to HTTP server
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const response = await this.makeHttpRequest('tools/call', {
          name: request.params.name,
          arguments: request.params.arguments
        });
        
        return response.result || { content: [] };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });

    // Resource reading - Forward to HTTP server
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      try {
        const response = await this.makeHttpRequest('resources/read', {
          uri: request.params.uri
        });
        
        return response.result || { contents: [] };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Resource read failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  /**
   * Make HTTP request to the MCP server using JSON-RPC over HTTP
   */
  private async makeHttpRequest(method: string, params: any): Promise<any> {
    const body = {
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 1000000),
      method: method,
      params: params
    };

    const response = await fetch(this.httpEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.authHeaders
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`MCP Error: ${data.error.message}`);
    }

    return data;
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Bridge Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`🌉 MCP HTTP Bridge running for: ${this.httpEndpoint}`);
  }
}

/**
 * CLI Interface for the Bridge
 * 
 * Usage:
 * node mcp-bridge.js https://api.example.com/mcp
 * node mcp-bridge.js https://api.example.com/mcp --auth-header "Authorization=Bearer token123"
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node mcp-bridge.js <http-endpoint> [--auth-header "Key=Value"]');
    console.error('');
    console.error('Examples:');
    console.error('  node mcp-bridge.js https://api.example.com/mcp');
    console.error('  node mcp-bridge.js https://api.example.com/mcp --auth-header "Authorization=Bearer abc123"');
    console.error('  node mcp-bridge.js https://api.example.com/mcp --auth-header "X-API-Key=xyz789"');
    process.exit(1);
  }

  const httpEndpoint = args[0];
  const authHeaders: Record<string, string> = {};

  // Parse auth headers
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--auth-header' && i + 1 < args.length) {
      const headerString = args[i + 1];
      const [key, ...valueParts] = headerString.split('=');
      const value = valueParts.join('='); // Handle values with = signs
      
      if (key && value) {
        authHeaders[key] = value;
        console.error(`Added auth header: ${key}=***`);
      }
      i++; // Skip next argument since we processed it
    }
  }

  try {
    const bridge = new MCPHttpBridge(httpEndpoint, authHeaders);
    await bridge.run();
  } catch (error) {
    console.error('Bridge failed to start:', error);
    process.exit(1);
  }
}

// ======================================================================
// DYNAMIC DISCOVERY INTEGRATION
// ======================================================================

/**
 * Enhanced Bridge with Dynamic Discovery
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
   * Create a bridge to a server discovered by intent
   */
  async createBridgeForIntent(intent: string, authHeaders: Record<string, string> = {}): Promise<MCPHttpBridge> {
    const servers = await this.discoverServersByIntent(intent);
    
    if (servers.length === 0) {
      throw new Error(`No servers found for intent: ${intent}`);
    }

    // Use the first (most relevant) server
    const endpoint = servers[0].endpoint;
    return new MCPHttpBridge(endpoint, authHeaders);
  }

  private async discoverServerEndpoint(domain: string): Promise<string> {
    const response = await fetch(`${this.discoveryEndpoint}/discover?domain=${encodeURIComponent(domain)}`);
    
    if (!response.ok) {
      throw new Error(`Discovery failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.servers.length === 0) {
      throw new Error(`No MCP server found for domain: ${domain}`);
    }

    return data.servers[0].endpoint;
  }

  private async discoverServersByCapability(capability: string): Promise<any[]> {
    const response = await fetch(`${this.discoveryEndpoint}/discover?capability=${encodeURIComponent(capability)}`);
    
    if (!response.ok) {
      throw new Error(`Discovery failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.servers;
  }

  private async discoverServersByIntent(intent: string): Promise<any[]> {
    const response = await fetch(`${this.discoveryEndpoint}/discover?intent=${encodeURIComponent(intent)}`);
    
    if (!response.ok) {
      throw new Error(`Discovery failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.servers;
  }
}

// ======================================================================
// MAIN EXECUTION
// ======================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MCPHttpBridge, MCPDiscoveryBridge };
