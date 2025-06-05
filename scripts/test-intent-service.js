#!/usr/bin/env node

// Test the intent service with improved models
// Usage: TOGETHER_API_KEY=your_key node scripts/test-intent-service.js

import { EnhancedIntentService } from '../src/lib/services/intent.js';

async function testIntentService() {
  const apiKey = process.env.TOGETHER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ TOGETHER_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    console.log('🧠 Testing Enhanced Intent Service...');
    
    const intentService = new EnhancedIntentService();
    
    const testQueries = [
      "Find email servers like Gmail",
      "I need calendar scheduling tools", 
      "Help me manage files and documents",
      "Find alternatives to Slack for team communication",
      "I want to automate my workflow with AI tools",
      "Need database servers for analytics"
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Testing intent: "${query}"`);
      
      try {
        const result = await intentService.processNaturalLanguageQuery(query);
        
        console.log(`✅ Intent processed successfully!`);
        console.log(`📊 Capabilities: ${result.capabilities.join(', ')}`);
        console.log(`🎯 Confidence: ${result.confidence}`);
        console.log(`💭 Intent: ${result.intent}`);
        
        if (result.similarTo) {
          console.log(`🔗 Similar to: ${result.similarTo}`);
        }
        
        if (result.constraints && Object.keys(result.constraints).length > 0) {
          console.log(`⚙️ Constraints: ${JSON.stringify(result.constraints)}`);
        }
        
      } catch (error) {
        console.log(`❌ Intent processing failed: ${error.message}`);
        
        // Test fallback to basic intent processing
        console.log('🔄 Testing fallback to basic intent processing...');
        const basicCapabilities = await intentService.intentToCapabilities(query);
        console.log(`📊 Basic capabilities: ${basicCapabilities.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing intent service:', error.message);
    process.exit(1);
  }
}

testIntentService();
