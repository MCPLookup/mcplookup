// In-Memory Storage Provider
// Implements all storage interfaces using in-memory data structures
// Perfect for development, testing, and environments without external dependencies

import { BaseStorageProvider, StorageProviderConfig } from './base';
import { StorageResult } from '../interfaces';
import { 
  InMemoryRegistryStorage, 
  InMemoryVerificationStorage, 
  InMemoryUserStorage 
} from '../memory-storage';
import { InMemoryAuditStorage } from '../audit-storage';

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

  createRegistryStorage() {
    this.ensureInitialized();
    return new InMemoryRegistryStorage();
  }

  createVerificationStorage() {
    this.ensureInitialized();
    return new InMemoryVerificationStorage();
  }

  createUserStorage() {
    this.ensureInitialized();
    return new InMemoryUserStorage();
  }

  createAuditStorage() {
    this.ensureInitialized();
    return new InMemoryAuditStorage();
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
