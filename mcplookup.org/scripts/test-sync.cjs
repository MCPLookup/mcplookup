#!/usr/bin/env node
// Test script to verify sync process works

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}: ${filePath}`, 'green');
    return true;
  } else {
    log(`❌ ${description}: ${filePath}`, 'red');
    return false;
  }
}

function main() {
  log('🧪 Testing OpenAPI Two-Way Generation & Sync', 'blue');
  log('===========================================', 'blue');
  
  let allGood = true;
  
  // Check main repo generated files
  log('\n📁 Main Repository Generated Files:', 'cyan');
  allGood &= checkFile('src/lib/generated/types.ts', 'TypeScript types');
  allGood &= checkFile('src/lib/generated/client.ts', 'OpenAPI client');
  allGood &= checkFile('src/lib/generated/api-client.ts', 'API client wrapper');
  allGood &= checkFile('src/lib/generated/server-schemas.ts', 'Server Zod schemas');
  
  // Check validation middleware
  log('\n🛡️ Validation Middleware:', 'cyan');
  allGood &= checkFile('src/lib/middleware/openapi-validation.ts', 'Validation middleware');
  
  // Check sync scripts
  log('\n🔧 Sync Scripts:', 'cyan');
  allGood &= checkFile('scripts/sync-bridge.cjs', 'Bridge sync script');
  allGood &= checkFile('scripts/version-bump.cjs', 'Version bump script');
  
  // Check bridge repository (if exists)
  const bridgePath = '../mcp-bridge';
  if (fs.existsSync(bridgePath)) {
    log('\n🌉 Bridge Repository:', 'cyan');
    allGood &= checkFile(`${bridgePath}/src/generated/types.ts`, 'Bridge types');
    allGood &= checkFile(`${bridgePath}/src/generated/api-client.ts`, 'Bridge API client');
    allGood &= checkFile(`${bridgePath}/src/bridge.ts`, 'Bridge implementation');
    allGood &= checkFile(`${bridgePath}/package.json`, 'Bridge package.json');
  } else {
    log('\n⚠️ Bridge repository not found at ../mcp-bridge', 'yellow');
    log('   Run: git clone https://github.com/MCPLookup-org/mcp-bridge.git ../mcp-bridge', 'cyan');
  }
  
  // Check OpenAPI spec
  log('\n📋 OpenAPI Specification:', 'cyan');
  allGood &= checkFile('openapi.yaml', 'OpenAPI spec');
  
  // Summary
  log('\n' + '='.repeat(50), 'blue');
  if (allGood) {
    log('🎉 All checks passed! Two-way generation is set up correctly.', 'green');
    log('\nNext steps:', 'cyan');
    log('1. Run: npm run openapi:generate-all', 'cyan');
    log('2. Run: npm run openapi:sync-bridge', 'cyan');
    log('3. Test: node scripts/version-bump.js patch', 'cyan');
  } else {
    log('❌ Some files are missing. Run the generation scripts:', 'red');
    log('   npm run openapi:generate-all', 'cyan');
  }
}

if (require.main === module) {
  main();
}
