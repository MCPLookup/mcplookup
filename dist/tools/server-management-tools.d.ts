import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ServerInstallOptions, ServerControlOptions, ToolCallResult } from '@mcplookup-org/mcp-sdk/types';
import { ServerRegistry } from '../server-management/server-registry.js';
import { ClaudeConfigManager } from '../server-management/claude-config-manager.js';
import { DockerManager } from '../server-management/docker-manager.js';
import { DynamicToolRegistry } from './dynamic-tool-registry.js';
export declare class ServerManagementTools {
    private serverRegistry;
    private claudeConfigManager;
    private dockerManager;
    private dynamicToolRegistry;
    constructor(serverRegistry: ServerRegistry, claudeConfigManager: ClaudeConfigManager, dockerManager: DockerManager, dynamicToolRegistry: DynamicToolRegistry);
    /**
     * Register all server management tools with the MCP server
     */
    registerTools(server: McpServer): void;
    private registerInstallationTools;
    private registerBridgeModeTools;
    private registerDirectModeTools;
    installServer(options: ServerInstallOptions): Promise<ToolCallResult>;
    private installBridgeMode;
    private installDirectMode;
    listManagedServers(): Promise<ToolCallResult>;
    controlServer(options: ServerControlOptions): Promise<ToolCallResult>;
    listClaudeServers(): Promise<ToolCallResult>;
    private removeClaudeServer;
}
//# sourceMappingURL=server-management-tools.d.ts.map