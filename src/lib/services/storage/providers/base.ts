// Base Storage Provider - Common interface for all storage providers
// This defines the factory interface that all storage providers must implement

import { 
  IRegistryStorage, 
  IVerificationStorage, 
  IUserStorage, 
  IAuditStorage,
  StorageResult
} from '../interfaces';

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
   * Create a registry storage instance
   */
  createRegistryStorage(): IRegistryStorage;

  /**
   * Create a verification storage instance
   */
  createVerificationStorage(): IVerificationStorage;

  /**
   * Create a user storage instance
   */
  createUserStorage(): IUserStorage;

  /**
   * Create an audit storage instance
   */
  createAuditStorage(): IAuditStorage;

  /**
   * Gracefully shutdown the provider
   */
  shutdown(): Promise<void>;

  /**
   * Health check for the provider
   */
  healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    details?: Record<string, any>;
  }>;
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
  abstract createRegistryStorage(): IRegistryStorage;
  abstract createVerificationStorage(): IVerificationStorage;
  abstract createUserStorage(): IUserStorage;
  abstract createAuditStorage(): IAuditStorage;
  abstract shutdown(): Promise<void>;
  abstract healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    details?: Record<string, any>;
  }>;

  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(`Storage provider ${this.name} not initialized`);
    }
  }
}
