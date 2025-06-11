/**
 * Basic Usage Example
 * Demonstrates simple repository analysis without progress tracking
 */

import { GitHubClient, AIProvider } from '../src/index.js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function basicExample() {
  console.log('🚀 Basic MCP Repository Analysis Example\n');

  // Initialize client
  const client = new GitHubClient(process.env.GITHUB_TOKEN);
  client.setAIProvider(new AIProvider());

  try {
    // Analyze a single repository
    console.log('📋 Analyzing redis/mcp-redis...');
    const result = await client.getFullRepositoryData('redis/mcp-redis');

    // Display results
    console.log('\n✅ Analysis Results:');
    console.log(`Repository: ${result.repository.fullName}`);
    console.log(`Description: ${result.repository.description}`);
    console.log(`Stars: ${result.repository.stargazersCount}`);
    console.log(`Language: ${result.repository.language}`);
    
    console.log(`\n🤖 AI Analysis:`);
    console.log(`MCP Classification: ${result.computed.mcpClassification}`);
    console.log(`Confidence: ${result.computed.mcpConfidence}`);
    console.log(`Is MCP Server: ${result.computed.isMcpServer}`);
    console.log(`Maturity Level: ${result.computed.maturityLevel}`);
    console.log(`Complexity: ${result.computed.complexity}`);

    console.log(`\n📦 Installation Methods Found: ${result.installationMethods.length}`);
    if (result.installationMethods.length > 0) {
      result.installationMethods.slice(0, 3).forEach((method, index) => {
        console.log(`  ${index + 1}. ${method.title}`);
        console.log(`     Category: ${method.category}`);
        console.log(`     Platform: ${method.platform}`);
        if (method.commands.length > 0) {
          console.log(`     First command: ${method.commands[0]}`);
        }
      });
      
      if (result.installationMethods.length > 3) {
        console.log(`     ... and ${result.installationMethods.length - 3} more methods`);
      }
    }

    console.log('\n🎉 Basic example completed successfully!');

  } catch (error) {
    console.error('❌ Example failed:', error.message);
  }
}

// Run the example
basicExample();
