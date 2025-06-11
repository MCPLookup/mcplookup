/**
 * Batch Analysis Example
 * Demonstrates searching and analyzing multiple repositories
 */

import { GitHubClient, AIProvider } from '../src/index.js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function batchAnalysisExample() {
  console.log('🔄 Batch Analysis Example\n');

  const client = new GitHubClient(process.env.GITHUB_TOKEN);
  client.setAIProvider(new AIProvider());

  try {
    // Search and analyze multiple repositories
    console.log('🔍 Searching for "mcp server python" and analyzing top 3 results...\n');

    const generator = client.searchAndParseWithProgress('mcp server python', 3);
    const results = [];
    
    // Track overall progress
    let totalProgress = 0;
    let currentRepo = '';
    
    for await (const progress of generator) {
      // Update progress display
      if (progress.currentRepo && progress.currentRepo !== currentRepo) {
        currentRepo = progress.currentRepo;
        console.log(`\n📋 Now analyzing: ${currentRepo}`);
      }
      
      // Show simple progress for batch operations
      if (progress.progress > totalProgress) {
        totalProgress = progress.progress;
        const barLength = 30;
        const filledLength = Math.round((totalProgress / 100) * barLength);
        const progressBar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        
        console.log(`📊 [${progressBar}] ${totalProgress}% - ${progress.message}`);
      }
      
      // Collect results (this will be the final array when complete)
      if (progress.step === 'complete' && Array.isArray(progress.data)) {
        results.push(...progress.data);
      }
    }

    console.log('\n✅ Batch analysis complete!\n');

    // Display summary of all analyzed repositories
    console.log('📊 Analysis Summary:');
    console.log('===================');
    
    if (results.length === 0) {
      console.log('No repositories were successfully analyzed.');
      return;
    }

    results.forEach((repo, index) => {
      console.log(`\n${index + 1}. ${repo.repository.fullName}`);
      console.log(`   ⭐ Stars: ${repo.repository.stargazersCount}`);
      console.log(`   🏷️ Language: ${repo.repository.language || 'Unknown'}`);
      console.log(`   🤖 Classification: ${repo.computed.mcpClassification}`);
      console.log(`   📊 Confidence: ${repo.computed.mcpConfidence}`);
      console.log(`   📦 Installation Methods: ${repo.installationMethods.length}`);
      
      if (repo.installationMethods.length > 0) {
        console.log(`   🔧 Top Method: ${repo.installationMethods[0].title}`);
      }
    });

    // Show statistics
    const mcpServers = results.filter(r => r.computed.mcpClassification === 'mcp_server');
    const totalMethods = results.reduce((sum, r) => sum + r.installationMethods.length, 0);
    const avgConfidence = results.reduce((sum, r) => sum + r.computed.mcpConfidence, 0) / results.length;

    console.log('\n📈 Statistics:');
    console.log(`   Total repositories analyzed: ${results.length}`);
    console.log(`   Actual MCP servers: ${mcpServers.length}`);
    console.log(`   Total installation methods found: ${totalMethods}`);
    console.log(`   Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);

    console.log('\n🎉 Batch analysis example completed successfully!');

  } catch (error) {
    console.error('❌ Batch analysis example failed:', error.message);
  }
}

// Run the example
batchAnalysisExample();
