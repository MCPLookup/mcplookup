// User Server Management Service
// Links MCP server registrations to user profiles

import { createStorage } from './storage/factory';
import { IStorage, StorageResult, createSuccessResult, createErrorResult } from './storage/unified-storage';

export interface UserServer {
  id: string;
  domain: string;
  name: string;
  description: string;
  
  // Registration details
  registered_by_user_id: string;
  registered_at: string;
  registration_type: 'github_auto' | 'manual' | 'api';
  
  // Ownership details
  owner_user_id?: string;
  ownership_status: 'unowned' | 'owned';
  ownership_verified_at?: string;
  
  // Server metadata
  type: 'github' | 'official';
  github_repo?: string;
  github_stars?: number;
  capabilities?: string[];
  trust_score?: number;
  
  // Status
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  verification_status: 'pending' | 'verified' | 'failed';
  last_seen?: string;
  
  // Additional metadata
  tags?: string[];
  category?: string;
  language?: string;
  license?: string;
  
  updated_at: string;
}

export interface UserServerStats {
  total_servers: number;
  owned_servers: number;
  active_servers: number;
  pending_servers: number;
  github_servers: number;
  total_stars: number;
  avg_trust_score: number;
}

/**
 * User Server Management Service
 * Handles linking MCP servers to user profiles
 */
export class UserServerService {
  private storage: IStorage;

  constructor(storage?: IStorage) {
    this.storage = storage || createStorage();
  }
  /**
   * Get all servers registered or owned by a user
   */
  async getUserServers(userId: string): Promise<StorageResult<UserServer[]>> {
    try {
      // Get all MCP servers
      const serversResult = await this.storage.getAll('mcp_servers');
      
      if (!serversResult.success) {
        return createErrorResult('Failed to get servers', 'GET_SERVERS_FAILED');
      }

      // Filter servers for this user
      const userServers = serversResult.data.items
        .filter((server: any) => 
          server.registered_by_user_id === userId || 
          server.owner_user_id === userId
        )
        .map((server: any) => this.transformServerToUserServer(server));

      return createSuccessResult(userServers);
    } catch (error) {
      return createErrorResult(`Failed to get user servers: ${error}`, 'GET_USER_SERVERS_ERROR');
    }
  }

  /**
   * Get all servers registered or owned by a user with privacy awareness
   */
  async getUserServersWithPrivacy(
    userId: string,
    userPreferences?: { show_registered_servers?: boolean; profile_visibility?: string }
  ): Promise<StorageResult<UserServer[] | 'Private'>> {
    try {
      // Check privacy settings
      if (userPreferences?.profile_visibility === 'private' || userPreferences?.show_registered_servers === false) {
        return createSuccessResult('Private' as const);
      }

      // Return actual servers for public profiles
      return await this.getUserServers(userId);
    } catch (error) {
      return createErrorResult(`Failed to get user servers: ${error}`, 'GET_USER_SERVERS_ERROR');
    }
  }
  /**
   * Get user's server statistics
   */
  async getUserServerStats(userId: string): Promise<StorageResult<UserServerStats>> {
    try {
      const serversResult = await this.getUserServers(userId);
      
      if (!serversResult.success) {
        return createErrorResult('Failed to get servers for stats', 'GET_STATS_FAILED');
      }

      const servers = serversResult.data;
      
      const stats: UserServerStats = {
        total_servers: servers.length,
        owned_servers: servers.filter(s => s.ownership_status === 'owned').length,
        active_servers: servers.filter(s => s.status === 'active').length,
        pending_servers: servers.filter(s => s.status === 'pending').length,
        github_servers: servers.filter(s => s.type === 'github').length,
        total_stars: servers.reduce((sum, s) => sum + (s.github_stars || 0), 0),
        avg_trust_score: servers.length > 0 
          ? servers.reduce((sum, s) => sum + (s.trust_score || 0), 0) / servers.length 
          : 0
      };

      return createSuccessResult(stats);
    } catch (error) {
      return createErrorResult(`Failed to get user server stats: ${error}`, 'GET_STATS_ERROR');
    }
  }

