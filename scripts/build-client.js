import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate the API client
const clientContent = `// Generated API client for MCPLookup.org
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
      headers: apiKey ? { Authorization: \`Bearer \${apiKey}\` } : {}
    });
  }

  /**
   * Discover MCP servers using various search criteria
   */
  async discover(params: {
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
  } = {}) {
    const { data, error } = await this.client.GET('/discover', {
      params: { query: params }
    });
    
    if (error) {
      throw new Error(\`Discovery failed: \${JSON.stringify(error)}\`);
    }
    
    return data;
  }

  /**
   * Smart AI-powered discovery using natural language
   */
  async discoverSmart(params: {
    query: string;
    max_results?: number;
    include_reasoning?: boolean;
  }) {
    const { data, error } = await this.client.POST('/discover/smart', {
      body: params
    });
    
    if (error) {
      throw new Error(\`Smart discovery failed: \${JSON.stringify(error)}\`);
    }
    
    return data;
  }

  /**
   * Register a new MCP server
   */
  async register(params: {
    domain: string;
    endpoint: string;
    contact_email: string;
    description?: string;
  }) {
    const { data, error } = await this.client.POST('/register', {
      body: params
    });
    
    if (error) {
      throw new Error(\`Registration failed: \${JSON.stringify(error)}\`);
    }
    
    return data;
  }

  /**
   * Get server health metrics
   */
  async getServerHealth(domain: string, realtime: boolean = false) {
    const { data, error } = await this.client.GET('/health/{domain}', {
      params: { 
        path: { domain },
        query: { realtime }
      }
    });
    
    if (error) {
      throw new Error(\`Health check failed: \${JSON.stringify(error)}\`);
    }
    
    return data;
  }

  /**
   * Set API key for authenticated requests
   */
  setApiKey(apiKey: string) {
    this.client = createClient<paths>({ 
      baseUrl: this.baseUrl,
      headers: { Authorization: \`Bearer \${apiKey}\` }
    });
  }
}

// Export default instance for convenience
export const mcpLookupClient = new MCPLookupAPIClient();
`;

// Write the client file
const clientPath = join(__dirname, '../src/generated/api-client.ts');
writeFileSync(clientPath, clientContent);

console.log('✅ API client generated successfully\!');
console.log('📁 Generated files:');
console.log('  - src/generated/api-types.ts (OpenAPI types)');
console.log('  - src/generated/api-client.ts (API client)');
