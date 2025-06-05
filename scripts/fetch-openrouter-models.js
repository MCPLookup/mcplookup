#!/usr/bin/env node

// Script to fetch and analyze OpenRouter models
// Usage: OPENROUTER_API_KEY=your_key node scripts/fetch-openrouter-models.js

async function fetchOpenRouterModels() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENROUTER_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    console.log('🔍 Fetching models from OpenRouter...');
    
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from OpenRouter API');
    }

    console.log(`📊 Found ${data.data.length} total models`);
    
    // Filter for chat models
    const chatModels = data.data.filter(model => 
      !model.id.includes('vision') && 
      !model.id.includes('whisper') &&
      !model.id.includes('dall-e') &&
      !model.id.includes('tts') &&
      model.context_length > 0
    );
    
    // Find free models
    const freeModels = chatModels.filter(model => 
      (!model.pricing?.prompt || parseFloat(model.pricing.prompt) === 0) &&
      (!model.pricing?.completion || parseFloat(model.pricing.completion) === 0)
    );
    
    // Find very cheap models (under $0.001 per 1M tokens)
    const cheapModels = chatModels.filter(model => {
      const inputCost = parseFloat(model.pricing?.prompt || '0');
      const outputCost = parseFloat(model.pricing?.completion || '0');
      return inputCost > 0 && inputCost < 0.001 && outputCost < 0.001;
    });
    
    console.log(`💬 Chat models: ${chatModels.length}`);
    console.log(`🆓 Free models: ${freeModels.length}`);
    console.log(`💰 Very cheap models: ${cheapModels.length}`);
    
    // Show free models
    console.log('\n🆓 FREE MODELS:');
    freeModels.forEach(model => {
      console.log(`  ✅ ${model.id}`);
      console.log(`     Name: ${model.name || model.id}`);
      console.log(`     Context: ${model.context_length?.toLocaleString() || 'Unknown'}`);
      console.log('');
    });
    
    // Show very cheap models
    console.log('\n💰 VERY CHEAP MODELS (< $0.001/1M tokens):');
    cheapModels.slice(0, 10).forEach(model => {
      const inputCost = parseFloat(model.pricing?.prompt || '0');
      const outputCost = parseFloat(model.pricing?.completion || '0');
      console.log(`  💵 ${model.id}`);
      console.log(`     Name: ${model.name || model.id}`);
      console.log(`     Input: $${inputCost}/1M tokens`);
      console.log(`     Output: $${outputCost}/1M tokens`);
      console.log(`     Context: ${model.context_length?.toLocaleString() || 'Unknown'}`);
      console.log('');
    });
    
    // Show recommended models
    const recommendedModels = chatModels.filter(model => {
      const isFree = (!model.pricing?.prompt || parseFloat(model.pricing.prompt) === 0) &&
                     (!model.pricing?.completion || parseFloat(model.pricing.completion) === 0);
      const hasGoodContext = (model.context_length || 0) >= 8192;
      const isPopular = model.id.includes('llama') || model.id.includes('mistral') || 
                       model.id.includes('qwen') || model.id.includes('gemma') ||
                       model.id.includes('phi') || model.id.includes('deepseek');
      
      return (isFree || isPopular) && hasGoodContext;
    });
    
    console.log(`\n📈 RECOMMENDED MODELS (${recommendedModels.length} total):`);
    recommendedModels.slice(0, 15).forEach(model => {
      const inputCost = parseFloat(model.pricing?.prompt || '0');
      const outputCost = parseFloat(model.pricing?.completion || '0');
      const isFree = inputCost === 0 && outputCost === 0;
      
      console.log(`  ${isFree ? '🆓' : '💵'} ${model.id}`);
      console.log(`     Context: ${model.context_length?.toLocaleString()}`);
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

fetchOpenRouterModels();
