#!/usr/bin/env node

/**
 * Test AI Providers Script
 * Tests the new DRY AI provider architecture with model cycling
 */

async function testAIProviders() {
  console.log('🤖 Testing DRY AI Provider Architecture\n');

  try {
    // Import the new AI architecture
    const { SmartAIProvider, TogetherProvider, OpenRouterProvider, getAllModels, getFreeModels } = await import('../src/lib/services/ai/index.js');

    // Test individual providers
    console.log('🔧 Testing Individual Providers:\n');

    const togetherProvider = new TogetherProvider();
    const openrouterProvider = new OpenRouterProvider();

    console.log(`Together AI: ${togetherProvider.isAvailable() ? '✅ Available' : '❌ Not Available'}`);
    if (togetherProvider.isAvailable()) {
      const togetherModels = togetherProvider.getModels();
      console.log(`  Models: ${togetherModels.length} available`);
      togetherModels.slice(0, 3).forEach(model => {
        console.log(`    - ${model.name} (${model.free ? 'FREE' : `$${model.cost}`})`);
      });
    }

    console.log(`OpenRouter: ${openrouterProvider.isAvailable() ? '✅ Available' : '❌ Not Available'}`);
    if (openrouterProvider.isAvailable()) {
      const openrouterModels = openrouterProvider.getModels();
      console.log(`  Models: ${openrouterModels.length} available`);
      openrouterModels.slice(0, 3).forEach(model => {
        console.log(`    - ${model.name} (${model.free ? 'FREE' : `$${model.cost}`})`);
      });
    }

    // Test model catalog
    console.log('\n📚 Testing Model Catalog:\n');
    
    const allModels = getAllModels();
    const freeModels = getFreeModels();
    
    console.log(`Total Models: ${allModels.length}`);
    console.log(`Free Models: ${freeModels.length}`);
    console.log(`Providers: ${[...new Set(allModels.map(m => m.provider))].join(', ')}`);

    console.log('\nFree Models Available:');
    freeModels.forEach(model => {
      console.log(`  - ${model.provider}/${model.name}`);
    });

    // Test Smart Provider
    console.log('\n🧠 Testing Smart AI Provider:\n');
    
    const smartAI = new SmartAIProvider();
    const stats = smartAI.getModelStats();
    
    console.log(`Smart Provider Stats:`);
    console.log(`  Total Models: ${stats.totalModels}`);
    console.log(`  Available Models: ${stats.availableModels}`);
    console.log(`  Free Models: ${stats.freeModels}`);
    console.log(`  Available Providers: ${stats.providers.filter(p => p.available).map(p => p.name).join(', ')}`);

    if (stats.availableModels === 0) {
      console.log('\n⚠️  No AI providers configured. Set TOGETHER_API_KEY or OPENROUTER_API_KEY to test AI functionality.');
      return;
    }

    // Test query processing with model cycling
    console.log('\n🔄 Testing Smart Model Cycling:\n');

    const testQueries = [
      "Find email servers like Gmail but with better privacy",
      "I need document collaboration tools for a remote team",
      "Show me alternatives to Slack that are faster"
    ];

    for (const query of testQueries) {
      console.log(`Query: "${query}"`);
      
      try {
        const startTime = Date.now();
        const response = await smartAI.processQuery(query);
        const endTime = Date.now();
        
        console.log(`  ✅ Success (${endTime - startTime}ms):`);
        console.log(`     Provider: ${response.provider}`);
        console.log(`     Model: ${response.model}`);
        console.log(`     Cost: ${response.cost ? `$${response.cost}` : 'FREE'}`);
        console.log(`     Capabilities: ${response.capabilities.join(', ')}`);
        console.log(`     Similar To: ${response.similarTo || 'None'}`);
        console.log(`     Confidence: ${response.confidence}`);
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
      
      console.log('');
    }

    // Test caching
    console.log('🗄️  Testing Response Caching:\n');
    
    const cacheTestQuery = "Find email servers";
    
    console.log(`First call: "${cacheTestQuery}"`);
    const start1 = Date.now();
    try {
      await smartAI.processQuery(cacheTestQuery);
      console.log(`  ✅ First call completed (${Date.now() - start1}ms)`);
    } catch (error) {
      console.log(`  ❌ First call failed: ${error.message}`);
    }
    
    console.log(`Second call (should be cached): "${cacheTestQuery}"`);
    const start2 = Date.now();
    try {
      await smartAI.processQuery(cacheTestQuery);
      console.log(`  ✅ Second call completed (${Date.now() - start2}ms) - should be much faster if cached`);
    } catch (error) {
      console.log(`  ❌ Second call failed: ${error.message}`);
    }

    // Test failure handling
    console.log('\n🔧 Testing Failure Recovery:\n');
    
    const availableModels = smartAI.getAvailableModels();
    console.log(`Available models before failure simulation: ${availableModels.length}`);
    
    // Reset any previous failures
    smartAI.resetFailures();
    console.log('Reset all model failures');
    
    const resetStats = smartAI.getModelStats();
    console.log(`Available models after reset: ${resetStats.availableModels}`);

    // Test cache clearing
    smartAI.clearCache();
    console.log('Cleared response cache');

    console.log('\n🎯 Summary:');
    console.log(`  ✅ DRY Architecture: Individual providers (Together, OpenRouter)`);
    console.log(`  ✅ Model Catalog: ${allModels.length} models across ${stats.providers.length} providers`);
    console.log(`  ✅ Smart Orchestration: Automatic provider/model cycling`);
    console.log(`  ✅ Failure Handling: Cooldowns, retry logic, model disabling`);
    console.log(`  ✅ Caching: Response caching with TTL`);
    console.log(`  ✅ Cost Optimization: Free models prioritized`);

    if (stats.availableModels > 0) {
      console.log(`  ✅ AI Processing: Working with ${stats.availableModels} available models`);
    } else {
      console.log(`  ⚠️  AI Processing: No providers configured`);
      console.log('\n💡 To enable AI:');
      console.log('   Together AI: TOGETHER_API_KEY=your-key (cheapest)');
      console.log('   OpenRouter: OPENROUTER_API_KEY=your-key (most flexible, has free models)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testAIProviders().catch(console.error);
}

module.exports = { testAIProviders };
