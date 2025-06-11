#!/usr/bin/env node

/**
 * Redis Key Scanner for MCPLookup Project
 * Scans Redis keys to discover the formatted data structure
 */

const Redis = require('ioredis');

// Redis connection configuration
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
});

async function scanKeys() {
  try {
    console.log('🔍 Scanning Redis keys...\n');
    
    // Get database info
    const dbInfo = await redis.info('keyspace');
    console.log('📊 Database Info:');
    console.log(dbInfo);
    
    // Get total number of keys
    const totalKeys = await redis.dbsize();
    console.log(`\n📈 Total Keys: ${totalKeys.toLocaleString()}\n`);
    
    // Scan for key patterns
    const patterns = [
      'servers_enhanced_filtered:*',
      'mcp:*',
      'servers:*',
      'api_keys:*',
      'registry:*',
      'discovery:*',
      'users:*',
      'sessions:*',
      'test_collection:*'
    ];
    
    console.log('🔎 Scanning by patterns:\n');
    
    for (const pattern of patterns) {
      console.log(`\n--- Pattern: ${pattern} ---`);
      const keys = await redis.keys(pattern);
      console.log(`Found ${keys.length} keys`);
      
      if (keys.length > 0) {
        // Show first few keys
        const samplesToShow = Math.min(10, keys.length);
        console.log(`Sample keys (first ${samplesToShow}):`);
        for (let i = 0; i < samplesToShow; i++) {
          console.log(`  ${i + 1}. ${keys[i]}`);
        }
        
        if (keys.length > samplesToShow) {
          console.log(`  ... and ${keys.length - samplesToShow} more`);
        }
        
        // Analyze first key to understand structure
        const firstKey = keys[0];
        const keyType = await redis.type(firstKey);
        console.log(`\nType: ${keyType}`);
        
        if (keyType === 'hash') {
          const hashData = await redis.hgetall(firstKey);
          const fieldCount = Object.keys(hashData).length;
          console.log(`Hash fields: ${fieldCount}`);
          
          if (fieldCount > 0) {
            console.log('Sample fields:');
            const fields = Object.keys(hashData);
            const fieldsToShow = Math.min(5, fields.length);
            for (let i = 0; i < fieldsToShow; i++) {
              const field = fields[i];
              const value = hashData[field];
              const preview = value.length > 50 ? value.substring(0, 50) + '...' : value;
              console.log(`  ${field}: ${preview}`);
            }
          }
        } else if (keyType === 'string') {
          const value = await redis.get(firstKey);
          const preview = value.length > 100 ? value.substring(0, 100) + '...' : value;
          console.log(`Value: ${preview}`);
        } else if (keyType === 'set') {
          const members = await redis.smembers(firstKey);
          console.log(`Set members: ${members.length}`);
          if (members.length > 0) {
            console.log('Sample members:', members.slice(0, 5));
          }
        } else if (keyType === 'list') {
          const length = await redis.llen(firstKey);
          console.log(`List length: ${length}`);
          if (length > 0) {
            const samples = await redis.lrange(firstKey, 0, 4);
            console.log('Sample items:', samples);
          }
        }
      }
    }
    
    // Look for MCP Server data specifically
    console.log('\n\n🎯 Looking for MCP Server data...\n');
    
    const serverKeys = await redis.keys('servers_enhanced_filtered:*');
    if (serverKeys.length > 0) {
      console.log(`Found ${serverKeys.length} enhanced filtered server records!`);
      
      // Get a sample server
      const sampleServerKey = serverKeys[0];
      console.log(`\nAnalyzing sample server: ${sampleServerKey}`);
      
      const serverData = await redis.hgetall(sampleServerKey);
      console.log('\n📋 Server data structure:');
      
      const fields = Object.keys(serverData);
      fields.sort();
      
      for (const field of fields) {
        const value = serverData[field];
        const preview = value.length > 80 ? value.substring(0, 80) + '...' : value;
        console.log(`  ${field}: ${preview}`);
      }
      
      // Show a formatted server
      console.log('\n🎨 Formatted server example:');
      console.log(JSON.stringify({
        id: serverData._key || 'unknown',
        name: serverData.name || 'Unknown',
        description: serverData.description || 'No description',
        category: serverData['capabilities.category'] || 'other',
        quality_score: serverData['quality.score'] || 0,
        verification_status: serverData.verification_status || 'unverified',
        installation_methods: serverData['structured.installation.methods'] || '[]',
        repository_url: serverData['repository.url'] || serverData['_source_data.html_url'],
        stars: serverData['repository.stars'] || serverData['_source_data.stargazers_count'] || 0
      }, null, 2));
    }
    
    // Check for other collections
    console.log('\n\n🗂️ Other collection analysis...\n');
    
    const allKeys = await redis.keys('*');
    const keyPatterns = {};
    
    allKeys.forEach(key => {
      const parts = key.split(':');
      const pattern = parts[0];
      if (!keyPatterns[pattern]) {
        keyPatterns[pattern] = 0;
      }
      keyPatterns[pattern]++;
    });
    
    console.log('Key patterns summary:');
    Object.entries(keyPatterns)
      .sort(([,a], [,b]) => b - a)
      .forEach(([pattern, count]) => {
        console.log(`  ${pattern}: ${count} keys`);
      });
      
    console.log('\n✅ Redis scan complete!');
    
  } catch (error) {
    console.error('❌ Error scanning Redis:', error);
  } finally {
    await redis.quit();
  }
}

scanKeys();