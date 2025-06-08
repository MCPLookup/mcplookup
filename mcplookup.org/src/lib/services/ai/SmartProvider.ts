// Smart AI Provider - Orchestrates multiple providers with fallback to problematic models
// Phase 1: Try healthy models, Phase 2: Try problematic models as last resort

import { Provider, AIResponse } from './Provider';
import { Model } from './Model';
import { TogetherProvider } from './TogetherProvider';
import { OpenRouterProvider } from './OpenRouterProvider';
import { AIService } from '../ai-service';
import { createHash } from 'crypto';

export class SmartProvider {
  private providers: Provider[] = [];
  private aiService: AIService;
  private lastSuccessfulModel?: string;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(aiService?: AIService) {
    this.aiService = aiService || new AIService();
    this.initializeProviders();
  }

  /**
   * Process query with three-step approach: keywords → search → AI narrowing
   */
  async processQuery(query: string, searchFunction?: (keywords: string[]) => Promise<any[]>): Promise<{
    selectedSlugs: string[];
    reasoning: string;
    confidence: number;
  }> {
    // Check cache first
    const cached = await this.getCachedResponse(query);
    if (cached) {
      console.log(`Cache hit for query: "${query.substring(0, 50)}..."`);
      return cached;
    }

    console.log(`🔍 Three-step AI processing for: "${query}"`);

    // Step 1: Extract clean keywords for search
    const promptBuilder = new (await import('./PromptBuilder')).PromptBuilder();
    const keywords = promptBuilder.extractSearchKeywords(query);
    console.log(`📝 Extracted keywords: ${keywords.join(', ')}`);

    // Step 2: Do keyword search
    if (!searchFunction) {
      throw new Error('Search function is required for AI processing');
    }

    const searchResults = await searchFunction(keywords);
    console.log(`🔎 Found ${searchResults.length} search results`);

    if (searchResults.length === 0) {
      return {
        selectedSlugs: [],
        reasoning: 'No search results found for the given keywords',
        confidence: 0.1
      };
    }

    // Step 3: AI narrows down to 5-10 relevant slugs
    console.log(`🧠 AI narrowing down ${searchResults.length} results...`);
    const aiResult = await this.aiNarrowingPhase(query, searchResults);

    // Cache the result
    await this.cacheResponse(query, aiResult);

    return aiResult;
  }

  /**
   * Step 3: AI narrows down search results to relevant slugs
   */
  private async aiNarrowingPhase(query: string, searchResults: any[]): Promise<{
    selectedSlugs: string[];
    reasoning: string;
    confidence: number;
  }> {
    const allModels = await this.getAllModels();
    const healthyModels = allModels.filter(model => model.isHealthy);
    const problematicModels = allModels.filter(model => !model.isHealthy);

    if (allModels.length === 0) {
      throw new Error('No AI models available. Please configure TOGETHER_API_KEY or OPENROUTER_API_KEY');
    }

    let lastError: Error | null = null;

    // Try healthy models first
    if (healthyModels.length > 0) {
      console.log(`🎯 AI narrowing with ${healthyModels.length} healthy models`);
      const sortedHealthyModels = await this.sortModelsByPriority(healthyModels);

      const result = await this.tryModelsForNarrowing(sortedHealthyModels, query, searchResults, false);
      if (result.success) return result.response!;
      lastError = result.lastError || null;
    }

    // Try problematic models as last resort
    if (problematicModels.length > 0) {
      console.log(`🆘 AI narrowing with ${problematicModels.length} problematic models`);
      const sortedProblematicModels = await this.sortModelsByPriority(problematicModels);

      const result = await this.tryModelsForNarrowing(sortedProblematicModels, query, searchResults, true);
      if (result.success) return result.response!;
      lastError = result.lastError || lastError || null;
    }

    throw new Error(`AI narrowing failed with all models. Last error: ${lastError?.message}`);
  }

