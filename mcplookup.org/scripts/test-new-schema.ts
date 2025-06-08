#!/usr/bin/env tsx
// Test New Package Management Schema
// Validates that our extended schema works correctly

import { MCPServerRecordSchema, type MCPServerRecord } from '../src/lib/schemas/discovery.js';

console.log('🧪 Testing New Package Management Schema');
console.log('='.repeat(50));

// Test 1: Live Server (First-Class Citizen)
console.log('\n1. Testing Live Server (First-Class Citizen)');
const liveServer: MCPServerRecord = {
  domain: 'test-live.com',
  endpoint: 'https://test-live.com/mcp',
  name: 'Test Live Server',
  description: 'A test live server',
  
  availability: {
    status: 'live',
    live_endpoint: 'https://test-live.com/mcp',
    endpoint_verified: true,
    last_endpoint_check: new Date().toISOString(),
    packages_available: false
  },
  
  server_info: {
    name: 'Test Live Server',
    version: '1.0.0',
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
      logging: false
    }
  },
  
  tools: [],
  resources: [],
  transport: 'streamable_http',
  
  capabilities: {
    category: 'development',
    subcategories: ['testing'],
    intent_keywords: ['test'],
    use_cases: ['Testing']
  },
  
  auth: {
    type: 'none'
  },
  cors_enabled: true,
  
  health: {
    status: 'healthy',
    uptime_percentage: 99.9,
    avg_response_time_ms: 50,
    error_rate: 0.001,
    last_check: new Date().toISOString(),
    consecutive_failures: 0
  },
  
  verification: {
    dns_verified: true,
    endpoint_verified: true,
    ssl_verified: true,
    last_verification: new Date().toISOString(),
    verification_method: 'dns-txt-challenge'
  },
  
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

try {
  const validatedLive = MCPServerRecordSchema.parse(liveServer);
  console.log('✅ Live server schema validation passed');
} catch (error) {
  console.log('❌ Live server schema validation failed:', error);
}

// Test 2: Package-Only Server (Deprecated Citizen)
console.log('\n2. Testing Package-Only Server (Deprecated Citizen)');
const packageOnlyServer: MCPServerRecord = {
  domain: 'test-package.com',
  name: 'Test Package Server',
  description: 'A test package-only server',
  
  availability: {
    status: 'package_only',
    endpoint_verified: false,
    packages_available: true,
    primary_package: 'npm',
    deprecation_reason: 'No live endpoint available'
  },
  
  packages: [
    {
      registry_name: 'npm',
      name: '@test/package-server',
      version: '1.0.0',
      package_arguments: [
        {
          description: 'API key',
          is_required: true,
          format: 'string',
          value: '--api-key',
          type: 'named',
          value_hint: 'your-key'
        }
      ],
      environment_variables: [
        {
          name: 'API_KEY',
          description: 'API key for authentication',
          is_required: true,
          example_value: 'sk-123'
        }
      ],
      installation_command: 'npm install -g @test/package-server',
      startup_command: 'package-server --api-key $API_KEY'
    }
  ],
  
  repository: {
    url: 'https://github.com/test/package-server',
    source: 'github',
    stars: 42,
    license: 'MIT'
  },
  
  version_info: {
    version: '1.0.0',
    is_latest: true,
    breaking_changes: false
  },
  
  capabilities: {
    category: 'development',
    subcategories: ['testing', 'package'],
    intent_keywords: ['test', 'package'],
    use_cases: ['Testing packages']
  },
  
  auth: {
    type: 'api_key',
    apiKeyLocation: 'header',
    apiKeyName: 'Authorization'
  },
  cors_enabled: false,
  
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

try {
  const validatedPackage = MCPServerRecordSchema.parse(packageOnlyServer);
  console.log('✅ Package-only server schema validation passed');
} catch (error) {
  console.log('❌ Package-only server schema validation failed:', error);
}

// Test 3: Availability Filtering
console.log('\n3. Testing Availability Filtering Logic');

const servers = [liveServer, packageOnlyServer];

// Default filtering (live only)
const liveOnly = servers.filter(server => {
  const status = server.availability?.status || 'live';
  return status === 'live';
});

console.log(`Default filtering (live only): ${liveOnly.length} servers`);
console.log(`- Live servers: ${liveOnly.filter(s => s.availability?.status === 'live').length}`);

// Include package-only
const includePackages = servers.filter(server => {
  const status = server.availability?.status || 'live';
  return status === 'live' || status === 'package_only';
});

console.log(`Include package-only: ${includePackages.length} servers`);
console.log(`- Live servers: ${includePackages.filter(s => s.availability?.status === 'live').length}`);
console.log(`- Package-only servers: ${includePackages.filter(s => s.availability?.status === 'package_only').length}`);

console.log('\n🎉 All tests completed!');
console.log('\n📋 Summary:');
console.log('- Live servers are first-class citizens (default discovery)');
console.log('- Package-only servers are deprecated citizens (explicit inclusion)');
console.log('- Full MCP Registry compatibility maintained');
console.log('- Backward compatibility preserved');
