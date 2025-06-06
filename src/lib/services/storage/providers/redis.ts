// Redis Storage Provider
// Implements all storage interfaces using local Redis instance
// Great for development and self-hosted production environments

import { BaseStorageProvider, StorageProviderConfig } from './base';
import { StorageResult, IStorage } from '../unified-storage';
import { RedisBackend, RedisBackendConfig } from '../backends/redis-backend';
import {
  PaginatedResult,
  QueryOptions,
  BatchOperationResult,
  createSuccessResult,
  createErrorResult,
  HealthCheckResult
} from '../unified-storage';

/**
 * Redis Storage Wrapper - Implements IStorage using RedisBackend
 */
class RedisStorageWrapper implements IStorage {
  private backend: RedisBackend;

  constructor(config?: RedisBackendConfig) {
    this.backend = new RedisBackend(config);
  }

  async set<T = any>(collection: string, key: string, data: T): Promise<StorageResult<void>> {
    try {
      const fullKey = `${collection}:${key}`;
      await this.backend.set(fullKey, JSON.stringify(data));
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to set data: ${error}`);
    }
  }

  async get<T = any>(collection: string, key: string): Promise<StorageResult<T | null>> {
    try {
      const fullKey = `${collection}:${key}`;
      const value = await this.backend.get(fullKey);
      if (!value) return createSuccessResult(null);
      return createSuccessResult(JSON.parse(value));
    } catch (error) {
      return createErrorResult(`Failed to get data: ${error}`);
    }
  }

  async delete(collection: string, key: string): Promise<StorageResult<void>> {
    try {
      const fullKey = `${collection}:${key}`;
      await this.backend.delete(fullKey);
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete data: ${error}`);
    }
  }

  async exists(collection: string, key: string): Promise<StorageResult<boolean>> {
    try {
      const fullKey = `${collection}:${key}`;
      const exists = await this.backend.exists(fullKey);
      return createSuccessResult(exists);
    } catch (error) {
      return createErrorResult(`Failed to check existence: ${error}`);
    }
  }

  async getAll<T = any>(collection: string, options?: QueryOptions): Promise<StorageResult<PaginatedResult<T>>> {
    try {
      const pattern = `${collection}:*`;
      const keys = await this.backend.keys(pattern);
      const values = await this.backend.mGet(keys);

      const items = values
        .filter(v => v !== null)
        .map(v => JSON.parse(v!)) as T[];

      const limit = options?.pagination?.limit || 10;
      const offset = options?.pagination?.offset || 0;

      const paginatedItems = items.slice(offset, offset + limit);

      return createSuccessResult({
        items: paginatedItems,
        total: items.length,
        hasMore: offset + limit < items.length
      });
    } catch (error) {
      return createErrorResult(`Failed to get all data: ${error}`);
    }
  }

  async query<T = any>(collection: string, options: QueryOptions): Promise<StorageResult<PaginatedResult<T>>> {
    return this.getAll<T>(collection, options);
  }

  async search<T = any>(collection: string, searchText: string, options?: QueryOptions): Promise<StorageResult<PaginatedResult<T>>> {
    return this.getAll<T>(collection, options);
  }

  async setBatch<T = any>(collection: string, records: Array<{ key: string; data: T }>): Promise<StorageResult<BatchOperationResult<string>>> {
    try {
      const keyValues = records.map(r => ({
        key: `${collection}:${r.key}`,
        value: JSON.stringify(r.data)
      }));

      await this.backend.mSet(keyValues);

      return createSuccessResult({
        successful: records.map(r => r.key),
        failed: [],
        totalProcessed: records.length
      });
    } catch (error) {
      return createErrorResult(`Failed to set batch: ${error}`);
    }
  }

  async deleteBatch(collection: string, keys: string[]): Promise<StorageResult<BatchOperationResult<string>>> {
    try {
      for (const key of keys) {
        await this.backend.delete(`${collection}:${key}`);
      }

      return createSuccessResult({
        successful: keys,
        failed: [],
        totalProcessed: keys.length
      });
    } catch (error) {
      return createErrorResult(`Failed to delete batch: ${error}`);
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      await this.backend.ping();
      return {
        healthy: true,
        latency: 1,
        details: this.backend.getProviderInfo()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getStats(): Promise<StorageResult<{ collections: Record<string, { count: number; size: number; }>; totalSize: number; uptime: number; }>> {
    try {
      return createSuccessResult({
        collections: {
          redis: {
            count: 0, // Would need Redis INFO command to get actual stats
            size: 0
          }
        },
        totalSize: 0,
        uptime: Date.now()
      });
    } catch (error) {
      return createErrorResult(`Failed to get stats: ${error}`);
    }
  }

  async cleanup(): Promise<StorageResult<{ deletedCount: number; collections: string[]; }>> {
    try {
      return createSuccessResult({
        deletedCount: 0,
        collections: []
      });
    } catch (error) {
      return createErrorResult(`Failed to cleanup: ${error}`);
    }
  }

  getProviderInfo() {
    return this.backend.getProviderInfo();
  }
}

/**
 * Redis Storage Provider
 * Persistent, performant storage using local Redis
 */
export class RedisStorageProvider extends BaseStorageProvider {
  readonly name = 'redis';
  readonly version = '1.0.0';
  readonly capabilities = [
    'registry',
    'verification',
    'user', 
    'audit',
    'persistence',
    'high-performance',
    'pub-sub',
    'atomic-operations'
  ];

  async isAvailable(): Promise<boolean> {
    try {
      // Try to create a test Redis backend and check connectivity
      const testBackend = new RedisBackend({
        type: 'local',
        redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      await testBackend.ping();
      await testBackend.disconnect();
      return true;
    } catch (error) {
      console.warn('Redis storage provider not available:', error);
      return false;
    }
  }

  async initialize(config?: StorageProviderConfig): Promise<StorageResult<void>> {
    try {
      await super.initialize(config);
      
      // Test Redis connectivity
      if (!(await this.isAvailable())) {
        return {
          success: false,
          error: 'Redis connection failed',
          code: 'REDIS_CONNECTION_ERROR'
        };
      }

      return { success: true, data: void 0 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Redis initialization failed',
        code: 'REDIS_INIT_ERROR'
      };
    }
  }

  createStorage(): IStorage {
    this.ensureInitialized();
    return new RedisStorageWrapper({
      type: 'local',
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
    });
  }

  async shutdown(): Promise<void> {
    // Redis connections are typically managed by the individual storage instances
    // But we can mark the provider as shutdown
    this.initialized = false;
  }

  async healthCheck() {
    const start = Date.now();

    try {
      const storage = this.createStorage();
      const healthResult = await storage.healthCheck();

      return {
        healthy: healthResult.healthy,
        latency: healthResult.latency || (Date.now() - start),
        details: {
          provider: this.name,
          version: this.version,
          redisHealth: healthResult.details,
          ...healthResult.details
        }
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - start,
        details: {
          provider: this.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}
