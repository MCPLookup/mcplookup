// AI Storage - Persistent model states, success rates, and response caching
// Integrates with existing storage architecture

import {
  StorageResult,
  PaginatedResult,
  HealthCheckResult,
  createSuccessResult,
  createErrorResult,
  createHealthCheckResult,
  IBaseStorage
} from './interfaces.js';

// =============================================================================
// AI STORAGE TYPES
// =============================================================================

export interface ModelState {
  id: string;
  provider: string;
  lastSuccess?: number;
  lastFailure?: number;
  failureCount: number;
  enabled: boolean;
  averageLatency?: number;
  successCount: number;
  totalAttempts: number;
  lastUsed?: number;
}

export interface CachedResponse {
  query: string;
  response: any;
  timestamp: number;
  provider: string;
  model: string;
  cost: number;
  latency: number;
}

export interface ProviderStats {
  provider: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  totalCost: number;
  lastUsed?: number;
}

// =============================================================================
// AI STORAGE INTERFACE
// =============================================================================

export interface IAIStorage extends IBaseStorage {
  // Model state management
  getModelState(modelId: string): Promise<StorageResult<ModelState | null>>;
  setModelState(modelId: string, state: ModelState): Promise<StorageResult<void>>;
  getAllModelStates(): Promise<StorageResult<ModelState[]>>;
  resetModelState(modelId: string): Promise<StorageResult<void>>;
  resetAllModelStates(): Promise<StorageResult<void>>;

  // Response caching
  getCachedResponse(queryHash: string): Promise<StorageResult<CachedResponse | null>>;
  setCachedResponse(queryHash: string, response: CachedResponse): Promise<StorageResult<void>>;
  clearExpiredCache(maxAge: number): Promise<StorageResult<number>>;
  clearAllCache(): Promise<StorageResult<void>>;

  // Provider statistics
  getProviderStats(provider: string): Promise<StorageResult<ProviderStats | null>>;
  updateProviderStats(provider: string, stats: Partial<ProviderStats>): Promise<StorageResult<void>>;
  getAllProviderStats(): Promise<StorageResult<ProviderStats[]>>;

  // Health and maintenance
  healthCheck(): Promise<HealthCheckResult>;
  getStorageStats(): Promise<StorageResult<{
    totalModels: number;
    enabledModels: number;
    cachedResponses: number;
    totalProviders: number;
  }>>;
}

// =============================================================================
// IN-MEMORY AI STORAGE (for development/testing)
// =============================================================================

export class InMemoryAIStorage implements IAIStorage {
  private modelStates = new Map<string, ModelState>();
  private cachedResponses = new Map<string, CachedResponse>();
  private providerStats = new Map<string, ProviderStats>();

  getProviderInfo() {
    return {
      name: 'InMemoryAIStorage',
      version: '1.0.0',
      capabilities: ['model_states', 'response_caching', 'provider_stats']
    };
  }

  // Model state management
  async getModelState(modelId: string): Promise<StorageResult<ModelState | null>> {
    try {
      const state = this.modelStates.get(modelId) || null;
      return createSuccessResult(state);
    } catch (error) {
      return createErrorResult(`Failed to get model state: ${error}`, 'GET_ERROR');
    }
  }

