// Main Storage Provider - Uses backends with smart indexing
// Handles business logic and indexing, delegates storage to backends

import {
  IStorage,
  StorageResult,
  PaginatedResult,
  QueryOptions,
  HealthCheckResult,
  BatchOperationResult,
  createSuccessResult,
  createErrorResult,
  createEmptyPaginatedResult,
  createHealthCheckResult
} from './unified-storage';
import { SmartIndexer, IndexOptions } from './smart-indexer';
import { StorageBackend } from './backends/storage-backend';
import { RedisBackend, RedisBackendConfig } from './backends/redis-backend';
import { MemoryBackend } from './backends/memory-backend';

export interface StorageProviderConfig {
  backend: 'redis' | 'memory';
  indexOptions?: IndexOptions;
  redisConfig?: RedisBackendConfig;
}

export class StorageProvider implements IStorage {
  private backend: StorageBackend;
  private indexers = new Map<string, SmartIndexer>();
  private indexOptions: IndexOptions;
  private startTime = Date.now();

  constructor(config?: StorageProviderConfig) {
    this.indexOptions = config?.indexOptions || {};
    this.backend = this.createBackend(config);
  }

  private createBackend(config?: StorageProviderConfig): StorageBackend {
    const backendType = config?.backend || this.detectBackend();
    
    switch (backendType) {
      case 'redis':
        return new RedisBackend(config?.redisConfig);
      case 'memory':
        return new MemoryBackend();
      default:
        throw new Error(`Unknown backend type: ${backendType}`);
    }
  }

  private detectBackend(): 'redis' | 'memory' {
    // Auto-detect based on environment
    if (process.env.NODE_ENV === 'test') {
      return 'memory';
    }
    
    if (process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL) {
      return 'redis';
    }
    
    return 'memory'; // Default fallback
  }

  private getIndexer(collection: string): SmartIndexer {
    let indexer = this.indexers.get(collection);
    if (!indexer) {
      indexer = new SmartIndexer(collection, this.indexOptions);
      this.indexers.set(collection, indexer);
    }
    return indexer;
  }

  private getKey(collection: string, key: string): string {
    return `${collection}:${key}`;
  }

  private getCollectionKey(collection: string): string {
    return `coll:${collection}`;
  }

  // ==========================================================================
  // CORE CRUD OPERATIONS
  // ==========================================================================