  /**
   * Try models for AI narrowing (returns slug selection result)
   */
  private async tryModelsForNarrowing(models: Model[], query: string, searchResults: any[], isLastResort = false): Promise<{
    success: boolean;
    response?: { selectedSlugs: string[]; reasoning: string; confidence: number };
    lastError?: Error;
  }> {
    let lastError: Error | null = null;

    for (const model of models) {
      const provider = this.getProviderForModel(model);
      if (!provider) continue;

      try {
        const prefix = isLastResort ? '🆘 Last resort' : '🎯 Trying';
        const healthStatus = model.isHealthy ? 'healthy' : `unhealthy (${model.state.failureCount} failures)`;
        console.log(`${prefix} AI narrowing: ${model.provider}/${model.name} (${model.isFree ? 'FREE' : `$${model.estimatedCostPerQuery.toFixed(6)}`}) [${healthStatus}]`);

        // Use the provider's processQuery method which handles parsing
        const response = await provider.processQuery(model, query, searchResults);

        // Extract the analysis from the response
        const analysis = {
          selectedSlugs: response.selectedServers?.map(s => s.domain) || [],
          reasoning: response.selectedServers?.map(s => s.reasoning).join('; ') || 'AI processing completed',
          confidence: response.confidence || 0.8
        };

        // Record success (latency already recorded by provider)
        // model.recordSuccess is already called by provider.processQuery
        this.lastSuccessfulModel = model.id;

        const successPrefix = isLastResort ? '🎉 Last resort SUCCESS' : '✅ Success';
        console.log(`${successPrefix} AI narrowing with ${model.provider}/${model.name}`);

        return {
          success: true,
          response: {
            selectedSlugs: analysis.selectedSlugs || [],
            reasoning: analysis.reasoning || 'AI selected relevant servers',
            confidence: analysis.confidence || 0.8
          }
        };

      } catch (error) {
        // Record failure
        model.recordFailure();
        const failPrefix = isLastResort ? '💥 Last resort failed' : '❌';
        console.warn(`${failPrefix}: ${model.provider}/${model.name} - ${error instanceof Error ? error.message : String(error)}`);
        lastError = error as Error;
        continue;
      }
    }

    return { success: false, lastError: lastError || undefined };
  }

  async getAllModels(): Promise<Model[]> {
    const allModels: Model[] = [];
    for (const provider of this.providers) {
      if (!provider.isAvailable()) continue;
      try {
        const models = await provider.getModels();
        allModels.push(...models);
      } catch (error) {
        console.warn(`Failed to get models from ${provider.name}:`, error instanceof Error ? error.message : String(error));
      }
    }
    return allModels;
  }

  async getStats(): Promise<any> {
    const allModels = await this.getAllModels();
    const healthyModels = allModels.filter(model => model.isHealthy);
    const problematicModels = allModels.filter(model => !model.isHealthy);
    
    return {
      models: {
        total: allModels.length,
        healthy: healthyModels.length,
        problematic: problematicModels.length,
        problematicDetails: problematicModels.map(m => ({
          id: m.id,
          provider: m.provider,
          name: m.name,
          failureCount: m.state.failureCount,
          lastFailure: m.state.lastFailure
        }))
      }
    };
  }

  async resetProblematicModels(): Promise<number> {
    const allModels = await this.getAllModels();
    const problematicModels = allModels.filter(model => !model.isHealthy);
    
    for (const model of problematicModels) {
      model.reset();
    }
    
    console.log(`Reset ${problematicModels.length} problematic models`);
    return problematicModels.length;
  }

  private initializeProviders(): void {
    this.providers = [
      new TogetherProvider(this.aiService),
      new OpenRouterProvider(this.aiService)
    ];
  }

  private getProviderForModel(model: Model): Provider | undefined {
    return this.providers.find(provider => 
      provider.name === model.provider && provider.isAvailable()
    );
  }

  private async sortModelsByPriority(models: Model[]): Promise<Model[]> {
    return models.sort((a, b) => {
      if (this.lastSuccessfulModel) {
        if (a.id === this.lastSuccessfulModel) return -1;
        if (b.id === this.lastSuccessfulModel) return 1;
      }
      return a.priority - b.priority;
    });
  }

  private async cacheResponse(query: string, response: { selectedSlugs: string[]; reasoning: string; confidence: number }): Promise<void> {
    try {
      const queryHash = this.hashQuery(query);
      const cachedResponse = {
        query,
        response,
        timestamp: Date.now(),
        provider: 'smart-provider',
        model: 'multi-model',
        cost: 0,
        latency: 0
      };
      await this.aiService.cacheResponse(
        queryHash,
        'smart-provider',
        'multi-model',
        query,
        JSON.stringify(response),
        0, // tokens
        0, // cost
        24 // TTL hours
      );
    } catch (error) {
      console.warn('Failed to cache response:', error);
    }
  }

  private async getCachedResponse(query: string): Promise<{ selectedSlugs: string[]; reasoning: string; confidence: number } | null> {
    try {
      const queryHash = this.hashQuery(query);
      const cached = await this.aiService.getCachedResponse(queryHash);

      if (!cached) return null;

      const age = Date.now() - new Date(cached.created_at).getTime();

      if (age > this.CACHE_TTL) return null;

      return JSON.parse(cached.response);
    } catch (error) {
      console.warn('Failed to get cached response:', error);
      return null;
    }
  }

  private hashQuery(query: string): string {
    return createHash('sha256')
      .update(query.toLowerCase().trim())
      .digest('hex')
      .substring(0, 16);
  }
}
