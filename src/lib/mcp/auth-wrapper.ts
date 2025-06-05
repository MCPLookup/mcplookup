// MCP Server Authentication Wrapper
// Adds API key authentication to MCP server tools

import { NextRequest } from 'next/server';
import { apiKeyService } from '../services/api-keys/service';
import { ApiKeyPermission } from '../services/api-keys/types';

/**
 * MCP Authentication Context
 */
export interface MCPAuthContext {
  userId: string;
  apiKeyId?: string;
  permissions: ApiKeyPermission[];
  isAuthenticated: boolean;
  hasPermission: (permission: ApiKeyPermission) => boolean;
}

/**
 * Extract authentication from MCP request
 * MCP requests can include auth in headers, tool arguments, or environment variables
 */
export async function extractMCPAuth(request: NextRequest | any): Promise<MCPAuthContext | null> {
  // Try to extract API key from headers first
  // Handle both NextRequest and MCP request types
  const headers = request.headers instanceof Headers ? request.headers :
                  request.headers ? new Headers(request.headers) : new Headers();

  const authHeader = headers.get('authorization');
  const apiKeyHeader = headers.get('x-api-key');

  let apiKey: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  } else if (apiKeyHeader) {
    apiKey = apiKeyHeader;
  }

  // Fallback to environment variables if no header auth found
  if (!apiKey) {
    apiKey = process.env.MCP_API_KEY ||
             process.env.MCPLOOKUP_API_KEY ||
             process.env.API_KEY ||
             null;
  }

  if (!apiKey) {
    return null;
  }
  
  // Validate the API key
  const validation = await apiKeyService.validateApiKey(apiKey);
  
  if (!validation.valid || !validation.api_key) {
    return null;
  }
  
  return {
    userId: validation.api_key.user_id,
    apiKeyId: validation.api_key.id,
    permissions: validation.api_key.permissions,
    isAuthenticated: true,
    hasPermission: (permission: ApiKeyPermission) => 
      validation.api_key!.permissions.includes(permission)
  };
}

/**
 * Check if a tool requires authentication
 */
export function toolRequiresAuth(toolName: string): boolean {
  const publicTools = [
    'discover_mcp_servers',
    'browse_capabilities', 
    'get_discovery_stats',
    'list_mcp_tools'
  ];
  
  return !publicTools.includes(toolName);
}

/**
 * Get required permissions for a tool
 */
export function getToolPermissions(toolName: string): ApiKeyPermission[] {
  const toolPermissions: Record<string, ApiKeyPermission[]> = {
    'register_mcp_server': ['servers:write'],
    'verify_domain_ownership': ['servers:read'],
    'get_server_health': ['servers:read'],
    'get_discovery_stats': ['analytics:read'],
    'update_server': ['servers:write'],
    'delete_server': ['servers:delete'],
    'get_analytics': ['analytics:read'],
    'admin_tools': ['admin:read', 'admin:write']
  };

  return toolPermissions[toolName] || [];
}

/**
 * Validate authentication for MCP tool execution
 */
export async function validateMCPToolAuth(
  request: NextRequest | any | undefined,
  toolName: string,
  toolArgs: any
): Promise<{
  success: boolean;
  context?: MCPAuthContext;
  error?: string;
}> {
  // Check if tool requires authentication
  if (!toolRequiresAuth(toolName)) {
    return { success: true };
  }

  // If no request provided, assume it's a direct call (for testing) and fail auth
  if (!request) {
    return {
      success: false,
      error: `Tool '${toolName}' requires authentication but no request context provided.`
    };
  }

  // Extract authentication context
  const authContext = await extractMCPAuth(request);

  if (!authContext) {
    return {
      success: false,
      error: `Tool '${toolName}' requires authentication. Please provide a valid API key in the Authorization header.`
    };
  }

  // Check required permissions
  const requiredPermissions = getToolPermissions(toolName);

  for (const permission of requiredPermissions) {
    if (!authContext.hasPermission(permission)) {
      return {
        success: false,
        error: `Tool '${toolName}' requires permission '${permission}' which your API key does not have.`
      };
    }
  }

  // For tools that need user_id, inject it into args
  if (toolName === 'register_mcp_server' && !toolArgs.user_id) {
    toolArgs.user_id = authContext.userId;
  }

  return {
    success: true,
    context: authContext
  };
}

/**
 * Create an authenticated tool wrapper
 */
export function createAuthenticatedTool(
  originalTool: (args: any) => Promise<any>,
  toolName: string
) {
  return async (args: any, request?: NextRequest) => {
    // If no request provided, assume it's a direct call (for testing)
    if (!request) {
      return originalTool(args);
    }
    
    // Validate authentication
    const authResult = await validateMCPToolAuth(request, toolName, args);
    
    if (!authResult.success) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'Authentication failed',
            message: authResult.error,
            tool: toolName,
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };
    }
    
    // Record API usage if authenticated
    if (authResult.context?.apiKeyId) {
      try {
        await apiKeyService.recordUsage(
          authResult.context.apiKeyId,
          `/api/mcp/${toolName}`,
          'POST',
          200,
          0, // Response time will be calculated elsewhere
          request.headers.get('user-agent') || undefined,
          request.headers.get('x-forwarded-for') || undefined
        );
      } catch (error) {
        console.error('Failed to record MCP tool usage:', error);
      }
    }
    
    // Execute the original tool
    return originalTool(args);
  };
}

/**
 * Middleware to add authentication context to MCP requests
 */
export async function mcpAuthMiddleware(request: NextRequest): Promise<{
  request: NextRequest;
  authContext?: MCPAuthContext;
}> {
  const authContext = await extractMCPAuth(request);
  
  // Add auth context to request headers for downstream use
  if (authContext) {
    const headers = new Headers(request.headers);
    headers.set('x-mcp-user-id', authContext.userId);
    headers.set('x-mcp-authenticated', 'true');
    headers.set('x-mcp-permissions', JSON.stringify(authContext.permissions));
    
    const newRequest = new NextRequest(request.url, {
      method: request.method,
      headers,
      body: request.body
    });
    
    return { request: newRequest, authContext };
  }
  
  return { request };
}
