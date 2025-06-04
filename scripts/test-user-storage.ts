#!/usr/bin/env tsx

// Test script for Redis-based user storage implementations
// Tests both LocalRedisUserStorage and UpstashUserStorage

import { randomUUID } from 'crypto';
import { getUserStorage } from '../src/lib/services/storage/storage';
import { UserProfile, UserSession, UserRegistration } from '../src/lib/services/storage/interfaces';

async function testUserStorage() {
  console.log('🧪 Testing Redis-based User Storage Implementations\n');

  // Test different storage providers
  const providers = ['memory', 'local', 'upstash'] as const;

  for (const provider of providers) {
    console.log(`\n📦 Testing ${provider.toUpperCase()} User Storage`);
    console.log('='.repeat(50));

    try {
      const userStorage = getUserStorage({ provider });
      
      // Test health check
      console.log('🏥 Health Check...');
      const healthResult = await userStorage.healthCheck();
      console.log(`   Status: ${healthResult.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      console.log(`   Latency: ${healthResult.latency}ms`);
      if (healthResult.details) {
        console.log(`   Provider: ${healthResult.details.provider}`);
        if (healthResult.details.userCount !== undefined) {
          console.log(`   Users: ${healthResult.details.userCount}`);
        }
      }

      // Create test user
      console.log('\n👤 Creating test user...');
      const userId = randomUUID();
      const testUser: UserProfile = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        provider: 'github',
        provider_id: 'github123',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: true,
        is_active: true,
        preferences: {
          theme: 'dark',
          notifications: true,
          newsletter: false
        }
      };

      const storeResult = await userStorage.storeUser(userId, testUser);
      if (storeResult.success) {
        console.log('   ✅ User created successfully');
      } else {
        console.log(`   ❌ Failed to create user: ${storeResult.error}`);
        continue;
      }

      // Test user retrieval
      console.log('\n🔍 Testing user retrieval...');
      
      // Get by ID
      const getUserResult = await userStorage.getUser(userId);
      if (getUserResult.success && getUserResult.data) {
        console.log('   ✅ Get user by ID: Success');
        console.log(`   📧 Email: ${getUserResult.data.email}`);
        console.log(`   👤 Name: ${getUserResult.data.name}`);
        console.log(`   🔐 Provider: ${getUserResult.data.provider}`);
      } else {
        console.log('   ❌ Get user by ID: Failed');
      }

      // Get by email
      const getUserByEmailResult = await userStorage.getUserByEmail('test@example.com');
      if (getUserByEmailResult.success && getUserByEmailResult.data) {
        console.log('   ✅ Get user by email: Success');
      } else {
        console.log('   ❌ Get user by email: Failed');
      }

      // Get by provider
      const getUserByProviderResult = await userStorage.getUserByProvider('github', 'github123');
      if (getUserByProviderResult.success && getUserByProviderResult.data) {
        console.log('   ✅ Get user by provider: Success');
      } else {
        console.log('   ❌ Get user by provider: Failed');
      }

      // Test user update
      console.log('\n✏️  Testing user update...');
      const updateResult = await userStorage.updateUser(userId, {
        name: 'Updated Test User',
        role: 'admin',
        email_verified: false
      });
      if (updateResult.success) {
        console.log('   ✅ User updated successfully');
        
        // Verify update
        const updatedUserResult = await userStorage.getUser(userId);
        if (updatedUserResult.success && updatedUserResult.data) {
          console.log(`   📝 Updated name: ${updatedUserResult.data.name}`);
          console.log(`   🔑 Updated role: ${updatedUserResult.data.role}`);
          console.log(`   📧 Email verified: ${updatedUserResult.data.email_verified}`);
        }
      } else {
        console.log(`   ❌ Failed to update user: ${updateResult.error}`);
      }

      // Test session management
      console.log('\n🔐 Testing session management...');
      const sessionId = randomUUID();
      const testSession: UserSession = {
        id: sessionId,
        user_id: userId,
        token: 'test-session-token-123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        created_at: new Date().toISOString(),
        is_active: true,
        ip_address: '127.0.0.1',
        user_agent: 'Test User Agent'
      };

      const storeSessionResult = await userStorage.storeSession(sessionId, testSession);
      if (storeSessionResult.success) {
        console.log('   ✅ Session created successfully');
        
        // Test session retrieval
        const getSessionResult = await userStorage.getSession(sessionId);
        if (getSessionResult.success && getSessionResult.data) {
          console.log('   ✅ Session retrieved successfully');
          console.log(`   🎫 Token: ${getSessionResult.data.token.substring(0, 20)}...`);
        }
      } else {
        console.log(`   ❌ Failed to create session: ${storeSessionResult.error}`);
      }

      // Test registration tracking
      console.log('\n📝 Testing registration tracking...');
      const registrationId = randomUUID();
      const testRegistration: UserRegistration = {
        id: registrationId,
        user_id: userId,
        domain: 'test-example.com',
        challenge_id: 'challenge-123',
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      const storeRegResult = await userStorage.storeRegistration(registrationId, testRegistration);
      if (storeRegResult.success) {
        console.log('   ✅ Registration created successfully');
        
        // Test registration retrieval
        const getRegResult = await userStorage.getRegistrationsByUser(userId);
        if (getRegResult.success && getRegResult.data.items.length > 0) {
          console.log('   ✅ Registration retrieved successfully');
          console.log(`   🌐 Domain: ${getRegResult.data.items[0].domain}`);
          console.log(`   📊 Status: ${getRegResult.data.items[0].status}`);
        }
      } else {
        console.log(`   ❌ Failed to create registration: ${storeRegResult.error}`);
      }

      // Test user search and filtering
      console.log('\n🔍 Testing user search and filtering...');
      const getAllResult = await userStorage.getAllUsers({ limit: 10 });
      if (getAllResult.success) {
        console.log(`   ✅ Found ${getAllResult.data.total} users`);
        console.log(`   📄 Page size: ${getAllResult.data.items.length}`);
      }

      const searchResult = await userStorage.searchUsers('test', { limit: 5 });
      if (searchResult.success) {
        console.log(`   ✅ Search found ${searchResult.data.total} matching users`);
      }

      // Test statistics
      console.log('\n📊 Testing user statistics...');
      const statsResult = await userStorage.getStats();
      if (statsResult.success) {
        console.log('   ✅ Statistics retrieved successfully');
        console.log(`   👥 Total users: ${statsResult.data.totalUsers}`);
        console.log(`   ✅ Active users: ${statsResult.data.activeUsers}`);
        console.log(`   📧 Verified users: ${statsResult.data.verifiedUsers}`);
        console.log(`   🔐 Providers: ${Object.keys(statsResult.data.usersByProvider).join(', ')}`);
        console.log(`   🎭 Roles: ${Object.keys(statsResult.data.usersByRole).join(', ')}`);
      }

      // Test cleanup
      console.log('\n🧹 Testing cleanup...');
      const cleanupResult = await userStorage.cleanup(true); // Dry run
      if (cleanupResult.success) {
        console.log(`   ✅ Cleanup would remove ${cleanupResult.data.removedCount} items`);
        if (cleanupResult.data.freedSpace) {
          console.log(`   💾 Would free: ${cleanupResult.data.freedSpace}`);
        }
      }

      // Cleanup test data
      console.log('\n🗑️  Cleaning up test data...');
      await userStorage.deleteSession(sessionId);
      await userStorage.deleteUser(userId);
      console.log('   ✅ Test data cleaned up');

    } catch (error) {
      console.log(`   ❌ Error testing ${provider} storage:`, error);
      
      // Skip Upstash if credentials are missing
      if (provider === 'upstash' && error instanceof Error && error.message.includes('credentials')) {
        console.log('   ℹ️  Skipping Upstash test (credentials not configured)');
        continue;
      }
      
      // Skip local Redis if connection fails
      if (provider === 'local' && error instanceof Error) {
        console.log('   ℹ️  Skipping local Redis test (Redis not available)');
        continue;
      }
    }
  }

  console.log('\n🎉 User storage testing completed!');
}

// Run the test
testUserStorage().catch(console.error);
