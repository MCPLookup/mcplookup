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

/**
 * Upstash Redis AI Storage
 * Production-ready AI storage using Upstash Redis
 */
class UpstashAIStorage implements IAIStorage {
  private redis: any;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      const { Redis } = await import('@upstash/redis');

      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        throw new Error('Upstash Redis environment variables not configured');
      }

      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } catch (error) {
      console.error('Failed to initialize Upstash Redis for AI storage:', error);
      throw error;
    }
  }

  private async ensureRedis() {
    if (!this.redis) {
      await this.initializeRedis();
    }
  }

  async storeConversation(sessionId: string, conversation: AIConversation): Promise<StorageResult<void>> {
    try {
      await this.ensureRedis();

      const conversationWithTimestamp = {
        ...conversation,
        updated_at: new Date().toISOString()
      };

      // Store conversation
      await this.redis.set(
        `conversation:${sessionId}`,
        JSON.stringify(conversationWithTimestamp),
        { ex: 24 * 60 * 60 } // 24 hour expiry
      );

      // Add to session index
      await this.redis.sadd('conversations:sessions', sessionId);

      return { success: true };
    } catch (error) {
      console.error('Failed to store conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getConversation(sessionId: string): Promise<StorageResult<AIConversation | null>> {
    try {
      await this.ensureRedis();

      const data = await this.redis.get(`conversation:${sessionId}`);
      if (!data) {
        return { success: true, data: null };
      }

      const conversation = typeof data === 'string' ? JSON.parse(data) : data;
      return { success: true, data: conversation as AIConversation };
    } catch (error) {
      console.error('Failed to get conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteConversation(sessionId: string): Promise<StorageResult<void>> {
    try {
      await this.ensureRedis();

      await this.redis.del(`conversation:${sessionId}`);
      await this.redis.srem('conversations:sessions', sessionId);

      return { success: true };
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async storeAnalysis(query: string, analysis: QueryAnalysis): Promise<StorageResult<void>> {
    try {
      await this.ensureRedis();

      const analysisWithTimestamp = {
        ...analysis,
        cached_at: new Date().toISOString()
      };

      // Create a hash of the query for the key
      const crypto = await import('crypto');
      const queryHash = crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('hex');

      // Store analysis with 1 hour expiry
      await this.redis.set(
        `analysis:${queryHash}`,
        JSON.stringify(analysisWithTimestamp),
        { ex: 60 * 60 } // 1 hour expiry
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to store analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getAnalysis(query: string): Promise<StorageResult<QueryAnalysis | null>> {
    try {
      await this.ensureRedis();

      const crypto = await import('crypto');
      const queryHash = crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('hex');

      const data = await this.redis.get(`analysis:${queryHash}`);
      if (!data) {
        return { success: true, data: null };
      }

      const analysis = typeof data === 'string' ? JSON.parse(data) : data;
      return { success: true, data: analysis as QueryAnalysis };
    } catch (error) {
      console.error('Failed to get analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async storeResponse(query: string, response: AIResponse): Promise<StorageResult<void>> {
    try {
      await this.ensureRedis();

      const responseWithTimestamp = {
        ...response,
        cached_at: new Date().toISOString()
      };

      const crypto = await import('crypto');
      const queryHash = crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('hex');

      // Store response with 30 minute expiry
      await this.redis.set(
        `response:${queryHash}`,
        JSON.stringify(responseWithTimestamp),
        { ex: 30 * 60 } // 30 minute expiry
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to store response:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getResponse(query: string): Promise<StorageResult<AIResponse | null>> {
    try {
      await this.ensureRedis();

      const crypto = await import('crypto');
      const queryHash = crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('hex');

      const data = await this.redis.get(`response:${queryHash}`);
      if (!data) {
        return { success: true, data: null };
      }

      const response = typeof data === 'string' ? JSON.parse(data) : data;
      return { success: true, data: response as AIResponse };
    } catch (error) {
      console.error('Failed to get response:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async cleanup(): Promise<StorageResult<{ removedCount: number }>> {
    try {
      await this.ensureRedis();

      // Get all conversation sessions
      const sessions = await this.redis.smembers('conversations:sessions') as string[];
      let removedCount = 0;

      // Check each conversation for expiry (older than 24 hours)
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);

      for (const sessionId of sessions) {
        const conversationResult = await this.getConversation(sessionId);
        if (conversationResult.success && conversationResult.data) {
          const conversation = conversationResult.data;
          const lastMessageTime = conversation.messages.length > 0
            ? new Date(conversation.messages[conversation.messages.length - 1].timestamp).getTime()
            : 0;

          if (lastMessageTime < cutoffTime) {
            await this.deleteConversation(sessionId);
            removedCount++;
          }
        }
      }

      return { success: true, data: { removedCount } };
    } catch (error) {
      console.error('Failed to cleanup AI storage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getProviderInfo() {
    return {
      name: 'upstash',
      version: '1.0.0',
      capabilities: ['persistence', 'global-replication', 'auto-scaling', 'production-ready']
    };
  }
}

/**
 * Local Redis AI Storage
 * For development with local Redis instance
 */
class LocalRedisAIStorage implements IAIStorage {
  private redis: any;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      const { Redis } = await import('ioredis');

      const redisUrl = process.env.REDIS_URL || process.env.LOCAL_REDIS_URL || 'redis://localhost:6379';
      this.redis = new Redis(redisUrl);
    } catch (error) {
      console.error('Failed to initialize local Redis for AI storage:', error);
      throw error;
    }
  }

  private async ensureRedis() {
    if (!this.redis) {
      await this.initializeRedis();
    }
  }

  // Implementation similar to UpstashAIStorage but using ioredis
  async storeConversation(sessionId: string, conversation: AIConversation): Promise<StorageResult<void>> {
    try {
      await this.ensureRedis();

      const conversationWithTimestamp = {
        ...conversation,
        updated_at: new Date().toISOString()
      };

      await this.redis.setex(
        `conversation:${sessionId}`,
        24 * 60 * 60, // 24 hour expiry
        JSON.stringify(conversationWithTimestamp)
      );

      await this.redis.sadd('conversations:sessions', sessionId);
      return { success: true };
    } catch (error) {
      console.error('Failed to store conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getConversation(sessionId: string): Promise<StorageResult<AIConversation | null>> {
    try {
      await this.ensureRedis();

      const data = await this.redis.get(`conversation:${sessionId}`);
      if (!data) {
        return { success: true, data: null };
      }

      const conversation = JSON.parse(data);
      return { success: true, data: conversation as AIConversation };
    } catch (error) {
      console.error('Failed to get conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteConversation(sessionId: string): Promise<StorageResult<void>> {
    try {
      await this.ensureRedis();

      await this.redis.del(`conversation:${sessionId}`);
      await this.redis.srem('conversations:sessions', sessionId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async storeAnalysis(query: string, analysis: QueryAnalysis): Promise<StorageResult<void>> {
    try {
      await this.ensureRedis();

      const crypto = await import('crypto');
      const queryHash = crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('hex');

      await this.redis.setex(
        `analysis:${queryHash}`,
        60 * 60, // 1 hour expiry
        JSON.stringify({ ...analysis, cached_at: new Date().toISOString() })
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to store analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getAnalysis(query: string): Promise<StorageResult<QueryAnalysis | null>> {
    try {
      await this.ensureRedis();

      const crypto = await import('crypto');
      const queryHash = crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('hex');

      const data = await this.redis.get(`analysis:${queryHash}`);
      if (!data) {
        return { success: true, data: null };
      }

      const analysis = JSON.parse(data);
      return { success: true, data: analysis as QueryAnalysis };
    } catch (error) {
      console.error('Failed to get analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async storeResponse(query: string, response: AIResponse): Promise<StorageResult<void>> {
    try {
      await this.ensureRedis();

      const crypto = await import('crypto');
      const queryHash = crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('hex');

      await this.redis.setex(
        `response:${queryHash}`,
        30 * 60, // 30 minute expiry
        JSON.stringify({ ...response, cached_at: new Date().toISOString() })
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to store response:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getResponse(query: string): Promise<StorageResult<AIResponse | null>> {
    try {
      await this.ensureRedis();

      const crypto = await import('crypto');
      const queryHash = crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('hex');

      const data = await this.redis.get(`response:${queryHash}`);
      if (!data) {
        return { success: true, data: null };
      }

      const response = JSON.parse(data);
      return { success: true, data: response as AIResponse };
    } catch (error) {
      console.error('Failed to get response:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async cleanup(): Promise<StorageResult<{ removedCount: number }>> {
    try {
      await this.ensureRedis();

      const sessions = await this.redis.smembers('conversations:sessions');
      let removedCount = 0;

      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);

      for (const sessionId of sessions) {
        const conversationResult = await this.getConversation(sessionId);
        if (conversationResult.success && conversationResult.data) {
          const conversation = conversationResult.data;
          const lastMessageTime = conversation.messages.length > 0
            ? new Date(conversation.messages[conversation.messages.length - 1].timestamp).getTime()
            : 0;

          if (lastMessageTime < cutoffTime) {
            await this.deleteConversation(sessionId);
            removedCount++;
          }
        }
      }

      return { success: true, data: { removedCount } };
    } catch (error) {
      console.error('Failed to cleanup AI storage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getProviderInfo() {
    return {
      name: 'local-redis',
      version: '1.0.0',
      capabilities: ['persistence', 'local-development']
    };
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
      try {
        return new UpstashAIStorage();
      } catch (error) {
        console.warn('UpstashAIStorage initialization failed, falling back to memory:', error);
        return new InMemoryAIStorage();
      }
    case 'local':
      try {
        return new LocalRedisAIStorage();
      } catch (error) {
        console.warn('LocalRedisAIStorage initialization failed, falling back to memory:', error);
        return new InMemoryAIStorage();
      }
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
