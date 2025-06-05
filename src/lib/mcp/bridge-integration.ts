// Bridge Integration Helper
// Integrates generated tools with main bridge
// Generated on 2025-06-05T06:13:11.205Z

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GeneratedBridgeTools, GENERATED_TOOL_METADATA } from './bridge-generated';
import { BRIDGE_CONFIG } from './bridge-config';

/**
 * Enhanced bridge that combines manual and generated tools
 */
export class IntegratedBridge {
  private server: McpServer;
  private generatedTools: GeneratedBridgeTools;

  constructor(server: McpServer) {
    this.server = server;
    this.generatedTools = new GeneratedBridgeTools(server, BRIDGE_CONFIG.apiBaseUrl);
    this.setupIntegration();
  }

  /**
   * Setup integration between manual and generated tools
   */
  private setupIntegration(): void {
    console.log('🔧 Setting up integrated bridge with generated tools');
    console.log(`📊 Generated tools available: ${GENERATED_TOOL_METADATA.length}`);
    
    // Log available tool categories
    const categories = new Set(GENERATED_TOOL_METADATA.map(t => t.category));
    console.log(`📂 Tool categories: ${Array.from(categories).join(', ')}`);
  }

  /**
   * Get all available tools (manual + generated)
   */
  getAvailableTools(): Array<{
    name: string;
    description: string;
    category: string;
    source: 'manual' | 'generated';
  }> {
    const tools = [];
    
    // Add generated tools
    for (const tool of GENERATED_TOOL_METADATA) {
      tools.push({
        name: tool.name,
        description: tool.description,
        category: tool.category,
        source: 'generated' as const
      });
    }
    
    // Add manual tools (you can extend this)
    const manualTools = [
      {
        name: 'connect_and_list_tools',
        description: 'Connect to any MCP server and list its tools',
        category: 'Bridge',
        source: 'manual' as const
      },
      {
        name: 'call_tool_on_server',
        description: 'Call any tool on any MCP server',
        category: 'Bridge', 
        source: 'manual' as const
      },
      {
        name: 'read_resource_from_server',
        description: 'Read any resource from any MCP server',
        category: 'Bridge',
        source: 'manual' as const
      }
    ];
    
    tools.push(...manualTools);
    return tools;
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
export { GeneratedBridgeTools, BRIDGE_CONFIG, GENERATED_TOOL_METADATA };

// Helper to setup integrated bridge
export function setupIntegratedBridge(server: McpServer): IntegratedBridge {
  return new IntegratedBridge(server);
}
