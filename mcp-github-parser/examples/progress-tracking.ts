/**
 * Progress Tracking Example
 * Demonstrates real-time progress reporting during repository analysis
 */

import { GitHubClient, AIProvider } from '../src/index.js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function progressExample() {
  console.log('📊 Progress Tracking Example\n');

  const client = new GitHubClient(process.env.GITHUB_TOKEN);
  client.setAIProvider(new AIProvider());

  try {
    console.log('🔍 Analyzing modelcontextprotocol/servers with progress tracking...\n');

    // Use progress-enabled analysis
    const generator = client.getFullRepositoryDataWithProgress('modelcontextprotocol/servers');
    
    let result;
    
    // Track progress with custom display
    while (true) {
      const iterResult = await generator.next();
      
      if (iterResult.done) {
        result = iterResult.value;
        console.log('\n✅ Analysis complete!\n');
        break;
      } else {
        const progress = iterResult.value;
        
        // Create visual progress bar
        const barLength = 40;
        const filledLength = Math.round((progress.progress / 100) * barLength);
        const progressBar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        
        // Display progress with appropriate icon
        const icon = getProgressIcon(progress.step);
        console.log(`${icon} [${progressBar}] ${progress.progress}% - ${progress.message}`);
        
        // Show additional details for important steps
        if (progress.data) {
          if (progress.data.fileCount !== undefined) {
            console.log(`    📁 Files processed: ${progress.data.fileCount}`);
          }
          if (progress.data.methodCount !== undefined) {
            console.log(`    🛠️ Methods found: ${progress.data.methodCount}`);
          }
          if (progress.data.tokenCount !== undefined) {
            console.log(`    📊 AI tokens: ~${progress.data.tokenCount}`);
          }
        }
        
        // Add visual delay for better UX
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Display final results
    console.log('📊 Final Results:');
    console.log(`Repository: ${result.repository.fullName}`);
    console.log(`Classification: ${result.computed.mcpClassification}`);
    console.log(`Confidence: ${result.computed.mcpConfidence}`);
    console.log(`Installation Methods: ${result.installationMethods.length}`);
    console.log(`Analysis Time: ${Math.round(result.parsingMetadata.processingTimeMs / 1000)}s`);

    console.log('\n🎉 Progress example completed successfully!');

  } catch (error) {
    console.error('❌ Progress example failed:', error.message);
  }
}

function getProgressIcon(step: string): string {
  const icons = {
    'fetching_repo': '📡',
    'downloading_files': '📥',
    'parsing_ai': '🤖',
    'computing_metrics': '📊',
    'complete': '✅'
  };
  return icons[step] || '⚙️';
}

// Run the example
progressExample();
