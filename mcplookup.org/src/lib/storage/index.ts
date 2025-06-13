// Storage Service Factory
// Provides unified access to different storage backends

import { StorageService, StorageResult, createSuccessResult, createErrorResult } from './types';

// Simple in-memory storage implementation for fallback
class MemoryStorageService implements StorageService {
  private data: Map<string, Map<string, any>> = new Map();

  async get(collection: string, key: string): Promise<StorageResult> {
    try {
      const collectionData = this.data.get(collection);
      if (!collectionData || !collectionData.has(key)) {
        return createErrorResult('Key not found');
      }
      return createSuccessResult(collectionData.get(key));
    } catch (error) {
      return createErrorResult(String(error));
    }
  }

  async set(collection: string, key: string, value: any): Promise<StorageResult> {
    try {
      if (!this.data.has(collection)) {
        this.data.set(collection, new Map());
      }
      this.data.get(collection)!.set(key, value);
      return createSuccessResult(value);
    } catch (error) {
      return createErrorResult(String(error));
    }
  }

  async delete(collection: string, key: string): Promise<StorageResult> {
    try {
      const collectionData = this.data.get(collection);
      if (!collectionData) {
        return createErrorResult('Collection not found');
      }
      const deleted = collectionData.delete(key);
      return deleted ? createSuccessResult(true) : createErrorResult('Key not found');
    } catch (error) {
      return createErrorResult(String(error));
    }
  }

  async getAll(collection: string): Promise<StorageResult<any[]>> {
    try {
      const collectionData = this.data.get(collection);
      if (!collectionData) {
        return createSuccessResult([]);
      }
      return createSuccessResult(Array.from(collectionData.values()));
    } catch (error) {
      return createErrorResult(String(error));
    }
  }

  async getByPrefix(collection: string, prefix: string): Promise<StorageResult<any[]>> {
    try {
      const collectionData = this.data.get(collection);
      if (!collectionData) {
        return createSuccessResult([]);
      }
      
      const results: any[] = [];
      for (const [key, value] of collectionData.entries()) {
        if (key.startsWith(prefix)) {
          results.push(value);
        }
      }
      
      return createSuccessResult(results);
    } catch (error) {
      return createErrorResult(String(error));
    }
  }

  async healthCheck(): Promise<{ healthy: boolean; details?: any }> {
    return {
      healthy: true,
      details: {
        type: 'memory',
        collections: this.data.size,
        totalKeys: Array.from(this.data.values()).reduce((sum, collection) => sum + collection.size, 0)
      }
    };
  }
}

// Storage service singleton
let storageService: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!storageService) {
    // For now, use memory storage as fallback
    // In production, this would check environment variables and create appropriate storage
    storageService = new MemoryStorageService();
  }
  return storageService;
}

export function setStorageService(service: StorageService): void {
  storageService = service;
}

// Re-export types
export * from './types';
