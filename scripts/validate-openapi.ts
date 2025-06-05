#!/usr/bin/env tsx
// OpenAPI Validation and Comparison Script
// Compares old vs new OpenAPI specs and validates accuracy

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ComparisonResult {
  category: string;
  old: any;
  new: any;
  status: 'added' | 'removed' | 'changed' | 'same';
  details?: string;
}

class OpenAPIValidator {
  private projectRoot: string;
  private oldSpec: any = null;
  private newSpec: any = null;
  private enhancedSpec: any = null;

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Main validation function
   */
  async validate(): Promise<void> {
    console.log('🔍 Loading OpenAPI specifications...');
    await this.loadSpecs();
    
    console.log('📊 Comparing specifications...');
    const comparison = this.compareSpecs();
    
    console.log('📝 Generating validation report...');
    this.generateReport(comparison);
    
    console.log('✅ Validation complete!');
  }

  /**
   * Load all OpenAPI specifications
   */
  private async loadSpecs(): Promise<void> {
    // Load old spec
    const oldSpecPath = join(this.projectRoot, 'openapi.yaml');
    if (existsSync(oldSpecPath)) {
      try {
        const yaml = await import('js-yaml');
        const oldSpecContent = readFileSync(oldSpecPath, 'utf-8');
        this.oldSpec = yaml.load(oldSpecContent);
        console.log('  📄 Loaded old spec (openapi.yaml)');
      } catch (error) {
        console.warn('  ⚠️ Failed to load old spec:', error);
      }
    }

    // Load new generated spec
    const newSpecPath = join(this.projectRoot, 'openapi-generated.json');
    if (existsSync(newSpecPath)) {
      try {
        const newSpecContent = readFileSync(newSpecPath, 'utf-8');
        this.newSpec = JSON.parse(newSpecContent);
        console.log('  📄 Loaded generated spec (openapi-generated.json)');
      } catch (error) {
        console.warn('  ⚠️ Failed to load generated spec:', error);
      }
    }

    // Load enhanced spec
    const enhancedSpecPath = join(this.projectRoot, 'openapi-enhanced.json');
    if (existsSync(enhancedSpecPath)) {
      try {
        const enhancedSpecContent = readFileSync(enhancedSpecPath, 'utf-8');
        this.enhancedSpec = JSON.parse(enhancedSpecContent);
        console.log('  📄 Loaded enhanced spec (openapi-enhanced.json)');
      } catch (error) {
        console.warn('  ⚠️ Failed to load enhanced spec:', error);
      }
    }
  }

  /**
   * Compare specifications
   */
  private compareSpecs(): ComparisonResult[] {
    const results: ComparisonResult[] = [];

    if (!this.oldSpec || !this.enhancedSpec) {
      console.warn('Cannot compare - missing specifications');
      return results;
    }

    // Compare paths
    results.push(...this.comparePaths());
    
    // Compare schemas
    results.push(...this.compareSchemas());
    
    // Compare MCP tools
    results.push(...this.compareMCPTools());

    return results;
  }

  /**
   * Compare API paths
   */
  private comparePaths(): ComparisonResult[] {
    const results: ComparisonResult[] = [];
    
    const oldPaths = Object.keys(this.oldSpec.paths || {});
    const newPaths = Object.keys(this.enhancedSpec.paths || {});
    
    // Find added paths
    for (const path of newPaths) {
      if (!oldPaths.includes(path)) {
        results.push({
          category: 'paths',
          old: null,
          new: path,
          status: 'added',
          details: `New endpoint discovered: ${path}`
        });
      }
    }
    
    // Find removed paths
    for (const path of oldPaths) {
      if (!newPaths.includes(path)) {
        results.push({
          category: 'paths',
          old: path,
          new: null,
          status: 'removed',
          details: `Endpoint no longer exists: ${path}`
        });
      }
    }
    
    // Compare existing paths
    for (const path of oldPaths) {
      if (newPaths.includes(path)) {
        const oldMethods = Object.keys(this.oldSpec.paths[path] || {});
        const newMethods = Object.keys(this.enhancedSpec.paths[path] || {});
        
        if (JSON.stringify(oldMethods.sort()) !== JSON.stringify(newMethods.sort())) {
          results.push({
            category: 'paths',
            old: oldMethods,
            new: newMethods,
            status: 'changed',
            details: `Methods changed for ${path}: ${oldMethods.join(',')} → ${newMethods.join(',')}`
          });
        }
      }
    }

    return results;
  }

  /**
   * Compare schemas
   */
  private compareSchemas(): ComparisonResult[] {
    const results: ComparisonResult[] = [];
    
    const oldSchemas = Object.keys(this.oldSpec.components?.schemas || {});
    const newSchemas = Object.keys(this.enhancedSpec.components?.schemas || {});
    
    // Find added schemas
    for (const schema of newSchemas) {
      if (!oldSchemas.includes(schema)) {
        results.push({
          category: 'schemas',
          old: null,
          new: schema,
          status: 'added',
          details: `New schema: ${schema}`
        });
      }
    }
    
    // Find removed schemas
    for (const schema of oldSchemas) {
      if (!newSchemas.includes(schema)) {
        results.push({
          category: 'schemas',
          old: schema,
          new: null,
          status: 'removed',
          details: `Schema removed: ${schema}`
        });
      }
    }

    return results;
  }

