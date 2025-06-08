#!/usr/bin/env tsx

// Test script for user service

import { randomUUID } from 'crypto';
import { UserService } from '../src/lib/services/user-service';

async function testUserStorage() {
  console.log('🧪 Testing User Service\n');

  try {
    const userService = new UserService();

    console.log('✅ User service created successfully');
    console.log('✅ User service test completed');

  } catch (error) {
    console.log('❌ User service test failed:', error);
  }
}

// Run the test
testUserStorage().catch(console.error);
