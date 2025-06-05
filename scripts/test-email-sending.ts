#!/usr/bin/env tsx

// Test script for email sending functionality
// Run with: npx tsx scripts/test-email-sending.ts

import { emailService } from '../src/lib/services/email'

async function testEmailConfiguration() {
  console.log('🔧 Testing email configuration...')
  
  // Check if email service is configured
  const isConnected = await emailService.testConnection()
  
  if (!isConnected) {
    console.log('❌ Email service not configured or connection failed')
    console.log('\n💡 To configure email service:')
    console.log('1. Add these environment variables to your .env.local file:')
    console.log('   EMAIL_HOST=smtp.gmail.com')
    console.log('   EMAIL_PORT=587')
    console.log('   EMAIL_USER=your-email@yourdomain.com')
    console.log('   EMAIL_PASS=your-16-character-app-password')
    console.log('   EMAIL_FROM=noreply@yourdomain.com')
    console.log('\n2. Get Google App Password:')
    console.log('   - Enable 2FA on your Google account')
    console.log('   - Go to https://myaccount.google.com/apppasswords')
    console.log('   - Generate app password for "Mail"')
    console.log('   - Use the 16-character password as EMAIL_PASS')
    return false
  }
  
  console.log('✅ Email service connected successfully!')
  return true
}

async function sendTestVerificationEmail() {
  console.log('\n📧 Testing verification email...')
  
  const testEmail = process.env.TEST_EMAIL || 'test@example.com'
  const testName = 'Test User'
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=test-token&email=${encodeURIComponent(testEmail)}`
  
  try {
    const emailSent = await emailService.sendVerificationEmail({
      email: testEmail,
      name: testName,
      verificationUrl,
      expiresIn: '24 hours'
    })
    
    if (emailSent) {
      console.log(`✅ Verification email sent successfully to ${testEmail}`)
      console.log(`📬 Check the inbox for: ${testEmail}`)
    } else {
      console.log('❌ Failed to send verification email')
    }
    
    return emailSent
  } catch (error) {
    console.error('❌ Error sending verification email:', error)
    return false
  }
}

async function sendTestWelcomeEmail() {
  console.log('\n🎉 Testing welcome email...')
  
  const testEmail = process.env.TEST_EMAIL || 'test@example.com'
  const testName = 'Test User'
  
  try {
    const emailSent = await emailService.sendWelcomeEmail(testEmail, testName)
    
    if (emailSent) {
      console.log(`✅ Welcome email sent successfully to ${testEmail}`)
    } else {
      console.log('❌ Failed to send welcome email')
    }
    
    return emailSent
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    return false
  }
}

async function sendTestPasswordResetEmail() {
  console.log('\n🔒 Testing password reset email...')
  
  const testEmail = process.env.TEST_EMAIL || 'test@example.com'
  const testName = 'Test User'
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=test-token&email=${encodeURIComponent(testEmail)}`
  
  try {
    const emailSent = await emailService.sendPasswordResetEmail({
      email: testEmail,
      name: testName,
      resetUrl,
      expiresIn: '1 hour'
    })
    
    if (emailSent) {
      console.log(`✅ Password reset email sent successfully to ${testEmail}`)
    } else {
      console.log('❌ Failed to send password reset email')
    }
    
    return emailSent
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    return false
  }
}

async function main() {
  console.log('🚀 MCPLookup.org Email Sending Test\n')
  
  // Test configuration
  const isConfigured = await testEmailConfiguration()
  
  if (!isConfigured) {
    console.log('\n❌ Email service not configured. Please set up environment variables first.')
    process.exit(1)
  }
  
  // Get test email from environment or prompt
  const testEmail = process.env.TEST_EMAIL
  
  if (!testEmail) {
    console.log('\n💡 To send test emails, set TEST_EMAIL environment variable:')
    console.log('   export TEST_EMAIL=your-email@example.com')
    console.log('   npx tsx scripts/test-email-sending.ts')
    console.log('\n⚠️  Skipping email sending tests...')
    return
  }
  
  console.log(`\n📬 Sending test emails to: ${testEmail}`)
  console.log('⚠️  Make sure this is a real email address you can access!\n')
  
  // Test all email types
  const results = await Promise.all([
    sendTestVerificationEmail(),
    sendTestWelcomeEmail(),
    sendTestPasswordResetEmail()
  ])
  
  const successCount = results.filter(Boolean).length
  const totalTests = results.length
  
  console.log(`\n📊 Test Results: ${successCount}/${totalTests} emails sent successfully`)
  
  if (successCount === totalTests) {
    console.log('🎉 All email tests passed! Your email service is working correctly.')
    console.log('\n📋 Next steps:')
    console.log('1. Check your email inbox for the test emails')
    console.log('2. Start your development server: npm run dev')
    console.log('3. Test user registration at: http://localhost:3000/auth/signin')
  } else {
    console.log('⚠️  Some email tests failed. Check your configuration and try again.')
  }
}

// Run the main function
main().catch(console.error)
