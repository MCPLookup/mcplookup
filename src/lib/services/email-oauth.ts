// Email Service with OAuth2 Support
// Alternative to App Passwords for Google Workspace

import nodemailer from 'nodemailer'

export interface EmailConfigOAuth {
  service: string
  auth: {
    type: string
    user: string
    clientId: string
    clientSecret: string
    refreshToken: string
    accessToken?: string
  }
}

export interface EmailConfigSMTP {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

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

export class EmailServiceOAuth {
  private transporter: nodemailer.Transporter | null = null
  private isConfigured = false

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    // Try OAuth2 first, then fall back to SMTP
    const oauthConfig = this.getOAuthConfig()
    const smtpConfig = this.getSMTPConfig()
    
    if (oauthConfig) {
      this.setupOAuthTransporter(oauthConfig)
    } else if (smtpConfig) {
      this.setupSMTPTransporter(smtpConfig)
    } else {
      console.warn('Email service not configured - no OAuth2 or SMTP credentials found')
    }
  }

  private getOAuthConfig(): EmailConfigOAuth | null {
    const user = process.env.EMAIL_USER
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

    if (!user || !clientId || !clientSecret || !refreshToken) {
      return null
    }

    return {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user,
        clientId,
        clientSecret,
        refreshToken
      }
    }
  }

  private getSMTPConfig(): EmailConfigSMTP | null {
    const host = process.env.EMAIL_HOST
    const port = process.env.EMAIL_PORT
    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS

    if (!host || !port || !user || !pass) {
      return null
    }

    return {
      host,
      port: parseInt(port),
      secure: port === '465',
      auth: {
        user,
        pass
      }
    }
  }

  private setupOAuthTransporter(config: EmailConfigOAuth) {
    try {
      this.transporter = nodemailer.createTransporter(config as any)
      this.isConfigured = true
      console.log('Email service initialized with OAuth2')
    } catch (error) {
      console.error('Failed to initialize OAuth2 email service:', error)
      this.isConfigured = false
    }
  }

  private setupSMTPTransporter(config: EmailConfigSMTP) {
    try {
      this.transporter = nodemailer.createTransporter(config)
      this.isConfigured = true
      console.log('Email service initialized with SMTP')
    } catch (error) {
      console.error('Failed to initialize SMTP email service:', error)
      this.isConfigured = false
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.error('Email service not configured')
      return false
    }

    try {
      const mailOptions = {
        from: `"MCPLookup.org" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html)
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
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

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      return false
    }

    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('Email service connection test failed:', error)
      return false
    }
  }
}

// Singleton instance
export const emailServiceOAuth = new EmailServiceOAuth()
