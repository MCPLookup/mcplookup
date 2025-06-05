#!/usr/bin/env tsx
// Complete Sync Workflow: API ↔ OpenAPI ↔ Bridge Tools
// Orchestrates the full bidirectional sync process

import { EnhancedOpenAPIGenerator } from './generate-enhanced-openapi';
import { BridgeToolSyncer } from './sync-bridge-tools';
import { OpenAPIValidator } from './validate-openapi';

class SyncWorkflow {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Run complete sync workflow
   */
  async runComplete(): Promise<void> {
    console.log('🚀 Starting complete sync workflow...');
    console.log('=' .repeat(60));
    
    try {
      // Step 1: Generate OpenAPI from actual API
      console.log('\n📝 Step 1: Generate OpenAPI from API code');
      console.log('-'.repeat(40));
      const openApiGenerator = new EnhancedOpenAPIGenerator();
      await openApiGenerator.generateEnhanced();
      
      // Step 2: Sync bridge tools from OpenAPI
      console.log('\n🔄 Step 2: Sync bridge tools from OpenAPI');
      console.log('-'.repeat(40));
      const bridgeSyncer = new BridgeToolSyncer();
      await bridgeSyncer.sync();
      
      // Step 3: Validate everything
      console.log('\n✅ Step 3: Validate sync results');
      console.log('-'.repeat(40));
      const validator = new OpenAPIValidator();
      await validator.validate();
      
      // Step 4: Update main bridge to use generated tools
      console.log('\n🔧 Step 4: Update main bridge integration');
      console.log('-'.repeat(40));
      await this.updateMainBridge();
      
      console.log('\n🎉 Complete sync workflow finished successfully!');
      this.printWorkflowSummary();
      
    } catch (error) {
      console.error('\n❌ Sync workflow failed:', error);
      throw error;
    }
  }

  /**
   * Update main bridge to integrate generated tools
   */
  private async updateMainBridge(): Promise<void> {
    const bridgeIntegrationCode = this.generateBridgeIntegration();
    
    // Write integration helper
    const integrationPath = `${this.projectRoot}/src/lib/mcp/bridge-integration.ts`;
    const { writeFileSync } = await import('fs');
    writeFileSync(integrationPath, bridgeIntegrationCode);
    
    console.log('  🔧 Generated bridge integration helper');
    console.log('  📝 Update your main bridge.ts to use GeneratedBridgeTools');
  }

  /**
   * Generate bridge integration code
   */
  private generateBridgeIntegration(): string {
    return `// Bridge Integration Helper
// Integrates generated tools with main bridge
// Generated on ${new Date().toISOString()}

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GeneratedBridgeTools, GENERATED_TOOL_METADATA } from './bridge-generated';
import { BRIDGE_CONFIG } from './bridge-config';

/**
 * Enhanced bridge that combines manual and generated tools
 */
export class IntegratedBridge {
  private server: McpServer;
  private generatedTools: GeneratedBridgeTools;

  constructor(server: McpServer) {
    this.server = server;
    this.generatedTools = new GeneratedBridgeTools(server, BRIDGE_CONFIG.apiBaseUrl);
    this.setupIntegration();
  }

  /**
   * Setup integration between manual and generated tools
   */
  private setupIntegration(): void {
    console.log('🔧 Setting up integrated bridge with generated tools');
    console.log(\`📊 Generated tools available: \${GENERATED_TOOL_METADATA.length}\`);
    
    // Log available tool categories
    const categories = new Set(GENERATED_TOOL_METADATA.map(t => t.category));
    console.log(\`📂 Tool categories: \${Array.from(categories).join(', ')}\`);
  }

  /**
   * Get all available tools (manual + generated)
   */
  getAvailableTools(): Array<{
    name: string;
    description: string;
    category: string;
    source: 'manual' | 'generated';
  }> {
    const tools = [];
    
    // Add generated tools
    for (const tool of GENERATED_TOOL_METADATA) {
      tools.push({
        name: tool.name,
        description: tool.description,
        category: tool.category,
        source: 'generated' as const
      });
    }
    
    // Add manual tools (you can extend this)
    const manualTools = [
      {
        name: 'connect_and_list_tools',
        description: 'Connect to any MCP server and list its tools',
        category: 'Bridge',
        source: 'manual' as const
      },
      {
        name: 'call_tool_on_server',
        description: 'Call any tool on any MCP server',
        category: 'Bridge', 
        source: 'manual' as const
      },
      {
        name: 'read_resource_from_server',
        description: 'Read any resource from any MCP server',
        category: 'Bridge',
        source: 'manual' as const
      }
    ];
    
    tools.push(...manualTools);
    return tools;
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): string[] {
    return this.getAvailableTools()
      .filter(tool => tool.category === category)
      .map(tool => tool.name);
  }

  /**
   * Check if a tool is available
   */
  hasToolAvailable(toolName: string): boolean {
    return this.getAvailableTools().some(tool => tool.name === toolName);
  }

  /**
   * Get tool metadata
   */
  getToolMetadata(toolName: string) {
    return this.getAvailableTools().find(tool => tool.name === toolName);
  }
}

// Export for use in main bridge
export { GeneratedBridgeTools, BRIDGE_CONFIG, GENERATED_TOOL_METADATA };

// Helper to setup integrated bridge
export function setupIntegratedBridge(server: McpServer): IntegratedBridge {
  return new IntegratedBridge(server);
}
`;
  }

