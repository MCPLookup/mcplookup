// Swagger/OpenAPI Configuration for MCPLookup.org API
// Comprehensive API documentation with transport capabilities metadata

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'MCPLookup.org API',
    version: '1.0.0',
    description: `
# MCPLookup.org API

The universal MCP (Model Context Protocol) server discovery service API.

## Features

- **🔍 Smart Discovery**: Natural language queries and intent-based search
- **🚀 Transport Metadata**: Automated discovery of streaming HTTP capabilities  
- **🔐 DNS Verification**: Cryptographic proof of domain ownership
- **📊 Real-time Health**: Live server status and performance metrics
- **🌐 CORS Support**: Web-friendly with comprehensive CORS metadata
- **⚡ High Performance**: Edge-deployed with global CDN

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

## Transport Capabilities

The API now automatically discovers and provides detailed metadata about MCP server transport capabilities:

- **Protocol Support**: HTTP methods, content types, SSE streaming
- **Session Management**: Session ID support and requirements  
- **CORS Configuration**: Origins, methods, headers, credentials
- **Security Features**: SSL requirements, origin validation
- **Performance Metrics**: Response times, compression support

This enables intelligent server selection and optimal client connections.
    `,
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
      url: 'https://mcplookup.org/api/v1',
      description: 'Production API'
    },
    {
      url: 'http://localhost:3000/api/v1', 
      description: 'Development API'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Optional API key for enhanced features'
      }
    },
    schemas: {
      // Transport Capabilities Schema
      TransportCapabilities: {
        type: 'object',
        description: 'Detailed transport capabilities discovered during verification',
        properties: {
          primary_transport: {
            type: 'string',
            enum: ['streamable_http', 'sse', 'stdio'],
            description: 'Primary transport protocol'
          },
          supported_methods: {
            type: 'array',
            items: { type: 'string' },
            description: 'Supported HTTP methods',
            example: ['GET', 'POST', 'OPTIONS']
          },
          content_types: {
            type: 'array',
            items: { type: 'string' },
            description: 'Supported content types',
            example: ['application/json', 'text/event-stream']
          },
          sse_support: {
            type: 'object',
            description: 'Server-Sent Events capabilities',
            properties: {
              supports_sse: { type: 'boolean', description: 'Supports SSE streaming' },
              supports_get_streaming: { type: 'boolean', description: 'Supports GET streaming' },
              supports_post_streaming: { type: 'boolean', description: 'Supports POST streaming' }
            }
          },
          session_support: {
            type: 'object',
            description: 'Session management capabilities',
            properties: {
              supports_sessions: { type: 'boolean', description: 'Supports session management' },
              session_header_name: { type: 'string', description: 'Session header name' },
              session_timeout_indicated: { type: 'boolean', description: 'Indicates session timeout' }
            }
          },
          resumability: {
            type: 'object',
            description: 'Stream resumability capabilities',
            properties: {
              supports_event_ids: { type: 'boolean', description: 'Supports event IDs' },
              supports_last_event_id: { type: 'boolean', description: 'Supports Last-Event-ID header' },
              event_id_format: { type: 'string', description: 'Event ID format pattern' }
            }
          },
          connection_limits: {
            type: 'object',
            description: 'Connection limit information',
            properties: {
              supports_multiple_connections: { type: 'boolean', description: 'Supports multiple connections' },
              max_concurrent_connections: { type: 'integer', description: 'Maximum concurrent connections' }
            }
          },
          security_features: {
            type: 'object',
            description: 'Security feature detection',
            properties: {
              origin_validation: { type: 'boolean', description: 'Validates request origins' },
              ssl_required: { type: 'boolean', description: 'Requires SSL/TLS' },
              custom_auth_headers: {
                type: 'array',
                items: { type: 'string' },
                description: 'Custom authentication headers'
              }
            }
          },
          performance: {
            type: 'object',
            description: 'Performance characteristics',
            properties: {
              avg_response_time_ms: { type: 'number', description: 'Average response time in milliseconds' },
              streaming_latency_ms: { type: 'number', description: 'Streaming latency in milliseconds' },
              supports_compression: { type: 'boolean', description: 'Supports response compression' },
              max_message_size: { type: 'integer', description: 'Maximum message size in bytes' }
            }
          },
          cors_details: {
            type: 'object',
            description: 'CORS configuration details',
            properties: {
              cors_enabled: { type: 'boolean', description: 'CORS is enabled' },
              allowed_origins: {
                type: 'array',
                items: { type: 'string' },
                description: 'Allowed origins'
              },
              allowed_methods: {
                type: 'array',
                items: { type: 'string' },
                description: 'Allowed HTTP methods'
              },
              allowed_headers: {
                type: 'array',
                items: { type: 'string' },
                description: 'Allowed headers'
              },
              supports_credentials: { type: 'boolean', description: 'Supports credentials' }
            }
          },
          rate_limits: {
            type: 'object',
            description: 'Rate limiting information',
            properties: {
              requests_per_minute: { type: 'integer', description: 'Requests per minute limit' },
              burst_limit: { type: 'integer', description: 'Burst request limit' },
              rate_limit_headers: {
                type: 'array',
                items: { type: 'string' },
                description: 'Rate limit header names'
              }
            }
          }
        }
      },

      // MCP Server Record Schema
      MCPServerRecord: {
        type: 'object',
        description: 'Complete MCP server record with all metadata',
        properties: {
          domain: { type: 'string', description: 'Server domain' },
          endpoint: { type: 'string', format: 'uri', description: 'MCP endpoint URL' },
          name: { type: 'string', description: 'Server display name' },
          description: { type: 'string', description: 'Server description' },
          server_info: { $ref: '#/components/schemas/MCPServerInfo' },
          tools: {
            type: 'array',
            items: { $ref: '#/components/schemas/MCPTool' },
            description: 'Available tools'
          },
          resources: {
            type: 'array',
            items: { $ref: '#/components/schemas/MCPResource' },
            description: 'Available resources'
          },
          transport: {
            type: 'string',
            enum: ['streamable_http', 'sse', 'stdio'],
            description: 'Primary transport protocol'
          },
          transport_capabilities: {
            $ref: '#/components/schemas/TransportCapabilities',
            description: 'Detailed transport capabilities'
          },
          cors_enabled: { type: 'boolean', description: 'CORS enabled' },
          health: { $ref: '#/components/schemas/HealthMetrics' },
          verification: { $ref: '#/components/schemas/Verification' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          trust_score: { type: 'integer', minimum: 0, maximum: 100, description: 'Trust score (0-100)' }
        }
      },

      // MCP Server Info Schema
      MCPServerInfo: {
        type: 'object',
        description: 'MCP server information from initialize response',
        properties: {
          name: { type: 'string', description: 'Server name' },
          version: { type: 'string', description: 'Server version' },
          protocolVersion: { type: 'string', description: 'Supported MCP protocol version' },
          capabilities: {
            type: 'object',
            description: 'Server capabilities',
            properties: {
              tools: { type: 'boolean', description: 'Supports tools' },
              resources: { type: 'boolean', description: 'Supports resources' },
              prompts: { type: 'boolean', description: 'Supports prompts' },
              logging: { type: 'boolean', description: 'Supports logging' }
            }
          }
        }
      },

      // MCP Tool Schema
      MCPTool: {
        type: 'object',
        description: 'MCP tool definition',
        properties: {
          name: { type: 'string', description: 'Tool name' },
          description: { type: 'string', description: 'Tool description' },
          inputSchema: {
            type: 'object',
            description: 'JSON Schema for tool input parameters'
          }
        }
      },

      // MCP Resource Schema
      MCPResource: {
        type: 'object',
        description: 'MCP resource definition',
        properties: {
          uri: { type: 'string', description: 'Resource URI' },
          name: { type: 'string', description: 'Resource name' },
          description: { type: 'string', description: 'Resource description' },
          mimeType: { type: 'string', description: 'Resource MIME type' }
        }
      },

      // Health Metrics Schema
      HealthMetrics: {
        type: 'object',
        description: 'Server health and performance metrics',
        properties: {
          status: {
            type: 'string',
            enum: ['healthy', 'degraded', 'unhealthy', 'unknown'],
            description: 'Current health status'
          },
          uptime_percentage: { type: 'number', description: 'Uptime percentage (0-100)' },
          avg_response_time_ms: { type: 'number', description: 'Average response time in milliseconds' },
          error_rate: { type: 'number', description: 'Error rate (0-1)' },
          last_check: { type: 'string', format: 'date-time', description: 'Last health check timestamp' },
          consecutive_failures: { type: 'integer', description: 'Consecutive failure count' }
        }
      },

      // Verification Schema
      Verification: {
        type: 'object',
        description: 'Server verification status',
        properties: {
          dns_verified: { type: 'boolean', description: 'DNS ownership verified' },
          endpoint_verified: { type: 'boolean', description: 'MCP endpoint verified' },
          ssl_verified: { type: 'boolean', description: 'SSL certificate verified' },
          last_verification: { type: 'string', format: 'date-time', description: 'Last verification timestamp' },
          verification_method: { type: 'string', description: 'Verification method used' },
          verified_at: { type: 'string', format: 'date-time', description: 'Initial verification timestamp' }
        }
      }
    }
  },
  security: [
    {},
    { BearerAuth: [] }
  ],
  tags: [
    {
      name: 'Discovery',
      description: 'Find and search MCP servers'
    },
    {
      name: 'Registration', 
      description: 'Register and verify MCP servers'
    },
    {
      name: 'Health',
      description: 'Server health and status monitoring'
    },
    {
      name: 'Transport',
      description: 'Transport capabilities and metadata'
    }
  ]
};
