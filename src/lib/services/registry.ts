// Registry Service - Serverless MCP Server Registry
// Uses storage abstraction layer for seamless provider switching

import { MCPServerRecord, CapabilityCategory } from '../schemas/discovery';
import { IRegistryService } from './discovery';
import { IRegistryStorage, isSuccessResult } from './storage/interfaces';
import { getRegistryStorage, StorageConfig } from './storage/storage';

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
    const result = await this.storage.getAllServers();
    if (isSuccessResult(result)) {
      return result.data.items;
    }
    throw new Error(`Failed to get servers: ${result.error}`);
  }

  /**
   * Get all verified servers (excludes unverified domains)
   */
  async getVerifiedServers(): Promise<MCPServerRecord[]> {
    const allServers = await this.getAllServers();
    return allServers.filter(server =>
      server.verification_status !== 'unverified'
    );
  }

  /**
   * Register a new MCP server
   */
  async registerServer(server: MCPServerRecord): Promise<void> {
    const result = await this.storage.storeServer(server.domain, server);
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to register server: ${result.error}`);
    }
  }

  /**
   * Update an existing server
   */
  async updateServer(domain: string, updates: Partial<MCPServerRecord>): Promise<void> {
    const getResult = await this.storage.getServer(domain);
    if (!isSuccessResult(getResult) || !getResult.data) {
      throw new Error(`Server ${domain} not found`);
    }

    const updated = { ...getResult.data, ...updates, updated_at: new Date().toISOString() };
    const updateResult = await this.storage.storeServer(domain, updated);
    if (!isSuccessResult(updateResult)) {
      throw new Error(`Failed to update server: ${updateResult.error}`);
    }
  }

  /**
   * Unregister a server
   */
  async unregisterServer(domain: string): Promise<void> {
    const result = await this.storage.deleteServer(domain);
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
    const statsResult = await this.storage.getStats();
    if (isSuccessResult(statsResult)) {
      const stats = statsResult.data;
      return {
        totalServers: stats.totalServers,
        registeredServers: stats.totalServers,
        wellKnownServers: 0, // No hardcoded servers
        categories: stats.categories as Record<string, number>
      };
    }
    throw new Error(`Failed to get stats: ${statsResult.error}`);
  }

  /**
   * Get servers by exact domain match
   */
  async getServersByDomain(domain: string): Promise<MCPServerRecord[]> {
    const result = await this.storage.getServer(domain);
    if (isSuccessResult(result) && result.data) {
      return [result.data];
    }
    return [];
  }

  /**
   * Get servers by capability
   */
  async getServersByCapability(capability: CapabilityCategory): Promise<MCPServerRecord[]> {
    const result = await this.storage.getServersByCapability(capability);
    if (isSuccessResult(result)) {
      return result.data.items;
    }
    throw new Error(`Failed to get servers by capability: ${result.error}`);
  }

  /**
   * Get servers by category
   */
  async getServersByCategory(category: CapabilityCategory): Promise<MCPServerRecord[]> {
    const result = await this.storage.getServersByCategory(category);
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
    const result = await this.storage.searchServers(query);
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
  // PRIVATE METHODS
  // ========================================================================
}
