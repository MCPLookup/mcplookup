#!/usr/bin/env tsx

// Test script for Redis storage provider
// Verifies that the Redis storage provider works correctly

import { StorageProvider } from '../src/lib/services/storage/storage-provider';
import { createStorage } from '../src/lib/services/storage/factory';

interface TestData {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

async function testRedisProvider() {
  console.log('🧪 Testing Redis Storage Provider...\n');

  const redis = new StorageProvider({ backend: 'redis' });
  
  try {
    // Test health check
    console.log('1. Testing health check...');
    const health = await redis.healthCheck();
    if (health.healthy) {
      console.log('✅ Redis health check passed');
      console.log(`   Latency: ${health.latency}ms\n`);
    } else {
      console.log('❌ Redis health check failed:', health.error);
      return false;
    }

    // Test basic CRUD operations
    console.log('2. Testing CRUD operations...');
    
    const testData: TestData = {
      id: 'test-1',
      name: 'Test Server',
      category: 'development',
      created_at: new Date().toISOString()
    };

    // Test SET
    const setResult = await redis.set('test_collection', 'test-key', testData);
    if (setResult.success) {
      console.log('✅ SET operation successful');
    } else {
      console.log('❌ SET operation failed:', setResult.error);
      return false;
    }

    // Test GET
    const getResult = await redis.get<TestData>('test_collection', 'test-key');
    if (getResult.success && getResult.data) {
      console.log('✅ GET operation successful');
      console.log(`   Retrieved: ${getResult.data.name}`);
    } else {
      console.log('❌ GET operation failed:', getResult.success ? 'No data' : getResult.error);
      return false;
    }

    // Test EXISTS
    const existsResult = await redis.exists('test_collection', 'test-key');
    if (existsResult.success && existsResult.data) {
      console.log('✅ EXISTS operation successful');
    } else {
      console.log('❌ EXISTS operation failed');
      return false;
    }

    // Test batch operations
    console.log('\n3. Testing batch operations...');
    
    const batchData = [
      { key: 'batch-1', data: { ...testData, id: 'batch-1', name: 'Batch Server 1' } },
      { key: 'batch-2', data: { ...testData, id: 'batch-2', name: 'Batch Server 2' } },
      { key: 'batch-3', data: { ...testData, id: 'batch-3', name: 'Batch Server 3' } }
    ];

    const batchSetResult = await redis.setBatch('test_collection', batchData);
    if (batchSetResult.success) {
      console.log(`✅ Batch SET successful: ${batchSetResult.data.successful.length} items`);
    } else {
      console.log('❌ Batch SET failed:', batchSetResult.error);
      return false;
    }

    // Test query operations
    console.log('\n4. Testing query operations...');
    
    const getAllResult = await redis.getAll<TestData>('test_collection');
    if (getAllResult.success) {
      console.log(`✅ GET ALL successful: ${getAllResult.data.items.length} items`);
      console.log(`   Total: ${getAllResult.data.total}`);
    } else {
      console.log('❌ GET ALL failed:', getAllResult.error);
      return false;
    }

    // Test search
    const searchResult = await redis.search<TestData>('test_collection', 'Batch');
    if (searchResult.success) {
      console.log(`✅ SEARCH successful: ${searchResult.data.items.length} items found`);
    } else {
      console.log('❌ SEARCH failed:', searchResult.error);
      return false;
    }

    // Test query with filters
    const queryResult = await redis.query<TestData>('test_collection', {
      filters: { category: 'development' }
    });
    if (queryResult.success) {
      console.log(`✅ QUERY with filters successful: ${queryResult.data.items.length} items`);
    } else {
      console.log('❌ QUERY failed:', queryResult.error);
      return false;
    }

    // Test statistics
    console.log('\n5. Testing statistics...');
    
    const statsResult = await redis.getStats();
    if (statsResult.success) {
      console.log('✅ Statistics retrieved successfully');
      console.log(`   Collections: ${Object.keys(statsResult.data.collections).length}`);
      console.log(`   Total size: ${statsResult.data.totalSize} bytes`);
    } else {
      console.log('❌ Statistics failed:', statsResult.error);
      return false;
    }

    // Cleanup
    console.log('\n6. Cleaning up test data...');
    
    const deleteResult = await redis.delete('test_collection', 'test-key');
    const batchDeleteResult = await redis.deleteBatch('test_collection', ['batch-1', 'batch-2', 'batch-3']);
    
    if (deleteResult.success && batchDeleteResult.success) {
      console.log('✅ Cleanup successful');
    } else {
      console.log('⚠️  Cleanup had issues (non-critical)');
    }

    console.log('\n🎉 All Redis storage tests passed!');
    return true;

  } catch (error) {
    console.log('❌ Test failed with error:', error);
    return false;
  }
}

async function testStorageFactory() {
  console.log('\n🏭 Testing Storage Factory with Redis...\n');

  try {
    // Test auto-detection
    process.env.REDIS_URL = 'redis://localhost:6379';
    const autoStorage = createStorage();
    
    const health = await autoStorage.healthCheck();
    if (health.healthy) {
      console.log('✅ Factory auto-detection works');
      console.log(`   Provider: ${autoStorage.getProviderInfo().name}`);
    } else {
      console.log('❌ Factory auto-detection failed');
      return false;
    }

    // Test explicit Redis backend
    const redisStorage = createStorage({ backend: 'redis' });
    const redisHealth = await redisStorage.healthCheck();
    
    if (redisHealth.healthy) {
      console.log('✅ Explicit Redis provider works');
    } else {
      console.log('❌ Explicit Redis provider failed');
      return false;
    }

    console.log('\n🎉 Storage factory tests passed!');
    return true;

  } catch (error) {
    console.log('❌ Factory test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Redis Storage Provider Test Suite');
  console.log('=====================================\n');

  // Check if Redis is available
  console.log('Checking Redis availability...');
  const testRedis = new StorageProvider({ backend: 'redis' });
  const health = await testRedis.healthCheck();
  
  if (!health.healthy) {
    console.log('❌ Redis is not available. Please start Redis first:');
    console.log('   docker-compose up -d redis');
    console.log('   OR');
    console.log('   ./scripts/redis-manager.sh start');
    process.exit(1);
  }

  console.log('✅ Redis is available\n');

  // Run tests
  const redisTest = await testRedisProvider();
  const factoryTest = await testStorageFactory();

  if (redisTest && factoryTest) {
    console.log('\n🎉 All tests passed! Redis storage is working correctly.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please check the output above.');
    process.exit(1);
  }
}

// Run the tests
main().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
