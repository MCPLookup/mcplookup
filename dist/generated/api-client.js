// Generated API Client for MCPLookup.org API
// This file provides a type-safe client for the MCPLookup.org API
import createClient from 'openapi-fetch';
// Create the API client with proper typing
export const apiClient = createClient({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mcplookup.org/api/v1',
});
// Type-safe API methods
export class MCPLookupAPIClient {
    client = apiClient;
    constructor(baseUrl, apiKey) {
        if (baseUrl) {
            this.client = createClient({ baseUrl });
        }
        if (apiKey) {
            this.client.use({
                onRequest({ request }) {
                    request.headers.set('Authorization', `Bearer ${apiKey}`);
                    return request;
                },
            });
        }
    }
    // Discovery endpoints
    async discover(params) {
        const { data, error } = await this.client.POST('/discover', {
            body: params,
        });
        if (error)
            throw new Error(`Discovery failed: ${error}`);
        return data;
    }
    async discoverSmart(params) {
        const { data, error } = await this.client.POST('/discover/smart', {
            body: params,
        });
        if (error)
            throw new Error(`Smart discovery failed: ${error}`);
        return data;
    }
    // Registration endpoints
    async register(params) {
        const { data, error } = await this.client.POST('/register', {
            body: params,
        });
        if (error)
            throw new Error(`Registration failed: ${error}`);
        return data;
    }
    async verifyRegistration(challengeId) {
        const { data, error } = await this.client.POST('/register/verify/{challengeId}', {
            params: { path: { challengeId } },
        });
        if (error)
            throw new Error(`Verification failed: ${error}`);
        return data;
    }
    async getRegistrationStatus(challengeId) {
        const { data, error } = await this.client.GET('/register/status/{challengeId}', {
            params: { path: { challengeId } },
        });
        if (error)
            throw new Error(`Status check failed: ${error}`);
        return data;
    }
    // Domain verification endpoints
    async startDomainVerification(domain) {
        const { data, error } = await this.client.POST('/verify', {
            body: { domain },
        });
        if (error)
            throw new Error(`Domain verification start failed: ${error}`);
        return data;
    }
    async getDomainVerifications() {
        const { data, error } = await this.client.GET('/verify');
        if (error)
            throw new Error(`Get verifications failed: ${error}`);
        return data;
    }
    async checkDomainOwnership(domain) {
        const { data, error } = await this.client.GET('/domain-check', {
            params: { query: { domain } },
        });
        if (error)
            throw new Error(`Domain check failed: ${error}`);
        return data;
    }
    // Health endpoints
    async getServerHealth(domain, realtime = false) {
        const { data, error } = await this.client.GET('/health/{domain}', {
            params: {
                path: { domain },
                query: { realtime },
            },
        });
        if (error)
            throw new Error(`Health check failed: ${error}`);
        return data;
    }
    // Onboarding endpoints
    async getOnboardingState() {
        const { data, error } = await this.client.GET('/onboarding');
        if (error)
            throw new Error(`Get onboarding state failed: ${error}`);
        return data;
    }
    async updateOnboardingProgress(step, completed = false) {
        const { data, error } = await this.client.POST('/onboarding', {
            body: { step, completed },
        });
        if (error)
            throw new Error(`Update onboarding failed: ${error}`);
        return data;
    }
}
// Export a default instance
export const mcpLookupAPI = new MCPLookupAPIClient();
//# sourceMappingURL=api-client.js.map