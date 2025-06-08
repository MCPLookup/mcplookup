import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ServerControlOptions, ToolCallResult } from '@mcplookup-org/mcp-sdk';
import { ServerRegistry } from '../server-management/server-registry.js';
import { ClaudeConfigManager } from '../server-management/claude-config-manager.js';
import { DockerManager } from '../server-management/docker-manager.js';
import { DynamicToolRegistry } from './dynamic-tool-registry.js';
export declare class ServerManagementTools {
    private serverRegistry;
    private claudeConfigManager;
    private dockerManager;
    private dynamicToolRegistry;
    private installationResolver;
    constructor(serverRegistry: ServerRegistry, claudeConfigManager: ClaudeConfigManager, dockerManager: DockerManager, dynamicToolRegistry: DynamicToolRegistry);
    /**
     * Register all server management tools with the MCP server
     */
    registerTools(server: McpServer): void;
    private registerInstallationTools;
    private registerBridgeModeTools;
    private registerDirectModeTools;
    installServerWithSDK(options: {
        package_query: string;
        name?: string;
        mode: 'bridge' | 'direct';
        auto_start: boolean;
        global_install: boolean;
        env?: Record<string, string>;
    }): Promise<ToolCallResult>;
    private installBridgeModeWithSDK;
    private installDirectModeWithSDK;
    listManagedServers(): Promise<ToolCallResult>;
    controlServer(options: ServerControlOptions): Promise<ToolCallResult>;
    listClaudeServers(): Promise<ToolCallResult>;
    private removeClaudeServer;
}
//# sourceMappingURL=server-management-tools.d.ts.map