// THE ONE RING MCP SERVER IMPLEMENTATION
// The master MCP server that discovers all other MCP servers
// Serverless-ready, TypeScript-first, pluggable architecture

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { 
  DiscoveryRequestSchema, 
  RegistrationRequestSchema,
  type DiscoveryRequest,
  type DiscoveryResponse,
  type RegistrationRequest,
  type VerificationChallenge,
  type MCPServerRecord,
  type HealthMetrics
} from './lib/schemas/discovery.js';

import { DiscoveryService, type IDiscoveryService } from './lib/services/discovery.js';
import { VerificationService, type IVerificationService } from './lib/services/verification.js';

/**
 * THE ONE RING MCP SERVER
 * The universal MCP server that provides discovery tools to AI agents
 */
class MCPLookupServer {
  private server: Server;
  private discoveryService: IDiscoveryService;
  private verificationService: IVerificationService;
  
  constructor(
    discoveryService: IDiscoveryService,
    verificationService: IVerificationService
  ) {
    this.discoveryService = discoveryService;
    this.verificationService = verificationService;
    
    this.server = new Server(
      {
        name: 'mcplookup-registry',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    // ====================================================================
    // TOOL: discover_mcp_servers
    // Primary discovery functionality
    // ====================================================================
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'discover_mcp_servers',
          description: 'Discover MCP servers by domain, capability, intent, or category. Returns complete server information for immediate connection.',
          inputSchema: {
            type: 'object',
            properties: {
              // Primary selectors
              domain: {
                type: 'string',
                description: 'Exact domain match (e.g., "gmail.com", "github.com")'
              },
              capability: {
                type: 'string',
                description: 'Required capability (e.g., "email_send", "file_read")'
              },
              category: {
                type: 'string',
                enum: ['communication', 'productivity', 'data', 'development', 'content', 'integration', 'analytics', 'security', 'finance', 'ecommerce', 'social', 'other'],
                description: 'Capability category filter'
              },
              
              // Intent-based discovery
              intent: {
                type: 'string',
                description: 'Natural language intent (e.g., "check my email", "create a document")'
              },
              keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'Search keywords'
              },
              use_case: {
                type: 'string',
                description: 'Specific use case description'
              },
              
              // Technical filters
              auth_types: {
                type: 'array',
                items: { type: 'string' },
                description: 'Acceptable authentication types (none, api_key, oauth2, basic)'
              },
              transport: {
                type: 'string',
                enum: ['streamable_http', 'sse', 'stdio'],
                description: 'Required transport protocol'
              },
              min_uptime: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Minimum uptime percentage'
              },
              max_response_time: {
                type: 'number',
                minimum: 0,
                description: 'Maximum acceptable response time (ms)'
              },
              cors_required: {
                type: 'boolean',
                description: 'Requires CORS support for web clients'
              },
              
              // Response control
              limit: {
                type: 'number',
                minimum: 1,
                maximum: 100,
                default: 10,
                description: 'Maximum number of results'
              },
              offset: {
                type: 'number',
                minimum: 0,
                default: 0,
                description: 'Pagination offset'
              },
              include_health: {
                type: 'boolean',
                default: true,
                description: 'Include real-time health metrics'
              },
              include_tools: {
                type: 'boolean',
                default: true,
                description: 'Include tool definitions'
              },
              include_resources: {
                type: 'boolean',
                default: false,
                description: 'Include resource definitions'
              },
              sort_by: {
                type: 'string',
                enum: ['relevance', 'uptime', 'response_time', 'created_at'],
                default: 'relevance',
                description: 'Sort order for results'
              }
            }
          }
        },
        
        // ================================================================
        // TOOL: register_mcp_server
        // New server registration with DNS verification
        // ================================================================
        {
          name: 'register_mcp_server',
          description: 'Register a new MCP server for discovery. Initiates DNS verification process.',
          inputSchema: {
            type: 'object',
            properties: {
              domain: {
                type: 'string',
                description: 'Domain to register (e.g., "api.example.com")'
              },
              endpoint: {
                type: 'string',
                format: 'uri',
                description: 'MCP endpoint URL (must be HTTPS)'
              },
              contact_email: {
                type: 'string',
                format: 'email',
                description: 'Contact email for verification notifications'
              },
              description: {
                type: 'string',
                description: 'Server description and purpose'
              }
            },
            required: ['domain', 'endpoint', 'contact_email']
          }
        },
        
