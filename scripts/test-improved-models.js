#!/usr/bin/env node

// Test the improved Together AI model selection
// Usage: TOGETHER_API_KEY=your_key node scripts/test-improved-models.js

import { TogetherProvider } from '../src/lib/services/ai/TogetherProvider.js';

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
    console.log(`📊 Found ${models.length} filtered models`);
    
    // Separate free and paid models
    const freeModels = models.filter(model => model.isFree);
    const paidModels = models.filter(model => !model.isFree);
    
    console.log(`🆓 Free models: ${freeModels.length}`);
    console.log(`💰 Paid models: ${paidModels.length}`);
    
    // Show free models sorted by priority
    console.log('\n🆓 FREE MODELS (sorted by priority):');
    freeModels
      .sort((a, b) => a.priority - b.priority)
      .forEach((model, index) => {
        console.log(`  ${index + 1}. ${model.id}`);
        console.log(`     Name: ${model.name}`);
        console.log(`     Context: ${model.metadata.contextWindow}`);
        console.log(`     Priority: ${model.priority}`);
        console.log('');
      });
    
    // Show top 5 paid models
    console.log('\n💰 TOP 5 PAID MODELS (sorted by priority):');
    paidModels
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 5)
      .forEach((model, index) => {
        console.log(`  ${index + 1}. ${model.id}`);
        console.log(`     Name: ${model.name}`);
        console.log(`     Context: ${model.metadata.contextWindow}`);
        console.log(`     Cost: $${model.estimatedCostPerQuery.toFixed(6)}/query`);
        console.log(`     Priority: ${model.priority}`);
        console.log('');
      });
    
    // Test a simple query with the best free model
    if (freeModels.length > 0) {
      const bestFreeModel = freeModels.sort((a, b) => a.priority - b.priority)[0];
      console.log(`🧪 Testing query with best free model: ${bestFreeModel.id}`);
      
      try {
        const response = await provider.processQuery(
          bestFreeModel, 
          "Find email servers like Gmail",
          []
        );
        
        console.log('✅ Query successful!');
        console.log(`📊 Capabilities found: ${response.capabilities.join(', ')}`);
        console.log(`🎯 Confidence: ${response.confidence}`);
        console.log(`💰 Cost: $${response.cost}`);
        console.log(`⏱️ Latency: ${response.latency}ms`);
        
      } catch (error) {
        console.log('❌ Query failed:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing models:', error.message);
    process.exit(1);
  }
}

testImprovedModels();
