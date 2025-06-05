#!/usr/bin/env node

// Script to fetch and analyze Together AI models
// Usage: TOGETHER_API_KEY=your_key node scripts/fetch-together-models.js

async function fetchTogetherModels() {
  const apiKey = process.env.TOGETHER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ TOGETHER_API_KEY environment variable is required');
    console.log('Usage: TOGETHER_API_KEY=your_key node scripts/fetch-together-models.js');
    process.exit(1);
  }

  try {
    console.log('🔍 Fetching models from Together AI...');
    
    const response = await fetch('https://api.together.xyz/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Together API error: ${response.status} ${response.statusText}`);
    }

    const models = await response.json();

    if (!Array.isArray(models)) {
      console.log('❌ Expected array, got:', typeof models);
      throw new Error('Invalid response format from Together API');
    }

    console.log(`📊 Found ${models.length} total models`);

    // Analyze models
    const chatModels = models.filter(model => model.type === 'chat');
    const instructModels = chatModels.filter(model => model.id.includes('instruct'));

    // Find ALL free chat models (not just instruct)
    const allFreeChatModels = chatModels.filter(model =>
      (!model.pricing?.input || parseFloat(model.pricing.input) === 0) &&
      (!model.pricing?.output || parseFloat(model.pricing.output) === 0)
    );

    const freeModels = instructModels.filter(model =>
      (!model.pricing?.input || parseFloat(model.pricing.input) === 0) &&
      (!model.pricing?.output || parseFloat(model.pricing.output) === 0)
    );
    
    console.log(`💬 Chat models: ${chatModels.length}`);
    console.log(`🎓 Instruct models: ${instructModels.length}`);
    console.log(`🆓 Free instruct models: ${freeModels.length}`);
    console.log(`🆓 ALL free chat models: ${allFreeChatModels.length}`);
    
    // Show ALL free chat models
    console.log('\n🆓 ALL FREE CHAT MODELS:');
    allFreeChatModels.forEach(model => {
      console.log(`  ✅ ${model.id}`);
      console.log(`     Name: ${model.display_name || model.id}`);
      console.log(`     Context: ${model.context_length || 'Unknown'}`);
      console.log(`     Type: ${model.type}`);
      console.log('');
    });

    // Show free instruct models specifically
    console.log('\n🎓 FREE INSTRUCT MODELS:');
    freeModels.forEach(model => {
      console.log(`  ✅ ${model.id}`);
      console.log(`     Name: ${model.display_name || model.id}`);
      console.log(`     Context: ${model.context_length || 'Unknown'}`);
      console.log(`     Type: ${model.type}`);
      console.log('');
    });
    
    // Show cheap models (under $0.001 per 1M tokens)
    const cheapModels = instructModels.filter(model => {
      const inputCost = parseFloat(model.pricing?.input || '0');
      const outputCost = parseFloat(model.pricing?.output || '0');
      return inputCost > 0 && inputCost < 0.001 && outputCost < 0.001;
    });
    
    console.log('\n💰 CHEAP MODELS (< $0.001/1M tokens):');
    cheapModels.forEach(model => {
      const inputCost = parseFloat(model.pricing?.input || '0');
      const outputCost = parseFloat(model.pricing?.output || '0');
      console.log(`  💵 ${model.id}`);
      console.log(`     Input: $${inputCost}/1M tokens`);
      console.log(`     Output: $${outputCost}/1M tokens`);
      console.log(`     Context: ${model.context_length || 'Unknown'}`);
      console.log('');
    });
    
    // Generate improved filter for TogetherProvider.ts
    console.log('\n🔧 SUGGESTED FILTER IMPROVEMENTS:');
    console.log('Current filter only includes models with "instruct" in the name.');
    console.log('Consider these additional criteria:');
    
    const goodModels = instructModels.filter(model => {
      const hasGoodContext = (model.context_length || 0) >= 8192;
      const isRecent = model.id.includes('2024') || model.id.includes('3.1') || model.id.includes('3.2');
      const isPopular = model.id.includes('llama') || model.id.includes('mistral') || model.id.includes('qwen');
      return hasGoodContext && (isRecent || isPopular);
    });
    
    console.log(`\n📈 RECOMMENDED MODELS (${goodModels.length} total):`);
    goodModels.forEach(model => {
      const inputCost = parseFloat(model.pricing?.input || '0');
      const outputCost = parseFloat(model.pricing?.output || '0');
      const isFree = inputCost === 0 && outputCost === 0;
      
      console.log(`  ${isFree ? '🆓' : '💵'} ${model.id}`);
      console.log(`     Context: ${model.context_length}`);
      if (!isFree) {
        console.log(`     Cost: $${inputCost}/$${outputCost} per 1M tokens`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error fetching models:', error.message);
    process.exit(1);
  }
}

fetchTogetherModels();
