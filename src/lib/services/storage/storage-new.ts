// Storage Factory - Environment-based storage selection
// Simple factory pattern that returns the appropriate storage implementation

import {
  IRegistryStorage,
  IVerificationStorage,
  IUserStorage,
  IAuditStorage,
} from './interfaces';

// Import storage implementations
import { UpstashRegistryStorage } from './upstash-registry-storage';
import { UpstashVerificationStorage } from './upstash-verification-storage';
import { UpstashUserStorage } from './upstash-user-storage';
import { LocalRedisRegistryStorage, LocalRedisVerificationStorage, LocalRedisUserStorage } from './local-redis-storage';
import { InMemoryRegistryStorage, InMemoryVerificationStorage, InMemoryUserStorage } from './memory-storage';
import { InMemoryAuditStorage, LocalRedisAuditStorage, UpstashAuditStorage } from './audit-storage';

export interface StorageConfig {
  provider?: 'upstash' | 'local' | 'memory';
  redisUrl?: string;
  redisToken?: string;
}

/**
 * Detect storage provider from environment
 */
function detectStorageProvider(): 'upstash' | 'local' | 'memory' {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return 'upstash';
  }
  
  if (process.env.REDIS_URL || process.env.LOCAL_REDIS_URL) {
    return 'local';
  }
  
  return 'memory';
}

/**
 * Create Registry Storage instance based on environment
 */
export function createRegistryStorage(config?: StorageConfig): IRegistryStorage {
  const provider = config?.provider || detectStorageProvider();
  
  switch (provider) {
    case 'upstash':
      try {
        return new UpstashRegistryStorage();
      } catch (error) {
        console.warn('UpstashRegistryStorage initialization failed, falling back to memory:', error);
        return new InMemoryRegistryStorage();
      }
    
    case 'local':
      try {
        return new LocalRedisRegistryStorage();
      } catch (error) {
        console.warn('LocalRedisRegistryStorage initialization failed, falling back to memory:', error);
        return new InMemoryRegistryStorage();
      }
    
    default:
      return new InMemoryRegistryStorage();
  }
}

/**
 * Create Verification Storage instance based on environment
 */
export function createVerificationStorage(config?: StorageConfig): IVerificationStorage {
  const provider = config?.provider || detectStorageProvider();
  
  switch (provider) {
    case 'upstash':
      try {
        return new UpstashVerificationStorage();
      } catch (error) {
        console.warn('UpstashVerificationStorage initialization failed, falling back to memory:', error);
        return new InMemoryVerificationStorage();
      }
    
    case 'local':
      try {
        return new LocalRedisVerificationStorage();
      } catch (error) {
        console.warn('LocalRedisVerificationStorage initialization failed, falling back to memory:', error);
        return new InMemoryVerificationStorage();
      }
    
    default:
      return new InMemoryVerificationStorage();
  }
}

/**
 * Create User Storage instance based on environment
 */
export function createUserStorage(config?: StorageConfig): IUserStorage {
  const provider = config?.provider || detectStorageProvider();
  
  switch (provider) {
    case 'upstash':
      try {
        return new UpstashUserStorage();
      } catch (error) {
        console.warn('UpstashUserStorage initialization failed, falling back to memory:', error);
        return new InMemoryUserStorage();
      }
    
    case 'local':
      try {
        return new LocalRedisUserStorage();
      } catch (error) {
        console.warn('LocalRedisUserStorage initialization failed, falling back to memory:', error);
        return new InMemoryUserStorage();
      }
    
    default:
      return new InMemoryUserStorage();
  }
}

/**
 * Create Audit Storage instance based on environment
 */
export function createAuditStorage(config?: StorageConfig): IAuditStorage {
  const provider = config?.provider || detectStorageProvider();
  
  switch (provider) {
    case 'upstash':
      try {
        return new UpstashAuditStorage();
      } catch (error) {
        console.warn('UpstashAuditStorage initialization failed, falling back to memory:', error);
        return new InMemoryAuditStorage();
      }
    
    case 'local':
      try {
        return new LocalRedisAuditStorage();
      } catch (error) {
        console.warn('LocalRedisAuditStorage initialization failed, falling back to memory:', error);
        return new InMemoryAuditStorage();
      }
    
    default:
      return new InMemoryAuditStorage();
  }
}

/**
 * Convenience function to create all storage instances
 */
export function createAllStorage(config?: StorageConfig) {
  return {
    registry: createRegistryStorage(config),
    verification: createVerificationStorage(config),
    user: createUserStorage(config),
    audit: createAuditStorage(config)
  };
}
