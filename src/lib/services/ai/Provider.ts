// Provider abstraction - base class for AI providers with storage integration

import { Model, ModelMetadata } from './Model';
import { PromptBuilder, type MCPSearchResult } from './PromptBuilder';
import { AIService } from '../ai-service';

export interface AIResponse {
  capabilities: string[];
  similarTo?: string;
  constraints: any;
  intent: string;
  confidence: number;
  provider: string;
  model: string;
  cost: number;
  latency: number;
  selectedServers?: {
    domain: string;
    relevanceScore: number;
    reasoning: string;
  }[];
  searchSuggestions?: {
    additionalKeywords: string[];
    relatedCapabilities: string[];
  };
}

export interface QueryRequest {
  query: string;
  maxTokens?: number;
  temperature?: number;
  candidates?: MCPSearchResult[];
  useRefinement?: boolean;
}

export abstract class Provider {
  abstract readonly name: string;
  protected models: Model[] = [];
  protected modelsLastFetched?: number;
  protected readonly modelsCacheTTL = 60 * 60 * 1000; // 1 hour
  protected aiService?: AIService;
  protected promptBuilder: PromptBuilder;

  constructor(aiService?: AIService) {
    this.aiService = aiService;
    this.promptBuilder = new PromptBuilder();
  }

  /**
   * Check if provider is available (has API key)
   */
  abstract isAvailable(): boolean;

  /**
   * Fetch models from provider API
   */
  abstract fetchModels(): Promise<ModelMetadata[]>;

  /**
   * Make API call to process query
   */
  abstract callAPI(model: Model, request: QueryRequest): Promise<{
    content: string;
    usage?: { promptTokens: number; completionTokens: number };
  }>;

  /**
   * Get available models (cached with TTL, with persistent state)
   */
  async getModels(): Promise<Model[]> {
    const now = Date.now();
    
    // Return cached models if still fresh
    if (this.models.length > 0 && this.modelsLastFetched && 
        (now - this.modelsLastFetched) < this.modelsCacheTTL) {
      return this.models;
    }

    // Fetch fresh models
    try {
      const modelMetadata = await this.fetchModels();
      this.models = modelMetadata.map(metadata => new Model(metadata, this.aiService));
      
      // Load persistent state for each model
      await Promise.all(this.models.map(model => model.loadState()));
      
      this.modelsLastFetched = now;
      console.log(`Fetched ${this.models.length} models from ${this.name}`);
      
    } catch (error) {
      console.warn(`Failed to fetch models from ${this.name}:`, error instanceof Error ? error.message : String(error));
      // Return cached models if fetch fails
      if (this.models.length > 0) {
        console.log(`Using cached models for ${this.name}`);
        return this.models;
      }
      throw error;
    }

    return this.models;
  }

  /**
   * Process query with specific model (with two-phase approach)
   */
  async processQuery(model: Model, query: string, candidates?: MCPSearchResult[]): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const request: QueryRequest = {
        query,
        maxTokens: 500,
        temperature: 0.1,
        candidates,
        useRefinement: !!candidates
      };

      const response = await this.callAPI(model, request);
      const analysis = this.parseResponse(response.content);
      const latency = Date.now() - startTime;

      // Record success in model
      model.recordSuccess(latency);

      // Handle different response formats based on phase
      if (candidates) {
        // Phase 2: Refinement response
        return {
          capabilities: analysis.extractedIntent?.capabilities || [],
          similarTo: analysis.extractedIntent?.similar_to || analysis.extractedIntent?.similarTo,
          constraints: analysis.extractedIntent?.constraints || {},
          intent: analysis.extractedIntent?.intent || query,
          confidence: analysis.extractedIntent?.confidence || 0.8,
          selectedServers: analysis.selectedServers || [],
          searchSuggestions: analysis.searchSuggestions,
          provider: this.name,
          model: model.id,
          cost: model.estimatedCostPerQuery,
          latency
        };
      } else {
        // Phase 1: Keyword extraction response
        return {
          capabilities: analysis.capabilities || [],
          similarTo: analysis.similar_to,
          constraints: analysis.constraints || {},
          intent: analysis.intent || query,
          confidence: analysis.confidence || 0.8,
          provider: this.name,
          model: model.id,
          cost: model.estimatedCostPerQuery,
          latency
        };
      }
    } catch (error) {
      // Record failure in model
      model.recordFailure();
      throw new Error(`${this.name}/${model.id} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse AI response content
   */
  protected parseResponse(content: string): any {
    try {
      return JSON.parse(content);
    } catch (parseError) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          return this.manualParse(content);
        }
      }
      return this.manualParse(content);
    }
  }

  protected manualParse(content: string): any {
    const result: any = {
      capabilities: [],
      constraints: {},
      intent: content.substring(0, 100) + '...',
      confidence: 0.5
    };

    // Extract capabilities
    const capabilityPatterns = [
      /capabilities?[:\s]*\[([^\]]+)\]/gi,
      /capabilities?[:\s]*([a-z_,\s]+)/gi
    ];

    for (const pattern of capabilityPatterns) {
      const match = content.match(pattern);
      if (match) {
        const caps = match[1]
          .split(/[,\s]+/)
          .map(cap => cap.trim().replace(/['"]/g, ''))
          .filter(cap => cap.length > 0);
        result.capabilities = caps;
        break;
      }
    }

    return result;
  }

  protected buildSystemPrompt(): string {
    return 'You are an expert at analyzing natural language queries for MCP server discovery. Respond only with valid JSON matching the requested format.';
  }

  protected buildUserPrompt(query: string): string {
    return `Analyze this natural language query for MCP server discovery:

Query: "${query}"

Extract:
1. capabilities: Array of specific MCP capabilities needed
2. similar_to: Domain name if user wants something similar to an existing service
3. constraints: Object with performance/technical requirements
4. intent: Clarified intent description
5. confidence: Confidence score 0-1

Available capability categories:
- email: email_send, email_read, email_search
- calendar: calendar_create, calendar_read, scheduling
- files: file_read, file_write, file_storage, file_share
- collaboration: real_time_editing, document_sharing, team_collaboration
- communication: messaging, chat, video_calls
- development: repo_create, ci_cd, deployment, code_review

Example response:
{
  "capabilities": ["email_send", "calendar_create"],
  "similar_to": "gmail.com",
  "constraints": {
    "performance": {"max_response_time": 100},
    "technical": {"auth_types": ["oauth2"]}
  },
  "intent": "Find email servers with calendar integration similar to Gmail",
  "confidence": 0.9
}

Respond with valid JSON only:`;
  }

  async resetModels(): Promise<void> {
    if (this.aiService) {
      await this.aiService.resetAllData();
    }
    this.models.forEach(model => model.reset());
  }

  clearCache(): void {
    this.models = [];
    this.modelsLastFetched = undefined;
  }
}
