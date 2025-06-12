// Core MCP tools that interact with mcplookup.org API

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MCPLookupAPIClient } from '@mcplookup-org/mcp-sdk';
import {
  DiscoveryOptions,
  RegistrationOptions,
  InvokeToolOptions,
  HealthCheckOptions,
  SmartDiscoveryOptions,
  DomainVerificationOptions,
  DomainOwnershipOptions,
  ToolCallResult
} from '@mcplookup-org/mcp-sdk';
import { ToolInvoker } from './tool-invoker.js';
import {
  createSuccessResult,
  executeWithErrorHandling
} from '@mcplookup-org/mcp-sdk';

export class CoreTools {
  private apiClient: MCPLookupAPIClient;
  private toolInvoker: ToolInvoker;

  constructor(apiClient: MCPLookupAPIClient) {
    this.apiClient = apiClient;
    this.toolInvoker = new ToolInvoker();
  }

  /**
   * Register all core tools with the MCP server
   */
  registerTools(server: McpServer): void {
    this.registerDiscoveryTools(server);
    this.registerRegistrationTools(server);
    this.registerMonitoringTools(server);
    this.registerInvocationTools(server);
  }

  private registerDiscoveryTools(server: McpServer): void {
    // Tool 1: Discover MCP servers
    server.tool(
      'discover_mcp_servers',
      {
        query: z.string().optional().describe('Natural language query'),
        intent: z.string().optional().describe('Specific intent or use case'),
        domain: z.string().optional().describe('Specific domain to search for'),
        capability: z.string().optional().describe('Specific capability to search for'),
        category: z.enum(['communication', 'productivity', 'development', 'finance', 'social', 'storage', 'other']).optional(),
        transport: z.enum(['sse', 'stdio', 'http']).optional().describe('Preferred transport protocol'),
        verified_only: z.boolean().optional().describe('Only return verified servers'),
        limit: z.number().optional().describe('Maximum number of results (default: 10)'),
        offset: z.number().optional().describe('Offset for pagination (default: 0)')
      },
      async (options: DiscoveryOptions) => this.discoverServers(options)
    );

    // Tool 2: Smart discovery with AI
    server.tool(
      'discover_smart',
      {
        query: z.string().describe('Natural language query describing what you need'),
        context: z.string().optional().describe('Additional context about your use case'),
        limit: z.number().optional().describe('Maximum number of results (default: 5)')
      },
      async (options: SmartDiscoveryOptions) => this.smartDiscovery(options)
    );
  }

  private registerRegistrationTools(server: McpServer): void {
    // Tool 3: Register a new MCP server
    server.tool(
      'register_server',
      {
        domain: z.string().describe('Domain of the MCP server'),
        endpoint: z.string().describe('MCP server endpoint URL'),
        contact_email: z.string().describe('Contact email for verification'),
        description: z.string().optional().describe('Description of the server')
      },
      async (options: RegistrationOptions) => this.registerServer(options)
    );

    // Tool 4: Verify domain ownership
    server.tool(
      'verify_domain',
      {
        domain: z.string().describe('Domain to verify ownership for')
      },
      async (options: DomainVerificationOptions) => this.verifyDomain(options)
    );

    // Tool 5: Check domain ownership status
    server.tool(
      'check_domain_ownership',
      {
        domain: z.string().describe('Domain to check ownership status for')
      },
      async (options: DomainOwnershipOptions) => this.checkDomainOwnership(options)
    );
  }

  private registerMonitoringTools(server: McpServer): void {
    // Tool 6: Get server health metrics
    server.tool(
      'get_server_health',
      {
        server_id: z.string().optional().describe('Specific server ID to check'),
        limit: z.number().optional().describe('Maximum number of results')
      },
      async (options: HealthCheckOptions) => this.getServerHealth(options)
    );

    // Tool 7: Get user onboarding state
    server.tool(
      'get_onboarding_state',
      {},
      async () => this.getOnboardingState()
    );
  }

  private registerInvocationTools(server: McpServer): void {
    // Tool 8: Invoke tool on any MCP server
    server.tool(
      'invoke_tool',
      {
        endpoint: z.string().describe('MCP server endpoint URL'),
        tool_name: z.string().describe('Name of the tool to invoke'),
        arguments: z.record(z.any()).describe('Arguments to pass to the tool'),
        headers: z.record(z.string()).optional().describe('Optional HTTP headers for authentication')
      },
      async (options: InvokeToolOptions) => this.invokeTool(options)
    );
  }

  // Implementation methods
  private async discoverServers(options: DiscoveryOptions): Promise<ToolCallResult> {
    return executeWithErrorHandling(async () => {
      const requestBody: any = {};

      if (options.query) requestBody.query = options.query;
      if (options.intent) requestBody.intent = options.intent;
      if (options.limit) requestBody.limit = options.limit;

      if (options.transport) {
        requestBody.technical = { transport: options.transport };
      }

      if (options.domain) {
        requestBody.query = requestBody.query ? `${requestBody.query} domain:${options.domain}` : `domain:${options.domain}`;
      }

      if (options.capability) {
        requestBody.query = requestBody.query ? `${requestBody.query} capability:${options.capability}` : `capability:${options.capability}`;
      }

      const result = await this.apiClient.discover(requestBody);
      return result;
    }, 'Error discovering servers');
  }

  private async smartDiscovery(options: SmartDiscoveryOptions): Promise<ToolCallResult> {
    return executeWithErrorHandling(async () => {
      const result = await this.apiClient.smartDiscover({
        query: options.query,
        context: options.context,
        max_results: options.limit
      });
      return result;
    }, 'Error in smart discovery');
  }

  private async registerServer(options: RegistrationOptions): Promise<ToolCallResult> {
    return executeWithErrorHandling(async () => {
      const result = await this.apiClient.registerServer(options);
      return result;
    }, 'Error registering server');
  }

  private async verifyDomain(options: DomainVerificationOptions): Promise<ToolCallResult> {
    try {
      const result = await this.apiClient.startDomainVerification(options.domain);
      return createSuccessResult(result);
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: `Error verifying domain: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  private async checkDomainOwnership(options: DomainOwnershipOptions): Promise<ToolCallResult> {
    try {
      const result = await this.apiClient.checkDomainOwnership(options.domain);
      return createSuccessResult(result);
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: `Error checking domain ownership: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  private async getServerHealth(options: HealthCheckOptions): Promise<ToolCallResult> {
    try {
      const result = await this.apiClient.getServerHealth(options.server_id || '');
      return createSuccessResult(result);
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: `Error getting server health: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  private async getOnboardingState(): Promise<ToolCallResult> {
    try {
      const result = await this.apiClient.getOnboardingState();
      return createSuccessResult(result);
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: `Error getting onboarding state: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  private async invokeTool(options: InvokeToolOptions): Promise<ToolCallResult> {
    return this.toolInvoker.invoke(options);
  }
}
