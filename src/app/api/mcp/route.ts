// Next.js API Route - The One Ring MCP Server HTTP Endpoint
// Enables HTTP access to the MCP server for modern agents

import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/mcp:
 *   post:
 *     summary: MCP JSON-RPC over HTTP
 *     description: The One Ring MCP Server accessible via HTTP for modern agents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jsonrpc:
 *                 type: string
 *                 enum: ["2.0"]
 *               id:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *               method:
 *                 type: string
 *                 enum: ["initialize", "tools/list", "tools/call", "resources/list", "resources/read"]
 *               params:
 *                 type: object
 *     responses:
 *       200:
 *         description: JSON-RPC response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jsonrpc:
 *                   type: string
 *                   enum: ["2.0"]
 *                 id:
 *                   oneOf:
 *                     - type: string
 *                     - type: number
 *                 result:
 *                   type: object
 *                 error:
 *                   type: object
 *       400:
 *         description: Invalid JSON-RPC request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate JSON-RPC structure
    if (!body.jsonrpc || body.jsonrpc !== '2.0') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id || null,
        error: {
          code: -32600,
          message: 'Invalid Request',
          data: 'Missing or invalid jsonrpc field'
        }
      }, { status: 400 });
    }

    if (!body.method) {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id || null,
        error: {
          code: -32600,
          message: 'Invalid Request',
          data: 'Missing method field'
        }
      }, { status: 400 });
    }

    // Handle MCP methods
    let result;
    
    switch (body.method) {
      case 'initialize':
        result = await handleInitialize(body.params);
        break;
        
      case 'tools/list':
        result = await handleToolsList(body.params);
        break;
        
      case 'tools/call':
        result = await handleToolsCall(body.params);
        break;
        
      case 'resources/list':
        result = await handleResourcesList(body.params);
        break;
        
      case 'resources/read':
        result = await handleResourcesRead(body.params);
        break;
        
      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id || null,
          error: {
            code: -32601,
            message: 'Method not found',
            data: `Unknown method: ${body.method}`
          }
        }, { status: 400 });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id: body.id,
      result
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('MCP HTTP endpoint error:', error);
    
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// ========================================================================
// MCP METHOD HANDLERS
// ========================================================================

async function handleInitialize(params: any) {
  return {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {
        listChanged: false
      },
      resources: {
        subscribe: false,
        listChanged: false
      }
    },
    serverInfo: {
      name: 'mcplookup-registry',
      version: '1.0.0'
    }
  };
}

async function handleToolsList(params: any) {
  return {
    tools: [
      {
        name: 'discover_mcp_servers',
        description: 'Discover MCP servers by domain, capability, intent, or category. Returns complete server information for immediate connection.',
        inputSchema: {
          type: 'object',
          properties: {
            domain: {
              type: 'string',
              description: 'Exact domain match (e.g., "gmail.com", "github.com")'
            },
            capability: {
              type: 'string',
              description: 'Required capability (e.g., "email_send", "file_read")'
            },
            category: {
              type: 'string',
              enum: ['communication', 'productivity', 'data', 'development', 'content', 'integration', 'analytics', 'security', 'finance', 'ecommerce', 'social', 'other'],
              description: 'Capability category filter'
            },
            intent: {
              type: 'string',
              description: 'Natural language intent (e.g., "check my email", "create a document")'
            },
            keywords: {
              type: 'array',
              items: { type: 'string' },
              description: 'Search keywords'
            },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 10,
              description: 'Maximum number of results'
            }
          }
        }
      },
      {
        name: 'register_mcp_server',
        description: 'Register a new MCP server for discovery. Initiates DNS verification process.',
        inputSchema: {
          type: 'object',
          properties: {
            domain: {
              type: 'string',
              description: 'Domain to register (e.g., "api.example.com")'
            },
            endpoint: {
              type: 'string',
              format: 'uri',
              description: 'MCP endpoint URL (must be HTTPS)'
            },
            contact_email: {
              type: 'string',
              format: 'email',
              description: 'Contact email for verification notifications'
            },
            description: {
              type: 'string',
              description: 'Server description and purpose'
            }
          },
          required: ['domain', 'endpoint', 'contact_email']
        }
      },
      {
        name: 'verify_domain_ownership',
        description: 'Check DNS verification status for a domain registration challenge.',
        inputSchema: {
          type: 'object',
          properties: {
            challenge_id: {
              type: 'string',
              format: 'uuid',
              description: 'Verification challenge ID from registration'
            }
          },
          required: ['challenge_id']
        }
      }
    ]
  };
}

