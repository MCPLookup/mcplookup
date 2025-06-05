#!/usr/bin/env node

// Find the top 5 highest-parameter free models across both providers
// Usage: TOGETHER_API_KEY=key OPENROUTER_API_KEY=key node scripts/find-top-5-models.js

async function findTop5Models() {
  const togetherKey = process.env.TOGETHER_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  
  if (!togetherKey && !openrouterKey) {
    console.error('❌ At least one API key is required');
    process.exit(1);
  }

  const allFreeModels = [];

  // Fetch Together AI models
  if (togetherKey) {
    try {
      console.log('🔍 Fetching Together AI models...');
      const response = await fetch('https://api.together.xyz/v1/models', {
        headers: {
          'Authorization': `Bearer ${togetherKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const models = await response.json();
      const chatModels = models.filter(model => model.type === 'chat');
      const freeModels = chatModels.filter(model => 
        (!model.pricing?.input || parseFloat(model.pricing.input) === 0) &&
        (!model.pricing?.output || parseFloat(model.pricing.output) === 0)
      );
      
      freeModels.forEach(model => {
        // Extract parameter count from model name
        const paramMatch = model.id.match(/(\d+)b/i);
        const paramCount = paramMatch ? parseInt(paramMatch[1]) : 0;
        
        allFreeModels.push({
          provider: 'Together AI',
          id: model.id,
          name: model.display_name || model.id,
          context: model.context_length || 0,
          parameters: paramCount,
          quality_score: paramCount * (model.context_length / 1000) // Composite score
        });
      });
      
      console.log(`✅ Found ${freeModels.length} free Together AI models`);
    } catch (error) {
      console.log('❌ Together AI fetch failed:', error.message);
    }
  }

  // Fetch OpenRouter models
  if (openrouterKey) {
    try {
      console.log('🔍 Fetching OpenRouter models...');
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      const chatModels = data.data.filter(model => 
        !model.id.includes('vision') && 
        !model.id.includes('whisper') &&
        !model.id.includes('dall-e') &&
        !model.id.includes('tts') &&
        model.context_length > 0
      );
      
      const freeModels = chatModels.filter(model => 
        (!model.pricing?.prompt || parseFloat(model.pricing.prompt) === 0) &&
        (!model.pricing?.completion || parseFloat(model.pricing.completion) === 0)
      );
      
      freeModels.forEach(model => {
        // Extract parameter count from model name
        const paramMatch = model.id.match(/(\d+)b/i);
        const paramCount = paramMatch ? parseInt(paramMatch[1]) : 0;
        
        allFreeModels.push({
          provider: 'OpenRouter',
          id: model.id,
          name: model.name || model.id,
          context: model.context_length || 0,
          parameters: paramCount,
          quality_score: paramCount * (model.context_length / 1000) // Composite score
        });
      });
      
      console.log(`✅ Found ${freeModels.length} free OpenRouter models`);
    } catch (error) {
      console.log('❌ OpenRouter fetch failed:', error.message);
    }
  }

  // Sort by quality score (parameters * context) and get top 5
  const top5Models = allFreeModels
    .filter(model => model.parameters > 0) // Only models with known parameter counts
    .sort((a, b) => b.quality_score - a.quality_score)
    .slice(0, 5);

  console.log('\n🏆 TOP 5 HIGHEST-PARAMETER FREE MODELS:');
  console.log('=====================================');
  
  top5Models.forEach((model, index) => {
    console.log(`${index + 1}. ${model.provider}: ${model.id}`);
    console.log(`   Name: ${model.name}`);
    console.log(`   Parameters: ${model.parameters}B`);
    console.log(`   Context: ${model.context.toLocaleString()}`);
    console.log(`   Quality Score: ${model.quality_score.toFixed(1)}`);
    console.log('');
  });

  // Generate whitelist for filtering
  console.log('🔧 RECOMMENDED WHITELIST:');
  console.log('========================');
  const whitelist = top5Models.map(model => model.id);
  console.log('const TOP_FREE_MODELS = [');
  whitelist.forEach(id => {
    console.log(`  '${id}',`);
  });
  console.log('];');
  
  console.log('\n📊 SUMMARY:');
  console.log(`Total free models found: ${allFreeModels.length}`);
  console.log(`Models with parameter info: ${allFreeModels.filter(m => m.parameters > 0).length}`);
  console.log(`Recommended top 5: ${top5Models.length}`);
  console.log(`Parameter range: ${top5Models[top5Models.length-1]?.parameters}B - ${top5Models[0]?.parameters}B`);
}

findTop5Models();
