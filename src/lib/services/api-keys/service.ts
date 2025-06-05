// API Key Service
// Handles API key creation, validation, and management

import { createHash, randomBytes } from 'crypto';
import { createStorage } from '../storage/factory';
import { IStorage, StorageResult, createSuccessResult, createErrorResult } from '../storage/unified-storage';
import {
  ApiKey,
  ApiKeyUsage,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  ApiKeyValidationResult,
  ApiKeyStats,
  DEFAULT_PERMISSIONS,
  DEFAULT_RATE_LIMITS,
  ApiKeyPermission
} from './types';

/**
 * API Key Service
 * Manages API key lifecycle, validation, and usage tracking
 */
export class ApiKeyService {
  private storage: IStorage;
  private readonly API_KEYS_COLLECTION = 'api_keys';
  private readonly API_KEY_USAGE_COLLECTION = 'api_key_usage';
  private readonly API_KEY_PREFIX = 'mcp_';

  constructor() {
    this.storage = createStorage();
  }

  /**
   * Generate a new API key
   */
  private generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
    // Generate a secure random key
    const keyBytes = randomBytes(32);
    const rawKey = `${this.API_KEY_PREFIX}${keyBytes.toString('hex')}`;
    
    // Hash the key for storage
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    
    // Create prefix for display
    const keyPrefix = rawKey.substring(0, 12) + '...';
    
