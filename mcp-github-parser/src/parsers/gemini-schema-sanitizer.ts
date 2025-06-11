/**
 * Gemini Schema Sanitizer
 * Converts complex JSON schemas to Gemini-compatible format
 * 
 * Gemini limitations:
 * - No additionalProperties
 * - No anyOf, oneOf, allOf
 * - No conditionals (if/then/else)
 * - Limited support for complex patterns
 * - Simplified type definitions only
 */

export interface GeminiCompatibleSchema {
  type: string;
  properties?: Record<string, any>;
  items?: any;
  required?: string[];
  enum?: string[];
  description?: string;
}

export class GeminiSchemaSanitizer {
  
  /**
   * Sanitize any schema for Gemini compatibility
   * @param schema - Original JSON schema
   * @returns Gemini-compatible schema
   */  static sanitizeSchema(schema: any): GeminiCompatibleSchema {
    if (!schema || typeof schema !== 'object') {
      return { type: 'object' };
    }

    const sanitized: any = {
      type: schema.type || 'object' // Default to object
    };

    // Copy description if present
    if (schema.description) {
      sanitized.description = schema.description;
    }

    // Handle properties - recursively sanitize each property
    if (schema.properties && typeof schema.properties === 'object') {
      sanitized.properties = {};
      
      for (const [key, value] of Object.entries(schema.properties)) {
        sanitized.properties[key] = this.sanitizeSchema(value);
      }
    }

    // Handle array items
    if (schema.items) {
      sanitized.items = this.sanitizeSchema(schema.items);
    }

    // Handle required fields
    if (schema.required && Array.isArray(schema.required)) {
      sanitized.required = [...schema.required];
    }

    // Handle enums
    if (schema.enum && Array.isArray(schema.enum)) {
      sanitized.enum = [...schema.enum];
    }

    // Convert anyOf/oneOf to the most permissive type
    if (schema.anyOf || schema.oneOf) {
      const alternatives = schema.anyOf || schema.oneOf;
      if (Array.isArray(alternatives) && alternatives.length > 0) {
        // Find the most complex/permissive alternative
        const bestAlt = this.selectBestAlternative(alternatives);
        const sanitizedAlt = this.sanitizeSchema(bestAlt);
        
        // Merge properties if it's an object type
        if (sanitizedAlt.properties) {
          sanitized.properties = { ...sanitized.properties, ...sanitizedAlt.properties };
        }
        if (sanitizedAlt.required) {
          sanitized.required = [...new Set([...(sanitized.required || []), ...sanitizedAlt.required])];
        }
      }
    }

    // Handle allOf by merging all schemas
    if (schema.allOf && Array.isArray(schema.allOf)) {
      const merged = this.mergeSchemas(schema.allOf);
      const sanitizedMerged = this.sanitizeSchema(merged);
      
      // Merge into current sanitized schema
      if (sanitizedMerged.properties) {
        sanitized.properties = { ...sanitized.properties, ...sanitizedMerged.properties };
      }
      if (sanitizedMerged.required) {
        sanitized.required = [...new Set([...(sanitized.required || []), ...sanitizedMerged.required])];
      }
    }

    // Handle conditional schemas (if/then/else) by merging then and else
    if (schema.if && (schema.then || schema.else)) {
      const conditionalSchemas = [];
      if (schema.then) conditionalSchemas.push(schema.then);
      if (schema.else) conditionalSchemas.push(schema.else);
      
      if (conditionalSchemas.length > 0) {
        const merged = this.mergeSchemas(conditionalSchemas);
        const sanitizedConditional = this.sanitizeSchema(merged);
        
        if (sanitizedConditional.properties) {
          sanitized.properties = { ...sanitized.properties, ...sanitizedConditional.properties };
        }
        if (sanitizedConditional.required) {
          sanitized.required = [...new Set([...(sanitized.required || []), ...sanitizedConditional.required])];
        }
      }
    }    // Convert complex types to simpler ones
    if (schema.type === 'integer') {
      sanitized.type = 'number'; // Gemini prefers number over integer
    }

    // Handle const by converting to enum
    if (schema.const !== undefined) {
      sanitized.enum = [schema.const];
      delete sanitized.const;
    }    // Fix empty object types - Gemini requires non-empty properties for objects
    if (sanitized.type === 'object') {
      // If it's an object but has no properties defined, convert to string type instead
      if (!sanitized.properties || Object.keys(sanitized.properties).length === 0) {
        // For objects with additionalProperties that would be empty, convert to string
        sanitized.type = 'string';
        sanitized.description = (sanitized.description || '') + ' (Dynamic object converted to string for Gemini compatibility)';
        delete sanitized.properties;
      }
      // Remove additionalProperties completely as it's not supported
      if ('additionalProperties' in sanitized) {
        delete sanitized.additionalProperties;
      }
    }// Remove all unsupported properties - comprehensive list
    const unsupportedProps = [
      'additionalProperties',
      'patternProperties', 
      'if', 'then', 'else',
      'not',
      'const',
      'pattern',
      'format',
      'minimum', 'maximum',
      'minLength', 'maxLength',
      'minItems', 'maxItems',
      'uniqueItems',
      '$ref',
      'anyOf', 'oneOf', 'allOf',
      'dependencies',
      'dependentSchemas',
      'dependentRequired', 
      'propertyNames',
      'contains',
      'examples',
      'default',
      'definitions',
      '$schema',
      '$id',
      'unevaluatedProperties',
      'unevaluatedItems',
      'additionalItems',
      'prefixItems'
    ];

    // Deep clean - remove unsupported props recursively
    const deepClean = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      
      // Remove unsupported properties from current level
      unsupportedProps.forEach(prop => {
        if (prop in obj) {
          delete obj[prop];
        }
      });
      
      // Recursively clean nested objects
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          obj[key] = deepClean(obj[key]);
        }
      });
      
      return obj;
    };

    return deepClean(sanitized);
  }
  /**
   * Merge multiple schemas (simplified approach for allOf)
   */
  private static mergeSchemas(schemas: any[]): any {
    const merged: any = {
      type: 'object',
      properties: {},
      required: []
    };

    schemas.forEach(schema => {
      if (schema.type && schema.type !== 'object') {
        merged.type = schema.type;
      }

      if (schema.properties) {
        Object.assign(merged.properties, schema.properties);
      }

      if (schema.required && Array.isArray(schema.required)) {
        merged.required.push(...schema.required);
      }
    });

    // Remove duplicate required fields
    merged.required = [...new Set(merged.required)];

    return merged;
  }

  /**
   * Select the best alternative from anyOf/oneOf
   * Prefers object types, then arrays, then primitives
   */
  private static selectBestAlternative(alternatives: any[]): any {
    // Prioritize object types
    const objectAlts = alternatives.filter(alt => alt.type === 'object' || alt.properties);
    if (objectAlts.length > 0) {
      // Return the object with the most properties
      return objectAlts.reduce((best, current) => {
        const bestProps = Object.keys(best.properties || {}).length;
        const currentProps = Object.keys(current.properties || {}).length;
        return currentProps > bestProps ? current : best;
      });
    }

    // Next prioritize arrays
    const arrayAlts = alternatives.filter(alt => alt.type === 'array' || alt.items);
    if (arrayAlts.length > 0) {
      return arrayAlts[0];
    }

    // Fallback to first alternative
    return alternatives[0];
  }
  /**
   * Create ultra-simplified schema for Gemini (most aggressive approach)
   * Use this when regular sanitization still fails
   */
  static createUltraSimpleSchema(): GeminiCompatibleSchema {
    return {
      type: 'object',
      properties: {
        methods: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' }
            },
            required: ['type', 'title', 'description', 'category']
          }
        }
      },
      required: ['methods']
    };
  }

  /**
   * Validate if a schema is Gemini-compatible
   */
  static isGeminiCompatible(schema: any): boolean {
    if (!schema || typeof schema !== 'object') {
      return false;
    }

    // Check for unsupported properties
    const unsupportedProps = [
      'additionalProperties',
      'anyOf', 'oneOf', 'allOf',
      'if', 'then', 'else',
      'not'
    ];

    for (const prop of unsupportedProps) {
      if (prop in schema) {
        return false;
      }
    }

    // Recursively check properties
    if (schema.properties) {
      for (const value of Object.values(schema.properties)) {
        if (!this.isGeminiCompatible(value)) {
          return false;
        }
      }
    }

    // Check items if array
    if (schema.items && !this.isGeminiCompatible(schema.items)) {
      return false;
    }

    return true;
  }

  /**
   * Get a report of what was removed/modified during sanitization
   */
  static getSanitizationReport(originalSchema: any, sanitizedSchema: any): string[] {
    const changes: string[] = [];

    if (originalSchema.additionalProperties !== undefined) {
      changes.push('Removed: additionalProperties');
    }

    if (originalSchema.anyOf || originalSchema.oneOf) {
      changes.push('Simplified: anyOf/oneOf converted to single type');
    }

    if (originalSchema.allOf) {
      changes.push('Merged: allOf schemas combined');
    }

    if (originalSchema.if || originalSchema.then || originalSchema.else) {
      changes.push('Removed: conditional logic (if/then/else)');
    }

    const unsupportedFound = [
      'patternProperties', 'pattern', 'format',
      'minimum', 'maximum', 'minLength', 'maxLength',
      'minItems', 'maxItems', 'uniqueItems', 'const', 'not'
    ].filter(prop => originalSchema[prop] !== undefined);

    if (unsupportedFound.length > 0) {
      changes.push(`Removed: ${unsupportedFound.join(', ')}`);
    }

    return changes;
  }
}
