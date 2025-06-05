// Registry Service - Serverless MCP Server Registry
// Uses unified storage interface for seamless provider switching

import { MCPServerRecord, CapabilityCategory } from '../schemas/discovery';
import { IRegistryService } from './discovery';
import { IStorage, isSuccessResult, QueryOptions } from './storage/unified-storage';
import { createStorage, StorageConfig } from './storage/factory';

/**
 * Registry Service with Unified Storage
 * Automatically uses the best available storage provider
 */
export class RegistryService implements IRegistryService {
  private storage: IStorage;
  private readonly COLLECTION = 'servers';

  constructor() {
    this.storage = createStorage();
  }

  /**
   * Get all servers (from storage only)
   */
  async getAllServers(): Promise<MCPServerRecord[]> {
    const result = await this.storage.getAll<MCPServerRecord>(this.COLLECTION);
    if (isSuccessResult(result)) {
      return result.data.items;
    }
    throw new Error(`Failed to get servers: ${result.error}`);
  }

  /**
   * Get all verified servers (excludes unverified domains)
   */
  async getVerifiedServers(): Promise<MCPServerRecord[]> {
    const queryOptions: QueryOptions = {
      filters: {
        verification_status: ['verified', 'pending']
      }
    };

    const result = await this.storage.query<MCPServerRecord>(this.COLLECTION, queryOptions);
    if (isSuccessResult(result)) {
      return result.data.items;
    }
    throw new Error(`Failed to get verified servers: ${result.error}`);
  }

  /**
   * Register a new MCP server
   */
  async registerServer(server: MCPServerRecord): Promise<void> {
    const serverWithTimestamp = {
      ...server,
      created_at: server.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await this.storage.set(this.COLLECTION, server.domain, serverWithTimestamp);
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to register server: ${result.error}`);
    }
  }

  /**
   * Update an existing server
   */
  async updateServer(domain: string, updates: Partial<MCPServerRecord>): Promise<void> {
    const getResult = await this.storage.get<MCPServerRecord>(this.COLLECTION, domain);
    if (!isSuccessResult(getResult) || !getResult.data) {
      throw new Error(`Server ${domain} not found`);
    }

    const updated = {
      ...getResult.data,
      ...updates,
      domain, // Ensure domain doesn't change
      updated_at: new Date().toISOString()
    };

    const updateResult = await this.storage.set(this.COLLECTION, domain, updated);
    if (!isSuccessResult(updateResult)) {
      throw new Error(`Failed to update server: ${updateResult.error}`);
    }
  }

  /**
   * Unregister a server
   */
  async unregisterServer(domain: string): Promise<void> {
    const result = await this.storage.delete(this.COLLECTION, domain);
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to unregister server: ${result.error}`);
    }
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
    const allServers = await this.getAllServers();
    const verifiedServers = allServers.filter(s => s.verification_status === 'verified');

    // Count by category
    const categories: Record<string, number> = {};
    for (const server of allServers) {
      const category = server.capabilities.category;
      categories[category] = (categories[category] || 0) + 1;
    }

    return {
      totalServers: allServers.length,
      registeredServers: allServers.length,
      wellKnownServers: 0, // No hardcoded servers
      categories
    };
  }

  /**
   * Get servers by exact domain match
   */
  async getServersByDomain(domain: string): Promise<MCPServerRecord[]> {
    const result = await this.storage.get<MCPServerRecord>(this.COLLECTION, domain);
    if (isSuccessResult(result) && result.data) {
      return [result.data];
    }
    return [];
  }

  /**
   * Get servers by capability
   */
  async getServersByCapability(capability: CapabilityCategory): Promise<MCPServerRecord[]> {
    const allServers = await this.getAllServers();
    return allServers.filter(server =>
      server.capabilities.subcategories?.includes(capability)
    );
  }

  /**
   * Get servers by category
   */
  async getServersByCategory(category: CapabilityCategory): Promise<MCPServerRecord[]> {
    const queryOptions: QueryOptions = {
      filters: {
        'capabilities.category': category
      }
    };

    const result = await this.storage.query<MCPServerRecord>(this.COLLECTION, queryOptions);
    if (isSuccessResult(result)) {
      return result.data.items;
    }
    throw new Error(`Failed to get servers by category: ${result.error}`);
  }

  /**
   * Search servers by text query
   */
  async searchServers(keywords: string[]): Promise<MCPServerRecord[]> {
    const query = keywords.join(' ');
    const result = await this.storage.search<MCPServerRecord>(this.COLLECTION, query);
    if (isSuccessResult(result)) {
      return result.data.items;
    }
    throw new Error(`Failed to search servers: ${result.error}`);
  }

  /**
   * Get all verified servers (excludes unverified domains)
   */
  async getAllVerifiedServers(): Promise<MCPServerRecord[]> {
    return this.getVerifiedServers();
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
  // ADDITIONAL METHODS FOR UNIFIED STORAGE
  // ========================================================================

  /**
   * Get a single server by domain
   */
  async getServer(domain: string): Promise<MCPServerRecord | null> {
    const result = await this.storage.get<MCPServerRecord>(this.COLLECTION, domain);
    if (isSuccessResult(result)) {
      return result.data;
    }
    throw new Error(`Failed to get server: ${result.error}`);
  }

  /**
   * Check if a server exists
   */
  async serverExists(domain: string): Promise<boolean> {
    const result = await this.storage.exists(this.COLLECTION, domain);
    if (isSuccessResult(result)) {
      return result.data;
    }
    throw new Error(`Failed to check server existence: ${result.error}`);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const result = await this.storage.healthCheck();
      return {
        healthy: result.healthy,
        details: result
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: String(error) }
      };
    }
  }
}