  async setModelState(modelId: string, state: ModelState): Promise<StorageResult<void>> {
    try {
      this.modelStates.set(modelId, { ...state, lastUsed: Date.now() });
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to set model state: ${error}`, 'SET_ERROR');
    }
  }

  async getAllModelStates(): Promise<StorageResult<ModelState[]>> {
    try {
      const states = Array.from(this.modelStates.values());
      return createSuccessResult(states);
    } catch (error) {
      return createErrorResult(`Failed to get all model states: ${error}`, 'GET_ERROR');
    }
  }

  async resetModelState(modelId: string): Promise<StorageResult<void>> {
    try {
      const existing = this.modelStates.get(modelId);
      if (existing) {
        this.modelStates.set(modelId, {
          ...existing,
          lastSuccess: undefined,
          lastFailure: undefined,
          failureCount: 0,
          enabled: true,
          averageLatency: undefined,
          successCount: 0,
          totalAttempts: 0
        });
      }
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to reset model state: ${error}`, 'RESET_ERROR');
    }
  }

  async resetAllModelStates(): Promise<StorageResult<void>> {
    try {
      for (const [modelId] of this.modelStates) {
        await this.resetModelState(modelId);
      }
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to reset all model states: ${error}`, 'RESET_ERROR');
    }
  }

  // Response caching
  async getCachedResponse(queryHash: string): Promise<StorageResult<CachedResponse | null>> {
    try {
      const cached = this.cachedResponses.get(queryHash) || null;
      return createSuccessResult(cached);
    } catch (error) {
      return createErrorResult(`Failed to get cached response: ${error}`, 'GET_ERROR');
    }
  }

  async setCachedResponse(queryHash: string, response: CachedResponse): Promise<StorageResult<void>> {
    try {
      this.cachedResponses.set(queryHash, response);
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to set cached response: ${error}`, 'SET_ERROR');
    }
  }

  async clearExpiredCache(maxAge: number): Promise<StorageResult<number>> {
    try {
      const now = Date.now();
      let cleared = 0;
      
      for (const [key, response] of this.cachedResponses) {
        if (now - response.timestamp > maxAge) {
          this.cachedResponses.delete(key);
          cleared++;
        }
      }
      
      return createSuccessResult(cleared);
    } catch (error) {
      return createErrorResult(`Failed to clear expired cache: ${error}`, 'CLEAR_ERROR');
    }
  }

  async clearAllCache(): Promise<StorageResult<void>> {
    try {
      this.cachedResponses.clear();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to clear all cache: ${error}`, 'CLEAR_ERROR');
    }
  }

  // Provider statistics
  async getProviderStats(provider: string): Promise<StorageResult<ProviderStats | null>> {
    try {
      const stats = this.providerStats.get(provider) || null;
      return createSuccessResult(stats);
    } catch (error) {
      return createErrorResult(`Failed to get provider stats: ${error}`, 'GET_ERROR');
    }
  }

  async updateProviderStats(provider: string, updates: Partial<ProviderStats>): Promise<StorageResult<void>> {
    try {
      const existing = this.providerStats.get(provider) || {
        provider,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLatency: 0,
        totalCost: 0
      };

      const updated = { ...existing, ...updates, lastUsed: Date.now() };
      this.providerStats.set(provider, updated);
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to update provider stats: ${error}`, 'UPDATE_ERROR');
    }
  }

  async getAllProviderStats(): Promise<StorageResult<ProviderStats[]>> {
    try {
      const stats = Array.from(this.providerStats.values());
      return createSuccessResult(stats);
    } catch (error) {
      return createErrorResult(`Failed to get all provider stats: ${error}`, 'GET_ERROR');
    }
  }

  // Health and maintenance
  async healthCheck(): Promise<HealthCheckResult> {
    return createHealthCheckResult(true, 'InMemoryAIStorage is healthy', {
      modelStates: this.modelStates.size,
      cachedResponses: this.cachedResponses.size,
      providerStats: this.providerStats.size
    });
  }

  async getStorageStats(): Promise<StorageResult<{
    totalModels: number;
    enabledModels: number;
    cachedResponses: number;
    totalProviders: number;
  }>> {
    try {
      const enabledModels = Array.from(this.modelStates.values()).filter(s => s.enabled).length;
      
      return createSuccessResult({
        totalModels: this.modelStates.size,
        enabledModels,
        cachedResponses: this.cachedResponses.size,
        totalProviders: this.providerStats.size
      });
    } catch (error) {
      return createErrorResult(`Failed to get storage stats: ${error}`, 'STATS_ERROR');
    }
  }
}

// =============================================================================
// STORAGE FACTORY
// =============================================================================

/**
 * Get AI storage based on environment
 */
export function getAIStorage(config?: { provider?: 'upstash' | 'local' | 'memory' }): IAIStorage {
  const provider = config?.provider || detectStorageProvider();

  switch (provider) {
    case 'upstash':
      // TODO: Implement UpstashAIStorage
      console.warn('UpstashAIStorage not implemented yet, falling back to memory');
      return new InMemoryAIStorage();
    case 'local':
      // TODO: Implement LocalRedisAIStorage
      console.warn('LocalRedisAIStorage not implemented yet, falling back to memory');
      return new InMemoryAIStorage();
    case 'memory':
      return new InMemoryAIStorage();
    default:
      return new InMemoryAIStorage();
  }
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
