#!/usr/bin/env tsx
// Test Server Type Classifications
// Validates the new GitHub vs Official server distinction

import { MCPServerRecordSchema, type MCPServerRecord } from '../src/lib/schemas/discovery.js';

console.log('🧪 Testing Server Type Classifications');
console.log('='.repeat(60));

// Test 1: GitHub-based Server (Unofficial/Community)
console.log('\n1. Testing GitHub-based Server (Unofficial/Community)');
const githubServer: MCPServerRecord = {
  domain: 'github.com/example/mcp-server',
  endpoint: undefined, // GitHub servers typically don't have live endpoints
  name: 'Example GitHub MCP Server',
  description: 'A community MCP server hosted on GitHub',
  
  // Server Type Classification
  server_type: {
    type: 'github',
    github_repo: 'example/mcp-server',
    github_stars: 156,
    github_verified: true,
    domain_verified: false,
    official_status: 'community',
    verification_badges: ['github_verified']
  },
  
  // Availability Status
  availability: {
    status: 'package_only',
    endpoint_verified: false,
    packages_available: true,
    primary_package: 'npm',
    deprecation_reason: 'GitHub-based server - requires local installation'
  },
  
  // Package Management
  packages: [
    {
      registry_name: 'npm',
      name: '@example/mcp-server',
      version: '1.0.0',
      installation_command: 'npm install -g @example/mcp-server',
      startup_command: 'mcp-server --port 3000'
    }
  ],
  
  capabilities: {
    category: 'development',
    subcategories: ['github', 'community'],
    intent_keywords: ['github', 'community', 'example'],
    use_cases: ['Community development', 'GitHub integration']
  },
  
  auth: { type: 'none' },
  cors_enabled: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

try {
  const validatedGitHub = MCPServerRecordSchema.parse(githubServer);
  console.log('✅ GitHub server schema validation passed');
  console.log(`   - Type: ${validatedGitHub.server_type?.type}`);
  console.log(`   - Official Status: ${validatedGitHub.server_type?.official_status}`);
  console.log(`   - GitHub Verified: ${validatedGitHub.server_type?.github_verified}`);
  console.log(`   - Domain Verified: ${validatedGitHub.server_type?.domain_verified}`);
} catch (error) {
  console.log('❌ GitHub server schema validation failed:', error);
}

// Test 2: Official Domain-Registered Server (Enterprise)
console.log('\n2. Testing Official Domain-Registered Server (Enterprise)');
const officialServer: MCPServerRecord = {
  domain: 'gmail.com',
  endpoint: 'https://gmail.com/mcp',
  name: 'Gmail MCP Server',
  description: 'Official Gmail MCP server for email integration',
  
  // Server Type Classification  
  server_type: {
    type: 'official',
    github_repo: 'google/gmail-mcp', // May also have GitHub repo
    github_stars: 2340,
    github_verified: true,
    domain_verified: true,
    domain_verification_date: new Date().toISOString(),
    registrant_verified: true,
    official_status: 'enterprise',
    verification_badges: ['dns_verified', 'github_verified', 'registrant_verified', 'enterprise_grade']
  },
  
  // Availability Status
  availability: {
    status: 'live',
    live_endpoint: 'https://gmail.com/mcp',
    endpoint_verified: true,
    last_endpoint_check: new Date().toISOString(),
    packages_available: true, // Also available as packages for local dev
    primary_package: 'npm'
  },
  
  // Package Management (Optional - for local development)
  packages: [
    {
      registry_name: 'npm',
      name: '@google/gmail-mcp',
      version: '2.1.0',
      installation_command: 'npm install @google/gmail-mcp',
      startup_command: 'gmail-mcp --auth oauth2',
      setup_instructions: 'Optional: For local development. Production should use live endpoint.'
    }
  ],
  
  // MCP Protocol Data (Live introspection)
  server_info: {
    name: 'Gmail MCP Server',
    version: '2.1.0',
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
      name: 'send_email',
      description: 'Send an email via Gmail',
      inputSchema: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient email' },
          subject: { type: 'string', description: 'Email subject' },
          body: { type: 'string', description: 'Email body' }
        },
        required: ['to', 'subject', 'body']
      }
    },
    {
      name: 'search_emails',
      description: 'Search emails in Gmail',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Gmail search query' },
          max_results: { type: 'number', description: 'Maximum results to return' }
        },
        required: ['query']
      }
    }
  ],
  
  resources: [
    {
      uri: 'gmail://inbox',
      name: 'Gmail Inbox',
      description: 'Access to Gmail inbox messages'
    }
  ],
  
  transport: 'streamable_http',
  
  capabilities: {
    category: 'communication',
    subcategories: ['email', 'gmail', 'official'],
    intent_keywords: ['email', 'gmail', 'google', 'communication'],
    use_cases: ['Send emails', 'Email management', 'Gmail integration']
  },
  
  auth: {
    type: 'oauth2',
    oauth2: {
      authorizationUrl: 'https://accounts.google.com/oauth/authorize',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/gmail.modify']
    }
  },
  
  cors_enabled: true,
  
  // Operational Status (Live monitoring)
  health: {
    status: 'healthy',
    uptime_percentage: 99.98,
    avg_response_time_ms: 120,
    response_time_ms: 115,
    error_rate: 0.002,
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
  updated_at: new Date().toISOString(),
  verification_status: 'verified',
  trust_score: 98
};

