#!/usr/bin/env tsx
// Bidirectional Sync: OpenAPI ↔ Bridge Tools
// Generates bridge tools from OpenAPI spec and keeps them in sync

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface OpenAPIOperation {
  summary: string;
  description: string;
  parameters?: any[];
  requestBody?: any;
  responses: any;
  tags: string[];
}

interface BridgeToolDefinition {
  name: string;
  description: string;
  schema: any;
  category: string;
  restEndpoint?: {
    path: string;
    method: string;
    parameters?: any[];
    requestBody?: any;
  };
}

class BridgeToolSyncer {
  private projectRoot: string;
  private openApiSpec: any = null;
  private bridgeTools: BridgeToolDefinition[] = [];

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Main sync function
   */
  async sync(): Promise<void> {
    console.log('🔄 Starting bidirectional sync...');
    
    console.log('📖 Loading OpenAPI spec...');
    await this.loadOpenAPISpec();
    
    console.log('🛠️ Generating bridge tools from OpenAPI...');
    await this.generateBridgeToolsFromOpenAPI();
    
    console.log('📝 Generating bridge tool implementations...');
    await this.generateBridgeImplementations();
    
    console.log('🔧 Updating bridge configuration...');
    await this.updateBridgeConfiguration();
    
    console.log('📋 Generating tool mapping...');
    await this.generateToolMapping();
    
    console.log('✅ Bidirectional sync complete!');
    this.printSyncSummary();
  }

  /**
   * Load OpenAPI specification
   */
  private async loadOpenAPISpec(): Promise<void> {
    const specPath = join(this.projectRoot, 'openapi-enhanced.json');
    
    try {
      const specContent = readFileSync(specPath, 'utf-8');
      this.openApiSpec = JSON.parse(specContent);
      console.log('  ✅ Loaded enhanced OpenAPI spec');
    } catch (error) {
      throw new Error(`Failed to load OpenAPI spec: ${error}`);
    }
  }

