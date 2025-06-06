export type { paths } from './api-types.js';
/**
 * MCPLookup.org API Client
 *
 * Provides type-safe access to the MCPLookup.org discovery service API.
 */
export declare class MCPLookupAPIClient {
    private client;
    private baseUrl;
    constructor(baseUrl?: string, apiKey?: string);
    /**
     * Discover MCP servers using various search criteria
     */
    discover(params?: {
        query?: string;
        intent?: string;
        domain?: string;
        capability?: string;
        category?: 'communication' | 'productivity' | 'development' | 'finance' | 'social' | 'storage' | 'other';
        transport?: 'streamable_http' | 'sse' | 'stdio';
        cors_required?: boolean;
        ssl_required?: boolean;
        verified_only?: boolean;
        include_health?: boolean;
        include_tools?: boolean;
        include_resources?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{
        servers?: import("./api-types.js").components["schemas"]["MCPServerRecord"][];
        total?: number;
        query_analysis?: Record<string, never>;
        transport_summary?: {
            protocols?: Record<string, never>;
            sse_support?: number;
            session_support?: number;
            cors_enabled?: number;
        };
    } | undefined>;
    /**
     * Smart AI-powered discovery using natural language
     */
    discoverSmart(params: {
        query: string;
        max_results?: number;
        include_reasoning?: boolean;
    }): Promise<{
        servers?: import("./api-types.js").components["schemas"]["MCPServerRecord"][];
        total?: number;
        query_analysis?: {
            extracted_keywords?: string[];
            detected_capabilities?: string[];
            confidence_score?: number;
        };
        ai_reasoning?: string;
    } | undefined>;
    /**
     * Register a new MCP server
     */
    register(params: {
        domain: string;
        endpoint: string;
        contact_email: string;
        description?: string;
    }): Promise<{
        challenge_id?: string;
        dns_record?: string;
        verification_token?: string;
        instructions?: string;
        expires_at?: string;
    } | undefined>;
    /**
     * Get server health metrics
     */
    getServerHealth(domain: string, realtime?: boolean): Promise<{
        domain?: string;
        endpoint?: string;
        health?: import("./api-types.js").components["schemas"]["HealthMetrics"];
        capabilities_working?: boolean;
        ssl_valid?: boolean;
        trust_score?: number;
    } | undefined>;
    /**
     * Set API key for authenticated requests
     */
    setApiKey(apiKey: string): void;
}
export declare const mcpLookupClient: MCPLookupAPIClient;
//# sourceMappingURL=api-client.d.ts.map