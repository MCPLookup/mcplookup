// Discovery Service - Core discovery logic with semantic intent matching
// ENHANCED WITH MCP SDK - Uses SDK for consistent package discovery

import { DiscoveryRequest, DiscoveryResponse, MCPServerRecord, CapabilityCategory } from '../schemas/discovery';
import { 
  InstallationResolver,
  InstallationContext,
  ResolvedPackage,
  MCPLookupAPIClient
} from '@mcplookup-org/mcp-sdk';

export interface IDiscoveryService {
  discoverServers(request: any): Promise<DiscoveryResponse>;
  discoverByDomain(domain: string): Promise<MCPServerRecord | null>;
  discoverByIntent(intent: string): Promise<MCPServerRecord[]>;
  discoverByCapability(capability: string): Promise<MCPServerRecord[]>;
}

/**
 * Main Discovery Service Implementation
 * ENHANCED WITH MCP SDK - Uses SDK for package resolution and discovery
 * Pluggable, serverless-ready, no SQL dependencies
 */
export class DiscoveryService implements IDiscoveryService {
  private registryService: IRegistryService;
  private healthService: IHealthService;
  private intentService: IIntentService;
  private installationResolver: InstallationResolver;
  private apiClient: MCPLookupAPIClient;

  constructor(
    registryService: IRegistryService,
    healthService: IHealthService,
    intentService: IIntentService
  ) {
    this.registryService = registryService;
    this.healthService = healthService;
    this.intentService = intentService;
    this.installationResolver = new InstallationResolver();
    this.apiClient = new MCPLookupAPIClient();
  }

