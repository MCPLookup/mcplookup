/**
 * Test script for the enhanced AI repository analysis
 */

import { GitHubClient } from './src/github-client.js';

async function testEnhancedAnalysis() {
  console.log('🧪 Testing Enhanced MCP Repository Analysis');
  console.log('==========================================');
  
  const client = new GitHubClient();
  
  try {
    // Test with a known MCP server repository
    console.log('\n📋 Testing with a repository...');
    
    const testRepo = 'redis/mcp-redis'; // Known MCP server collection
    console.log(`Analyzing: ${testRepo}`);
    
    const result = await client.getFullRepositoryData(testRepo);
    
    console.log('\n✅ Analysis Results:');
    console.log('====================');
    console.log(`Repository: ${result.repository.fullName}`);
    console.log(`Description: ${result.repository.description}`);
    console.log(`MCP Classification: ${result.computed.mcpClassification}`);
    console.log(`Confidence: ${result.computed.mcpConfidence}`);
    console.log(`Is MCP Server: ${result.computed.isMcpServer}`);
    console.log(`Reasoning: ${result.computed.mcpReasoning}`);
    console.log(`Installation Methods Found: ${result.installationMethods.length}`);
    console.log(`Maturity Level: ${result.computed.maturityLevel}`);
    console.log(`Primary Language: ${result.computed.primaryLanguage}`);
    console.log(`Complexity: ${result.computed.complexity}`);
      if (result.installationMethods.length > 0) {
      console.log('\n📦 Installation Methods:');
      result.installationMethods.forEach((method, index) => {
        console.log(`  ${index + 1}. ${method.title}`);
        console.log(`     Category: ${method.category}`);
        console.log(`     Platform: ${method.platform || 'Any'}`);
        console.log(`     Type: ${method.type}`);
        if (method.commands && method.commands.length > 0) {
          console.log(`     Commands: ${method.commands.length}`);
          console.log(`     First command: ${method.commands[0]}`);
        }
        if (method.description) {
          console.log(`     Description: ${method.description.substring(0, 100)}${method.description.length > 100 ? '...' : ''}`);
        }
      });
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testEnhancedAnalysis();
