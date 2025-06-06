// AI Storage Service - Persistent model states, success rates, and response caching
// Uses the unified storage architecture

import { IStorage } from './unified-storage';
import { createStorage } from './factory';
import {
  StorageResult,
  HealthCheckResult,
  createSuccessResult,
  createErrorResult,
  createHealthCheckResult
} from './unified-storage';

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

export interface AIConversation {
  id: string;
  sessionId: string;
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }[];
  metadata: {
    provider?: string;
    model?: string;
    totalCost?: number;
    createdAt: number;
    updatedAt: number;
  };
}

export interface QueryAnalysis {
  query: string;
  intent: string;
  capabilities: string[];
  confidence: number;
  similarTo?: string[];
  constraints?: any;
  timestamp: number;
  provider?: string;
  model?: string;
}

export interface AIResponse {
  query: string;
  response: any;
  provider: string;
  model: string;
  cost: number;
  latency: number;
  timestamp: number;
  confidence?: number;
  capabilities?: string[];
  metadata?: any;
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
// AI STORAGE SERVICE INTERFACE
// =============================================================================

export interface IAIStorageService {
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

  // Conversation management
  storeConversation(sessionId: string, conversation: AIConversation): Promise<StorageResult<void>>;
  getConversation(sessionId: string): Promise<StorageResult<AIConversation | null>>;
  deleteConversation(sessionId: string): Promise<StorageResult<void>>;

  // Query analysis
  storeAnalysis(query: string, analysis: QueryAnalysis): Promise<StorageResult<void>>;
  getAnalysis(query: string): Promise<StorageResult<QueryAnalysis | null>>;

  // AI Response storage
  storeResponse(query: string, response: AIResponse): Promise<StorageResult<void>>;
  getResponse(query: string): Promise<StorageResult<AIResponse | null>>;

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
// AI STORAGE SERVICE IMPLEMENTATION
// =============================================================================

export class AIStorageService implements IAIStorageService {
  private storage: IStorage;

  constructor(storage?: IStorage) {
    this.storage = storage || createStorage();
  }

  // Model state management
  async getModelState(modelId: string): Promise<StorageResult<ModelState | null>> {
    try {
      const result = await this.storage.get('ai_models', `model:${modelId}`);
      if (!result.success) {
        return result;
      }
      return createSuccessResult(result.data ? JSON.parse(result.data) : null);
    } catch (error) {
      return createErrorResult(`Failed to get model state: ${error}`, 'GET_ERROR');
    }
  }

  async setModelState(modelId: string, state: ModelState): Promise<StorageResult<void>> {
    try {
      const stateWithTimestamp = { ...state, lastUsed: Date.now() };
      const result = await this.storage.set(`ai:model:${modelId}`, JSON.stringify(stateWithTimestamp));
      return result;
    } catch (error) {
      return createErrorResult(`Failed to set model state: ${error}`, 'SET_ERROR');
    }
  }

  async getAllModelStates(): Promise<StorageResult<ModelState[]>> {
    try {
      const result = await this.storage.list({ prefix: 'ai:model:' });
      if (!result.success) {
        return result;
      }
      const states = result.data.map(item => JSON.parse(item.value) as ModelState);
      return createSuccessResult(states);
    } catch (error) {
      return createErrorResult(`Failed to get all model states: ${error}`, 'GET_ERROR');
    }
  }

  async resetModelState(modelId: string): Promise<StorageResult<void>> {
    try {
      const existingResult = await this.getModelState(modelId);
      if (!existingResult.success) {
        return existingResult;
      }

      if (existingResult.data) {
        const resetState = {
          ...existingResult.data,
          lastSuccess: undefined,
          lastFailure: undefined,
          failureCount: 0,
          enabled: true,
          averageLatency: undefined,
          successCount: 0,
          totalAttempts: 0
        };
        return await this.setModelState(modelId, resetState);
      }
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to reset model state: ${error}`, 'RESET_ERROR');
    }
  }

  async resetAllModelStates(): Promise<StorageResult<void>> {
    try {
      const allStatesResult = await this.getAllModelStates();
      if (!allStatesResult.success) {
        return allStatesResult;
      }

      for (const state of allStatesResult.data) {
        await this.resetModelState(state.id);
      }
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to reset all model states: ${error}`, 'RESET_ERROR');
    }
  }

