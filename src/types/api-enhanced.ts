// Enhanced TypeScript types from OpenAPI spec
// Generated on 2025-06-05T06:13:11.196Z

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

// Generated from 19 API routes and 9 MCP tools
