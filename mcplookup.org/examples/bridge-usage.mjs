#!/usr/bin/env node
// MCP Bridge Usage Examples
// Demonstrates how to use the Universal MCP Bridge in different modes
// Including authentication setup for registration tools

console.log('🌉 Universal MCP Bridge - Usage Examples');
console.log('========================================\n');

console.log('1. 🔍 Universal Mode (Discover any server):');
console.log('   node scripts/mcp-bridge.mjs\n');

console.log('2. 🎯 Domain-Specific Mode:');
console.log('   node scripts/mcp-bridge.mjs --domain gmail.com');
console.log('   node scripts/mcp-bridge.mjs --domain github.com\n');

console.log('3. 🏷️ Capability-Based Mode:');
console.log('   node scripts/mcp-bridge.mjs --capability email');
console.log('   node scripts/mcp-bridge.mjs --capability code_repository\n');

console.log('4. 🔗 Direct Endpoint Mode:');
console.log('   node scripts/mcp-bridge.mjs --endpoint https://api.example.com/mcp\n');

console.log('5. 🔐 With Authentication (for registration tools):');
console.log('   # Set environment variables first:');
console.log('   export MCPLOOKUP_API_KEY="your_api_key"');
console.log('   export MCPLOOKUP_USER_ID="your_user_id"');
console.log('   node scripts/mcp-bridge.mjs\n');

console.log('6. 🔒 With Custom Auth Headers:');
console.log('   node scripts/mcp-bridge.mjs --endpoint https://api.example.com/mcp --auth-header "Authorization=Bearer token123"\n');

console.log('🔑 Authentication Setup:');
console.log('========================');
console.log('1. Go to: https://mcplookup.org/dashboard/api-keys');
console.log('2. Sign in with GitHub/Google or create account');
console.log('3. Generate new API key');
console.log('4. Copy USER_ID and API_KEY to environment variables\n');

console.log('📋 Claude Desktop Configuration:');
console.log('================================');
console.log(JSON.stringify({
  "mcpServers": {
    "universal-bridge": {
      "command": "node",
      "args": ["scripts/mcp-bridge.mjs"],
      "env": {
        "MCPLOOKUP_API_KEY": "your_api_key_here",
        "MCPLOOKUP_USER_ID": "your_user_id_here"
      }
    }
  }
}, null, 2));

console.log('\n🎯 Available Tools in Claude:');
console.log('Discovery Tools (No Auth Required):');
console.log('- discover_mcp_servers: Find servers using mcplookup.org');
console.log('- connect_and_list_tools: Explore any server\'s capabilities');
console.log('- call_tool_on_server: Call any tool on any server');
console.log('- read_resource_from_server: Read resources from any server');
console.log('- discover_and_call_tool: One-step workflow');
console.log('- bridge_status: Get bridge information');
console.log('- get_server_health: Get server health metrics');
console.log('- browse_capabilities: Explore capability taxonomy');
console.log('- get_discovery_stats: View usage statistics');
console.log('- list_mcp_tools: List all available tools\n');

console.log('Registration Tools (Auth Required):');
console.log('- register_mcp_server: Register your MCP server');
console.log('- verify_domain_ownership: Check domain verification status');

console.log('\n✨ Example Claude Commands:');
console.log('Discovery (works without auth):');
console.log('- "Find email servers"');
console.log('- "What document tools are available?"');
console.log('- "Send an email via Gmail"');
console.log('- "Create a GitHub issue"\n');

console.log('Registration (requires auth):');
console.log('- "Register my MCP server at mycompany.com"');
console.log('- "Check if my domain is verified"');
console.log('- "What\'s the health status of gmail.com MCP server?"');
