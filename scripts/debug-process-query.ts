#!/usr/bin/env tsx

// Debug the processQuery method to see what's happening
// Usage: TOGETHER_API_KEY=key tsx scripts/debug-process-query.ts

import { TogetherProvider } from '../src/lib/services/ai/TogetherProvider';

async function debugProcessQuery() {
  const apiKey = process.env.TOGETHER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ TOGETHER_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    console.log('🔍 Debugging processQuery method...');
    
    const provider = new TogetherProvider();
    const models = await provider.getModels();
    const freeModels = models.filter(m => m.isFree);
    const bestModel = freeModels.sort((a, b) => a.priority - b.priority)[0];
    
    console.log(`🏆 Using model: ${bestModel.id}`);
    
    // Test the full processQuery method
    const testQuery = "Find email servers like Gmail";
    console.log(`📝 Query: "${testQuery}"`);
    
    try {
      const response = await provider.processQuery(bestModel, testQuery, []);
      
      console.log('📋 Full processQuery response:');
      console.log(JSON.stringify(response, null, 2));
      
    } catch (error) {
      console.log('❌ processQuery failed:', error instanceof Error ? error.message : String(error));
      console.log('Stack:', error instanceof Error ? error.stack : "No stack trace available");
    }
    
  } catch (error) {
    console.error('❌ Error debugging processQuery:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

debugProcessQuery();