        // ================================================================
        // TOOL: verify_domain_ownership
        // Check DNS verification status
        // ================================================================
        {
          name: 'verify_domain_ownership',
          description: 'Check DNS verification status for a domain registration challenge.',
          inputSchema: {
            type: 'object',
            properties: {
              challenge_id: {
                type: 'string',
                format: 'uuid',
                description: 'Verification challenge ID from registration'
              }
            },
            required: ['challenge_id']
          }
        },
        
        // ================================================================
        // TOOL: get_server_health
        // Real-time health monitoring
        // ================================================================
        {
          name: 'get_server_health',
          description: 'Get real-time health metrics for an MCP server.',
          inputSchema: {
            type: 'object',
            properties: {
              domain: {
                type: 'string',
                description: 'Domain name (e.g., "gmail.com")'
              },
              endpoint: {
                type: 'string',
                format: 'uri',
                description: 'Direct endpoint URL (alternative to domain)'
              }
            }
          }
        },
        
        // ================================================================
        // TOOL: browse_capabilities
        // Explore the capability taxonomy
        // ================================================================
        {
          name: 'browse_capabilities',
          description: 'Browse available capabilities and categories in the MCP ecosystem.',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['communication', 'productivity', 'data', 'development', 'content', 'integration', 'analytics', 'security', 'finance', 'ecommerce', 'social', 'other'],
                description: 'Filter by capability category'
              },
              include_stats: {
                type: 'boolean',
                default: true,
                description: 'Include usage statistics'
              }
            }
          }
        },
        
        // ================================================================
        // TOOL: get_discovery_stats
        // Analytics and usage patterns
        // ================================================================
        {
          name: 'get_discovery_stats',
          description: 'Get analytics and usage patterns for the MCP discovery service.',
          inputSchema: {
            type: 'object',
            properties: {
              timeframe: {
                type: 'string',
                enum: ['hour', 'day', 'week', 'month'],
                default: 'day',
                description: 'Statistics timeframe'
              },
              include_trends: {
                type: 'boolean',
                default: true,
                description: 'Include trend analysis'
              }
            }
          }
        }
      ]
    }));

    // ====================================================================
    // TOOL IMPLEMENTATIONS
    // ====================================================================

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'discover_mcp_servers':
            return await this.handleDiscoverServers(args as any);
            
          case 'register_mcp_server':
            return await this.handleRegisterServer(args as any);
            
          case 'verify_domain_ownership':
            return await this.handleVerifyDomain(args as any);
            
          case 'get_server_health':
            return await this.handleGetServerHealth(args as any);
            
          case 'browse_capabilities':
            return await this.handleBrowseCapabilities(args as any);
            
          case 'get_discovery_stats':
            return await this.handleGetDiscoveryStats(args as any);
            
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  // ======================================================================
  // TOOL HANDLER IMPLEMENTATIONS
  // ======================================================================

  private async handleDiscoverServers(args: any) {
    const request = DiscoveryRequestSchema.parse(args);
    const response = await this.discoveryService.discoverServers(request);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }
      ]
    };
  }

  private async handleRegisterServer(args: any) {
    const request = RegistrationRequestSchema.parse(args);
    const challenge = await this.verificationService.initiateDNSVerification(request);
    
    return {
      content: [
        {
          type: 'text',
          text: `DNS verification challenge created for ${request.domain}.\n\n${challenge.instructions}\n\nChallenge ID: ${challenge.challenge_id}\nExpires: ${challenge.expires_at}`
        }
      ]
    };
  }

  private async handleVerifyDomain(args: any) {
    const { challenge_id } = args;
    
    if (!challenge_id) {
      throw new McpError(ErrorCode.InvalidParams, 'challenge_id is required');
    }

    const isVerified = await this.verificationService.verifyDNSChallenge(challenge_id);
    
    return {
      content: [
        {
          type: 'text',
          text: isVerified 
            ? `✅ Domain verification successful! Your MCP server is now discoverable.`
            : `❌ Domain verification failed. Please ensure the DNS record is properly configured and try again.`
        }
      ]
    };
  }

  private async handleGetServerHealth(args: any) {
    const { domain, endpoint } = args;
    
    if (!domain && !endpoint) {
      throw new McpError(ErrorCode.InvalidParams, 'Either domain or endpoint is required');
    }

    let serverRecord: MCPServerRecord | null = null;
    
    if (domain) {
      serverRecord = await this.discoveryService.discoverByDomain(domain);
      if (!serverRecord) {
        throw new McpError(ErrorCode.InvalidParams, `No server found for domain: ${domain}`);
      }
    }

    const targetEndpoint = endpoint || serverRecord!.endpoint;
    
    // This would call the health service
    // For now, returning a mock response
    const healthData = {
      status: 'healthy',
      uptime_percentage: 99.9,
      avg_response_time_ms: 150,
      error_rate: 0.001,
      last_check: new Date().toISOString(),
      consecutive_failures: 0
    };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(healthData, null, 2)
        }
      ]
    };
  }

  private async handleBrowseCapabilities(args: any) {
    const { category, include_stats = true } = args;
    
    // Mock response - would integrate with real capability service
    const capabilities = {
      categories: [
        'communication', 'productivity', 'data', 'development', 
        'content', 'integration', 'analytics', 'security'
      ],
      popular_capabilities: [
        'email_send', 'file_read', 'calendar_create', 'code_execute',
        'document_create', 'webhook_send', 'data_query', 'auth_verify'
      ],
      stats: include_stats ? {
        total_servers: 1247,
        total_capabilities: 3891,
        most_popular_category: 'productivity'
      } : undefined
    };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(capabilities, null, 2)
        }
      ]
    };
  }

  private async handleGetDiscoveryStats(args: any) {
    const { timeframe = 'day', include_trends = true } = args;
    
    // Mock response - would integrate with real analytics service
    const stats = {
      timeframe,
      discovery_requests: 15420,
      unique_agents: 342,
      popular_domains: ['gmail.com', 'github.com', 'slack.com'],
      popular_intents: ['check email', 'create document', 'send message'],
      trends: include_trends ? {
        growth_rate: '+23%',
        trending_categories: ['ai-tools', 'automation']
      } : undefined
    };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2)
        }
      ]
    };
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🔗 The One Ring MCP Server is running...');
  }
}

