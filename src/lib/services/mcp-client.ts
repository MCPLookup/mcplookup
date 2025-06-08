// HTTP Streaming MCP Client Service
// Enhanced with SDK for comprehensive MCP transport support

import { MCPLookupAPIClient, HttpStreamingMCPClient } from '@mcplookup-org/mcp-sdk';
import { MCPServerRecord } from '../schemas/discovery';

export interface MCPConnectionOptions {
  endpoint: string;
  domain: string;
  auth?: {
    type: 'none' | 'api_key' | 'oauth' | 'custom';
    credentials?: Record<string, string>;
  };
  timeout?: number;
  maxRetries?: number;
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    url?: string;
  }>;
  isError?: boolean;
}

export interface MCPServerConnection {
  domain: string;
  endpoint: string;
  client: HttpStreamingMCPClient;
  connected: boolean;
  tools: any[];
  resources: any[];
  lastActivity: Date;
}

/**
 * MCP Client Service
 * Manages HTTP streaming connections to MCP servers using SDK
 */
export class MCPClientService {
  private connections: Map<string, MCPServerConnection> = new Map();
  private apiClient: MCPLookupAPIClient;

  constructor() {
    this.apiClient = new MCPLookupAPIClient();
  }

  /**
   * Connect to an MCP server using HTTP streaming transport
   */
  async connect(server: MCPServerRecord, options?: Partial<MCPConnectionOptions>): Promise<MCPServerConnection> {
    const domain = server.domain;
    
    // Check if already connected
    if (this.connections.has(domain)) {
      const existing = this.connections.get(domain)!;
      if (existing.connected) {
        return existing;
      }
    }

    // Create connection options
    const connectionOptions: MCPConnectionOptions = {
      endpoint: server.endpoint || `https://${domain}/mcp`,
      domain: domain,
      auth: server.auth || { type: 'none' },
      timeout: options?.timeout || 30000,
      maxRetries: options?.maxRetries || 3,
      ...options
    };

    // Create SDK HTTP streaming client
    const client = new HttpStreamingMCPClient(connectionOptions.endpoint, {
      auth: connectionOptions.auth,
      timeout: connectionOptions.timeout,
      maxRetries: connectionOptions.maxRetries
    });

    try {
      // Initialize connection
      await client.connect();

      // Get server info
      const serverInfo = await client.initialize({
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {},
          logging: {}
        },
        clientInfo: {
          name: 'mcplookup-web',
          version: '1.0.0'
        }
      });

      // List available tools
      const toolsResponse = await client.listTools();
      const tools = toolsResponse.tools || [];

      // List available resources
      let resources: any[] = [];
      try {
        const resourcesResponse = await client.listResources();
        resources = resourcesResponse.resources || [];
      } catch (error) {
        // Resources might not be supported
        console.debug('Resources not supported by server:', domain);
      }

      // Create connection record
      const connection: MCPServerConnection = {
        domain,
        endpoint: connectionOptions.endpoint,
        client,
        connected: true,
        tools,
        resources,
        lastActivity: new Date()
      };

      this.connections.set(domain, connection);
      return connection;

    } catch (error) {
      throw new Error(`Failed to connect to MCP server ${domain}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Call a tool on a connected MCP server
   */
  async callTool(domain: string, toolCall: MCPToolCall): Promise<MCPToolResult> {
    const connection = this.connections.get(domain);
    if (!connection || !connection.connected) {
      throw new Error(`Not connected to server: ${domain}`);
    }

    try {
      const result = await connection.client.callTool({
        name: toolCall.name,
        arguments: toolCall.arguments
      });

      // Update last activity
      connection.lastActivity = new Date();

      return {
        content: result.content || [],
        isError: result.isError || false
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Tool call failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  /**
   * Read a resource from a connected MCP server
   */
  async readResource(domain: string, resourceUri: string): Promise<MCPToolResult> {
    const connection = this.connections.get(domain);
    if (!connection || !connection.connected) {
      throw new Error(`Not connected to server: ${domain}`);
    }

    try {
      const result = await connection.client.readResource({
        uri: resourceUri
      });

      // Update last activity
      connection.lastActivity = new Date();

      return {
        content: result.contents || [],
        isError: false
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Resource read failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  /**
   * Get connection status for a domain
   */
  getConnection(domain: string): MCPServerConnection | null {
    return this.connections.get(domain) || null;
  }

  /**
   * Get all active connections
   */
  getAllConnections(): MCPServerConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Disconnect from a server
   */
  async disconnect(domain: string): Promise<void> {
    const connection = this.connections.get(domain);
    if (connection) {
      try {
        await connection.client.disconnect();
      } catch (error) {
        console.warn(`Error disconnecting from ${domain}:`, error);
      }
      this.connections.delete(domain);
    }
  }

  /**
   * Disconnect from all servers
   */
  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.connections.keys()).map(domain => 
      this.disconnect(domain)
    );
    await Promise.allSettled(disconnectPromises);
  }

  /**
   * Test connection to a server without establishing persistent connection
   */
  async testConnection(server: MCPServerRecord): Promise<{
    success: boolean;
    error?: string;
    serverInfo?: any;
    tools?: any[];
    responseTime?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const endpoint = server.endpoint || `https://${server.domain}/mcp`;
      const client = new HttpStreamingMCPClient(endpoint, {
        auth: server.auth || { type: 'none' },
        timeout: 10000 // Shorter timeout for testing
      });

      await client.connect();

      const serverInfo = await client.initialize({
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {}
        },
        clientInfo: {
          name: 'mcplookup-test',
          version: '1.0.0'
        }
      });

      let tools: any[] = [];
      try {
        const toolsResponse = await client.listTools();
        tools = toolsResponse.tools || [];
      } catch (error) {
        // Tools might not be supported
      }

      await client.disconnect();

      return {
        success: true,
        serverInfo,
        tools,
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Discover and test multiple servers in parallel
   */
  async discoverAndTestServers(domains: string[]): Promise<Map<string, any>> {
    const results = new Map();
    
    // Get server records from discovery
    const serverPromises = domains.map(async (domain) => {
      try {
        const servers = await this.apiClient.searchServers({ q: `domain:${domain}` });
        return servers?.servers?.[0] || null;
      } catch (error) {
        return null;
      }
    });

    const serverRecords = await Promise.allSettled(serverPromises);

    // Test connections in parallel
    const testPromises = serverRecords.map(async (result, index) => {
      const domain = domains[index];
      
      if (result.status === 'fulfilled' && result.value) {
        const testResult = await this.testConnection(result.value);
        return { domain, ...testResult };
      } else {
        return {
          domain,
          success: false,
          error: 'Server not found in registry'
        };
      }
    });

    const testResults = await Promise.allSettled(testPromises);

    testResults.forEach((result, index) => {
      const domain = domains[index];
      if (result.status === 'fulfilled') {
        results.set(domain, result.value);
      } else {
        results.set(domain, {
          domain,
          success: false,
          error: 'Test failed'
        });
      }
    });

    return results;
  }

  /**
   * Cleanup inactive connections
   */
  async cleanupInactiveConnections(maxIdleTime = 30 * 60 * 1000): Promise<void> {
    const now = new Date();
    const domainsToCleanup: string[] = [];

    for (const [domain, connection] of this.connections.entries()) {
      const idleTime = now.getTime() - connection.lastActivity.getTime();
      if (idleTime > maxIdleTime) {
        domainsToCleanup.push(domain);
      }
    }

    for (const domain of domainsToCleanup) {
      await this.disconnect(domain);
    }
  }
}

// Export singleton instance for web app
export const mcpClientService = new MCPClientService();
