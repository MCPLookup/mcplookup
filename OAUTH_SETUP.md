# OAuth Setup Guide for MCPLookup.org

This guide explains how to set up Google and GitHub OAuth authentication for MCPLookup.org.

## Overview

MCPLookup.org uses NextAuth.js v5 with OAuth providers for user authentication. Authentication is optional and only required for:

- Registering MCP servers (to verify ownership)
- Accessing user dashboard features
- Administrative functions

## GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: `MCPLookup.org`
   - **Homepage URL**: `https://mcplookup.org` (or your domain)
   - **Authorization callback URL**: `https://mcplookup.org/api/auth/callback/github`
4. Click "Register application"

### 2. Get Credentials

After creating the app:
1. Copy the **Client ID**
2. Generate a new **Client Secret**
3. Add these to your environment variables:

```bash
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
```

### 3. Development Setup

For local development, use:
- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API (or Google Identity API)

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - **App name**: `MCPLookup.org`
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users if needed

### 3. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Configure:
   - **Name**: `MCPLookup.org Web Client`
   - **Authorized JavaScript origins**: `https://mcplookup.org`
   - **Authorized redirect URIs**: `https://mcplookup.org/api/auth/callback/google`

### 4. Get Credentials

After creating the OAuth client:
1. Copy the **Client ID**
2. Copy the **Client Secret**
3. Add these to your environment variables:

```bash
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
```

### 5. Development Setup

For local development, add:
- **Authorized JavaScript origins**: `http://localhost:3000`
- **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`

## Environment Configuration

### Production (.env.production)

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://mcplookup.org
NEXTAUTH_SECRET=your-super-secret-key-here

# GitHub OAuth
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
```

### Development (.env.local)

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production

# GitHub OAuth
AUTH_GITHUB_ID=your_dev_github_client_id
AUTH_GITHUB_SECRET=your_dev_github_client_secret

# Google OAuth
AUTH_GOOGLE_ID=your_dev_google_client_id
AUTH_GOOGLE_SECRET=your_dev_google_client_secret
```

## Vercel Deployment

### Setting Environment Variables

```bash
# Set NextAuth variables
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production

# Set GitHub OAuth
vercel env add AUTH_GITHUB_ID production
vercel env add AUTH_GITHUB_SECRET production

# Set Google OAuth
vercel env add AUTH_GOOGLE_ID production
vercel env add AUTH_GOOGLE_SECRET production
```

### Domain Configuration

Make sure your OAuth apps are configured with your Vercel domain:
- **Production**: `https://your-app.vercel.app` or custom domain
- **Preview**: `https://your-app-git-branch.vercel.app`

## Testing Authentication

### 1. Local Testing

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/signin`
3. Test both GitHub and Google sign-in flows

### 2. Production Testing

1. Deploy to Vercel: `vercel --prod`
2. Navigate to your production domain `/auth/signin`
3. Verify both OAuth providers work correctly

## Security Considerations

### 1. Environment Variables

- Never commit OAuth secrets to version control
- Use different OAuth apps for development and production
- Rotate secrets regularly

### 2. Callback URLs

- Only add trusted domains to authorized redirect URIs
- Use HTTPS in production
- Validate callback URLs match your domain

### 3. Scopes

- Request minimal necessary scopes
- Current scopes: `email`, `profile`, `openid`
- Review and audit permissions regularly

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check callback URL matches exactly in OAuth app settings
   - Ensure protocol (http/https) matches

2. **"Client ID not found"**
   - Verify environment variables are set correctly
   - Check variable names match exactly

3. **"Access denied"**
   - Ensure OAuth consent screen is configured
   - Check if app is in testing mode (Google)

### Debug Mode

Enable NextAuth debug mode in development:

```bash
NEXTAUTH_DEBUG=true
```

This will log detailed authentication flow information.

## Support

For authentication issues:
- Check [NextAuth.js documentation](https://next-auth.js.org/)
- Review [GitHub OAuth docs](https://docs.github.com/en/developers/apps/building-oauth-apps)
- Review [Google OAuth docs](https://developers.google.com/identity/protocols/oauth2)
- Open an issue on [GitHub](https://github.com/TSavo/mcplookup.org/issues)