  // Response caching
  async getCachedResponse(queryHash: string): Promise<StorageResult<CachedResponse | null>> {
    try {
      const result = await this.storage.get(`ai:cache:${queryHash}`);
      if (!result.success) {
        return result;
      }
      return createSuccessResult(result.data ? JSON.parse(result.data) : null);
    } catch (error) {
      return createErrorResult(`Failed to get cached response: ${error}`, 'GET_ERROR');
    }
  }

  async setCachedResponse(queryHash: string, response: CachedResponse): Promise<StorageResult<void>> {
    try {
      // Set with 1 hour TTL for cache
      const result = await this.storage.set(`ai:cache:${queryHash}`, JSON.stringify(response), { ttl: 3600 });
      return result;
    } catch (error) {
      return createErrorResult(`Failed to set cached response: ${error}`, 'SET_ERROR');
    }
  }

  async clearExpiredCache(maxAge: number): Promise<StorageResult<number>> {
    try {
      const result = await this.storage.list({ prefix: 'ai:cache:' });
      if (!result.success) {
        return result;
      }

      const now = Date.now();
      let cleared = 0;

      for (const item of result.data) {
        const response = JSON.parse(item.value) as CachedResponse;
        if (now - response.timestamp > maxAge) {
          await this.storage.delete(item.key);
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
      const result = await this.storage.list({ prefix: 'ai:cache:' });
      if (!result.success) {
        return result;
      }

      for (const item of result.data) {
        await this.storage.delete(item.key);
      }

      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to clear all cache: ${error}`, 'CLEAR_ERROR');
    }
  }

  // Provider statistics
  async getProviderStats(provider: string): Promise<StorageResult<ProviderStats | null>> {
    try {
      const result = await this.storage.get(`ai:stats:${provider}`);
      if (!result.success) {
        return result;
      }
      return createSuccessResult(result.data ? JSON.parse(result.data) : null);
    } catch (error) {
      return createErrorResult(`Failed to get provider stats: ${error}`, 'GET_ERROR');
    }
  }

  async updateProviderStats(provider: string, updates: Partial<ProviderStats>): Promise<StorageResult<void>> {
    try {
      const existingResult = await this.getProviderStats(provider);
      if (!existingResult.success) {
        return existingResult;
      }

      const existing = existingResult.data || {
        provider,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLatency: 0,
        totalCost: 0
      };

      const updated = { ...existing, ...updates, lastUsed: Date.now() };
      const result = await this.storage.set(`ai:stats:${provider}`, JSON.stringify(updated));
      return result;
    } catch (error) {
      return createErrorResult(`Failed to update provider stats: ${error}`, 'UPDATE_ERROR');
    }
  }

  async getAllProviderStats(): Promise<StorageResult<ProviderStats[]>> {
    try {
      const result = await this.storage.list({ prefix: 'ai:stats:' });
      if (!result.success) {
        return result;
      }
      const stats = result.data.map(item => JSON.parse(item.value) as ProviderStats);
      return createSuccessResult(stats);
    } catch (error) {
      return createErrorResult(`Failed to get all provider stats: ${error}`, 'GET_ERROR');
    }
  }

  // Health and maintenance
  async healthCheck(): Promise<HealthCheckResult> {
    try {
      const storageHealth = await this.storage.healthCheck();
      return createHealthCheckResult(storageHealth.healthy, 'AI Storage Service', {
        storage: storageHealth,
        provider: this.storage.getProviderInfo?.()?.name || 'Unknown'
      });
    } catch (error) {
      return createHealthCheckResult(false, 'AI Storage Service health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getStorageStats(): Promise<StorageResult<{
    totalModels: number;
    enabledModels: number;
    cachedResponses: number;
    totalProviders: number;
  }>> {
    try {
      const [modelsResult, cacheResult, statsResult] = await Promise.all([
        this.storage.list({ prefix: 'ai:model:' }),
        this.storage.list({ prefix: 'ai:cache:' }),
        this.storage.list({ prefix: 'ai:stats:' })
      ]);

      if (!modelsResult.success || !cacheResult.success || !statsResult.success) {
        return createErrorResult('Failed to get storage stats', 'STATS_ERROR');
      }

      let enabledModels = 0;
      for (const item of modelsResult.data) {
        const model = JSON.parse(item.value) as ModelState;
        if (model.enabled) {
          enabledModels++;
        }
      }

      return createSuccessResult({
        totalModels: modelsResult.data.length,
        enabledModels,
        cachedResponses: cacheResult.data.length,
        totalProviders: statsResult.data.length
      });
    } catch (error) {
      return createErrorResult(`Failed to get storage stats: ${error}`, 'STATS_ERROR');
    }
  }

  // Conversation management
  async storeConversation(sessionId: string, conversation: AIConversation): Promise<StorageResult<void>> {
    try {
      const result = await this.storage.set(`ai:conversation:${sessionId}`, JSON.stringify(conversation));
      return result;
    } catch (error) {
      return createErrorResult(`Failed to store conversation: ${error}`, 'STORE_ERROR');
    }
  }

  async getConversation(sessionId: string): Promise<StorageResult<AIConversation | null>> {
    try {
      const result = await this.storage.get(`ai:conversation:${sessionId}`);
      if (!result.success) {
        return result;
      }
      return createSuccessResult(result.data ? JSON.parse(result.data) : null);
    } catch (error) {
      return createErrorResult(`Failed to get conversation: ${error}`, 'GET_ERROR');
    }
  }

  async deleteConversation(sessionId: string): Promise<StorageResult<void>> {
    try {
      const result = await this.storage.delete(`ai:conversation:${sessionId}`);
      return result;
    } catch (error) {
      return createErrorResult(`Failed to delete conversation: ${error}`, 'DELETE_ERROR');
    }
  }

  // Query analysis
  async storeAnalysis(query: string, analysis: QueryAnalysis): Promise<StorageResult<void>> {
    try {
      const queryHash = Buffer.from(query).toString('base64');
      const result = await this.storage.set(`ai:analysis:${queryHash}`, JSON.stringify(analysis));
      return result;
    } catch (error) {
      return createErrorResult(`Failed to store analysis: ${error}`, 'STORE_ERROR');
    }
  }

  async getAnalysis(query: string): Promise<StorageResult<QueryAnalysis | null>> {
    try {
      const queryHash = Buffer.from(query).toString('base64');
      const result = await this.storage.get(`ai:analysis:${queryHash}`);
      if (!result.success) {
        return result;
      }
      return createSuccessResult(result.data ? JSON.parse(result.data) : null);
    } catch (error) {
      return createErrorResult(`Failed to get analysis: ${error}`, 'GET_ERROR');
    }
  }

  // AI Response storage
  async storeResponse(query: string, response: AIResponse): Promise<StorageResult<void>> {
    try {
      const queryHash = Buffer.from(query).toString('base64');
      const result = await this.storage.set(`ai:response:${queryHash}`, JSON.stringify(response));
      return result;
    } catch (error) {
      return createErrorResult(`Failed to store response: ${error}`, 'STORE_ERROR');
    }
  }

  async getResponse(query: string): Promise<StorageResult<AIResponse | null>> {
    try {
      const queryHash = Buffer.from(query).toString('base64');
      const result = await this.storage.get(`ai:response:${queryHash}`);
      if (!result.success) {
        return result;
      }
      return createSuccessResult(result.data ? JSON.parse(result.data) : null);
    } catch (error) {
      return createErrorResult(`Failed to get response: ${error}`, 'GET_ERROR');
    }
  }
}

/**
 * Create AI Storage Service
 * Factory function to create AI storage with the unified storage backend
 */
export function createAIStorage(storage?: IStorage): AIStorageService {
  return new AIStorageService(storage);
}
