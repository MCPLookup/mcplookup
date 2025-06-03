// Backend Implementation Tests
// Verify that all backend services and endpoints are working correctly

const { getTestServices } = require('../lib/services');

describe('Backend Implementation Tests', () => {
  
  describe('Service Factory', () => {
    test('should create all required services', () => {
      const services = getTestServices();
      
      expect(services.registry).toBeDefined();
      expect(services.health).toBeDefined();
      expect(services.discovery).toBeDefined();
      expect(services.intent).toBeDefined();
      // verification is null in test mode
      expect(services.verification).toBeNull();
    });
  });

  describe('Registry Service', () => {
    let registryService: any;

    beforeEach(() => {
      const { registry } = getServerlessServices();
      registryService = registry;
    });

    test('should return well-known servers', async () => {
      const servers = await registryService.getAllServers();
      
      expect(servers).toBeDefined();
      expect(Array.isArray(servers)).toBe(true);
      expect(servers.length).toBeGreaterThan(0);
      
      // Check that Gmail server exists
      const gmailServer = servers.find((s: any) => s.domain === 'gmail.com');
      expect(gmailServer).toBeDefined();
      expect(gmailServer?.endpoint).toBe('https://gmail.com/api/mcp');
      expect(gmailServer?.capabilities.category).toBe('communication');
    });

    test('should find servers by domain', async () => {
      const servers = await registryService.getServersByDomain('gmail.com');
      
      expect(servers).toBeDefined();
      expect(Array.isArray(servers)).toBe(true);
      expect(servers.length).toBe(1);
      expect(servers[0].domain).toBe('gmail.com');
    });

    test('should find servers by capability', async () => {
      const servers = await registryService.getServersByCapability('email_send');
      
      expect(servers).toBeDefined();
      expect(Array.isArray(servers)).toBe(true);
      expect(servers.length).toBeGreaterThan(0);
      
      // Should include Gmail
      const gmailServer = servers.find((s: any) => s.domain === 'gmail.com');
      expect(gmailServer).toBeDefined();
    });

    test('should find servers by category', async () => {
      const servers = await registryService.getServersByCategory('communication');
      
      expect(servers).toBeDefined();
      expect(Array.isArray(servers)).toBe(true);
      expect(servers.length).toBeGreaterThan(0);
      
      // All servers should be communication category
      servers.forEach((server: any) => {
        expect(server.capabilities.category).toBe('communication');
      });
    });
  });

  describe('Intent Service', () => {
    let intentService: any;

    beforeEach(() => {
      const { intent } = getServerlessServices();
      intentService = intent;
    });

    test('should convert email intent to capabilities', async () => {
      const capabilities = await intentService.intentToCapabilities('send emails');
      
      expect(capabilities).toBeDefined();
      expect(Array.isArray(capabilities)).toBe(true);
      expect(capabilities.length).toBeGreaterThan(0);
      expect(capabilities).toContain('email_send');
    });

    test('should convert file intent to capabilities', async () => {
      const capabilities = await intentService.intentToCapabilities('store files');
      
      expect(capabilities).toBeDefined();
      expect(Array.isArray(capabilities)).toBe(true);
      expect(capabilities.length).toBeGreaterThan(0);
      expect(capabilities.some((cap: string) => cap.includes('file'))).toBe(true);
    });

    test('should handle complex intents', async () => {
      const capabilities = await intentService.intentToCapabilities('send emails and manage calendar');
      
      expect(capabilities).toBeDefined();
      expect(Array.isArray(capabilities)).toBe(true);
      expect(capabilities.length).toBeGreaterThan(0);
      expect(capabilities.some((cap: string) => cap.includes('email'))).toBe(true);
      expect(capabilities.some((cap: string) => cap.includes('calendar'))).toBe(true);
    });
  });

  describe('Discovery Service', () => {
    let discoveryService: any;

    beforeEach(() => {
      const { discovery } = getServerlessServices();
      discoveryService = discovery;
    });

    test('should discover servers by domain', async () => {
      const server = await discoveryService.discoverByDomain('gmail.com');
      
      expect(server).toBeDefined();
      expect(server?.domain).toBe('gmail.com');
      expect(server?.capabilities.category).toBe('communication');
    });

    test('should discover servers by capability', async () => {
      const servers = await discoveryService.discoverByCapability('email_send');
      
      expect(servers).toBeDefined();
      expect(Array.isArray(servers)).toBe(true);
      expect(servers.length).toBeGreaterThan(0);
    });

    test('should discover servers by intent', async () => {
      const servers = await discoveryService.discoverByIntent('send emails');
      
      expect(servers).toBeDefined();
      expect(Array.isArray(servers)).toBe(true);
      expect(servers.length).toBeGreaterThan(0);
    });

    test('should perform comprehensive discovery', async () => {
      const response = await discoveryService.discoverServers({
        capability: 'email_send',
        limit: 10,
        offset: 0,
        include_health: true,
        include_tools: false,
        include_resources: false,
        sort_by: 'relevance'
      });
      
      expect(response).toBeDefined();
      expect(response.servers).toBeDefined();
      expect(Array.isArray(response.servers)).toBe(true);
      expect(response.pagination).toBeDefined();
      expect(response.query_metadata).toBeDefined();
      expect(typeof response.query_metadata.query_time_ms).toBe('number');
    });
  });

  describe('Health Service', () => {
    let healthService: any;

    beforeEach(() => {
      const { health } = getServerlessServices();
      healthService = health;
    });

    test('should check server health', async () => {
      // Mock a health check since we can't make real HTTP requests in tests
      const mockEndpoint = 'https://example.com/mcp';
      
      // This will fail but should return a proper health metrics object
      const health = await healthService.checkServerHealth(mockEndpoint);
      
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy'].includes(health.status)).toBe(true);
      expect(typeof health.response_time_ms).toBe('number');
      expect(typeof health.uptime_percentage).toBe('number');
    });

    test('should check multiple servers', async () => {
      const endpoints = [
        'https://example1.com/mcp',
        'https://example2.com/mcp'
      ];
      
      const results = await healthService.checkMultipleServers(endpoints);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      
      results.forEach((result: any) => {
        expect(result.endpoint).toBeDefined();
        expect(result.health).toBeDefined();
        expect(result.health.status).toBeDefined();
      });
    });
  });

  describe('Verification Service', () => {
    let verificationService: any;

    beforeEach(() => {
      const { verification } = getServerlessServices();
      verificationService = verification;
    });

    test('should initiate DNS verification', async () => {
      const request = {
        domain: 'example.com',
        endpoint: 'https://example.com/mcp',
        capabilities: ['test'],
        category: 'development' as const,
        auth_type: 'none' as const,
        contact_email: 'test@example.com',
        description: 'Test server'
      };
      
      const challenge = await verificationService.initiateDNSVerification(request);
      
      expect(challenge).toBeDefined();
      expect(challenge.challenge_id).toBeDefined();
      expect(challenge.domain).toBe('example.com');
      expect(challenge.txt_record_name).toContain('_mcplookup-verify');
      expect(challenge.txt_record_value).toContain('mcplookup-verify=');
      expect(challenge.expires_at).toBeDefined();
      expect(challenge.instructions).toBeDefined();
    });

    test('should generate verification record', async () => {
      const record = await verificationService.generateVerificationRecord('example.com', 'test-token');
      
      expect(record).toBeDefined();
      expect(typeof record).toBe('string');
      expect(record).toContain('v=mcp1');
      expect(record).toContain('domain=example.com');
      expect(record).toContain('token=test-token');
    });
  });
});
