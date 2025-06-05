// Smart Indexing System
// Automatically detects field types and creates appropriate indexes

export interface IndexOptions {
  // Auto-detect and index all fields (default: true)
  autoIndex?: boolean;
  
  // Fields to exclude from indexing
  excludeFields?: string[];
  
  // Maximum depth for nested object indexing (default: 2)
  maxDepth?: number;
  
  // Minimum string length for text indexing (default: 2)
  minTextLength?: number;
}

export interface FieldAnalysis {
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  isSearchable: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  samples: any[];
}

/**
 * Smart Indexer
 * Automatically analyzes data and creates appropriate indexes
 */
export class SmartIndexer {
  private collection: string;
  private options: IndexOptions;
  private fieldAnalysis = new Map<string, FieldAnalysis>();

  constructor(collection: string, options: IndexOptions = {}) {
    this.collection = collection;
    this.options = {
      autoIndex: true,
      excludeFields: ['password', 'token', 'secret', 'key', 'hash'],
      maxDepth: 2,
      minTextLength: 2,
      ...options
    };
  }

  /**
   * Analyze a record and update field analysis
   */
  analyzeRecord(data: any, path: string = '', depth: number = 0): void {
    if (!this.options.autoIndex || depth > (this.options.maxDepth || 2)) {
      return;
    }

    for (const [key, value] of Object.entries(data)) {
      const fieldPath = path ? `${path}.${key}` : key;
      
      // Skip excluded fields
      if (this.options.excludeFields?.some(excluded => 
        fieldPath.includes(excluded) || key.includes(excluded)
      )) {
        continue;
      }

      this.analyzeField(fieldPath, value);

      // Recursively analyze nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.analyzeRecord(value, fieldPath, depth + 1);
      }
    }
  }

  /**
   * Analyze a single field and determine its characteristics
   */
  private analyzeField(fieldPath: string, value: any): void {
    let analysis = this.fieldAnalysis.get(fieldPath);
    
    if (!analysis) {
      analysis = {
        type: this.detectType(value),
        isSearchable: false,
        isFilterable: false,
        isSortable: false,
        samples: []
      };
      this.fieldAnalysis.set(fieldPath, analysis);
    }

    // Add sample value
    if (analysis.samples.length < 10) {
      analysis.samples.push(value);
    }

    // Update characteristics based on value
    this.updateFieldCharacteristics(analysis, value);
  }

  /**
   * Detect the type of a value
   */
  private detectType(value: any): FieldAnalysis['type'] {
    if (value === null || value === undefined) {
      return 'string'; // Default fallback
    }

    if (typeof value === 'number') {
      return 'number';
    }

    if (typeof value === 'boolean') {
      return 'boolean';
    }

    if (Array.isArray(value)) {
      return 'array';
    }

    if (typeof value === 'object') {
      return 'object';
    }

    if (typeof value === 'string') {
      // Check if it's a date
      if (this.isDateString(value)) {
        return 'date';
      }
      return 'string';
    }

    return 'string';
  }

  /**
   * Check if a string looks like a date
   */
  private isDateString(value: string): boolean {
    // Common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO 8601
      /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
    ];

    return datePatterns.some(pattern => pattern.test(value)) && !isNaN(Date.parse(value));
  }

  /**
   * Update field characteristics based on observed values
   */
  private updateFieldCharacteristics(analysis: FieldAnalysis, value: any): void {
    switch (analysis.type) {
      case 'string':
        if (typeof value === 'string' && value.length >= (this.options.minTextLength || 2)) {
          analysis.isSearchable = true;
          analysis.isFilterable = true;
        }
        break;

      case 'number':
        analysis.isFilterable = true;
        analysis.isSortable = true;
        break;

      case 'date':
        analysis.isFilterable = true;
        analysis.isSortable = true;
        break;

      case 'boolean':
        analysis.isFilterable = true;
        break;

      case 'array':
        // Arrays can be searched if they contain strings
        if (Array.isArray(value) && value.some(item => typeof item === 'string')) {
          analysis.isSearchable = true;
          analysis.isFilterable = true;
        }
        break;
    }
  }

  /**
   * Get indexing recommendations based on analysis
   */
  getIndexingRecommendations(): {
    exactFields: string[];
    textFields: string[];
    numericFields: string[];
    dateFields: string[];
    searchableFields: string[];
  } {
    const exactFields: string[] = [];
    const textFields: string[] = [];
    const numericFields: string[] = [];
    const dateFields: string[] = [];
    const searchableFields: string[] = [];

    for (const [fieldPath, analysis] of this.fieldAnalysis.entries()) {
      if (analysis.isFilterable) {
        exactFields.push(fieldPath);
      }

      if (analysis.isSearchable) {
        searchableFields.push(fieldPath);
        
        // Determine if it should be text-indexed or exact-indexed
        if (analysis.type === 'string' && this.shouldTextIndex(analysis)) {
          textFields.push(fieldPath);
        }
      }

      if (analysis.type === 'number' && analysis.isSortable) {
        numericFields.push(fieldPath);
      }

      if (analysis.type === 'date' && analysis.isSortable) {
        dateFields.push(fieldPath);
      }
    }

    return {
      exactFields,
      textFields,
      numericFields,
      dateFields,
      searchableFields
    };
  }

  /**
   * Determine if a field should be text-indexed (vs exact-indexed)
   */
  private shouldTextIndex(analysis: FieldAnalysis): boolean {
    // Text index if values are typically longer than a few characters
    const avgLength = analysis.samples
      .filter(s => typeof s === 'string')
      .reduce((sum, s) => sum + s.length, 0) / analysis.samples.length;

    return avgLength > 10; // Arbitrary threshold
  }

  /**
   * Get field analysis for debugging
   */
  getFieldAnalysis(): Map<string, FieldAnalysis> {
    return new Map(this.fieldAnalysis);
  }

  /**
   * Reset analysis (useful when data patterns change)
   */
  reset(): void {
    this.fieldAnalysis.clear();
  }

  /**
   * Generate index keys for a record
   */
  generateIndexKeys(data: any): {
    exact: Array<{ field: string; value: string; key: string }>;
    text: Array<{ field: string; tokens: string[]; keys: string[] }>;
    numeric: Array<{ field: string; value: number; key: string }>;
    date: Array<{ field: string; timestamp: number; key: string }>;
  } {
    const recommendations = this.getIndexingRecommendations();
    const result = {
      exact: [] as Array<{ field: string; value: string; key: string }>,
      text: [] as Array<{ field: string; tokens: string[]; keys: string[] }>,
      numeric: [] as Array<{ field: string; value: number; key: string }>,
      date: [] as Array<{ field: string; timestamp: number; key: string }>
    };

    // Generate exact indexes
    for (const field of recommendations.exactFields) {
      const value = this.getFieldValue(data, field);
      if (value !== null && value !== undefined) {
        result.exact.push({
          field,
          value: String(value),
          key: `idx:${this.collection}:exact:${field}:${value}`
        });
      }
    }

    // Generate text indexes
    for (const field of recommendations.textFields) {
      const value = this.getFieldValue(data, field);
      if (value && typeof value === 'string') {
        const tokens = this.tokenizeText(value);
        const keys = tokens.map(token => `idx:${this.collection}:text:${field}:${token}`);
        result.text.push({ field, tokens, keys });
      }
    }

    // Generate numeric indexes
    for (const field of recommendations.numericFields) {
      const value = this.getFieldValue(data, field);
      if (typeof value === 'number') {
        result.numeric.push({
          field,
          value,
          key: `idx:${this.collection}:numeric:${field}`
        });
      }
    }

    // Generate date indexes
    for (const field of recommendations.dateFields) {
      const value = this.getFieldValue(data, field);
      if (value && typeof value === 'string') {
        const timestamp = new Date(value).getTime();
        if (!isNaN(timestamp)) {
          result.date.push({
            field,
            timestamp,
            key: `idx:${this.collection}:date:${field}`
          });
        }
      }
    }

    return result;
  }

  /**
   * Get field value from nested object
   */
  private getFieldValue(data: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = data;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return null;
      }
    }
    
    return value;
  }

  /**
   * Tokenize text for search indexing
   */
  private tokenizeText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length >= (this.options.minTextLength || 2));
  }
}
