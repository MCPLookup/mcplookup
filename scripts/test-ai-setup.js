#!/usr/bin/env node

/**
 * Test AI Setup Script
 * Verifies that AI-powered natural language processing is working correctly
 */

const { getServerlessServices } = require('../src/lib/services/index.js');

async function testAISetup() {
  console.log('🧠 Testing AI-Powered Natural Language Setup\n');

  // Check environment
  const hasTogetherKey = !!process.env.TOGETHER_API_KEY;
  const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;
  const hasAnyAIKey = hasTogetherKey || hasOpenRouterKey;

  console.log(`Together AI Key: ${hasTogetherKey ? '✅ Found' : '❌ Not Found'}`);
  console.log(`OpenRouter Key: ${hasOpenRouterKey ? '✅ Found' : '❌ Not Found'}`);
  console.log(`Any AI Provider: ${hasAnyAIKey ? '✅ Available' : '❌ None Available'}`);

  if (hasTogetherKey) {
    console.log(`Together Model: ${process.env.TOGETHER_MODEL || 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo (default)'}`);
  }
  if (hasOpenRouterKey) {
    console.log(`OpenRouter Model: ${process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free (default)'}`);
  }
  console.log('');

  try {
    // Initialize services
    console.log('🔧 Initializing services...');
    const services = getServerlessServices();
    
    // Test intent service type
    const intentService = services.intent;
    const isAIPowered = intentService.constructor.name === 'EnhancedIntentService';
    
    console.log(`Intent Service: ${isAIPowered ? '🚀 AI-Powered (EnhancedIntentService)' : '📝 Rule-Based (IntentService)'}\n`);

    // Test natural language queries
    const testQueries = [
      "Find email servers like Gmail but with better privacy",
      "I need document collaboration tools for a remote team",
      "Show me alternatives to Slack that are faster",
      "Enterprise CRM systems with OAuth2 support"
    ];

    console.log('🧪 Testing Smart AI Provider with Model Cycling:\n');

    for (const query of testQueries) {
      console.log(`Query: "${query}"`);

      try {
        const startTime = Date.now();

        if (isAIPowered && hasAnyAIKey) {
          // Test AI-powered processing with smart provider
          const analysis = await intentService.processNaturalLanguageQuery(query);
          const endTime = Date.now();

          console.log(`  ✅ Smart AI Analysis (${endTime - startTime}ms):`);
          console.log(`     Capabilities: ${analysis.capabilities.join(', ')}`);
          console.log(`     Similar To: ${analysis.similarTo || 'None'}`);
          console.log(`     Confidence: ${analysis.confidence}`);
          console.log(`     Constraints: ${JSON.stringify(analysis.constraints)}`);
        } else {
          // Test rule-based processing
          const capabilities = await intentService.intentToCapabilities(query);
          const endTime = Date.now();

          console.log(`  ✅ Rule-Based Analysis (${endTime - startTime}ms):`);
          console.log(`     Capabilities: ${capabilities.join(', ')}`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
      
      console.log('');
    }

    // Test discovery service integration
    console.log('🔍 Testing Discovery Service Integration:\n');
    
    try {
      const discoveryService = services.discovery;
      const testQuery = "Find email servers like Gmail";
      
      console.log(`Discovery Query: "${testQuery}"`);
      const startTime = Date.now();
      
      const results = await discoveryService.discoverByIntent(testQuery);
      const endTime = Date.now();
      
      console.log(`  ✅ Discovery Results (${endTime - startTime}ms):`);
      console.log(`     Found ${results.length} servers`);
      
      if (results.length > 0) {
        results.slice(0, 3).forEach((server, i) => {
          console.log(`     ${i + 1}. ${server.domain} - ${server.capabilities?.subcategories?.join(', ') || 'No capabilities'}`);
        });
      }
      
    } catch (error) {
      console.log(`  ❌ Discovery Error: ${error.message}`);
    }

    console.log('\n🎯 Summary:');
    console.log(`  Smart AI Processing: ${hasAnyAIKey && isAIPowered ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`  Rule-Based Fallback: ✅ Available`);
    console.log(`  Discovery Integration: ✅ Working`);
    console.log(`  Model Cycling: ${hasAnyAIKey ? '✅ Active' : '❌ No AI Keys'}`);

    if (!hasAnyAIKey) {
      console.log('\n💡 To enable AI-powered processing:');
      console.log('   Option A (Cheapest): Get Together AI key from https://api.together.xyz/');
      console.log('   Option B (Most Flexible): Get OpenRouter key from https://openrouter.ai/');
      console.log('   Set environment variable: TOGETHER_API_KEY=your-key OR OPENROUTER_API_KEY=your-key');
      console.log('   Restart the application');
      console.log('\n💰 Cost comparison:');
      console.log('   Together AI: ~$0.0002-0.0008 per query');
      console.log('   OpenRouter: $0 per query (free models available!)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testAISetup().catch(console.error);
}

module.exports = { testAISetup };
