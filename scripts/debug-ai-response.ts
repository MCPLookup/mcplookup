#!/usr/bin/env tsx

// Debug AI response to see what's being returned
// Usage: TOGETHER_API_KEY=key OPENROUTER_API_KEY=key tsx scripts/debug-ai-response.ts

import { TogetherProvider } from '../src/lib/services/ai/TogetherProvider';
import { OpenRouterProvider } from '../src/lib/services/ai/OpenRouterProvider';

async function debugAIResponse() {
  const togetherKey = process.env.TOGETHER_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  
  if (!togetherKey && !openrouterKey) {
    console.error('❌ At least one API key is required');
    process.exit(1);
  }

  try {
    console.log('🔍 Debugging AI responses...');
    
    // Test Together AI first
    if (togetherKey) {
      console.log('\n🔧 Testing Together AI...');
      const together = new TogetherProvider();
      
      if (together.isAvailable()) {
        const models = await together.getModels();
        const freeModels = models.filter(m => m.isFree);
        
        if (freeModels.length > 0) {
          const bestModel = freeModels.sort((a, b) => a.priority - b.priority)[0];
          console.log(`🏆 Using model: ${bestModel.id}`);
          
          // Make a direct API call to see raw response
          const testQuery = "Find email servers like Gmail";
          console.log(`📝 Query: "${testQuery}"`);
          
          try {
            const response = await together.callAPI(bestModel, {
              query: testQuery,
              maxTokens: 500,
              temperature: 0.1
            });
            
            console.log('📋 Raw AI Response:');
            console.log('---START---');
            console.log(response.content);
            console.log('---END---');
            
            // Try to parse it
            try {
              const parsed = JSON.parse(response.content);
              console.log('✅ Successfully parsed as JSON:');
              console.log(JSON.stringify(parsed, null, 2));
            } catch (parseError) {
              console.log('❌ Failed to parse as JSON, trying manual parsing...');
              
              // Try to extract JSON from the response
              const jsonMatch = response.content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  const extracted = JSON.parse(jsonMatch[0]);
                  console.log('✅ Extracted JSON:');
                  console.log(JSON.stringify(extracted, null, 2));
                } catch (extractError) {
                  console.log('❌ Failed to extract JSON');
                }
              }
            }
            
          } catch (error) {
            console.log('❌ API call failed:', error instanceof Error ? error.message : String(error));
          }
        }
      }
    }
    
    // Test OpenRouter
    if (openrouterKey) {
      console.log('\n🌐 Testing OpenRouter...');
      const openrouter = new OpenRouterProvider();
      
      if (openrouter.isAvailable()) {
        const models = await openrouter.getModels();
        const freeModels = models.filter(m => m.isFree);
        
        if (freeModels.length > 0) {
          const bestModel = freeModels.sort((a, b) => a.priority - b.priority)[0];
          console.log(`🏆 Using model: ${bestModel.id}`);
          
          // Make a direct API call to see raw response
          const testQuery = "Find email servers like Gmail";
          console.log(`📝 Query: "${testQuery}"`);
          
          try {
            const response = await openrouter.callAPI(bestModel, {
              query: testQuery,
              maxTokens: 500,
              temperature: 0.1
            });
            
            console.log('📋 Raw AI Response:');
            console.log('---START---');
            console.log(response.content);
            console.log('---END---');
            
            // Try to parse it
            try {
              const parsed = JSON.parse(response.content);
              console.log('✅ Successfully parsed as JSON:');
              console.log(JSON.stringify(parsed, null, 2));
            } catch (parseError) {
              console.log('❌ Failed to parse as JSON, trying manual parsing...');
              
              // Try to extract JSON from the response
              const jsonMatch = response.content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  const extracted = JSON.parse(jsonMatch[0]);
                  console.log('✅ Extracted JSON:');
                  console.log(JSON.stringify(extracted, null, 2));
                } catch (extractError) {
                  console.log('❌ Failed to extract JSON');
                }
              }
            }
            
          } catch (error) {
            console.log('❌ API call failed:', error instanceof Error ? error.message : String(error));
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging AI response:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

debugAIResponse();
