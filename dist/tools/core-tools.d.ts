import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MCPLookupAPIClient } from '../generated/api-client.js';
export declare class CoreTools {
    private apiClient;
    private toolInvoker;
    constructor(apiClient: MCPLookupAPIClient);
    /**
     * Register all core tools with the MCP server
     */
    registerTools(server: McpServer): void;
    private registerDiscoveryTools;
    private registerRegistrationTools;
    private registerMonitoringTools;
    private registerInvocationTools;
    private discoverServers;
    private smartDiscovery;
    private registerServer;
    private verifyDomain;
    private checkDomainOwnership;
    private getServerHealth;
    private getOnboardingState;
    private invokeTool;
}
//# sourceMappingURL=core-tools.d.ts.map