import { MCPLookupAPIClient } from '@mcplookup-org/mcp-sdk';
import { CoreTools } from './tools/core-tools.js';
import { ServerManagementTools } from './tools/server-management-tools.js';
import { DynamicToolRegistry } from './tools/dynamic-tool-registry.js';
import { ToolInvoker } from './tools/tool-invoker.js';
import { ServerRegistry } from './server-management/server-registry.js';
import { ClaudeConfigManager } from './server-management/claude-config-manager.js';
import { DockerManager } from './server-management/docker-manager.js';
/**
 * Refactored MCP Bridge with clean separation of concerns
 *
 * Architecture:
 * - CoreTools: Handles mcplookup.org API integration
 * - ServerManagementTools: Handles server installation and lifecycle
 * - DynamicToolRegistry: Manages dynamic tool registration from bridge servers
 * - ServerRegistry: Manages bridge-mode server state
 * - ClaudeConfigManager: Manages direct-mode Claude Desktop configuration
 * - DockerManager: Handles Docker container operations
 * - ToolInvoker: Handles dynamic tool invocation on remote servers
 */
export declare class MCPLookupBridge {
    private server;
    private apiClient;
    private coreTools;
    private serverManagementTools;
    private dynamicToolRegistry;
    private toolInvoker;
    private serverRegistry;
    private claudeConfigManager;
    private dockerManager;
    constructor(apiKey?: string, baseUrl?: string);
    /**
     * Set up all tools by delegating to component classes
     */
    private setupTools;
    /**
     * Run the bridge on stdio (for Claude Desktop integration)
     */
    run(): Promise<void>;
    /**
     * Run the bridge as an HTTP server
     */
    runHTTP(port?: number): Promise<void>;
    /**
     * Log startup information
     */
    private logStartupInfo;
    /**
     * Get bridge statistics
     */
    getStats(): {
        coreTools: number;
        managementTools: number;
        dynamicTools: number;
        managedServers: number;
        serverRegistry: ReturnType<ServerRegistry['getStats']>;
        dynamicRegistry: ReturnType<DynamicToolRegistry['getStats']>;
    };
    /**
     * Health check for all components
     */
    healthCheck(): Promise<{
        bridge: boolean;
        apiClient: boolean;
        docker: boolean;
        claudeConfig: boolean;
        servers: Map<string, {
            healthy: boolean;
            issues: string[];
        }>;
    }>;
    /**
     * Graceful shutdown
     */
    close(): Promise<void>;
    /**
     * Auto-maintenance routine
     */
    performMaintenance(): Promise<{
        restarted: string[];
        cleaned: string[];
        errors: string[];
    }>;
    /**
     * Export bridge state for debugging
     */
    exportState(): {
        servers: ReturnType<ServerRegistry['listServers']>;
        dynamicTools: ReturnType<DynamicToolRegistry['exportState']>;
        stats: ReturnType<MCPLookupBridge['getStats']>;
    };
    get components(): {
        serverRegistry: ServerRegistry;
        claudeConfigManager: ClaudeConfigManager;
        dockerManager: DockerManager;
        dynamicToolRegistry: DynamicToolRegistry;
        toolInvoker: ToolInvoker;
        coreTools: CoreTools;
        serverManagementTools: ServerManagementTools;
    };
    get client(): MCPLookupAPIClient;
    get api(): {
        discoverServers(params: any): Promise<any>;
        smartDiscovery(params: any): Promise<any>;
        registerServer(params: any): Promise<any>;
        getOnboardingState(): Promise<any>;
        installServer(params: any): Promise<import("@mcplookup-org/mcp-sdk").ToolCallResult>;
        listManagedServers(): Promise<import("@mcplookup-org/mcp-sdk").ToolCallResult>;
        controlServer(params: any): Promise<import("@mcplookup-org/mcp-sdk").ToolCallResult>;
        listClaudeServers(): Promise<import("@mcplookup-org/mcp-sdk").ToolCallResult>;
        getServerHealth(serverName: string): Promise<{
            status: import("@mcplookup-org/mcp-sdk").ManagedServer["status"];
            toolCount: number;
            uptime?: number;
            lastError?: string;
        }>;
    };
}
export declare const MCPHttpBridge: typeof MCPLookupBridge;
export declare const EnhancedMCPBridge: typeof MCPLookupBridge;
export declare const MCPDiscoveryBridge: typeof MCPLookupBridge;
//# sourceMappingURL=bridge.d.ts.map