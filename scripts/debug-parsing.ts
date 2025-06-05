#!/usr/bin/env tsx

// Debug the parsing step by step
// Usage: TOGETHER_API_KEY=key tsx scripts/debug-parsing.ts

import { TogetherProvider } from '../src/lib/services/ai/TogetherProvider';

async function debugParsing() {
  const apiKey = process.env.TOGETHER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ TOGETHER_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    console.log('🔍 Debugging parsing step by step...');
    
    const provider = new TogetherProvider();
    const models = await provider.getModels();
    const freeModels = models.filter(m => m.isFree);
    const bestModel = freeModels.sort((a, b) => a.priority - b.priority)[0];
    
    console.log(`🏆 Using model: ${bestModel.id}`);
    
    // Step 1: Get raw response
    const testQuery = "Find email servers like Gmail";
    console.log(`📝 Query: "${testQuery}"`);
    
    const response = await provider.callAPI(bestModel, {
      query: testQuery,
      maxTokens: 500,
      temperature: 0.1
    });
    
    console.log('📋 Raw response content:');
    console.log('---START---');
    console.log(response.content);
    console.log('---END---');
    
    // Step 2: Parse the response using the provider's method
    const analysis = (provider as any).parseResponse(response.content);
    
    console.log('🔍 Parsed analysis object:');
    console.log(JSON.stringify(analysis, null, 2));
    
    // Step 3: Check what gets extracted
    console.log('📊 Extracted capabilities:', analysis.capabilities || []);
    console.log('🔗 Similar to:', analysis.similar_to);
    console.log('⚙️ Constraints:', analysis.constraints || {});
    console.log('💭 Intent:', analysis.intent);
    console.log('🎯 Confidence:', analysis.confidence);
    
  } catch (error) {
    console.error('❌ Error debugging parsing:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

debugParsing();