  /**
   * Generate bridge tools from OpenAPI paths
   */
  private async generateBridgeToolsFromOpenAPI(): Promise<void> {
    const paths = this.openApiSpec.paths || {};
    
    for (const [path, pathItem] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(pathItem as any)) {
        if (this.shouldCreateBridgeTool(path, method, operation as OpenAPIOperation)) {
          const bridgeTool = this.createBridgeToolFromOperation(path, method, operation as OpenAPIOperation);
          this.bridgeTools.push(bridgeTool);
          console.log(`  🔧 Generated bridge tool: ${bridgeTool.name}`);
        }
      }
    }
  }

  /**
   * Determine if we should create a bridge tool for this operation
   */
  private shouldCreateBridgeTool(path: string, method: string, operation: OpenAPIOperation): boolean {
    // Skip auth endpoints (handled by authentication)
    if (path.includes('/auth/')) return false;
    
    // Skip docs endpoints (not needed in bridge)
    if (path.includes('/docs')) return false;
    
    // Skip OPTIONS methods (CORS handling)
    if (method.toUpperCase() === 'OPTIONS') return false;
    
    // Include main API endpoints
    if (path.startsWith('/v1/')) return true;
    
    // Include MCP endpoint for introspection
    if (path === '/mcp') return true;
    
    return false;
  }

  /**
   * Create bridge tool definition from OpenAPI operation
   */
  private createBridgeToolFromOperation(path: string, method: string, operation: OpenAPIOperation): BridgeToolDefinition {
    const toolName = this.generateToolName(path, method);
    const schema = this.generateToolSchema(operation);
    const category = this.determineCategory(path, operation.tags);
    
    return {
      name: toolName,
      description: operation.description || operation.summary || `${method.toUpperCase()} ${path}`,
      schema,
      category,
      restEndpoint: {
        path,
        method: method.toUpperCase(),
        parameters: operation.parameters,
        requestBody: operation.requestBody
      }
    };
  }

  /**
   * Generate tool name from path and method
   */
  private generateToolName(path: string, method: string): string {
    // Convert REST endpoint to tool name
    const pathParts = path.split('/').filter(p => p && !p.startsWith('{'));
    const action = method.toLowerCase();
    
    // Special cases for common patterns
    if (path.includes('/discover') && action === 'get') {
      return 'discover_servers_via_api';
    }
    if (path.includes('/register') && action === 'post') {
      return 'register_server_via_api';
    }
    if (path.includes('/health') && action === 'get') {
      return 'check_server_health_via_api';
    }
    if (path.includes('/my/servers') && action === 'get') {
      return 'get_my_servers_via_api';
    }
    
    // General pattern: action_resource_via_api
    const resource = pathParts[pathParts.length - 1] || 'endpoint';
    return `${action}_${resource}_via_api`;
  }

  /**
   * Generate tool schema from OpenAPI operation
   */
  private generateToolSchema(operation: OpenAPIOperation): any {
    const schema: any = {
      type: 'object',
      properties: {},
      description: 'Generated from OpenAPI operation'
    };

    // Add path parameters
    if (operation.parameters) {
      for (const param of operation.parameters) {
        if (param.in === 'path') {
          schema.properties[param.name] = {
            type: param.schema?.type || 'string',
            description: param.description || `Path parameter: ${param.name}`,
            required: param.required || true
          };
        } else if (param.in === 'query') {
          schema.properties[param.name] = {
            type: param.schema?.type || 'string',
            description: param.description || `Query parameter: ${param.name}`,
            required: param.required || false
          };
        }
      }
    }

    // Add request body properties
    if (operation.requestBody?.content?.['application/json']?.schema) {
      const bodySchema = operation.requestBody.content['application/json'].schema;
      if (bodySchema.properties) {
        Object.assign(schema.properties, bodySchema.properties);
      }
    }

    // Add common bridge parameters
    schema.properties.auth_headers = {
      type: 'object',
      description: 'Optional authentication headers',
      required: false
    };

    return schema;
  }

  /**
   * Determine tool category
   */
  private determineCategory(path: string, tags: string[]): string {
    if (tags?.includes('Discovery')) return 'Discovery';
    if (tags?.includes('Registration')) return 'Registration';
    if (tags?.includes('Health')) return 'Health';
    if (tags?.includes('User Management')) return 'User Management';
    if (tags?.includes('Server Management')) return 'Server Management';
    
    // Fallback based on path
    if (path.includes('/discover')) return 'Discovery';
    if (path.includes('/register')) return 'Registration';
    if (path.includes('/health')) return 'Health';
    if (path.includes('/my/')) return 'User Management';
    if (path.includes('/servers')) return 'Server Management';
    
    return 'API Bridge';
  }

  /**
   * Generate bridge tool implementations
   */
  private async generateBridgeImplementations(): Promise<void> {
    const implementations = this.generateBridgeToolCode();
    
    // Write to bridge extensions file
    const bridgeExtensionsPath = join(this.projectRoot, 'src/lib/mcp/bridge-generated.ts');
    writeFileSync(bridgeExtensionsPath, implementations);
    
    console.log(`  📝 Generated ${this.bridgeTools.length} bridge tool implementations`);
  }

  /**
   * Generate TypeScript code for bridge tools
   */
  private generateBridgeToolCode(): string {
    return `// Generated Bridge Tools
// Auto-generated from OpenAPI spec on ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - regenerate with: npm run sync:bridge

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Generated bridge tools that map to REST API endpoints
 */
export class GeneratedBridgeTools {
  private server: McpServer;
  private apiBaseUrl: string;

  constructor(server: McpServer, apiBaseUrl: string = 'https://mcplookup.org/api') {
    this.server = server;
    this.apiBaseUrl = apiBaseUrl;
    this.setupGeneratedTools();
  }

  /**
   * Setup all generated bridge tools
   */
  private setupGeneratedTools(): void {
${this.bridgeTools.map(tool => this.generateToolImplementation(tool)).join('\n\n')}
  }

  /**
   * Make HTTP request to API endpoint
   */
  private async makeApiRequest(
    path: string, 
    method: string, 
    params: any = {}, 
    authHeaders: Record<string, string> = {}
  ): Promise<any> {
    const url = new URL(path, this.apiBaseUrl);
    
    // Add query parameters for GET requests
    if (method === 'GET' && params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && key !== 'auth_headers') {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'MCPLookup-Bridge/1.0',
      ...authHeaders
    };

    const requestOptions: RequestInit = {
      method,
      headers
    };

    // Add body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method) && params) {
      const { auth_headers, ...bodyParams } = params;
      requestOptions.body = JSON.stringify(bodyParams);
    }

    try {
      const response = await fetch(url.toString(), requestOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(\`API request failed: \${response.status} \${data.error || response.statusText}\`);
      }
      
      return data;
    } catch (error) {
      throw new Error(\`Bridge API request failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }
}

// Export tool schemas for validation
export const GENERATED_TOOL_SCHEMAS = {
${this.bridgeTools.map(tool => `  '${tool.name}': ${JSON.stringify(tool.schema, null, 2)}`).join(',\n')}
};

// Export tool metadata
export const GENERATED_TOOL_METADATA = [
${this.bridgeTools.map(tool => `  {
    name: '${tool.name}',
    description: '${tool.description}',
    category: '${tool.category}',
    restEndpoint: ${JSON.stringify(tool.restEndpoint, null, 4)}
  }`).join(',\n')}
];
`;
  }

  /**
   * Generate implementation for a single tool
   */
  private generateToolImplementation(tool: BridgeToolDefinition): string {
    const schemaValidation = this.generateSchemaValidation(tool.schema);
    
    return `    // ${tool.description}
    this.server.tool(
      '${tool.name}',
      ${JSON.stringify(tool.schema, null, 6)},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '${tool.restEndpoint?.path}',
            '${tool.restEndpoint?.method}',
            apiParams,
            auth_headers
          );
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: \`Error calling ${tool.name}: \${error instanceof Error ? error.message : 'Unknown error'}\`
            }],
            isError: true
          };
        }
      }
    );`;
  }

  /**
   * Generate schema validation code
   */
  private generateSchemaValidation(schema: any): string {
    // For now, return basic validation
    // In a full implementation, you'd generate proper Zod schemas
    return `// Schema validation would go here`;
  }

  /**
   * Update bridge configuration to include generated tools
   */
  private async updateBridgeConfiguration(): Promise<void> {
    const configPath = join(this.projectRoot, 'src/lib/mcp/bridge-config.ts');

    const configContent = `// Bridge Configuration
// Auto-generated from OpenAPI spec on ${new Date().toISOString()}

export interface BridgeConfig {
  apiBaseUrl: string;
  enabledTools: string[];
  toolCategories: Record<string, string[]>;
  endpointMappings: Record<string, {
    path: string;
    method: string;
    description: string;
  }>;
}

export const BRIDGE_CONFIG: BridgeConfig = {
  apiBaseUrl: process.env.MCPLOOKUP_API_URL || 'https://mcplookup.org/api',

  enabledTools: [
${this.bridgeTools.map(tool => `    '${tool.name}'`).join(',\n')}
  ],

  toolCategories: {
${this.generateToolCategories()}
  },

  endpointMappings: {
${this.bridgeTools.map(tool => `    '${tool.name}': {
      path: '${tool.restEndpoint?.path}',
      method: '${tool.restEndpoint?.method}',
      description: '${tool.description}'
    }`).join(',\n')}
  }
};

// Tool category helpers
export const getToolsByCategory = (category: string): string[] => {
  return BRIDGE_CONFIG.toolCategories[category] || [];
};

export const getToolEndpoint = (toolName: string) => {
  return BRIDGE_CONFIG.endpointMappings[toolName];
};
`;

    writeFileSync(configPath, configContent);
    console.log('  ⚙️ Updated bridge configuration');
  }

  /**
   * Generate tool categories mapping
   */
  private generateToolCategories(): string {
    const categories: Record<string, string[]> = {};

    for (const tool of this.bridgeTools) {
      if (!categories[tool.category]) {
        categories[tool.category] = [];
      }
      categories[tool.category].push(tool.name);
    }

    return Object.entries(categories)
      .map(([category, tools]) => `    '${category}': [\n${tools.map(tool => `      '${tool}'`).join(',\n')}\n    ]`)
      .join(',\n');
  }

  /**
   * Generate tool mapping documentation
   */
  private async generateToolMapping(): Promise<void> {
    const mappingPath = join(this.projectRoot, 'BRIDGE_TOOL_MAPPING.md');

    const mappingContent = `# Bridge Tool Mapping

Auto-generated mapping between REST API endpoints and MCP bridge tools.
Generated on ${new Date().toISOString()}

## Overview

This document shows how REST API endpoints are mapped to MCP bridge tools for seamless integration.

## Tool Categories

${Object.entries(this.getToolsByCategory()).map(([category, tools]) => `
### ${category}

${tools.map(tool => `- \`${tool.name}\``).join('\n')}
`).join('')}

## Detailed Mappings

${this.bridgeTools.map(tool => `
### \`${tool.name}\`

**Description**: ${tool.description}
**Category**: ${tool.category}
**REST Endpoint**: \`${tool.restEndpoint?.method} ${tool.restEndpoint?.path}\`

**Parameters**:
\`\`\`json
${JSON.stringify(tool.schema.properties, null, 2)}
\`\`\`

**Usage Example**:
\`\`\`typescript
const result = await bridgeClient.callTool('${tool.name}', {
  // Add parameters here based on the schema above
});
\`\`\`

---
`).join('')}

