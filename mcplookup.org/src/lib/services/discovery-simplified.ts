// Discovery Service - Simplified version using SDK types only
// UPDATED: Removed all transformation logic, uses SDK directly

import {
  MCPServer,
  buildMCPServerFromGitHubRepo
} from '@mcplookup-org/mcp-sdk';

// Use SDK types everywhere
type MCPServerRecord = MCPServer;

// Simplified response interfaces
interface DiscoveryResponse {
  servers: MCPServer[];
  pagination?: {
    offset: number;
    limit: number;
    has_more: boolean;
  };
  query_metadata?: {
    query_time_ms: number;
    cache_hit: boolean;
    filters_applied: string[];
  };
}

interface DiscoveryRequest {
  query?: string;
  domain?: string;
  capability?: string;
  category?: string;
  keywords?: string[];
  limit?: number;
  offset?: number;
  intent?: string;
}

/**
 * Simplified Discovery Service
 * Focuses on using SDK types without complex transformations
 */
export class DiscoveryService {
  private registryService: any;

  constructor(registryService: any) {
    this.registryService = registryService;
  }

  /**
   * Main discovery method - simplified implementation
   */
  async discoverServers(request: DiscoveryRequest): Promise<DiscoveryResponse> {
    const startTime = Date.now();
    const limit = request.limit || 10;
    const offset = request.offset || 0;

    try {
      let servers: MCPServer[] = [];

      // Simple discovery logic
      if (request.domain) {
        servers = await this.registryService.getServersByDomain(request.domain);
      } else if (request.capability) {
        servers = await this.registryService.getServersByCapability(request.capability);
      } else if (request.category) {
        servers = await this.registryService.getServersByCategory(request.category);
      } else if (request.keywords) {
        servers = await this.registryService.searchServers(request.keywords);
      } else {
        servers = await this.registryService.getAllVerifiedServers();
      }

      // Apply pagination
      const paginatedServers = servers.slice(offset, offset + limit);
      
      return {
        servers: paginatedServers,
        pagination: {
          offset,
          limit,
          has_more: offset + limit < servers.length
        },
        query_metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          filters_applied: []
        }
      };
    } catch (error) {
      console.error('Discovery error:', error);
      return {
        servers: [],
        pagination: {
          offset: 0,
          limit: 0,
          has_more: false
        }
      };
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async searchServersByCapability(capability: string): Promise<MCPServer[]> {
    return this.registryService.getServersByCapability(capability);
  }

  /**
   * Legacy method for backward compatibility
   */
  async getServersByCategory(category: string): Promise<MCPServer[]> {
    return this.registryService.getServersByCategory(category);
  }

  /**
   * Legacy method for backward compatibility
   */
  async searchServers(keywords: string[]): Promise<MCPServer[]> {
    return this.registryService.searchServers(keywords);
  }
}

// Export interfaces for use elsewhere
export type { DiscoveryRequest, DiscoveryResponse, MCPServerRecord };

// Legacy interfaces for backward compatibility
export interface IDiscoveryService {
  discoverServers(request: DiscoveryRequest): Promise<DiscoveryResponse>;
  searchServersByCapability(capability: string): Promise<MCPServer[]>;
  getServersByCategory(category: string): Promise<MCPServer[]>;
  searchServers(keywords: string[]): Promise<MCPServer[]>;
}

export interface IRegistryService {
  getServersByDomain(domain: string): Promise<MCPServerRecord[]>;
  getServersByCapability(capability: string): Promise<MCPServerRecord[]>;
  getServersByCategory(category: string): Promise<MCPServerRecord[]>;
  searchServers(keywords: string[]): Promise<MCPServerRecord[]>;
  getAllVerifiedServers(): Promise<MCPServerRecord[]>;
  getRelatedCapabilities(capability: string): Promise<string[]>;
  addServer(server: MCPServerRecord): Promise<void>;
}

export interface IHealthService {
  checkServerHealth(endpoint: string): Promise<any>;
  batchHealthCheck(endpoints: string[]): Promise<Map<string, any>>;
}

export interface IIntentService {
  intentToCapabilities(intent: string): Promise<string[]>;
  getSimilarIntents(intent: string): Promise<string[]>;
}