  async set<T = any>(
    collection: string,
    key: string,
    data: T
  ): Promise<StorageResult<void>> {
    try {
      const dataWithTimestamp = { 
        ...data, 
        ...(typeof data === 'object' && data !== null && 'updated_at' in data 
          ? { updated_at: new Date().toISOString() } 
          : {})
      };

      const redisKey = this.getKey(collection, key);
      const collectionKey = this.getCollectionKey(collection);

      // Store the record
      await this.backend.set(redisKey, JSON.stringify(dataWithTimestamp));
      
      // Add to collection index
      await this.backend.sAdd(collectionKey, key);

      // Create smart indexes (only for Redis backend)
      if (this.backend.getProviderInfo().name.startsWith('redis')) {
        const indexer = this.getIndexer(collection);
        indexer.analyzeRecord(dataWithTimestamp);
        await this.createSmartIndexes(collection, key, dataWithTimestamp, indexer);
      }

      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store record: ${error}`, 'STORE_ERROR');
    }
  }

  async get<T = any>(
    collection: string,
    key: string
  ): Promise<StorageResult<T | null>> {
    try {
      const redisKey = this.getKey(collection, key);
      const result = await this.backend.get(redisKey);
      
      if (!result) {
        return createSuccessResult(null);
      }

      const data = JSON.parse(result);
      return createSuccessResult(data);
    } catch (error) {
      return createErrorResult(`Failed to get record: ${error}`, 'GET_ERROR');
    }
  }

  async delete(
    collection: string,
    key: string
  ): Promise<StorageResult<void>> {
    try {
      // First get the record to clean up indexes
      const getResult = await this.get(collection, key);
      
      // Remove smart indexes first (only for Redis backend)
      if (getResult.success && getResult.data && this.backend.getProviderInfo().name.startsWith('redis')) {
        await this.removeSmartIndexes(collection, key, getResult.data);
      }
      
      const redisKey = this.getKey(collection, key);
      const collectionKey = this.getCollectionKey(collection);

      // Delete the record
      await this.backend.delete(redisKey);
      
      // Remove from collection index
      await this.backend.sRem(collectionKey, key);

      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete record: ${error}`, 'DELETE_ERROR');
    }
  }

  async exists(
    collection: string,
    key: string
  ): Promise<StorageResult<boolean>> {
    try {
      const redisKey = this.getKey(collection, key);
      const exists = await this.backend.exists(redisKey);
      
      return createSuccessResult(exists);
    } catch (error) {
      return createErrorResult(`Failed to check existence: ${error}`, 'EXISTS_ERROR');
    }
  }

  // ==========================================================================
  // QUERY OPERATIONS
  // ==========================================================================

  async getAll<T = any>(
    collection: string,
    options?: QueryOptions
  ): Promise<StorageResult<PaginatedResult<T>>> {
    try {
      const collectionKey = this.getCollectionKey(collection);
      const keys = await this.backend.sMembers(collectionKey);
      
      if (keys.length === 0) {
        return createSuccessResult(createEmptyPaginatedResult());
      }

      // Get all records
      const redisKeys = keys.map(key => this.getKey(collection, key));
      const values = await this.backend.mGet(redisKeys);
      
      let items = values
        .filter(value => value !== null)
        .map(value => JSON.parse(value!));

      // Apply sorting
      if (options?.sort) {
        items.sort((a, b) => {
          const aVal = (a as any)[options.sort!.field];
          const bVal = (b as any)[options.sort!.field];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return options.sort!.direction === 'desc' ? -comparison : comparison;
        });
      }

      // Apply pagination
      const limit = options?.pagination?.limit || 50;
      const offset = options?.pagination?.offset || 0;
      const total = items.length;
      const paginatedItems = items.slice(offset, offset + limit);
      const hasMore = offset + limit < total;

      return createSuccessResult({
        items: paginatedItems,
        total,
        hasMore,
        nextCursor: hasMore ? String(offset + limit) : undefined
      });
    } catch (error) {
      return createErrorResult(`Failed to get all records: ${error}`, 'GETALL_ERROR');
    }
  }

  async query<T = any>(
    collection: string,
    options: QueryOptions
  ): Promise<StorageResult<PaginatedResult<T>>> {
    try {
      // For Redis backend, use smart indexing
      if (this.backend.getProviderInfo().name.startsWith('redis')) {
        return this.queryWithIndexes<T>(collection, options);
      }
      
      // For memory backend, just filter all records
      const getAllResult = await this.getAll<T>(collection);
      if (!getAllResult.success) {
        return getAllResult;
      }

      let items = getAllResult.data.items;

      // Apply filters
      if (options.filters) {
        items = items.filter(item => {
          return Object.entries(options.filters!).every(([key, value]) => {
            const itemValue = (item as any)[key];
            if (Array.isArray(value)) {
              return value.includes(itemValue);
            }
            return itemValue === value;
          });
        });
      }

      // Apply sorting and pagination (already handled by getAll)
      return createSuccessResult({
        items,
        total: items.length,
        hasMore: false
      });
    } catch (error) {
      return createErrorResult(`Failed to query records: ${error}`, 'QUERY_ERROR');
    }
  }

  async search<T = any>(
    collection: string,
    searchText: string,
    options?: QueryOptions
  ): Promise<StorageResult<PaginatedResult<T>>> {
    try {
      // For Redis backend, use smart indexing
      if (this.backend.getProviderInfo().name.startsWith('redis')) {
        return this.searchWithIndexes<T>(collection, searchText, options);
      }
      
      // For memory backend, simple text search
      const getAllResult = await this.getAll<T>(collection, options);
      
      if (!getAllResult.success) {
        return getAllResult;
      }

      const searchLower = searchText.toLowerCase();
      const filteredItems = getAllResult.data.items.filter(item => {
        const itemStr = JSON.stringify(item).toLowerCase();
        return itemStr.includes(searchLower);
      });

      return createSuccessResult({
        items: filteredItems,
        total: filteredItems.length,
        hasMore: false
      });
    } catch (error) {
      return createErrorResult(`Failed to search records: ${error}`, 'SEARCH_ERROR');
    }
  }

  // ==========================================================================
  // SMART INDEXING (Redis only)
  // ==========================================================================

  private async createSmartIndexes(collection: string, key: string, data: any, indexer: SmartIndexer): Promise<void> {
    const indexes = indexer.generateIndexKeys(data);

    // Create exact match indexes
    for (const { key: indexKey } of indexes.exact) {
      await this.backend.sAdd(indexKey, key);
    }

    // Create text search indexes
    for (const { keys: indexKeys } of indexes.text) {
      for (const indexKey of indexKeys) {
        await this.backend.sAdd(indexKey, key);
      }
    }

    // Create numeric range indexes (sorted sets)
    for (const { key: indexKey, value } of indexes.numeric) {
      await this.backend.zAdd(indexKey, value, key);
    }

    // Create date range indexes (sorted sets)
    for (const { key: indexKey, timestamp } of indexes.date) {
      await this.backend.zAdd(indexKey, timestamp, key);
    }
  }

  private async removeSmartIndexes(collection: string, key: string, data: any): Promise<void> {
    const indexer = this.getIndexer(collection);
    const indexes = indexer.generateIndexKeys(data);

    // Remove from exact match indexes
    for (const { key: indexKey } of indexes.exact) {
      await this.backend.sRem(indexKey, key);
    }

    // Remove from text search indexes
    for (const { keys: indexKeys } of indexes.text) {
      for (const indexKey of indexKeys) {
        await this.backend.sRem(indexKey, key);
      }
    }

    // Remove from numeric range indexes
    for (const { key: indexKey } of indexes.numeric) {
      await this.backend.zRem(indexKey, key);
    }

    // Remove from date range indexes
    for (const { key: indexKey } of indexes.date) {
      await this.backend.zRem(indexKey, key);
    }
  }

  private async queryWithIndexes<T = any>(
    collection: string,
    options: QueryOptions
  ): Promise<StorageResult<PaginatedResult<T>>> {
    const indexer = this.getIndexer(collection);
    const recommendations = indexer.getIndexingRecommendations();

    let candidateKeys = new Set<string>();
    let firstFilter = true;

    // Apply filters using indexes
    if (options.filters) {
      for (const [field, value] of Object.entries(options.filters)) {
        const values = Array.isArray(value) ? value : [value];
        const fieldKeys = new Set<string>();

        for (const v of values) {
          const indexKey = `idx:${collection}:exact:${field}:${v}`;
          const keys = await this.backend.sMembers(indexKey);
          keys.forEach(k => fieldKeys.add(k));
        }

        if (firstFilter) {
          candidateKeys = fieldKeys;
          firstFilter = false;
        } else {
          // Intersect with existing candidates
          candidateKeys = new Set([...candidateKeys].filter(k => fieldKeys.has(k)));
        }
      }
    }

    // If no filters, get all keys
    if (firstFilter) {
      const collectionKey = this.getCollectionKey(collection);
      const keys = await this.backend.sMembers(collectionKey);
      candidateKeys = new Set(keys);
    }

    // Get actual records
    const keys = Array.from(candidateKeys);
    const redisKeys = keys.map(key => this.getKey(collection, key));
    const values = await this.backend.mGet(redisKeys);

    let items = values
      .filter(value => value !== null)
      .map(value => JSON.parse(value!));

    // Apply sorting
    if (options.sort) {
      items.sort((a, b) => {
        const aVal = (a as any)[options.sort!.field];
        const bVal = (b as any)[options.sort!.field];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return options.sort!.direction === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const limit = options.pagination?.limit || 50;
    const offset = options.pagination?.offset || 0;
    const total = items.length;
    const paginatedItems = items.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return createSuccessResult({
      items: paginatedItems,
      total,
      hasMore,
      nextCursor: hasMore ? String(offset + limit) : undefined
    });
  }

  private async searchWithIndexes<T = any>(
    collection: string,
    searchText: string,
    options?: QueryOptions
  ): Promise<StorageResult<PaginatedResult<T>>> {
    const indexer = this.getIndexer(collection);
    const recommendations = indexer.getIndexingRecommendations();

    // Use smart indexing for search
    let candidateKeys = new Set<string>();

    // Search in text-indexed fields
    const tokens = this.tokenizeText(searchText);
    for (const field of recommendations.textFields) {
      for (const token of tokens) {
        const indexKey = `idx:${collection}:text:${field}:${token}`;
        const keys = await this.backend.sMembers(indexKey);
        keys.forEach(k => candidateKeys.add(k));
      }
    }

    // Search in exact fields (for exact matches)
    for (const field of recommendations.exactFields) {
      const indexKey = `idx:${collection}:exact:${field}:${searchText}`;
      const keys = await this.backend.sMembers(indexKey);
      keys.forEach(k => candidateKeys.add(k));
    }

    // Apply additional filters if provided
    if (options?.filters) {
      for (const [field, value] of Object.entries(options.filters)) {
        const values = Array.isArray(value) ? value : [value];
        const fieldKeys = new Set<string>();

        for (const v of values) {
          const indexKey = `idx:${collection}:exact:${field}:${v}`;
          const keys = await this.backend.sMembers(indexKey);
          keys.forEach(k => fieldKeys.add(k));
        }

        // Intersect with existing candidates
        candidateKeys = new Set([...candidateKeys].filter(k => fieldKeys.has(k)));
      }
    }

    // If no indexed results, fallback to full scan
    if (candidateKeys.size === 0) {
      const getAllResult = await this.getAll<T>(collection, options);

      if (!getAllResult.success) {
        return getAllResult;
      }

      const searchLower = searchText.toLowerCase();
      const filteredItems = getAllResult.data.items.filter(item => {
        const itemStr = JSON.stringify(item).toLowerCase();
        return itemStr.includes(searchLower);
      });

      return createSuccessResult({
        items: filteredItems,
        total: filteredItems.length,
        hasMore: false
      });
    }

    // Get actual records for matching keys
    const keys = Array.from(candidateKeys);
    const redisKeys = keys.map(key => this.getKey(collection, key));
    const values = await this.backend.mGet(redisKeys);

    let items = values
      .filter(value => value !== null)
      .map(value => JSON.parse(value!));

    // Apply sorting
    if (options?.sort) {
      items.sort((a, b) => {
        const aVal = (a as any)[options.sort!.field];
        const bVal = (b as any)[options.sort!.field];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return options.sort!.direction === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const limit = options?.pagination?.limit || 50;
    const offset = options?.pagination?.offset || 0;
    const total = items.length;
    const paginatedItems = items.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return createSuccessResult({
      items: paginatedItems,
      total,
      hasMore,
      nextCursor: hasMore ? String(offset + limit) : undefined
    });
  }

  private tokenizeText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length >= 2);
  }

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  async setBatch<T = any>(
    collection: string,
    records: Array<{ key: string; data: T }>
  ): Promise<StorageResult<BatchOperationResult<string>>> {
    const successful: string[] = [];
    const failed: Array<{ item: string; error: string }> = [];

    for (const record of records) {
      try {
        const result = await this.set(collection, record.key, record.data);
        if (result.success) {
          successful.push(record.key);
        } else {
          failed.push({ item: record.key, error: (result as any).error });
        }
      } catch (error) {
        failed.push({ item: record.key, error: String(error) });
      }
    }

    return createSuccessResult({
      successful,
      failed,
      totalProcessed: records.length
    });
  }

  async deleteBatch(
    collection: string,
    keys: string[]
  ): Promise<StorageResult<BatchOperationResult<string>>> {
    const successful: string[] = [];
    const failed: Array<{ item: string; error: string }> = [];

    for (const key of keys) {
      try {
        const result = await this.delete(collection, key);
        if (result.success) {
          successful.push(key);
        } else {
          failed.push({ item: key, error: (result as any).error });
        }
      } catch (error) {
        failed.push({ item: key, error: String(error) });
      }
    }

    return createSuccessResult({
      successful,
      failed,
      totalProcessed: keys.length
    });
  }

  // ==========================================================================
  // MAINTENANCE & MONITORING
  // ==========================================================================

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const pong = await this.backend.ping();
      const latency = Date.now() - startTime;

      if (pong === 'PONG') {
        return createHealthCheckResult(true, latency, undefined, {
          backend: this.backend.getProviderInfo().name,
          uptime: Date.now() - this.startTime
        });
      } else {
        return createHealthCheckResult(false, latency, 'Invalid ping response');
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      return createHealthCheckResult(false, latency, String(error));
    }
  }

  async getStats(): Promise<StorageResult<{
    collections: Record<string, {
      count: number;
      size: number;
    }>;
    totalSize: number;
    uptime: number;
    backend: string;
  }>> {
    try {
      const collections: Record<string, any> = {};

      // Get collection stats by scanning for collection keys
      const collectionKeys = await this.backend.keys('coll:*');

      for (const collectionKey of collectionKeys) {
        const collection = collectionKey.replace('coll:', '');
        const count = await this.backend.sCard(collectionKey);

        collections[collection] = {
          count,
          size: count * 100 // Rough estimate
        };
      }

      const totalSize = Object.values(collections).reduce((sum: number, col: any) => sum + col.size, 0);

      return createSuccessResult({
        collections,
        totalSize,
        uptime: Date.now() - this.startTime,
        backend: this.backend.getProviderInfo().name
      });
    } catch (error) {
      return createErrorResult(`Failed to get stats: ${error}`, 'STATS_ERROR');
    }
  }

  async cleanup(): Promise<StorageResult<{
    deletedCount: number;
    collections: string[];
  }>> {
    try {
      // Get current collections
      const collectionKeys = await this.backend.keys('coll:*');
      const collections = collectionKeys.map(key => key.replace('coll:', ''));

      return createSuccessResult({
        deletedCount: 0, // No automatic cleanup for now
        collections
      });
    } catch (error) {
      return createErrorResult(`Failed to cleanup: ${error}`, 'CLEANUP_ERROR');
    }
  }

  getProviderInfo() {
    return {
      name: 'storage-provider',
      version: '1.0.0',
      capabilities: ['unified-interface', 'smart-indexing', 'multi-backend'],
      backend: this.backend.getProviderInfo()
    };
  }
}
