#!/usr/bin/env node
// MCP HTTP Bridge CLI - JavaScript wrapper for TypeScript implementation

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if tsx is available
async function checkTsx() {
  return new Promise((resolve) => {
    const check = spawn('npx', ['tsx', '--version'], { stdio: 'pipe' });
    check.on('close', (code) => resolve(code === 0));
    check.on('error', () => resolve(false));
  });
}

// Show help if tsx is not available
function showHelp() {
  console.log(`
🌉 MCP Universal Bridge - Dynamic MCP Server Discovery & Tool Calling

USAGE:
  node scripts/mcp-bridge.mjs [OPTIONS] [ENDPOINT]

OPTIONS:
  -e, --endpoint URL     Direct HTTP MCP endpoint URL (optional - for legacy mode)
  -d, --domain DOMAIN    Discover server by domain (e.g., gmail.com)
  -c, --capability CAP   Discover server by capability (e.g., email)
  -a, --auth KEY:VALUE   Add authentication header
  -h, --help             Show this help message

EXAMPLES:
  # Universal bridge (recommended) - no specific endpoint needed
  node scripts/mcp-bridge.mjs

  # Legacy mode - connect to a specific endpoint
  node scripts/mcp-bridge.mjs https://api.example.com/mcp

  # Start with discovery hints (optional)
  node scripts/mcp-bridge.mjs --domain gmail.com
  node scripts/mcp-bridge.mjs --capability email

CLAUDE DESKTOP INTEGRATION:
  Add this single bridge to access ALL MCP servers:

  {
    "mcpServers": {
      "universal-mcp-bridge": {
        "command": "node",
        "args": ["scripts/mcp-bridge.mjs"]
      }
    }
  }

NOTE: To use the bridge, tsx must be installed:
  npm install -g tsx
  
Or install it locally:
  npm install tsx --save-dev
`);
}

async function main() {
  // Check for help flag first
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const tsxAvailable = await checkTsx();
  
  if (!tsxAvailable) {
    console.error('❌ tsx is not available');
    console.error('💡 Install tsx to use the bridge:');
    console.error('   npm install -g tsx');
    console.error('   OR');
    console.error('   npm install tsx --save-dev');
    console.error('');
    showHelp();
    process.exit(1);
  }

  // Run the TypeScript version via tsx
  const tsFile = join(__dirname, 'mcp-bridge.ts');
  const child = spawn('npx', ['tsx', tsFile, ...process.argv.slice(2)], {
    stdio: 'inherit'
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  child.on('error', (error) => {
    console.error('❌ Failed to start bridge:', error.message);
    process.exit(1);
  });
}

main().catch(console.error);
