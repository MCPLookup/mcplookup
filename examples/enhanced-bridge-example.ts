#!/usr/bin/env tsx
// Enhanced MCP Bridge Example
// Demonstrates how to use the new enhanced bridge with auto-generated tools

import { EnhancedMCPBridge, MCPHttpBridge } from '../src/lib/mcp/bridge';

/**
 * Example 1: Using the new EnhancedMCPBridge (recommended)
 */
async function exampleEnhancedBridge() {
  console.log('🚀 Example 1: Enhanced MCP Bridge with Auto-Generated Tools');
  console.log('=' .repeat(60));

  // Create enhanced bridge (no endpoint needed - includes all tools)
  const bridge = new EnhancedMCPBridge();

  // Show available tools
  const tools = bridge.getAvailableTools();
  console.log(`\n📊 Available Tools: ${tools.length}`);
  
  // Show tools by category
  const categories = new Set(tools.map(t => t.category));
  for (const category of categories) {
    const categoryTools = bridge.getToolsByCategory(category);
    console.log(`\n📂 ${category} (${categoryTools.length} tools):`);
    categoryTools.forEach(tool => {
      const metadata = bridge.getToolMetadata(tool);
      console.log(`  • ${tool} (${metadata?.source})`);
    });
  }

  // Check for specific tools
  console.log('\n🔍 Tool Availability Check:');
  const testTools = [
    'discover_servers_via_api',
    'register_server_via_api', 
    'check_server_health_via_api',
    'connect_and_list_tools',
    'bridge_status'
  ];

  testTools.forEach(tool => {
    const available = bridge.hasToolAvailable(tool);
    const metadata = bridge.getToolMetadata(tool);
    console.log(`  ${available ? '✅' : '❌'} ${tool} ${metadata ? `(${metadata.source})` : ''}`);
  });

  console.log('\n💡 To start the bridge: await bridge.run()');
  console.log('🔌 Connect via stdio to access all tools');
}

/**
 * Example 2: Using the original MCPHttpBridge (now enhanced)
 */
async function exampleOriginalBridge() {
  console.log('\n🌉 Example 2: Original Bridge (Now Enhanced)');
  console.log('=' .repeat(60));

  // Create bridge with specific endpoint
  const bridge = new MCPHttpBridge('https://mcplookup.org/api/mcp');

  console.log('📡 Target endpoint: https://mcplookup.org/api/mcp');
  console.log('🛠️ Includes both manual and auto-generated tools');
  console.log('💡 To start: await bridge.run()');
}

/**
 * Example 3: Tool Usage Scenarios
 */
async function exampleToolUsage() {
  console.log('\n🎯 Example 3: Tool Usage Scenarios');
  console.log('=' .repeat(60));

  console.log('\n📋 Common Usage Patterns:');
  
  console.log('\n1️⃣ Discovery Workflow:');
  console.log('   • Use "discover_servers_via_api" to find servers');
  console.log('   • Use "connect_and_list_tools" to explore capabilities');
  console.log('   • Use "call_tool_on_server" to execute tools');

  console.log('\n2️⃣ Registration Workflow:');
  console.log('   • Use "register_server_via_api" to register new server');
  console.log('   • Use "get_verify_via_api" to check verification status');
  console.log('   • Use "check_server_health_via_api" to monitor health');

  console.log('\n3️⃣ Management Workflow:');
  console.log('   • Use "get_my_servers_via_api" to list your servers');
  console.log('   • Use "put_servers_via_api" to update server details');
  console.log('   • Use "delete_servers_via_api" to remove servers');

  console.log('\n4️⃣ Bridge Status:');
  console.log('   • Use "bridge_status" to see all available tools');
  console.log('   • Shows tool categories and integration status');
  console.log('   • Displays sync information and capabilities');
}

/**
 * Example 4: Integration Benefits
 */
async function exampleIntegrationBenefits() {
  console.log('\n🎉 Example 4: Integration Benefits');
  console.log('=' .repeat(60));

  console.log('\n✅ What You Get:');
  console.log('  • 15 auto-generated REST API bridge tools');
  console.log('  • 6 manual bridge tools for MCP server interaction');
  console.log('  • Complete type safety end-to-end');
  console.log('  • Automatic sync with API changes');
  console.log('  • Categorized tool organization');
  console.log('  • Comprehensive error handling');

  console.log('\n🔄 Bidirectional Sync:');
  console.log('  • API changes automatically update bridge tools');
  console.log('  • OpenAPI spec stays in sync with actual code');
  console.log('  • No more manual schema maintenance');
  console.log('  • Single source of truth');

  console.log('\n🛠️ Tool Categories:');
  console.log('  • Discovery: Find and explore MCP servers');
  console.log('  • Registration: Register and verify servers');
  console.log('  • Health: Monitor server status');
  console.log('  • User Management: Manage your servers');
  console.log('  • Server Management: CRUD operations');
  console.log('  • Bridge: Connect to any MCP server');

  console.log('\n🚀 Next Steps:');
  console.log('  1. Use EnhancedMCPBridge for new projects');
  console.log('  2. Existing MCPHttpBridge automatically enhanced');
  console.log('  3. Run "npm run sync:complete" to regenerate tools');
  console.log('  4. Check "bridge_status" tool for latest capabilities');
}

/**
 * Main example runner
 */
async function main() {
  console.log('🎯 Enhanced MCP Bridge Examples');
  console.log('Generated from OpenAPI spec with bidirectional sync');
  console.log('=' .repeat(80));

  await exampleEnhancedBridge();
  await exampleOriginalBridge();
  await exampleToolUsage();
  await exampleIntegrationBenefits();

  console.log('\n🎉 Examples complete!');
  console.log('💡 Ready to use the enhanced bridge with auto-generated tools');
}

// Run examples if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  exampleEnhancedBridge,
  exampleOriginalBridge,
  exampleToolUsage,
  exampleIntegrationBenefits
};
