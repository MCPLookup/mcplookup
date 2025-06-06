import type { paths } from './client';
export declare const apiClient: import("openapi-fetch").Client<paths, `${string}/${string}`>;
export declare class MCPLookupAPIClient {
    private client;
    constructor(baseUrl?: string, apiKey?: string);
    discover(params: paths['/discover']['post']['requestBody']['content']['application/json']): Promise<{
        servers?: import("./client").components["schemas"]["MCPServerRecord"][];
        total?: number;
        query_analysis?: Record<string, never>;
        transport_summary?: {
            protocols?: Record<string, never>;
            sse_support?: number;
            session_support?: number;
            cors_enabled?: number;
        };
    } | undefined>;
    discoverSmart(params: paths['/discover/smart']['post']['requestBody']['content']['application/json']): Promise<{
        servers?: import("./client").components["schemas"]["MCPServerRecord"][];
        total?: number;
        query_analysis?: {
            extracted_keywords?: string[];
            detected_capabilities?: string[];
            confidence_score?: number;
        };
        ai_reasoning?: string;
    } | undefined>;
    register(params: paths['/register']['post']['requestBody']['content']['application/json']): Promise<{
        challenge_id?: string;
        dns_record?: string;
        verification_token?: string;
        instructions?: string;
        expires_at?: string;
    } | undefined>;
    verifyRegistration(challengeId: string): Promise<{
        verified?: boolean;
        server_record?: import("./client").components["schemas"]["MCPServerRecord"];
        transport_discovery?: {
            capabilities_discovered?: number;
            discovery_time_ms?: number;
            methods_tested?: string[];
        };
    } | undefined>;
    getRegistrationStatus(challengeId: string): Promise<{
        challenge_id?: string;
        status?: "pending" | "verified" | "expired" | "failed";
        created_at?: string;
        expires_at?: string;
        verified_at?: string;
        dns_record?: string;
    } | undefined>;
    startDomainVerification(domain: string): Promise<{
        success?: boolean;
        challenge?: {
            domain?: string;
            slug?: string;
            txtRecord?: string;
            instructions?: string;
        };
    } | undefined>;
    getDomainVerifications(): Promise<{
        success?: boolean;
        verifications?: {
            id?: string;
            domain?: string;
            status?: "pending" | "verified" | "expired" | "failed";
            created_at?: string;
            verified_at?: string;
            last_check_at?: string;
            expires_at?: string;
            failure_reason?: string;
        }[];
    } | undefined>;
    checkDomainOwnership(domain: string): Promise<{
        success?: boolean;
        domain?: string;
        user_id?: string;
        can_register?: boolean;
        verified?: boolean;
        message?: string;
        action_required?: string;
        verification_url?: string;
    } | undefined>;
    getServerHealth(domain: string, realtime?: boolean): Promise<{
        domain?: string;
        endpoint?: string;
        health?: import("./client").components["schemas"]["HealthMetrics"];
        capabilities_working?: boolean;
        ssl_valid?: boolean;
        trust_score?: number;
    } | undefined>;
    getOnboardingState(): Promise<{
        success?: boolean;
        onboarding?: {
            current_step?: "welcome" | "domain_verify" | "server_register" | "dashboard_tour" | "training_impact" | "completed";
            progress?: number;
            completed_steps?: string[];
            needs_onboarding?: boolean;
        };
    } | undefined>;
    updateOnboardingProgress(step: 'welcome' | 'domain_verify' | 'server_register' | 'dashboard_tour' | 'training_impact' | 'completed', completed?: boolean): Promise<{
        success?: boolean;
        message?: string;
    } | undefined>;
}
export declare const mcpLookupAPI: MCPLookupAPIClient;
export type { paths } from './client';
export type DiscoverRequest = paths['/discover']['post']['requestBody']['content']['application/json'];
export type DiscoverResponse = paths['/discover']['post']['responses']['200']['content']['application/json'];
export type SmartDiscoverRequest = paths['/discover/smart']['post']['requestBody']['content']['application/json'];
export type SmartDiscoverResponse = paths['/discover/smart']['post']['responses']['200']['content']['application/json'];
export type RegisterRequest = paths['/register']['post']['requestBody']['content']['application/json'];
export type RegisterResponse = paths['/register']['post']['responses']['200']['content']['application/json'];
export type HealthResponse = paths['/health/{domain}']['get']['responses']['200']['content']['application/json'];
export type OnboardingResponse = paths['/onboarding']['get']['responses']['200']['content']['application/json'];
//# sourceMappingURL=api-client.d.ts.map