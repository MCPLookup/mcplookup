// Together AI Provider - fetches models dynamically from API with storage integration

import { Provider, QueryRequest } from './Provider.js';
import { Model, ModelMetadata } from './Model.js';
import type { IAIStorage } from '../storage/ai-storage.js';

export class TogetherProvider extends Provider {
  readonly name = 'together';

  constructor(storage?: IAIStorage) {
    super(storage);
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
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from Together API');
    }

    // Filter and map models
    return data.data
      .filter(model => {
        // Only include chat/instruct models
        return model.type === 'chat' && 
               model.id.includes('instruct') &&
               !model.id.includes('vision') && // Skip vision models for now
               !model.id.includes('code'); // Skip code-specific models for now
      })
      .map(model => ({
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
      ? this.promptBuilder.buildRefinementPrompt(request.query, request.candidates)
      : this.promptBuilder.buildKeywordExtractionPrompt(request.query);

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
   * Parse pricing string to number (per 1M tokens)
   */
  private parsePrice(priceStr?: string): number {
    if (!priceStr) return 0;
    
    // Price format is usually like "$0.0002" or "0.0002"
    const match = priceStr.match(/([0-9.]+)/);
    if (!match) return 0;
    
    const price = parseFloat(match[1]);
    
    // Convert to per 1M tokens if needed
    // Together API usually returns per 1K tokens, so multiply by 1000
    return price * 1000;
  }
}
