#!/usr/bin/env tsx
// OpenAPI Generation Script
// Analyzes actual API routes and MCP tools to generate accurate OpenAPI spec

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// Types for our analysis
interface RouteInfo {
  path: string;
  methods: string[];
  file: string;
  schemas?: {
    request?: any;
    response?: any;
    params?: any;
  };
  description?: string;
  tags?: string[];
}

interface MCPToolInfo {
  name: string;
  description: string;
  schema: any;
  server: 'main' | 'bridge';
  category?: string;
  examples?: string[];
}

class OpenAPIGenerator {
  private routes: RouteInfo[] = [];
  private mcpTools: MCPToolInfo[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Main generation function
   */
  async generate(): Promise<void> {
    console.log('🔍 Analyzing API routes...');
    await this.analyzeRoutes();
    
    console.log('🛠️ Analyzing MCP tools...');
    await this.analyzeMCPTools();
    
    console.log('📝 Generating OpenAPI spec...');
    const openApiSpec = this.generateOpenAPISpec();
    
    console.log('💾 Writing OpenAPI spec...');
    this.writeOpenAPISpec(openApiSpec);
    
    console.log('✅ OpenAPI spec generated successfully!');
    this.printSummary();
  }

  /**
   * Analyze all API routes in src/app/api
   */
  private async analyzeRoutes(): Promise<void> {
    const apiDir = join(this.projectRoot, 'src/app/api');
    await this.scanDirectory(apiDir, '');
  }

  /**
   * Recursively scan directory for route files
   */
  private async scanDirectory(dir: string, basePath: string): Promise<void> {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Handle dynamic routes like [domain], [id], etc.
        const pathSegment = item.startsWith('[') && item.endsWith(']') 
          ? `{${item.slice(1, -1)}}` 
          : item;
        
        await this.scanDirectory(fullPath, `${basePath}/${pathSegment}`);
      } else if (item === 'route.ts') {
        await this.analyzeRouteFile(fullPath, basePath);
      }
    }
  }

  /**
   * Analyze a specific route file
   */
  private async analyzeRouteFile(filePath: string, routePath: string): Promise<void> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      
      // Extract HTTP methods
      const methods = this.extractMethods(content);
      
      // Extract schemas and descriptions
      const schemas = this.extractSchemas(content);
      const description = this.extractDescription(content);
      const tags = this.extractTags(routePath);
      
      // Clean up route path
      const cleanPath = routePath.replace('/api', '').replace(/\/+/g, '/');
      
      this.routes.push({
        path: cleanPath || '/',
        methods,
        file: filePath,
        schemas,
        description,
        tags
      });
      
      console.log(`  📍 Found route: ${methods.join(', ')} ${cleanPath}`);
    } catch (error) {
      console.warn(`  ⚠️ Failed to analyze ${filePath}:`, error);
    }
  }

  /**
   * Extract HTTP methods from route file content
   */
  private extractMethods(content: string): string[] {
    const methods: string[] = [];
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    
    for (const method of httpMethods) {
      if (content.includes(`export async function ${method}(`)) {
        methods.push(method);
      }
    }
    
    return methods;
  }

  /**
   * Extract Zod schemas from route file content
   */
  private extractSchemas(content: string): any {
    const schemas: any = {};
    
    // Look for schema definitions
    const schemaRegex = /const\s+(\w*Schema)\s*=\s*z\./g;
    let match;
    
    while ((match = schemaRegex.exec(content)) !== null) {
      const schemaName = match[1];
      schemas[schemaName] = `Found schema: ${schemaName}`;
    }
    
    // Look for validation calls
    if (content.includes('.parse(') || content.includes('.safeParse(')) {
      schemas.hasValidation = true;
    }
    
    return schemas;
  }

  /**
   * Extract description from comments
   */
  private extractDescription(content: string): string {
    const lines = content.split('\n');
    const comments: string[] = [];
    
    for (const line of lines.slice(0, 10)) { // Check first 10 lines
      const trimmed = line.trim();
      if (trimmed.startsWith('//') && !trimmed.includes('Next.js')) {
        comments.push(trimmed.replace('//', '').trim());
      }
    }
    
    return comments.join(' ').trim() || 'API endpoint';
  }

  /**
   * Extract tags based on route path
   */
  private extractTags(routePath: string): string[] {
    const tags: string[] = [];
    
    if (routePath.includes('/discover')) tags.push('Discovery');
    if (routePath.includes('/register')) tags.push('Registration');
    if (routePath.includes('/health')) tags.push('Health');
    if (routePath.includes('/verify')) tags.push('Verification');
    if (routePath.includes('/my/')) tags.push('User Management');
    if (routePath.includes('/servers')) tags.push('Server Management');
    if (routePath.includes('/onboarding')) tags.push('Onboarding');
    if (routePath.includes('/mcp')) tags.push('MCP Protocol');
    if (routePath.includes('/docs')) tags.push('Documentation');
    
    return tags.length > 0 ? tags : ['API'];
  }

  /**
   * Analyze MCP tools from both main server and bridge
   */
  private async analyzeMCPTools(): Promise<void> {
    // Analyze main MCP server
    await this.analyzeMCPServer();
    
    // Analyze bridge tools
    await this.analyzeBridgeTools();
  }

  /**
   * Analyze main MCP server tools
   */
  private async analyzeMCPServer(): Promise<void> {
    const mcpFile = join(this.projectRoot, 'src/app/api/mcp/route.ts');
    
    try {
      const content = readFileSync(mcpFile, 'utf-8');
      
      // Extract tool definitions
      const toolRegex = /server\.tool\(\s*'([^']+)',\s*'([^']+)',\s*{([^}]+)}/g;
      let match;
      
      while ((match = toolRegex.exec(content)) !== null) {
        const [, name, description] = match;
        
        this.mcpTools.push({
          name,
          description,
          schema: `Extracted from MCP server`,
          server: 'main',
          category: this.categorizeTool(name)
        });
        
        console.log(`  🛠️ Found MCP tool: ${name} (main server)`);
      }
    } catch (error) {
      console.warn('  ⚠️ Failed to analyze MCP server:', error);
    }
  }

  /**
   * Analyze bridge tools
   */
  private async analyzeBridgeTools(): Promise<void> {
    const bridgeFile = join(this.projectRoot, 'src/lib/mcp/bridge.ts');
    
    try {
      const content = readFileSync(bridgeFile, 'utf-8');
      
      // Extract tool definitions
      const toolRegex = /this\.server\.tool\(\s*'([^']+)',\s*{([^}]+)}/g;
      let match;
      
      while ((match = toolRegex.exec(content)) !== null) {
        const [, name] = match;
        
        this.mcpTools.push({
          name,
          description: `Bridge tool for ${name}`,
          schema: `Extracted from bridge`,
          server: 'bridge',
          category: 'Bridge'
        });
        
        console.log(`  🌉 Found bridge tool: ${name}`);
      }
    } catch (error) {
      console.warn('  ⚠️ Failed to analyze bridge tools:', error);
    }
  }

  /**
   * Categorize MCP tool
   */
  private categorizeTool(name: string): string {
    if (name.includes('discover')) return 'Discovery';
    if (name.includes('register')) return 'Registration';
    if (name.includes('verify')) return 'Verification';
    if (name.includes('health')) return 'Monitoring';
    if (name.includes('stats')) return 'Analytics';
    if (name.includes('browse')) return 'Exploration';
    return 'General';
  }

  /**
   * Generate the complete OpenAPI specification
   */
  private generateOpenAPISpec(): any {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'MCPLookup.org API',
        version: '1.0.0',
        description: this.generateDescription(),
        contact: {
          name: 'MCPLookup.org Support',
          url: 'https://github.com/TSavo/mcplookup.org',
          email: 'support@mcplookup.org'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: 'https://mcplookup.org/api',
          description: 'Production API'
        },
        {
          url: 'http://localhost:3000/api',
          description: 'Development API'
        }
      ],
      tags: this.generateTags(),
      paths: this.generatePaths(),
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'API key authentication'
          }
        },
        schemas: this.generateSchemas()
      },
      'x-mcp-tools': this.generateMCPToolsSection()
    };

    return spec;
  }

  /**
   * Generate API description
   */
  private generateDescription(): string {
    return `
# MCPLookup.org API

The universal MCP (Model Context Protocol) server discovery service API.

## Features

- **🔍 Smart Discovery**: Natural language queries and intent-based search
- **🚀 Real-time Health**: Live server status and performance metrics
- **🔐 DNS Verification**: Cryptographic proof of domain ownership
- **📊 Analytics**: Usage statistics and discovery patterns
- **🌐 CORS Support**: Web-friendly with comprehensive CORS metadata
- **⚡ High Performance**: Edge-deployed with global CDN

## API Structure

This API provides both REST endpoints and MCP tools:

### REST API
Standard HTTP endpoints for web integrations and direct API access.

### MCP Tools
Native MCP protocol tools for AI agents and MCP clients.

## Authentication

Most endpoints are public. Optional API keys provide enhanced features:
- Higher rate limits
- Priority support
- Advanced analytics
- Beta feature access

## Rate Limits

- **Public**: 100 requests/hour per IP
- **Authenticated**: 1000 requests/hour per API key
- **Burst**: Up to 10 requests/second

Generated from actual API implementation on ${new Date().toISOString()}
    `.trim();
  }

  /**
   * Generate tags from discovered routes
   */
  private generateTags(): any[] {
    const tagSet = new Set<string>();

    this.routes.forEach(route => {
      route.tags?.forEach(tag => tagSet.add(tag));
    });

    this.mcpTools.forEach(tool => {
      if (tool.category) tagSet.add(tool.category);
    });

    return Array.from(tagSet).map(tag => ({
      name: tag,
      description: this.getTagDescription(tag)
    }));
  }

  /**
   * Get description for a tag
   */
  private getTagDescription(tag: string): string {
    const descriptions: Record<string, string> = {
      'Discovery': 'Find and search MCP servers',
      'Registration': 'Register and verify MCP servers',
      'Health': 'Server health and status monitoring',
      'Verification': 'Domain ownership verification',
      'User Management': 'User-specific operations',
      'Server Management': 'Server CRUD operations',
      'Onboarding': 'User onboarding flow',
      'MCP Protocol': 'Native MCP protocol endpoints',
      'Documentation': 'API documentation and specs',
      'Bridge': 'Bridge tools for connecting to remote servers',
      'Monitoring': 'Health and performance monitoring',
      'Analytics': 'Usage statistics and insights',
      'Exploration': 'Browse and explore capabilities'
    };

    return descriptions[tag] || `${tag} operations`;
  }

  /**
   * Generate OpenAPI paths from discovered routes
   */
  private generatePaths(): any {
    const paths: any = {};

    this.routes.forEach(route => {
      if (!paths[route.path]) {
        paths[route.path] = {};
      }

      route.methods.forEach(method => {
        paths[route.path][method.toLowerCase()] = this.generateOperation(route, method);
      });
    });

    return paths;
  }

  /**
   * Generate OpenAPI operation for a route method
   */
  private generateOperation(route: RouteInfo, method: string): any {
    const operation: any = {
      summary: this.generateSummary(route, method),
      description: route.description || 'API endpoint',
      tags: route.tags || ['API']
    };

    // Add parameters for path variables
    if (route.path.includes('{')) {
      operation.parameters = this.generateParameters(route.path);
    }

    // Add request body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      operation.requestBody = this.generateRequestBody(route);
    }

    // Add query parameters for GET
    if (method === 'GET') {
      operation.parameters = [
        ...(operation.parameters || []),
        ...this.generateQueryParameters(route)
      ];
    }

    // Add responses
    operation.responses = this.generateResponses(route, method);

    return operation;
  }

  /**
   * Generate summary for operation
   */
  private generateSummary(route: RouteInfo, method: string): string {
    const pathParts = route.path.split('/').filter(p => p);
    const resource = pathParts[pathParts.length - 1] || 'root';

    const summaries: Record<string, string> = {
      'GET': `Get ${resource}`,
      'POST': `Create ${resource}`,
      'PUT': `Update ${resource}`,
      'DELETE': `Delete ${resource}`,
      'PATCH': `Modify ${resource}`,
      'OPTIONS': `Options for ${resource}`
    };

    return summaries[method] || `${method} ${resource}`;
  }

  /**
   * Generate path parameters
   */
  private generateParameters(path: string): any[] {
    const params: any[] = [];
    const paramRegex = /{([^}]+)}/g;
    let match;

    while ((match = paramRegex.exec(path)) !== null) {
      const paramName = match[1];
      params.push({
        name: paramName,
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: `${paramName} parameter`
      });
    }

    return params;
  }

  /**
   * Generate query parameters for GET requests
   */
  private generateQueryParameters(route: RouteInfo): any[] {
    const params: any[] = [];

    // Add common query parameters based on route
    if (route.path.includes('/discover')) {
      params.push(
        {
          name: 'query',
          in: 'query',
          schema: { type: 'string' },
          description: 'Natural language search query'
        },
        {
          name: 'domain',
          in: 'query',
          schema: { type: 'string' },
          description: 'Specific domain to search for'
        },
        {
          name: 'capability',
          in: 'query',
          schema: { type: 'string' },
          description: 'Required capability'
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Maximum number of results'
        }
      );
    }

    if (route.path.includes('/health')) {
      params.push({
        name: 'realtime',
        in: 'query',
        schema: { type: 'boolean', default: false },
        description: 'Perform real-time health check'
      });
    }

    return params;
  }

  /**
   * Generate request body for POST/PUT/PATCH
   */
  private generateRequestBody(route: RouteInfo): any {
    return {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            description: 'Request payload'
          }
        }
      }
    };
  }

  /**
   * Generate responses
   */
  private generateResponses(route: RouteInfo, method: string): any {
    const responses: any = {
      '200': {
        description: 'Success',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Success response'
            }
          }
        }
      },
      '400': {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' },
                details: { type: 'string' }
              }
            }
          }
        }
      },
      '500': {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      }
    };

    // Add method-specific responses
    if (method === 'POST' && route.path.includes('/register')) {
      responses['201'] = {
        description: 'Created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Registration created'
            }
          }
        }
      };
    }

    if (route.path.includes('/verify') || route.path.includes('/auth')) {
      responses['401'] = {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' }
              }
            }
          }
        }
      };
    }

    return responses;
  }

  /**
   * Generate component schemas
   */
  private generateSchemas(): any {
    return {
      MCPServerRecord: {
        type: 'object',
        description: 'Complete MCP server record',
        properties: {
          domain: { type: 'string', description: 'Server domain' },
          endpoint: { type: 'string', format: 'uri', description: 'MCP endpoint URL' },
          name: { type: 'string', description: 'Server display name' },
          description: { type: 'string', description: 'Server description' },
          capabilities: {
            type: 'array',
            items: { type: 'string' },
            description: 'Server capabilities'
          },
          health: {
            type: 'object',
            description: 'Health status',
            properties: {
              status: {
                type: 'string',
                enum: ['healthy', 'degraded', 'unhealthy', 'unknown']
              },
              last_check: { type: 'string', format: 'date-time' }
            }
          },
          verified: { type: 'boolean', description: 'Domain verification status' },
          trust_score: { type: 'integer', minimum: 0, maximum: 100 },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      DiscoveryResponse: {
        type: 'object',
        description: 'Server discovery response',
        properties: {
          servers: {
            type: 'array',
            items: { $ref: '#/components/schemas/MCPServerRecord' }
          },
          total: { type: 'integer', description: 'Total matching servers' },
          query_analysis: {
            type: 'object',
            description: 'Analysis of search query'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        description: 'Error response',
        properties: {
          error: { type: 'string', description: 'Error message' },
          details: { type: 'string', description: 'Error details' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    };
  }

  /**
   * Generate MCP tools section
   */
  private generateMCPToolsSection(): any {
    const toolsByServer = {
      main: this.mcpTools.filter(t => t.server === 'main'),
      bridge: this.mcpTools.filter(t => t.server === 'bridge')
    };

    return {
      description: 'MCP (Model Context Protocol) tools available in this system',
      servers: {
        main: {
          endpoint: '/api/mcp',
          description: 'Main MCP server for discovery and registration',
          tools: toolsByServer.main.map(tool => ({
            name: tool.name,
            description: tool.description,
            category: tool.category,
            schema: 'See MCP server introspection'
          }))
        },
        bridge: {
          description: 'Bridge tools for connecting to remote MCP servers',
          tools: toolsByServer.bridge.map(tool => ({
            name: tool.name,
            description: tool.description,
            category: tool.category,
            schema: 'See bridge introspection'
          }))
        }
      },
      usage: {
        main_server: 'Connect to /api/mcp using MCP protocol',
        bridge: 'Use bridge tools to connect to any discovered MCP server',
        discovery_workflow: [
          '1. Use discover_mcp_servers to find servers',
          '2. Use connect_and_list_tools to explore capabilities',
          '3. Use call_tool_on_server to execute tools',
          '4. Use read_resource_from_server to access resources'
        ]
      }
    };
  }

  /**
   * Write OpenAPI spec to files
   */
  private writeOpenAPISpec(spec: any): void {
    // Write YAML version
    const yamlContent = this.convertToYAML(spec);
    writeFileSync(join(this.projectRoot, 'openapi-generated.yaml'), yamlContent);

    // Write JSON version
    const jsonContent = JSON.stringify(spec, null, 2);
    writeFileSync(join(this.projectRoot, 'openapi-generated.json'), jsonContent);

    // Write TypeScript types
    const typesContent = this.generateTypeScriptTypes(spec);
    writeFileSync(join(this.projectRoot, 'src/types/api-generated.ts'), typesContent);
  }

  /**
   * Convert spec to YAML (simple implementation)
   */
  private convertToYAML(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        yaml += `${spaces}${key}: null\n`;
      } else if (typeof value === 'string') {
        yaml += `${spaces}${key}: "${value}"\n`;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        yaml += `${spaces}${key}: ${value}\n`;
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n`;
            yaml += this.convertToYAML(item, indent + 2).replace(/^/gm, '    ');
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else if (typeof value === 'object') {
        yaml += `${spaces}${key}:\n`;
        yaml += this.convertToYAML(value, indent + 1);
      }
    }

    return yaml;
  }

  /**
   * Generate TypeScript types from OpenAPI spec
   */
  private generateTypeScriptTypes(spec: any): string {
    return `// Generated TypeScript types from OpenAPI spec
// Generated on ${new Date().toISOString()}

export interface MCPServerRecord {
  domain: string;
  endpoint: string;
  name: string;
  description: string;
  capabilities: string[];
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    last_check: string;
  };
  verified: boolean;
  trust_score: number;
  created_at: string;
  updated_at: string;
}

export interface DiscoveryResponse {
  servers: MCPServerRecord[];
  total: number;
  query_analysis: Record<string, any>;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
}

// MCP Tool definitions
export interface MCPTool {
  name: string;
  description: string;
  category?: string;
  server: 'main' | 'bridge';
}

// API route information
export interface APIRoute {
  path: string;
  methods: string[];
  description: string;
  tags: string[];
}

// Generated from ${this.routes.length} routes and ${this.mcpTools.length} MCP tools
`;
  }

  /**
   * Print generation summary
   */
  private printSummary(): void {
    console.log('\n📊 Generation Summary:');
    console.log(`  📍 Routes analyzed: ${this.routes.length}`);
    console.log(`  🛠️ MCP tools found: ${this.mcpTools.length}`);
    console.log(`    - Main server: ${this.mcpTools.filter(t => t.server === 'main').length}`);
    console.log(`    - Bridge: ${this.mcpTools.filter(t => t.server === 'bridge').length}`);

    console.log('\n📁 Files generated:');
    console.log('  - openapi-generated.yaml');
    console.log('  - openapi-generated.json');
    console.log('  - src/types/api-generated.ts');

    console.log('\n🔍 Routes discovered:');
    this.routes.forEach(route => {
      console.log(`  ${route.methods.join(', ').padEnd(20)} ${route.path}`);
    });

    console.log('\n🛠️ MCP tools discovered:');
    this.mcpTools.forEach(tool => {
      console.log(`  ${tool.server.padEnd(8)} ${tool.name} (${tool.category})`);
    });
  }
}

// Main execution
async function main() {
  try {
    const generator = new OpenAPIGenerator();
    await generator.generate();
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { OpenAPIGenerator };
