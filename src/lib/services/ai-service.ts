// AI Service - Business logic for AI operations and caching
// Uses unified storage interface for data persistence

import { IStorage, StorageResult, QueryOptions, isSuccessResult } from './storage/unified-storage';
import { createStorage, StorageConfig } from './storage/factory';

// =============================================================================
// AI DATA TYPES
// =============================================================================

export interface ModelState {
  id: string;
  provider: string;
  name: string;
  status: 'available' | 'unavailable' | 'rate_limited' | 'error';
  last_used: string;
  usage_count: number;
  error_count: number;
  average_response_time: number;
  cost_per_token: number;
  capabilities: string[];
  metadata: Record<string, any>;
}

export interface CachedResponse {
  id: string;
  prompt_hash: string;
  model_id: string;
  provider: string;
  prompt: string;
  response: string;
  tokens_used: number;
  cost: number;
  created_at: string;
  expires_at: string;
  metadata: Record<string, any>;
}

export interface ProviderStats {
  provider: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_tokens: number;
  total_cost: number;
  average_response_time: number;
  last_request: string;
  models: string[];
  rate_limit_hits: number;
}

export interface AIUsageMetrics {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  requests_by_provider: Record<string, number>;
  tokens_by_provider: Record<string, number>;
  cost_by_provider: Record<string, number>;
  cache_hit_rate: number;
  average_response_time: number;
  top_models: Array<{ model: string; usage_count: number }>;
}

/**
 * AI Service
 * Handles all business logic for AI operations, model management, and caching
 * Storage-agnostic through the unified storage interface
 */
export class AIService {
  private storage: IStorage;
  private readonly MODELS_COLLECTION = 'ai_models';
  private readonly CACHE_COLLECTION = 'ai_cache';
  private readonly STATS_COLLECTION = 'ai_stats';

  constructor() {
    this.storage = createStorage();
  }

  // ==========================================================================
  // MODEL MANAGEMENT
  // ==========================================================================