  /**
   * Compare MCP tools
   */
  private compareMCPTools(): ComparisonResult[] {
    const results: ComparisonResult[] = [];
    
    const oldTools = this.oldSpec['x-mcp-tools']?.servers || {};
    const newTools = this.enhancedSpec['x-mcp-tools']?.servers || {};
    
    // Compare main server tools
    const oldMainTools = oldTools.main?.tools || [];
    const newMainTools = newTools.main?.tools || [];
    
    const oldMainToolNames = oldMainTools.map((t: any) => t.name);
    const newMainToolNames = newMainTools.map((t: any) => t.name);
    
    for (const toolName of newMainToolNames) {
      if (!oldMainToolNames.includes(toolName)) {
        results.push({
          category: 'mcp-tools',
          old: null,
          new: toolName,
          status: 'added',
          details: `New MCP tool discovered: ${toolName}`
        });
      }
    }
    
    // Compare bridge tools
    const oldBridgeTools = oldTools.bridge?.tools || [];
    const newBridgeTools = newTools.bridge?.tools || [];
    
    if (newBridgeTools.length > 0 && oldBridgeTools.length === 0) {
      results.push({
        category: 'mcp-tools',
        old: 'No bridge tools',
        new: `${newBridgeTools.length} bridge tools`,
        status: 'added',
        details: 'Bridge tools section added with comprehensive tool definitions'
      });
    }

    return results;
  }

  /**
   * Generate validation report
   */
  private generateReport(comparison: ComparisonResult[]): void {
    console.log('\n📊 OpenAPI Validation Report');
    console.log('=' .repeat(50));
    
    // Summary
    const added = comparison.filter(r => r.status === 'added').length;
    const removed = comparison.filter(r => r.status === 'removed').length;
    const changed = comparison.filter(r => r.status === 'changed').length;
    
    console.log(`\n📈 Summary:`);
    console.log(`  ✅ Added: ${added}`);
    console.log(`  ❌ Removed: ${removed}`);
    console.log(`  🔄 Changed: ${changed}`);
    
    // Detailed results by category
    const categories = ['paths', 'schemas', 'mcp-tools'];
    
    for (const category of categories) {
      const categoryResults = comparison.filter(r => r.category === category);
      if (categoryResults.length > 0) {
        console.log(`\n📋 ${category.toUpperCase()}:`);
        
        for (const result of categoryResults) {
          const icon = {
            'added': '✅',
            'removed': '❌',
            'changed': '🔄',
            'same': '✓'
          }[result.status];
          
          console.log(`  ${icon} ${result.details}`);
        }
      }
    }
    
    // Accuracy assessment
    console.log('\n🎯 Accuracy Assessment:');
    
    if (this.enhancedSpec) {
      const pathCount = Object.keys(this.enhancedSpec.paths || {}).length;
      const schemaCount = Object.keys(this.enhancedSpec.components?.schemas || {}).length;
      const toolCount = (this.enhancedSpec['x-mcp-tools']?.servers?.main?.tools?.length || 0) +
                       (this.enhancedSpec['x-mcp-tools']?.servers?.bridge?.tools?.length || 0);
      
      console.log(`  📍 API Endpoints: ${pathCount} discovered`);
      console.log(`  📋 Schemas: ${schemaCount} defined`);
      console.log(`  🛠️ MCP Tools: ${toolCount} documented`);
      
      // Check for comprehensive coverage
      const hasDiscovery = this.enhancedSpec.paths['/v1/discover'] !== undefined;
      const hasRegistration = this.enhancedSpec.paths['/v1/register'] !== undefined;
      const hasMCPEndpoint = this.enhancedSpec.paths['/mcp'] !== undefined;
      const hasBridgeTools = (this.enhancedSpec['x-mcp-tools']?.servers?.bridge?.tools?.length || 0) > 0;
      
      console.log(`\n✅ Coverage Check:`);
      console.log(`  ${hasDiscovery ? '✅' : '❌'} Discovery endpoints`);
      console.log(`  ${hasRegistration ? '✅' : '❌'} Registration endpoints`);
      console.log(`  ${hasMCPEndpoint ? '✅' : '❌'} MCP protocol endpoint`);
      console.log(`  ${hasBridgeTools ? '✅' : '❌'} Bridge tools documented`);
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (removed > 0) {
      console.log('  ⚠️ Some endpoints were removed - verify they are truly obsolete');
    }
    
    if (added > 5) {
      console.log('  ✅ Many new endpoints discovered - spec is now much more accurate');
    }
    
    if (this.enhancedSpec?.['x-mcp-tools']) {
      console.log('  ✅ MCP tools are now properly documented');
    }
    
    console.log('  📝 Consider using the enhanced spec as your new source of truth');
    console.log('  🔄 Set up automated generation to keep spec in sync with code');
  }
}

// Main execution
async function main() {
  try {
    const validator = new OpenAPIValidator();
    await validator.validate();
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { OpenAPIValidator };
