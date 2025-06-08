// Dynamic tool registry for managing tools from bridge-mode servers

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ManagedServer } from '@mcplookup-org/mcp-sdk';

export class DynamicToolRegistry {
  private mcpServer: McpServer;
  private registeredTools = new Map<string, Set<string>>(); // serverName -> Set<toolName>

  constructor(mcpServer: McpServer) {
    this.mcpServer = mcpServer;
  }

  /**
   * Add dynamic tools from a managed server to the bridge
   */
  async addServerTools(serverName: string, server: ManagedServer): Promise<void> {
    if (!server.client) {
      console.warn(`Cannot add tools for ${serverName}: no client connection`);
      return;
    }

    try {
      // Get available tools from the server
      const tools = await server.client.listTools();
      const toolNames = new Set<string>();

      for (const tool of tools.tools || []) {
        const toolName = tool.name;
        const prefixedToolName = `${serverName}_${toolName}`;
        
        // Store the tool name for cleanup later
        toolNames.add(prefixedToolName);

        // Create dynamic tool that delegates to the managed server
        this.mcpServer.tool(
          prefixedToolName,
          tool.inputSchema || {},
          async (args: any) => {
            try {
              if (!server.client) {
                throw new Error(`Server ${serverName} is not running`);
              }

              const result = await server.client.callTool({
                name: toolName,
                arguments: args
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
                  text: `❌ Error calling ${toolName} on ${serverName}: ${error instanceof Error ? error.message : 'Unknown error'}`
                }],
                isError: true
              };
            }
          }
        );
      }

      // Store registered tools for this server
      this.registeredTools.set(serverName, toolNames);

      console.log(`🔧 Added ${toolNames.size} dynamic tools from '${serverName}': ${Array.from(toolNames).join(', ')}`);
    } catch (error) {
      console.error(`Failed to add tools from ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Remove dynamic tools for a server
   */
  async removeServerTools(serverName: string): Promise<void> {
    const toolNames = this.registeredTools.get(serverName);
    if (!toolNames) {
      return;
    }

    // Note: The MCP SDK doesn't provide a way to unregister tools,
    // so we just remove them from our tracking and they'll be inactive
    this.registeredTools.delete(serverName);

    console.log(`🗑️ Removed ${toolNames.size} dynamic tools from '${serverName}'`);
  }

  /**
   * Get all registered tools for a server
   */
  getServerTools(serverName: string): string[] {
    const toolNames = this.registeredTools.get(serverName);
    return toolNames ? Array.from(toolNames) : [];
  }

  /**
   * Get all registered dynamic tools
   */
  getAllDynamicTools(): Map<string, string[]> {
    const result = new Map<string, string[]>();
    for (const [serverName, toolNames] of this.registeredTools) {
      result.set(serverName, Array.from(toolNames));
    }
    return result;
  }

  /**
   * Check if a tool is registered
   */
  isToolRegistered(serverName: string, toolName: string): boolean {
    const toolNames = this.registeredTools.get(serverName);
    return toolNames ? toolNames.has(`${serverName}_${toolName}`) : false;
  }

  /**
   * Get statistics about registered tools
   */
  getStats(): {
    totalServers: number;
    totalTools: number;
    serverToolCounts: Record<string, number>;
  } {
    const serverToolCounts: Record<string, number> = {};
    let totalTools = 0;

    for (const [serverName, toolNames] of this.registeredTools) {
      const count = toolNames.size;
      serverToolCounts[serverName] = count;
      totalTools += count;
    }

    return {
      totalServers: this.registeredTools.size,
      totalTools,
      serverToolCounts
    };
  }

  /**
   * Refresh tools for a server (re-register after server restart)
   */
  async refreshServerTools(serverName: string, server: ManagedServer): Promise<void> {
    // Remove existing tools
    await this.removeServerTools(serverName);
    
    // Add tools again
    await this.addServerTools(serverName, server);
  }

  /**
   * Clear all registered tools
   */
  clearAll(): void {
    this.registeredTools.clear();
    console.log('🧹 Cleared all dynamic tool registrations');
  }

  /**
   * Export tool registry state for debugging
   */
  exportState(): {
    servers: string[];
    tools: Record<string, string[]>;
    totalTools: number;
  } {
    const tools: Record<string, string[]> = {};
    let totalTools = 0;

    for (const [serverName, toolNames] of this.registeredTools) {
      tools[serverName] = Array.from(toolNames);
      totalTools += toolNames.size;
    }

    return {
      servers: Array.from(this.registeredTools.keys()),
      tools,
      totalTools
    };
  }
}