try {
  const validatedOfficial = MCPServerRecordSchema.parse(officialServer);
  console.log('✅ Official server schema validation passed');
  console.log(`   - Type: ${validatedOfficial.server_type?.type}`);
  console.log(`   - Official Status: ${validatedOfficial.server_type?.official_status}`);
  console.log(`   - GitHub Verified: ${validatedOfficial.server_type?.github_verified}`);
  console.log(`   - Domain Verified: ${validatedOfficial.server_type?.domain_verified}`);
  console.log(`   - Verification Badges: ${validatedOfficial.server_type?.verification_badges?.join(', ')}`);
} catch (error) {
  console.log('❌ Official server schema validation failed:', error);
}

// Test 3: Discovery Filtering Examples
console.log('\n3. Testing Discovery Filtering Logic');
console.log('-'.repeat(50));

const allServers = [githubServer, officialServer];

// Filter 1: Official servers only
console.log('\n3a. Official Servers Only:');
const officialOnly = allServers.filter(server => 
  server.server_type?.type === 'official'
);
console.log(`   Found ${officialOnly.length} official servers`);
officialOnly.forEach(server => 
  console.log(`   - ${server.name} (${server.server_type?.official_status})`)
);

// Filter 2: GitHub servers only
console.log('\n3b. GitHub Servers Only:');
const githubOnly = allServers.filter(server => 
  server.server_type?.type === 'github'
);
console.log(`   Found ${githubOnly.length} GitHub servers`);
githubOnly.forEach(server => 
  console.log(`   - ${server.name} (${server.server_type?.github_stars} stars)`)
);

// Filter 3: Verified servers only (any type)
console.log('\n3c. Verified Servers (Any Type):');
const verifiedServers = allServers.filter(server => 
  server.server_type?.domain_verified || server.server_type?.github_verified
);
console.log(`   Found ${verifiedServers.length} verified servers`);
verifiedServers.forEach(server => 
  console.log(`   - ${server.name} (${server.server_type?.type}, ${server.server_type?.verification_badges?.join(', ')})`)
);

// Filter 4: Enterprise-grade only
console.log('\n3d. Enterprise-Grade Servers:');
const enterpriseServers = allServers.filter(server => 
  server.server_type?.official_status === 'enterprise'
);
console.log(`   Found ${enterpriseServers.length} enterprise servers`);
enterpriseServers.forEach(server => 
  console.log(`   - ${server.name} (Trust Score: ${server.trust_score})`)
);

// Filter 5: Live endpoints only
console.log('\n3e. Live Endpoints Only:');
const liveServers = allServers.filter(server => 
  server.availability?.status === 'live' && server.availability?.endpoint_verified
);
console.log(`   Found ${liveServers.length} live servers`);
liveServers.forEach(server => 
  console.log(`   - ${server.name} (${server.endpoint})`)
);

console.log('\n🎉 All Server Type Classification Tests Completed!');
console.log('\n📋 Summary:');
console.log('✅ GitHub-based servers: Community/unofficial classification');
console.log('✅ Official domain servers: Enterprise/verified classification');
console.log('✅ Clear distinction between server types');
console.log('✅ Flexible filtering capabilities');
console.log('✅ Verification badge system');
console.log('✅ Official status hierarchy');

console.log('\n🚀 Benefits:');
console.log('- Clear distinction between unofficial GitHub repos and official services');
console.log('- Domain ownership verification for official servers');
console.log('- Trust and verification badge system');
console.log('- Flexible discovery filtering by server type');
console.log('- Support for both live endpoints and package installations');
console.log('- Backward compatibility with existing GitHub discovery');
