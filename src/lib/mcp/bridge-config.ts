// Bridge Configuration
// Auto-generated from OpenAPI spec on 2025-06-05T06:13:11.199Z

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
    'discover_servers_via_api',
    'post_smart_via_api',
    'get_domain-check_via_api',
    'check_server_health_via_api',
    'get_my_servers_via_api',
    'get_onboarding_via_api',
    'post_onboarding_via_api',
    'register_server_via_api',
    'get_verify_via_api',
    'register_server_via_api',
    'put_servers_via_api',
    'delete_servers_via_api',
    'post_check_via_api',
    'get_verify_via_api',
    'post_verify_via_api'
  ],

  toolCategories: {
    'Discovery': [
      'discover_servers_via_api',
      'post_smart_via_api'
    ],
    'API Bridge': [
      'get_domain-check_via_api',
      'get_onboarding_via_api',
      'post_onboarding_via_api',
      'post_check_via_api',
      'get_verify_via_api',
      'post_verify_via_api'
    ],
    'Health': [
      'check_server_health_via_api'
    ],
    'User Management': [
      'get_my_servers_via_api'
    ],
    'Registration': [
      'register_server_via_api',
      'get_verify_via_api',
      'register_server_via_api'
    ],
    'Server Management': [
      'put_servers_via_api',
      'delete_servers_via_api'
    ]
  },

  endpointMappings: {
    'discover_servers_via_api': {
      path: '/v1/discover',
      method: 'GET',
      description: 'Serverless function for MCP server discovery'
    },
    'post_smart_via_api': {
      path: '/v1/discover/smart',
      method: 'POST',
      description: 'Smart AI-powered discovery endpoint Three-step process: keywords → search → AI narrowing'
    },
    'get_domain-check_via_api': {
      path: '/v1/domain-check',
      method: 'GET',
      description: 'Domain Ownership Check API GET /api/v1/domain-check?domain=example.com Check if authenticated user can register MCP servers for a domain'
    },
    'check_server_health_via_api': {
      path: '/v1/health/{domain}',
      method: 'GET',
      description: 'Real-time health checks for MCP servers'
    },
    'get_my_servers_via_api': {
      path: '/v1/my/servers',
      method: 'GET',
      description: 'User-Specific Server Management API GET /api/v1/my/servers - List only MY servers Prevents users from seeing servers they don't own'
    },
    'get_onboarding_via_api': {
      path: '/v1/onboarding',
      method: 'GET',
      description: 'Onboarding API GET /api/v1/onboarding - Get user's onboarding state POST /api/v1/onboarding - Update onboarding progress'
    },
    'post_onboarding_via_api': {
      path: '/v1/onboarding',
      method: 'POST',
      description: 'Onboarding API GET /api/v1/onboarding - Get user's onboarding state POST /api/v1/onboarding - Update onboarding progress'
    },
    'register_server_via_api': {
      path: '/v1/register',
      method: 'POST',
      description: 'Handles MCP server registration with DNS verification'
    },
    'get_verify_via_api': {
      path: '/v1/register/verify/{id}',
      method: 'GET',
      description: 'Verifies DNS challenges for domain ownership'
    },
    'register_server_via_api': {
      path: '/v1/register/verify/{id}',
      method: 'POST',
      description: 'Verifies DNS challenges for domain ownership'
    },
    'put_servers_via_api': {
      path: '/v1/servers/{domain}',
      method: 'PUT',
      description: 'Server Management API with Domain Ownership Validation PUT /api/v1/servers/{domain} - Update server (only if you own the domain) DELETE /api/v1/servers/{domain} - Delete server (only if you own the domain)'
    },
    'delete_servers_via_api': {
      path: '/v1/servers/{domain}',
      method: 'DELETE',
      description: 'Server Management API with Domain Ownership Validation PUT /api/v1/servers/{domain} - Update server (only if you own the domain) DELETE /api/v1/servers/{domain} - Delete server (only if you own the domain)'
    },
    'post_check_via_api': {
      path: '/v1/verify/check',
      method: 'POST',
      description: 'Domain Verification Check API POST /api/v1/verify/check - Check specific verification'
    },
    'get_verify_via_api': {
      path: '/v1/verify',
      method: 'GET',
      description: 'Domain Verification API POST /api/v1/verify - Start domain verification GET /api/v1/verify - Get user's verifications'
    },
    'post_verify_via_api': {
      path: '/v1/verify',
      method: 'POST',
      description: 'Domain Verification API POST /api/v1/verify - Start domain verification GET /api/v1/verify - Get user's verifications'
    }
  }
};

// Tool category helpers
export const getToolsByCategory = (category: string): string[] => {
  return BRIDGE_CONFIG.toolCategories[category] || [];
};

export const getToolEndpoint = (toolName: string) => {
  return BRIDGE_CONFIG.endpointMappings[toolName];
};
