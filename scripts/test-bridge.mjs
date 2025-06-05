#!/usr/bin/env node
// Test script for MCP HTTP Bridge
// Tests the bridge functionality with various scenarios

import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * Test the bridge with a specific configuration
 */
async function testBridge(bridgeArgs, testName) {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log(`📋 Bridge args: ${bridgeArgs.join(' ')}`);
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      bridge.kill();
      reject(new Error('Test timeout'));
    }, 30000); // 30 second timeout

    // Start the bridge process
    const bridge = spawn('node', ['scripts/mcp-bridge.mjs', ...bridgeArgs], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let bridgeReady = false;
    let testClient;

    // Monitor bridge stderr for startup messages
    bridge.stderr.on('data', (data) => {
      const message = data.toString();
      console.log(`🌉 Bridge: ${message.trim()}`);
      
      if (message.includes('Bridge server started successfully') && !bridgeReady) {
        bridgeReady = true;
        // Start testing once bridge is ready
        setTimeout(async () => {
          try {
            await runBridgeTests(bridge);
            clearTimeout(timeout);
            bridge.kill();
            resolve(true);
          } catch (error) {
            clearTimeout(timeout);
            bridge.kill();
            reject(error);
          }
        }, 1000);
      }
    });

    bridge.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    bridge.on('exit', (code) => {
      clearTimeout(timeout);
      if (code !== 0 && code !== null) {
        reject(new Error(`Bridge exited with code ${code}`));
      }
    });
  });
}

/**
 * Run tests against the bridge
 */
async function runBridgeTests(bridgeProcess) {
  console.log('🔌 Connecting test client to bridge...');
  
  // Create client that connects to the bridge via stdio
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['scripts/mcp-bridge.mjs', '--endpoint', 'https://mcplookup.org/api/mcp'],
    stdio: [bridgeProcess.stdin, bridgeProcess.stdout, 'pipe']
  });

  const client = new Client({
    name: 'bridge-test-client',
    version: '1.0.0'
  });

  try {
    await client.connect(transport);
    console.log('✅ Test client connected to bridge');

    // Test 1: List bridge tools
    console.log('\n📋 Test 1: List bridge tools');
    const tools = await client.listTools();
    console.log(`✅ Found ${tools.tools?.length || 0} bridge tools`);
    
    const expectedTools = ['call_remote_tool', 'list_remote_tools', 'list_remote_resources', 'read_remote_resource', 'bridge_status'];
    for (const expectedTool of expectedTools) {
      const found = tools.tools?.find(t => t.name === expectedTool);
      if (found) {
        console.log(`  ✅ ${expectedTool}`);
      } else {
        console.log(`  ❌ Missing: ${expectedTool}`);
      }
    }

    // Test 2: Check bridge status
    console.log('\n🔍 Test 2: Check bridge status');
    const statusResult = await client.callTool({
      name: 'bridge_status',
      arguments: {}
    });
    console.log('✅ Bridge status retrieved');
    console.log(`📊 Status: ${statusResult.content?.[0]?.text || 'No status'}`);

    // Test 3: List remote tools
    console.log('\n🛠️  Test 3: List remote tools');
    try {
      const remoteToolsResult = await client.callTool({
        name: 'list_remote_tools',
        arguments: {}
      });
      console.log('✅ Remote tools listed');
      const remoteToolsData = JSON.parse(remoteToolsResult.content?.[0]?.text || '{}');
      console.log(`📊 Found ${remoteToolsData.total_count || 0} remote tools`);
    } catch (error) {
      console.log(`⚠️  Remote tools test failed: ${error.message}`);
    }

    // Test 4: Call a remote tool
    console.log('\n🔧 Test 4: Call remote tool');
    try {
      const remoteCallResult = await client.callTool({
        name: 'call_remote_tool',
        arguments: {
          tool_name: 'list_mcp_tools',
          arguments: {}
        }
      });
      console.log('✅ Remote tool called successfully');
      console.log(`📊 Result: ${remoteCallResult.content?.[0]?.text?.substring(0, 100) || 'No result'}...`);
    } catch (error) {
      console.log(`⚠️  Remote tool call failed: ${error.message}`);
    }

    await client.close();
    console.log('✅ All bridge tests completed');

  } catch (error) {
    console.error('❌ Bridge test failed:', error.message);
    throw error;
  }
}

/**
 * Main test execution
 */
async function main() {
  console.log('🎯 MCP HTTP Bridge Test Suite');
  console.log('==============================');

  const tests = [
    {
      name: 'Direct endpoint connection',
      args: ['--endpoint', 'https://mcplookup.org/api/mcp']
    },
    // Uncomment these when you have test servers available
    // {
    //   name: 'Domain-based discovery',
    //   args: ['--domain', 'mcplookup.org']
    // },
    // {
    //   name: 'Capability-based discovery',
    //   args: ['--capability', 'discovery']
    // }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await testBridge(test.args, test.name);
      console.log(`✅ ${test.name} - PASSED`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name} - FAILED: ${error.message}`);
      failed++;
    }
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