  /**
   * Get user's server statistics with privacy awareness
   */
  async getUserServerStatsWithPrivacy(
    userId: string,
    userPreferences?: { 
      show_registered_servers?: boolean; 
      profile_visibility?: string; 
      show_activity_stats?: boolean 
    }
  ): Promise<StorageResult<UserServerStats | 'Private'>> {
    try {
      // Check privacy settings
      const isPrivate = userPreferences?.profile_visibility === 'private' || 
                       userPreferences?.show_registered_servers === false ||
                       userPreferences?.show_activity_stats === false;

      if (isPrivate) {
        return createSuccessResult('Private' as const);
      }

      // Return actual stats for public profiles
      return await this.getUserServerStats(userId);
    } catch (error) {
      return createErrorResult(`Failed to get user server stats: ${error}`, 'GET_STATS_ERROR');
    }
  }

  /**
   * Register a new server for a user
   */
  async registerServerForUser(
    userId: string,
    serverData: {
      domain: string;
      name: string;
      description: string;
      type: 'github' | 'official';
      github_repo?: string;
      capabilities?: string[];
      category?: string;
      language?: string;
      registration_type: 'github_auto' | 'manual' | 'api';
    }
  ): Promise<StorageResult<UserServer>> {
    try {
      // Check if server already exists
      const existingResult = await this.storage.get('mcp_servers', serverData.domain);
      
      if (existingResult.success && existingResult.data) {
        return createErrorResult('Server already registered', 'SERVER_EXISTS');
      }

      // Create server record
      const serverRecord = {
        domain: serverData.domain,
        name: serverData.name,
        description: serverData.description,
        
        // Registration details
        registered_by_user_id: userId,
        registered_at: new Date().toISOString(),
        registration_type: serverData.registration_type,
        
        // Default ownership (unowned until verified)
        ownership_status: 'unowned',
        
        // Server metadata
        type: serverData.type,
        github_repo: serverData.github_repo,
        capabilities: serverData.capabilities || [],
        
        // Status
        status: 'pending',
        verification_status: 'pending',
        
        // Additional metadata
        category: serverData.category,
        language: serverData.language,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const storeResult = await this.storage.set('mcp_servers', serverData.domain, serverRecord);
      
      if (!storeResult.success) {
        return createErrorResult('Failed to register server', 'REGISTER_SERVER_FAILED');
      }

      const userServer = this.transformServerToUserServer(serverRecord);
      return createSuccessResult(userServer);
    } catch (error) {
      return createErrorResult(`Failed to register server: ${error}`, 'REGISTER_SERVER_ERROR');
    }
  }

  /**
   * Update server ownership when GitHub ownership is verified
   */
  async updateServerOwnership(
    serverDomain: string,
    userId: string,
    ownershipData: {
      ownership_status: 'owned';
      ownership_verified_at: string;
      verification_method: string;
    }
  ): Promise<StorageResult<UserServer>> {
    try {
      // Get existing server
      const serverResult = await this.storage.get('mcp_servers', serverDomain);
      
      if (!serverResult.success || !serverResult.data) {
        return createErrorResult('Server not found', 'SERVER_NOT_FOUND');
      }

      // Update server with ownership info
      const updatedServer = {
        ...serverResult.data,
        owner_user_id: userId,
        ownership_status: ownershipData.ownership_status,
        ownership_verified_at: ownershipData.ownership_verified_at,
        status: 'active', // Activate server when ownership is verified
        verification_status: 'verified',
        updated_at: new Date().toISOString()
      };

      const updateResult = await this.storage.set('mcp_servers', serverDomain, updatedServer);
      
      if (!updateResult.success) {
        return createErrorResult('Failed to update server ownership', 'UPDATE_OWNERSHIP_FAILED');
      }

      const userServer = this.transformServerToUserServer(updatedServer);
      return createSuccessResult(userServer);
    } catch (error) {
      return createErrorResult(`Failed to update server ownership: ${error}`, 'UPDATE_OWNERSHIP_ERROR');
    }
  }

  /**
   * Delete/deactivate a user's server
   */
  async deleteUserServer(userId: string, serverDomain: string): Promise<StorageResult<{ deleted: boolean }>> {
    try {
      // Get server
      const serverResult = await this.storage.get('mcp_servers', serverDomain);
      
      if (!serverResult.success || !serverResult.data) {
        return createErrorResult('Server not found', 'SERVER_NOT_FOUND');
      }

      const server = serverResult.data;

      // Check if user owns or registered this server
      if (server.registered_by_user_id !== userId && server.owner_user_id !== userId) {
        return createErrorResult('Not authorized to delete this server', 'NOT_AUTHORIZED');
      }

      // Soft delete by marking as inactive and removing ownership
      const deletedServer = {
        ...server,
        status: 'inactive',
        ownership_status: 'unowned',
        owner_user_id: null,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updateResult = await this.storage.set('mcp_servers', serverDomain, deletedServer);
      
      if (!updateResult.success) {
        return createErrorResult('Failed to delete server', 'DELETE_SERVER_FAILED');
      }

      return createSuccessResult({ deleted: true });
    } catch (error) {
      return createErrorResult(`Failed to delete server: ${error}`, 'DELETE_SERVER_ERROR');
    }
  }

  /**
   * Update server metadata
   */
  async updateServerMetadata(
    userId: string,
    serverDomain: string,
    updates: {
      name?: string;
      description?: string;
      capabilities?: string[];
      tags?: string[];
      category?: string;
    }
  ): Promise<StorageResult<UserServer>> {
    try {
      // Get server
      const serverResult = await this.storage.get('mcp_servers', serverDomain);
      
      if (!serverResult.success || !serverResult.data) {
        return createErrorResult('Server not found', 'SERVER_NOT_FOUND');
      }

      const server = serverResult.data;

      // Check if user owns this server
      if (server.owner_user_id !== userId) {
        return createErrorResult('Not authorized to update this server', 'NOT_AUTHORIZED');
      }

      // Update server metadata
      const updatedServer = {
        ...server,
        ...updates,
        updated_at: new Date().toISOString()
      };

      const updateResult = await this.storage.set('mcp_servers', serverDomain, updatedServer);
      
      if (!updateResult.success) {
        return createErrorResult('Failed to update server', 'UPDATE_SERVER_FAILED');
      }

      const userServer = this.transformServerToUserServer(updatedServer);
      return createSuccessResult(userServer);
    } catch (error) {
      return createErrorResult(`Failed to update server: ${error}`, 'UPDATE_SERVER_ERROR');
    }
  }

  /**
   * Transform storage server record to UserServer interface
   */
  private transformServerToUserServer(server: any): UserServer {
    return {
      id: server.domain, // Use domain as ID
      domain: server.domain,
      name: server.name,
      description: server.description,
      
      // Registration details
      registered_by_user_id: server.registered_by_user_id,
      registered_at: server.registered_at || server.created_at,
      registration_type: server.registration_type || 'manual',
      
      // Ownership details
      owner_user_id: server.owner_user_id,
      ownership_status: server.ownership_status || 'unowned',
      ownership_verified_at: server.ownership_verified_at,
      
      // Server metadata
      type: server.type || 'official',
      github_repo: server.github_repo,
      github_stars: server.github_stars,
      capabilities: server.capabilities || [],
      trust_score: server.trust_score,
      
      // Status
      status: server.status || 'pending',
      verification_status: server.verification_status || 'pending',
      last_seen: server.last_seen,
      
      // Additional metadata
      tags: server.tags || [],
      category: server.category,
      language: server.language,
      license: server.license,
      
      updated_at: server.updated_at || server.created_at
    };
  }
}

export const userServerService = new UserServerService();
