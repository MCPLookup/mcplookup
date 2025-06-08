// Model abstraction - represents an AI model with persistent state

import { AIService } from '../ai-service';

export interface ModelMetadata {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  inputCost: number;  // per 1M tokens
  outputCost: number; // per 1M tokens
  supportsJSON: boolean;
  supportsStreaming: boolean;
  maxTokens: number;
}

export interface ModelState {
  lastSuccess?: number;
  lastFailure?: number;
  failureCount: number;
  enabled: boolean;
  averageLatency?: number;
  successRate?: number;
}

export class Model {
  public readonly metadata: ModelMetadata;
  public state: ModelState;
  private aiService?: AIService;

  constructor(metadata: ModelMetadata, aiService?: AIService) {
    this.metadata = metadata;
    this.aiService = aiService;
    this.state = {
      failureCount: 0,
      enabled: true
    };
  }

  get id(): string {
    return this.metadata.id;
  }

  get name(): string {
    return this.metadata.name;
  }

  get provider(): string {
    return this.metadata.provider;
  }

  get isFree(): boolean {
    return this.metadata.inputCost === 0 && this.metadata.outputCost === 0;
  }

  get estimatedCostPerQuery(): number {
    const inputTokens = 500;
    const outputTokens = 200;
    return ((inputTokens * this.metadata.inputCost) + (outputTokens * this.metadata.outputCost)) / 1000000;
  }

  get isHealthy(): boolean {
    const now = Date.now();
    const cooldownPeriod = 10 * 60 * 1000; // 10 minutes
    
    if (!this.state.enabled) return false;
    if (this.state.failureCount >= 3) return false;
    if (this.state.lastFailure && (now - this.state.lastFailure) < cooldownPeriod) {
      return false;
    }
    
    return true;
  }

  get priority(): number {
    let priority = 100;

    // Free models get highest priority
    if (this.isFree) priority -= 60;

    // Prefer recent successful models
    if (this.state.lastSuccess) {
      const hoursSinceSuccess = (Date.now() - this.state.lastSuccess) / (1000 * 60 * 60);
      priority -= Math.max(0, 30 - hoursSinceSuccess);
    }

    // Prefer models with good success rates
    if (this.state.successRate) {
      priority -= this.state.successRate * 25;
    }

    // Prefer larger context windows for free models
    if (this.isFree && this.metadata.contextWindow >= 32768) {
      priority -= 20;
    }

    // Prefer well-known good models
    const isGoodModel = this.id.includes('llama-3.3') || this.id.includes('deepseek') ||
                       this.id.includes('exaone') || this.id.includes('moa');
    if (isGoodModel) priority -= 15;

    // Penalize cost and failures
    priority += this.estimatedCostPerQuery * 1000;
    priority += this.state.failureCount * 15;

    return priority;
  }

  async loadState(): Promise<void> {
    if (!this.aiService) return;

    try {
      const model = await this.aiService.getModel(this.id);
      if (model) {
        this.state = {
          lastSuccess: new Date(model.last_used).getTime(),
          lastFailure: undefined, // We'll track this separately
          failureCount: model.error_count,
          enabled: model.status === 'available',
          averageLatency: model.average_response_time,
          successRate: model.usage_count > 0 ? (model.usage_count - model.error_count) / model.usage_count : undefined
        };
      }
    } catch (error) {
      console.warn(`Failed to load state for model ${this.id}:`, error);
    }
  }

  async saveState(): Promise<void> {
    if (!this.aiService) return;

    try {
      const modelData = {
        provider: this.provider,
        name: this.name,
        status: this.state.enabled ? 'available' as const : 'error' as const,
        last_used: new Date(this.state.lastSuccess || Date.now()).toISOString(),
        usage_count: this.getAttemptCount(),
        error_count: this.state.failureCount,
        average_response_time: this.state.averageLatency || 0,
        cost_per_token: this.estimatedCostPerQuery,
        capabilities: this.metadata.supportsJSON ? ['json'] : [],
        metadata: {
          contextWindow: this.metadata.contextWindow,
          inputCost: this.metadata.inputCost,
          outputCost: this.metadata.outputCost,
          supportsStreaming: this.metadata.supportsStreaming,
          maxTokens: this.metadata.maxTokens
        }
      };

      await this.aiService.registerModel(modelData);
    } catch (error) {
      console.warn(`Failed to save state for model ${this.id}:`, error);
    }
  }

  recordSuccess(latency?: number): void {
    this.state.lastSuccess = Date.now();
    this.state.failureCount = 0; // Reset on success
    
    if (latency) {
      if (this.state.averageLatency) {
        this.state.averageLatency = (this.state.averageLatency * 0.8) + (latency * 0.2);
      } else {
        this.state.averageLatency = latency;
      }
    }

    const totalAttempts = this.getAttemptCount();
    const currentSuccesses = Math.floor((this.state.successRate || 0) * (totalAttempts - 1));
    this.state.successRate = (currentSuccesses + 1) / totalAttempts;

    this.saveState().catch(console.warn);
  }

  recordFailure(): void {
    this.state.lastFailure = Date.now();
    this.state.failureCount++;
    
    const totalAttempts = this.getAttemptCount();
    const currentSuccesses = Math.floor((this.state.successRate || 0) * (totalAttempts - 1));
    this.state.successRate = currentSuccesses / totalAttempts;
    
    if (this.state.failureCount >= 3) {
      this.state.enabled = false;
    }

    this.saveState().catch(console.warn);
  }

  reset(): void {
    this.state = {
      failureCount: 0,
      enabled: true
    };
    this.saveState().catch(console.warn);
  }

  private getAttemptCount(): number {
    const successTime = this.state.lastSuccess || 0;
    const failureTime = this.state.lastFailure || 0;
    const recentActivity = Math.max(successTime, failureTime);
    
    if (!recentActivity) return 1;
    
    const hoursActive = (Date.now() - recentActivity) / (1000 * 60 * 60);
    return Math.max(1, Math.floor(hoursActive) + this.state.failureCount + 1);
  }
}
