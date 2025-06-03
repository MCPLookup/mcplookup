// Registry Service - Serverless MCP Server Registry
// Uses storage abstraction layer for seamless provider switching

import { MCPServerRecord, CapabilityCategory } from '../schemas/discovery.js';
import { IRegistryService } from './discovery.js';
import { IRegistryStorage } from './storage/interfaces.js';
import { getRegistryStorage, StorageConfig } from './storage/storage.js';

/**
 * Registry Service with Storage Abstraction
 * Automatically uses the best available storage provider
 */
export class RegistryService implements IRegistryService {
  private storage: IRegistryStorage;

  constructor(storageConfig?: StorageConfig) {
    this.storage = getRegistryStorage(storageConfig);
  }

  /**
   * Get all servers (from storage only)
   */
  async getAllServers(): Promise<MCPServerRecord[]> {
    return this.storage.getAllServers();
  }

  /**
   * Register a new MCP server
   */
  async registerServer(server: MCPServerRecord): Promise<void> {
    await this.storage.storeServer(server.domain, server);
  }

  /**
   * Update an existing server
   */
  async updateServer(domain: string, updates: Partial<MCPServerRecord>): Promise<void> {
    const existing = await this.storage.getServer(domain);
    if (!existing) {
      throw new Error(`Server ${domain} not found`);
    }

    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    await this.storage.storeServer(domain, updated);
  }

  /**
   * Unregister a server
   */
  async unregisterServer(domain: string): Promise<void> {
    await this.storage.deleteServer(domain);
  }

  /**
   * Get registry statistics
   */
  async getRegistryStats(): Promise<{ 
    totalServers: number; 
    registeredServers: number;
    wellKnownServers: number;
    categories: Record<string, number> 
  }> {
    const storageStats = await this.storage.getStats();
    return {
      totalServers: storageStats.totalServers,
      registeredServers: storageStats.totalServers,
      wellKnownServers: 0, // No hardcoded servers
      categories: storageStats.categories
    };
  }

  /**
   * Get servers by exact domain match
   */
  async getServersByDomain(domain: string): Promise<MCPServerRecord[]> {
    // First check if it's stored
    const stored = await this.storage.getServer(domain);
    if (stored) {
      return [stored];
    }

    // Try real-time discovery
    return this.discoverWellKnownEndpoint(domain);
  }

  /**
   * Get servers by capability
   */
  async getServersByCapability(capability: string): Promise<MCPServerRecord[]> {
    return this.storage.getServersByCapability(capability);
  }

  /**
   * Get servers by category
   */
  async getServersByCategory(category: CapabilityCategory): Promise<MCPServerRecord[]> {
    return this.storage.getServersByCategory(category);
  }

  /**
   * Search servers by text query
   */
  async searchServers(keywords: string[]): Promise<MCPServerRecord[]> {
    const query = keywords.join(' ');
    return this.storage.searchServers(query);
  }

  /**
   * Get all verified servers (alias for getAllServers)
   */
  async getAllVerifiedServers(): Promise<MCPServerRecord[]> {
    return this.getAllServers();
  }

  /**
   * Get related capabilities for a given capability
   */
  async getRelatedCapabilities(capability: string): Promise<string[]> {
    // Simple semantic matching for now
    const capabilityMap: Record<string, string[]> = {
      'email': ['email_send', 'email_read', 'email_compose', 'gmail', 'outlook'],
      'calendar': ['calendar_create', 'calendar_read', 'calendar_update', 'scheduling'],
      'file': ['file_read', 'file_write', 'file_upload', 'storage', 'drive'],
      'database': ['db_query', 'db_write', 'sql', 'nosql', 'postgres'],
      'api': ['rest_api', 'graphql', 'webhook', 'http_request'],
      'ai': ['llm', 'embedding', 'completion', 'chat', 'openai'],
      'social': ['twitter', 'linkedin', 'facebook', 'social_media'],
      'payment': ['stripe', 'paypal', 'payment_processing', 'billing'],
      'analytics': ['google_analytics', 'tracking', 'metrics', 'reporting']
    };

    const lowerCapability = capability.toLowerCase();
    for (const [key, related] of Object.entries(capabilityMap)) {
      if (lowerCapability.includes(key) || related.some(r => lowerCapability.includes(r))) {
        return related;
      }
    }

    return [];
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  /**
   * Try to discover MCP server at well-known endpoint
   */
  private async discoverWellKnownEndpoint(domain: string): Promise<MCPServerRecord[]> {
    const wellKnownUrls = [
      `https://${domain}/.well-known/mcp-server`,
      `https://${domain}/api/mcp`,
      `https://${domain}/mcp`,
      `https://api.${domain}/mcp`
    ];

    for (const url of wellKnownUrls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
              protocolVersion: '2024-11-05',
              capabilities: {},
              clientInfo: { name: 'mcplookup-discovery', version: '1.0.0' }
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.result && data.result.serverInfo) {
            return [this.createServerRecordFromEndpoint(domain, url, data.result)];
          }
        }
      } catch {
        // Continue to next URL
      }
    }

    return [];
  }

  private createServerRecordFromEndpoint(domain: string, endpoint: string, serverInfo: any): MCPServerRecord {
    return {
      domain,
      endpoint,
      name: serverInfo.serverInfo?.name || `${domain} MCP Server`,
      description: `MCP server for ${domain}`,
      server_info: {
        name: serverInfo.serverInfo?.name || 'unknown',
        version: serverInfo.serverInfo?.version || '1.0.0',
        protocolVersion: serverInfo.protocolVersion || '2024-11-05',
        capabilities: serverInfo.capabilities || { tools: true, resources: false }
      },
      tools: [],
      resources: [],
      transport: 'streamable_http' as const,
      capabilities: {
        category: 'other' as CapabilityCategory,
        subcategories: ['general'],
        intent_keywords: ['general', 'api'],
        use_cases: ['General purpose MCP server']
      },
      auth: {
        type: 'none' as const
      },
      cors_enabled: true,
      health: {
        status: 'healthy' as const,
        uptime_percentage: 99.0,
        avg_response_time_ms: 100,
        error_rate: 0.01,
        last_check: new Date().toISOString(),
        consecutive_failures: 0
      },
      verification: {
        dns_verified: false,
        endpoint_verified: true,
        ssl_verified: true,
        last_verification: new Date().toISOString(),
        verification_method: 'endpoint-check'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      maintainer: {
        name: domain,
        url: `https://${domain}`
      }
    };
  }

  private getWellKnownServers(): MCPServerRecord[] {
    // No hardcoded servers - rely on real-time discovery and user registration
    return [];
  }
}
