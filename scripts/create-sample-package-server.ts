#!/usr/bin/env tsx
// Create Sample Package-Only Server
// Demonstrates the new package management data structure

import { MCPServerRecord } from '../src/lib/schemas/discovery.js';

/**
 * Example of a package-only server (deprecated citizen)
 * This represents an MCP server that's only available as an installable package
 * without a live endpoint - the old way of doing things
 */
export const samplePackageOnlyServer: MCPServerRecord = {
  // Identity
  domain: 'example-package-server.com',
  endpoint: undefined, // No live endpoint
  name: 'Example Package-Only MCP Server',
  description: 'A legacy MCP server available only as an installable package',

  // Availability Status (DEPRECATED CITIZEN)
  availability: {
    status: 'package_only',
    live_endpoint: undefined,
    endpoint_verified: false,
    packages_available: true,
    primary_package: 'npm',
    deprecation_reason: 'No live endpoint available - requires local installation'
  },

  // Package Management (MCP Registry Compatibility)
  packages: [
    {
      registry_name: 'npm',
      name: '@example/mcp-server',
      version: '1.2.3',
      package_arguments: [
        {
          description: 'API key for authentication',
          is_required: true,
          format: 'string',
          value: '--api-key',
          default: '--api-key',
          type: 'named',
          value_hint: 'your-api-key-here'
        },
        {
          description: 'Server port',
          is_required: false,
          format: 'number',
          value: '--port',
          default: '3000',
          type: 'named',
          value_hint: '3000'
        }
      ],
      environment_variables: [
        {
          name: 'EXAMPLE_API_KEY',
          description: 'API key for the example service',
          is_required: true,
          example_value: 'sk-1234567890abcdef'
        },
        {
          name: 'EXAMPLE_BASE_URL',
          description: 'Base URL for the example service',
          is_required: false,
          default_value: 'https://api.example.com',
          example_value: 'https://api.example.com'
        }
      ],
      runtime_hint: 'node',
      installation_command: 'npm install -g @example/mcp-server',
      startup_command: 'mcp-server --api-key $EXAMPLE_API_KEY --port 3000',
      setup_instructions: 'Install globally with npm, set environment variables, then run the startup command',
      documentation_url: 'https://github.com/example/mcp-server#readme'
    },
    {
      registry_name: 'docker',
      name: 'example/mcp-server',
      version: '1.2.3',
      runtime_arguments: [
        {
          description: 'Mount configuration directory',
          is_required: true,
          format: 'string',
          value: '-v',
          default: '-v /host/config:/app/config',
          type: 'positional',
          value_hint: '/host/config:/app/config'
        },
        {
          description: 'Expose server port',
          is_required: true,
          format: 'string',
          value: '-p',
          default: '-p 3000:3000',
          type: 'positional',
          value_hint: '3000:3000'
        }
      ],
      environment_variables: [
        {
          name: 'EXAMPLE_API_KEY',
          description: 'API key for the example service',
          is_required: true,
          example_value: 'sk-1234567890abcdef'
        }
      ],
      runtime_hint: 'docker',
      installation_command: 'docker pull example/mcp-server:1.2.3',
      startup_command: 'docker run -d -p 3000:3000 -e EXAMPLE_API_KEY=$EXAMPLE_API_KEY example/mcp-server:1.2.3',
      setup_instructions: 'Pull the Docker image, set environment variables, then run with port mapping',
      documentation_url: 'https://hub.docker.com/r/example/mcp-server'
    }
  ],

  // Repository Information
  repository: {
    url: 'https://github.com/example/mcp-server',
    source: 'github',
    id: '123456789',
    branch: 'main',
    stars: 42,
    forks: 8,
    last_commit: '2025-01-01T12:00:00Z',
    license: 'MIT',
    topics: ['mcp', 'server', 'example', 'package-only']
  },

  // Version Information
  version_info: {
    version: '1.2.3',
    release_date: '2025-01-01T12:00:00Z',
    is_latest: true,
    changelog_url: 'https://github.com/example/mcp-server/releases/tag/v1.2.3',
    breaking_changes: false
  },

  // MCP Protocol Data (None - package only)
  server_info: undefined,
  tools: undefined,
  resources: undefined,
  transport: undefined,

  // Semantic Organization
  capabilities: {
    category: 'development',
    subcategories: ['example', 'testing', 'package-only'],
    intent_keywords: ['example', 'test', 'demo', 'package'],
    use_cases: ['Testing MCP functionality', 'Example implementation', 'Local development']
  },

  // Technical Requirements
  auth: {
    type: 'api_key',
    apiKeyLocation: 'header',
    apiKeyName: 'Authorization',
    description: 'Requires API key authentication'
  },
  cors_enabled: false, // Not applicable for package-only

  // Operational Status (None - package only)
  health: undefined,
  verification: undefined,

  // Metadata
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T12:00:00Z',
  maintainer: {
    name: 'Example Developer',
    email: 'dev@example.com',
    url: 'https://example.com'
  },

  // Verification Tracking
  verification_status: 'unverified',
  trust_score: 25 // Lower trust score for package-only servers
};

