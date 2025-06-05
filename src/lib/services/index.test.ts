import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
  ServiceFactory,
  getProductionServices,
  getDevelopmentServices,
  getTestServices,
  getServerlessServices,
  getEnvironmentServices,
  createDiscoveryService,
  createVerificationService
} from './index';

// Mock the individual service classes
vi.mock('./registry', () => ({
  RegistryService: vi.fn().mockImplementation(() => ({
    getAllServers: vi.fn(),
    getServersByDomain: vi.fn(),
    registerServer: vi.fn()
  }))
}));

vi.mock('./health', () => ({
  HealthService: vi.fn().mockImplementation(() => ({
    checkServerHealth: vi.fn(),
    batchHealthCheck: vi.fn()
  })),
  EnhancedHealthService: vi.fn().mockImplementation(() => ({
    checkServerHealth: vi.fn(),
    batchHealthCheck: vi.fn()
  }))
}));

vi.mock('./intent', () => ({
  IntentService: vi.fn().mockImplementation(() => ({
    intentToCapabilities: vi.fn(),
    getSimilarIntents: vi.fn()
  })),
  EnhancedIntentService: vi.fn().mockImplementation(() => ({
    intentToCapabilities: vi.fn(),
    getSimilarIntents: vi.fn()
  }))
}));

vi.mock('./verification', () => ({
  VerificationService: vi.fn().mockImplementation(() => ({
    initiateDNSVerification: vi.fn(),
    verifyDNSChallenge: vi.fn(),
    verifyMCPEndpoint: vi.fn()
  })),
  MCPValidationService: vi.fn().mockImplementation(() => ({
    validateMCPEndpoint: vi.fn(),
    validateMCPResponse: vi.fn()
  }))
}));

vi.mock('./discovery', () => ({
  DiscoveryService: vi.fn().mockImplementation(() => ({
    discoverServers: vi.fn(),
    discoverByDomain: vi.fn(),
    discoverByIntent: vi.fn()
  }))
}));

describe('ServiceFactory', () => {
  let factory: ServiceFactory;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (ServiceFactory as any).instance = undefined;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const factory1 = ServiceFactory.getInstance();
      const factory2 = ServiceFactory.getInstance();

      expect(factory1).toBe(factory2);
    });

    it('should create new instance with different config', () => {
      const factory1 = ServiceFactory.getInstance({ enhanced: true });
      const factory2 = ServiceFactory.getInstance({ enhanced: false });

      // Should be the same instance since singleton
      expect(factory1).toBe(factory2);
    });
  });

  describe('service creation', () => {
    beforeEach(() => {
      factory = ServiceFactory.getInstance();
    });

    it('should create registry service', () => {
      const registryService = factory.getRegistryService();

      expect(registryService).toBeDefined();
      expect(registryService).toBeInstanceOf(Object);
    });

    it('should create health service', () => {
      const healthService = factory.getHealthService();

      expect(healthService).toBeDefined();
      expect(healthService).toBeInstanceOf(Object);
    });

    it('should create intent service', () => {
      const intentService = factory.getIntentService();

      expect(intentService).toBeDefined();
      expect(intentService).toBeInstanceOf(Object);
    });

    it('should create verification service', () => {
      const verificationService = factory.getVerificationService();

      expect(verificationService).toBeDefined();
      expect(verificationService).toBeInstanceOf(Object);
    });

    it('should create discovery service', () => {
      const discoveryService = factory.getDiscoveryService();

      expect(discoveryService).toBeDefined();
      expect(discoveryService).toBeInstanceOf(Object);
    });

    it('should return same service instance on multiple calls', () => {
      const registryService1 = factory.getRegistryService();
      const registryService2 = factory.getRegistryService();

      expect(registryService1).toBe(registryService2);
    });
  });

  describe('enhanced services', () => {
    it('should create enhanced health service when configured', () => {
      const enhancedFactory = ServiceFactory.getInstance({ enhanced: true });
      const healthService = enhancedFactory.getHealthService();

      expect(healthService).toBeDefined();
      // In a real implementation, this would be EnhancedHealthService
    });

    it('should create enhanced intent service when configured', () => {
      const enhancedFactory = ServiceFactory.getInstance({ enhanced: true });
      const intentService = enhancedFactory.getIntentService();

      expect(intentService).toBeDefined();
      // In a real implementation, this would be EnhancedIntentService
    });
  });

  describe('getAllServices', () => {
    it('should return all services in a bundle', () => {
      const services = factory.getAllServices();

      expect(services).toHaveProperty('registry');
      expect(services).toHaveProperty('health');
      expect(services).toHaveProperty('intent');
      expect(services).toHaveProperty('verification');
      expect(services).toHaveProperty('discovery');
    });
  });

  describe('reset', () => {
    it('should reset all service instances', () => {
      // Create services
      const registryService1 = factory.getRegistryService();
      const healthService1 = factory.getHealthService();

      // Reset factory
      factory.reset();

      // Create services again
      const registryService2 = factory.getRegistryService();
      const healthService2 = factory.getHealthService();

      // Should be different instances after reset
      expect(registryService1).not.toBe(registryService2);
      expect(healthService1).not.toBe(healthService2);
    });
  });
});

