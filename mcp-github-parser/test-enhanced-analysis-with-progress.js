/**
 * Test script for the enhanced AI repository analysis WITH PROGRESS REPORTING
 */

import { GitHubClient } from './src/github-client.js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Skip the test entirely when no API keys are configured
if (!process.env.TOGETHER_API_KEY && !process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
  console.warn('⚠️  No AI API keys configured. Skipping enhanced analysis test.');
  process.exit(0);
}

async function testEnhancedAnalysisWithProgress() {
  console.log('🧪 Testing Enhanced MCP Repository Analysis WITH PROGRESS REPORTING');
  console.log('=================================================================');
  
  const client = new GitHubClient();
  
  try {
    // Test with a known MCP server repository using progress reporting
    console.log('\n📋 Testing with progress-enabled repository analysis...');
    
    const testRepo = 'redis/mcp-redis'; // Known MCP server
    console.log(`Analyzing: ${testRepo}`);    // Use the progress-enabled AsyncGenerator method
    const analysisGenerator = client.getFullRepositoryDataWithProgress(testRepo);
    let result = null;
    
    console.log('\n📊 ULTRA-SMOOTH PROGRESS TRACKING:');
    console.log('==================================');
    
    // Progress state tracking for smooth transitions
    let lastProgress = 0;
    let aiProgressTicker = null;
    let aiTickProgress = 70; // Start AI ticks at 70%
    let aiProcessingComplete = false;
    
    // Helper function to display smooth progress
    const showProgress = (progress, message, icon) => {
      if (progress > lastProgress || progress === 100) {
        lastProgress = progress;
        const barLength = 50;
        const filledLength = Math.round((progress / 100) * barLength);
        const progressBar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        console.log(`${icon} [${progressBar}] ${Math.round(progress)}% ${message}`);
      }
    };
    
    // Start AI progress ticker (70-80% every 5 seconds)
    const startAIProgressTicker = () => {
      if (aiProgressTicker) return; // Already started
      
      aiProgressTicker = setInterval(() => {
        if (aiProcessingComplete || aiTickProgress >= 80) {
          clearInterval(aiProgressTicker);
          return;
        }
        
        aiTickProgress += 2; // Increment by 2% every 5 seconds
        const messages = [
          'Analyzing code patterns and structure',
          'Understanding project dependencies',
          'Identifying installation workflows',
          'Extracting configuration details',
          'Processing documentation content'
        ];
        
        const messageIndex = Math.floor((aiTickProgress - 70) / 2) % messages.length;
        showProgress(aiTickProgress, messages[messageIndex], '🤖');
      }, 5000); // Every 5 seconds
    };
    
    // Stop AI progress ticker
    const stopAIProgressTicker = () => {
      if (aiProgressTicker) {
        clearInterval(aiProgressTicker);
        aiProgressTicker = null;
      }
      aiProcessingComplete = true;
    };
    
    // Manually iterate to capture both progress and final result
    while (true) {
      const iterResult = await analysisGenerator.next();
      
      if (iterResult.done) {
        // This is the final result
        result = iterResult.value;
        stopAIProgressTicker();
        showProgress(100, 'Analysis complete!', '🎉');
        break;
      } else {
        // This is a progress update - transform to smooth user-friendly progress
        const rawProgress = iterResult.value;
        
        // Map technical steps to user-friendly phases
        let smoothProgress = 0;
        let phaseMessage = '';
        let phaseIcon = '📊';
        
        if (rawProgress.step === 'fetching_repo') {
          // Phase 1: Gathering repository information (0-25%)
          const stepProgress = Math.min(100, rawProgress.progress);
          smoothProgress = Math.min(25, 5 + (stepProgress / 100) * 20);
          phaseMessage = 'Gathering repository information';
          phaseIcon = '🔍';
          showProgress(smoothProgress, phaseMessage, phaseIcon);
          
        } else if (rawProgress.step === 'downloading_files') {
          // Phase 2: Analyzing project structure (25-50%)
          const stepProgress = Math.min(100, rawProgress.progress);
          smoothProgress = 25 + (stepProgress / 100) * 25;
          phaseMessage = 'Analyzing project structure';
          phaseIcon = '📋';
          showProgress(smoothProgress, phaseMessage, phaseIcon);
          
        } else if (rawProgress.step === 'parsing_ai') {
          // Phase 3: Understanding installation methods (50-80%)
          if (rawProgress.stage === 'preparing') {
            showProgress(55, 'Understanding installation methods', '🤖');
            showProgress(60, 'Preparing AI analysis', '🤖');
          } else if (rawProgress.stage === 'calling_api') {
            showProgress(65, 'Connecting to AI analysis service', '🤖');
            showProgress(70, 'Beginning comprehensive analysis', '🤖');
            // Start the progress ticker for the long AI processing phase
            startAIProgressTicker();
          } else if (rawProgress.stage === 'parsing_response' || rawProgress.stage === 'validating') {
            // AI is still processing, ticker handles progress
            // Don't update manually here
          } else if (rawProgress.stage === 'complete') {
            stopAIProgressTicker();
            showProgress(80, 'AI analysis complete', '✅');
          }
          
        } else if (rawProgress.step === 'computing_metrics') {
          // Phase 4: Finalizing analysis (80-95%)
          showProgress(85, 'Computing final metrics', '✨');
          showProgress(90, 'Validating results', '✨');
          showProgress(95, 'Finalizing analysis', '✨');
          
        } else if (rawProgress.step === 'complete') {
          // Complete (100%)
          stopAIProgressTicker();
          showProgress(100, 'Analysis complete', '🎉');
          if (rawProgress.data) {
            console.log(`   📊 Found ${rawProgress.data.methodCount} installation methods`);
            console.log(`   ⏱️ Completed in ${Math.round(rawProgress.data.processingTimeMs / 1000)}s`);
          }
        }
        
        // Add a small delay for smooth visual effect
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Cleanup any remaining timers
    stopAIProgressTicker();
    
    console.log('\n✅ ANALYSIS RESULTS:');
    console.log('===================');
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
      result.installationMethods.slice(0, 5).forEach((method, index) => {
        console.log(`  ${index + 1}. ${method.title}`);
        console.log(`     Category: ${method.category}`);
        console.log(`     Platform: ${method.platform || 'Any'}`);
        console.log(`     Type: ${method.type}`);
        if (method.commands && method.commands.length > 0) {
          console.log(`     Commands: ${method.commands.length}`);
          console.log(`     First command: ${method.commands[0]}`);
        }
      });
      
      if (result.installationMethods.length > 5) {
        console.log(`   ... and ${result.installationMethods.length - 5} more methods`);
      }
    }
    
    console.log('\n🎉 Test completed successfully with PROGRESS REPORTING!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testEnhancedAnalysisWithProgress();