/**
 * Example of a live server (first-class citizen)
 * This represents the preferred way - a live, discoverable MCP server
 */
export const sampleLiveServer: MCPServerRecord = {
  // Identity
  domain: 'live-example.com',
  endpoint: 'https://live-example.com/mcp',
  name: 'Live Example MCP Server',
  description: 'A modern live MCP server with real-time discovery',

  // Availability Status (FIRST-CLASS CITIZEN)
  availability: {
    status: 'live',
    live_endpoint: 'https://live-example.com/mcp',
    endpoint_verified: true,
    last_endpoint_check: new Date().toISOString(),
    packages_available: true, // Also has packages for local dev
    primary_package: 'npm'
  },

  // Package Management (Optional - for local development)
  packages: [
    {
      registry_name: 'npm',
      name: '@live-example/mcp-server',
      version: '2.0.0',
      setup_instructions: 'Optional: Install locally for development. Production uses live endpoint.',
      documentation_url: 'https://github.com/live-example/mcp-server#local-development'
    }
  ],

  // Repository Information
  repository: {
    url: 'https://github.com/live-example/mcp-server',
    source: 'github',
    stars: 156,
    forks: 23,
    license: 'MIT'
  },

  // MCP Protocol Data (Live introspection)
  server_info: {
    name: 'Live Example MCP Server',
    version: '2.0.0',
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: true,
      resources: true,
      prompts: false,
      logging: true
    }
  },
  tools: [
    {
      name: 'get_example_data',
      description: 'Retrieve example data from the live service',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' }
        },
        required: ['query']
      }
    }
  ],
  resources: [
    {
      uri: 'example://data',
      name: 'Example Data',
      description: 'Live example data resource'
    }
  ],
  transport: 'streamable_http',

  // Semantic Organization
  capabilities: {
    category: 'development',
    subcategories: ['example', 'live', 'real-time'],
    intent_keywords: ['example', 'live', 'real-time', 'modern'],
    use_cases: ['Live data access', 'Real-time examples', 'Modern MCP patterns']
  },

  // Technical Requirements
  auth: {
    type: 'oauth2',
    oauth2: {
      authorizationUrl: 'https://live-example.com/oauth/authorize',
      tokenUrl: 'https://live-example.com/oauth/token',
      scopes: ['read', 'write']
    }
  },
  cors_enabled: true,

  // Operational Status (Live monitoring)
  health: {
    status: 'healthy',
    uptime_percentage: 99.9,
    avg_response_time_ms: 45,
    response_time_ms: 42,
    error_rate: 0.001,
    last_check: new Date().toISOString(),
    consecutive_failures: 0
  },
  verification: {
    dns_verified: true,
    endpoint_verified: true,
    ssl_verified: true,
    last_verification: new Date().toISOString(),
    verification_method: 'dns-txt-challenge',
    verified_at: '2025-01-01T10:00:00Z'
  },

  // Metadata
  created_at: '2025-01-01T10:00:00Z',
  updated_at: new Date().toISOString(),
  maintainer: {
    name: 'Live Example Team',
    email: 'team@live-example.com',
    url: 'https://live-example.com'
  },

  // Verification Tracking
  verification_status: 'verified',
  trust_score: 95 // High trust score for verified live servers
};

console.log('📦 Package-Only Server (Deprecated Citizen):');
console.log(JSON.stringify(samplePackageOnlyServer, null, 2));

console.log('\n🚀 Live Server (First-Class Citizen):');
console.log(JSON.stringify(sampleLiveServer, null, 2));
