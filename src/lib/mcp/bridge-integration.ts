// Bridge Integration Helper
// Integrates generated tools with main bridge
// Generated on 2025-06-05T06:13:11.205Z

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import BridgeToolsWithAPIParity from './bridge-tools';

/**
 * Enhanced bridge that combines the 6 main tools + invoke_tool
 */
export class IntegratedBridge {
  private server: McpServer;
  private bridgeTools: BridgeToolsWithAPIParity;

  constructor(server: McpServer, apiKey?: string) {
    this.server = server;
    this.bridgeTools = new BridgeToolsWithAPIParity(server, 'https://mcplookup.org/api', apiKey);
    this.setupIntegration();
  }

  /**
   * Setup integration with the 8 bridge tools
   */
  private setupIntegration(): void {
    console.log('🔧 Setting up integrated bridge with API parity tools');
    console.log('📊 Available tools: 7 main tools + invoke_tool');
    console.log('🎯 Tools call REST API instead of services directly');
  }

  /**
   * Get all available tools (7 bridge tools)
   */
  getAvailableTools(): Array<{
    name: string;
    description: string;
    category: string;
    source: 'bridge';
  }> {
    return [
      {
        name: 'discover_mcp_servers',
        description: 'Flexible MCP server discovery with natural language queries',
        category: 'Discovery',
        source: 'bridge' as const
      },
      {
        name: 'register_mcp_server',
        description: 'Register a new MCP server in the global registry',
        category: 'Registration',
        source: 'bridge' as const
      },
      {
        name: 'verify_domain_ownership',
        description: 'Check the DNS verification status for a domain registration',
        category: 'Verification',
        source: 'bridge' as const
      },
      {
        name: 'get_server_health',
        description: 'Get real-time health, performance, and reliability metrics',
        category: 'Health',
        source: 'bridge' as const
      },
      {
        name: 'browse_capabilities',
        description: 'Browse and search the taxonomy of available MCP capabilities',
        category: 'Discovery',
        source: 'bridge' as const
      },
      {
        name: 'get_discovery_stats',
        description: 'Get analytics about MCP server discovery patterns and usage statistics',
        category: 'Analytics',
        source: 'bridge' as const
      },
      {
        name: 'list_mcp_tools',
        description: 'List all available MCP tools provided by this discovery server',
        category: 'Discovery',
        source: 'bridge' as const
      },
      {
        name: 'invoke_tool',
        description: 'Call any tool on any streaming HTTP MCP server',
        category: 'Bridge',
        source: 'bridge' as const
      }
    ];
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): string[] {
    return this.getAvailableTools()
      .filter(tool => tool.category === category)
      .map(tool => tool.name);
  }

  /**
   * Check if a tool is available
   */
  hasToolAvailable(toolName: string): boolean {
    return this.getAvailableTools().some(tool => tool.name === toolName);
  }

  /**
   * Get tool metadata
   */
  getToolMetadata(toolName: string) {
    return this.getAvailableTools().find(tool => tool.name === toolName);
  }
}

// Export for use in main bridge
export { BridgeToolsWithAPIParity };

// Helper to setup integrated bridge
export function setupIntegratedBridge(server: McpServer, apiKey?: string): IntegratedBridge {
  return new IntegratedBridge(server, apiKey);
}
