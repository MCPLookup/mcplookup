// Base Tool Interface - Foundation for all MCP tools
// Provides consistent structure and dependency injection

import { z } from 'zod';

/**
 * MCP Authentication Context
 */
export interface MCPAuthContext {
  userId: string;
  apiKeyId?: string;
  permissions: string[];
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

/**
 * Standard MCP tool response format
 * Compatible with @vercel/mcp-adapter expected return type
 */
export interface MCPToolResponse {
  [x: string]: unknown;
  content: Array<{
    [x: string]: unknown;
    type: 'text';
    text: string;
  }>;
  _meta?: { [x: string]: unknown };
  structuredContent?: { [x: string]: unknown };
  isError?: boolean;
}

/**
 * Tool execution context with injected dependencies
 */
export interface ToolContext {
  auth?: MCPAuthContext;
  services: {
    storage: any;
    analytics: any;
    verification: any;
    dns: any;
  };
  request?: any;
}

/**
 * Base tool configuration
 */
export interface ToolConfig {
  name: string;
  description: string;
  schema: z.ZodSchema;
  requiredPermissions?: string[];
}

/**
 * Abstract base class for all MCP tools
 * Implements dependency injection and common patterns
 */
export abstract class BaseMCPTool<TArgs = any> {
  protected config: ToolConfig;

  constructor(config: ToolConfig) {
    this.config = config;
  }

  /**
   * Get tool configuration
   */
  getConfig(): ToolConfig {
    return this.config;
  }

  /**
   * Validate tool arguments against schema
   */
  protected validateArgs(args: unknown): TArgs {
    try {
      return this.config.schema.parse(args) as TArgs;
    } catch (error) {
      throw new Error(`Invalid arguments: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
    }
  }

  /**
   * Create standardized error response
   */
  protected createErrorResponse(error: string, details?: any): MCPToolResponse {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error,
          details,
          tool: this.config.name,
          timestamp: new Date().toISOString()
        }, null, 2)
      }],
      isError: true
    };
  }

  /**
   * Create standardized success response
   */
  protected createSuccessResponse(data: any): MCPToolResponse {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(data, null, 2)
      }]
    };
  }

  /**
   * Check if user has required permissions
   */
  protected checkPermissions(context: ToolContext): boolean {
    if (!this.config.requiredPermissions?.length) {
      return true;
    }

    if (!context.auth) {
      return false;
    }

    return this.config.requiredPermissions.every(permission =>
      context.auth!.hasPermission(permission)
    );
  }

  /**
   * Execute the tool with dependency injection
   * Template method pattern - subclasses implement executeInternal
   */
  async execute(args: unknown, context: ToolContext): Promise<MCPToolResponse> {
    try {
      // Validate arguments
      const validatedArgs = this.validateArgs(args);

      // Check permissions
      if (!this.checkPermissions(context)) {
        return this.createErrorResponse(
          'Insufficient permissions',
          { required: this.config.requiredPermissions }
        );
      }

      // Execute tool-specific logic
      return await this.executeInternal(validatedArgs, context);
    } catch (error) {
      return this.createErrorResponse(
        'Tool execution failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Tool-specific implementation - must be implemented by subclasses
   */
  protected abstract executeInternal(args: TArgs, context: ToolContext): Promise<MCPToolResponse>;
}

/**
 * Tool registry for managing all available tools
 */
export class ToolRegistry {
  private tools = new Map<string, BaseMCPTool>();

  /**
   * Register a tool
   */
  register(tool: BaseMCPTool): void {
    this.tools.set(tool.getConfig().name, tool);
  }

  /**
   * Get a tool by name
   */
  get(name: string): BaseMCPTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): BaseMCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool configurations for MCP server registration
   */
  getConfigs(): ToolConfig[] {
    return this.getAll().map(tool => tool.getConfig());
  }
}
