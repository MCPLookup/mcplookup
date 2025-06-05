#!/usr/bin/env npx tsx
// MCP HTTP Bridge CLI
// Provides a stdio MCP server that proxies to HTTP streaming endpoints

import { MCPHttpBridge, MCPDiscoveryBridge } from '../src/lib/mcp/bridge.ts';

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    endpoint: null,
    domain: null,
    capability: null,
    authHeaders: {},
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--endpoint':
      case '-e':
        options.endpoint = args[++i];
        break;
      case '--domain':
      case '-d':
        options.domain = args[++i];
        break;
      case '--capability':
      case '-c':
        options.capability = args[++i];
        break;
      case '--auth':
      case '-a':
        const authPair = args[++i];
        if (authPair && authPair.includes(':')) {
          const [key, value] = authPair.split(':', 2);
          options.authHeaders[key] = value;
        }
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        if (!options.endpoint && !arg.startsWith('-')) {
          options.endpoint = arg;
        }
        break;
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
🌉 MCP Universal Bridge - Dynamic MCP Server Discovery & Tool Calling

USAGE:
  mcp-bridge [OPTIONS] [ENDPOINT]

OPTIONS:
  -e, --endpoint URL     Direct HTTP MCP endpoint URL (optional - for legacy mode)
  -d, --domain DOMAIN    Discover server by domain (e.g., gmail.com)
  -c, --capability CAP   Discover server by capability (e.g., email)
  -a, --auth KEY:VALUE   Add authentication header
  -h, --help             Show this help message

EXAMPLES:
  # Universal bridge (recommended) - no specific endpoint needed
  mcp-bridge

  # Legacy mode - connect to a specific endpoint
  mcp-bridge https://api.example.com/mcp

  # Start with discovery hints (optional)
  mcp-bridge --domain gmail.com
  mcp-bridge --capability email

UNIVERSAL BRIDGE TOOLS:
  The bridge provides these tools to dynamically work with any MCP server:

  🔍 DISCOVERY:
  • discover_mcp_servers     - Find MCP servers using mcplookup.org

  🔌 CONNECTION & EXPLORATION:
  • connect_and_list_tools   - Connect to any server and list its tools
  • call_tool_on_server      - Call any tool on any MCP server
  • read_resource_from_server - Read resources from any MCP server

  ⚡ WORKFLOWS:
  • discover_and_call_tool   - One-step: discover servers + call tool

  📊 STATUS:
  • bridge_status           - Get bridge capabilities and status

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

CLAUDE USAGE EXAMPLES:
  "Find email servers and list their tools"
  → discover_mcp_servers(capability="email")
  → connect_and_list_tools(endpoint="found_endpoint")

  "Send an email using Gmail"
  → discover_and_call_tool(domain="gmail.com", tool_name="send_email", arguments={...})

  "What document tools are available?"
  → discover_mcp_servers(query="document collaboration tools")
`);
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  try {
    let bridge;

    if (options.endpoint) {
      // Legacy mode - direct endpoint connection
      console.error(`🌉 Creating legacy bridge to: ${options.endpoint}`);
      bridge = new MCPHttpBridge(options.endpoint, options.authHeaders);

    } else if (options.domain) {
      // Domain-based discovery (legacy mode)
      console.error(`🔍 Discovering server for domain: ${options.domain}`);
      const discoveryBridge = new MCPDiscoveryBridge();
      bridge = await discoveryBridge.createBridgeForDomain(options.domain, options.authHeaders);

    } else if (options.capability) {
      // Capability-based discovery (legacy mode)
      console.error(`🔍 Discovering servers with capability: ${options.capability}`);
      const discoveryBridge = new MCPDiscoveryBridge();
      bridge = await discoveryBridge.createBridgeForCapability(options.capability, options.authHeaders);

    } else {
      // Universal mode - no specific endpoint, can discover and connect to any server
      console.error('🌉 Starting Universal MCP Bridge');
      console.error('🔍 Ready to discover and connect to any MCP server via mcplookup.org');
      bridge = new MCPHttpBridge('https://mcplookup.org/api/mcp', options.authHeaders);
    }

    // Start the bridge
    await bridge.run();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.error('\\n🔌 Shutting down bridge...');
      await bridge.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('\\n🔌 Shutting down bridge...');
      await bridge.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Bridge failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
