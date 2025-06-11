/**
 * Unified AI Provider with fallback chain
 * Tries Gemini -> OpenRouter -> Together.ai in sequence
 * Provides a single parseWithSchema interface
 */

import { TogetherJSONParser } from './together-json-parser.js';
import { OpenRouterJSONParser } from './openrouter-parser.js';
import { GeminiSchemaSanitizer } from './gemini-schema-sanitizer.js';

// Import Gemini when available
import { GeminiJSONParser } from './gemini-json-parser.js';

export class AIProvider {
  private togetherParser: TogetherJSONParser;
  private openrouterParser: OpenRouterJSONParser;
  private geminiParser?: GeminiJSONParser;
  constructor() {
    this.togetherParser = new TogetherJSONParser();
    this.openrouterParser = new OpenRouterJSONParser();
    
    // Only initialize Gemini if API key is available
    try {
      this.geminiParser = new GeminiJSONParser();
      
    } catch (error) {
      
      this.geminiParser = undefined;
    }
  }

  /**
   * Parse with schema using fallback chain: Gemini -> OpenRouter -> Together
   * @param prompt - The prompt to send to the AI
   * @param schema - JSON schema to enforce
   * @param schemaName - Name for the schema (optional)
   * @returns Parsed JSON response matching the schema
   */
  async parseWithSchema(prompt: string, schema: any, schemaName = "response"): Promise<any> {
    const errors: string[] = [];    // Try Gemini first (when available)
    if (this.geminiParser) {
      try {
        
        
        // Sanitize schema for Gemini compatibility
        const geminiSchema = GeminiSchemaSanitizer.sanitizeSchema(schema);
        
        
        // Get sanitization report
        const changes = GeminiSchemaSanitizer.getSanitizationReport(schema, geminiSchema);
        if (changes.length > 0) {
          
        }
        
        const result = await this.geminiParser.parseWithSchema(prompt, geminiSchema, schemaName);
        
        return result;
      } catch (error: any) {
        const errorMsg = `Gemini failed: ${error.message}`;
        console.warn('⚠️', errorMsg);
        errors.push(errorMsg);
      }
    }// Try OpenRouter second
    try {
      
      const result = await this.openrouterParser.parseWithSchema(prompt, schema, schemaName);
      
      return result;
    } catch (error: any) {
      const errorMsg = `OpenRouter failed: ${error.message}`;
      console.warn('⚠️', errorMsg);
      errors.push(errorMsg);
    }

    // Try Together.ai last (fallback)
    try {
      
      const result = await this.togetherParser.parseWithSchema(prompt, schema, schemaName);
      
      return result;
    } catch (error: any) {
      const errorMsg = `Together.ai failed: ${error.message}`;
      
      errors.push(errorMsg);
    }

    // All providers failed
    throw new Error(`All AI providers failed: ${errors.join('; ')}`);
  }

  /**
   * Simple JSON parsing without schema enforcement
   * @param prompt - The prompt to send to the AI
   * @returns Parsed JSON response
   */
  async parseJSON(prompt: string): Promise<any> {
    const errors: string[] = [];    // Try Gemini first (when available)
    if (this.geminiParser) {
      try {
        
        // Use ultra-simple schema for JSON parsing
        const basicSchema = GeminiSchemaSanitizer.createUltraSimpleSchema();
        const result = await this.geminiParser.parseWithSchema(prompt, basicSchema, "json-response");
        
        return result;
      } catch (error: any) {
        const errorMsg = `Gemini failed: ${error.message}`;
        console.warn('⚠️', errorMsg);
        errors.push(errorMsg);
      }
    }// Try OpenRouter second (using basic schema for JSON)
    try {
      
      const basicSchema = { type: "object" }; // Simple schema for any JSON
      const result = await this.openrouterParser.parseWithSchema(prompt, basicSchema, "json-response");
      
      return result;
    } catch (error: any) {
      const errorMsg = `OpenRouter failed: ${error.message}`;
      console.warn('⚠️', errorMsg);
      errors.push(errorMsg);
    }

    // Try Together.ai last (fallback)
    try {
      
      const result = await this.togetherParser.parseJSON(prompt);
      
      return result;
    } catch (error: any) {
      const errorMsg = `Together.ai failed: ${error.message}`;
      
      errors.push(errorMsg);
    }

    // All providers failed
    throw new Error(`All AI providers failed: ${errors.join('; ')}`);
  }

  /**
   * Get status of available AI providers
   */  getProviderStatus(): { [key: string]: boolean } {
    return {
      gemini: !!this.geminiParser,
      openrouter: !!this.openrouterParser,
      together: !!this.togetherParser
    };
  }
}
