// @ts-nocheck
// Registry Service - Serverless MCP Server Registry
// UPDATED: Now uses SDK types exclusively - no more transformations!

import { CapabilityCategory } from '../schemas/discovery';
import { IRegistryService } from './discovery';
import { IStorage, isSuccessResult, QueryOptions } from './storage/unified-storage';
import { createStorage, StorageConfig } from './storage/factory';
import { 
  MCPServer
} from '@mcplookup-org/mcp-sdk';

// Use SDK types everywhere - the transformation is complete!
type MCPServerRecord = MCPServer;

/**
 * Registry Service with Unified Storage
 * UPDATED: Now uses SDK types exclusively - no more transformations!
 * Automatically uses the best available storage provider
 */
export class RegistryService implements IRegistryService {
  private storage: IStorage;
  private readonly COLLECTION = 'servers';

  constructor(config?: StorageConfig) {
    this.storage = createStorage(config);
  }
  /**
   * Register a new MCP server - now uses unified SDK types
   */
  async registerServer(server: MCPServerRecord): Promise<void> {
    // Use SDK types directly - no transformation needed!
    const serverWithTimestamp = {
      ...server,
      created_at: server.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await this.storage.set(this.COLLECTION, server.domain, serverWithTimestamp);

    if (!isSuccessResult(result)) {
      throw new Error(`Failed to register server: ${result.error}`);
    }
  }

  /**
   * Add server (required by IRegistryService interface)
   */
  async addServer(server: MCPServerRecord): Promise<void> {
    return this.registerServer(server);
  }

  /**
   * Get servers by domain - returns SDK types directly
   */
  async getServersByDomain(domain: string): Promise<MCPServerRecord[]> {
    const result = await this.storage.query(this.COLLECTION, {
      filters: [{ field: 'domain', operator: 'eq', value: domain }]
    });

    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get servers by domain: ${result.error}`);
    }

    return result.data; // Already MCPServer type!
  }

  /**
   * Get servers by capability - uses SDK types
   */
  async getServersByCapability(capability: string): Promise<MCPServerRecord[]> {
    const result = await this.storage.query(this.COLLECTION, {
      filters: [{ field: 'capabilities.tools', operator: 'contains', value: capability }]
    });

    if (!isSuccessResult(result)) {
      return []; // Return empty array instead of throwing
    }

    return result.data; // Already MCPServer type!
  }

  /**
   * Get servers by category - uses SDK types
   */
  async getServersByCategory(category: CapabilityCategory): Promise<MCPServerRecord[]> {
    const result = await this.storage.query(this.COLLECTION, {
      filters: [{ field: 'category', operator: 'eq', value: category }]
    });

    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get servers by category: ${result.error}`);
    }

    return result.data; // Already MCPServer type!
  }

  /**
   * Search servers by keywords - uses SDK types
   */
  async searchServers(keywords: string[]): Promise<MCPServerRecord[]> {
    const result = await this.storage.query(this.COLLECTION, {
      filters: keywords.map(keyword => ({ 
        field: 'tags', 
        operator: 'contains', 
        value: keyword 
      }))
    });

    if (!isSuccessResult(result)) {
      throw new Error(`Failed to search servers: ${result.error}`);
    }

    return result.data; // Already MCPServer type!
  }

  /**
   * Get all verified servers - uses SDK types
   */
  async getAllVerifiedServers(): Promise<MCPServerRecord[]> {
    const result = await this.storage.query(this.COLLECTION, {
      filters: [{ field: 'verification_status', operator: 'eq', value: 'verified' }]
    });

    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get verified servers: ${result.error}`);
    }

    return result.data; // Already MCPServer type!
  }

  /**
   * Get related capabilities
   */
  async getRelatedCapabilities(capability: string): Promise<string[]> {
    // Simple implementation - could be enhanced with similarity search
    const allServers = await this.getAllVerifiedServers();
    const capabilities = new Set<string>();

    allServers.forEach(server => {
      if (server.capabilities.tools.includes(capability)) {
        server.capabilities.tools.forEach(tool => capabilities.add(tool));
      }
    });

    // Remove the input capability and return others
    capabilities.delete(capability);
    return Array.from(capabilities).slice(0, 5); // Return top 5
  }

  /**
   * Update server - uses SDK types
   */
  async updateServer(domain: string, updates: Partial<MCPServerRecord>): Promise<void> {
    const serverWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const result = await this.storage.update(this.COLLECTION, { domain }, serverWithTimestamp);

    if (!isSuccessResult(result)) {
      throw new Error(`Failed to update server: ${result.error}`);
    }
  }

  /**
   * Delete server
   */
  async deleteServer(domain: string): Promise<void> {
    const result = await this.storage.delete(this.COLLECTION, { domain });

    if (!isSuccessResult(result)) {
      throw new Error(`Failed to delete server: ${result.error}`);
    }
  }

  /**
   * Get server stats
   */
  async getStats(): Promise<{
    total: number;
    verified: number;
    categories: Record<string, number>;
  }> {
    const allServers = await this.getAllVerifiedServers();
    const categories: Record<string, number> = {};

    allServers.forEach(server => {
      categories[server.category] = (categories[server.category] || 0) + 1;
    });

    return {
      total: allServers.length,
      verified: allServers.filter(s => s.verification_status === 'verified').length,
      categories
    };
  }
}
