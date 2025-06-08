// In-Memory Storage Provider
// Implements all storage interfaces using in-memory data structures
// Perfect for development, testing, and environments without external dependencies

import { BaseStorageProvider, StorageProviderConfig } from './base';
import { StorageResult, IStorage } from '../unified-storage';
import { MemoryBackend } from '../backends/memory-backend';
import {
  PaginatedResult,
  QueryOptions,
  BatchOperationResult,
  createSuccessResult,
  createErrorResult,
  createEmptyPaginatedResult
} from '../unified-storage';

/**
 * Memory Storage Wrapper - Implements IStorage using MemoryBackend
 */
class MemoryStorageWrapper implements IStorage {
  private backend = new MemoryBackend();

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

  async healthCheck() {
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
      const stats = this.backend.getStats();
      return createSuccessResult({
        collections: {
          memory: {
            count: stats.dataKeys,
            size: stats.totalMemoryUsage
          }
        },
        totalSize: stats.totalMemoryUsage,
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
 * In-Memory Storage Provider
 * Fast, reliable storage using in-memory data structures
 */
export class InMemoryStorageProvider extends BaseStorageProvider {
  readonly name = 'memory';
  readonly version = '1.0.0';
  readonly capabilities = [
    'registry',
    'verification', 
    'user',
    'audit',
    'fast-access',
    'no-persistence'
  ];

  async isAvailable(): Promise<boolean> {
    // Memory storage is always available
    return true;
  }

  createStorage(): IStorage {
    this.ensureInitialized();
    return new MemoryStorageWrapper();
  }

  async shutdown(): Promise<void> {
    // Nothing to shutdown for in-memory storage
    this.initialized = false;
  }

  async healthCheck() {
    const start = Date.now();
    
    try {
      // Quick memory allocation test
      const testData = new Array(1000).fill(0);
      const latency = Date.now() - start;
      
      return {
        healthy: true,
        latency,
        details: {
          provider: this.name,
          version: this.version,
          memoryTest: 'passed',
          testArraySize: testData.length
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
