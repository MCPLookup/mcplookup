// Intent Service - NLP-based Intent to Capability Matching
// Serverless-ready, no external AI APIs required

import { IIntentService } from './discovery.js';

/**
 * Intent Service Implementation
 * Maps natural language intents to MCP capabilities
 * Uses rule-based matching for serverless deployment
 */
export class IntentService implements IIntentService {
  private intentPatterns: Map<string, string[]> = new Map();
  private capabilityAliases: Map<string, string[]> = new Map();

  constructor() {
    this.initializeIntentPatterns();
    this.initializeCapabilityAliases();
  }

  /**
   * Convert natural language intent to capabilities
   */
  async intentToCapabilities(intent: string): Promise<string[]> {
    const normalizedIntent = this.normalizeIntent(intent);
    const capabilities = new Set<string>();

    // Direct pattern matching
    for (const [capability, patterns] of this.intentPatterns.entries()) {
      if (patterns.some(pattern => normalizedIntent.includes(pattern))) {
        capabilities.add(capability);
        
        // Add related capabilities
        const aliases = this.capabilityAliases.get(capability) || [];
        aliases.forEach(alias => capabilities.add(alias));
      }
    }

    // Keyword-based fallback
    if (capabilities.size === 0) {
      const keywordCapabilities = this.extractCapabilitiesFromKeywords(normalizedIntent);
      keywordCapabilities.forEach(cap => capabilities.add(cap));
    }

    return Array.from(capabilities);
  }