  /**
   * Register or update a model
   */
  async registerModel(modelData: Omit<ModelState, 'id' | 'last_used' | 'usage_count' | 'error_count'>): Promise<ModelState> {
    const now = new Date().toISOString();
    const model: ModelState = {
      id: `${modelData.provider}:${modelData.name}`,
      ...modelData,
      last_used: now,
      usage_count: 0,
      error_count: 0
    };

    const result = await this.storage.set(this.MODELS_COLLECTION, model.id, model);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to register model: ${result.error}`);
    }

    return model;
  }

  /**
   * Get a model by ID
   */
  async getModel(modelId: string): Promise<ModelState | null> {
    const result = await this.storage.get<ModelState>(this.MODELS_COLLECTION, modelId);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get model: ${result.error}`);
    }

    return result.data;
  }

  /**
   * Get all models for a provider
   */
  async getModelsByProvider(provider: string): Promise<ModelState[]> {
    const queryOptions: QueryOptions = {
      filters: { provider }
    };

    const result = await this.storage.query<ModelState>(this.MODELS_COLLECTION, queryOptions);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get models by provider: ${result.error}`);
    }

    return result.data.items;
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<ModelState[]> {
    const queryOptions: QueryOptions = {
      filters: { status: 'available' }
    };

    const result = await this.storage.query<ModelState>(this.MODELS_COLLECTION, queryOptions);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get available models: ${result.error}`);
    }

    return result.data.items;
  }

  /**
   * Update model usage statistics
   */
  async updateModelUsage(
    modelId: string, 
    responseTime: number, 
    success: boolean,
    tokensUsed?: number,
    cost?: number
  ): Promise<void> {
    const model = await this.getModel(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const updatedModel: ModelState = {
      ...model,
      last_used: new Date().toISOString(),
      usage_count: model.usage_count + 1,
      error_count: success ? model.error_count : model.error_count + 1,
      average_response_time: (model.average_response_time * model.usage_count + responseTime) / (model.usage_count + 1),
      status: success ? 'available' : 'error'
    };

    const result = await this.storage.set(this.MODELS_COLLECTION, modelId, updatedModel);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to update model usage: ${result.error}`);
    }

    // Update provider stats
    if (tokensUsed && cost) {
      await this.updateProviderStats(model.provider, success, tokensUsed, cost, responseTime);
    }
  }

  // ==========================================================================
  // RESPONSE CACHING
  // ==========================================================================

  /**
   * Cache an AI response
   */
  async cacheResponse(
    promptHash: string,
    modelId: string,
    provider: string,
    prompt: string,
    response: string,
    tokensUsed: number,
    cost: number,
    ttlHours: number = 24
  ): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

    const cachedResponse: CachedResponse = {
      id: `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      prompt_hash: promptHash,
      model_id: modelId,
      provider,
      prompt,
      response,
      tokens_used: tokensUsed,
      cost,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      metadata: {}
    };

    const result = await this.storage.set(this.CACHE_COLLECTION, promptHash, cachedResponse);
    
    if (!isSuccessResult(result)) {
      console.warn(`Failed to cache response: ${result.error}`);
    }
  }

  /**
   * Get cached response
   */
  async getCachedResponse(promptHash: string): Promise<CachedResponse | null> {
    const result = await this.storage.get<CachedResponse>(this.CACHE_COLLECTION, promptHash);
    
    if (!isSuccessResult(result)) {
      return null;
    }

    const cached = result.data;
    if (!cached) {
      return null;
    }

    // Check if expired
    if (new Date(cached.expires_at) < new Date()) {
      // Clean up expired cache entry
      await this.storage.delete(this.CACHE_COLLECTION, promptHash);
      return null;
    }

    return cached;
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache(): Promise<number> {
    const allResult = await this.storage.getAll<CachedResponse>(this.CACHE_COLLECTION);
    
    if (!isSuccessResult(allResult)) {
      throw new Error(`Failed to get cached responses: ${allResult.error}`);
    }

    const now = new Date();
    const expiredEntries = allResult.data.items.filter(entry => 
      new Date(entry.expires_at) < now
    );

    if (expiredEntries.length === 0) {
      return 0;
    }

    const expiredKeys = expiredEntries.map(entry => entry.prompt_hash);
    const deleteResult = await this.storage.deleteBatch(this.CACHE_COLLECTION, expiredKeys);
    
    if (!isSuccessResult(deleteResult)) {
      throw new Error(`Failed to delete expired cache entries: ${deleteResult.error}`);
    }

    return deleteResult.data.successful.length;
  }

  // ==========================================================================
  // PROVIDER STATISTICS
  // ==========================================================================

  /**
   * Update provider statistics
   */
  async updateProviderStats(
    provider: string,
    success: boolean,
    tokensUsed: number,
    cost: number,
    responseTime: number
  ): Promise<void> {
    const existing = await this.getProviderStats(provider);
    
    const stats: ProviderStats = existing || {
      provider,
      total_requests: 0,
      successful_requests: 0,
      failed_requests: 0,
      total_tokens: 0,
      total_cost: 0,
      average_response_time: 0,
      last_request: new Date().toISOString(),
      models: [],
      rate_limit_hits: 0
    };

    const newTotalRequests = stats.total_requests + 1;
    const newAverageResponseTime = (stats.average_response_time * stats.total_requests + responseTime) / newTotalRequests;

    const updatedStats: ProviderStats = {
      ...stats,
      total_requests: newTotalRequests,
      successful_requests: success ? stats.successful_requests + 1 : stats.successful_requests,
      failed_requests: success ? stats.failed_requests : stats.failed_requests + 1,
      total_tokens: stats.total_tokens + tokensUsed,
      total_cost: stats.total_cost + cost,
      average_response_time: newAverageResponseTime,
      last_request: new Date().toISOString()
    };

    const result = await this.storage.set(this.STATS_COLLECTION, provider, updatedStats);
    
    if (!isSuccessResult(result)) {
      console.warn(`Failed to update provider stats: ${result.error}`);
    }
  }

  /**
   * Get provider statistics
   */
  async getProviderStats(provider: string): Promise<ProviderStats | null> {
    const result = await this.storage.get<ProviderStats>(this.STATS_COLLECTION, provider);
    
    if (!isSuccessResult(result)) {
      return null;
    }

    return result.data;
  }

  /**
   * Get all provider statistics
   */
  async getAllProviderStats(): Promise<ProviderStats[]> {
    const result = await this.storage.getAll<ProviderStats>(this.STATS_COLLECTION);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get provider stats: ${result.error}`);
    }

    return result.data.items;
  }

  // ==========================================================================
  // USAGE METRICS & ANALYTICS
  // ==========================================================================

  /**
   * Get comprehensive AI usage metrics
   */
  async getUsageMetrics(): Promise<AIUsageMetrics> {
    const [allStats, allCache] = await Promise.all([
      this.getAllProviderStats(),
      this.storage.getAll<CachedResponse>(this.CACHE_COLLECTION)
    ]);

    if (!isSuccessResult(allCache)) {
      throw new Error(`Failed to get cache data: ${allCache.error}`);
    }

    const totalRequests = allStats.reduce((sum, stat) => sum + stat.total_requests, 0);
    const totalTokens = allStats.reduce((sum, stat) => sum + stat.total_tokens, 0);
    const totalCost = allStats.reduce((sum, stat) => sum + stat.total_cost, 0);

    const requestsByProvider: Record<string, number> = {};
    const tokensByProvider: Record<string, number> = {};
    const costByProvider: Record<string, number> = {};

    for (const stat of allStats) {
      requestsByProvider[stat.provider] = stat.total_requests;
      tokensByProvider[stat.provider] = stat.total_tokens;
      costByProvider[stat.provider] = stat.total_cost;
    }

    // Calculate cache hit rate
    const cacheEntries = allCache.data.items.length;
    const cacheHitRate = totalRequests > 0 ? (cacheEntries / totalRequests) * 100 : 0;

    // Calculate average response time
    const totalResponseTime = allStats.reduce((sum, stat) => 
      sum + (stat.average_response_time * stat.total_requests), 0
    );
    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;

    // Get top models
    const allModels = await this.storage.getAll<ModelState>(this.MODELS_COLLECTION);
    const topModels = isSuccessResult(allModels) 
      ? allModels.data.items
          .sort((a, b) => b.usage_count - a.usage_count)
          .slice(0, 10)
          .map(model => ({ model: model.name, usage_count: model.usage_count }))
      : [];

    return {
      total_requests: totalRequests,
      total_tokens: totalTokens,
      total_cost: totalCost,
      requests_by_provider: requestsByProvider,
      tokens_by_provider: tokensByProvider,
      cost_by_provider: costByProvider,
      cache_hit_rate: cacheHitRate,
      average_response_time: averageResponseTime,
      top_models: topModels
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const result = await this.storage.healthCheck();
      return {
        healthy: result.healthy,
        details: result
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: String(error) }
      };
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Generate a hash for prompt caching
   */
  generatePromptHash(prompt: string, modelId: string, parameters?: Record<string, any>): string {
    const content = JSON.stringify({ prompt, modelId, parameters });
    // Simple hash function - in production you might want to use crypto
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Reset all AI data (useful for testing)
   */
  async resetAllData(): Promise<void> {
    const collections = [this.MODELS_COLLECTION, this.CACHE_COLLECTION, this.STATS_COLLECTION];
    
    for (const collection of collections) {
      const allResult = await this.storage.getAll(collection);
      if (isSuccessResult(allResult) && allResult.data.items.length > 0) {
        const keys = allResult.data.items.map((_, index) => `item_${index}`);
        await this.storage.deleteBatch(collection, keys);
      }
    }
  }
}
