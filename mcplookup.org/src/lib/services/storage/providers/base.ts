// Base Storage Provider - Common interface for all storage providers
// This defines the factory interface that all storage providers must implement

import {
  IStorage,
  StorageResult,
  HealthCheckResult
} from '../unified-storage';

/**
 * Storage Provider Configuration
 */
export interface StorageProviderConfig {
  redisUrl?: string;
  redisToken?: string;
  upstashUrl?: string;
  upstashToken?: string;
  [key: string]: any;
}

/**
 * Base Storage Provider Interface
 * All storage providers must implement this factory interface
 */
export interface IStorageProvider {
  /**
   * Provider name identifier
   */
  readonly name: string;

  /**
   * Provider version
   */
  readonly version: string;

  /**
   * Provider capabilities
   */
  readonly capabilities: string[];

  /**
   * Initialize the provider with configuration
   */
  initialize(config?: StorageProviderConfig): Promise<StorageResult<void>>;

  /**
   * Check if the provider is available and properly configured
   */
  isAvailable(): Promise<boolean>;

  /**
   * Create a unified storage instance
   */
  createStorage(): IStorage;

  /**
   * Gracefully shutdown the provider
   */
  shutdown(): Promise<void>;

  /**
   * Health check for the provider
   */
  healthCheck(): Promise<HealthCheckResult>;
}

/**
 * Abstract base class for storage providers
 */
export abstract class BaseStorageProvider implements IStorageProvider {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly capabilities: string[];

  protected config?: StorageProviderConfig;
  protected initialized = false;

  async initialize(config?: StorageProviderConfig): Promise<StorageResult<void>> {
    this.config = config;
    this.initialized = true;
    return { success: true, data: void 0 };
  }

  abstract isAvailable(): Promise<boolean>;
  abstract createStorage(): IStorage;
  abstract shutdown(): Promise<void>;
  abstract healthCheck(): Promise<HealthCheckResult>;

  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(`Storage provider ${this.name} not initialized`);
    }
  }
}
