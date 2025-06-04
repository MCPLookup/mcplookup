// Service Factory - Centralized service creation and configuration
// Provides easy access to all backend services with proper dependency injection

import { RegistryService } from './registry';
import { HealthService, EnhancedHealthService } from './health';
import { IntentService, EnhancedIntentService } from './intent';
import { VerificationService, MCPValidationService } from './verification';
import { DiscoveryService } from './discovery';
import { StorageConfig } from './storage/storage.js';

/**
 * Service Configuration Options
 */
export interface ServiceConfig {
  enhanced?: boolean;
  cacheEnabled?: boolean;
  healthCheckInterval?: number;
  intentAIEnabled?: boolean;
  storage?: StorageConfig;
}

/**
 * Service Factory Class
 * Creates and manages all backend services with proper configuration
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private config: ServiceConfig;
  
  // Service instances (singletons)
  private registryService?: RegistryService;
  private healthService?: HealthService | EnhancedHealthService;
  private intentService?: IntentService | EnhancedIntentService;
  private verificationService?: VerificationService;
  private discoveryService?: DiscoveryService;

  private constructor(config: ServiceConfig = {}) {
    this.config = {
      enhanced: false,
      cacheEnabled: true,
      healthCheckInterval: 5 * 60 * 1000, // 5 minutes
      intentAIEnabled: false,
      ...config
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: ServiceConfig): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory(config);
    }
    return ServiceFactory.instance;
  }

  /**
   * Get Registry Service
   */
  getRegistryService(): RegistryService {
    if (!this.registryService) {
      this.registryService = new RegistryService(this.config.storage);
    }
    return this.registryService;
  }

  /**
   * Get Health Service
   */
  getHealthService(): HealthService | EnhancedHealthService {
    if (!this.healthService) {
      this.healthService = this.config.enhanced 
        ? new EnhancedHealthService()
        : new HealthService();
    }
    return this.healthService;
  }

  /**
   * Get Intent Service
   */
  getIntentService(): IntentService | EnhancedIntentService {
    if (!this.intentService) {
      this.intentService = this.config.enhanced || this.config.intentAIEnabled
        ? new EnhancedIntentService()
        : new IntentService();
    }
    return this.intentService;
  }

  /**
   * Get Verification Service
   */
  getVerificationService(): VerificationService {
    if (!this.verificationService) {
      const mcpService = new MCPValidationService();
      this.verificationService = new VerificationService(mcpService, this.config.storage);
    }
    return this.verificationService;
  }

  /**
   * Get Discovery Service (main orchestrator)
   */
  getDiscoveryService(): DiscoveryService {
    if (!this.discoveryService) {
      this.discoveryService = new DiscoveryService(
        this.getRegistryService(),
        this.getHealthService(),
        this.getIntentService()
      );
    }
    return this.discoveryService;
  }

  /**
   * Get all services as a bundle
   */
  getAllServices() {
    return {
      registry: this.getRegistryService(),
      health: this.getHealthService(),
      intent: this.getIntentService(),
      verification: this.getVerificationService(),
      discovery: this.getDiscoveryService()
    };
  }

  /**
   * Reset all service instances (useful for testing)
   */
  reset(): void {
    this.registryService = undefined;
    this.healthService = undefined;
    this.intentService = undefined;
    this.verificationService = undefined;
    this.discoveryService = undefined;
  }
}

/**
 * Convenience functions for quick service access
 */

/**
 * Get configured services for production use
 */
export function getProductionServices() {
  const factory = ServiceFactory.getInstance({
    enhanced: true,
    cacheEnabled: true,
    intentAIEnabled: process.env.NODE_ENV === 'production'
  });
  
  return factory.getAllServices();
}

/**
 * Get basic services for development/testing
 */
export function getDevelopmentServices() {
  const factory = ServiceFactory.getInstance({
    enhanced: false,
    cacheEnabled: true,
    intentAIEnabled: false
  });
  
  return factory.getAllServices();
}

/**
 * Get services for testing with mock storage
 */
export function getTestServices() {
  // Configure to use memory storage for testing
  const factory = ServiceFactory.getInstance({
    storage: { provider: 'memory' }
  });
  
  return {
    registry: factory.getRegistryService(),
    health: factory.getHealthService(),
    intent: factory.getIntentService(),
    discovery: factory.getDiscoveryService(),
    verification: factory.getVerificationService()
  };
}

/**
 * Get services for serverless deployment (optimized)
 */
export function getServerlessServices() {
  const factory = ServiceFactory.getInstance({
    enhanced: false, // Keep it simple for cold starts
    cacheEnabled: true,
    intentAIEnabled: false // Avoid external API calls
  });
  
  return factory.getAllServices();
}

/**
 * Create discovery service with all dependencies
 */
export function createDiscoveryService(config?: ServiceConfig): DiscoveryService {
  const factory = ServiceFactory.getInstance(config);
  return factory.getDiscoveryService();
}

/**
 * Create verification service
 */
export function createVerificationService(): VerificationService {
  const factory = ServiceFactory.getInstance();
  return factory.getVerificationService();
}

/**
 * Environment-based service configuration
 */
export function getEnvironmentServices() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isServerless = process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  if (isServerless) {
    return getServerlessServices();
  } else if (isProduction) {
    return getProductionServices();
  } else {
    return getDevelopmentServices();
  }
}

// Export individual service classes for direct use
export {
  RegistryService,
  HealthService,
  EnhancedHealthService,
  IntentService,
  EnhancedIntentService,
  VerificationService,
  DiscoveryService
};

// Export verification dependencies
export { MCPValidationService };

// Export service interfaces
export type {
  IRegistryService,
  IHealthService,
  IIntentService,
  IDiscoveryService
} from './discovery';

export type {
  IVerificationService
} from './verification';
