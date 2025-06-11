# Configuration Guide

This guide covers all configuration options for the MCP GitHub Parser, including environment variables, API keys, and advanced settings.

## Table of Contents

- [Environment Variables](#environment-variables)
- [API Keys Setup](#api-keys-setup)
- [Advanced Configuration](#advanced-configuration)
- [Performance Tuning](#performance-tuning)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Environment Variables

### Required Variables

#### GitHub API Token

```bash
# Required for GitHub API access
GITHUB_TOKEN=your_github_personal_access_token_here
```

**How to get a GitHub token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `public_repo` (for public repositories)
4. Copy the token and add to your environment

### AI Provider Keys (At least one required)

```bash
# Google Gemini (Recommended - fastest and most accurate)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenRouter (Good fallback with multiple models)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Together.ai (Alternative provider)
TOGETHER_API_KEY=your_together_api_key_here
```

### Optional Configuration

```bash
# Analysis Settings
MAX_FILES_TO_DOWNLOAD=15
AI_ANALYSIS_TIMEOUT=30000
GITHUB_API_DELAY=1000
MAX_CONCURRENT_REQUESTS=3

# Logging
LOG_LEVEL=info
ENABLE_DEBUG_LOGGING=false
LOG_AI_REQUESTS=false

# Cache Settings
ENABLE_CACHING=true
CACHE_TTL=3600
CACHE_DIRECTORY=.cache

# Rate Limiting
GITHUB_RATE_LIMIT_BUFFER=100
AI_RATE_LIMIT_DELAY=1000
```

## API Keys Setup

### Google Gemini

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to environment:
   ```bash
   export GEMINI_API_KEY="your_key_here"
   ```

**Pricing:** Free tier available with generous limits

### OpenRouter

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Go to Keys section and create new key
3. Add to environment:
   ```bash
   export OPENROUTER_API_KEY="your_key_here"
   ```

**Pricing:** Pay-per-use, competitive rates

### Together.ai

1. Sign up at [Together.ai](https://together.ai/)
2. Navigate to API section
3. Generate API key
4. Add to environment:
   ```bash
   export TOGETHER_API_KEY="your_key_here"
   ```

**Pricing:** Credits-based system

## Advanced Configuration

### Environment File Setup

Create a `.env.local` file in your project root:

```bash
# .env.local
# GitHub Configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# AI Providers (in order of preference)
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TOGETHER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Performance Settings
MAX_FILES_TO_DOWNLOAD=20
AI_ANALYSIS_TIMEOUT=45000
GITHUB_API_DELAY=500
MAX_CONCURRENT_REQUESTS=5

# Feature Flags
ENABLE_PROGRESS_REPORTING=true
ENABLE_DETAILED_LOGGING=false
ENABLE_SCHEMA_VALIDATION=true
ENABLE_FALLBACK_PROVIDERS=true

# Cache Configuration
ENABLE_CACHING=true
CACHE_TTL=7200
CACHE_DIRECTORY=.mcp-parser-cache
CACHE_MAX_SIZE=100MB

# Analysis Behavior
SKIP_LARGE_FILES=true
MAX_FILE_SIZE=1MB
ANALYZE_BINARY_FILES=false
INCLUDE_ARCHIVED_REPOS=false
```

### Programmatic Configuration

```typescript
import { GitHubClient, AIProvider } from 'mcp-github-parser';

// Configure client with custom settings
const client = new GitHubClient(process.env.GITHUB_TOKEN, {
  maxFilesToDownload: 25,
  aiAnalysisTimeout: 60000,
  githubApiDelay: 200,
  maxConcurrentRequests: 10,
  enableCaching: true,
  cacheDirectory: './custom-cache',
  cacheTTL: 3600
});

// Configure AI provider with custom settings
const aiProvider = new AIProvider({
  preferredProvider: 'gemini',
  fallbackEnabled: true,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
});

client.setAIProvider(aiProvider);
```

### Custom Provider Configuration

```typescript
import { GeminiJSONParser, OpenRouterJSONParser } from 'mcp-github-parser';

// Custom Gemini configuration
const geminiProvider = new GeminiJSONParser({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-1.5-pro',
  temperature: 0.1,
  maxTokens: 8192,
  timeout: 30000
});

// Custom OpenRouter configuration
const openrouterProvider = new OpenRouterJSONParser({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: 'anthropic/claude-3-sonnet',
  temperature: 0.2,
  maxTokens: 4096,
  timeout: 45000
});
```

## Performance Tuning

### GitHub API Optimization

```bash
# Reduce API calls
MAX_FILES_TO_DOWNLOAD=10        # Download fewer files
GITHUB_API_DELAY=2000          # Longer delays between requests
MAX_CONCURRENT_REQUESTS=2       # Fewer concurrent requests

# For high-volume usage
GITHUB_API_DELAY=100           # Shorter delays (if you have high rate limits)
MAX_CONCURRENT_REQUESTS=10     # More concurrent requests
ENABLE_CACHING=true            # Cache API responses
CACHE_TTL=7200                 # Cache for 2 hours
```

### AI Provider Optimization

```bash
# Faster analysis
AI_ANALYSIS_TIMEOUT=15000      # Shorter timeout
ENABLE_FALLBACK_PROVIDERS=false # Skip fallbacks for speed

# More thorough analysis
AI_ANALYSIS_TIMEOUT=60000      # Longer timeout
ENABLE_FALLBACK_PROVIDERS=true # Use all providers
RETRY_FAILED_REQUESTS=true     # Retry on failures
```

### Memory Optimization

```bash
# Reduce memory usage
MAX_FILE_SIZE=500KB            # Smaller file size limit
SKIP_LARGE_FILES=true          # Skip large files
CACHE_MAX_SIZE=50MB            # Smaller cache
MAX_CONCURRENT_REQUESTS=2      # Fewer concurrent operations

# For high-memory environments
MAX_FILE_SIZE=5MB              # Larger files allowed
CACHE_MAX_SIZE=500MB           # Larger cache
MAX_CONCURRENT_REQUESTS=20     # More concurrent operations
```

## Security Considerations

### API Key Security

```bash
# Use environment-specific files
.env.local          # Local development
.env.staging        # Staging environment
.env.production     # Production environment

# Never commit API keys to version control
echo ".env*" >> .gitignore
```

### Access Control

```bash
# Limit GitHub token permissions
# Only grant necessary scopes:
# - public_repo (for public repositories)
# - repo (only if you need private repositories)

# Rotate API keys regularly
# Set expiration dates on GitHub tokens
# Monitor API key usage
```

### Network Security

```bash
# Use HTTPS only
FORCE_HTTPS=true

# Configure proxy if needed
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080

# Certificate validation
VERIFY_SSL_CERTIFICATES=true
```

## Configuration Validation

### Environment Validation Script

```typescript
// validate-config.ts
import { config } from 'dotenv';

config({ path: '.env.local' });

interface ConfigValidation {
  required: string[];
  optional: string[];
  deprecated: string[];
}

const validation: ConfigValidation = {
  required: ['GITHUB_TOKEN'],
  optional: [
    'GEMINI_API_KEY',
    'OPENROUTER_API_KEY', 
    'TOGETHER_API_KEY',
    'MAX_FILES_TO_DOWNLOAD',
    'AI_ANALYSIS_TIMEOUT'
  ],
  deprecated: [
    'OPENAI_API_KEY' // Use OPENROUTER_API_KEY instead
  ]
};

function validateConfiguration(): boolean {
  let isValid = true;
  
  // Check required variables
  console.log('🔍 Checking required environment variables...');
  validation.required.forEach(key => {
    if (!process.env[key]) {
      console.error(`❌ Missing required environment variable: ${key}`);
      isValid = false;
    } else {
      console.log(`✅ ${key} is set`);
    }
  });
  
  // Check AI provider keys
  const aiProviders = ['GEMINI_API_KEY', 'OPENROUTER_API_KEY', 'TOGETHER_API_KEY'];
  const availableProviders = aiProviders.filter(key => process.env[key]);
  
  if (availableProviders.length === 0) {
    console.warn('⚠️ No AI provider keys found. AI analysis will be disabled.');
  } else {
    console.log(`✅ Found ${availableProviders.length} AI provider(s): ${availableProviders.join(', ')}`);
  }
  
  // Check deprecated variables
  validation.deprecated.forEach(key => {
    if (process.env[key]) {
      console.warn(`⚠️ Deprecated environment variable: ${key}`);
    }
  });
  
  // Validate numeric values
  const numericVars = {
    'MAX_FILES_TO_DOWNLOAD': { min: 1, max: 50 },
    'AI_ANALYSIS_TIMEOUT': { min: 5000, max: 300000 },
    'GITHUB_API_DELAY': { min: 0, max: 10000 }
  };
  
  Object.entries(numericVars).forEach(([key, { min, max }]) => {
    const value = process.env[key];
    if (value) {
      const num = parseInt(value);
      if (isNaN(num) || num < min || num > max) {
        console.error(`❌ Invalid value for ${key}: ${value} (must be between ${min} and ${max})`);
        isValid = false;
      }
    }
  });
  
  return isValid;
}

if (require.main === module) {
  const isValid = validateConfiguration();
  process.exit(isValid ? 0 : 1);
}

export { validateConfiguration };
```

### Runtime Configuration Check

```typescript
import { GitHubClient, AIProvider } from 'mcp-github-parser';

async function checkConfiguration() {
  console.log('🔧 Checking MCP GitHub Parser configuration...\n');
  
  // Test GitHub API access
  try {
    const client = new GitHubClient();
    await client.search('test');
    console.log('✅ GitHub API access: OK');
  } catch (error) {
    console.error('❌ GitHub API access: FAILED');
    console.error('   Error:', error.message);
  }
  
  // Test AI providers
  const aiProvider = new AIProvider();
  const providerStatus = aiProvider.getProviderStatus();
  
  console.log('\n🤖 AI Provider Status:');
  Object.entries(providerStatus).forEach(([provider, available]) => {
    console.log(`   ${available ? '✅' : '❌'} ${provider}: ${available ? 'Available' : 'Not configured'}`);
  });
  
  // Test AI functionality
  if (Object.values(providerStatus).some(Boolean)) {
    try {
      const testSchema = { type: "object", properties: { test: { type: "string" } } };
      await aiProvider.parseWithSchema('Return {"test": "success"}', testSchema);
      console.log('✅ AI parsing: OK');
    } catch (error) {
      console.error('❌ AI parsing: FAILED');
      console.error('   Error:', error.message);
    }
  }
}

checkConfiguration();
```

## Troubleshooting

### Common Configuration Issues

#### GitHub Token Issues
```bash
# Test your GitHub token
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Check token scopes
curl -H "Authorization: token $GITHUB_TOKEN" -I https://api.github.com/user
# Look for X-OAuth-Scopes header
```

#### AI Provider Issues
```bash
# Test Gemini API
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GEMINI_API_KEY"

# Test OpenRouter API
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"anthropic/claude-3-haiku","messages":[{"role":"user","content":"Hello"}]}' \
     "https://openrouter.ai/api/v1/chat/completions"
```

#### Rate Limit Issues
```bash
# Check GitHub rate limit status
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit

# Increase delays if hitting limits
export GITHUB_API_DELAY=5000
export MAX_CONCURRENT_REQUESTS=1
```

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
export LOG_LEVEL=debug
export ENABLE_DEBUG_LOGGING=true
export LOG_AI_REQUESTS=true
```

This will provide detailed information about API calls, response times, and error details.
