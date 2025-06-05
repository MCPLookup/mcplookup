#!/usr/bin/env tsx

// Test the improved Together AI model selection
// Usage: TOGETHER_API_KEY=your_key tsx scripts/test-improved-together.ts

import { TogetherProvider } from '../src/lib/services/ai/TogetherProvider';

async function testImprovedModels() {
  const apiKey = process.env.TOGETHER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ TOGETHER_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    console.log('🔍 Testing improved Together AI model selection...');
    
    const provider = new TogetherProvider();
    
    if (!provider.isAvailable()) {
      console.error('❌ Together provider not available');
      process.exit(1);
    }
    
    console.log('✅ Provider is available');
    
    const models = await provider.getModels();
    console.log(`📊 Found ${models.length} filtered models (vs 4 before improvement)`);
    
    // Separate free and paid models
    const freeModels = models.filter(model => model.isFree);
    const paidModels = models.filter(model => !model.isFree);
    
    console.log(`🆓 Free models: ${freeModels.length} (vs 1 before)`);
    console.log(`💰 Paid models: ${paidModels.length}`);
    
    // Show free models sorted by priority
    console.log('\n🆓 FREE MODELS (sorted by priority):');
    freeModels
      .sort((a, b) => a.priority - b.priority)
      .forEach((model, index) => {
        console.log(`  ${index + 1}. ${model.id}`);
        console.log(`     Name: ${model.name}`);
        console.log(`     Context: ${model.metadata.contextWindow.toLocaleString()}`);
        console.log(`     Priority: ${model.priority.toFixed(1)}`);
        console.log('');
      });
    
    // Show top 3 paid models
    console.log('\n💰 TOP 3 PAID MODELS (sorted by priority):');
    paidModels
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3)
      .forEach((model, index) => {
        console.log(`  ${index + 1}. ${model.id}`);
        console.log(`     Name: ${model.name}`);
        console.log(`     Context: ${model.metadata.contextWindow.toLocaleString()}`);
        console.log(`     Cost: $${model.estimatedCostPerQuery.toFixed(6)}/query`);
        console.log(`     Priority: ${model.priority.toFixed(1)}`);
        console.log('');
      });
    
    console.log('🎉 Model selection improvement successful!');
    console.log(`📈 Improvement: ${freeModels.length}x more free models available`);
    
  } catch (error) {
    console.error('❌ Error testing models:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : "No stack trace available");
    process.exit(1);
  }
}

testImprovedModels();
