// Service Factory - Centralized service creation and configuration
// Provides easy access to all backend services with proper dependency injection

import { RegistryService } from './registry';
import { UserService } from './user-service';
import { AuditService } from './audit-service';
import { AIService } from './ai-service';
import { HealthService, EnhancedHealthService } from './health';
import { IntentService, EnhancedIntentService } from './intent';
import { VerificationService, MCPValidationService } from './verification';
import { DiscoveryService } from './discovery';
/**
 * Service Configuration Options
 */
export interface ServiceConfig {
  enhanced?: boolean;
  cacheEnabled?: boolean;
  healthCheckInterval?: number;
  intentAIEnabled?: boolean;
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
  private userService?: UserService;
  private auditService?: AuditService;
  private aiService?: AIService;
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
      this.registryService = new RegistryService();
    }
    return this.registryService;
  }

  /**
   * Get User Service
   */
  getUserService(): UserService {
    if (!this.userService) {
      this.userService = new UserService();
    }
    return this.userService;
  }

  /**
   * Get Audit Service
   */
  getAuditService(): AuditService {
    if (!this.auditService) {
      this.auditService = new AuditService();
    }
    return this.auditService;
  }

  /**
   * Get AI Service
   */
  getAIService(): AIService {
    if (!this.aiService) {
      this.aiService = new AIService();
    }
    return this.aiService;
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
   * Get Intent Service (automatically detects AI capability)
   */
  getIntentService(): IntentService | EnhancedIntentService {
    if (!this.intentService) {
      // Auto-detect AI capability based on available API keys
      const hasTogetherKey = !!process.env.TOGETHER_API_KEY;
      const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;
      const hasAnyAIKey = hasTogetherKey || hasOpenRouterKey;
      const shouldUseAI = this.config.enhanced || this.config.intentAIEnabled || hasAnyAIKey;

      this.intentService = shouldUseAI
        ? new EnhancedIntentService()
        : new IntentService();

      // Log which service is being used
      if (process.env.NODE_ENV !== 'test') {
        const aiProvider = hasTogetherKey ? 'Together AI' : hasOpenRouterKey ? 'OpenRouter' : 'No AI';
        console.log(`Intent Service: ${shouldUseAI ? 'AI-Powered' : 'Rule-Based'} (${aiProvider} Available)`);
      }
    }
    return this.intentService;
  }

  /**
   * Get Verification Service
   */
  getVerificationService(): VerificationService {
    if (!this.verificationService) {
      const mcpService = new MCPValidationService();
      const registryService = this.getRegistryService();
      this.verificationService = new VerificationService(mcpService, registryService);
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
      user: this.getUserService(),
      audit: this.getAuditService(),
      ai: this.getAIService(),
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
    this.userService = undefined;
    this.auditService = undefined;
    this.aiService = undefined;
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
  // Memory storage will be auto-detected in test environment
  const factory = ServiceFactory.getInstance();

  return {
    registry: factory.getRegistryService(),
    user: factory.getUserService(),
    audit: factory.getAuditService(),
    ai: factory.getAIService(),
    health: factory.getHealthService(),
    intent: factory.getIntentService(),
    discovery: factory.getDiscoveryService(),
    verification: factory.getVerificationService()
  };
}

/**
 * Get services for serverless deployment (optimized but AI-aware)
 */
export function getServerlessServices() {
  // Auto-detect AI capability for serverless
  const hasTogetherKey = !!process.env.TOGETHER_API_KEY;
  const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;
  const hasAnyAIKey = hasTogetherKey || hasOpenRouterKey;

  const factory = ServiceFactory.getInstance({
    enhanced: false, // Keep other services simple for cold starts
    cacheEnabled: true,
    intentAIEnabled: hasAnyAIKey // Enable AI if available
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
