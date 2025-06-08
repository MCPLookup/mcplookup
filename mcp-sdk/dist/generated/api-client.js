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
     * Search and discover MCP servers
     */
    async searchServers(params) {
        const { data, error } = await this.client.GET('/servers', {
            params: { query: params }
        });
        if (error) {
            throw new Error(`Search failed: ${error}`);
        }
        return data;
    }
    /**
     * Get detailed information about a specific server
     */
    async getServer(serverId) {
        const { data, error } = await this.client.GET('/servers/{serverId}', {
            params: { path: { serverId } }
        });
        if (error) {
            throw new Error(`Failed to get server: ${error}`);
        }
        return data;
    }
    /**
     * Get installation instructions for a server
     */
    async getInstallInstructions(serverId, params) {
        const { data, error } = await this.client.GET('/servers/{serverId}/install', {
            params: {
                path: { serverId },
                query: params
            }
        });
        if (error) {
            throw new Error(`Failed to get installation instructions: ${error}`);
        }
        return data;
    }
    /**
     * AI-powered smart discovery
     */
    async smartDiscover(params) {
        const { data, error } = await this.client.POST('/discover/smart', {
            body: params
        });
        if (error) {
            throw new Error(`Smart discovery failed: ${error}`);
        }
        return data;
    }
    /**
     * Update the base URL for the client
     */
    setBaseUrl(url) {
        this.baseUrl = url;
        this.client = createClient({
            baseUrl: url
        });
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
//# sourceMappingURL=api-client.js.map