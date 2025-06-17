// Simple Intent Service - Keyword-based Intent to Capability Matching
// Lightweight, maintainable, and reliable

import { IIntentService } from './discovery';

/**
 * Simple Intent Service Implementation
 * Maps user queries to MCP capabilities using straightforward keyword matching
 */
export class IntentService implements IIntentService {  // Simple capability-to-keywords mapping
  private readonly capabilityKeywords = new Map<string, string[]>([
    // File operations
    ['file', ['file', 'files', 'document', 'documents', 'upload', 'download', 'storage', 'save', 'read', 'write', 'manage documents', 'file storage']],
    ['file_storage', ['file', 'files', 'document', 'documents', 'upload', 'download', 'storage', 'save', 'read', 'write', 'manage documents', 'file storage']],
    
    // Email operations  
    ['email', ['email', 'mail', 'send', 'inbox', 'compose', 'message', 'automation', 'workflow automation', 'email integration', 'automated messaging', 'email automation', 'manage emails']],
    
    // Calendar operations
    ['calendar', ['calendar', 'schedule', 'meeting', 'appointment', 'event', 'book', 'manage calendar', 'organize', 'book appointment']],
    
    // Database operations
    ['database', ['database', 'data', 'query', 'sql', 'search', 'find', 'store']],
      // AI operations
    ['ai', ['ai', 'artificial intelligence', 'llm', 'completion', 'generate', 'analyze', 'intelligence', 'machine learning', 'natural language processing', 'chatbot', 'assistance']],
    
    // Development tools
    ['development', ['code', 'git', 'repo', 'repository', 'deploy', 'build', 'ci', 'cd']],
    
    // Communication
    ['communication', ['chat', 'message', 'talk', 'discuss', 'communicate', 'slack', 'teams']],    // Productivity
    ['productivity', ['task', 'project', 'organize', 'manage', 'workflow', 'todo', 'management', 'productivity', 'work', 'business', 'processes', 'streamline', 'improve', 'tools']],
    ['task_management', ['task', 'tasks', 'todo', 'management', 'organize', 'work', 'workflow', 'productivity tools']],
    ['project_management', ['project', 'projects', 'management', 'collaboration', 'team']],
    
    // API operations
    ['api', ['api', 'rest', 'http', 'request', 'call', 'endpoint']],
    
    // Analytics
    ['analytics', ['analytics', 'track', 'metrics', 'data', 'insights', 'statistics']],
    
    // Automation
    ['automation', ['automation', 'automate', 'workflow', 'integration', 'automated']],
    
    // Customer Support
    ['customer_support', ['support', 'help', 'customer', 'service', 'assist', 'experience', 'enhance']]
  ]);

  constructor() {
    // Simple constructor - no complex initialization needed
  }

  /**
   * Convert user query to capabilities using simple keyword matching
   */
  async intentToCapabilities(intent: string): Promise<string[]> {
    if (!intent || !intent.trim()) {
      return [];
    }

    const normalizedIntent = intent.toLowerCase().trim();
    const matchedCapabilities = new Set<string>();

    // Check each capability's keywords
    for (const [capability, keywords] of this.capabilityKeywords.entries()) {
      for (const keyword of keywords) {
        if (normalizedIntent.includes(keyword.toLowerCase())) {
          matchedCapabilities.add(capability);
          break; // Found a match for this capability, move to next
        }
      }
    }

    return Array.from(matchedCapabilities);
  }

  /**
   * Get similar intents by returning all keywords from matched capabilities
   */
  async getSimilarIntents(intent: string): Promise<string[]> {
    const capabilities = await this.intentToCapabilities(intent);
    const suggestions = new Set<string>();
    
    // Add all keywords from matched capabilities, excluding the original intent
    for (const capability of capabilities) {
      const keywords = this.capabilityKeywords.get(capability) || [];
      for (const keyword of keywords) {
        if (keyword.toLowerCase() !== intent.toLowerCase().trim()) {
          suggestions.add(keyword);
        }
      }
    }

    return Array.from(suggestions);
  }
}

/**
 * Enhanced Intent Service with additional features
 * Uses the same simple keyword matching but provides more analysis
 */
export class EnhancedIntentService extends IntentService {
  /**
   * Process complex natural language queries
   */
  async processNaturalLanguageQuery(query: string): Promise<{
    capabilities: string[];
    similarTo?: string;
    constraints: any;
    intent: string;
    confidence: number;
  }> {
    const capabilities = await this.intentToCapabilities(query);
    
    return {
      capabilities,
      intent: query,
      confidence: capabilities.length > 0 ? 0.8 : 0.3,
      constraints: this.extractConstraints(query)
    };
  }

  /**
   * Extract simple constraints from the query
   */
  private extractConstraints(query: string): any {
    const constraints: any = {};
    const lowerQuery = query.toLowerCase();
    
    // Simple constraint extraction
    if (lowerQuery.includes('free')) constraints.pricing = 'free';
    if (lowerQuery.includes('open source')) constraints.type = 'open_source';
    if (lowerQuery.includes('secure') || lowerQuery.includes('private')) constraints.security = 'high';
    
    return constraints;
  }

  /**
   * Enhanced similar intents with better suggestions
   */
  async getSimilarIntents(intent: string): Promise<string[]> {
    const basicSimilar = await super.getSimilarIntents(intent);
    
    // Add some enhanced suggestions based on common patterns
    const enhanced = new Set(basicSimilar);
    
    const lowerIntent = intent.toLowerCase();
    if (lowerIntent.includes('automat')) {
      enhanced.add('workflow automation');
      enhanced.add('email integration');
      enhanced.add('automated messaging');
    }
    
    return Array.from(enhanced);
  }
}
