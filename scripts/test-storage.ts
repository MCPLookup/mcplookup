#!/usr/bin/env tsx
// Storage Abstraction Test Script
// Tests all storage providers to ensure they work correctly

import { getRegistryStorage, getVerificationStorage } from '../src/lib/services/storage/storage.js';
import { MCPServerRecord, CapabilityCategory } from '../src/lib/schemas/discovery.js';
import { VerificationChallengeData, isSuccessResult } from '../src/lib/services/storage/interfaces.js';

async function testStorageProvider(providerName: string, provider: 'memory' | 'local' | 'upstash') {
  console.log(`\n🧪 Testing ${providerName} Storage Provider`);
  console.log('='.repeat(50));

  try {
    // Get storage instances
    const registryStorage = getRegistryStorage({ provider });
    const verificationStorage = getVerificationStorage({ provider });

    // Test health checks
    console.log('📊 Health Checks:');
    const registryHealth = await registryStorage.healthCheck();
    const verificationHealth = await verificationStorage.healthCheck();
    console.log(`  Registry: ${registryHealth.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`  Verification: ${verificationHealth.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);

    if (!registryHealth.healthy || !verificationHealth.healthy) {
      console.log(`⚠️  Skipping ${providerName} tests due to health check failures`);
      return;
    }

    // Test registry storage
    console.log('\n📝 Testing Registry Storage:');
    
    const mockServer: MCPServerRecord = {
      domain: 'test-example.com',
      endpoint: 'https://test-example.com/.well-known/mcp',
      capabilities: {
        category: 'productivity' as CapabilityCategory,
        subcategories: ['email', 'calendar']
      },
      server_info: {
        name: 'Test Server',
        description: 'A test MCP server for storage testing',
        version: '1.0.0'
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
      verification: {
        dns_verified: true,
        endpoint_verified: true,
        ssl_verified: true,
        last_verification: new Date().toISOString(),
        verification_method: 'dns-txt-challenge'
      },
      health: {
        status: 'healthy',
        last_check: new Date().toISOString(),
        response_time_ms: 150,
        uptime_percentage: 99.9,
        error_count: 0
      },
      discovery_method: 'well-known',
      last_updated: new Date().toISOString()
    };

    // Store server
    const storeResult = await registryStorage.storeServer('test-example.com', mockServer);
    if (isSuccessResult(storeResult)) {
      console.log('  ✅ Server stored successfully');
    } else {
      console.log(`  ❌ Failed to store server: ${storeResult.error}`);
      return;
    }

    // Retrieve server
    const retrieveResult = await registryStorage.getServer('test-example.com');
    if (isSuccessResult(retrieveResult)) {
      const retrieved = retrieveResult.data;
      console.log(`  ✅ Server retrieved: ${retrieved?.domain === 'test-example.com' ? 'Match' : 'Mismatch'}`);
    } else {
      console.log(`  ❌ Failed to retrieve server: ${retrieveResult.error}`);
    }

    // Get all servers
    const allServersResult = await registryStorage.getAllServers();
    if (isSuccessResult(allServersResult)) {
      console.log(`  ✅ All servers count: ${allServersResult.data.items.length}`);
    } else {
      console.log(`  ❌ Failed to get all servers: ${allServersResult.error}`);
    }

    // Get servers by category
    const categoryResult = await registryStorage.getServersByCategory('productivity' as CapabilityCategory);
    if (isSuccessResult(categoryResult)) {
      console.log(`  ✅ Category servers count: ${categoryResult.data.items.length}`);
    } else {
      console.log(`  ❌ Failed to get category servers: ${categoryResult.error}`);
    }

    // Search servers
    const searchResult = await registryStorage.searchServers('test');
    if (isSuccessResult(searchResult)) {
      console.log(`  ✅ Search results count: ${searchResult.data.items.length}`);
    } else {
      console.log(`  ❌ Failed to search servers: ${searchResult.error}`);
    }

    // Get statistics
    const statsResult = await registryStorage.getStats();
    if (isSuccessResult(statsResult)) {
      const stats = statsResult.data;
      console.log(`  ✅ Stats - Total: ${stats.totalServers}, Categories: ${Object.keys(stats.categories).length}`);
    } else {
      console.log(`  ❌ Failed to get stats: ${statsResult.error}`);
    }

    // Test verification storage
    console.log('\n🔐 Testing Verification Storage:');
    
    const mockChallenge: VerificationChallengeData = {
      challenge_id: 'test-challenge-123',
      domain: 'test-example.com',
      txt_record_name: '_mcp-verify.test-example.com',
      txt_record_value: 'mcp_verify_test123',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      instructions: 'Add the DNS TXT record for testing',
      endpoint: 'https://test-example.com/.well-known/mcp',
      contact_email: 'test@example.com',
      token: 'test123',
      created_at: new Date().toISOString()
    };

    // Store challenge
    const storeChallengeResult = await verificationStorage.storeChallenge('test-challenge-123', mockChallenge);
    if (isSuccessResult(storeChallengeResult)) {
      console.log('  ✅ Challenge stored successfully');
    } else {
      console.log(`  ❌ Failed to store challenge: ${storeChallengeResult.error}`);
      return;
    }

    // Retrieve challenge
    const retrieveChallengeResult = await verificationStorage.getChallenge('test-challenge-123');
    if (isSuccessResult(retrieveChallengeResult)) {
      const retrievedChallenge = retrieveChallengeResult.data;
      console.log(`  ✅ Challenge retrieved: ${retrievedChallenge?.challenge_id === 'test-challenge-123' ? 'Match' : 'Mismatch'}`);
    } else {
      console.log(`  ❌ Failed to retrieve challenge: ${retrieveChallengeResult.error}`);
    }

    // Mark as verified
    const verifyResult = await verificationStorage.markChallengeVerified('test-challenge-123');
    if (isSuccessResult(verifyResult)) {
      const verifiedChallengeResult = await verificationStorage.getChallenge('test-challenge-123');
      if (isSuccessResult(verifiedChallengeResult)) {
        const verifiedChallenge = verifiedChallengeResult.data;
        console.log(`  ✅ Challenge verified: ${verifiedChallenge?.verified_at ? 'Yes' : 'No'}`);
      }
    } else {
      console.log(`  ❌ Failed to verify challenge: ${verifyResult.error}`);
    }

    // Get verification stats
    const verificationStatsResult = await verificationStorage.getStats();
    if (isSuccessResult(verificationStatsResult)) {
      const verificationStats = verificationStatsResult.data;
      console.log(`  ✅ Verification stats - Total: ${verificationStats.totalChallenges}`);
    } else {
      console.log(`  ❌ Failed to get verification stats: ${verificationStatsResult.error}`);
    }

    // Cleanup
    console.log('\n🧹 Cleanup:');
    const deleteServerResult = await registryStorage.deleteServer('test-example.com');
    const deleteChallengeResult = await verificationStorage.deleteChallenge('test-challenge-123');

    if (isSuccessResult(deleteServerResult) && isSuccessResult(deleteChallengeResult)) {
      console.log('  ✅ Test data cleaned up');
    } else {
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

  // Test local Redis storage (if available)
  if (process.env.REDIS_URL) {
    await testStorageProvider('Local Redis', 'local');
  } else {
    console.log('\n⚠️  Local Redis tests skipped (REDIS_URL not set)');
    console.log('   To test local Redis: docker-compose up -d redis');
  }

  // Test Upstash storage (if available)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    await testStorageProvider('Upstash Redis', 'upstash');
  } else {
    console.log('\n⚠️  Upstash Redis tests skipped (credentials not set)');
    console.log('   To test Upstash: Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
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
