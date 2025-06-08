#!/usr/bin/env tsx

// Test different OpenRouter models to find the best working ones
// Usage: OPENROUTER_API_KEY=key tsx scripts/test-openrouter-models.ts

import { OpenRouterProvider } from '../src/lib/services/ai/OpenRouterProvider';

async function testOpenRouterModels() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENROUTER_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    console.log('🌐 Testing OpenRouter models...');
    
    const provider = new OpenRouterProvider();
    const models = await provider.getModels();
    const freeModels = models.filter(m => m.isFree);
    
    console.log(`📊 Found ${freeModels.length} free models`);
    
    // Test top 5 free models by priority
    const topModels = freeModels
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 5);
    
    console.log('\n🧪 Testing top 5 free models...');
    
    for (const model of topModels) {
      console.log(`\n🔍 Testing: ${model.id}`);
      console.log(`   Context: ${model.metadata.contextWindow.toLocaleString()}`);
      console.log(`   Priority: ${model.priority.toFixed(1)}`);
      
      try {
        const response = await provider.callAPI(model, {
          query: "Find email servers like Gmail",
          maxTokens: 500,
          temperature: 0.1
        });
        
        console.log('📋 Response:');
        console.log('---START---');
        console.log(response.content);
        console.log('---END---');
        
        // Try to parse as JSON
        try {
          const parsed = JSON.parse(response.content);
          console.log('✅ Valid JSON response!');
          console.log(`📊 Capabilities: ${parsed.capabilities?.join(', ') || 'none'}`);
          console.log(`🎯 Confidence: ${parsed.confidence || 'none'}`);
        } catch (parseError) {
          console.log('❌ Not valid JSON');
        }
        
      } catch (error) {
        console.log(`❌ API call failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing OpenRouter models:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testOpenRouterModels();
