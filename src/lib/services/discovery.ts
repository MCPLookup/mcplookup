// Discovery Service - Core discovery logic with semantic intent matching
// NO SQL - Uses external APIs and in-memory processing

import { DiscoveryRequest, DiscoveryResponse, MCPServerRecord, CapabilityCategory } from '../schemas/discovery';

export interface IDiscoveryService {
  discoverServers(request: DiscoveryRequest): Promise<DiscoveryResponse>;
  discoverByDomain(domain: string): Promise<MCPServerRecord | null>;
  discoverByIntent(intent: string): Promise<MCPServerRecord[]>;
  discoverByCapability(capability: string): Promise<MCPServerRecord[]>;
}

/**
 * Main Discovery Service Implementation
 * Pluggable, serverless-ready, no SQL dependencies
 */
export class DiscoveryService implements IDiscoveryService {
  private registryService: IRegistryService;
  private healthService: IHealthService;
  private intentService: IIntentService;

  constructor(
    registryService: IRegistryService,
    healthService: IHealthService,
    intentService: IIntentService
  ) {
    this.registryService = registryService;
    this.healthService = healthService;
    this.intentService = intentService;
  }

  /**
   * Main discovery method - handles all discovery patterns
   */
  async discoverServers(request: DiscoveryRequest): Promise<DiscoveryResponse> {
    const startTime = Date.now();
    const filtersApplied: string[] = [];

    try {
      // Get base server list
      let servers = await this.getBaseServerList(request, filtersApplied);

      // Apply semantic filters
      servers = await this.applySemanticFilters(servers, request, filtersApplied);

      // Apply technical filters
      servers = this.applyTechnicalFilters(servers, request, filtersApplied);

      // Apply health filters if requested
      if (request.include?.health_metrics) {
        servers = await this.applyHealthFilters(servers, request, filtersApplied);
      }

      // Sort results
      servers = this.sortResults(servers, request.sort_by || 'relevance');

      // Apply pagination
      const totalCount = servers.length;
      const offset = request.offset || 0;
      const limit = request.limit || 10;
      const paginatedServers = servers.slice(offset, offset + limit);

      // Enhance results with real-time data if requested
      const enhancedServers = await this.enhanceResults(paginatedServers, request);

      const queryTime = Date.now() - startTime;

      return {
        servers: enhancedServers,
        pagination: {
          total_count: totalCount,
          returned_count: enhancedServers.length,
          offset,
          has_more: offset + limit < totalCount
        },
        query_metadata: {
          query_time_ms: queryTime,
          cache_hit: false, // TODO: Implement caching
          filters_applied: filtersApplied
        },
        suggestions: totalCount === 0 ? await this.generateSuggestions(request) : undefined
      };

    } catch (error) {
      throw new Error(`Discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Direct domain lookup
   */
  async discoverByDomain(domain: string): Promise<MCPServerRecord | null> {
    const servers = await this.registryService.getServersByDomain(domain);
    return servers.length > 0 ? servers[0] : null;
  }

  /**
   * Intent-based discovery using enhanced NLP matching
   */
  async discoverByIntent(intent: string): Promise<MCPServerRecord[]> {
    // Use enhanced intent service if available
    if (this.intentService instanceof (await import('./intent')).EnhancedIntentService) {
      return await this.discoverByEnhancedIntent(intent);
    }

    // Fallback to basic intent matching
    const capabilities = await this.intentService.intentToCapabilities(intent);
    const servers: MCPServerRecord[] = [];

    for (const capability of capabilities) {
      const capabilityServers = await this.discoverByCapability(capability);
      servers.push(...capabilityServers);
    }

    return this.deduplicateServers(servers);
  }

  /**
   * Enhanced intent-based discovery with full NLP support
   */
  private async discoverByEnhancedIntent(intent: string): Promise<MCPServerRecord[]> {
    const enhancedService = this.intentService as any; // Type assertion for enhanced methods
    const analysis = await enhancedService.processNaturalLanguageQuery(intent);

    let servers: MCPServerRecord[] = [];

    // If similarity search is requested
    if (analysis.similarTo) {
      const referenceServers = await this.registryService.getServersByDomain(analysis.similarTo);
      if (referenceServers.length > 0) {
        // Find servers with similar capabilities
        const referenceCapabilities = referenceServers[0].capabilities;
        servers = await this.findSimilarServers(referenceCapabilities, analysis.similarTo);
      }
    }

    // Add capability-based results
    if (analysis.capabilities.length > 0) {
      for (const capability of analysis.capabilities) {
        const capabilityServers = await this.discoverByCapability(capability);
        servers.push(...capabilityServers);
      }
    }

    // Apply constraints from NLP analysis
    if (analysis.constraints) {
      servers = this.applyNLPConstraints(servers, analysis.constraints);
    }

    return this.deduplicateServers(servers);
  }

  /**
   * Find servers similar to a reference based on capabilities
   */
  private async findSimilarServers(referenceCapabilities: any, excludeDomain?: string): Promise<MCPServerRecord[]> {
    const allServers = await this.registryService.getAllVerifiedServers();
    const similarServers: Array<{ server: MCPServerRecord; similarity: number }> = [];

    for (const server of allServers) {
      if (excludeDomain && server.domain === excludeDomain) continue;

      const similarity = this.calculateCapabilitySimilarity(
        referenceCapabilities,
        server.capabilities
      );

      if (similarity > 0.3) { // Minimum similarity threshold
        similarServers.push({ server, similarity });
      }
    }

    // Sort by similarity and return top matches
    return similarServers
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map(item => item.server);
  }

  /**
   * Calculate similarity between capability sets
   */
  private calculateCapabilitySimilarity(caps1: any, caps2: any): number {
    const set1 = new Set(caps1.subcategories || []);
    const set2 = new Set(caps2.subcategories || []);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size; // Jaccard similarity
  }

  /**
   * Apply constraints extracted from natural language
   */
  private applyNLPConstraints(servers: MCPServerRecord[], constraints: any): MCPServerRecord[] {
    let filtered = servers;

    // Performance constraints
    if (constraints.performance) {
      const perf = constraints.performance;
      filtered = filtered.filter(server => {
        if (perf.max_response_time && server.health?.response_time_ms && server.health.response_time_ms > perf.max_response_time) return false;
        if (perf.min_uptime && server.health?.uptime_percentage && server.health.uptime_percentage < perf.min_uptime) return false;
        if (perf.min_trust_score && server.trust_score && server.trust_score < perf.min_trust_score) return false;
        return true;
      });
    }

    // Technical constraints
    if (constraints.technical) {
      const tech = constraints.technical;
      filtered = filtered.filter(server => {
        if (tech.auth_types && !tech.auth_types.includes(server.auth?.type)) return false;
        if (tech.cors_support && !server.cors_enabled) return false;
        return true;
      });
    }

    return filtered;
  }

  /**
   * Capability-based discovery
   */
  async discoverByCapability(capability: string): Promise<MCPServerRecord[]> {
    return await this.registryService.getServersByCapability(capability);
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private async getBaseServerList(request: DiscoveryRequest, filtersApplied: string[]): Promise<MCPServerRecord[]> {
    // Priority-based selection of base query
    if (request.domain) {
      filtersApplied.push('domain_exact');
      return await this.registryService.getServersByDomain(request.domain.value);
    }

    if (request.capabilities) {
      filtersApplied.push('capability_exact');
      // Use the first capability for now - could be enhanced to handle complex queries
      const firstCapability = request.capabilities.capabilities[0]?.value;
      if (firstCapability) {
        return await this.registryService.getServersByCapability(firstCapability);
      }
    }

    if (request.categories && request.categories.length > 0) {
      filtersApplied.push('category_filter');
      return await this.registryService.getServersByCategory(request.categories[0]);
    }

    if (request.intent) {
      filtersApplied.push('intent_matching');
      return await this.discoverByIntent(request.intent);
    }

    if (request.keywords && request.keywords.length > 0) {
      filtersApplied.push('keyword_search');
      const keywordValues = request.keywords.map(k => k.value);
      return await this.registryService.searchServers(keywordValues);
    }

    // No specific filters - return all verified servers
    filtersApplied.push('all_verified');
    return await this.registryService.getAllVerifiedServers();
  }

  private async applySemanticFilters(
    servers: MCPServerRecord[], 
    request: DiscoveryRequest, 
    filtersApplied: string[]
  ): Promise<MCPServerRecord[]> {
    let filtered = servers;

    if (request.use_cases && request.use_cases.length > 0) {
      filtersApplied.push('use_case_match');
      filtered = filtered.filter(server =>
        request.use_cases!.some(requestUseCase =>
          server.capabilities.use_cases.some(useCase =>
            useCase.toLowerCase().includes(requestUseCase.toLowerCase())
          )
        )
      );
    }

    return filtered;
  }

  private applyTechnicalFilters(
    servers: MCPServerRecord[], 
    request: DiscoveryRequest, 
    filtersApplied: string[]
  ): MCPServerRecord[] {
    let filtered = servers;

    if (request.technical?.auth_types && request.technical.auth_types.length > 0) {
      filtersApplied.push('auth_type_filter');
      filtered = filtered.filter(server =>
        request.technical!.auth_types!.includes(server.auth?.type)
      );
    }

    if (request.technical?.transport) {
      filtersApplied.push('transport_filter');
      filtered = filtered.filter(server => server.transport === request.technical!.transport);
    }

    if (request.technical?.cors_support) {
      filtersApplied.push('cors_required');
      filtered = filtered.filter(server => server.cors_enabled);
    }

    return filtered;
  }

  private async applyHealthFilters(
    servers: MCPServerRecord[], 
    request: DiscoveryRequest, 
    filtersApplied: string[]
  ): Promise<MCPServerRecord[]> {
    let filtered = servers;

    if (request.performance?.min_uptime !== undefined) {
      filtersApplied.push('min_uptime_filter');
      filtered = filtered.filter(server =>
        server.health?.uptime_percentage && server.health.uptime_percentage >= request.performance!.min_uptime!
      );
    }

    if (request.performance?.max_response_time !== undefined) {
      filtersApplied.push('max_response_time_filter');
      filtered = filtered.filter(server =>
        server.health?.avg_response_time_ms && server.health.avg_response_time_ms <= request.performance!.max_response_time!
      );
    }

    // Filter out unhealthy servers by default
    filtersApplied.push('health_status_filter');
    filtered = filtered.filter(server =>
      server.health?.status !== 'unhealthy'
    );

    return filtered;
  }

  private sortResults(servers: MCPServerRecord[], sortBy: string): MCPServerRecord[] {
    switch (sortBy) {
      case 'uptime':
        return servers.sort((a, b) => (b.health?.uptime_percentage || 0) - (a.health?.uptime_percentage || 0));

      case 'response_time':
        return servers.sort((a, b) => (a.health?.avg_response_time_ms || 0) - (b.health?.avg_response_time_ms || 0));
      
      case 'created_at':
        return servers.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      
      case 'relevance':
      default:
        // TODO: Implement proper relevance scoring
        return servers.sort((a, b) => {
          // Simple relevance: verified > unverified, healthy > unhealthy
          const aScore = (a.verification?.dns_verified ? 2 : 0) +
                        (a.health?.status === 'healthy' ? 1 : 0);
          const bScore = (b.verification?.dns_verified ? 2 : 0) +
                        (b.health?.status === 'healthy' ? 1 : 0);
          return bScore - aScore;
        });
    }
  }

  private async enhanceResults(servers: MCPServerRecord[], request: DiscoveryRequest): Promise<MCPServerRecord[]> {
    // For now, just return servers as-is
    // Real-time health enhancement could be added later
    return servers;
  }

  private deduplicateServers(servers: MCPServerRecord[]): MCPServerRecord[] {
    const seen = new Set<string>();
    return servers.filter(server => {
      if (seen.has(server.domain)) {
        return false;
      }
      seen.add(server.domain);
      return true;
    });
  }

  private async generateSuggestions(request: DiscoveryRequest): Promise<string[]> {
    const suggestions: string[] = [];

    if (request.intent) {
      // Suggest related intents
      const relatedIntents = await this.intentService.getSimilarIntents(request.intent);
      suggestions.push(...relatedIntents.map(intent => `Try: "${intent}"`));
    }

    if (request.capabilities?.capabilities && request.capabilities.capabilities.length > 0) {
      // Suggest related capabilities
      const firstCapability = request.capabilities.capabilities[0].value;
      const relatedCapabilities = await this.registryService.getRelatedCapabilities(firstCapability);
      suggestions.push(...relatedCapabilities.map(cap => `Try capability: "${cap}"`));
    }

    if (request.categories && request.categories.length > 0) {
      // Suggest other categories
      suggestions.push("Try other categories: communication, productivity, data");
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }
}

// ============================================================================
// SERVICE INTERFACES (Pluggable Architecture)
// ============================================================================

export interface IRegistryService {
  getServersByDomain(domain: string): Promise<MCPServerRecord[]>;
  getServersByCapability(capability: string): Promise<MCPServerRecord[]>;
  getServersByCategory(category: CapabilityCategory): Promise<MCPServerRecord[]>;
  searchServers(keywords: string[]): Promise<MCPServerRecord[]>;
  getAllVerifiedServers(): Promise<MCPServerRecord[]>;
  getRelatedCapabilities(capability: string): Promise<string[]>;
}

export interface IHealthService {
  checkServerHealth(endpoint: string): Promise<import('../schemas/discovery').HealthMetrics>;
  batchHealthCheck(endpoints: string[]): Promise<Map<string, import('../schemas/discovery').HealthMetrics>>;
}

export interface IIntentService {
  intentToCapabilities(intent: string): Promise<string[]>;
  getSimilarIntents(intent: string): Promise<string[]>;
}
