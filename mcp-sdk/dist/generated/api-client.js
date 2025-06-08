// Generated API client for MCPLookup.org
// DO NOT EDIT - This file is auto-generated
import createClient from 'openapi-fetch';
/**
 * MCPLookup.org API Client
 *
 * Provides type-safe access to the MCPLookup.org discovery service API.
 */
export class MCPLookupAPIClient {
    client;
    baseUrl;
    constructor(baseUrl = 'https://mcplookup.org/api/v1', apiKey) {
        this.baseUrl = baseUrl;
        this.client = createClient({
            baseUrl,
            headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
        });
    }
    /**
     * Discover MCP servers using various search criteria
     */
    async discover(params = {}) {
        const { data, error } = await this.client.GET('/discover', {
            params: { query: params }
        });
        if (error) {
            throw new Error(`Discovery failed: ${JSON.stringify(error)}`);
        }
        return data;
    }
    /**
     * Smart AI-powered discovery using natural language
     */
    async discoverSmart(params) {
        const { data, error } = await this.client.POST('/discover/smart', {
            body: params
        });
        if (error) {
            throw new Error(`Smart discovery failed: ${JSON.stringify(error)}`);
        }
        return data;
    }
    /**
     * Register a new MCP server
     */
    async register(params) {
        const { data, error } = await this.client.POST('/register', {
            body: params
        });
        if (error) {
            throw new Error(`Registration failed: ${JSON.stringify(error)}`);
        }
        return data;
    }
    /**
     * Get server health metrics
     */
    async getServerHealth(domain, realtime = false) {
        const { data, error } = await this.client.GET('/health/{domain}', {
            params: {
                path: { domain },
                query: { realtime }
            }
        });
        if (error) {
            throw new Error(`Health check failed: ${JSON.stringify(error)}`);
        }
        return data;
    }
    /**
     * Set API key for authenticated requests
     */
    setApiKey(apiKey) {
        this.client = createClient({
            baseUrl: this.baseUrl,
            headers: { Authorization: `Bearer ${apiKey}` }
        });
    }
}
// Export default instance for convenience
export const mcpLookupClient = new MCPLookupAPIClient();
//# sourceMappingURL=api-client.js.map