    return { rawKey, keyHash, keyPrefix };
  }

  /**
   * Create a new API key for a user
   */
  async createApiKey(
    userId: string,
    request: CreateApiKeyRequest,
    userRole: 'user' | 'admin' = 'user'
  ): Promise<StorageResult<CreateApiKeyResponse>> {
    try {
      // Generate the API key
      const { rawKey, keyHash, keyPrefix } = this.generateApiKey();
      
      // Create the API key record
      const apiKey: ApiKey = {
        id: `key_${Date.now()}_${randomBytes(8).toString('hex')}`,
        user_id: userId,
        name: request.name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        permissions: request.permissions.length > 0 ? request.permissions : DEFAULT_PERMISSIONS[userRole],
        last_used_at: undefined,
        usage_count: 0,
        rate_limit: request.rate_limit || DEFAULT_RATE_LIMITS[userRole],
        expires_at: request.expires_at,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store the API key
      const result = await this.storage.set(this.API_KEYS_COLLECTION, apiKey.id, apiKey);
      
      if (!result.success) {
        return createErrorResult(`Failed to create API key: ${result.error}`);
      }

      return createSuccessResult({
        api_key: apiKey,
        raw_key: rawKey
      });
    } catch (error) {
      return createErrorResult(`Failed to create API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate an API key
   */
  async validateApiKey(rawKey: string): Promise<ApiKeyValidationResult> {
    try {
      // Hash the provided key
      const keyHash = createHash('sha256').update(rawKey).digest('hex');
      
      // Find the API key by hash
      const result = await this.storage.query<ApiKey>(this.API_KEYS_COLLECTION, {
        filters: { key_hash: keyHash, is_active: true }
      });

      if (!result.success || result.data.items.length === 0) {
        return {
          valid: false,
          error: 'Invalid API key'
        };
      }

      const apiKey = result.data.items[0];

      // Check if the key has expired
      if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
        return {
          valid: false,
          error: 'API key has expired'
        };
      }

      // Update last used timestamp and usage count
      await this.updateApiKeyUsage(apiKey.id);

      return {
        valid: true,
        api_key: apiKey
      };
    } catch (error) {
      return {
        valid: false,
        error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update API key usage statistics
   */
  private async updateApiKeyUsage(apiKeyId: string): Promise<void> {
    try {
      const result = await this.storage.get<ApiKey>(this.API_KEYS_COLLECTION, apiKeyId);
      if (result.success && result.data) {
        const updatedKey: ApiKey = {
          ...result.data,
          last_used_at: new Date().toISOString(),
          usage_count: result.data.usage_count + 1,
          updated_at: new Date().toISOString()
        };
        
        await this.storage.set(this.API_KEYS_COLLECTION, apiKeyId, updatedKey);
      }
    } catch (error) {
      console.error('Failed to update API key usage:', error);
    }
  }

  /**
   * Record API key usage for analytics
   */
  async recordUsage(
    apiKeyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTimeMs: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      const usage: ApiKeyUsage = {
        id: `usage_${Date.now()}_${randomBytes(8).toString('hex')}`,
        api_key_id: apiKeyId,
        endpoint,
        method,
        status_code: statusCode,
        response_time_ms: responseTimeMs,
        user_agent: userAgent,
        ip_address: ipAddress,
        created_at: new Date().toISOString()
      };

      await this.storage.set(this.API_KEY_USAGE_COLLECTION, usage.id, usage);
    } catch (error) {
      console.error('Failed to record API key usage:', error);
    }
  }

  /**
   * Get all API keys for a user
   */
  async getUserApiKeys(userId: string): Promise<StorageResult<ApiKey[]>> {
    try {
      const result = await this.storage.query<ApiKey>(this.API_KEYS_COLLECTION, {
        filters: { user_id: userId },
        sort: { field: 'created_at', direction: 'desc' }
      });

      if (!result.success) {
        return createErrorResult(`Failed to get API keys: ${result.error}`);
      }

      return createSuccessResult(result.data.items);
    } catch (error) {
      return createErrorResult(`Failed to get API keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(userId: string, apiKeyId: string): Promise<StorageResult<void>> {
    try {
      const result = await this.storage.get<ApiKey>(this.API_KEYS_COLLECTION, apiKeyId);
      
      if (!result.success || !result.data) {
        return createErrorResult('API key not found');
      }

      if (result.data.user_id !== userId) {
        return createErrorResult('Unauthorized to revoke this API key');
      }

      const updatedKey: ApiKey = {
        ...result.data,
        is_active: false,
        updated_at: new Date().toISOString()
      };

      const updateResult = await this.storage.set(this.API_KEYS_COLLECTION, apiKeyId, updatedKey);
      
      if (!updateResult.success) {
        return createErrorResult(`Failed to revoke API key: ${updateResult.error}`);
      }

      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to revoke API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get API key usage statistics
   */
  async getApiKeyStats(apiKeyId: string): Promise<StorageResult<ApiKeyStats>> {
    try {
      const result = await this.storage.query<ApiKeyUsage>(this.API_KEY_USAGE_COLLECTION, {
        filters: { api_key_id: apiKeyId }
      });

      if (!result.success) {
        return createErrorResult(`Failed to get API key stats: ${result.error}`);
      }

      const usageRecords = result.data.items;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: ApiKeyStats = {
        total_requests: usageRecords.length,
        requests_today: usageRecords.filter(r => new Date(r.created_at) >= today).length,
        requests_this_week: usageRecords.filter(r => new Date(r.created_at) >= weekAgo).length,
        requests_this_month: usageRecords.filter(r => new Date(r.created_at) >= monthAgo).length,
        last_used_at: usageRecords.length > 0 ? usageRecords[0].created_at : undefined,
        most_used_endpoints: this.calculateTopEndpoints(usageRecords),
        error_rate: this.calculateErrorRate(usageRecords)
      };

      return createSuccessResult(stats);
    } catch (error) {
      return createErrorResult(`Failed to get API key stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate top endpoints by usage
   */
  private calculateTopEndpoints(usageRecords: ApiKeyUsage[]): Array<{ endpoint: string; count: number }> {
    const endpointCounts = usageRecords.reduce((acc, record) => {
      acc[record.endpoint] = (acc[record.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Calculate error rate percentage
   */
  private calculateErrorRate(usageRecords: ApiKeyUsage[]): number {
    if (usageRecords.length === 0) return 0;
    
    const errorCount = usageRecords.filter(r => r.status_code >= 400).length;
    return Math.round((errorCount / usageRecords.length) * 100);
  }

  /**
   * Check if API key has permission
   */
  hasPermission(apiKey: ApiKey, permission: ApiKeyPermission): boolean {
    return apiKey.permissions.includes(permission);
  }
}

// Export singleton instance
export const apiKeyService = new ApiKeyService();
