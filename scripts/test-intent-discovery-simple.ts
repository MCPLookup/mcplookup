#!/usr/bin/env tsx

// Simple test of intent discovery with improved models
// Usage: TOGETHER_API_KEY=key OPENROUTER_API_KEY=key tsx scripts/test-intent-discovery-simple.ts

import { TogetherProvider } from '../src/lib/services/ai/TogetherProvider';
import { OpenRouterProvider } from '../src/lib/services/ai/OpenRouterProvider';

async function testIntentDiscovery() {
  const togetherKey = process.env.TOGETHER_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  
  if (!togetherKey && !openrouterKey) {
    console.error('❌ At least one API key is required');
    process.exit(1);
  }

  try {
    console.log('🧠 Testing intent discovery with improved models...');
    
    const providers = [];
    
    if (togetherKey) {
      const together = new TogetherProvider();
      if (together.isAvailable()) {
        providers.push({ name: 'Together AI', provider: together });
      }
    }
    
    if (openrouterKey) {
      const openrouter = new OpenRouterProvider();
      if (openrouter.isAvailable()) {
        providers.push({ name: 'OpenRouter', provider: openrouter });
      }
    }
    
    console.log(`🔑 Available providers: ${providers.map(p => p.name).join(', ')}`);
    
    // Test each provider
    for (const { name, provider } of providers) {
      console.log(`\n🔍 Testing ${name}...`);
      
      try {
        const models = await provider.getModels();
        const freeModels = models.filter(m => m.isFree);
        
        console.log(`📊 ${name} models: ${models.length} total, ${freeModels.length} free`);
        
        if (freeModels.length > 0) {
          // Get the best free model
          const bestModel = freeModels.sort((a, b) => a.priority - b.priority)[0];
          console.log(`🏆 Best free model: ${bestModel.id}`);
          console.log(`   Context: ${bestModel.metadata.contextWindow.toLocaleString()}`);
          console.log(`   Priority: ${bestModel.priority.toFixed(1)}`);
          
          // Test a simple intent query
          console.log(`🧪 Testing intent query...`);
          
          const testQuery = "Find email servers like Gmail";
          const response = await provider.processQuery(bestModel, testQuery, []);
          
          console.log(`✅ ${name} query successful!`);
          console.log(`📊 Capabilities: ${response.capabilities.join(', ')}`);
          console.log(`🎯 Confidence: ${response.confidence}`);
          console.log(`💰 Cost: $${response.cost}`);
          console.log(`⏱️ Latency: ${response.latency}ms`);
          
        } else {
          console.log(`❌ No free models available in ${name}`);
        }
        
      } catch (error) {
        console.log(`❌ ${name} failed: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Intent discovery testing complete!');
    
  } catch (error) {
    console.error('❌ Error testing intent discovery:', error.message);
    process.exit(1);
  }
}

testIntentDiscovery();
