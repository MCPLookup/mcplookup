# Examples & Tutorials

This guide provides comprehensive examples for using the MCP GitHub Parser in various scenarios.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Advanced Analysis](#advanced-analysis)
- [Progress Reporting](#progress-reporting)
- [Custom AI Providers](#custom-ai-providers)
- [Web Integration](#web-integration)
- [Batch Processing](#batch-processing)
- [Error Handling](#error-handling)

## Basic Usage

### Simple Repository Analysis

```typescript
import { GitHubClient } from 'mcp-github-parser';

async function analyzeRepository() {
  const client = new GitHubClient(process.env.GITHUB_TOKEN);
  
  try {
    const result = await client.getFullRepositoryData('redis/mcp-redis');
    
    console.log('Repository Analysis Results:');
    console.log('==========================');
    console.log(`Name: ${result.repository.fullName}`);
    console.log(`Description: ${result.repository.description}`);
    console.log(`Stars: ${result.repository.stars}`);
    console.log(`Language: ${result.repository.language}`);
    console.log(`MCP Classification: ${result.computed.mcpClassification}`);
    console.log(`Confidence: ${result.computed.mcpConfidence}`);
    console.log(`Installation Methods: ${result.installationMethods.length}`);
    
  } catch (error) {
    console.error('Analysis failed:', error.message);
  }
}

analyzeRepository();
```

### Search and Analyze Multiple Repositories

```typescript
import { GitHubClient } from 'mcp-github-parser';

async function searchAndAnalyze() {
  const client = new GitHubClient();
  
  const queries = [
    'mcp server python',
    'claude mcp',
    'model context protocol'
  ];
  
  for (const query of queries) {
    console.log(`\n🔍 Searching for: "${query}"`);
    console.log('='.repeat(50));
    
    const results = await client.searchAndParse(query, 3);
    
    results.forEach((repo, index) => {
      console.log(`\n${index + 1}. ${repo.repository.fullName}`);
      console.log(`   Classification: ${repo.computed.mcpClassification}`);
      console.log(`   Confidence: ${repo.computed.mcpConfidence}`);
      console.log(`   Methods: ${repo.installationMethods.length}`);
      console.log(`   Maturity: ${repo.computed.maturityLevel}`);
    });
  }
}

searchAndAnalyze();
```

## Advanced Analysis

### Detailed Installation Method Analysis

```typescript
import { GitHubClient, InstallationMethod } from 'mcp-github-parser';

async function analyzeInstallationMethods() {
  const client = new GitHubClient();
  const result = await client.getFullRepositoryData('anthropics/mcp-weather');
  
  console.log(`Found ${result.installationMethods.length} installation methods:\n`);
  
  // Group methods by type
  const methodsByType = result.installationMethods.reduce((acc, method) => {
    if (!acc[method.type]) acc[method.type] = [];
    acc[method.type].push(method);
    return acc;
  }, {} as Record<string, InstallationMethod[]>);
  
  // Display each type
  Object.entries(methodsByType).forEach(([type, methods]) => {
    console.log(`📋 ${type.toUpperCase()} (${methods.length} methods)`);
    console.log('-'.repeat(40));
    
    methods.forEach((method, index) => {
      console.log(`  ${index + 1}. ${method.title}`);
      console.log(`     Platform: ${method.platform || 'Any'}`);
      console.log(`     Category: ${method.category}`);
      
      if (method.commands && method.commands.length > 0) {
        console.log(`     Commands:`);
        method.commands.slice(0, 3).forEach(cmd => {
          console.log(`       $ ${cmd}`);
        });
        if (method.commands.length > 3) {
          console.log(`       ... and ${method.commands.length - 3} more`);
        }
      }
      
      if (method.mcp_config) {
        console.log(`     MCP Config:`);
        console.log(`       Server: ${method.mcp_config.server_name}`);
        console.log(`       Command: ${method.mcp_config.command}`);
      }
      
      console.log();
    });
  });
}

analyzeInstallationMethods();
```

### MCP Classification Analysis

```typescript
import { GitHubClient } from 'mcp-github-parser';

async function classificationAnalysis() {
  const client = new GitHubClient();
  
  const testRepos = [
    'redis/mcp-redis',           // Expected: mcp_server
    'anthropics/mcp-weather',    // Expected: mcp_server
    'modelcontextprotocol/servers', // Expected: mcp_awesome_list
    'anthropics/mcp-sdk-python'  // Expected: mcp_framework
  ];
  
  console.log('MCP Classification Analysis');
  console.log('===========================\n');
  
  for (const repo of testRepos) {
    try {
      const result = await client.getFullRepositoryData(repo);
      
      console.log(`Repository: ${repo}`);
      console.log(`Classification: ${result.computed.mcpClassification}`);
      console.log(`Confidence: ${(result.computed.mcpConfidence * 100).toFixed(1)}%`);
      console.log(`Reasoning: ${result.computed.mcpReasoning}`);
      console.log(`Is MCP Server: ${result.computed.isMcpServer ? '✅' : '❌'}`);
      console.log('-'.repeat(50));
      
    } catch (error) {
      console.log(`❌ Failed to analyze ${repo}: ${error.message}`);
    }
  }
}

classificationAnalysis();
```

## Progress Reporting

### Basic Progress Tracking

```typescript
import { GitHubClient } from 'mcp-github-parser';

async function basicProgressTracking() {
  const client = new GitHubClient();
  
  console.log('🚀 Starting repository analysis with progress tracking...\n');
  
  const generator = client.getFullRepositoryDataWithProgress('redis/mcp-redis');
  
  for await (const progress of generator) {
    const progressBar = '█'.repeat(Math.floor(progress.progress / 2)) + 
                       '░'.repeat(50 - Math.floor(progress.progress / 2));
    
    console.log(`[${progressBar}] ${progress.progress}% - ${progress.message}`);
  }
  
  console.log('\n✅ Analysis complete!');
}

basicProgressTracking();
```

### Advanced Progress with Custom UI

```typescript
import { GitHubClient, ProgressUpdate } from 'mcp-github-parser';

class ProgressTracker {
  private startTime: number = Date.now();
  private lastProgress: number = 0;
  
  displayProgress(progress: ProgressUpdate) {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const eta = progress.progress > 0 ? 
      (elapsed / progress.progress * 100) - elapsed : 0;
    
    // Clear previous line and display new progress
    process.stdout.write('\r\x1b[K');
    process.stdout.write(
      `🔄 ${progress.progress.toFixed(1)}% | ` +
      `⏱️ ${elapsed.toFixed(1)}s | ` +
      `📊 ETA: ${eta.toFixed(1)}s | ` +
      `${this.getPhaseIcon(progress.step)} ${progress.message}`
    );
    
    this.lastProgress = progress.progress;
  }
  
  private getPhaseIcon(step: string): string {
    const icons = {
      'fetching_repo': '🔍',
      'downloading_files': '📋',
      'parsing_ai': '🤖',
      'computing_metrics': '✨',
      'complete': '🎉'
    };
    return icons[step] || '📊';
  }
  
  complete() {
    const totalTime = (Date.now() - this.startTime) / 1000;
    console.log(`\n✅ Analysis completed in ${totalTime.toFixed(1)}s`);
  }
}

async function advancedProgressTracking() {
  const client = new GitHubClient();
  const tracker = new ProgressTracker();
  
  const generator = client.getFullRepositoryDataWithProgress('anthropics/mcp-weather');
  let result;
  
  try {
    for await (const progress of generator) {
      tracker.displayProgress(progress);
    }
    
    // Get final result
    const finalResult = await generator.next();
    if (finalResult.done) {
      result = finalResult.value;
    }
    
    tracker.complete();
    
    console.log(`\nResults: ${result.installationMethods.length} installation methods found`);
    
  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
  }
}

advancedProgressTracking();
```

## Custom AI Providers

### Creating a Custom AI Provider

```typescript
import { AIProvider } from 'mcp-github-parser';

class CustomOpenAIProvider extends AIProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }
  
  async parseWithSchema(prompt: string, schema: any): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing GitHub repositories for MCP servers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      })
    });
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
}

// Usage
async function useCustomProvider() {
  const client = new GitHubClient();
  const customProvider = new CustomOpenAIProvider(process.env.OPENAI_API_KEY);
  
  client.setAIProvider(customProvider);
  
  const result = await client.getFullRepositoryData('redis/mcp-redis');
  console.log('Analysis with custom provider:', result.computed.mcpClassification);
}

useCustomProvider();
```

## Web Integration

### Express.js Server-Sent Events

```typescript
import express from 'express';
import { GitHubClient } from 'mcp-github-parser';

const app = express();
const client = new GitHubClient();

app.get('/analyze/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const repoName = `${owner}/${repo}`;
  
  // Set up Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  try {
    const generator = client.getFullRepositoryDataWithProgress(repoName);
    
    for await (const progress of generator) {
      res.write(`data: ${JSON.stringify({
        type: 'progress',
        ...progress
      })}\n\n`);
    }
    
    // Get final result
    const finalResult = await generator.next();
    if (finalResult.done) {
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        result: finalResult.value
      })}\n\n`);
    }
    
  } catch (error) {
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: error.message
    })}\n\n`);
  } finally {
    res.end();
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### WebSocket Integration

```typescript
import WebSocket from 'ws';
import { GitHubClient } from 'mcp-github-parser';

const wss = new WebSocket.Server({ port: 8080 });
const client = new GitHubClient();

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    try {
      const { action, repo } = JSON.parse(message.toString());
      
      if (action === 'analyze') {
        const generator = client.getFullRepositoryDataWithProgress(repo);
        
        for await (const progress of generator) {
          ws.send(JSON.stringify({
            type: 'progress',
            ...progress
          }));
        }
        
        const finalResult = await generator.next();
        if (finalResult.done) {
          ws.send(JSON.stringify({
            type: 'complete',
            result: finalResult.value
          }));
        }
      }
      
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });
});

