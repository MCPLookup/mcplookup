// MCP Route Factory - Clean, modular MCP server implementation
// Replaces monolithic route with dependency injection and separation of concerns

import { createMcpHandler } from '@vercel/mcp-adapter';
import { ToolRegistry } from './tools/base-tool';
import { ServiceContainerFactory } from './services/service-container';
import { extractMCPAuth } from './auth-wrapper';

// Import all tool implementations
import { DiscoverServersTool } from './tools/discover-servers-tool';
import { RegisterServerTool, VerifyDomainTool } from './tools/register-server-tool';

/**
 * MCP Route Factory
 * Creates clean, testable MCP handlers with dependency injection
 */
export class MCPRouteFactory {
  private toolRegistry: ToolRegistry;

  constructor() {
    this.toolRegistry = new ToolRegistry();
    this.registerTools();
  }

  /**
   * Register all available tools
   */
  private registerTools(): void {
    // Discovery tools
    this.toolRegistry.register(new DiscoverServersTool());
    
    // Registration tools
    this.toolRegistry.register(new RegisterServerTool());
    this.toolRegistry.register(new VerifyDomainTool());
    
    // TODO: Add other tools as they are refactored
    // this.toolRegistry.register(new GetServerHealthTool());
    // this.toolRegistry.register(new BrowseCapabilitiesTool());
    // this.toolRegistry.register(new GetDiscoveryStatsTool());
  }

  /**
   * Create MCP handler with dependency injection
   */
  createHandler() {
    return createMcpHandler((server) => {
      // Register all tools from registry
      const tools = this.toolRegistry.getAll();
      
      tools.forEach(tool => {
        const config = tool.getConfig();
        
        server.tool(
          config.name,
          config.description,
          config.schema,
          async (args, request) => {
            try {
              // Extract authentication context
              const auth = await extractMCPAuth(request);
              
              // Get service container
              const services = ServiceContainerFactory.getInstance();
              
              // Create tool context with dependency injection
              const context = {
                auth,
                services,
                request
              };
              
              // Execute tool with injected dependencies
              return await tool.execute(args, context);
              
            } catch (error) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    error: 'Tool execution failed',
                    tool: config.name,
                    message: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date().toISOString()
                  }, null, 2)
                }]
              };
            }
          }
        );
      });

      // Add meta tool for listing available tools
      server.tool(
        'list_mcp_tools',
        'List all available MCP tools provided by this discovery server.',
        {},
        async () => {
          const toolConfigs = this.toolRegistry.getConfigs();
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                server_info: {
                  name: 'MCP Lookup Discovery Server',
                  description: 'The master MCP server that discovers all other MCP servers',
                  endpoint: 'https://mcplookup.org/api/mcp',
                  protocol_version: '2024-11-05',
                  capabilities: ['tools', 'discovery', 'registration', 'verification', 'monitoring']
                },
                tools: toolConfigs.map(config => ({
                  name: config.name,
                  description: config.description,
                  required_permissions: config.requiredPermissions || []
                })),
                total_tools: toolConfigs.length,
                categories: ['discovery', 'registration', 'verification', 'monitoring', 'analytics', 'meta'],
                usage_instructions: [
                  'Use discover_mcp_servers for finding servers',
                  'Use register_mcp_server to add new servers',
                  'Use verify_domain_ownership to check verification',
                  'All tools require proper API key authentication'
                ],
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        }
      );
    });
  }

  /**
   * Get tool registry (for testing)
   */
  getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }
}

/**
 * Create production MCP handler
 */
export function createMCPHandler() {
  const factory = new MCPRouteFactory();
  return factory.createHandler();
}

/**
 * Create test MCP handler with mock services
 */
export function createTestMCPHandler(mockServices?: any) {
  if (mockServices) {
    ServiceContainerFactory.setInstance(mockServices);
  }
  
  const factory = new MCPRouteFactory();
  return factory.createHandler();
}
