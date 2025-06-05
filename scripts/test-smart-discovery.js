#!/usr/bin/env node

// Test the smart discovery endpoint with improved models
// Usage: node scripts/test-smart-discovery.js

async function testSmartDiscovery() {
  try {
    console.log('🧠 Testing smart discovery endpoint...');
    
    const testQueries = [
      "Find email servers like Gmail",
      "I need calendar scheduling tools",
      "Help me manage files and documents",
      "Find alternatives to Slack for team communication"
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      const response = await fetch('http://localhost:3000/api/v1/discover/smart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: query,
          context: {
            user_type: 'developer',
            max_results: 5
          }
        })
      });
      
      if (!response.ok) {
        console.log(`❌ Request failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log('Error details:', errorText);
        continue;
      }
      
      const result = await response.json();
      
      console.log(`✅ Query successful!`);
      console.log(`📊 Selected ${result.selectedSlugs?.length || 0} servers`);
      console.log(`🎯 Confidence: ${result.confidence}`);
      console.log(`⏱️ Processing time: ${result.metadata?.processing_time_ms}ms`);
      console.log(`🤖 AI Provider: ${result.metadata?.ai_provider}`);
      
      if (result.selectedSlugs?.length > 0) {
        console.log(`📋 Selected servers: ${result.selectedSlugs.join(', ')}`);
      }
      
      if (result.reasoning) {
        console.log(`💭 AI Reasoning: ${result.reasoning}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing smart discovery:', error.message);
  }
}

testSmartDiscovery();