async function handleToolsCall(params: any) {
  const { name, arguments: args } = params;
  
  switch (name) {
    case 'discover_mcp_servers':
      // Use discovery service via factory
      const { getServerlessServices } = await import('@/lib/services');
      const { discovery } = getServerlessServices();

      try {
        const discoveryRequest = {
          domain: args.domain,
          capability: args.capability,
          category: args.category,
          intent: args.intent,
          keywords: args.keywords,
          limit: args.limit || 10,
          offset: 0,
          include_health: true,
          include_tools: true,
          include_resources: false,
          sort_by: 'relevance' as const
        };

        const data = await discovery.discoverServers(discoveryRequest);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        throw new Error(`Discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
    case 'register_mcp_server':
      const { createVerificationService } = await import('@/lib/services');
      const verificationService = createVerificationService();

      try {
        const registrationRequest = {
          domain: args.domain,
          endpoint: args.endpoint,
          name: args.name || `${args.domain} MCP Server`,
          description: args.description || `MCP server for ${args.domain}`,
          contact_email: args.contact_email,
          documentation_url: args.documentation_url,
          source_code_url: args.source_code_url
        };

        const challenge = await verificationService.initiateDNSVerification(registrationRequest);

        return {
          content: [
            {
              type: 'text',
              text: `DNS verification challenge created for ${args.domain}.\n\n${challenge.instructions}\n\nChallenge ID: ${challenge.challenge_id}\nExpires: ${challenge.expires_at}`
            }
          ]
        };
      } catch (error) {
        throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
    case 'verify_domain_ownership':
      const { createVerificationService: createVerificationService2 } = await import('@/lib/services');
      const verificationService2 = createVerificationService2();

      try {
        const verified = await verificationService2.verifyDNSChallenge(args.challenge_id);

        if (verified) {
          return {
            content: [
              {
                type: 'text',
                text: '✅ Domain verification successful! Your MCP server has been registered and is now discoverable.'
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: '❌ Domain verification failed. Please ensure the DNS record is properly configured and try again.'
              }
            ]
          };
        }
      } catch (error) {
        throw new Error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleResourcesList(params: any) {
  return {
    resources: [
      {
        uri: 'mcplookup://servers/all',
        name: 'All Registered Servers',
        description: 'Complete list of all registered MCP servers',
        mimeType: 'application/json'
      },
      {
        uri: 'mcplookup://capabilities/taxonomy',
        name: 'Capability Taxonomy',
        description: 'Hierarchical structure of MCP capabilities',
        mimeType: 'application/json'
      },
      {
        uri: 'mcplookup://stats/discovery',
        name: 'Discovery Statistics',
        description: 'Usage and performance statistics',
        mimeType: 'application/json'
      }
    ]
  };
}

async function handleResourcesRead(params: any) {
  const { uri } = params;
  
  switch (uri) {
    case 'mcplookup://servers/all':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              servers: [],
              total: 0,
              generated_at: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
      
    case 'mcplookup://capabilities/taxonomy':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              categories: {
                communication: ['email', 'chat', 'messaging', 'notifications'],
                productivity: ['calendar', 'tasks', 'notes', 'documents'],
                data: ['databases', 'apis', 'storage', 'retrieval'],
                development: ['code', 'git', 'ci-cd', 'deployment']
              },
              generated_at: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
      
    case 'mcplookup://stats/discovery':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              total_requests: 12345,
              unique_agents: 342,
              popular_queries: ['gmail.com', 'email', 'github.com'],
              generated_at: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
      
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}
