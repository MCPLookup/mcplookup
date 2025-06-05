#!/usr/bin/env tsx
// Schema Extraction Script
// Extracts actual Zod schemas from route files and converts them to OpenAPI schemas

import { readFileSync } from 'fs';
import { join } from 'path';

interface ExtractedSchema {
  name: string;
  zodSchema: string;
  openApiSchema: any;
  file: string;
  line: number;
}

export class SchemaExtractor {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Extract schemas from a route file
   */
  extractSchemasFromFile(filePath: string): ExtractedSchema[] {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const schemas: ExtractedSchema[] = [];

    // Look for Zod schema definitions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Match schema definitions like: const SomeSchema = z.object({
      const schemaMatch = line.match(/const\s+(\w+Schema)\s*=\s*z\./);
      if (schemaMatch) {
        const schemaName = schemaMatch[1];
        const zodSchema = this.extractZodSchemaDefinition(lines, i);
        const openApiSchema = this.convertZodToOpenAPI(zodSchema);
        
        schemas.push({
          name: schemaName,
          zodSchema,
          openApiSchema,
          file: filePath,
          line: i + 1
        });
      }
    }

    return schemas;
  }

  /**
   * Extract the full Zod schema definition starting from a line
   */
  private extractZodSchemaDefinition(lines: string[], startLine: number): string {
    let schema = lines[startLine];
    let braceCount = 0;
    let inSchema = false;

    // Count opening braces in the first line
    for (const char of schema) {
      if (char === '{') {
        braceCount++;
        inSchema = true;
      } else if (char === '}') {
        braceCount--;
      }
    }

    // If schema is complete on one line
    if (braceCount === 0 && inSchema) {
      return schema;
    }

    // Continue reading lines until braces are balanced
    let currentLine = startLine + 1;
    while (braceCount > 0 && currentLine < lines.length) {
      const line = lines[currentLine];
      schema += '\n' + line;
      
      for (const char of line) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
        }
      }
      
      currentLine++;
    }

    return schema;
  }

  /**
   * Convert Zod schema to OpenAPI schema (basic implementation)
   */
  private convertZodToOpenAPI(zodSchema: string): any {
    // This is a simplified converter - in a real implementation you'd want a proper parser
    const openApiSchema: any = {
      type: 'object',
      properties: {},
      description: 'Generated from Zod schema'
    };

    // Extract field definitions
    const fieldRegex = /(\w+):\s*z\.(\w+)\(\)/g;
    let match;

    while ((match = fieldRegex.exec(zodSchema)) !== null) {
      const [, fieldName, zodType] = match;
      openApiSchema.properties[fieldName] = this.zodTypeToOpenAPI(zodType);
    }

    // Extract string fields with constraints
    const stringRegex = /(\w+):\s*z\.string\(\)\.([^,\n}]+)/g;
    while ((match = stringRegex.exec(zodSchema)) !== null) {
      const [, fieldName, constraints] = match;
      openApiSchema.properties[fieldName] = {
        type: 'string',
        ...this.parseStringConstraints(constraints)
      };
    }

    // Extract optional fields
    const optionalRegex = /(\w+):\s*z\.\w+\(\)\.optional\(\)/g;
    while ((match = optionalRegex.exec(zodSchema)) !== null) {
      const [, fieldName] = match;
      if (openApiSchema.properties[fieldName]) {
        // Field is optional, don't add to required array
      }
    }

    // Extract required fields (fields without .optional())
    const requiredFields: string[] = [];
    const allFieldRegex = /(\w+):\s*z\./g;
    while ((match = allFieldRegex.exec(zodSchema)) !== null) {
      const [fullMatch, fieldName] = match;
      if (!fullMatch.includes('.optional()')) {
        requiredFields.push(fieldName);
      }
    }

    if (requiredFields.length > 0) {
      openApiSchema.required = requiredFields;
    }

    return openApiSchema;
  }

  /**
   * Convert Zod type to OpenAPI type
   */
  private zodTypeToOpenAPI(zodType: string): any {
    const typeMap: Record<string, any> = {
      'string': { type: 'string' },
      'number': { type: 'number' },
      'boolean': { type: 'boolean' },
      'date': { type: 'string', format: 'date-time' },
      'array': { type: 'array', items: { type: 'string' } },
      'object': { type: 'object' },
      'enum': { type: 'string', enum: [] }
    };

    return typeMap[zodType] || { type: 'string' };
  }

  /**
   * Parse string constraints like .min(1).max(100).email()
   */
  private parseStringConstraints(constraints: string): any {
    const result: any = {};

    // Extract min/max length
    const minMatch = constraints.match(/\.min\((\d+)\)/);
    if (minMatch) {
      result.minLength = parseInt(minMatch[1]);
    }

    const maxMatch = constraints.match(/\.max\((\d+)\)/);
    if (maxMatch) {
      result.maxLength = parseInt(maxMatch[1]);
    }

    // Extract format
    if (constraints.includes('.email()')) {
      result.format = 'email';
    }
    if (constraints.includes('.url()')) {
      result.format = 'uri';
    }

    // Extract regex patterns
    const regexMatch = constraints.match(/\.regex\(([^)]+)\)/);
    if (regexMatch) {
      result.pattern = regexMatch[1].replace(/['"]/g, '');
    }

    return result;
  }

  /**
   * Extract schemas from discovery route specifically
   */
  extractDiscoverySchemas(): any {
    const discoveryFile = join(this.projectRoot, 'src/lib/schemas/discovery.ts');
    
    try {
      const content = readFileSync(discoveryFile, 'utf-8');
      
      // Extract key schemas
      const schemas: any = {};
      
      // Look for exported schemas
      const exportRegex = /export const (\w+Schema) = z\./g;
      let match;
      
      while ((match = exportRegex.exec(content)) !== null) {
        const schemaName = match[1];
        console.log(`  📋 Found schema: ${schemaName}`);
        
        // For now, create basic schema structure
        schemas[schemaName] = {
          type: 'object',
          description: `${schemaName} from discovery.ts`,
          properties: {}
        };
      }
      
      return schemas;
    } catch (error) {
      console.warn('Failed to extract discovery schemas:', error);
      return {};
    }
  }

  /**
   * Extract MCP tool schemas from the main server
   */
  extractMCPToolSchemas(): any {
    const mcpFile = join(this.projectRoot, 'src/app/api/mcp/route.ts');
    
    try {
      const content = readFileSync(mcpFile, 'utf-8');
      const tools: any = {};
      
      // Extract tool definitions with their schemas
      const toolRegex = /server\.tool\(\s*'([^']+)',\s*'([^']+)',\s*{([^}]+)}/gs;
      let match;
      
      while ((match = toolRegex.exec(content)) !== null) {
        const [, toolName, description, schemaContent] = match;
        
        tools[toolName] = {
          name: toolName,
          description: description,
          inputSchema: this.parseToolSchema(schemaContent)
        };
      }
      
      return tools;
    } catch (error) {
      console.warn('Failed to extract MCP tool schemas:', error);
      return {};
    }
  }

  /**
   * Parse tool schema content
   */
  private parseToolSchema(schemaContent: string): any {
    const schema: any = {
      type: 'object',
      properties: {},
      description: 'MCP tool parameters'
    };

    // Extract parameter definitions
    const paramRegex = /(\w+):\s*z\.(\w+)\([^)]*\)(?:\.(\w+)\([^)]*\))*/g;
    let match;

    while ((match = paramRegex.exec(schemaContent)) !== null) {
      const [, paramName, zodType, modifier] = match;
      
      schema.properties[paramName] = {
        ...this.zodTypeToOpenAPI(zodType),
        description: `${paramName} parameter`
      };

      // Handle optional parameters
      if (modifier === 'optional') {
        // Don't add to required array
      } else {
        if (!schema.required) schema.required = [];
        schema.required.push(paramName);
      }
    }

    return schema;
  }

  /**
   * Extract actual request/response examples from test files
   */
  extractExamples(): any {
    const examples: any = {};
    
    // Look for test files
    const testFiles = [
      'src/app/api/v1/discover/route.test.ts',
      'src/app/api/v1/register/route.test.ts',
      'src/app/api/mcp/mcp.test.ts'
    ];

    for (const testFile of testFiles) {
      try {
        const fullPath = join(this.projectRoot, testFile);
        const content = readFileSync(fullPath, 'utf-8');
        
        // Extract test data
        const testDataRegex = /const\s+(\w+)\s*=\s*{([^}]+)}/g;
        let match;
        
        while ((match = testDataRegex.exec(content)) !== null) {
          const [, varName, data] = match;
          if (varName.includes('test') || varName.includes('example')) {
            examples[varName] = `Found in ${testFile}`;
          }
        }
      } catch (error) {
        // Test file doesn't exist, skip
      }
    }

    return examples;
  }
}

// Export for use in other scripts
export default SchemaExtractor;
