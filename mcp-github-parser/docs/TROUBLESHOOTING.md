# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the MCP GitHub Parser.

## Table of Contents

- [Common Issues](#common-issues)
- [GitHub API Issues](#github-api-issues)
- [AI Provider Issues](#ai-provider-issues)
- [Performance Issues](#performance-issues)
- [Installation Issues](#installation-issues)
- [Debug Mode](#debug-mode)
- [Getting Help](#getting-help)

## Common Issues

### "No AI providers available" Error

**Symptoms:**
```
Error: All AI providers failed: No providers configured
```

**Causes:**
- No AI provider API keys configured
- Invalid API keys
- Network connectivity issues

**Solutions:**

1. **Check environment variables:**
   ```bash
   echo $GEMINI_API_KEY
   echo $OPENROUTER_API_KEY
   echo $TOGETHER_API_KEY
   ```

2. **Verify at least one key is set:**
   ```bash
   # Set at least one AI provider key
   export GEMINI_API_KEY="your_gemini_key_here"
   ```

3. **Test API key validity:**
   ```bash
   # Test Gemini key
   curl -H "Content-Type: application/json" \
        -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GEMINI_API_KEY"
   ```

### "GitHub API rate limit exceeded" Error

**Symptoms:**
```
Error: GitHub API error: 403
X-RateLimit-Remaining: 0
```

**Solutions:**

1. **Add GitHub token:**
   ```bash
   export GITHUB_TOKEN="your_github_token_here"
   ```

2. **Increase delays between requests:**
   ```bash
   export GITHUB_API_DELAY=2000  # 2 second delay
   export MAX_CONCURRENT_REQUESTS=1
   ```

3. **Check rate limit status:**
   ```bash
   curl -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/rate_limit
   ```

### "Repository not found" Error

**Symptoms:**
```
Error: File 'README.md' not found in repository 'owner/repo'
GitHub API error: 404
```

**Causes:**
- Repository doesn't exist
- Repository is private (and you don't have access)
- Incorrect repository name format

**Solutions:**

1. **Verify repository exists:**
   ```bash
   curl https://api.github.com/repos/owner/repo
   ```

2. **Check repository name format:**
   ```typescript
   // Correct format
   await client.getFullRepositoryData('redis/mcp-redis');
   
   // Incorrect formats
   await client.getFullRepositoryData('redis/mcp-redis/');  // ❌ trailing slash
   await client.getFullRepositoryData('https://github.com/redis/mcp-redis'); // ❌ full URL
   ```

3. **For private repositories, ensure token has access:**
   ```bash
   # Token needs 'repo' scope for private repositories
   curl -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/repos/owner/private-repo
   ```

## GitHub API Issues

### Authentication Problems

**Issue:** `401 Unauthorized` errors

**Diagnosis:**
```bash
# Test token validity
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/user
```

**Solutions:**
1. Generate new GitHub token with correct scopes
2. Ensure token is not expired
3. Check token permissions

### Rate Limiting

**Issue:** `403 Forbidden` with rate limit headers

**Diagnosis:**
```bash
# Check current rate limit
curl -H "Authorization: token $GITHUB_TOKEN" \
     -I https://api.github.com/rate_limit
```

**Solutions:**
```typescript
// Implement custom rate limiting
const client = new GitHubClient(process.env.GITHUB_TOKEN, {
  githubApiDelay: 5000,        // 5 second delay
  maxConcurrentRequests: 1,    // Sequential requests
  enableCaching: true          // Cache responses
});
```

### Network Connectivity

**Issue:** Connection timeouts or network errors

**Diagnosis:**
```bash
# Test GitHub API connectivity
curl -I https://api.github.com
ping api.github.com
```

**Solutions:**
1. Check firewall settings
2. Configure proxy if needed:
   ```bash
   export HTTP_PROXY=http://proxy.company.com:8080
   export HTTPS_PROXY=http://proxy.company.com:8080
   ```

## AI Provider Issues

### Gemini API Issues

**Common Error:** `400 Bad Request` from Gemini

**Diagnosis:**
```typescript
import { GeminiJSONParser } from 'mcp-github-parser';

const parser = new GeminiJSONParser();
try {
  await parser.parseWithSchema('test prompt', { type: 'object' });
} catch (error) {
  console.error('Gemini error:', error.message);
}
```

**Solutions:**
1. **Schema compatibility issues:**
   ```typescript
   // Problematic schema for Gemini
   const badSchema = {
     type: "object",
     additionalProperties: false,  // ❌ Gemini doesn't support this
     properties: {
       items: {
         type: "array",
         items: { $ref: "#/definitions/item" }  // ❌ Complex refs
       }
     }
   };
   
   // Gemini-compatible schema
   const goodSchema = {
     type: "object",
     properties: {
       items: {
         type: "array",
         items: { type: "string" }  // ✅ Simple types
       }
     }
   };
   ```

2. **API key issues:**
   ```bash
   # Verify Gemini API key
   curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"
   ```

### OpenRouter Issues

**Common Error:** `401 Unauthorized` or `429 Too Many Requests`

**Solutions:**
1. **Check API key format:**
   ```bash
   # OpenRouter keys start with 'sk-or-v1-'
   echo $OPENROUTER_API_KEY | grep "^sk-or-v1-"
   ```

2. **Handle rate limits:**
   ```typescript
   const provider = new OpenRouterJSONParser({
     apiKey: process.env.OPENROUTER_API_KEY,
     timeout: 60000,      // Longer timeout
     retryDelay: 2000     // Delay between retries
   });
   ```

### Together.ai Issues

**Common Error:** Connection timeouts

**Solutions:**
1. **Increase timeout:**
   ```bash
   export AI_ANALYSIS_TIMEOUT=60000  # 60 seconds
   ```

2. **Use alternative models:**
   ```typescript
   const provider = new TogetherJSONParser({
     model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',  // Faster model
     maxTokens: 4096
   });
   ```

## Performance Issues

### Slow Analysis

**Symptoms:** Analysis takes several minutes per repository

**Diagnosis:**
```typescript
// Enable timing logs
process.env.LOG_LEVEL = 'debug';
process.env.ENABLE_DEBUG_LOGGING = 'true';

const startTime = Date.now();
const result = await client.getFullRepositoryData('owner/repo');
console.log(`Analysis took ${Date.now() - startTime}ms`);
```

**Solutions:**

1. **Reduce file downloads:**
   ```bash
   export MAX_FILES_TO_DOWNLOAD=5  # Download fewer files
   export MAX_FILE_SIZE=500KB      # Skip large files
   ```

2. **Optimize AI provider:**
   ```bash
   export GEMINI_API_KEY="your_key"  # Use fastest provider
   export ENABLE_FALLBACK_PROVIDERS=false  # Skip fallbacks
   ```

3. **Use caching:**
   ```bash
   export ENABLE_CACHING=true
   export CACHE_TTL=7200  # Cache for 2 hours
   ```

### Memory Issues

**Symptoms:** Out of memory errors or high memory usage

**Solutions:**

1. **Limit concurrent operations:**
   ```bash
   export MAX_CONCURRENT_REQUESTS=2
   ```

2. **Reduce file sizes:**
   ```bash
   export MAX_FILE_SIZE=1MB
   export SKIP_LARGE_FILES=true
   ```

3. **Clear cache periodically:**
   ```typescript
   // Clear cache programmatically
   import fs from 'fs/promises';
   await fs.rmdir('.mcp-parser-cache', { recursive: true });
   ```

## Installation Issues

### TypeScript Compilation Errors

**Issue:** `Cannot find module` or type errors

**Solutions:**
1. **Ensure TypeScript version compatibility:**
   ```bash
   npm install typescript@^5.0.0
   ```

2. **Check tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "moduleResolution": "node",
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true
     }
   }
   ```

### ES Module Issues

**Issue:** `require() of ES modules is not supported`

**Solutions:**
1. **Use ES module imports:**
   ```typescript
   // ✅ Correct
   import { GitHubClient } from 'mcp-github-parser';
   
   // ❌ Incorrect
   const { GitHubClient } = require('mcp-github-parser');
   ```

2. **Set package.json type:**
   ```json
   {
     "type": "module"
   }
   ```

### Dependency Issues

**Issue:** Missing dependencies or version conflicts

**Solutions:**
1. **Clean install:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check peer dependencies:**
   ```bash
   npm ls
   ```

## Debug Mode

### Enable Comprehensive Logging

```bash
# Enable all debug features
export LOG_LEVEL=debug
export ENABLE_DEBUG_LOGGING=true
export LOG_AI_REQUESTS=true
export LOG_GITHUB_REQUESTS=true
```

### Debug Script

```typescript
// debug-analysis.ts
import { GitHubClient } from 'mcp-github-parser';

async function debugAnalysis(repo: string) {
  console.log('🐛 Debug Analysis Starting');
  console.log('========================');
  
  // Environment check
  console.log('\n📋 Environment Variables:');
  console.log(`GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing'}`);
  
  // Client initialization
  console.log('\n🔧 Initializing Client...');
  const client = new GitHubClient();
  
  try {
    // Test GitHub API
    console.log('\n🔍 Testing GitHub API...');
    const repos = await client.search('test');
    console.log(`✅ GitHub API working (found ${repos.length} repos)`);
    
    // Test repository access
    console.log(`\n📂 Testing repository access: ${repo}`);
    const repoData = await client.downloadFile(repo, 'README.md');
    console.log(`✅ Repository accessible (README: ${repoData.length} chars)`);
    
    // Full analysis with timing
    console.log('\n🤖 Starting full analysis...');
    const startTime = Date.now();
    
    const generator = client.getFullRepositoryDataWithProgress(repo);
    for await (const progress of generator) {
      console.log(`   ${progress.progress}% - ${progress.message}`);
    }
    
    const result = await generator.next();
    const duration = Date.now() - startTime;
    
    if (result.done) {
      console.log(`\n✅ Analysis completed in ${duration}ms`);
      console.log(`   Classification: ${result.value.computed.mcpClassification}`);
      console.log(`   Methods found: ${result.value.installationMethods.length}`);
    }
    
  } catch (error) {
    console.error('\n❌ Debug analysis failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
  }
}

// Run debug analysis
debugAnalysis('redis/mcp-redis');
```

### Network Debugging

```bash
# Enable network request logging
export NODE_DEBUG=http,https,net

# Use verbose curl for API testing
curl -v -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/repos/redis/mcp-redis
```

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Enable debug mode and collect logs**
3. **Test with a known working repository (e.g., `redis/mcp-redis`)**
4. **Verify your environment configuration**

### Information to Include

When reporting issues, please include:

- **Environment details:**
  ```bash
  node --version
  npm --version
  echo $NODE_ENV
  ```

- **Configuration (without API keys):**
  ```bash
  env | grep -E "(GITHUB|GEMINI|OPENROUTER|TOGETHER)" | sed 's/=.*/=***/'
  ```

- **Error messages and stack traces**
- **Minimal reproduction case**
- **Debug logs (if possible)**

### Support Channels

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/your-username/mcp-github-parser/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/your-username/mcp-github-parser/discussions)
- **Documentation**: Check the [full documentation](../README.md)

### Quick Self-Help Checklist

- [ ] GitHub token is set and valid
- [ ] At least one AI provider key is configured
- [ ] Repository name is in correct format (`owner/repo`)
- [ ] Network connectivity to GitHub and AI providers
- [ ] Sufficient rate limits remaining
- [ ] TypeScript and Node.js versions are compatible
- [ ] Environment variables are properly loaded
