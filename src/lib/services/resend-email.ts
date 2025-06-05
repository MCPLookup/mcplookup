// Resend Email Service
// Modern email service using Resend API

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email send')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const result = await resend.emails.send({
      from: 'MCPLookup.org <noreply@mcplookup.org>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Send email verification email
 */
export async function sendEmailVerification(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email - MCPLookup.org</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .content { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">MCPLookup.org</div>
          <p>Universal MCP Discovery Service</p>
        </div>
        
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up for MCPLookup.org! To complete your registration, please verify your email address by clicking the button below:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </p>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${verificationUrl}
          </p>
          
          <p><strong>This link will expire in 24 hours.</strong></p>
        </div>
        
        <div class="footer">
          <p>If you didn't create an account with MCPLookup.org, you can safely ignore this email.</p>
          <p>© 2025 MCPLookup.org - Universal MCP Discovery Service</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Verify Your Email - MCPLookup.org
    
    Thank you for signing up for MCPLookup.org! To complete your registration, please verify your email address by visiting:
    
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create an account with MCPLookup.org, you can safely ignore this email.
  `

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - MCPLookup.org',
    html,
    text,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password - MCPLookup.org</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .content { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">MCPLookup.org</div>
          <p>Universal MCP Discovery Service</p>
        </div>
        
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password for your MCPLookup.org account. Click the button below to create a new password:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>Security Notice:</strong>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>The link can only be used once</li>
              <li>If you didn't request this reset, please ignore this email</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
          <p>© 2025 MCPLookup.org - Universal MCP Discovery Service</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Reset Your Password - MCPLookup.org
    
    We received a request to reset your password for your MCPLookup.org account. Visit this link to create a new password:
    
    ${resetUrl}
    
    Security Notice:
    - This link will expire in 1 hour
    - The link can only be used once
    - If you didn't request this reset, please ignore this email
    
    If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
  `

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - MCPLookup.org',
    html,
    text,
  })
}

/**
 * Send welcome email after successful registration
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to MCPLookup.org!</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .content { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
        .features { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .feature { margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">MCPLookup.org</div>
          <p>Universal MCP Discovery Service</p>
        </div>
        
        <div class="content">
          <h2>Welcome to MCPLookup.org, ${name}! 🎉</h2>
          <p>Your account has been successfully created and verified. You're now part of the universal MCP discovery ecosystem!</p>
          
          <div class="features">
            <h3>What you can do now:</h3>
            <div class="feature">🔍 <strong>Discover MCP Servers</strong> - Find tools for any task using natural language</div>
            <div class="feature">🤖 <strong>AI-Powered Search</strong> - Get intelligent recommendations based on your needs</div>
            <div class="feature">📝 <strong>Register Your Servers</strong> - Add your MCP servers to the directory</div>
            <div class="feature">🔑 <strong>API Access</strong> - Create API keys for programmatic access</div>
            <div class="feature">📊 <strong>Analytics Dashboard</strong> - Monitor usage and server health</div>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
          </p>
        </div>
        
        <div class="footer">
          <p>Need help? Check out our <a href="${process.env.NEXTAUTH_URL}/docs">documentation</a> or join our <a href="https://discord.gg/mcplookup">Discord community</a>.</p>
          <p>© 2025 MCPLookup.org - Universal MCP Discovery Service</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Welcome to MCPLookup.org, ${name}!
    
    Your account has been successfully created and verified. You're now part of the universal MCP discovery ecosystem!
    
    What you can do now:
    - Discover MCP Servers: Find tools for any task using natural language
    - AI-Powered Search: Get intelligent recommendations based on your needs
    - Register Your Servers: Add your MCP servers to the directory
    - API Access: Create API keys for programmatic access
    - Analytics Dashboard: Monitor usage and server health
    
    Get started: ${dashboardUrl}
    
    Need help? Check out our documentation at ${process.env.NEXTAUTH_URL}/docs or join our Discord community.
  `

  return sendEmail({
    to: email,
    subject: 'Welcome to MCPLookup.org! 🎉',
    html,
    text,
  })
}