## Integration Guide

### Using Generated Bridge Tools

1. **Import the generated tools**:
\`\`\`typescript
import { GeneratedBridgeTools } from './src/lib/mcp/bridge-generated';
\`\`\`

2. **Initialize with your MCP server**:
\`\`\`typescript
const bridgeTools = new GeneratedBridgeTools(mcpServer);
\`\`\`

3. **Tools are automatically registered** and available for use.

### Configuration

Bridge configuration is managed in \`src/lib/mcp/bridge-config.ts\`:

- **API Base URL**: Configure the target API endpoint
- **Enabled Tools**: Control which tools are active
- **Tool Categories**: Organize tools by functionality
- **Endpoint Mappings**: Map tools to REST endpoints

### Regeneration

To regenerate bridge tools after API changes:

\`\`\`bash
npm run sync:bridge
\`\`\`

This will:
1. Analyze the current OpenAPI spec
2. Generate new bridge tool implementations
3. Update configuration and mappings
4. Maintain sync between API and bridge

## Tool Count Summary

- **Total Tools**: ${this.bridgeTools.length}
- **Categories**: ${Object.keys(this.getToolsByCategory()).length}
- **API Endpoints Covered**: ${new Set(this.bridgeTools.map(t => `${t.restEndpoint?.method} ${t.restEndpoint?.path}`)).size}
`;

    writeFileSync(mappingPath, mappingContent);
    console.log('  📋 Generated tool mapping documentation');
  }

  /**
   * Get tools grouped by category
   */
  private getToolsByCategory(): Record<string, BridgeToolDefinition[]> {
    const categories: Record<string, BridgeToolDefinition[]> = {};

    for (const tool of this.bridgeTools) {
      if (!categories[tool.category]) {
        categories[tool.category] = [];
      }
      categories[tool.category].push(tool);
    }

    return categories;
  }

  /**
   * Print sync summary
   */
  private printSyncSummary(): void {
    console.log('\n📊 Bidirectional Sync Summary:');
    console.log(`  🛠️ Bridge tools generated: ${this.bridgeTools.length}`);
    console.log(`  📂 Categories: ${Object.keys(this.getToolsByCategory()).length}`);
    console.log(`  🔗 API endpoints mapped: ${new Set(this.bridgeTools.map(t => `${t.restEndpoint?.method} ${t.restEndpoint?.path}`)).size}`);

    console.log('\n📁 Files generated/updated:');
    console.log('  - src/lib/mcp/bridge-generated.ts (tool implementations)');
    console.log('  - src/lib/mcp/bridge-config.ts (configuration)');
    console.log('  - BRIDGE_TOOL_MAPPING.md (documentation)');

    console.log('\n🔄 Tool Categories:');
    Object.entries(this.getToolsByCategory()).forEach(([category, tools]) => {
      console.log(`  ${category}: ${tools.length} tools`);
    });

    console.log('\n🎯 Next Steps:');
    console.log('  1. Review generated bridge tools');
    console.log('  2. Test bridge tool functionality');
    console.log('  3. Update main bridge.ts to use generated tools');
    console.log('  4. Set up automated sync in CI/CD');
  }
}

// Main execution
async function main() {
  try {
    const syncer = new BridgeToolSyncer();
    await syncer.sync();
  } catch (error) {
    console.error('❌ Bridge sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { BridgeToolSyncer };
