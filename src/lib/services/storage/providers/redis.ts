// Redis Storage Provider
// Implements all storage interfaces using local Redis instance
// Great for development and self-hosted production environments

import { BaseStorageProvider, StorageProviderConfig } from './base';
import { StorageResult } from '../interfaces';
import { 
  LocalRedisRegistryStorage, 
  LocalRedisVerificationStorage, 
  LocalRedisUserStorage 
} from '../local-redis-storage';
import { LocalRedisAuditStorage } from '../audit-storage';

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
      // Try to create a test storage instance to check connectivity
      const testStorage = new LocalRedisRegistryStorage();
      const healthCheck = await testStorage.healthCheck();
      return healthCheck.healthy;
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

  createRegistryStorage() {
    this.ensureInitialized();
    return new LocalRedisRegistryStorage();
  }

  createVerificationStorage() {
    this.ensureInitialized();
    return new LocalRedisVerificationStorage();
  }

  createUserStorage() {
    this.ensureInitialized();
    return new LocalRedisUserStorage();
  }

  createAuditStorage() {
    this.ensureInitialized();
    return new LocalRedisAuditStorage();
  }

  async shutdown(): Promise<void> {
    // Redis connections are typically managed by the individual storage instances
    // But we can mark the provider as shutdown
    this.initialized = false;
  }

  async healthCheck() {
    const start = Date.now();
    
    try {
      const registryStorage = this.createRegistryStorage();
      const healthResult = await registryStorage.healthCheck();
      
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
