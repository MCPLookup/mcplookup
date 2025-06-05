// Registry Service - Handles MCP server registration and discovery
// Uses the generic storage layer and knows about domain types

import { IUnifiedStorage, StorageResult, PaginatedResult, SearchOptions } from './storage/unified-storage';
import { MCPServerRecord, CapabilityCategory } from '../schemas/discovery';

export class RegistryService {
  constructor(private storage: IUnifiedStorage) {}

  /**
   * Store or update a server record
   */
  async storeServer(domain: string, server: MCPServerRecord): Promise<StorageResult<void>> {
    const key = `server:${domain}`;
    return this.storage.set(key, server, {
      tags: ['server', 'registry'],
      metadata: {
        domain,
        category: server.capabilities.category,
        updated_at: server.updated_at
      }
    });
  }

  /**
   * Retrieve a server by domain
   */
  async getServer(domain: string): Promise<StorageResult<MCPServerRecord | null>> {
    const key = `server:${domain}`;
    return this.storage.get<MCPServerRecord>(key);
  }

  /**
   * Delete a server and all associated data
   */
  async deleteServer(domain: string): Promise<StorageResult<void>> {
    const key = `server:${domain}`;
    return this.storage.delete(key);
  }

  /**
   * Get all servers with pagination support
   */
  async getAllServers(options?: SearchOptions): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    const pattern = 'server:*';
    const result = await this.storage.scan(pattern, options);
    
    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: {
        items: result.data.items.map(item => item.value as MCPServerRecord),
        total: result.data.total,
        hasMore: result.data.hasMore,
        nextCursor: result.data.nextCursor
      }
    };
  }

  /**
   * Get servers by category with pagination
   */
  async getServersByCategory(
    category: CapabilityCategory,
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    const criteria = { 'capabilities.category': category };
    const result = await this.storage.filter(criteria, options);
    
    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: {
        items: result.data.items.map(item => item.value as MCPServerRecord),
        total: result.data.total,
        hasMore: result.data.hasMore,
        nextCursor: result.data.nextCursor
      }
    };
  }

  /**
   * Get servers by specific capability
   */
  async getServersByCapability(
    capability: string,
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    const criteria = { 'capabilities.subcategories': capability };
    const result = await this.storage.filter(criteria, options);
    
    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: {
        items: result.data.items.map(item => item.value as MCPServerRecord),
        total: result.data.total,
        hasMore: result.data.hasMore,
        nextCursor: result.data.nextCursor
      }
    };
  }

  /**
   * Full-text search across server records
   */
  async searchServers(
    query: string,
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    const result = await this.storage.search(query, options);
    
    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: {
        items: result.data.items.map(item => item.value as MCPServerRecord),
        total: result.data.total,
        hasMore: result.data.hasMore,
        nextCursor: result.data.nextCursor
      }
    };
  }

  /**
   * Update server health metrics
   */
  async updateServerHealth(domain: string, healthData: Partial<MCPServerRecord['health']>): Promise<StorageResult<void>> {
    const serverResult = await this.getServer(domain);
    
    if (!serverResult.success || !serverResult.data) {
      return { success: false, error: 'Server not found' };
    }

    const updatedServer = {
      ...serverResult.data,
      health: { ...serverResult.data.health, ...healthData },
      updated_at: new Date().toISOString()
    };

    return this.storeServer(domain, updatedServer);
  }

  /**
   * Get server statistics
   */
  async getServerStats(): Promise<StorageResult<{
    total: number;
    active: number;
    byCategory: Record<CapabilityCategory, number>;
  }>> {
    const allServersResult = await this.getAllServers();
    
    if (!allServersResult.success) {
      return allServersResult;
    }

    const servers = allServersResult.data.items;
    const active = servers.filter(s => s.health.status === 'healthy').length;
    
    const byCategory = servers.reduce((acc, server) => {
      const category = server.capabilities.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<CapabilityCategory, number>);

    return {
      success: true,
      data: {
        total: servers.length,
        active,
        byCategory
      }
    };
  }
}
