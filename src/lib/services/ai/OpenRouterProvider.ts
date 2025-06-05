// OpenRouter Provider - fetches models dynamically from API with storage integration

import { Provider, QueryRequest } from './Provider';
import { Model, ModelMetadata } from './Model';
import { AIService } from '../ai-service';

export class OpenRouterProvider extends Provider {
  readonly name = 'openrouter';

  constructor(aiService?: AIService) {
    super(aiService);
  }

  isAvailable(): boolean {
    return !!process.env.OPENROUTER_API_KEY;
  }

  async fetchModels(): Promise<ModelMetadata[]> {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from OpenRouter API');
    }

    // Filter and map models
    return data.data
      .filter((model: any) => {
        // Only include models that are available and suitable for chat
        return !model.id.includes('vision') && 
               !model.id.includes('whisper') &&
               !model.id.includes('dall-e') &&
               !model.id.includes('tts') &&
               model.context_length > 0;
      })
      .map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        provider: 'openrouter',
        contextWindow: model.context_length || 32768,
        inputCost: this.parsePrice(model.pricing?.prompt) || 0,
        outputCost: this.parsePrice(model.pricing?.completion) || 0,
        supportsJSON: this.modelSupportsJSON(model.id), // Check if model supports JSON mode
        supportsStreaming: true,
        maxTokens: Math.min(model.context_length || 32768, 4096)
      }))
      .sort((a: any, b: any) => {
        // Sort by cost (free first, then by price)
        if (a.inputCost === 0 && b.inputCost !== 0) return -1;
        if (a.inputCost !== 0 && b.inputCost === 0) return 1;
        return a.inputCost - b.inputCost;
      });
  }

  async callAPI(model: Model, request: QueryRequest): Promise<{
    content: string;
    usage?: { promptTokens: number; completionTokens: number };
  }> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY not found');
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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://mcplookup.org',
        'X-Title': 'MCPLookup.org Discovery Service'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenRouter');
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
   * Check if model supports JSON mode
   */
  private modelSupportsJSON(modelId: string): boolean {
    // Models that support JSON mode on OpenRouter
    const jsonSupportedModels = [
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'openai/gpt-4-turbo',
      'openai/gpt-3.5-turbo',
      'anthropic/claude-3-5-sonnet',
      'anthropic/claude-3-opus',
      'anthropic/claude-3-sonnet',
      'anthropic/claude-3-haiku',
      'google/gemini-pro',
      'google/gemini-pro-1.5',
      'mistralai/mistral-7b-instruct',
      'mistralai/mixtral-8x7b-instruct'
    ];

    return jsonSupportedModels.some(supported => modelId.includes(supported.split('/')[1]));
  }

  /**
   * Parse pricing string to number (per 1M tokens)
   */
  private parsePrice(priceStr?: string): number {
    if (!priceStr) return 0;

    // Price format is usually like "0.0002" (per 1K tokens)
    const price = parseFloat(priceStr);
    if (isNaN(price)) return 0;

    // Convert from per 1K tokens to per 1M tokens
    return price * 1000;
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
