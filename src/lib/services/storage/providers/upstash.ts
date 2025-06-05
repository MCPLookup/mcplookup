// Upstash Storage Provider
// Implements all storage interfaces using Upstash Redis (serverless Redis)
// Perfect for production serverless environments and edge computing

import { BaseStorageProvider, StorageProviderConfig } from './base';
import { StorageResult } from '../interfaces';
import { UpstashRegistryStorage } from '../upstash-registry-storage';
import { UpstashVerificationStorage } from '../upstash-verification-storage';
import { UpstashUserStorage } from '../upstash-user-storage';
import { UpstashAuditStorage } from '../audit-storage';

/**
 * Upstash Storage Provider
 * Serverless, globally distributed Redis storage
 */
export class UpstashStorageProvider extends BaseStorageProvider {
  readonly name = 'upstash';
  readonly version = '1.0.0';
  readonly capabilities = [
    'registry',
    'verification',
    'user',
    'audit', 
    'serverless',
    'global-distribution',
    'auto-scaling',
    'persistence',
    'high-availability'
  ];

  async isAvailable(): Promise<boolean> {
    try {
      // Check for required environment variables
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return false;
      }

      // Try to create a test storage instance to check connectivity
      const testStorage = new UpstashRegistryStorage();
      const healthCheck = await testStorage.healthCheck();
      return healthCheck.healthy;
    } catch (error) {
      console.warn('Upstash storage provider not available:', error);
      return false;
    }
  }

  async initialize(config?: StorageProviderConfig): Promise<StorageResult<void>> {
    try {
      await super.initialize(config);
      
      // Validate Upstash configuration
      const upstashUrl = config?.upstashUrl || process.env.UPSTASH_REDIS_REST_URL;
      const upstashToken = config?.upstashToken || process.env.UPSTASH_REDIS_REST_TOKEN;

      if (!upstashUrl || !upstashToken) {
        return {
          success: false,
          error: 'Upstash Redis URL and token are required',
          code: 'UPSTASH_CONFIG_MISSING'
        };
      }

      // Test Upstash connectivity
      if (!(await this.isAvailable())) {
        return {
          success: false,
          error: 'Upstash connection failed',
          code: 'UPSTASH_CONNECTION_ERROR'
        };
      }

      return { success: true, data: void 0 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upstash initialization failed',
        code: 'UPSTASH_INIT_ERROR'
      };
    }
  }

  createRegistryStorage() {
    this.ensureInitialized();
    return new UpstashRegistryStorage();
  }

  createVerificationStorage() {
    this.ensureInitialized();
    return new UpstashVerificationStorage();
  }

  createUserStorage() {
    this.ensureInitialized();
    return new UpstashUserStorage();
  }

  createAuditStorage() {
    this.ensureInitialized();
    return new UpstashAuditStorage();
  }

  async shutdown(): Promise<void> {
    // Upstash is serverless, no persistent connections to close
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
          serverless: true,
          upstashHealth: healthResult.details,
          globalDistribution: true,
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