  /**
   * Main discovery method - handles all discovery patterns
   * ENHANCED: Now integrates SDK for smart package resolution
   */
  async discoverServers(request: any): Promise<DiscoveryResponse> {
    const startTime = Date.now();
    const filtersApplied: string[] = [];

    try {
      // Validate basic parameters
      if (request.limit !== undefined && (isNaN(request.limit) || request.limit < 0)) {
        throw new Error('Invalid limit parameter');
      }
      if (request.offset !== undefined && (isNaN(request.offset) || request.offset < 0)) {
        throw new Error('Invalid offset parameter');
      }

      // ENHANCED: Try SDK-powered discovery first for natural language queries
      if (request.query || request.intent) {
        const sdkResults = await this.discoverWithSDK(request, filtersApplied);
        if (sdkResults.length > 0) {
          return this.formatDiscoveryResponse(sdkResults, request, filtersApplied, startTime);
        }
      }

      // Get base server list
      let servers = await this.getBaseServerList(request, filtersApplied);

      // Apply semantic filters
      servers = await this.applySemanticFilters(servers, request, filtersApplied);

      // Apply availability filters (FIRST-CLASS vs DEPRECATED)
      servers = this.applyAvailabilityFilters(servers, request, filtersApplied);

      // Apply technical filters
      servers = this.applyTechnicalFilters(servers, request, filtersApplied);

      // Apply health filters if requested
      if (request.min_uptime || request.max_response_time) {
        servers = await this.applyHealthFilters(servers, request, filtersApplied);
      }

      // Sort results
      servers = this.sortResults(servers, request.sort_by || 'relevance');

      return this.formatDiscoveryResponse(servers, request, filtersApplied, startTime);

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
  // SDK-ENHANCED METHODS
  // ========================================================================

  /**
   * SDK-powered discovery - combines local registry with smart package resolution
   */
  private async discoverWithSDK(request: any, filtersApplied: string[]): Promise<MCPServerRecord[]> {
    const query = request.query || request.intent;
    filtersApplied.push('sdk_enhanced_discovery');

    try {
      // Step 1: Try to resolve the query as a package using SDK
      let resolvedPackage: ResolvedPackage | null = null;
      try {
        resolvedPackage = await this.installationResolver.resolvePackage(query);
        filtersApplied.push('sdk_package_resolution');
      } catch (error) {
        // Not a direct package reference, continue with semantic search
      }

      // Step 2: Search our registry using SDK's API client
      const apiResults = await this.apiClient.searchServers({
        q: query,
        limit: request.limit || 10,
        offset: request.offset || 0,
        category: request.category,
        installation_method: request.installation_method,
        claude_ready: request.claude_ready
      });

      // Step 3: Convert API results to MCPServerRecord format
      const convertedServers = this.convertAPIResultsToMCPServerRecords(apiResults);

      // Step 4: If we have a resolved package, enhance the first matching result
      if (resolvedPackage && convertedServers.length > 0) {
        convertedServers[0] = await this.enhanceServerWithSDKData(convertedServers[0], resolvedPackage);
        filtersApplied.push('sdk_package_enhancement');
      }

      return convertedServers;

    } catch (error) {
      // Fallback to traditional discovery if SDK methods fail
      console.warn('SDK discovery failed, falling back to traditional methods:', error);
      return [];
    }
  }

  /**
   * Convert API search results to internal MCPServerRecord format
   */
  private convertAPIResultsToMCPServerRecords(apiResults: any): MCPServerRecord[] {
    if (!apiResults?.servers) return [];

    return apiResults.servers.map((server: any) => ({
      // Core identification
      name: server.name || server.title || 'Unknown',
      domain: server.domain || server.package_name || server.name,
      description: server.description || '',

      // Package information
      npm_package: server.package_name || server.npm_package,
      docker_image: server.docker_image,
      python_package: server.python_package,

      // Capabilities
      capabilities: {
        tools: server.tools || [],
        use_cases: server.use_cases || [],
        categories: server.categories || [server.category].filter(Boolean)
      },

      // Verification status
      verification: {
        dns_verified: server.verified || false,
        status: server.verified ? 'verified' : 'unverified'
      },

      // Installation
      installation: {
        methods: server.installation_methods || [],
        difficulty: server.complexity || 'medium'
      },

      // Health (placeholder - would be populated by health service)
      health: {
        status: 'unknown',
        last_checked: new Date().toISOString()
      },

      // Metadata
      created_at: server.created_at || new Date().toISOString(),
      updated_at: server.updated_at || new Date().toISOString(),
      category: server.category || 'other',
      transport: server.transport || 'stdio'
    }));
  }

  /**
   * Enhance a server record with detailed SDK package information
   */
  private async enhanceServerWithSDKData(
    server: MCPServerRecord,
    resolvedPackage: ResolvedPackage
  ): Promise<MCPServerRecord> {
    // Create installation context for generating enhanced installation info
    const context: InstallationContext = {
      mode: 'bridge',
      platform: process.platform as 'linux' | 'darwin' | 'win32',
      client: 'mcplookup-web',
      verbose: true
    };

    try {
      // Get detailed installation instructions from SDK
      const instructions = await this.installationResolver.getInstallationInstructions(
        resolvedPackage,
        context
      );

      // Enhanced server record with SDK data
      return {
        ...server,
        name: resolvedPackage.displayName || resolvedPackage.packageName || server.name,
        description: resolvedPackage.description || server.description,
        npm_package: resolvedPackage.packageName,
        
        // Enhanced verification
        verification: {
          ...server.verification,
          dns_verified: resolvedPackage.verified || false,
          status: resolvedPackage.verified ? 'verified' : 'unverified'
        },

        // Enhanced installation with SDK-generated instructions
        installation: {
          methods: instructions.steps || server.installation?.methods || [],
          difficulty: this.mapSDKComplexityToServerDifficulty(resolvedPackage),
          sdk_instructions: {
            command: instructions.command,
            args: instructions.args,
            env_vars: instructions.env_vars,
            steps: instructions.steps
          }
        },

        // Enhanced metadata
        sdk_enhanced: true,
        package_type: resolvedPackage.type,
        repository_url: resolvedPackage.repositoryUrl
      };

    } catch (error) {
      console.warn('Failed to enhance server with SDK data:', error);
      return server;
    }
  }

  /**
   * Map SDK complexity to server difficulty levels
   */
  private mapSDKComplexityToServerDifficulty(resolvedPackage: ResolvedPackage): string {
    // This would be enhanced based on SDK package analysis
    if (resolvedPackage.type === 'npm') return 'easy';
    if (resolvedPackage.type === 'docker') return 'medium';
    return 'medium';
  }

  /**
   * Format discovery response with pagination and metadata
   */
  private formatDiscoveryResponse(
    servers: MCPServerRecord[],
    request: any,
    filtersApplied: string[],
    startTime: number
  ): DiscoveryResponse {
    // Apply pagination
    const totalCount = servers.length;
    const offset = request.offset || 0;
    const limit = request.limit || 10;
    const paginatedServers = servers.slice(offset, offset + limit);

    const queryTime = Date.now() - startTime;

    return {
      servers: paginatedServers,
      pagination: {
        total_count: totalCount,
        returned_count: paginatedServers.length,
        offset: offset,
        has_more: offset + limit < totalCount
      },
      query_metadata: {
        query_time_ms: queryTime,
        cache_hit: false,
        filters_applied: filtersApplied
      }
    };
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private async getBaseServerList(request: any, filtersApplied: string[]): Promise<MCPServerRecord[]> {
    // Priority-based selection of base query

    // Handle domain lookup (simple string format for backward compatibility)
    if (request.domain) {
      filtersApplied.push('domain_exact');
      return await this.registryService.getServersByDomain(request.domain);
    }

    // Handle capabilities (simple string format for backward compatibility)
    if (request.capability) {
      filtersApplied.push('capability_exact');
      return await this.registryService.getServersByCapability(request.capability);
    }

    // Handle categories (simple string format for backward compatibility)
    if (request.category) {
      filtersApplied.push('category_filter');
      return await this.registryService.getServersByCategory(request.category);
    }

    // Handle intent-based discovery (AI-driven)
    if (request.intent) {
      filtersApplied.push('intent_matching');
      return await this.discoverByIntent(request.intent);
    }

    // Handle natural language query (AI-driven)
    if (request.query) {
      filtersApplied.push('natural_language_query');
      return await this.discoverByIntent(request.query);
    }

    // Handle keywords (simple string array format for backward compatibility)
    if (request.keywords && request.keywords.length > 0) {
      filtersApplied.push('keyword_search');
      return await this.registryService.searchServers(request.keywords);
    }

    // Handle use cases (simple string format for backward compatibility)
    if (request.use_case) {
      filtersApplied.push('use_case_search');
      return await this.registryService.searchServers([request.use_case]);
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

  private applyAvailabilityFilters(
    servers: MCPServerRecord[],
    request: DiscoveryRequest,
    filtersApplied: string[]
  ): MCPServerRecord[] {
    let filtered = servers;

    // Get availability filter settings (default to live servers only)
    const availabilityFilter = request.availability_filter || {
      include_live: true,
      include_package_only: false,
      include_deprecated: false,
      include_offline: false,
      live_servers_only: false
    };

    // If live_servers_only is true, override all other settings
    if (availabilityFilter.live_servers_only) {
      filtersApplied.push('live_servers_only');
      return filtered.filter(server =>
        server.availability?.status === 'live' &&
        server.availability?.endpoint_verified === true
      );
    }

    // Apply individual availability filters
    const allowedStatuses: string[] = [];

    if (availabilityFilter.include_live) {
      allowedStatuses.push('live');
    }
    if (availabilityFilter.include_package_only) {
      allowedStatuses.push('package_only');
    }
    if (availabilityFilter.include_deprecated) {
      allowedStatuses.push('deprecated');
    }
    if (availabilityFilter.include_offline) {
      allowedStatuses.push('offline');
    }

    // Default behavior: if no explicit inclusion, default to live servers only
    if (allowedStatuses.length === 0) {
      allowedStatuses.push('live');
      filtersApplied.push('default_live_only');
    } else {
      filtersApplied.push(`availability_filter:${allowedStatuses.join(',')}`);
    }

    filtered = filtered.filter(server => {
      const status = server.availability?.status || 'live'; // Default to live for backward compatibility
      return allowedStatuses.includes(status);
    });

    return filtered;
  }

  private async applyHealthFilters(
    servers: MCPServerRecord[],
    request: any,
    filtersApplied: string[]
  ): Promise<MCPServerRecord[]> {
    let filtered = servers;

    if (request.min_uptime !== undefined) {
      filtersApplied.push('min_uptime_filter');
      filtered = filtered.filter(server =>
        server.health?.uptime_percentage && server.health.uptime_percentage >= request.min_uptime
      );
    }

    if (request.max_response_time !== undefined) {
      filtersApplied.push('max_response_time_filter');
      filtered = filtered.filter(server =>
        server.health?.avg_response_time_ms && server.health.avg_response_time_ms <= request.max_response_time
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

  private async enhanceResults(servers: MCPServerRecord[], request: any): Promise<MCPServerRecord[]> {
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

  private async generateSuggestions(request: any): Promise<string[]> {
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
