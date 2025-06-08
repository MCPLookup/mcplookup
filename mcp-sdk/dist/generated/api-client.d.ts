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
     * Search and discover MCP servers
     */
    searchServers(params?: {
        q?: string;
        category?: 'development' | 'data' | 'communication' | 'api-integration' | 'utility' | 'other';
        quality?: 'high' | 'medium' | 'low';
        installation_method?: 'npm' | 'python' | 'docker' | 'git' | 'live_service';
        claude_ready?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{
        servers?: import("./api-types.js").components["schemas"]["MCPServer"][];
        total?: number;
        pagination?: {
            limit?: number;
            offset?: number;
            has_more?: boolean;
        };
    }>;
    /**
     * Get detailed information about a specific server
     */
    getServer(serverId: string): Promise<{
        id?: string;
        name?: string;
        description?: string;
        tagline?: string;
        category?: "development" | "data" | "communication" | "api-integration" | "utility" | "other";
        subcategories?: string[];
        tags?: string[];
        use_cases?: string[];
        quality?: import("./api-types.js").components["schemas"]["QualityMetrics"];
        popularity?: import("./api-types.js").components["schemas"]["PopularityMetrics"];
        installation?: import("./api-types.js").components["schemas"]["InstallationInfo"];
        environment?: import("./api-types.js").components["schemas"]["EnvironmentConfig"];
        claude_integration?: import("./api-types.js").components["schemas"]["ClaudeIntegration"];
        documentation?: import("./api-types.js").components["schemas"]["DocumentationInfo"];
        capabilities?: import("./api-types.js").components["schemas"]["ServerCapabilities"];
        availability?: import("./api-types.js").components["schemas"]["AvailabilityInfo"];
        api?: import("./api-types.js").components["schemas"]["APIConfiguration"];
        source?: import("./api-types.js").components["schemas"]["SourceInfo"];
        packages?: import("./api-types.js").components["schemas"]["PackageInfo"][];
        verification?: import("./api-types.js").components["schemas"]["VerificationStatus"];
        created_at?: string;
        updated_at?: string;
    } | undefined>;
    /**
     * Get installation instructions for a server
     */
    getInstallInstructions(serverId: string, params?: {
        method?: 'npm' | 'python' | 'docker' | 'git' | 'live_service';
        platform?: 'linux' | 'darwin' | 'win32';
    }): Promise<{
        recommended_method?: string;
        installation_steps?: {
            step?: string;
            command?: string;
            description?: string;
        }[];
        claude_config?: import("./api-types.js").components["schemas"]["ClaudeIntegration"];
        environment_setup?: import("./api-types.js").components["schemas"]["EnvironmentVariable"][];
    }>;
    /**
     * AI-powered smart discovery
     */
    smartDiscover(params: {
        query: string;
        context?: string;
        max_results?: number;
    }): Promise<{
        matches?: {
            server?: import("./api-types.js").components["schemas"]["MCPServer"];
            relevance_score?: number;
            match_reasons?: string[];
        }[];
        query_analysis?: {
            extracted_keywords?: string[];
            suggested_categories?: string[];
            intent?: string;
        };
    }>;
    /**
     * Update the base URL for the client
     */
    setBaseUrl(url: string): void;
    /**
     * Set API key for authenticated requests
     */
    setApiKey(apiKey: string): void;
}
//# sourceMappingURL=api-client.d.ts.map