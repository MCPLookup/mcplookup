// Example: Using the SDK's new installation utilities
// This shows how the CLI and MCP server can both use the same installation logic

import { 
  InstallationResolver, 
  InstallationContext, 
  MCPLookupAPIClient 
} from '@mcplookup-org/mcp-sdk';

// Example 1: Resolve a package from natural language
async function example1() {
  const resolver = new InstallationResolver();
  
  // This can handle:
  // - Direct packages: "mcp-server-git" 
  // - Natural language: "file operations"
  // - NPM packages: "@modelcontextprotocol/server-git"
  const resolved = await resolver.resolvePackage("file operations");
  
  console.log('Resolved Package:', {
    name: resolved.displayName,
    package: resolved.packageName,
    type: resolved.type,
    verified: resolved.verified
  });
}

// Example 2: Get installation instructions
async function example2() {
  const resolver = new InstallationResolver();
  
  const resolved = await resolver.resolvePackage("mcp-server-git");
  
  const context: InstallationContext = {
    mode: 'direct',
    platform: 'win32',
    client: 'Claude Desktop',
    globalInstall: true
  };
  
  const instructions = await resolver.getInstallationInstructions(resolved, context);
  
  console.log('Installation Instructions:');
  console.log('Command:', instructions.command);
  console.log('Args:', instructions.args);
  console.log('Steps:', instructions.steps);
}

// Example 3: Generate Claude Desktop config
async function example3() {
  const resolver = new InstallationResolver();
  
  const resolved = await resolver.resolvePackage("weather data");
  
  const context: InstallationContext = {
    mode: 'direct',
    platform: 'darwin',
    client: 'Claude Desktop'
  };
  
  const config = resolver.generateClaudeConfig(resolved, context, {
    'API_KEY': 'your-api-key-here'
  });
  
  console.log('Claude Config:');
  console.log(JSON.stringify(config, null, 2));
}

// Example 4: Direct API usage
async function example4() {
  const client = new MCPLookupAPIClient();
  
  // Search with filters
  const results = await client.searchServers({
    q: 'database',
    category: 'data',
    quality: 'high',
    claude_ready: true
  });
  
  console.log(`Found ${results.servers?.length} database servers`);
  
  // Get detailed info
  if (results.servers && results.servers.length > 0) {
    const details = await client.getServer(results.servers[0].id);
    console.log('Server details:', details.name);
  }
}

// This demonstrates the power of the new SDK:
// 1. ✅ Smart package resolution (handles natural language!)
// 2. ✅ Cross-platform installation instructions  
// 3. ✅ Automatic Claude config generation
// 4. ✅ Type-safe API client
// 5. ✅ Reusable across CLI, website, and MCP server
