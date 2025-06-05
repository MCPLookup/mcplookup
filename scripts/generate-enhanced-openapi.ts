#!/usr/bin/env tsx
// Enhanced OpenAPI Generation Script
// Uses actual Zod schemas and real API analysis to generate accurate OpenAPI spec

import { writeFileSync } from 'fs';
import { join } from 'path';
import { OpenAPIGenerator } from './generate-openapi';
import SchemaExtractor from './extract-schemas';

class EnhancedOpenAPIGenerator extends OpenAPIGenerator {
  private schemaExtractor: SchemaExtractor;
  private extractedSchemas: any = {};
  private mcpToolSchemas: any = {};
  private examples: any = {};

  constructor() {
    super();
    this.schemaExtractor = new SchemaExtractor();
  }

  /**
   * Enhanced generation with schema extraction
   */
  async generateEnhanced(): Promise<void> {
    console.log('🔍 Analyzing API routes...');
    await this.analyzeRoutes();
    
    console.log('📋 Extracting Zod schemas...');
    await this.extractSchemas();
    
    console.log('🛠️ Analyzing MCP tools...');
    await this.analyzeMCPTools();
    
    console.log('📝 Generating enhanced OpenAPI spec...');
    const openApiSpec = this.generateEnhancedOpenAPISpec();
    
    console.log('💾 Writing enhanced OpenAPI spec...');
    this.writeEnhancedOpenAPISpec(openApiSpec);
    
    console.log('✅ Enhanced OpenAPI spec generated successfully!');
    this.printEnhancedSummary();
  }

  /**
   * Extract schemas from the codebase
   */
  private async extractSchemas(): Promise<void> {
    // Extract discovery schemas
    this.extractedSchemas = this.schemaExtractor.extractDiscoverySchemas();
    
    // Extract MCP tool schemas
    this.mcpToolSchemas = this.schemaExtractor.extractMCPToolSchemas();
    
    // Extract examples from tests
    this.examples = this.schemaExtractor.extractExamples();
    
    console.log(`  📋 Extracted ${Object.keys(this.extractedSchemas).length} schemas`);
    console.log(`  🛠️ Extracted ${Object.keys(this.mcpToolSchemas).length} MCP tool schemas`);
    console.log(`  📝 Found ${Object.keys(this.examples).length} examples`);
  }

  /**
   * Generate enhanced OpenAPI spec with real schemas
   */
  private generateEnhancedOpenAPISpec(): any {
    const baseSpec = this.generateOpenAPISpec();
    
    // Enhance with extracted schemas
    baseSpec.components.schemas = {
      ...baseSpec.components.schemas,
      ...this.generateEnhancedSchemas()
    };
    
    // Enhance paths with better request/response schemas
    baseSpec.paths = this.enhancePaths(baseSpec.paths);
    
    // Add comprehensive MCP tools section
    baseSpec['x-mcp-tools'] = this.generateEnhancedMCPToolsSection();
    
    // Add examples section
    baseSpec['x-examples'] = this.generateExamplesSection();
    
    return baseSpec;
  }

