// Model abstraction - represents an AI model with persistent state

import type { IAIStorage } from '../storage/ai-storage';

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
  private storage?: IAIStorage;

  constructor(metadata: ModelMetadata, storage?: IAIStorage) {
    this.metadata = metadata;
    this.storage = storage;
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
    
    if (this.isFree) priority -= 50;
    
    if (this.state.lastSuccess) {
      const hoursSinceSuccess = (Date.now() - this.state.lastSuccess) / (1000 * 60 * 60);
      priority -= Math.max(0, 20 - hoursSinceSuccess);
    }
    
    if (this.state.successRate) {
      priority -= this.state.successRate * 20;
    }
    
    priority += this.estimatedCostPerQuery * 1000;
    priority += this.state.failureCount * 10;
    
    return priority;
  }

  async loadState(): Promise<void> {
    if (!this.storage) return;

    try {
      const result = await this.storage.getModelState(this.id);
      if (result.success && result.data) {
        this.state = {
          lastSuccess: result.data.lastSuccess,
          lastFailure: result.data.lastFailure,
          failureCount: result.data.failureCount,
          enabled: result.data.enabled,
          averageLatency: result.data.averageLatency,
          successRate: result.data.successCount / Math.max(1, result.data.totalAttempts)
        };
      }
    } catch (error) {
      console.warn(`Failed to load state for model ${this.id}:`, error);
    }
  }

  async saveState(): Promise<void> {
    if (!this.storage) return;

    try {
      const totalAttempts = this.getAttemptCount();
      const successCount = Math.floor((this.state.successRate || 0) * totalAttempts);
      
      const storageState = {
        id: this.id,
        provider: this.provider,
        lastSuccess: this.state.lastSuccess,
        lastFailure: this.state.lastFailure,
        failureCount: this.state.failureCount,
        enabled: this.state.enabled,
        averageLatency: this.state.averageLatency,
        successCount,
        totalAttempts,
        lastUsed: Date.now()
      };

      await this.storage.setModelState(this.id, storageState);
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
