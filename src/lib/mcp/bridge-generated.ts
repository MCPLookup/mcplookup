// Generated Bridge Tools
// Auto-generated from OpenAPI spec on 2025-06-05T06:13:11.199Z
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
    // Serverless function for MCP server discovery
    this.server.tool(
      'discover_servers_via_api',
      {
      "type": "object",
      "properties": {
            "query": {
                  "type": "string",
                  "description": "Natural language search query",
                  "required": false
            },
            "domain": {
                  "type": "string",
                  "description": "Specific domain to search for",
                  "required": false
            },
            "capability": {
                  "type": "string",
                  "description": "Required capability",
                  "required": false
            },
            "limit": {
                  "type": "integer",
                  "description": "Maximum number of results",
                  "required": false
            },
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/discover',
            'GET',
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
              text: `Error calling discover_servers_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Smart AI-powered discovery endpoint Three-step process: keywords → search → AI narrowing
    this.server.tool(
      'post_smart_via_api',
      {
      "type": "object",
      "properties": {
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/discover/smart',
            'POST',
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
              text: `Error calling post_smart_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Domain Ownership Check API GET /api/v1/domain-check?domain=example.com Check if authenticated user can register MCP servers for a domain
    this.server.tool(
      'get_domain-check_via_api',
      {
      "type": "object",
      "properties": {
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/domain-check',
            'GET',
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
              text: `Error calling get_domain-check_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Real-time health checks for MCP servers
    this.server.tool(
      'check_server_health_via_api',
      {
      "type": "object",
      "properties": {
            "domain": {
                  "type": "string",
                  "description": "domain parameter",
                  "required": true
            },
            "realtime": {
                  "type": "boolean",
                  "description": "Perform real-time health check",
                  "required": false
            },
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/health/{domain}',
            'GET',
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
              text: `Error calling check_server_health_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // User-Specific Server Management API GET /api/v1/my/servers - List only MY servers Prevents users from seeing servers they don't own
    this.server.tool(
      'get_my_servers_via_api',
      {
      "type": "object",
      "properties": {
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/my/servers',
            'GET',
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
              text: `Error calling get_my_servers_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Onboarding API GET /api/v1/onboarding - Get user's onboarding state POST /api/v1/onboarding - Update onboarding progress
    this.server.tool(
      'get_onboarding_via_api',
      {
      "type": "object",
      "properties": {
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/onboarding',
            'GET',
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
              text: `Error calling get_onboarding_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Onboarding API GET /api/v1/onboarding - Get user's onboarding state POST /api/v1/onboarding - Update onboarding progress
    this.server.tool(
      'post_onboarding_via_api',
      {
      "type": "object",
      "properties": {
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/onboarding',
            'POST',
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
              text: `Error calling post_onboarding_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Handles MCP server registration with DNS verification
    this.server.tool(
      'register_server_via_api',
      {
      "type": "object",
      "properties": {
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/register',
            'POST',
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
              text: `Error calling register_server_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Verifies DNS challenges for domain ownership
    this.server.tool(
      'get_verify_via_api',
      {
      "type": "object",
      "properties": {
            "id": {
                  "type": "string",
                  "description": "id parameter",
                  "required": true
            },
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/register/verify/{id}',
            'GET',
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
              text: `Error calling get_verify_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Verifies DNS challenges for domain ownership
    this.server.tool(
      'register_server_via_api',
      {
      "type": "object",
      "properties": {
            "id": {
                  "type": "string",
                  "description": "id parameter",
                  "required": true
            },
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/register/verify/{id}',
            'POST',
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
              text: `Error calling register_server_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Server Management API with Domain Ownership Validation PUT /api/v1/servers/{domain} - Update server (only if you own the domain) DELETE /api/v1/servers/{domain} - Delete server (only if you own the domain)
    this.server.tool(
      'put_servers_via_api',
      {
      "type": "object",
      "properties": {
            "domain": {
                  "type": "string",
                  "description": "domain parameter",
                  "required": true
            },
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/servers/{domain}',
            'PUT',
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
              text: `Error calling put_servers_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Server Management API with Domain Ownership Validation PUT /api/v1/servers/{domain} - Update server (only if you own the domain) DELETE /api/v1/servers/{domain} - Delete server (only if you own the domain)
    this.server.tool(
      'delete_servers_via_api',
      {
      "type": "object",
      "properties": {
            "domain": {
                  "type": "string",
                  "description": "domain parameter",
                  "required": true
            },
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/servers/{domain}',
            'DELETE',
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
              text: `Error calling delete_servers_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Domain Verification Check API POST /api/v1/verify/check - Check specific verification
    this.server.tool(
      'post_check_via_api',
      {
      "type": "object",
      "properties": {
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/verify/check',
            'POST',
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
              text: `Error calling post_check_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Domain Verification API POST /api/v1/verify - Start domain verification GET /api/v1/verify - Get user's verifications
    this.server.tool(
      'get_verify_via_api',
      {
      "type": "object",
      "properties": {
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/verify',
            'GET',
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
              text: `Error calling get_verify_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );

    // Domain Verification API POST /api/v1/verify - Start domain verification GET /api/v1/verify - Get user's verifications
    this.server.tool(
      'post_verify_via_api',
      {
      "type": "object",
      "properties": {
            "auth_headers": {
                  "type": "object",
                  "description": "Optional authentication headers",
                  "required": false
            }
      },
      "description": "Generated from OpenAPI operation"
},
      async (args) => {
        try {
          const { auth_headers = {}, ...apiParams } = args;
          
          const result = await this.makeApiRequest(
            '/v1/verify',
            'POST',
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
              text: `Error calling post_verify_via_api: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    );
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
        throw new Error(`API request failed: ${response.status} ${data.error || response.statusText}`);
      }
      
      return data;
    } catch (error) {
      throw new Error(`Bridge API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export tool schemas for validation
export const GENERATED_TOOL_SCHEMAS = {
  'discover_servers_via_api': {
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Natural language search query",
      "required": false
    },
    "domain": {
      "type": "string",
      "description": "Specific domain to search for",
      "required": false
    },
    "capability": {
      "type": "string",
      "description": "Required capability",
      "required": false
    },
    "limit": {
      "type": "integer",
      "description": "Maximum number of results",
      "required": false
    },
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'post_smart_via_api': {
  "type": "object",
  "properties": {
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'get_domain-check_via_api': {
  "type": "object",
  "properties": {
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'check_server_health_via_api': {
  "type": "object",
  "properties": {
    "domain": {
      "type": "string",
      "description": "domain parameter",
      "required": true
    },
    "realtime": {
      "type": "boolean",
      "description": "Perform real-time health check",
      "required": false
    },
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'get_my_servers_via_api': {
  "type": "object",
  "properties": {
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'get_onboarding_via_api': {
  "type": "object",
  "properties": {
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'post_onboarding_via_api': {
  "type": "object",
  "properties": {
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'register_server_via_api': {
  "type": "object",
  "properties": {
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'get_verify_via_api': {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "id parameter",
      "required": true
    },
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'register_server_via_api': {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "id parameter",
      "required": true
    },
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'put_servers_via_api': {
  "type": "object",
  "properties": {
    "domain": {
      "type": "string",
      "description": "domain parameter",
      "required": true
    },
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'delete_servers_via_api': {
  "type": "object",
  "properties": {
    "domain": {
      "type": "string",
      "description": "domain parameter",
      "required": true
    },
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'post_check_via_api': {
  "type": "object",
  "properties": {
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'get_verify_via_api': {
  "type": "object",
  "properties": {
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
},
  'post_verify_via_api': {
  "type": "object",
  "properties": {
    "auth_headers": {
      "type": "object",
      "description": "Optional authentication headers",
      "required": false
    }
  },
  "description": "Generated from OpenAPI operation"
}
};

// Export tool metadata
export const GENERATED_TOOL_METADATA = [
  {
    name: 'discover_servers_via_api',
    description: 'Serverless function for MCP server discovery',
    category: 'Discovery',
    restEndpoint: {
    "path": "/v1/discover",
    "method": "GET",
    "parameters": [
        {
            "name": "query",
            "in": "query",
            "schema": {
                "type": "string"
            },
            "description": "Natural language search query",
            "example": "Find email servers like Gmail"
        },
        {
            "name": "domain",
            "in": "query",
            "schema": {
                "type": "string"
            },
            "description": "Specific domain to search for",
            "example": "gmail.com"
        },
        {
            "name": "capability",
            "in": "query",
            "schema": {
                "type": "string"
            },
            "description": "Required capability",
            "example": "email"
        },
        {
            "name": "limit",
            "in": "query",
            "schema": {
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "default": 10
            },
            "description": "Maximum number of results"
        }
    ]
}
  },
  {
    name: 'post_smart_via_api',
    description: 'Smart AI-powered discovery endpoint Three-step process: keywords → search → AI narrowing',
    category: 'Discovery',
    restEndpoint: {
    "path": "/v1/discover/smart",
    "method": "POST",
    "requestBody": {
        "required": true,
        "content": {
            "application/json": {
                "schema": {
                    "type": "object",
                    "description": "Request payload"
                }
            }
        }
    }
}
  },
  {
    name: 'get_domain-check_via_api',
    description: 'Domain Ownership Check API GET /api/v1/domain-check?domain=example.com Check if authenticated user can register MCP servers for a domain',
    category: 'API Bridge',
    restEndpoint: {
    "path": "/v1/domain-check",
    "method": "GET",
    "parameters": []
}
  },
  {
    name: 'check_server_health_via_api',
    description: 'Real-time health checks for MCP servers',
    category: 'Health',
    restEndpoint: {
    "path": "/v1/health/{domain}",
    "method": "GET",
    "parameters": [
        {
            "name": "domain",
            "in": "path",
            "required": true,
            "schema": {
                "type": "string"
            },
            "description": "domain parameter"
        },
        {
            "name": "realtime",
            "in": "query",
            "schema": {
                "type": "boolean",
                "default": false
            },
            "description": "Perform real-time health check"
        }
    ]
}
  },
  {
    name: 'get_my_servers_via_api',
    description: 'User-Specific Server Management API GET /api/v1/my/servers - List only MY servers Prevents users from seeing servers they don't own',
    category: 'User Management',
    restEndpoint: {
    "path": "/v1/my/servers",
    "method": "GET",
    "parameters": []
}
  },
  {
    name: 'get_onboarding_via_api',
    description: 'Onboarding API GET /api/v1/onboarding - Get user's onboarding state POST /api/v1/onboarding - Update onboarding progress',
    category: 'API Bridge',
    restEndpoint: {
    "path": "/v1/onboarding",
    "method": "GET",
    "parameters": []
}
  },
  {
    name: 'post_onboarding_via_api',
    description: 'Onboarding API GET /api/v1/onboarding - Get user's onboarding state POST /api/v1/onboarding - Update onboarding progress',
    category: 'API Bridge',
    restEndpoint: {
    "path": "/v1/onboarding",
    "method": "POST",
    "requestBody": {
        "required": true,
        "content": {
            "application/json": {
                "schema": {
                    "type": "object",
                    "description": "Request payload"
                }
            }
        }
    }
}
  },
  {
    name: 'register_server_via_api',
    description: 'Handles MCP server registration with DNS verification',
    category: 'Registration',
    restEndpoint: {
    "path": "/v1/register",
    "method": "POST",
    "requestBody": {
        "required": true,
        "content": {
            "application/json": {
                "schema": {
                    "$ref": "#/components/schemas/RegistrationRequest"
                }
            }
        }
    }
}
  },
  {
    name: 'get_verify_via_api',
    description: 'Verifies DNS challenges for domain ownership',
    category: 'Registration',
    restEndpoint: {
    "path": "/v1/register/verify/{id}",
    "method": "GET",
    "parameters": [
        {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
                "type": "string"
            },
            "description": "id parameter"
        }
    ]
}
  },
  {
    name: 'register_server_via_api',
    description: 'Verifies DNS challenges for domain ownership',
    category: 'Registration',
    restEndpoint: {
    "path": "/v1/register/verify/{id}",
    "method": "POST",
    "parameters": [
        {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
                "type": "string"
            },
            "description": "id parameter"
        }
    ],
    "requestBody": {
        "required": true,
        "content": {
            "application/json": {
                "schema": {
                    "type": "object",
                    "description": "Request payload"
                }
            }
        }
    }
}
  },
  {
    name: 'put_servers_via_api',
    description: 'Server Management API with Domain Ownership Validation PUT /api/v1/servers/{domain} - Update server (only if you own the domain) DELETE /api/v1/servers/{domain} - Delete server (only if you own the domain)',
    category: 'Server Management',
    restEndpoint: {
    "path": "/v1/servers/{domain}",
    "method": "PUT",
    "parameters": [
        {
            "name": "domain",
            "in": "path",
            "required": true,
            "schema": {
                "type": "string"
            },
            "description": "domain parameter"
        }
    ],
    "requestBody": {
        "required": true,
        "content": {
            "application/json": {
                "schema": {
                    "type": "object",
                    "description": "Request payload"
                }
            }
        }
    }
}
  },
  {
    name: 'delete_servers_via_api',
    description: 'Server Management API with Domain Ownership Validation PUT /api/v1/servers/{domain} - Update server (only if you own the domain) DELETE /api/v1/servers/{domain} - Delete server (only if you own the domain)',
    category: 'Server Management',
    restEndpoint: {
    "path": "/v1/servers/{domain}",
    "method": "DELETE",
    "parameters": [
        {
            "name": "domain",
            "in": "path",
            "required": true,
            "schema": {
                "type": "string"
            },
            "description": "domain parameter"
        }
    ]
}
  },
  {
    name: 'post_check_via_api',
    description: 'Domain Verification Check API POST /api/v1/verify/check - Check specific verification',
    category: 'API Bridge',
    restEndpoint: {
    "path": "/v1/verify/check",
    "method": "POST",
    "requestBody": {
        "required": true,
        "content": {
            "application/json": {
                "schema": {
                    "type": "object",
                    "description": "Request payload"
                }
            }
        }
    }
}
  },
  {
    name: 'get_verify_via_api',
    description: 'Domain Verification API POST /api/v1/verify - Start domain verification GET /api/v1/verify - Get user's verifications',
    category: 'API Bridge',
    restEndpoint: {
    "path": "/v1/verify",
    "method": "GET",
    "parameters": []
}
  },
  {
    name: 'post_verify_via_api',
    description: 'Domain Verification API POST /api/v1/verify - Start domain verification GET /api/v1/verify - Get user's verifications',
    category: 'API Bridge',
    restEndpoint: {
    "path": "/v1/verify",
    "method": "POST",
    "requestBody": {
        "required": true,
        "content": {
            "application/json": {
                "schema": {
                    "type": "object",
                    "description": "Request payload"
                }
            }
        }
    }
}
  }
];
