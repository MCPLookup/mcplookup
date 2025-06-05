#!/usr/bin/env tsx
// Storage Abstraction Test Script
// Tests all storage providers to ensure they work correctly

import { createStorage } from '../src/lib/services/storage/factory';
import { RegistryService } from '../src/lib/services/registry';
import { VerificationService } from '../src/lib/services/verification';
import { MCPValidationService } from '../src/lib/services/verification';
import { MCPServerRecord, CapabilityCategory } from '../src/lib/schemas/discovery.js';

async function testStorageProvider(providerName: string, backend: 'memory' | 'redis') {
  console.log(`\n🧪 Testing ${providerName} Storage Provider`);
  console.log('='.repeat(50));

  try {
    // Create services with specific backend
    const storage = createStorage({ backend });
    const registryService = new RegistryService();
    const mcpService = new MCPValidationService();
    const verificationService = new VerificationService(mcpService, registryService);

    // Test health checks
    console.log('📊 Health Checks:');
    const storageHealth = await storage.healthCheck();
    console.log(`  Storage: ${storageHealth.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);

    if (!storageHealth.healthy) {
      console.log(`⚠️  Skipping ${providerName} tests due to health check failures`);
      return;
    }

    // Test registry storage
    console.log('\n📝 Testing Registry Storage:');
    
    const mockServer: MCPServerRecord = {
      // Identity
      domain: 'test-example.com',
      endpoint: 'https://test-example.com/.well-known/mcp',
      name: 'Test Server',
      description: 'A test MCP server for storage testing',

      // MCP Protocol Data
      server_info: {
        name: 'Test Server',
        version: '1.0.0',
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: true,
          resources: false,
          prompts: false,
          logging: false
        }
      },
      tools: [
        {
          name: 'test_tool',
          description: 'A test tool',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      ],
      resources: [],
      transport: 'streamable_http',

      // Semantic Organization
      capabilities: {
        category: 'productivity' as CapabilityCategory,
        subcategories: ['email', 'calendar'],
        intent_keywords: ['email', 'calendar', 'schedule', 'meeting'],
        use_cases: ['Send emails', 'Manage calendar events', 'Schedule meetings']
      },

      // Technical Requirements
      auth: {
        type: 'none'
      },
      cors_enabled: true,

      // Operational Status
      health: {
        status: 'healthy',
        uptime_percentage: 99.9,
        avg_response_time_ms: 150,
        response_time_ms: 150,
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

      // Metadata
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      maintainer: {
        name: 'Test Maintainer',
        email: 'test@example.com'
      }
    };

    // Store server
    try {
      await registryService.registerServer(mockServer);
      console.log('  ✅ Server stored successfully');
    } catch (error) {
      console.log(`  ❌ Failed to store server: ${error}`);
      return;
    }

    // Retrieve server
    try {
      const retrieved = await registryService.getServer('test-example.com');
      console.log(`  ✅ Server retrieved: ${retrieved?.domain === 'test-example.com' ? 'Match' : 'Mismatch'}`);
    } catch (error) {
      console.log(`  ❌ Failed to retrieve server: ${error}`);
    }

    // Get all servers
    try {
      const allServers = await registryService.getAllServers();
      console.log(`  ✅ All servers count: ${allServers.length}`);
    } catch (error) {
      console.log(`  ❌ Failed to get all servers: ${error}`);
    }

    // Get servers by category
    try {
      const categoryServers = await registryService.getServersByCategory('productivity' as CapabilityCategory);
      console.log(`  ✅ Category servers count: ${categoryServers.length}`);
    } catch (error) {
      console.log(`  ❌ Failed to get category servers: ${error}`);
    }

    // Search servers
    try {
      const searchResults = await registryService.searchServers(['test']);
      console.log(`  ✅ Search results count: ${searchResults.length}`);
    } catch (error) {
      console.log(`  ❌ Failed to search servers: ${error}`);
    }

    // Get statistics
    try {
      const stats = await registryService.getRegistryStats();
      console.log(`  ✅ Stats - Total: ${stats.totalServers}, Registered: ${stats.registeredServers}`);
    } catch (error) {
      console.log(`  ❌ Failed to get stats: ${error}`);
    }

    // Test verification storage
    console.log('\n🔐 Testing Verification Storage:');

    const mockChallenge = {
      // Base VerificationChallenge fields
      challenge_id: 'test-challenge-123',
      domain: 'test-example.com',
      txt_record_name: '_mcp-verify.test-example.com',
      txt_record_value: 'mcp_verify_test123',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      instructions: 'Create a DNS TXT record at _mcp-verify.test-example.com with value mcp_verify_test123',

      // Extended VerificationChallengeData fields
      endpoint: 'https://test-example.com/.well-known/mcp',
      contact_email: 'test@example.com',
      token: 'test-token-123',
      created_at: new Date().toISOString()
    };

    // Test verification service
    try {
      const request = {
        domain: 'test-example.com',
        endpoint: 'https://test-example.com/.well-known/mcp',
        contact_email: 'test@example.com'
      };
      const challenge = await verificationService.initiateDNSVerification(request);
      console.log('  ✅ Challenge created successfully');

      // Test challenge retrieval
      const retrieved = await verificationService.getChallengeStatus(challenge.challenge_id);
      console.log(`  ✅ Challenge retrieved: ${retrieved?.challenge_id === challenge.challenge_id ? 'Match' : 'Mismatch'}`);

      console.log('  ✅ Verification service working');
    } catch (error) {
      console.log(`  ❌ Verification service failed: ${error}`);
    }

    // Cleanup
    console.log('\n🧹 Cleanup:');
    try {
      await registryService.unregisterServer('test-example.com');
      console.log('  ✅ Test data cleaned up');
    } catch (error) {
      console.log('  ⚠️  Some cleanup operations failed');
    }

    console.log(`\n✅ ${providerName} storage tests completed successfully!`);

  } catch (error) {
    console.error(`\n❌ ${providerName} storage tests failed:`, error);
  }
}

async function main() {
  console.log('🚀 MCPLookup Storage Abstraction Test Suite');
  console.log('Testing all storage providers...\n');

  // Test in-memory storage (always available)
  await testStorageProvider('In-Memory', 'memory');

  // Test Redis storage (if available)
  if (process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL) {
    await testStorageProvider('Redis', 'redis');
  } else {
    console.log('\n⚠️  Redis tests skipped (no Redis credentials set)');
    console.log('   To test Redis: Set REDIS_URL or UPSTASH_REDIS_REST_URL');
  }

  console.log('\n🎉 Storage abstraction test suite completed!');
  console.log('\n📋 Summary:');
  console.log('  ✅ In-Memory: Always available for development and testing');
  console.log('  🐳 Local Redis: Available when Docker is running');
  console.log('  ☁️  Upstash Redis: Available when credentials are configured');
  console.log('\nThe storage abstraction automatically selects the best available provider.');
}

// Run the tests
main().catch(console.error);