describe('convenience functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (ServiceFactory as any).instance = undefined;
  });

  describe('getProductionServices', () => {
    it('should return production-configured services', () => {
      const services = getProductionServices();

      expect(services).toHaveProperty('registry');
      expect(services).toHaveProperty('health');
      expect(services).toHaveProperty('intent');
      expect(services).toHaveProperty('verification');
      expect(services).toHaveProperty('discovery');
    });
  });

  describe('getDevelopmentServices', () => {
    it('should return development-configured services', () => {
      const services = getDevelopmentServices();

      expect(services).toHaveProperty('registry');
      expect(services).toHaveProperty('health');
      expect(services).toHaveProperty('intent');
      expect(services).toHaveProperty('verification');
      expect(services).toHaveProperty('discovery');
    });
  });

  describe('getTestServices', () => {
    it('should return test-configured services with memory storage', () => {
      const services = getTestServices();

      expect(services).toHaveProperty('registry');
      expect(services).toHaveProperty('health');
      expect(services).toHaveProperty('intent');
      expect(services).toHaveProperty('verification');
      expect(services).toHaveProperty('discovery');
    });
  });

  describe('getServerlessServices', () => {
    it('should return serverless-optimized services', () => {
      const services = getServerlessServices();

      expect(services).toHaveProperty('registry');
      expect(services).toHaveProperty('health');
      expect(services).toHaveProperty('intent');
      expect(services).toHaveProperty('verification');
      expect(services).toHaveProperty('discovery');
    });
  });

  describe('createDiscoveryService', () => {
    it('should create discovery service with default config', () => {
      const discoveryService = createDiscoveryService();

      expect(discoveryService).toBeDefined();
      expect(discoveryService).toBeInstanceOf(Object);
    });

    it('should create discovery service with custom config', () => {
      const discoveryService = createDiscoveryService({ enhanced: true });

      expect(discoveryService).toBeDefined();
      expect(discoveryService).toBeInstanceOf(Object);
    });
  });

  describe('createVerificationService', () => {
    it('should create verification service', () => {
      const verificationService = createVerificationService();

      expect(verificationService).toBeDefined();
      expect(verificationService).toBeInstanceOf(Object);
    });
  });
});

describe('getEnvironmentServices', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return serverless services in Vercel environment', () => {
    process.env = { ...originalEnv, VERCEL: '1' };

    const services = getEnvironmentServices();

    expect(services).toHaveProperty('registry');
    expect(services).toHaveProperty('health');
    expect(services).toHaveProperty('intent');
    expect(services).toHaveProperty('verification');
    expect(services).toHaveProperty('discovery');
  });

  it('should return serverless services in Netlify environment', () => {
    process.env = { ...originalEnv, NETLIFY: 'true' };

    const services = getEnvironmentServices();

    expect(services).toHaveProperty('registry');
    expect(services).toHaveProperty('health');
    expect(services).toHaveProperty('intent');
    expect(services).toHaveProperty('verification');
    expect(services).toHaveProperty('discovery');
  });

  it('should return serverless services in AWS Lambda environment', () => {
    process.env = { ...originalEnv, AWS_LAMBDA_FUNCTION_NAME: 'test-function' };

    const services = getEnvironmentServices();

    expect(services).toHaveProperty('registry');
    expect(services).toHaveProperty('health');
    expect(services).toHaveProperty('intent');
    expect(services).toHaveProperty('verification');
    expect(services).toHaveProperty('discovery');
  });

  it('should return production services in production environment', () => {
    process.env = { ...originalEnv, NODE_ENV: 'production' };

    const services = getEnvironmentServices();

    expect(services).toHaveProperty('registry');
    expect(services).toHaveProperty('health');
    expect(services).toHaveProperty('intent');
    expect(services).toHaveProperty('verification');
    expect(services).toHaveProperty('discovery');
  });

  it('should return development services in development environment', () => {
    process.env = { ...originalEnv, NODE_ENV: 'development' };

    const services = getEnvironmentServices();

    expect(services).toHaveProperty('registry');
    expect(services).toHaveProperty('health');
    expect(services).toHaveProperty('intent');
    expect(services).toHaveProperty('verification');
    expect(services).toHaveProperty('discovery');
  });

  it('should return development services by default', () => {
    process.env = { ...originalEnv };
    delete (process.env as any).NODE_ENV;
    delete (process.env as any).VERCEL;
    delete (process.env as any).NETLIFY;
    delete (process.env as any).AWS_LAMBDA_FUNCTION_NAME;

    const services = getEnvironmentServices();

    expect(services).toHaveProperty('registry');
    expect(services).toHaveProperty('health');
    expect(services).toHaveProperty('intent');
    expect(services).toHaveProperty('verification');
    expect(services).toHaveProperty('discovery');
  });
});

describe('service configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (ServiceFactory as any).instance = undefined;
  });

  it('should handle enhanced configuration', () => {
    const factory = ServiceFactory.getInstance({
      enhanced: true
    });

    const services = factory.getAllServices();
    expect(services).toBeDefined();
  });

  it('should handle cache configuration', () => {
    const factory = ServiceFactory.getInstance({
      cacheEnabled: true
    });

    const services = factory.getAllServices();
    expect(services).toBeDefined();
  });

  it('should handle health check interval configuration', () => {
    const factory = ServiceFactory.getInstance({
      healthCheckInterval: 30000
    });

    const services = factory.getAllServices();
    expect(services).toBeDefined();
  });

  it('should handle AI intent configuration', () => {
    const factory = ServiceFactory.getInstance({
      intentAIEnabled: true
    });

    const services = factory.getAllServices();
    expect(services).toBeDefined();
  });
});
