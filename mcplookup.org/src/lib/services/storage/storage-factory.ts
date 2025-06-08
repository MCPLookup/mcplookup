// Storage Factory - Creates and manages storage provider instances
// Handles configuration, initialization, and provider selection

import { IStorage } from './unified-storage';

/**
 * Storage Provider Types
 */
export type StorageProviderType = 'upstash' | 'redis' | 'memory';

/**
 * Storage Provider Configuration
 */
export interface StorageProviderConfig {
  type: StorageProviderType;
  
  // Redis configuration
  redisUrl?: string;
  redisPassword?: string;
  redisDatabase?: number;
  
  // Upstash configuration
  upstashUrl?: string;
  upstashToken?: string;
  
  // Memory configuration (optional settings)
  memoryMaxSize?: number;
  memoryTtl?: number;
  
  // Common settings
  connectionTimeout?: number;
  retryAttempts?: number;
  enableMetrics?: boolean;
}

/**
 * Storage Provider Factory
 * Creates and manages storage provider instances
 */
export class StorageFactory {
  private static instance: StorageFactory;
  private providers: Map<string, IStorage> = new Map();
  private defaultProvider: string | null = null;

  private constructor() {}

  /**
   * Get singleton instance of the factory
   */
  static getInstance(): StorageFactory {
    if (!StorageFactory.instance) {
      StorageFactory.instance = new StorageFactory();
    }
    return StorageFactory.instance;
  }

  /**
   * Create a new storage provider instance
   */
  async createProvider(
    name: string,
    config: StorageProviderConfig
  ): Promise<IStorage> {
    // Check if provider already exists
    if (this.providers.has(name)) {
      throw new Error(`Storage provider '${name}' already exists`);
    }

    let provider: IStorage;

    switch (config.type) {
      case 'upstash':
        const { UpstashStorageProvider } = await import('./providers/upstash');
        const upstashProvider = new UpstashStorageProvider();
        await upstashProvider.initialize(config);
        provider = upstashProvider.createStorage();
        break;

      case 'redis':
        const { RedisStorageProvider } = await import('./providers/redis');
        const redisProvider = new RedisStorageProvider();
        await redisProvider.initialize(config);
        provider = redisProvider.createStorage();
        break;

      case 'memory':
        const { InMemoryStorageProvider } = await import('./providers/memory');
        const memoryProvider = new InMemoryStorageProvider();
        await memoryProvider.initialize(config);
        provider = memoryProvider.createStorage();
        break;

      default:
        throw new Error(`Unknown storage provider type: ${config.type}`);
    }

    // Test the storage instance
    const healthCheck = await provider.healthCheck();
    if (!healthCheck.healthy) {
      throw new Error(`Failed to initialize storage provider '${name}': ${healthCheck.error || 'Unknown error'}`);
    }

    // Store the provider
    this.providers.set(name, provider);

    // Set as default if this is the first provider
    if (!this.defaultProvider) {
      this.defaultProvider = name;
    }

    return provider;
  }

  /**
   * Get an existing storage provider
   */
  getProvider(name?: string): IStorage {
    const providerName = name || this.defaultProvider;
    
    if (!providerName) {
      throw new Error('No storage provider specified and no default provider set');
    }

    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Storage provider '${providerName}' not found`);
    }

    return provider;
  }

  /**
   * Set the default storage provider
   */
  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Storage provider '${name}' not found`);
    }
    this.defaultProvider = name;
  }

  /**
   * Remove a storage provider
   */
  async removeProvider(name: string): Promise<void> {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Storage provider '${name}' not found`);
    }

    // If this is the default provider, clear the default
    if (this.defaultProvider === name) {
      this.defaultProvider = null;
    }

    this.providers.delete(name);
  }

  /**
   * Get all provider names
   */
  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider exists
   */
  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  /**
   * Get the default provider name
   */
  getDefaultProviderName(): string | null {
    return this.defaultProvider;
  }

  /**
   * Create provider from environment variables
   */
  static async createFromEnv(name = 'default'): Promise<IStorage> {
    const factory = StorageFactory.getInstance();

    // Determine provider type from environment
    const providerType = (process.env.STORAGE_PROVIDER?.toLowerCase() as StorageProviderType) || 'memory';

    const config: StorageProviderConfig = {
      type: providerType,
      
      // Redis config
      redisUrl: process.env.REDIS_URL,
      redisPassword: process.env.REDIS_PASSWORD,
      redisDatabase: process.env.REDIS_DATABASE ? parseInt(process.env.REDIS_DATABASE) : undefined,
      
      // Upstash config
      upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
      upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
      
      // Memory config
      memoryMaxSize: process.env.MEMORY_MAX_SIZE ? parseInt(process.env.MEMORY_MAX_SIZE) : undefined,
      memoryTtl: process.env.MEMORY_TTL ? parseInt(process.env.MEMORY_TTL) : undefined,
      
      // Common config
      connectionTimeout: process.env.STORAGE_CONNECTION_TIMEOUT ? parseInt(process.env.STORAGE_CONNECTION_TIMEOUT) : undefined,
      retryAttempts: process.env.STORAGE_RETRY_ATTEMPTS ? parseInt(process.env.STORAGE_RETRY_ATTEMPTS) : undefined,
      enableMetrics: process.env.STORAGE_ENABLE_METRICS === 'true',
    };

    return await factory.createProvider(name, config);
  }

  /**
   * Health check all providers
   */
  async healthCheckAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [name, provider] of this.providers) {
      try {
        const health = await provider.healthCheck();
        results[name] = health.healthy;
      } catch (error) {
        results[name] = false;
      }
    }
    
    return results;
  }
}