  /**
   * Print workflow summary
   */
  private printWorkflowSummary(): void {
    console.log('\n📊 Sync Workflow Summary');
    console.log('=' .repeat(50));
    
    console.log('\n✅ Completed Steps:');
    console.log('  1. ✅ Generated accurate OpenAPI spec from API code');
    console.log('  2. ✅ Generated bridge tools from OpenAPI spec');
    console.log('  3. ✅ Validated sync results and accuracy');
    console.log('  4. ✅ Created bridge integration helpers');
    
    console.log('\n📁 Generated Files:');
    console.log('  📄 openapi-enhanced.yaml - Comprehensive API spec');
    console.log('  📄 openapi-enhanced.json - JSON format for tools');
    console.log('  🔧 src/lib/mcp/bridge-generated.ts - Generated bridge tools');
    console.log('  ⚙️ src/lib/mcp/bridge-config.ts - Bridge configuration');
    console.log('  🔗 src/lib/mcp/bridge-integration.ts - Integration helper');
    console.log('  📋 BRIDGE_TOOL_MAPPING.md - Tool documentation');
    console.log('  📊 src/types/api-enhanced.ts - TypeScript types');
    console.log('  🛠️ src/types/mcp-tools.ts - MCP client types');
    
    console.log('\n🔄 Bidirectional Sync Achieved:');
    console.log('  API Code → OpenAPI Spec → Bridge Tools');
    console.log('  Changes to API automatically flow to bridge');
    console.log('  Type safety maintained end-to-end');
    
    console.log('\n🎯 Next Steps:');
    console.log('  1. Review generated bridge tools');
    console.log('  2. Update src/lib/mcp/bridge.ts to use IntegratedBridge');
    console.log('  3. Test the integrated bridge functionality');
    console.log('  4. Set up automated sync in CI/CD pipeline');
    console.log('  5. Generate client SDKs from OpenAPI spec');
    
    console.log('\n🚀 Automation Commands:');
    console.log('  npm run sync:complete    - Run full sync workflow');
    console.log('  npm run sync:openapi     - Generate OpenAPI only');
    console.log('  npm run sync:bridge      - Sync bridge tools only');
    console.log('  npm run sync:validate    - Validate sync results');
  }
}

// Main execution
async function main() {
  try {
    const workflow = new SyncWorkflow();
    await workflow.runComplete();
  } catch (error) {
    console.error('❌ Sync workflow failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SyncWorkflow };
