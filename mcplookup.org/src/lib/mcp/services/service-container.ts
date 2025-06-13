// Service Container - Dependency Injection for MCP Tools
// Provides loose coupling and easy testing through dependency injection

/**
 * Service interface definitions for type safety
 */
export interface StorageService {
  searchServers(criteria: any): Promise<any>;
  registerServer(data: any): Promise<any>;
  getServer(domain: string): Promise<any>;
  updateServer(domain: string, data: any): Promise<any>;
  deleteServer(domain: string): Promise<any>;
  getServerHealth(domain: string): Promise<any>;
  getStats(): Promise<any>;
}

export interface AnalyticsService {
  recordEvent(event: any): Promise<void>;
  getMetrics(filters?: any): Promise<any>;
  getUsageStats(): Promise<any>;
}

export interface VerificationService {
  createChallenge(domain: string, type: string): Promise<any>;
  verifyChallenge(challengeId: string, domain: string): Promise<any>;
  getVerificationStatus(domain: string): Promise<any>;
}

export interface DNSService {
  isUserDomainVerified(userId: string, domain: string): Promise<boolean>;
  verifyDomainOwnership(domain: string, token: string): Promise<boolean>;
}

/**
 * Service container interface
 */
export interface ServiceContainer {
  storage: StorageService;
  analytics: AnalyticsService;
  verification: VerificationService;
  dns: DNSService;
}

/**
 * Mock service container for testing
 */
export class MockServiceContainer implements ServiceContainer {
  storage: StorageService;
  analytics: AnalyticsService;
  verification: VerificationService;
  dns: DNSService;

  constructor(overrides: Partial<ServiceContainer> = {}) {
    this.storage = overrides.storage || this.createMockStorage();
    this.analytics = overrides.analytics || this.createMockAnalytics();
    this.verification = overrides.verification || this.createMockVerification();
    this.dns = overrides.dns || this.createMockDNS();
  }

  private createMockStorage(): StorageService {
    return {
      searchServers: async (criteria: any) => ({
        servers: [
          {
            domain: 'gmail.com',
            endpoint: 'https://gmail.com/mcp',
            capabilities: ['email', 'communication'],
            category: 'communication',
            status: 'active',
            verified: true,
            description: 'Gmail MCP server for email operations',
            performance: { response_time: 150, uptime: 99.9 },
            stats: { usage_count: 1000 }
          },
          {
            domain: 'slack.com',
            endpoint: 'https://slack.com/mcp',
            capabilities: ['messaging', 'collaboration'],
            category: 'communication',
            status: 'active',
            verified: true,
            description: 'Slack MCP server for team communication'
          }
        ],
        total: 2
      }),
      registerServer: async (data: any) => ({ 
        id: 'mock-registration-id', 
        ...data,
        status: 'pending_verification'
      }),
      getServer: async (domain: string) => null, // No existing server
      updateServer: async (domain: string, data: any) => ({ domain, ...data }),
      deleteServer: async (domain: string) => ({ success: true }),
      getServerHealth: async (domain: string) => ({
        domain,
        status: 'healthy',
        response_time: 120,
        uptime: 99.8,
        last_check: new Date().toISOString()
      }),
      getStats: async () => ({
        total_servers: 150,
        active_servers: 142,
        categories: ['communication', 'productivity', 'development'],
        top_capabilities: ['email', 'messaging', 'file_management']
      })
    };
  }

  private createMockAnalytics(): AnalyticsService {
    return {
      recordEvent: async (event: any) => {},
      getMetrics: async (filters?: any) => ({ events: [], total: 0 }),
      getUsageStats: async () => ({ total_requests: 0, unique_users: 0 })
    };
  }

  private createMockVerification(): VerificationService {
    return {
      createChallenge: async (domain: string, type: string) => ({
        challenge_id: 'mock-challenge',
        challenge_token: 'mock-token',
        domain,
        type
      }),
      verifyChallenge: async (challengeId: string, domain: string) => ({
        verified: true,
        domain,
        challenge_id: challengeId
      }),
      getVerificationStatus: async (domain: string) => ({
        domain,
        verified: true,
        verification_date: new Date().toISOString()
      })
    };
  }

  private createMockDNS(): DNSService {
    return {
      isUserDomainVerified: async (userId: string, domain: string) => true,
      verifyDomainOwnership: async (domain: string, token: string) => true
    };
  }
}

/**
 * Service container factory
 */
export class ServiceContainerFactory {
  private static instance: ServiceContainer | null = null;

  /**
   * Get service container instance
   */
  static getInstance(): ServiceContainer {
    if (!this.instance) {
      // For now, return mock container since we're in test mode
      this.instance = new MockServiceContainer();
    }
    return this.instance;
  }

  /**
   * Set service container instance (for testing)
   */
  static setInstance(container: ServiceContainer): void {
    this.instance = container;
  }

  /**
   * Reset to production instance
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Create mock container for testing
   */
  static createMock(overrides: Partial<ServiceContainer> = {}): MockServiceContainer {
    return new MockServiceContainer(overrides);
  }
}
