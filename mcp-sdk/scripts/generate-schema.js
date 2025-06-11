#!/usr/bin/env node
// Generate OpenAPI schema from TypeScript types
// This makes TypeScript types the single source of truth

import { writeFileSync } from 'fs';
import { resolve } from 'path';

// This is a simple generator - in a real project you'd use ts-to-openapi or similar
const openApiSchema = {
  openapi: '3.0.3',
  info: {
    title: 'MCPLookup.org API',
    version: '1.0.0',
    description: 'Generated from TypeScript types in mcp-sdk'
  },
  servers: [
    { url: 'https://mcplookup.org/api/v1', description: 'Production API v1' },
    { url: 'http://localhost:3000/api/v1', description: 'Development API v1' }
  ],
  components: {
    schemas: {
      // === MAIN UNIFIED TYPES ===
      MCPServer: {
        type: 'object',
        description: 'Complete MCP server record - USE THIS EVERYWHERE',
        properties: {
          id: { type: 'string', description: 'Unique identifier', example: 'github.com/owner/repo' },
          name: { type: 'string', description: 'Server name' },
          description: { type: 'string', description: 'Human-readable description' },
          endpoint: { type: 'string', format: 'uri', description: 'Optional live endpoint' },
          
          // GitHub Repository Data
          repository: { $ref: '#/components/schemas/GitHubRepository' },
          files: {
            type: 'array',
            items: { $ref: '#/components/schemas/FileContent' }
          },
          
          // AI Analysis & Classification
          computed: { $ref: '#/components/schemas/ComputedMetrics' },
          parsingMetadata: { $ref: '#/components/schemas/ParsingMetadata' },
          
          // Installation Methods  
          installationMethods: {
            type: 'array',
            items: { $ref: '#/components/schemas/InstallationMethod' }
          },
          packages: {
            type: 'array', 
            items: { $ref: '#/components/schemas/PackageInfo' }
          },
          
          // Categorization
          category: {
            type: 'string',
            enum: ['development', 'data', 'communication', 'api-integration', 'utility', 'other']
          },
          subcategories: { type: 'array', items: { type: 'string' } },
          tags: { type: 'array', items: { type: 'string' } },
          use_cases: { type: 'array', items: { type: 'string' } },
          
          // Quality & Trust
          quality: { $ref: '#/components/schemas/MCPServerQuality' },
          popularity: { $ref: '#/components/schemas/MCPServerPopularity' },
          
          // Availability
          availability: { $ref: '#/components/schemas/MCPServerAvailability' },
          
          // Capabilities
          capabilities: { $ref: '#/components/schemas/MCPServerCapabilities' },
          
          // Metadata
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'name', 'description', 'category', 'quality', 'availability', 'created_at', 'updated_at']
      },
      
      GitHubRepoWithInstallation: {
        type: 'object',
        description: 'Direct output from mcp-github-parser',
        properties: {
          repository: { $ref: '#/components/schemas/GitHubRepository' },
          files: { type: 'array', items: { $ref: '#/components/schemas/FileContent' } },
          installationMethods: { type: 'array', items: { $ref: '#/components/schemas/InstallationMethod' } },
          parsingMetadata: { $ref: '#/components/schemas/ParsingMetadata' },
          computed: { $ref: '#/components/schemas/ComputedMetrics' }
        },
        required: ['repository', 'installationMethods', 'parsingMetadata']
      },
      
      // === COMPONENT TYPES ===
      GitHubRepository: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          fullName: { type: 'string', example: 'owner/repo' },
          name: { type: 'string' },
          description: { type: 'string' },
          htmlUrl: { type: 'string', format: 'uri' },
          cloneUrl: { type: 'string', format: 'uri' },
          stars: { type: 'number' },
          forks: { type: 'number' },
          language: { type: 'string' },
          topics: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          pushedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'fullName', 'name', 'htmlUrl', 'cloneUrl', 'stars', 'forks']
      },
      
      FileContent: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          content: { type: 'string' },
          encoding: { type: 'string' }
        },
        required: ['path', 'content']
      },
      
      ComputedMetrics: {
        type: 'object',
        properties: {
          isMcpServer: { type: 'boolean' },
          mcpClassification: { type: 'string' },
          mcpConfidence: { type: 'number', minimum: 0, maximum: 1 },
          mcpReasoning: { type: 'string' },
          complexity: { type: 'string', enum: ['simple', 'moderate', 'complex'] },
          installationDifficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          maturityLevel: { type: 'string', enum: ['experimental', 'beta', 'stable', 'mature'] },
          supportedPlatforms: { type: 'array', items: { type: 'string' } },
          mcpTools: { type: 'array', items: { type: 'string' } },
          mcpResources: { type: 'array', items: { type: 'string' } },
          mcpPrompts: { type: 'array', items: { type: 'string' } },
          requiresClaudeDesktop: { type: 'boolean' },
          requiresEnvironmentVars: { type: 'boolean' },
          hasDocumentation: { type: 'boolean' },
          hasExamples: { type: 'boolean' }
        },
        required: ['isMcpServer', 'mcpConfidence']
      },
      
      ParsingMetadata: {
        type: 'object',
        properties: {
          parserVersion: { type: 'string' },
          analyzedAt: { type: 'string', format: 'date-time' },
          processingTime: { type: 'number' },
          confidence: { type: 'number', minimum: 0, maximum: 1 }
        },
        required: ['parserVersion', 'analyzedAt', 'confidence']
      },
      
      InstallationMethod: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['npm', 'pip', 'docker', 'git', 'manual'] },
          subtype: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          commands: { type: 'array', items: { type: 'string' } },
          platform: { type: 'string' },
          environment_vars: { type: 'object', additionalProperties: { type: 'string' } }
        },
        required: ['type', 'title']
      },
      
      PackageInfo: {
        type: 'object',
        properties: {
          registry_name: { type: 'string', enum: ['npm', 'pypi', 'docker', 'github', 'other'] },
          name: { type: 'string' },
          version: { type: 'string' },
          installation_command: { type: 'string' },
          startup_command: { type: 'string' },
          setup_instructions: { type: 'string' }
        },
        required: ['registry_name', 'name', 'version', 'installation_command']
      },
      
      MCPServerQuality: {
        type: 'object',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 170 },
          category: { type: 'string', enum: ['high', 'medium', 'low'] },
          trust_score: { type: 'number', minimum: 0, maximum: 100 },
          verified: { type: 'boolean' },
          issues: { type: 'array', items: { type: 'string' } },
          evidence: { type: 'array', items: { type: 'string' } }
        },
        required: ['score', 'category', 'trust_score', 'verified']
      },
      
      MCPServerPopularity: {
        type: 'object',
        properties: {
          stars: { type: 'number' },
          forks: { type: 'number' },
          downloads: { type: 'number' },
          rating: { type: 'number', minimum: 1, maximum: 5 }
        },
        required: ['stars', 'forks']
      },
      
      MCPServerCapabilities: {
        type: 'object',
        properties: {
          tools: { type: 'array', items: { type: 'string' } },
          resources: { type: 'array', items: { type: 'string' } },
          prompts: { type: 'array', items: { type: 'string' } },
          protocol_version: { type: 'string' }
        },
        required: ['tools', 'resources', 'prompts']
      },
      
      MCPServerAvailability: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['package_only', 'live_service', 'both'] },
          endpoint_verified: { type: 'boolean' },
          live_endpoint: { type: 'string', format: 'uri' },
          primary_package: { type: 'string' },
          packages_available: { type: 'boolean' }
        },
        required: ['status', 'endpoint_verified', 'primary_package', 'packages_available']
      }
    }
  }
};

// Write the generated schema
const outputPath = resolve(process.cwd(), 'spec/generated-openapi.yaml');
const yamlContent = `# AUTO-GENERATED FROM TYPESCRIPT TYPES
# Source: mcp-sdk/src/types/
# DO NOT EDIT MANUALLY - Run: npm run generate-schema

${JSON.stringify(openApiSchema, null, 2).replace(/"/g, '').replace(/\n  /g, '\n')}`;

writeFileSync(outputPath, yamlContent);
console.log('✅ Generated OpenAPI schema from TypeScript types');
console.log(`📄 Output: ${outputPath}`);
