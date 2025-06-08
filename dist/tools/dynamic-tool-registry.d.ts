import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ManagedServer } from '@mcplookup-org/mcp-sdk';
export declare class DynamicToolRegistry {
    private mcpServer;
    private registeredTools;
    constructor(mcpServer: McpServer);
    /**
     * Add dynamic tools from a managed server to the bridge
     */
    addServerTools(serverName: string, server: ManagedServer): Promise<void>;
    /**
     * Remove dynamic tools for a server
     */
    removeServerTools(serverName: string): Promise<void>;
    /**
     * Get all registered tools for a server
     */
    getServerTools(serverName: string): string[];
    /**
     * Get all registered dynamic tools
     */
    getAllDynamicTools(): Map<string, string[]>;
    /**
     * Check if a tool is registered
     */
    isToolRegistered(serverName: string, toolName: string): boolean;
    /**
     * Get statistics about registered tools
     */
    getStats(): {
        totalServers: number;
        totalTools: number;
        serverToolCounts: Record<string, number>;
    };
    /**
     * Refresh tools for a server (re-register after server restart)
     */
    refreshServerTools(serverName: string, server: ManagedServer): Promise<void>;
    /**
     * Clear all registered tools
     */
    clearAll(): void;
    /**
     * Export tool registry state for debugging
     */
    exportState(): {
        servers: string[];
        tools: Record<string, string[]>;
        totalTools: number;
    };
}
//# sourceMappingURL=dynamic-tool-registry.d.ts.map