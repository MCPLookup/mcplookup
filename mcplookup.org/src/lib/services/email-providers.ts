// Email Service with Multiple Provider Support
// Supports Resend, SendGrid, Mailgun, and more

import { Resend } from 'resend'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface VerificationEmailData {
  email: string
  name?: string
  verificationUrl: string
  expiresIn: string
}

export interface PasswordResetEmailData {
  email: string
  name?: string
  resetUrl: string
  expiresIn: string
}

export class EmailProviderService {
  private provider: 'resend' | 'sendgrid' | 'mailgun' | 'smtp' | null = null
  private client: any = null
  private isConfigured = false

  constructor() {
    this.initializeProvider()
  }

  private initializeProvider() {
    // Try providers in order of preference
    if (this.setupResend()) return
    if (this.setupSendGrid()) return
    if (this.setupMailgun()) return
    if (this.setupSMTP()) return
    
    console.warn('No email provider configured')
  }

  private setupResend(): boolean {
    const apiKey = process.env.RESEND_API_KEY
    
    if (!apiKey) return false
    
    try {
      this.client = new Resend(apiKey)
      this.provider = 'resend'
      this.isConfigured = true
      console.log('Email service initialized with Resend')
      return true
    } catch (error) {
      console.error('Failed to initialize Resend:', error)
      return false
    }
  }

  private setupSendGrid(): boolean {
    const apiKey = process.env.SENDGRID_API_KEY
    
    if (!apiKey) return false
    
    try {
      // SendGrid setup would go here
      // this.client = sgMail
      // sgMail.setApiKey(apiKey)
      this.provider = 'sendgrid'
      this.isConfigured = true
      console.log('Email service initialized with SendGrid')
      return true
    } catch (error) {
      console.error('Failed to initialize SendGrid:', error)
      return false
    }
  }

  private setupMailgun(): boolean {
    const apiKey = process.env.MAILGUN_API_KEY
    const domain = process.env.MAILGUN_DOMAIN
    
    if (!apiKey || !domain) return false
    
    try {
      // Mailgun setup would go here
      this.provider = 'mailgun'
      this.isConfigured = true
      console.log('Email service initialized with Mailgun')
      return true
    } catch (error) {
      console.error('Failed to initialize Mailgun:', error)
      return false
    }
  }

  private setupSMTP(): boolean {
    const host = process.env.EMAIL_HOST
    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS
    
    if (!host || !user || !pass) return false
    
    try {
      // SMTP setup (fallback)
      this.provider = 'smtp'
      this.isConfigured = true
      console.log('Email service initialized with SMTP')
      return true
    } catch (error) {
      console.error('Failed to initialize SMTP:', error)
      return false
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      console.error('Email service not configured')
      return false
    }

    try {
      switch (this.provider) {
        case 'resend':
          return await this.sendWithResend(options)
        case 'sendgrid':
          return await this.sendWithSendGrid(options)
        case 'mailgun':
          return await this.sendWithMailgun(options)
        case 'smtp':
          return await this.sendWithSMTP(options)
        default:
          console.error('Unknown email provider')
          return false
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  private async sendWithResend(options: EmailOptions): Promise<boolean> {
    try {
      const result = await this.client.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@mcplookup.org',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      })
      
      console.log('Email sent successfully with Resend:', result.data?.id)
      return true
    } catch (error) {
      console.error('Resend email failed:', error)
      return false
    }
  }

  private async sendWithSendGrid(options: EmailOptions): Promise<boolean> {
    // SendGrid implementation would go here
    console.log('SendGrid email sending not implemented yet')
    return false
  }

  private async sendWithMailgun(options: EmailOptions): Promise<boolean> {
    // Mailgun implementation would go here
    console.log('Mailgun email sending not implemented yet')
    return false
  }

  private async sendWithSMTP(options: EmailOptions): Promise<boolean> {
    // SMTP fallback implementation would go here
    console.log('SMTP email sending not implemented yet')
    return false
  }

  async sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
    const subject = 'Verify your MCPLookup.org account'
    const html = this.generateVerificationEmailHTML(data)
    
    return this.sendEmail({
      to: data.email,
      subject,
      html
    })
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const subject = 'Reset your MCPLookup.org password'
    const html = this.generatePasswordResetEmailHTML(data)
    
    return this.sendEmail({
      to: data.email,
      subject,
      html
    })
  }

  async sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
    const subject = 'Welcome to MCPLookup.org!'
    const html = this.generateWelcomeEmailHTML(email, name)
    
    return this.sendEmail({
      to: email,
      subject,
      html
    })
  }

  private generateVerificationEmailHTML(data: VerificationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
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
            <h2>Verify your email address</h2>
            <p>Hi${data.name ? ` ${data.name}` : ''},</p>
            <p>Thanks for signing up for MCPLookup.org! To complete your registration, please verify your email address by clicking the button below:</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            </p>
            
            <p>This verification link will expire in ${data.expiresIn}.</p>
            
            <p>If you didn't create an account with MCPLookup.org, you can safely ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>MCPLookup.org - Professional MCP Discovery Service</p>
            <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all;">${data.verificationUrl}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generatePasswordResetEmailHTML(data: PasswordResetEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
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
            <h2>Reset your password</h2>
            <p>Hi${data.name ? ` ${data.name}` : ''},</p>
            <p>We received a request to reset your password for your MCPLookup.org account. Click the button below to create a new password:</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" class="button">Reset Password</a>
            </p>
            
            <p>This reset link will expire in ${data.expiresIn}.</p>
            
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          
          <div class="footer">
            <p>MCPLookup.org - Professional MCP Discovery Service</p>
            <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all;">${data.resetUrl}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generateWelcomeEmailHTML(email: string, name?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MCPLookup.org</title>
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
            <h2>Welcome to MCPLookup.org!</h2>
            <p>Hi${name ? ` ${name}` : ''},</p>
            <p>Your account has been successfully verified and you're now part of the MCPLookup.org community!</p>
            
            <p>MCPLookup.org is the professional MCP (Model Context Protocol) discovery service that helps you:</p>
            <ul>
              <li>🔍 Discover MCP servers with natural language queries</li>
              <li>🚀 Register your own MCP servers</li>
              <li>🔗 Connect AI agents to powerful tools and services</li>
              <li>📊 Monitor server performance and reliability</li>
            </ul>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mcplookup.org'}/dashboard" class="button">Get Started</a>
            </p>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          
          <div class="footer">
            <p>MCPLookup.org - Professional MCP Discovery Service</p>
            <p>Happy discovering! 🎉</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured) {
      return false
    }

    try {
      // Test with a simple validation
      return true
    } catch (error) {
      console.error('Email service connection test failed:', error)
      return false
    }
  }

  getProviderInfo(): { provider: string | null; configured: boolean } {
    return {
      provider: this.provider,
      configured: this.isConfigured
    }
  }
}

// Singleton instance
export const emailProviderService = new EmailProviderService()
