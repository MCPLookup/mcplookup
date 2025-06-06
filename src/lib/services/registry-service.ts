// Registry Service - Handles MCP server registration and discovery
// Uses the generic storage layer and knows about domain types

import { IStorage, StorageResult, PaginatedResult, QueryOptions } from './storage/unified-storage';
import { MCPServerRecord, CapabilityCategory } from '../schemas/discovery';

export class RegistryService {
  constructor(private storage: IStorage) {}

  /**
   * Store or update a server record
   */
  async storeServer(domain: string, server: MCPServerRecord): Promise<StorageResult<void>> {
    const key = `server:${domain}`;
    return this.storage.set('servers', key, server);
  }

  /**
   * Retrieve a server by domain
   */
  async getServer(domain: string): Promise<StorageResult<MCPServerRecord | null>> {
    const key = `server:${domain}`;
    return this.storage.get<MCPServerRecord>('servers', key);
  }

  /**
   * Delete a server and all associated data
   */
  async deleteServer(domain: string): Promise<StorageResult<void>> {
    const key = `server:${domain}`;
    return this.storage.delete('servers', key);
  }

  /**
   * Get all servers with pagination support
   */
  async getAllServers(options?: QueryOptions): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    return this.storage.getAll<MCPServerRecord>('servers', options);
  }

  /**
   * Get servers by category with pagination
   */
  async getServersByCategory(
    category: CapabilityCategory,
    options?: QueryOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    const queryOptions = {
      ...options,
      filters: { 'capabilities.category': category }
    };
    return this.storage.query<MCPServerRecord>('servers', queryOptions);
  }

  /**
   * Get servers by specific capability
   */
  async getServersByCapability(
    capability: string,
    options?: QueryOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    const queryOptions = {
      ...options,
      filters: { 'capabilities.subcategories': capability }
    };
    return this.storage.query<MCPServerRecord>('servers', queryOptions);
  }

  /**
   * Full-text search across server records
   */
  async searchServers(
    query: string,
    options?: QueryOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    return this.storage.search<MCPServerRecord>('servers', query, options);
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
      health: {
        status: 'unknown' as const,
        avg_response_time_ms: 0,
        uptime_percentage: 0,
        error_rate: 0,
        last_check: new Date().toISOString(),
        consecutive_failures: 0,
        ...serverResult.data.health,
        ...healthData
      },
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
    const active = servers.filter(s => s.health?.status === 'healthy').length;
    
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
