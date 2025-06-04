// PROFESSIONAL MCP DISCOVERY SERVER IMPLEMENTATION
// Enterprise-grade MCP server that discovers all other MCP servers
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
} from './lib/schemas/discovery';

import { DiscoveryService, type IDiscoveryService } from './lib/services/discovery';
import { VerificationService, type IVerificationService } from './lib/services/verification';

/**
 * PROFESSIONAL MCP DISCOVERY SERVER
 * Enterprise-grade MCP server that provides discovery tools to AI agents
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
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'discover_mcp_servers',
          description: 'Discover MCP servers by domain, capability, intent, or category. Returns complete server information for immediate connection.',
          inputSchema: {
            type: 'object',
            properties: {
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
              intent: {
                type: 'string',
                description: 'Natural language intent (e.g., "check my email", "create a document")'
              },
              keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'Search keywords'
              },
              limit: {
                type: 'number',
                minimum: 1,
                maximum: 100,
                default: 10,
                description: 'Maximum number of results'
              }
            }
          }
        },
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
        }
      ]
    }));

    // Handle tool calls
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
    console.error('🔗 Professional MCP Discovery Server is running...');
  }

  /**
   * Get the internal MCP Server instance
   */
  get mcpServer(): Server {
    return this.server;
  }

  /**
   * Initialize the Vercel adapter server with our tools and resources
   */
  async initializeWithServer(adapterServer: any): Promise<void> {
    // Register discovery tool
    adapterServer.tool('discover_mcp_servers', {
      description: 'Discover MCP servers by domain, capability, intent, or category. Returns complete server information for immediate connection.',
      parameters: {
        type: 'object',
        properties: {
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
          intent: {
            type: 'string',
            description: 'Natural language intent (e.g., "check my email", "create a document")'
          },
          keywords: {
            type: 'array',
            items: { type: 'string' },
            description: 'Search keywords'
          },
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            default: 10,
            description: 'Maximum number of results'
          }
        }
      }
    }, async (params: DiscoveryRequest) => {
      try {
        const result = await this.discoveryService.discoverServers(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        throw new Error(`Discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Register server registry tool
    adapterServer.tool('register_mcp_server', {
      description: 'Register a new MCP server for discovery. Initiates DNS verification process.',
      parameters: {
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
    }, async (params: RegistrationRequest) => {
      try {
        const challenge = await this.verificationService.initiateDNSVerification(params);
        return {
          content: [
            {
              type: 'text',
              text: `DNS verification challenge created for ${params.domain}.\n\nTo verify ownership, add this DNS TXT record:\n\nName: ${challenge.txt_record_name}\nValue: ${challenge.txt_record_value}\n\nChallenge ID: ${challenge.challenge_id}\nExpires: ${challenge.expires_at}`
            }
          ]
        };
      } catch (error) {
        throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Register verification tool
    adapterServer.tool('verify_domain_ownership', {
      description: 'Check DNS verification status for a domain registration challenge.',
      parameters: {
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
    }, async (params: { challenge_id: string }) => {
      try {
        const result = await this.verificationService.verifyDNSChallenge(params.challenge_id);
        return {
          content: [
            {
              type: 'text',
              text: result 
                ? '✅ Domain verification successful! Your MCP server has been registered and is now discoverable.'
                : '❌ Domain verification failed. Please ensure the DNS record is properly configured and try again.'
            }
          ]
        };
      } catch (error) {
        throw new Error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Register resources
    adapterServer.resource('mcplookup://servers/all', 'All Registered Servers', 'Complete list of all registered MCP servers', 'application/json');
    adapterServer.resource('mcplookup://capabilities/taxonomy', 'Capability Taxonomy', 'Hierarchical structure of MCP capabilities', 'application/json');
    adapterServer.resource('mcplookup://stats/discovery', 'Discovery Statistics', 'Usage and performance statistics', 'application/json');
  }
}

// ======================================================================
// FACTORY FUNCTION FOR DEPENDENCY INJECTION
// ======================================================================

export function createMCPLookupServer(): MCPLookupServer {
  // Mock implementations for now
  const mockDiscoveryService: IDiscoveryService = {
    async discoverServers(request: DiscoveryRequest): Promise<DiscoveryResponse> {
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
    },

    async getChallengeStatus(challengeId: string): Promise<VerificationChallenge | null> {
      return null; // Mock: no challenges found
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
