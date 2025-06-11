// Registry Service - Serverless MCP Server Registry
// UPDATED: Now uses SDK types exclusively - no more transformations!

import { CapabilityCategory } from '../schemas/discovery';
import { IRegistryService } from './discovery';
import { IStorage, isSuccessResult } from './storage/unified-storage';
import { createStorage, StorageConfig } from './storage/factory';
import { 
  MCPServer
} from '@mcplookup-org/mcp-sdk';

// Use SDK types everywhere - the transformation is complete!
type MCPServerRecord = MCPServer;

/**
 * Registry Service with Unified Storage - Simplified
 * UPDATED: Now uses SDK types exclusively - no more transformations!
 * Uses basic storage operations only
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
    const result = await this.storage.get(this.COLLECTION, domain);

    if (!isSuccessResult(result) || !result.data) {
      return [];
    }

    return [result.data]; // Single server wrapped in array
  }

  /**
   * Get servers by capability - simplified implementation
   */
  async getServersByCapability(capability: string): Promise<MCPServerRecord[]> {
    // For now, return empty array - could be enhanced with actual search
    console.log(`Searching for capability: ${capability}`);
    return [];
  }

  /**
   * Get servers by category - simplified implementation  
   */
  async getServersByCategory(category: CapabilityCategory): Promise<MCPServerRecord[]> {
    // For now, return empty array - could be enhanced with actual search
    console.log(`Searching for category: ${category}`);
    return [];
  }

  /**
   * Search servers by keywords - simplified implementation
   */
  async searchServers(keywords: string[]): Promise<MCPServerRecord[]> {
    // For now, return empty array - could be enhanced with actual search
    console.log(`Searching for keywords: ${keywords.join(', ')}`);
    return [];
  }

  /**
   * Get all verified servers - simplified implementation
   */
  async getAllVerifiedServers(): Promise<MCPServerRecord[]> {
    // For now, return empty array - could be enhanced with actual storage scan
    console.log('Getting all verified servers');
    return [];
  }

  /**
   * Get related capabilities
   */
  async getRelatedCapabilities(capability: string): Promise<string[]> {
    // Simple implementation
    console.log(`Getting related capabilities for: ${capability}`);
    return [];
  }

  /**
   * Update server - uses SDK types
   */
  async updateServer(domain: string, updates: Partial<MCPServerRecord>): Promise<void> {
    // Get existing server first
    const existingResult = await this.storage.get(this.COLLECTION, domain);
    
    if (!isSuccessResult(existingResult) || !existingResult.data) {
      throw new Error(`Server ${domain} not found`);
    }

    const serverWithTimestamp = {
      ...existingResult.data,
      ...updates,
      updated_at: new Date().toISOString()
    };

    const result = await this.storage.set(this.COLLECTION, domain, serverWithTimestamp);

    if (!isSuccessResult(result)) {
      throw new Error(`Failed to update server: ${result.error}`);
    }
  }

  /**
   * Delete server
   */
  async deleteServer(domain: string): Promise<void> {
    const result = await this.storage.delete(this.COLLECTION, domain);

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
    // Simplified implementation
    return {
      total: 0,
      verified: 0,
      categories: {}
    };
  }
}