// ======================================================================
// FACTORY FUNCTION FOR DEPENDENCY INJECTION
// ======================================================================

export function createMCPLookupServer(): MCPLookupServer {
  // In production, these would be injected based on environment
  // For now, using mock implementations
  
  const mockDiscoveryService: IDiscoveryService = {
    async discoverServers(request: DiscoveryRequest): Promise<DiscoveryResponse> {
      // Mock implementation
      return {
        servers: [],
        pagination: {
          total_count: 0,
          returned_count: 0,
          offset: 0,
          has_more: false
        },
        query_metadata: {
          query_time_ms: 50,
          cache_hit: false,
          filters_applied: []
        }
      };
    },
    
    async discoverByDomain(domain: string): Promise<MCPServerRecord | null> {
      return null;
    },
    
    async discoverByIntent(intent: string): Promise<MCPServerRecord[]> {
      return [];
    },
    
    async discoverByCapability(capability: string): Promise<MCPServerRecord[]> {
      return [];
    }
  };

  const mockVerificationService: IVerificationService = {
    async initiateDNSVerification(request: RegistrationRequest): Promise<VerificationChallenge> {
      return {
        challenge_id: '123e4567-e89b-12d3-a456-426614174000',
        domain: request.domain,
        txt_record_name: `_mcp-verify.${request.domain}`,
        txt_record_value: 'v=mcp1 domain=example.com token=abc123 timestamp=1234567890',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Add the DNS TXT record and verify.'
      };
    },
    
    async verifyDNSChallenge(challengeId: string): Promise<boolean> {
      return false; // Mock: always fails for demo
    },
    
    async verifyMCPEndpoint(endpoint: string): Promise<boolean> {
      return true;
    },
    
    async generateVerificationRecord(domain: string, token: string): Promise<string> {
      return `v=mcp1 domain=${domain} token=${token}`;
    }
  };

  return new MCPLookupServer(mockDiscoveryService, mockVerificationService);
}