  /**
   * Get similar intents for suggestion
   */
  async getSimilarIntents(intent: string): Promise<string[]> {
    const normalizedIntent = this.normalizeIntent(intent);
    const suggestions: string[] = [];

    // Find similar patterns
    for (const [capability, patterns] of this.intentPatterns.entries()) {
      for (const pattern of patterns) {
        if (this.calculateSimilarity(normalizedIntent, pattern) > 0.6) {
          suggestions.push(this.generateIntentSuggestion(capability, pattern));
        }
      }
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private normalizeIntent(intent: string): string {
    return intent
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractCapabilitiesFromKeywords(intent: string): string[] {
    const keywords = intent.split(' ');
    const capabilities: string[] = [];

    const keywordMap: Record<string, string[]> = {
      'email': ['email_send', 'email_read'],
      'mail': ['email_send', 'email_read'],
      'message': ['email_send', 'messaging'],
      'calendar': ['calendar_create', 'calendar_read'],
      'schedule': ['calendar_create', 'scheduling'],
      'file': ['file_read', 'file_write'],
      'document': ['file_read', 'file_write'],
      'database': ['db_query', 'db_write'],
      'data': ['db_query', 'data_analysis'],
      'api': ['rest_api', 'http_request'],
      'github': ['repo_create', 'issue_create'],
      'git': ['repo_create', 'version_control'],
      'payment': ['payment_processing', 'billing'],
      'analytics': ['analytics', 'tracking'],
      'social': ['social_media', 'posting'],
      'ai': ['llm', 'completion'],
      'chat': ['chat', 'messaging']
    };

    keywords.forEach(keyword => {
      const caps = keywordMap[keyword];
      if (caps) {
        capabilities.push(...caps);
      }
    });

    return capabilities;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }

  private generateIntentSuggestion(capability: string, pattern: string): string {
    const suggestions: Record<string, string> = {
      'email_send': 'Send an email',
      'email_read': 'Read my emails',
      'calendar_create': 'Create a calendar event',
      'file_read': 'Read a file',
      'db_query': 'Query the database',
      'rest_api': 'Make an API call',
      'repo_create': 'Create a repository'
    };

    return suggestions[capability] || `Use ${capability}`;
  }

  private initializeIntentPatterns(): void {
    this.intentPatterns.set('email_send', [
      'send email', 'send mail', 'compose email', 'write email',
      'email someone', 'send message', 'mail to', 'compose mail'
    ]);

    this.intentPatterns.set('email_read', [
      'read email', 'check email', 'read mail', 'check mail',
      'inbox', 'read messages', 'check messages', 'view emails'
    ]);

    this.intentPatterns.set('calendar_create', [
      'create event', 'schedule meeting', 'add calendar', 'book appointment',
      'create appointment', 'schedule event', 'add meeting', 'calendar entry',
      'manage calendar', 'calendar management', 'organize calendar'
    ]);

    this.intentPatterns.set('calendar_read', [
      'check calendar', 'view calendar', 'see schedule', 'check schedule',
      'calendar events', 'upcoming meetings', 'my schedule',
      'manage calendar', 'calendar management'
    ]);

    this.intentPatterns.set('file_read', [
      'read file', 'open file', 'view file', 'get file',
      'download file', 'access file', 'file content'
    ]);

    this.intentPatterns.set('file_write', [
      'write file', 'save file', 'create file', 'upload file',
      'store file', 'edit file', 'modify file'
    ]);

    this.intentPatterns.set('db_query', [
      'query database', 'search database', 'find data', 'get data',
      'database search', 'sql query', 'data lookup'
    ]);

    this.intentPatterns.set('db_write', [
      'insert data', 'update database', 'save data', 'store data',
      'database insert', 'database update', 'write database'
    ]);

    this.intentPatterns.set('rest_api', [
      'api call', 'http request', 'rest call', 'web request',
      'api request', 'call api', 'fetch data'
    ]);

    this.intentPatterns.set('repo_create', [
      'create repository', 'new repo', 'create repo', 'github repo',
      'git repository', 'new project', 'create project'
    ]);

    this.intentPatterns.set('issue_create', [
      'create issue', 'new issue', 'report bug', 'github issue',
      'create ticket', 'bug report', 'feature request'
    ]);

    this.intentPatterns.set('payment_processing', [
      'process payment', 'charge card', 'payment', 'billing',
      'stripe payment', 'paypal payment', 'checkout'
    ]);

    this.intentPatterns.set('analytics', [
      'track event', 'analytics', 'metrics', 'tracking',
      'google analytics', 'page view', 'user tracking'
    ]);

    this.intentPatterns.set('social_media', [
      'post tweet', 'social media', 'twitter post', 'linkedin post',
      'facebook post', 'social post', 'share content'
    ]);

    this.intentPatterns.set('llm', [
      'ai completion', 'generate text', 'ai chat', 'openai',
      'gpt', 'language model', 'ai response'
    ]);
  }

  private initializeCapabilityAliases(): void {
    this.capabilityAliases.set('email_send', ['email_compose', 'messaging']);
    this.capabilityAliases.set('email_read', ['email_search', 'inbox_read']);
    this.capabilityAliases.set('calendar_create', ['scheduling', 'event_create']);
    this.capabilityAliases.set('calendar_read', ['schedule_read', 'event_read']);
    this.capabilityAliases.set('file_read', ['file_download', 'file_access']);
    this.capabilityAliases.set('file_write', ['file_upload', 'file_save']);
    this.capabilityAliases.set('db_query', ['data_read', 'sql_select']);
    this.capabilityAliases.set('db_write', ['data_write', 'sql_insert']);
    this.capabilityAliases.set('rest_api', ['http_request', 'web_api']);
    this.capabilityAliases.set('repo_create', ['git_init', 'project_create']);
    this.capabilityAliases.set('issue_create', ['ticket_create', 'bug_report']);
    this.capabilityAliases.set('payment_processing', ['billing', 'checkout']);
    this.capabilityAliases.set('analytics', ['tracking', 'metrics']);
    this.capabilityAliases.set('social_media', ['social_post', 'content_share']);
    this.capabilityAliases.set('llm', ['ai_completion', 'text_generation']);
  }
}

/**
 * Enhanced Intent Service with Real NLP Support
 * Supports complex natural language queries with semantic understanding
 */
export class EnhancedIntentService extends IntentService {
  private smartAI?: import('./ai/index.js').SmartProvider;
  private readonly USE_EXTERNAL_AI = this.hasAnyAIProvider();

  private hasAnyAIProvider(): boolean {
    return !!(process.env.TOGETHER_API_KEY || process.env.OPENROUTER_API_KEY);
  }

  private async getSmartAI(): Promise<import('./ai/index.js').SmartProvider> {
    if (!this.smartAI) {
      const { SmartProvider } = await import('./ai/index.js');
      this.smartAI = new SmartProvider();
    }
    return this.smartAI;
  }

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
    if (this.USE_EXTERNAL_AI) {
      return await this.aiBasedQueryProcessing(query);
    }

    return await this.ruleBasedQueryProcessing(query);
  }

  async intentToCapabilities(intent: string): Promise<string[]> {
    const result = await this.processNaturalLanguageQuery(intent);
    return result.capabilities;
  }

  /**
   * AI-powered query processing using smart provider cycling
   */
  private async aiBasedQueryProcessing(query: string): Promise<any> {
    try {
      const smartAI = await this.getSmartAI();
      const response = await smartAI.processQuery(query);

      console.log(`AI Success: ${response.provider}/${response.model} (${response.cost ? `$${response.cost}` : 'FREE'})`);

      return {
        capabilities: response.capabilities,
        similarTo: response.similarTo,
        constraints: response.constraints,
        intent: response.intent,
        confidence: response.confidence
      };
    } catch (error) {
      console.warn('Smart AI processing failed, falling back to rule-based:', error);
      return await this.ruleBasedQueryProcessing(query);
    }
  }

  // Old individual provider methods removed - now handled by SmartAIProvider

  /**
   * Enhanced rule-based processing for complex queries
   */
  private async ruleBasedQueryProcessing(query: string): Promise<any> {
    const normalizedQuery = this.normalizeIntent(query);
    const capabilities = new Set<string>();
    let similarTo: string | undefined;
    const constraints: any = {};

    // Extract similarity references
    const similarityPatterns = [
      /like\s+(\w+(?:\.\w+)*)/gi,
      /similar\s+to\s+(\w+(?:\.\w+)*)/gi,
      /alternatives?\s+to\s+(\w+(?:\.\w+)*)/gi,
      /instead\s+of\s+(\w+(?:\.\w+)*)/gi
    ];

    for (const pattern of similarityPatterns) {
      const matches = normalizedQuery.match(pattern);
      if (matches) {
        const domain = matches[0].replace(/^(like|similar to|alternative to|instead of)\s+/i, '');
        if (domain.includes('.') || this.isKnownService(domain)) {
          similarTo = domain.includes('.') ? domain : `${domain}.com`;
          break;
        }
      }
    }

    // Extract performance constraints
    if (normalizedQuery.includes('faster') || normalizedQuery.includes('speed')) {
      constraints.performance = { max_response_time: 100 };
    }
    if (normalizedQuery.includes('reliable') || normalizedQuery.includes('uptime')) {
      constraints.performance = { ...constraints.performance, min_uptime: 99 };
    }
    if (normalizedQuery.includes('secure') || normalizedQuery.includes('privacy')) {
      constraints.performance = { ...constraints.performance, min_trust_score: 80 };
    }

    // Extract technical requirements
    if (normalizedQuery.includes('oauth') || normalizedQuery.includes('sso')) {
      constraints.technical = { auth_types: ['oauth2'] };
    }
    if (normalizedQuery.includes('api') || normalizedQuery.includes('integration')) {
      constraints.technical = { ...constraints.technical, cors_support: true };
    }

    // Extract capabilities using enhanced patterns
    const enhancedCapabilities = await this.extractEnhancedCapabilities(normalizedQuery);
    enhancedCapabilities.forEach(cap => capabilities.add(cap));

    // Fallback to basic pattern matching
    if (capabilities.size === 0) {
      const basicCapabilities = await super.intentToCapabilities(query);
      basicCapabilities.forEach(cap => capabilities.add(cap));
    }

    return {
      capabilities: Array.from(capabilities),
      similarTo,
      constraints,
      intent: query,
      confidence: capabilities.size > 0 ? 0.7 : 0.3
    };
  }

  /**
   * Enhanced capability extraction with context understanding
   */
  private async extractEnhancedCapabilities(query: string): Promise<string[]> {
    const capabilities = new Set<string>();

    // Domain-specific patterns
    const domainPatterns = {
      email: /email|mail|inbox|compose|send.*message/gi,
      calendar: /calendar|schedule|meeting|appointment|event/gi,
      files: /file|document|storage|upload|download|share/gi,
      collaboration: /collaborate|team|share|work.*together|real.*time/gi,
      communication: /chat|message|talk|communicate|discuss/gi,
      development: /code|repo|git|deploy|ci|cd|development/gi,
      analytics: /analytics|track|metrics|data|insights/gi,
      social: /social|post|tweet|share.*content/gi,
      productivity: /productive|organize|manage|workflow/gi,
      security: /secure|encrypt|privacy|auth|login/gi
    };

    for (const [domain, pattern] of Object.entries(domainPatterns)) {
      if (pattern.test(query)) {
        const domainCapabilities = this.getDomainCapabilities(domain);
        domainCapabilities.forEach(cap => capabilities.add(cap));
      }
    }

    return Array.from(capabilities);
  }

  private getDomainCapabilities(domain: string): string[] {
    const domainMap: Record<string, string[]> = {
      email: ['email_send', 'email_read', 'email_search'],
      calendar: ['calendar_create', 'calendar_read', 'scheduling'],
      files: ['file_read', 'file_write', 'file_storage', 'file_share'],
      collaboration: ['real_time_editing', 'document_sharing', 'team_collaboration'],
      communication: ['messaging', 'chat', 'video_calls'],
      development: ['repo_create', 'ci_cd', 'deployment', 'code_review'],
      analytics: ['analytics', 'tracking', 'metrics', 'reporting'],
      social: ['social_media', 'content_posting', 'social_sharing'],
      productivity: ['task_management', 'project_management', 'workflow'],
      security: ['authentication', 'encryption', 'access_control']
    };

    return domainMap[domain] || [];
  }

  private isKnownService(service: string): boolean {
    const knownServices = [
      'gmail', 'outlook', 'slack', 'discord', 'teams', 'zoom',
      'github', 'gitlab', 'bitbucket', 'jira', 'trello', 'asana',
      'dropbox', 'gdrive', 'onedrive', 'notion', 'confluence',
      'stripe', 'paypal', 'shopify', 'salesforce', 'hubspot'
    ];
    return knownServices.includes(service.toLowerCase());
  }

  // Schema and prompt builders moved to SmartAIProvider
}

/**
 * Factory function to create appropriate intent service
 */
export function createIntentService(enhanced: boolean = false): IIntentService {
  return enhanced ? new EnhancedIntentService() : new IntentService();
}
