// Storage Factory - Creates storage providers based on environment
// Unified factory pattern for all storage needs

import { IStorage } from './unified-storage';
import { StorageProvider as MainStorageProvider, StorageProviderConfig } from './storage-provider';
import { RedisBackendConfig } from './backends/redis-backend';
import { IndexOptions } from './smart-indexer';

/**
 * Storage backend types
 */
export type StorageBackendType = 'memory' | 'redis';

/**
 * Storage configuration options
 */
export interface StorageConfig {
  backend?: StorageBackendType;
  redisUrl?: string;
  upstashUrl?: string;
  upstashToken?: string;
  indexOptions?: IndexOptions;
}

/**
 * Storage Factory
 * Creates appropriate storage provider based on configuration and environment
 */
export class StorageFactory {
  private static instance: StorageFactory;
  private providers = new Map<string, IStorage>();

  private constructor() {}

  static getInstance(): StorageFactory {
    if (!StorageFactory.instance) {
      StorageFactory.instance = new StorageFactory();
    }
    return StorageFactory.instance;
  }

  /**
   * Create storage provider based on configuration
   */
  createStorage(config?: StorageConfig): IStorage {
    const backend = config?.backend || this.detectBackend();
    const cacheKey = this.getCacheKey(backend, config);

    // Return cached instance if available
    if (this.providers.has(cacheKey)) {
      return this.providers.get(cacheKey)!;
    }

    let storage: IStorage;

    try {
      const providerConfig: StorageProviderConfig = {
        backend,
        indexOptions: config?.indexOptions
      };

      // Configure Redis backend if needed
      if (backend === 'redis') {
        providerConfig.redisConfig = this.createRedisConfig(config);
      }

      storage = new MainStorageProvider(providerConfig);
      console.log(`✅ Using ${backend} storage backend`);
    } catch (error) {
      console.warn(`⚠️ ${backend} storage failed, falling back to memory:`, error);
      storage = new MainStorageProvider({ backend: 'memory' });
    }

    // Cache the instance
    this.providers.set(cacheKey, storage);
    return storage;
  }

  private createRedisConfig(config?: StorageConfig): RedisBackendConfig {
    // Auto-detect Redis type based on environment
    if (config?.upstashUrl && config?.upstashToken) {
      return {
        type: 'upstash',
        upstashUrl: config.upstashUrl,
        upstashToken: config.upstashToken
      };
    }

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      return {
        type: 'upstash',
        upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
        upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN
      };
    }

    return {
      type: 'local',
      redisUrl: config?.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379'
    };
  }

  /**
   * Auto-detect the best storage backend based on environment
   */
  private detectBackend(): StorageBackendType {
    // Check for test environment
    if (process.env.NODE_ENV === 'test') {
      return 'memory';
    }

    // Check for Redis environment variables (Upstash or local)
    if (process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL) {
      return 'redis';
    }

    // Check for NODE_ENV
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Production environment detected but no Redis credentials found, using memory storage');
    }

    return 'memory';
  }

  /**
   * Generate cache key for provider instances
   */
  private getCacheKey(backend: StorageBackendType, config?: StorageConfig): string {
    const parts: string[] = [backend];

    if (config?.redisUrl) {
      parts.push(config.redisUrl);
    }

    if (config?.upstashUrl) {
      parts.push(config.upstashUrl);
    }

    return parts.join(':');
  }

  /**
   * Clear cached providers (useful for testing)
   */
  clearCache(): void {
    this.providers.clear();
  }

  /**
   * Get all cached providers (useful for cleanup)
   */
  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.providers.values())
      .map(provider => provider.disconnect?.())
      .filter(Boolean);

    await Promise.all(disconnectPromises);
    this.clearCache();
  }

  /**
   * Health check all cached providers
   */
  async healthCheckAll(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const [key, provider] of this.providers.entries()) {
      try {
        results[key] = await provider.healthCheck();
      } catch (error) {
        results[key] = {
          healthy: false,
          error: String(error)
        };
      }
    }

    return results;
  }
}

/**
 * Convenience function to create storage with default factory
 */
export function createStorage(config?: StorageConfig): IStorage {
  return StorageFactory.getInstance().createStorage(config);
}

/**
 * Convenience function for testing - always returns memory storage
 */
export function createTestStorage(): IStorage {
  return new MainStorageProvider({ backend: 'memory' });
}

/**
 * Convenience function for development - prefers Redis, falls back to memory
 */
export function createDevelopmentStorage(): IStorage {
  const backend: StorageBackendType = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL ? 'redis' : 'memory';
  return StorageFactory.getInstance().createStorage({
    backend
  });
}

/**
 * Convenience function for production - prefers Redis (Upstash), falls back to memory
 */
export function createProductionStorage(): IStorage {
  return StorageFactory.getInstance().createStorage({
    backend: 'redis' // Will auto-detect Upstash vs local Redis
  });
}

/**
 * Environment-based storage creation
 */
export function createEnvironmentStorage(): IStorage {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'test':
      return createTestStorage();
    case 'development':
      return createDevelopmentStorage();
    case 'production':
      return createProductionStorage();
    default:
      return createStorage(); // Auto-detect
  }
}
