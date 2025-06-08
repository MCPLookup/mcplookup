// Core MCP tools that interact with mcplookup.org API
import { z } from 'zod';
import { ToolInvoker } from './tool-invoker.js';
import { createSuccessResult, executeWithErrorHandling } from '@mcplookup-org/mcp-sdk';
export class CoreTools {
    apiClient;
    toolInvoker;
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.toolInvoker = new ToolInvoker();
    }
    /**
     * Register all core tools with the MCP server
     */
    registerTools(server) {
        this.registerDiscoveryTools(server);
        this.registerRegistrationTools(server);
        this.registerMonitoringTools(server);
        this.registerInvocationTools(server);
    }
    registerDiscoveryTools(server) {
        // Tool 1: Discover MCP servers
        server.tool('discover_mcp_servers', {
            query: z.string().optional().describe('Natural language query'),
            intent: z.string().optional().describe('Specific intent or use case'),
            domain: z.string().optional().describe('Specific domain to search for'),
            capability: z.string().optional().describe('Specific capability to search for'),
            category: z.enum(['communication', 'productivity', 'development', 'finance', 'social', 'storage', 'other']).optional(),
            transport: z.enum(['sse', 'stdio', 'http']).optional().describe('Preferred transport protocol'),
            verified_only: z.boolean().optional().describe('Only return verified servers'),
            limit: z.number().optional().describe('Maximum number of results (default: 10)'),
            offset: z.number().optional().describe('Offset for pagination (default: 0)')
        }, async (options) => this.discoverServers(options));
        // Tool 2: Smart discovery with AI
        server.tool('discover_smart', {
            query: z.string().describe('Natural language query describing what you need'),
            context: z.string().optional().describe('Additional context about your use case'),
            limit: z.number().optional().describe('Maximum number of results (default: 5)')
        }, async (options) => this.smartDiscovery(options));
    }
    registerRegistrationTools(server) {
        // Tool 3: Register a new MCP server
        server.tool('register_server', {
            domain: z.string().describe('Domain of the MCP server'),
            endpoint: z.string().describe('MCP server endpoint URL'),
            contact_email: z.string().describe('Contact email for verification'),
            description: z.string().optional().describe('Description of the server')
        }, async (options) => this.registerServer(options));
        // Tool 4: Verify domain ownership
        server.tool('verify_domain', {
            domain: z.string().describe('Domain to verify ownership for')
        }, async (options) => this.verifyDomain(options));
        // Tool 5: Check domain ownership status
        server.tool('check_domain_ownership', {
            domain: z.string().describe('Domain to check ownership status for')
        }, async (options) => this.checkDomainOwnership(options));
    }
    registerMonitoringTools(server) {
        // Tool 6: Get server health metrics
        server.tool('get_server_health', {
            server_id: z.string().optional().describe('Specific server ID to check'),
            limit: z.number().optional().describe('Maximum number of results')
        }, async (options) => this.getServerHealth(options));
        // Tool 7: Get user onboarding state
        server.tool('get_onboarding_state', {}, async () => this.getOnboardingState());
    }
    registerInvocationTools(server) {
        // Tool 8: Invoke tool on any MCP server
        server.tool('invoke_tool', {
            endpoint: z.string().describe('MCP server endpoint URL'),
            tool_name: z.string().describe('Name of the tool to invoke'),
            arguments: z.record(z.any()).describe('Arguments to pass to the tool'),
            headers: z.record(z.string()).optional().describe('Optional HTTP headers for authentication')
        }, async (options) => this.invokeTool(options));
    }
    // Implementation methods
    async discoverServers(options) {
        return executeWithErrorHandling(async () => {
            const requestBody = {};
            if (options.query)
                requestBody.query = options.query;
            if (options.intent)
                requestBody.intent = options.intent;
            if (options.limit)
                requestBody.limit = options.limit;
            if (options.transport) {
                requestBody.technical = { transport: options.transport };
            }
            if (options.domain) {
                requestBody.query = requestBody.query ? `${requestBody.query} domain:${options.domain}` : `domain:${options.domain}`;
            }
            if (options.capability) {
                requestBody.query = requestBody.query ? `${requestBody.query} capability:${options.capability}` : `capability:${options.capability}`;
            }
            // TODO: Update when SDK client supports discover method
            return createSuccessResult({ message: 'Discovery API integration pending' });
        }, 'Error discovering servers');
    }
    async smartDiscovery(options) {
        return executeWithErrorHandling(async () => {
            // TODO: Update when SDK client supports discoverSmart method
            return createSuccessResult({ message: 'Smart discovery API integration pending' });
        }, 'Error in smart discovery');
    }
    async registerServer(options) {
        return executeWithErrorHandling(async () => {
            // TODO: Update when SDK client supports register method
            return createSuccessResult({ message: 'Registration API integration pending' });
        }, 'Error registering server');
    }
    async verifyDomain(options) {
        try {
            // TODO: Update when SDK client supports startDomainVerification method
            const result = { message: 'Domain verification API integration pending' };
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error verifying domain: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }],
                isError: true
            };
        }
    }
    async checkDomainOwnership(options) {
        try {
            // TODO: Update when SDK client supports checkDomainOwnership method
            const result = { message: 'Domain ownership check API integration pending' };
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error checking domain ownership: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }],
                isError: true
            };
        }
    }
    async getServerHealth(options) {
        try {
            // TODO: Update when SDK client supports getServerHealth method
            const result = { message: 'Server health API integration pending' };
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error getting server health: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }],
                isError: true
            };
        }
    }
    async getOnboardingState() {
        try {
            // TODO: Update when SDK client supports getOnboardingState method
            const result = { message: 'Onboarding state API integration pending' };
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error getting onboarding state: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }],
                isError: true
            };
        }
    }
    async invokeTool(options) {
        return this.toolInvoker.invoke(options);
    }
}
//# sourceMappingURL=core-tools.js.map