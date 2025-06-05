#!/usr/bin/env tsx

// Simple test script specifically for Resend
// Run with: npx tsx scripts/test-resend-only.ts

import { config } from 'dotenv'
import { Resend } from 'resend'

// Load environment variables from .env.local
config({ path: '.env.local' })

async function testResendDirectly() {
  console.log('🚀 Testing Resend Email Service Directly\n')
  
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.EMAIL_FROM || 'noreply@mcplookup.org'  // Use your verified domain
  const testEmail = process.env.TEST_EMAIL || 'test@nefariousplan.com'  // Can now send to any email
  
  if (!apiKey) {
    console.log('❌ RESEND_API_KEY not found in environment variables')
    console.log('💡 Add to your .env.local file:')
    console.log('   RESEND_API_KEY=re_your_api_key_here')
    return false
  }
  
  if (!apiKey.startsWith('re_')) {
    console.log('⚠️  Warning: API key should start with "re_"')
    console.log(`   Current key: ${apiKey.substring(0, 10)}...`)
  }
  
  console.log(`📧 From: ${fromEmail}`)
  console.log(`📬 To: ${testEmail}`)
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`)
  console.log('')
  
  try {
    const resend = new Resend(apiKey)
    
    console.log('📤 Sending test verification email...')
    
    const verificationResult = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: 'Test: Verify your MCPLookup.org account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Email</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 48px; margin-bottom: 10px; }
            .title { color: #f97316; font-size: 24px; font-weight: bold; margin: 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔍</div>
              <h1 class="title">MCPLookup.org</h1>
            </div>
            
            <div class="content">
              <h2>🧪 Test Email - Verification</h2>
              <p>Hi there!</p>
              <p>This is a test email from MCPLookup.org to verify that Resend email service is working correctly.</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/auth/verify-email?token=test-token&email=${encodeURIComponent(testEmail)}" class="button">Test Verification Link</a>
              </p>
              
              <p><strong>Test Details:</strong></p>
              <ul>
                <li>📧 Provider: Resend</li>
                <li>🕒 Sent: ${new Date().toISOString()}</li>
                <li>🎯 Purpose: Email verification test</li>
              </ul>
              
              <p>If you received this email, the email service is working correctly! 🎉</p>
            </div>
            
            <div class="footer">
              <p>MCPLookup.org - Professional MCP Discovery Service</p>
              <p>This is a test email - no action required</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
    
    console.log('✅ Verification email sent successfully!')
    
    // Check for errors in the response
    if (verificationResult.error) {
      console.log('❌ Error in verification email:', verificationResult.error)
      throw new Error(`Verification email failed: ${verificationResult.error.message}`)
    }
    
    console.log(`   Response:`, JSON.stringify(verificationResult, null, 2))
    console.log(`   Email ID: ${verificationResult.data?.id || 'Not found'}`)
    
    // Wait a moment before sending next email
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('📤 Sending test welcome email...')
    
    const welcomeResult = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: 'Test: Welcome to MCPLookup.org!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome Test</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 48px; margin-bottom: 10px; }
            .title { color: #f97316; font-size: 24px; font-weight: bold; margin: 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔍</div>
              <h1 class="title">MCPLookup.org</h1>
            </div>
            
            <div class="content">
              <h2>🎉 Test Email - Welcome</h2>
              <p>Welcome to MCPLookup.org!</p>
              <p>This is a test welcome email to verify the email service integration.</p>
              
              <p>MCPLookup.org helps you:</p>
              <ul>
                <li>🔍 Discover MCP servers with natural language queries</li>
                <li>🚀 Register your own MCP servers</li>
                <li>🔗 Connect AI agents to powerful tools and services</li>
                <li>📊 Monitor server performance and reliability</li>
              </ul>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/dashboard" class="button">Get Started (Test)</a>
              </p>
              
              <p><strong>Test completed successfully!</strong> 🎉</p>
            </div>
            
            <div class="footer">
              <p>MCPLookup.org - Professional MCP Discovery Service</p>
              <p>This is a test email - email service is working! 🚀</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
    
    console.log('✅ Welcome email sent successfully!')
    
    // Check for errors in the response
    if (welcomeResult.error) {
      console.log('❌ Error in welcome email:', welcomeResult.error)
      throw new Error(`Welcome email failed: ${welcomeResult.error.message}`)
    }
    
    console.log(`   Response:`, JSON.stringify(welcomeResult, null, 2))
    console.log(`   Email ID: ${welcomeResult.data?.id || 'Not found'}`)
    
    console.log('\n🎉 All tests passed! Resend email service is working correctly.')
    console.log(`📬 Check ${testEmail} for the test emails.`)
    
    return true
    
  } catch (error) {
    console.error('❌ Error testing Resend:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.log('\n💡 API Key issue:')
        console.log('   - Make sure your API key is correct')
        console.log('   - Check that it starts with "re_"')
        console.log('   - Verify it\'s active in your Resend dashboard')
      } else if (error.message.includes('from')) {
        console.log('\n💡 From address issue:')
        console.log('   - Make sure EMAIL_FROM is a valid email address')
        console.log('   - For testing, any email format works')
        console.log('   - For production, use your verified domain')
      }
    }
    
    return false
  }
}

async function main() {
  const success = await testResendDirectly()
  
  if (success) {
    console.log('\n📋 Next steps:')
    console.log('1. Check test@nefariousplan.com for the test emails')
    console.log('2. Start your development server: npm run dev')
    console.log('3. Test user registration at: http://localhost:3000/auth/signin')
    console.log('4. Register with a real email to test the full flow')
  } else {
    console.log('\n🔧 Fix the issues above and try again.')
  }
}

// Run the test
main().catch(console.error)
