// Together AI Provider - fetches models dynamically from API with storage integration

import { Provider, QueryRequest } from './Provider';
import { Model, ModelMetadata } from './Model';
import { AIService } from '../ai-service';

export class TogetherProvider extends Provider {
  readonly name = 'together';

  constructor(aiService?: AIService) {
    super(aiService);
  }

  isAvailable(): boolean {
    return !!process.env.TOGETHER_API_KEY;
  }

  async fetchModels(): Promise<ModelMetadata[]> {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      throw new Error('TOGETHER_API_KEY not found');
    }

    const response = await fetch('https://api.together.xyz/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Together API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from Together API');
    }

    // Top 5 elite free models only - confirmed highest parameter counts
    const TOP_FREE_MODELS = [
      'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',  // 70B - Latest Llama
      'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free', // 70B - Reasoning model
      'lgai/exaone-3-5-32b-instruct',                   // 32B - High quality
      'lgai/exaone-deep-32b',                           // 32B - Deep variant
      'togethercomputer/MoA-1'                          // 32B - Mixture of Agents
    ];

    // Filter and map models
    return data
      .filter((model: any) => {
        // Only include chat models
        if (model.type !== 'chat') return false;

        // Only include our curated top models
        if (!TOP_FREE_MODELS.includes(model.id)) return false;

        // Verify it's actually free
        const isFree = (!model.pricing?.input || parseFloat(model.pricing.input) === 0) &&
                       (!model.pricing?.output || parseFloat(model.pricing.output) === 0);

        return isFree;
      })
      .map((model: any) => ({
        id: model.id,
        name: model.display_name || model.id,
        provider: 'together',
        contextWindow: model.context_length || 32768,
        inputCost: this.parsePrice(model.pricing?.input) || 0,
        outputCost: this.parsePrice(model.pricing?.output) || 0,
        supportsJSON: true, // Together supports JSON mode
        supportsStreaming: true,
        maxTokens: Math.min(model.context_length || 32768, 4096) // Reasonable max for responses
      }));
  }

  async callAPI(model: Model, request: QueryRequest): Promise<{
    content: string;
    usage?: { promptTokens: number; completionTokens: number };
  }> {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      throw new Error('TOGETHER_API_KEY not found');
    }

    // Choose appropriate prompt based on phase
    const prompts = request.useRefinement && request.candidates
      ? this.promptBuilder.buildSlugSelectionPrompt(request.query, request.candidates)
      : this.buildIntentExtractionPrompt(request.query);

    const body: any = {
      model: model.id,
      messages: [
        {
          role: 'system',
          content: prompts.systemPrompt
        },
        {
          role: 'user',
          content: prompts.userPrompt
        }
      ],
      temperature: request.temperature || 0.1,
      max_tokens: request.maxTokens || 500
    };

    // Add JSON mode if model supports it
    if (model.metadata.supportsJSON) {
      body.response_format = {
        type: 'json_object'
      };
    }

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Together AI API error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Together AI');
    }

    return {
      content: data.choices[0].message.content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens
      } : undefined
    };
  }

  /**
   * Parse pricing to number (per 1M tokens)
   */
  private parsePrice(price?: string | number): number {
    if (!price) return 0;

    // If it's already a number, return it
    if (typeof price === 'number') return price;

    // If it's a string, parse it
    if (typeof price === 'string') {
      // Price format is usually like "$0.0002" or "0.0002"
      const match = price.match(/([0-9.]+)/);
      if (!match) return 0;

      const parsedPrice = parseFloat(match[1]);

      // Convert to per 1M tokens if needed
      // Together API usually returns per 1K tokens, so multiply by 1000
      return parsedPrice * 1000;
    }

    return 0;
  }

  /**
   * Build intent extraction prompt for basic capability analysis
   */
  private buildIntentExtractionPrompt(query: string): { systemPrompt: string; userPrompt: string } {
    const systemPrompt = `You are an expert at analyzing user queries for MCP server discovery. Extract structured information about what capabilities the user needs.

Respond with valid JSON only.`;

    const userPrompt = `Analyze this query for MCP server discovery: "${query}"

Extract:
1. capabilities: Array of specific MCP capabilities needed (e.g., ["email_send", "calendar_create"])
2. similar_to: Domain name if user wants something similar to an existing service
3. constraints: Object with any performance/technical requirements
4. intent: Clarified intent description
5. confidence: Confidence score 0-1

Common capabilities:
- email: email_send, email_read, email_compose
- calendar: calendar_create, calendar_read, calendar_update, scheduling
- files: file_read, file_write, file_upload, storage
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

    return { systemPrompt, userPrompt };
  }
}