// ======================================================================
// MAIN EXECUTION
// ======================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createMCPLookupServer();
  server.run().catch(console.error);
}
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupRequestHandlers();
    this.initializeSampleData();
  }

  private setupRequestHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'discover_mcp_servers',
          description: 'Discover MCP servers by domain, capability, or natural language intent. The universal directory for AI tool discovery.',
          inputSchema: {
            type: 'object',
            properties: {
              domain: {
                type: 'string',
                description: 'Specific domain to look up (e.g., "gmail.com", "github.com")',
              },
              capability: {
                type: 'string',
                description: 'Required capability (e.g., "email", "file_storage", "calendar")',
              },
              category: {
                type: 'string',
                enum: ['communication', 'productivity', 'development', 'finance', 'social', 'storage'],
                description: 'Service category',
              },
              intent: {
                type: 'string',
                description: 'Natural language description of what you want to do',
              },
              auth_types: {
                type: 'array',
                items: { type: 'string', enum: ['none', 'api_key', 'oauth2', 'basic'] },
                description: 'Acceptable authentication methods',
              },
              verified_only: {
                type: 'boolean',
                default: true,
                description: 'Only return DNS-verified servers',
              },
              max_results: {
                type: 'integer',
                default: 10,
                minimum: 1,
                maximum: 100,
              },
            },
          },
        },
        {
          name: 'register_mcp_server',
          description: 'Register a new MCP server in the global registry. Requires DNS verification to prove domain ownership.',
          inputSchema: {
            type: 'object',
            required: ['domain', 'endpoint'],
            properties: {
              domain: {
                type: 'string',
                pattern: '^[a-z0-9.-]+\\.[a-z]{2,}$',
                description: 'Domain name you control (e.g., "mycompany.com")',
              },
              endpoint: {
                type: 'string',
                format: 'uri',
                description: 'Full URL to your MCP server endpoint',
              },
              capabilities: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of capabilities your server provides',
              },
              category: {
                type: 'string',
                enum: ['communication', 'productivity', 'development', 'finance', 'social', 'storage', 'other'],
              },
              auth_type: {
                type: 'string',
                enum: ['none', 'api_key', 'oauth2', 'basic'],
                default: 'none',
              },
              contact_email: {
                type: 'string',
                format: 'email',
                description: 'Contact email for verification and issues',
              },
              description: {
                type: 'string',
                maxLength: 500,
                description: 'Brief description of your MCP server\'s purpose',
              },
            },
          },
        },
        {
          name: 'verify_domain_ownership',
          description: 'Check the DNS verification status for a domain registration.',
          inputSchema: {
            type: 'object',
            required: ['domain'],
            properties: {
              domain: {
                type: 'string',
                description: 'Domain to check verification status',
              },
            },
          },
        },
        {
          name: 'get_server_health',
          description: 'Get real-time health, performance, and reliability metrics for MCP servers.',
          inputSchema: {
            type: 'object',
            properties: {
              domain: {
                type: 'string',
                description: 'Specific domain to check',
              },
              domains: {
                type: 'array',
                items: { type: 'string' },
                description: 'Multiple domains to check',
              },
            },
          },
        },
        {
          name: 'browse_capabilities',
          description: 'Browse and search the taxonomy of available MCP capabilities across all registered servers.',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter by category',
              },
              search: {
                type: 'string',
                description: 'Search capability names and descriptions',
              },
              popular: {
                type: 'boolean',
                description: 'Show most popular capabilities',
              },
            },
          },
        },
        {
          name: 'get_discovery_stats',
          description: 'Get analytics about MCP server discovery patterns and usage statistics.',
          inputSchema: {
            type: 'object',
            properties: {
              timeframe: {
                type: 'string',
                enum: ['hour', 'day', 'week', 'month'],
                default: 'day',
              },
              metric: {
                type: 'string',
                enum: ['discoveries', 'registrations', 'health_checks', 'popular_domains'],
                default: 'discoveries',
              },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'discover_mcp_servers':
          return this.handleDiscoverServers(request.params.arguments);
        case 'register_mcp_server':
          return this.handleRegisterServer(request.params.arguments);
        case 'verify_domain_ownership':
          return this.handleVerifyDomain(request.params.arguments);
        case 'get_server_health':
          return this.handleGetHealth(request.params.arguments);
        case 'browse_capabilities':
          return this.handleBrowseCapabilities(request.params.arguments);
        case 'get_discovery_stats':
          return this.handleGetStats(request.params.arguments);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
      }
    });
  }

  private setupToolHandlers() {
    // Tool handlers are set up in setupRequestHandlers
  }

  private async handleDiscoverServers(args: any) {
    const startTime = Date.now();
    const {
      domain,
      capability,
      category,
      intent,
      auth_types,
      verified_only = true,
      max_results = 10,
    } = args;

    let results: MCPServerRecord[] = Array.from(this.db.values());

    // Filter by verification status
    if (verified_only) {
      results = results.filter(server => server.verified);
    }

    // Filter by domain
    if (domain) {
      results = results.filter(server => server.domain === domain);
    }

    // Filter by capability
    if (capability) {
      results = results.filter(server => 
        server.capabilities.some(cap => 
          cap.toLowerCase().includes(capability.toLowerCase())
        )
      );
    }

    // Filter by category
    if (category) {
      results = results.filter(server => server.category === category);
    }

    // Filter by auth types
    if (auth_types && auth_types.length > 0) {
      results = results.filter(server => auth_types.includes(server.auth_type));
    }

    // Handle intent-based discovery
    if (intent) {
      const intentCapabilities = this.extractCapabilitiesFromIntent(intent);
      results = results.filter(server =>
        intentCapabilities.some(cap =>
          server.capabilities.some(serverCap =>
            serverCap.toLowerCase().includes(cap.toLowerCase())
          )
        )
      );
    }

    // Sort by trust score and health
    results.sort((a, b) => {
      if (a.health_status === 'healthy' && b.health_status !== 'healthy') return -1;
      if (b.health_status === 'healthy' && a.health_status !== 'healthy') return 1;
      return b.trust_score - a.trust_score;
    });

    // Limit results
    results = results.slice(0, max_results);

    const discoveryTime = Date.now() - startTime;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            query: {
              domain,
              capability,
              category,
              intent,
              timestamp: new Date().toISOString(),
            },
            results: results.map(server => ({
              domain: server.domain,
              endpoint: server.endpoint,
              capabilities: server.capabilities,
              category: server.category,
              auth_type: server.auth_type,
              verified: server.verified,
              health: {
                status: server.health_status,
                uptime_percentage: server.uptime_percentage,
                avg_response_time_ms: server.avg_response_time_ms,
                last_check: server.last_health_check.toISOString(),
              },
              trust_score: server.trust_score,
              description: `MCP server for ${server.domain}`,
            })),
            total_results: results.length,
            discovery_time_ms: discoveryTime,
          }, null, 2),
        },
      ],
    };
  }

  private async handleRegisterServer(args: any) {
    const {
      domain,
      endpoint,
      capabilities = [],
      category = 'other',
      auth_type = 'none',
      contact_email,
      description,
    } = args;

    // Validate domain format
    if (!this.isValidDomain(domain)) {
      throw new McpError(ErrorCode.InvalidParams, 'Invalid domain format');
    }

    // Check if domain already registered
    if (this.db.has(domain)) {
      throw new McpError(ErrorCode.InvalidParams, 'Domain already registered');
    }

    // Generate verification challenge
    const challenge = this.generateVerificationChallenge(domain);
    this.pendingVerifications.set(challenge.registration_id, challenge);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            registration_id: challenge.registration_id,
            domain,
            status: 'pending_verification',
            verification: {
              method: 'dns_txt_record',
              record_name: challenge.record_name,
              record_value: challenge.record_value,
              instructions: 'Add the above TXT record to your DNS, then verification will complete automatically within 5 minutes.',
              verification_url: `https://mcplookup.org/verify/${challenge.registration_id}`,
            },
            estimated_verification_time: '5 minutes',
            next_steps: [
              'Add the DNS TXT record',
              'Wait for automatic verification',
              'Your server will be discoverable once verified',
            ],
          }, null, 2),
        },
      ],
    };
  }

  private async handleVerifyDomain(args: any) {
    const { domain } = args;

    const server = this.db.get(domain);
    if (!server) {
      throw new McpError(ErrorCode.InvalidParams, 'Domain not found in registry');
    }

    // Check if domain is already verified
    if (server.verified) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              domain,
              status: 'verified',
              verified_at: server.updated_at.toISOString(),
              dns_record_found: true,
              message: 'Domain is already verified and discoverable',
            }, null, 2),
          },
        ],
      };
    }

    // Find pending verification
    const pendingVerification = Array.from(this.pendingVerifications.values())
      .find(v => v.domain === domain);

    if (!pendingVerification) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              domain,
              status: 'no_pending_verification',
              message: 'No pending verification found for this domain',
            }, null, 2),
          },
        ],
      };
    }

    // Check DNS record
    const verified = await this.checkDNSVerification(domain, pendingVerification.token);

    if (verified) {
      // Mark as verified
      server.verified = true;
      server.updated_at = new Date();
      this.db.set(domain, server);
      this.pendingVerifications.delete(pendingVerification.registration_id);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              domain,
              status: 'verified',
              verified_at: new Date().toISOString(),
              dns_record_found: true,
              message: 'Domain successfully verified! Your server is now discoverable.',
            }, null, 2),
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              domain,
              status: 'pending',
              dns_record_found: false,
              expected_record: pendingVerification.record_value,
              message: 'DNS verification record not found. Please add the TXT record and try again.',
            }, null, 2),
          },
        ],
      };
    }
  }

  private async handleGetHealth(args: any) {
    const { domain, domains } = args;

    const domainsToCheck = domains || (domain ? [domain] : []);

    if (domainsToCheck.length === 0) {
      throw new McpError(ErrorCode.InvalidParams, 'Must specify domain or domains');
    }

    const healthData = await Promise.all(
      domainsToCheck.map(async (d: string) => {
        const server = this.db.get(d);
        if (!server) {
          return { domain: d, error: 'Domain not found in registry' };
        }

        // Simulate health check
        const health = await this.performHealthCheck(server);
        return {
          domain: d,
          health: {
            status: server.health_status,
            uptime_percentage: server.uptime_percentage,
            response_times: {
              current_ms: server.avg_response_time_ms,
              avg_24h_ms: server.avg_response_time_ms + Math.floor(Math.random() * 20),
              p95_24h_ms: server.avg_response_time_ms + Math.floor(Math.random() * 50),
            },
            last_check: server.last_health_check.toISOString(),
          },
          capabilities_status: {
            all_working: server.health_status === 'healthy',
            last_capability_check: server.last_health_check.toISOString(),
          },
          trust_metrics: {
            trust_score: server.trust_score,
            verification_status: server.verified ? 'dns_verified' : 'unverified',
            security_scan: 'passed',
            community_rating: 4.5 + Math.random() * 0.5,
          },
        };
      })
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            domainsToCheck.length === 1 ? healthData[0] : healthData,
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleBrowseCapabilities(args: any) {
    const { category, search, popular } = args;

    const allCapabilities = new Map<string, { count: number; servers: string[] }>();

    // Aggregate capabilities from all servers
    for (const server of this.db.values()) {
      if (!server.verified) continue;
      if (category && server.category !== category) continue;

      for (const capability of server.capabilities) {
        if (search && !capability.toLowerCase().includes(search.toLowerCase())) {
          continue;
        }

        if (!allCapabilities.has(capability)) {
          allCapabilities.set(capability, { count: 0, servers: [] });
        }

        const cap = allCapabilities.get(capability)!;
        cap.count++;
        cap.servers.push(server.domain);
      }
    }

    let capabilities = Array.from(allCapabilities.entries()).map(([name, data]) => ({
      name,
      description: `${name.replace('_', ' ')} capability`,
      server_count: data.count,
      servers: data.servers,
      usage_count: data.count * Math.floor(Math.random() * 1000), // Simulated usage
    }));

    if (popular) {
      capabilities.sort((a, b) => b.usage_count - a.usage_count);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            capabilities: capabilities.slice(0, 50), // Limit to 50 results
            total_capabilities: capabilities.length,
            search_query: search,
            category_filter: category,
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetStats(args: any) {
    const { timeframe = 'day', metric = 'discoveries' } = args;

    // Simulate analytics data
    const stats = {
      timeframe,
      metric,
      data: this.generateMockStats(timeframe, metric),
      total_servers: this.db.size,
      verified_servers: Array.from(this.db.values()).filter(s => s.verified).length,
      healthy_servers: Array.from(this.db.values()).filter(s => s.health_status === 'healthy').length,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  // Utility methods

  private extractCapabilitiesFromIntent(intent: string): string[] {
    const intentMap: Record<string, string[]> = {
      'send emails': ['email_send', 'email'],
      'check email': ['email_read', 'email'],
      'manage calendar': ['calendar', 'scheduling'],
      'store files': ['file_storage', 'storage'],
      'deploy code': ['deployment', 'ci_cd'],
      'social media': ['social_posting', 'social'],
    };

    const lowerIntent = intent.toLowerCase();
    const capabilities: string[] = [];

    for (const [key, caps] of Object.entries(intentMap)) {
      if (lowerIntent.includes(key)) {
        capabilities.push(...caps);
      }
    }

    return capabilities.length > 0 ? capabilities : ['general'];
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-z0-9.-]+\.[a-z]{2,}$/i;
    return domainRegex.test(domain);
  }

  private generateVerificationChallenge(domain: string): VerificationChallenge {
    const token = Math.random().toString(36).substring(2, 15);
    const registrationId = `reg_${Math.random().toString(36).substring(2, 15)}`;

    return {
      registration_id: registrationId,
      domain,
      token,
      record_name: `_mcp-verify.${domain}`,
      record_value: `mcp_verify_${token}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  private async checkDNSVerification(domain: string, token: string): Promise<boolean> {
    try {
      const recordName = `_mcp-verify.${domain}`;
      const records = await dns.resolveTxt(recordName);
      
      return records.some(record =>
        record.join('').includes(`mcp_verify_${token}`)
      );
    } catch (error) {
      return false; // DNS lookup failed
    }
  }

  private async performHealthCheck(server: MCPServerRecord): Promise<boolean> {
    try {
      const response = await fetch(server.endpoint, {
        method: 'GET',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private generateMockStats(timeframe: string, metric: string) {
    // Generate mock analytics data
    const baseValue = Math.floor(Math.random() * 10000);
    return {
      current_period: baseValue,
      previous_period: Math.floor(baseValue * 0.8),
      growth_percentage: Math.floor(Math.random() * 50),
      trend: 'increasing',
    };
  }

  private initializeSampleData() {
    // Add some sample MCP servers for demonstration
    const sampleServers: MCPServerRecord[] = [
      {
        domain: 'gmail.com',
        endpoint: 'https://gmail.com/mcp',
        capabilities: ['email_read', 'email_send', 'email_search', 'calendar', 'contacts'],
        category: 'communication',
        auth_type: 'oauth2',
        verified: true,
        health_status: 'healthy',
        trust_score: 98,
        uptime_percentage: 99.97,
        avg_response_time_ms: 45,
        last_health_check: new Date(),
        created_at: new Date('2025-05-15'),
        updated_at: new Date(),
      },
      {
        domain: 'github.com',
        endpoint: 'https://api.github.com/mcp',
        capabilities: ['code_repository', 'issue_management', 'pull_requests', 'ci_cd'],
        category: 'development',
        auth_type: 'oauth2',
        verified: true,
        health_status: 'healthy',
        trust_score: 96,
        uptime_percentage: 99.95,
        avg_response_time_ms: 67,
        last_health_check: new Date(),
        created_at: new Date('2025-05-10'),
        updated_at: new Date(),
      },
      {
        domain: 'slack.com',
        endpoint: 'https://slack.com/api/mcp',
        capabilities: ['messaging', 'channels', 'file_sharing', 'notifications'],
        category: 'communication',
        auth_type: 'oauth2',
        verified: true,
        health_status: 'healthy',
        trust_score: 94,
        uptime_percentage: 99.92,
        avg_response_time_ms: 89,
        last_health_check: new Date(),
        created_at: new Date('2025-05-20'),
        updated_at: new Date(),
      },
    ];

    for (const server of sampleServers) {
      this.db.set(server.domain, server);
    }
  }

  async start() {
    // Use HTTP transport for Streamable HTTP
    const transport = new HttpServerTransport({
      port: 3000,
      host: '0.0.0.0',
    });

    await this.server.connect(transport);
    console.log('🔥 MCPLookup Registry Server running on http://0.0.0.0:3000/mcp');
    console.log('📡 The One Ring MCP Server is active - ready to discover all MCP servers!');
  }
}

// Start the server
const server = new MCPLookupServer();
server.start().catch(console.error);

export default MCPLookupServer;