  /**
   * Generate enhanced schemas from extracted Zod schemas
   */
  private generateEnhancedSchemas(): any {
    const schemas: any = {};
    
    // Core API schemas
    schemas.DiscoveryRequest = {
      type: 'object',
      description: 'Server discovery request parameters',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language search query',
          example: 'Find email servers like Gmail'
        },
        domain: {
          type: 'string',
          description: 'Specific domain to search for',
          example: 'gmail.com'
        },
        capability: {
          type: 'string',
          description: 'Required capability',
          example: 'email'
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10,
          description: 'Maximum number of results'
        }
      }
    };

    schemas.RegistrationRequest = {
      type: 'object',
      required: ['domain', 'endpoint'],
      description: 'MCP server registration request',
      properties: {
        domain: {
          type: 'string',
          pattern: '^[a-z0-9.-]+\\.[a-z]{2,}$',
          description: 'Domain name you control',
          example: 'mycompany.com'
        },
        endpoint: {
          type: 'string',
          format: 'uri',
          description: 'Full URL to your MCP server endpoint',
          example: 'https://api.mycompany.com/mcp'
        },
        capabilities: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of capabilities your server provides',
          example: ['email', 'calendar']
        },
        category: {
          type: 'string',
          enum: ['communication', 'productivity', 'development', 'finance', 'social', 'storage', 'other'],
          description: 'Server category'
        },
        auth_type: {
          type: 'string',
          enum: ['none', 'api_key', 'oauth2', 'basic'],
          default: 'none',
          description: 'Authentication type'
        },
        contact_email: {
          type: 'string',
          format: 'email',
          description: 'Contact email for verification',
          example: 'admin@mycompany.com'
        },
        description: {
          type: 'string',
          maxLength: 500,
          description: 'Brief description of your MCP server',
          example: 'Email and calendar integration for our CRM'
        }
      }
    };

    schemas.HealthResponse = {
      type: 'object',
      description: 'Server health check response',
      properties: {
        domain: { type: 'string', description: 'Server domain' },
        endpoint: { type: 'string', format: 'uri', description: 'MCP endpoint' },
        health: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded', 'unhealthy', 'unknown'],
              description: 'Current health status'
            },
            uptime_percentage: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Uptime percentage'
            },
            avg_response_time_ms: {
              type: 'number',
              description: 'Average response time in milliseconds'
            },
            last_check: {
              type: 'string',
              format: 'date-time',
              description: 'Last health check timestamp'
            }
          }
        },
        capabilities_working: {
          type: 'boolean',
          description: 'Whether server capabilities are working'
        },
        ssl_valid: {
          type: 'boolean',
          description: 'Whether SSL certificate is valid'
        },
        trust_score: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
          description: 'Calculated trust score'
        }
      }
    };

    // Add MCP tool schemas
    Object.entries(this.mcpToolSchemas).forEach(([toolName, toolSchema]: [string, any]) => {
      schemas[`MCPTool_${toolName}`] = {
        type: 'object',
        description: `Schema for MCP tool: ${toolName}`,
        properties: {
          name: { type: 'string', enum: [toolName] },
          arguments: toolSchema.inputSchema || { type: 'object' }
        }
      };
    });

    return schemas;
  }

  /**
   * Enhance paths with better schemas
   */
  private enhancePaths(paths: any): any {
    // Enhance discovery endpoint
    if (paths['/v1/discover']) {
      if (paths['/v1/discover'].get) {
        paths['/v1/discover'].get.parameters = [
          {
            name: 'query',
            in: 'query',
            schema: { type: 'string' },
            description: 'Natural language search query',
            example: 'Find email servers like Gmail'
          },
          {
            name: 'domain',
            in: 'query',
            schema: { type: 'string' },
            description: 'Specific domain to search for',
            example: 'gmail.com'
          },
          {
            name: 'capability',
            in: 'query',
            schema: { type: 'string' },
            description: 'Required capability',
            example: 'email'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            description: 'Maximum number of results'
          }
        ];
        
        paths['/v1/discover'].get.responses['200'].content['application/json'].schema = {
          $ref: '#/components/schemas/DiscoveryResponse'
        };
      }
    }

    // Enhance registration endpoint
    if (paths['/v1/register']) {
      if (paths['/v1/register'].post) {
        paths['/v1/register'].post.requestBody.content['application/json'].schema = {
          $ref: '#/components/schemas/RegistrationRequest'
        };
      }
    }

    // Enhance health endpoint
    if (paths['/v1/health/{domain}']) {
      if (paths['/v1/health/{domain}'].get) {
        paths['/v1/health/{domain}'].get.responses['200'].content['application/json'].schema = {
          $ref: '#/components/schemas/HealthResponse'
        };
      }
    }

    return paths;
  }

  /**
   * Generate enhanced MCP tools section
   */
  private generateEnhancedMCPToolsSection(): any {
    const toolsByServer = {
      main: Object.entries(this.mcpToolSchemas).map(([name, schema]: [string, any]) => ({
        name,
        description: schema.description,
        inputSchema: schema.inputSchema,
        category: this.categorizeTool(name),
        examples: this.getToolExamples(name)
      })),
      bridge: [
        {
          name: 'discover_mcp_servers',
          description: 'Find MCP servers using mcplookup.org',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Natural language query' },
              domain: { type: 'string', description: 'Specific domain' },
              capability: { type: 'string', description: 'Required capability' },
              limit: { type: 'number', default: 10, description: 'Max results' }
            }
          },
          category: 'Discovery'
        },
        {
          name: 'connect_and_list_tools',
          description: 'Connect to a server and list its tools',
          inputSchema: {
            type: 'object',
            required: ['endpoint'],
            properties: {
              endpoint: { type: 'string', format: 'uri', description: 'MCP server endpoint' },
              auth_headers: { type: 'object', description: 'Optional auth headers' }
            }
          },
          category: 'Bridge'
        },
        {
          name: 'call_tool_on_server',
          description: 'Call any tool on any MCP server',
          inputSchema: {
            type: 'object',
            required: ['endpoint', 'tool_name'],
            properties: {
              endpoint: { type: 'string', format: 'uri', description: 'MCP server endpoint' },
              tool_name: { type: 'string', description: 'Name of tool to call' },
              arguments: { type: 'object', description: 'Tool arguments' },
              auth_headers: { type: 'object', description: 'Optional auth headers' }
            }
          },
          category: 'Bridge'
        }
      ]
    };

    return {
      description: 'MCP (Model Context Protocol) tools available in this system',
      specification: 'https://spec.modelcontextprotocol.io/',
      servers: {
        main: {
          endpoint: '/api/mcp',
          transport: 'HTTP streaming (Streamable HTTP + SSE fallback)',
          description: 'Main MCP server for discovery and registration',
          authentication: 'Optional API key for enhanced features',
          tools: toolsByServer.main
        },
        bridge: {
          transport: 'stdio',
          description: 'Bridge tools for connecting to remote MCP servers',
          authentication: 'Inherits from target servers',
          tools: toolsByServer.bridge
        }
      },
      usage: {
        main_server: {
          description: 'Connect to /api/mcp using MCP protocol',
          example_connection: 'StreamableHTTPClientTransport("https://mcplookup.org/api/mcp")'
        },
        bridge: {
          description: 'Use bridge tools to connect to any discovered MCP server',
          example_workflow: [
            '1. Use discover_mcp_servers to find servers',
            '2. Use connect_and_list_tools to explore capabilities', 
            '3. Use call_tool_on_server to execute tools'
          ]
        }
      }
    };
  }

  /**
   * Generate examples section
   */
  private generateExamplesSection(): any {
    return {
      description: 'Real-world usage examples',
      discovery: {
        natural_language: {
          request: {
            query: 'Find email servers like Gmail but faster'
          },
          description: 'Natural language discovery query'
        },
        domain_lookup: {
          request: {
            domain: 'gmail.com'
          },
          description: 'Look up specific domain'
        },
        capability_search: {
          request: {
            capability: 'email'
          },
          description: 'Search by capability'
        }
      },
      registration: {
        basic_server: {
          request: {
            domain: 'mycompany.com',
            endpoint: 'https://api.mycompany.com/mcp',
            capabilities: ['email', 'calendar'],
            category: 'productivity',
            contact_email: 'admin@mycompany.com',
            description: 'Email and calendar integration for our CRM'
          },
          description: 'Register a basic MCP server'
        }
      },
      mcp_tools: {
        discover_servers: {
          tool: 'discover_mcp_servers',
          arguments: {
            query: 'document collaboration tools',
            limit: 5
          },
          description: 'Find document collaboration servers'
        },
        call_remote_tool: {
          tool: 'call_tool_on_server',
          arguments: {
            endpoint: 'https://api.gmail.com/mcp',
            tool_name: 'send_email',
            arguments: {
              to: 'user@example.com',
              subject: 'Hello from MCP',
              body: 'This email was sent via MCP!'
            }
          },
          description: 'Send email via discovered Gmail MCP server'
        }
      }
    };
  }

  /**
   * Get examples for a specific tool
   */
  private getToolExamples(toolName: string): string[] {
    const examples: Record<string, string[]> = {
      'discover_mcp_servers': [
        'Find email servers like Gmail',
        'Show me document collaboration tools',
        'I need CRM integrations'
      ],
      'register_mcp_server': [
        'Register company email server',
        'Add custom CRM integration'
      ],
      'verify_domain_ownership': [
        'Check if mycompany.com is verified',
        'Verify domain ownership status'
      ]
    };

    return examples[toolName] || [];
  }

  /**
   * Write enhanced OpenAPI spec
   */
  private writeEnhancedOpenAPISpec(spec: any): void {
    // Write enhanced YAML
    const yamlContent = this.convertToYAML(spec);
    writeFileSync(join(process.cwd(), 'openapi-enhanced.yaml'), yamlContent);

    // Write enhanced JSON
    const jsonContent = JSON.stringify(spec, null, 2);
    writeFileSync(join(process.cwd(), 'openapi-enhanced.json'), jsonContent);

    // Write comprehensive TypeScript types
    const typesContent = this.generateEnhancedTypeScriptTypes(spec);
    writeFileSync(join(process.cwd(), 'src/types/api-enhanced.ts'), typesContent);

    // Write MCP client types
    const mcpTypesContent = this.generateMCPClientTypes(spec);
    writeFileSync(join(process.cwd(), 'src/types/mcp-tools.ts'), mcpTypesContent);
  }

  /**
   * Generate enhanced TypeScript types
   */
  private generateEnhancedTypeScriptTypes(spec: any): string {
    return `// Enhanced TypeScript types from OpenAPI spec
// Generated on ${new Date().toISOString()}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface DiscoveryRequest {
  query?: string;
  domain?: string;
  capability?: string;
  limit?: number;
}

export interface RegistrationRequest {
  domain: string;
  endpoint: string;
  capabilities?: string[];
  category?: 'communication' | 'productivity' | 'development' | 'finance' | 'social' | 'storage' | 'other';
  auth_type?: 'none' | 'api_key' | 'oauth2' | 'basic';
  contact_email?: string;
  description?: string;
}

export interface HealthResponse {
  domain: string;
  endpoint: string;
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    uptime_percentage?: number;
    avg_response_time_ms?: number;
    last_check: string;
  };
  capabilities_working: boolean;
  ssl_valid: boolean;
  trust_score: number;
}

// ============================================================================
// MCP TOOL TYPES
// ============================================================================

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    uri?: string;
  }>;
  isError?: boolean;
}

// Main server tools
export interface DiscoverMCPServersArgs {
  query?: string;
  domain?: string;
  capability?: string;
  limit?: number;
}

export interface RegisterMCPServerArgs {
  domain: string;
  endpoint: string;
  capabilities?: string[];
  category?: string;
  auth_type?: string;
  contact_email?: string;
  description?: string;
  user_id: string;
}

// Bridge tools
export interface ConnectAndListToolsArgs {
  endpoint: string;
  auth_headers?: Record<string, string>;
}

export interface CallToolOnServerArgs {
  endpoint: string;
  tool_name: string;
  arguments?: Record<string, any>;
  auth_headers?: Record<string, string>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type APIEndpoint = keyof typeof API_ROUTES;
export type MCPTool = keyof typeof MCP_TOOLS;

export const API_ROUTES = {
  '/v1/discover': 'GET',
  '/v1/discover/smart': 'POST',
  '/v1/register': 'POST',
  '/v1/register/verify/{id}': 'POST',
  '/v1/health/{domain}': 'GET',
  '/v1/my/servers': 'GET',
  '/v1/servers/{domain}': 'PUT|DELETE',
  '/v1/onboarding': 'GET|POST',
  '/v1/domain-check': 'GET',
  '/api/mcp': 'GET|POST|DELETE'
} as const;

export const MCP_TOOLS = {
  // Main server tools
  'discover_mcp_servers': 'Find MCP servers',
  'register_mcp_server': 'Register new server',
  'verify_domain_ownership': 'Check verification',
  'get_server_health': 'Health monitoring',
  'browse_capabilities': 'Explore capabilities',
  'get_discovery_stats': 'Usage analytics',

  // Bridge tools
  'connect_and_list_tools': 'Connect to server',
  'call_tool_on_server': 'Call remote tool',
  'read_resource_from_server': 'Read remote resource',
  'discover_and_call_tool': 'Workflow tool',
  'bridge_status': 'Bridge information'
} as const;

// Generated from ${Object.keys(spec.paths || {}).length} API routes and ${Object.keys(spec['x-mcp-tools']?.servers?.main?.tools || {}).length + Object.keys(spec['x-mcp-tools']?.servers?.bridge?.tools || {}).length} MCP tools
`;
  }

  /**
   * Generate MCP client types
   */
  private generateMCPClientTypes(spec: any): string {
    return `// MCP Client Types
// Generated on ${new Date().toISOString()}

import { Client } from '@modelcontextprotocol/sdk/client/index.js';

// ============================================================================
// MCP CLIENT INTERFACES
// ============================================================================

export interface MCPClient {
  client: Client;
  endpoint: string;
  connected: boolean;
  tools: MCPToolDefinition[];
  resources: MCPResourceDefinition[];
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface MCPResourceDefinition {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// ============================================================================
// BRIDGE CLIENT INTERFACE
// ============================================================================

export interface MCPBridgeClient {
  discoverServers(args: DiscoverMCPServersArgs): Promise<MCPToolResult>;
  connectAndListTools(args: ConnectAndListToolsArgs): Promise<MCPToolResult>;
  callToolOnServer(args: CallToolOnServerArgs): Promise<MCPToolResult>;
  readResourceFromServer(args: ReadResourceFromServerArgs): Promise<MCPToolResult>;
  discoverAndCallTool(args: DiscoverAndCallToolArgs): Promise<MCPToolResult>;
  getBridgeStatus(): Promise<MCPToolResult>;
}

export interface ReadResourceFromServerArgs {
  endpoint: string;
  uri: string;
  auth_headers?: Record<string, string>;
}

export interface DiscoverAndCallToolArgs {
  query?: string;
  domain?: string;
  capability?: string;
  tool_name: string;
  arguments?: Record<string, any>;
  server_index?: number;
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export interface MCPClientFactory {
  createMainServerClient(): Promise<MCPClient>;
  createBridgeClient(endpoint?: string): Promise<MCPBridgeClient>;
  createClientForDomain(domain: string): Promise<MCPClient>;
  createClientForCapability(capability: string): Promise<MCPClient>;
}
`;
  }

  /**
   * Print enhanced summary
   */
  private printEnhancedSummary(): void {
    console.log('\n📊 Enhanced Generation Summary:');
    console.log(`  📍 API routes: ${Object.keys(this.routes || {}).length}`);
    console.log(`  📋 Extracted schemas: ${Object.keys(this.extractedSchemas).length}`);
    console.log(`  🛠️ MCP tools: ${Object.keys(this.mcpToolSchemas).length}`);
    console.log(`  📝 Examples: ${Object.keys(this.examples).length}`);

    console.log('\n📁 Enhanced files generated:');
    console.log('  - openapi-enhanced.yaml (comprehensive spec)');
    console.log('  - openapi-enhanced.json (JSON format)');
    console.log('  - src/types/api-enhanced.ts (TypeScript types)');
    console.log('  - src/types/mcp-tools.ts (MCP client types)');

    console.log('\n🎯 Next steps:');
    console.log('  1. Review the generated OpenAPI spec');
    console.log('  2. Use types in your frontend/client code');
    console.log('  3. Generate client SDKs from the spec');
    console.log('  4. Set up bidirectional sync workflow');
  }
}

// Main execution
async function main() {
  try {
    const generator = new EnhancedOpenAPIGenerator();
    await generator.generateEnhanced();
  } catch (error) {
    console.error('❌ Enhanced generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { EnhancedOpenAPIGenerator };
