#!/usr/bin/env tsx

// Test both Together AI and OpenRouter providers with improved model selection
// Usage: TOGETHER_API_KEY=key OPENROUTER_API_KEY=key tsx scripts/test-combined-providers.ts

import { SmartProvider } from '../src/lib/services/ai/SmartProvider';

async function testCombinedProviders() {
  const togetherKey = process.env.TOGETHER_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  
  if (!togetherKey && !openrouterKey) {
    console.error('❌ At least one API key is required (TOGETHER_API_KEY or OPENROUTER_API_KEY)');
    process.exit(1);
  }

  try {
    console.log('🧠 Testing combined AI providers...');
    console.log(`🔑 Together AI: ${togetherKey ? '✅' : '❌'}`);
    console.log(`🔑 OpenRouter: ${openrouterKey ? '✅' : '❌'}`);
    
    const smartProvider = new SmartProvider();
    
    // Get all available models
    const allModels = await smartProvider.getAllModels();
    console.log(`📊 Total models available: ${allModels.length}`);
    
    // Separate by provider and cost
    const togetherModels = allModels.filter(m => m.provider === 'together');
    const openrouterModels = allModels.filter(m => m.provider === 'openrouter');
    const freeModels = allModels.filter(m => m.isFree);
    const paidModels = allModels.filter(m => !m.isFree);
    
    console.log(`🔧 Together AI models: ${togetherModels.length}`);
    console.log(`🌐 OpenRouter models: ${openrouterModels.length}`);
    console.log(`🆓 Free models: ${freeModels.length}`);
    console.log(`💰 Paid models: ${paidModels.length}`);
    
    // Show top 10 free models by priority
    console.log('\n🏆 TOP 10 FREE MODELS (by priority):');
    freeModels
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 10)
      .forEach((model, index) => {
        console.log(`  ${index + 1}. ${model.provider}/${model.name}`);
        console.log(`     ID: ${model.id}`);
        console.log(`     Context: ${model.metadata.contextWindow.toLocaleString()}`);
        console.log(`     Priority: ${model.priority.toFixed(1)}`);
        console.log('');
      });
    
    // Test a query with the best model
    if (freeModels.length > 0) {
      const bestModel = freeModels.sort((a, b) => a.priority - b.priority)[0];
      console.log(`🧪 Testing query with best model: ${bestModel.provider}/${bestModel.name}`);
      
      try {
        const testQuery = "Find email servers like Gmail";
        const searchResults = [
          { slug: 'gmail.com', name: 'Gmail', description: 'Google email service' },
          { slug: 'outlook.com', name: 'Outlook', description: 'Microsoft email service' },
          { slug: 'protonmail.com', name: 'ProtonMail', description: 'Secure email service' }
        ];
        
        const result = await smartProvider.processQuery(testQuery, async () => searchResults);
        
        console.log('✅ Query successful!');
        console.log(`📊 Selected servers: ${result.selectedSlugs.join(', ')}`);
        console.log(`🎯 Confidence: ${result.confidence}`);
        console.log(`💭 Reasoning: ${result.reasoning}`);
        
      } catch (error) {
        console.log('❌ Query failed:', error.message);
      }
    }
    
    // Show provider statistics
    const stats = await smartProvider.getStats();
    console.log('\n📈 PROVIDER STATISTICS:');
    console.log(`Total models: ${stats.models.total}`);
    console.log(`Healthy models: ${stats.models.healthy}`);
    console.log(`Problematic models: ${stats.models.problematic}`);
    
    if (stats.models.problematicDetails.length > 0) {
      console.log('\n⚠️ Problematic models:');
      stats.models.problematicDetails.forEach(model => {
        console.log(`  - ${model.provider}/${model.name} (${model.failureCount} failures)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing providers:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testCombinedProviders();
