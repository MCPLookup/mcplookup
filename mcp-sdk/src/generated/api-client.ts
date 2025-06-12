// Generated API client for MCPLookup.org
// DO NOT EDIT - This file is auto-generated

import createClient from 'openapi-fetch';
import type { paths } from './api-types.js';

export type { paths } from './api-types.js';

/**
 * MCPLookup.org API Client
 * 
 * Provides type-safe access to the MCPLookup.org discovery service API.
 */
export class MCPLookupAPIClient {
  private client: ReturnType<typeof createClient<paths>>;
  private baseUrl: string;

  constructor(baseUrl: string = 'https://mcplookup.org/api/v1', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.client = createClient<paths>({ 
      baseUrl,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
    });
  }

  /**
   * Search and discover MCP servers
   */
  async searchServers(params?: {
    q?: string;
    category?: 'development' | 'data' | 'communication' | 'api-integration' | 'utility' | 'other';
    quality?: 'high' | 'medium' | 'low';
    installation_method?: 'npm' | 'python' | 'docker' | 'git' | 'live_service';
    claude_ready?: boolean;
    limit?: number;
    offset?: number;
  }) {
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
  async getServer(serverId: string) {
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
  async getInstallInstructions(
    serverId: string, 
    params?: {
      method?: 'npm' | 'python' | 'docker' | 'git' | 'live_service';
      platform?: 'linux' | 'darwin' | 'win32';
    }
  ) {
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
  async smartDiscover(params: {
    query: string;
    context?: string;
    max_results?: number;
  }) {
    const { data, error } = await this.client.POST('/discover/smart', {
      body: params
    });
    
    if (error) {
      throw new Error(`Smart discovery failed: ${error}`);
    }
    
    return data;
  }

  /**
   * Generic discovery endpoint
   */
  async discover(params: Record<string, any>) {
    const { data, error } = await this.client.POST('/discover' as any, {
      body: params
    });

    if (error) {
      throw new Error(`Discovery failed: ${error}`);
    }

    return data;
  }

  /**
   * Register a new MCP server
   */
  async registerServer(details: {
    domain: string;
    endpoint: string;
    contact_email: string;
    description?: string;
  }) {
    const { data, error } = await this.client.POST('/register' as any, {
      body: details
    });

    if (error) {
      throw new Error(`Registration failed: ${error}`);
    }

    return data;
  }

  /**
   * Verify DNS challenge
   */
  async startDomainVerification(challengeId: string) {
    const { data, error } = await this.client.POST('/register/verify/{challengeId}' as any, {
      params: { path: { challengeId } }
    });

    if (error) {
      throw new Error(`Verification failed: ${error}`);
    }

    return data;
  }

  /**
   * Check domain ownership status
   */
  async checkDomainOwnership(challengeId: string) {
    const { data, error } = await this.client.GET('/register/status/{challengeId}' as any, {
      params: { path: { challengeId } }
    });

    if (error) {
      throw new Error(`Ownership check failed: ${error}`);
    }

    return data;
  }

  /**
   * Get server health information
   */
  async getServerHealth(domain: string, realtime = false) {
    const { data, error } = await this.client.GET('/health/{domain}' as any, {
      params: { path: { domain }, query: { realtime } }
    });

    if (error) {
      throw new Error(`Health check failed: ${error}`);
    }

    return data;
  }

  /**
   * Get onboarding progress for the authenticated user
   */
  async getOnboardingState() {
    const { data, error } = await this.client.GET('/onboarding' as any, {});

    if (error) {
      throw new Error(`Failed to get onboarding state: ${error}`);
    }

    return data;
  }

  /**
   * Update the base URL for the client
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
    this.client = createClient<paths>({
      baseUrl: url,
      headers: (this.client as any).defaults?.headers || {}
    });
  }

  /**
   * Set API key for authenticated requests
   */
  setApiKey(apiKey: string) {
    this.client = createClient<paths>({
      baseUrl: this.baseUrl,
      headers: { Authorization: `Bearer ${apiKey}` }
    });
  }
}