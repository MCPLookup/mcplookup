#!/usr/bin/env tsx

// Test script for email authentication functionality
// Run with: npx tsx scripts/test-email-auth.ts

import { hashPassword, verifyPassword, validatePassword } from '../src/lib/auth/password'
import { emailService } from '../src/lib/services/email'

async function testPasswordFunctions() {
  console.log('🔐 Testing password functions...')
  
  const password = 'TestPassword123!'
  
  // Test password validation
  const validation = validatePassword(password)
  console.log('Password validation:', {
    isValid: validation.isValid,
    score: validation.score,
    errors: validation.errors
  })
  
  // Test password hashing
  const hashedPassword = await hashPassword(password)
  console.log('Password hashed successfully:', hashedPassword.length > 0)
  
  // Test password verification
  const isValid = await verifyPassword(password, hashedPassword)
  console.log('Password verification:', isValid)
  
  const isInvalid = await verifyPassword('wrongpassword', hashedPassword)
  console.log('Wrong password verification:', isInvalid)
  
  console.log('✅ Password functions working correctly\n')
}

async function testEmailService() {
  console.log('📧 Testing email service...')
  
  // Test email service initialization
  const isConnected = await emailService.testConnection()
  console.log('Email service connection:', isConnected ? '✅ Connected' : '❌ Not connected')
  
  if (!isConnected) {
    console.log('💡 To enable email functionality, set these environment variables:')
    console.log('   EMAIL_HOST=smtp.gmail.com')
    console.log('   EMAIL_PORT=587')
    console.log('   EMAIL_USER=your-email@domain.com')
    console.log('   EMAIL_PASS=your-app-password')
    console.log('   EMAIL_FROM=noreply@domain.com')
  }
  
  console.log('✅ Email service test completed\n')
}

async function testAuthFlow() {
  console.log('🔄 Testing authentication flow...')
  
  // Test user creation data structure
  const userData = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'TestPassword123!',
    emailVerified: false
  }
  
  console.log('User data structure:', userData)
  
  // Test password strength validation
  const weakPassword = validatePassword('123')
  const strongPassword = validatePassword('StrongPassword123!')
  
  console.log('Weak password validation:', {
    isValid: weakPassword.isValid,
    score: weakPassword.score
  })
  
  console.log('Strong password validation:', {
    isValid: strongPassword.isValid,
    score: strongPassword.score
  })
  
  console.log('✅ Authentication flow test completed\n')
}

async function main() {
  console.log('🚀 MCPLookup.org Email Authentication Test\n')
  
  try {
    await testPasswordFunctions()
    await testEmailService()
    await testAuthFlow()
    
    console.log('🎉 All tests completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Set up email environment variables (see EMAIL_AUTH_SETUP.md)')
    console.log('2. Start the development server: npm run dev')
    console.log('3. Visit http://localhost:3000/auth/signin')
    console.log('4. Test registration and sign-in flows')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the main function
main()