console.log('WebSocket server running on ws://localhost:8080');
```

## Batch Processing

### Analyze Multiple Repositories from File

```typescript
import fs from 'fs/promises';
import { GitHubClient } from 'mcp-github-parser';

async function batchAnalysis() {
  const client = new GitHubClient();
  
  // Read repository list from file
  const repoList = await fs.readFile('repositories.txt', 'utf-8');
  const repositories = repoList.split('\n').filter(line => line.trim());
  
  console.log(`📋 Analyzing ${repositories.length} repositories...\n`);
  
  const results = [];
  
  for (let i = 0; i < repositories.length; i++) {
    const repo = repositories[i].trim();
    console.log(`[${i + 1}/${repositories.length}] Analyzing ${repo}...`);
    
    try {
      const result = await client.getFullRepositoryData(repo);
      results.push({
        repository: repo,
        classification: result.computed.mcpClassification,
        confidence: result.computed.mcpConfidence,
        methods: result.installationMethods.length,
        success: true
      });
      
      console.log(`✅ ${repo}: ${result.computed.mcpClassification} (${result.installationMethods.length} methods)`);
      
    } catch (error) {
      results.push({
        repository: repo,
        error: error.message,
        success: false
      });
      
      console.log(`❌ ${repo}: ${error.message}`);
    }
    
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save results
  await fs.writeFile('analysis-results.json', JSON.stringify(results, null, 2));
  console.log('\n📊 Results saved to analysis-results.json');
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const mcpServers = results.filter(r => r.success && r.classification === 'mcp_server').length;
  
  console.log(`\n📈 Summary:`);
  console.log(`   Total analyzed: ${repositories.length}`);
  console.log(`   Successful: ${successful}`);
  console.log(`   MCP Servers found: ${mcpServers}`);
}

batchAnalysis();
```

## Error Handling

### Comprehensive Error Handling

```typescript
import { GitHubClient, GitHubAPIError, AIProviderError } from 'mcp-github-parser';

async function robustAnalysis(repoName: string) {
  const client = new GitHubClient();
  
  try {
    const result = await client.getFullRepositoryData(repoName);
    return result;
    
  } catch (error) {
    if (error instanceof GitHubAPIError) {
      console.error(`GitHub API Error (${error.status}):`, error.message);
      
      if (error.status === 404) {
        console.log('Repository not found or private');
      } else if (error.status === 403) {
        console.log('Rate limit exceeded or access denied');
      }
      
    } else if (error instanceof AIProviderError) {
      console.error(`AI Provider ${error.provider} failed:`, error.message);
      console.log('Falling back to basic analysis...');
      
      // Fallback to basic analysis without AI
      return await client.getRepositoryDetails(repoName);
      
    } else {
      console.error('Unexpected error:', error.message);
    }
    
    return null;
  }
}

// Usage with retry logic
async function analysisWithRetry(repoName: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Attempt ${attempt}/${maxRetries} for ${repoName}`);
    
    const result = await robustAnalysis(repoName);
    if (result) {
      return result;
    }
    
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error(`Failed to analyze ${repoName} after ${maxRetries} attempts`);
  return null;
}

analysisWithRetry('redis/mcp-redis');
```

These examples demonstrate the full capabilities of the MCP GitHub Parser and provide practical patterns for integration into your applications.
