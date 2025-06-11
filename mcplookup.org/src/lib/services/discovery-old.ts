// @ts-nocheck
// Discovery Service - GitHub-search-driven discovery with Redis caching
// UPDATED: Now uses SDK types exclusively - no more transformations!

import { 
  MCPServer,
  GitHubRepoWithInstallation,
  transformGitHubRepoToMCPServer
} from '@mcplookup-org/mcp-sdk';

// Use SDK types everywhere - no more custom types!
type MCPServerRecord = MCPServer; // Alias for compatibility
type CapabilityCategory = string; // Simplified for now

// Response types
interface DiscoveryResponse {
  servers: MCPServer[];
  total: number;
  query_analysis: any;
  response_time_ms: number;
  filters_applied: string[];
  caching: {
    cache_hit: boolean;
    cache_age_ms?: number;
  };
  source: string;
  pagination?: {
    offset: number;
    limit: number;
    has_more: boolean;
  };
}

interface DiscoveryRequest {
  q?: string;
  query?: string; 
  category?: string[];
  installation_method?: string[];
  quality_filter?: {
    min_stars?: number;
    min_quality_score?: number;
    verified_only?: boolean;
  };
  server_type_filter?: {
    official_only?: boolean;
    live_endpoints_only?: boolean;
  };
  claude_config_filter?: {
    claude_ready_only?: boolean;
  };
  similarity_search?: {
    enabled?: boolean;
    threshold?: number;
  };
  sorting?: {
    by?: 'relevance' | 'popularity' | 'quality' | 'newest' | 'updated' | 'name' | 'uptime';
    order?: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

interface CachedSearchResult {
  query: string;
  results: GitHubRepoWithInstallation[];
  timestamp: number;
  expiresAt: number;
}

interface DiscoveryQueueItem {
  repo: GitHubRepoWithInstallation;
  priority: number;
  addedAt: number;
}

export interface IDiscoveryService {
  discoverServers(request: any): Promise<DiscoveryResponse>;
  discoverByDomain(domain: string): Promise<MCPServerRecord | null>;
  discoverByIntent(intent: string): Promise<MCPServerRecord[]>;
  discoverByCapability(capability: string): Promise<MCPServerRecord[]>;
}

/**
 * GitHub-Search-Driven Discovery Service
 * Primary source: GitHub search with parser
 * Caching: Redis with 1-week expiration
 * Background processing: Queue for discovery and indexing
 */
export class DiscoveryService implements IDiscoveryService {
  private registryService: IRegistryService;
  private healthService: IHealthService;
  private intentService: IIntentService;
  private installationResolver: InstallationResolver;
  private apiClient: MCPLookupAPIClient;
  private githubSearchService: GitHubSearchService;
  private redisClient: any; // Redis client for caching

  // Cache configuration
  private readonly CACHE_EXPIRY_DAYS = 7;
  private readonly MIN_RESULTS_THRESHOLD = 3;
  private readonly MAX_GITHUB_RESULTS = 10;

  constructor(
    registryService: IRegistryService,
    healthService: IHealthService,
    intentService: IIntentService,
    redisClient?: any
  ) {
    this.registryService = registryService;
    this.healthService = healthService;
    this.intentService = intentService;
    this.redisClient = redisClient;

    // Initialize SDK components
    this.installationResolver = new InstallationResolver();
    this.apiClient = new MCPLookupAPIClient();
    this.githubSearchService = new GitHubSearchService();
  }

  /**
   * Main discovery method - handles all discovery patterns
   * ENHANCED: Now supports both GitHub-based and official domain-registered servers
   */
  async discoverServers(request: any): Promise<DiscoveryResponse> {
    const startTime = Date.now();
    const filtersApplied: string[] = [];

    try {
      // Step 1: Determine discovery strategy based on request
      const discoveryResults = await this.executeDiscoveryStrategy(request, filtersApplied, startTime);
      
      if (discoveryResults) {
        return discoveryResults;
      }

      // Step 2: Fallback to combined discovery (GitHub + Official)
      return await this.executeCombinedDiscovery(request, filtersApplied, startTime);

    } catch (error) {
      console.error('Discovery error:', error);
      return this.formatErrorResponse(error, startTime);
    }
  }

  /**
   * Execute the appropriate discovery strategy based on request type
   */
  private async executeDiscoveryStrategy(request: any, filtersApplied: string[], startTime: number): Promise<DiscoveryResponse | null> {
    // Official domain-only discovery
    if (request.server_type_filter?.official_only || 
        (request.server_type_filter?.include_official && !request.server_type_filter?.include_github)) {
      filtersApplied.push('official_servers_only');
      return await this.discoverOfficialServers(request, filtersApplied, startTime);
    }

    // GitHub-only discovery
    if (request.server_type_filter?.github_only || 
        (request.server_type_filter?.include_github && !request.server_type_filter?.include_official)) {
      filtersApplied.push('github_servers_only');
      return await this.discoverGitHubServers(request, filtersApplied, startTime);
    }

    // Direct domain lookup (check both types)
    if (request.domain) {
      filtersApplied.push('domain_lookup');
      return await this.discoverByDomainWithType(request.domain, request, filtersApplied, startTime);
    }

    return null; // Continue to combined discovery
  }

  /**
   * Combined discovery for both GitHub and official servers
   */
  private async executeCombinedDiscovery(request: any, filtersApplied: string[], startTime: number): Promise<DiscoveryResponse> {
    const allServers: MCPServerRecord[] = [];

    // Discover official servers (always first - higher priority)
    if (!request.server_type_filter || request.server_type_filter.include_official !== false) {
      filtersApplied.push('official_discovery');
      const officialServers = await this.loadOfficialServers(request, filtersApplied);
      allServers.push(...officialServers);
    }

    // Discover GitHub servers if needed
    if (!request.server_type_filter || request.server_type_filter.include_github !== false) {
      filtersApplied.push('github_discovery');
      const githubServers = await this.loadGitHubServers(request, filtersApplied);
      allServers.push(...githubServers);
    }

    // Apply filtering and return results
    const filteredServers = await this.applyAllFilters(allServers, request, filtersApplied);
    return this.formatDiscoveryResponse(filteredServers, request, filtersApplied, startTime);
  }

  /**
   * Discover official domain-registered servers only
   */
  private async discoverOfficialServers(request: any, filtersApplied: string[], startTime: number): Promise<DiscoveryResponse> {
    const officialServers = await this.loadOfficialServers(request, filtersApplied);
    const filteredServers = await this.applyAllFilters(officialServers, request, filtersApplied);
    return this.formatDiscoveryResponse(filteredServers, request, filtersApplied, startTime);
  }

  /**
   * Discover GitHub-based servers only
   */
  private async discoverGitHubServers(request: any, filtersApplied: string[], startTime: number): Promise<DiscoveryResponse> {
    // Use existing GitHub discovery logic
    const searchQuery = this.buildGitHubSearchQuery(request);
    const cacheKey = `github_search:${Buffer.from(searchQuery).toString('base64')}`;

    // Check cache
    let githubResults = await this.getCachedGitHubResults(cacheKey);
    if (!githubResults) {
      githubResults = await this.searchGitHubAndCache(searchQuery, cacheKey);
    }

    const existingServers = await this.loadExistingServersFromRepos(githubResults);
    
    // Check if enough results, otherwise trigger indexing
    if (existingServers.length >= this.MIN_RESULTS_THRESHOLD) {
      const missingRepos = this.findMissingRepos(githubResults, existingServers);
      if (missingRepos.length > 0) {
        await this.queueReposForDiscovery(missingRepos, 'background');
      }
      
      const filteredServers = await this.applyAllFilters(existingServers, request, filtersApplied);
      return this.formatSuccessResponse(filteredServers, request, startTime, {
        cached_search: true,
        background_discovery_queued: missingRepos.length
      });
    } else {
      await this.queueReposForDiscovery(githubResults, 'priority');
      return this.formatIndexingResponse(existingServers, request, startTime, {
        total_repos_found: githubResults.length,
        existing_servers: existingServers.length,
        queued_for_discovery: githubResults.length
      });
    }
  }

  /**
   * Load official domain-registered servers from registry
   */
  private async loadOfficialServers(request: any, filtersApplied: string[]): Promise<MCPServerRecord[]> {
    // Get servers with domain verification
    const allServers = await this.getBaseServerList(request, filtersApplied);
    
    // Filter for official servers only
    return allServers.filter(server => {
      const isOfficial = server.server_type?.type === 'official';
      const meetsMinimumStatus = !request.server_type_filter?.minimum_official_status || 
                                server.server_type?.official_status === request.server_type_filter.minimum_official_status ||
                                this.getOfficialStatusRank(server.server_type?.official_status) >= 
                                this.getOfficialStatusRank(request.server_type_filter.minimum_official_status);
      
      const meetsDomainVerification = !request.server_type_filter?.require_domain_verification ||
                                     server.server_type?.domain_verified === true;

      return isOfficial && meetsMinimumStatus && meetsDomainVerification;
    });
  }

  /**
   * Load GitHub-based servers from registry
   */
  private async loadGitHubServers(request: any, filtersApplied: string[]): Promise<MCPServerRecord[]> {
    const allServers = await this.getBaseServerList(request, filtersApplied);
    
    // Filter for GitHub servers only
    return allServers.filter(server => {
      const isGitHub = server.server_type?.type === 'github';
      const meetsGitHubVerification = !request.server_type_filter?.require_github_verification ||
                                     server.server_type?.github_verified === true;

      return isGitHub && meetsGitHubVerification;
    });
  }

  /**
   * Discover by domain with type awareness
   */
  private async discoverByDomainWithType(domain: string, request: any, filtersApplied: string[], startTime: number): Promise<DiscoveryResponse> {
    const servers = await this.registryService.getServersByDomain(domain);
    
    if (servers.length === 0) {
      return this.formatErrorResponse(new Error(`No servers found for domain: ${domain}`), startTime);
    }

    // Apply server type filtering
    const filteredServers = this.filterByServerType(servers, request.server_type_filter);
    
    if (filteredServers.length === 0) {
      filtersApplied.push('server_type_excluded');
      return this.formatErrorResponse(new Error(`No servers of requested type found for domain: ${domain}`), startTime);
    }

    return this.formatDiscoveryResponse(filteredServers, request, filtersApplied, startTime);
  }

  /**
   * Apply server type filtering to a list of servers
   */
  private filterByServerType(servers: MCPServerRecord[], serverTypeFilter?: any): MCPServerRecord[] {
    if (!serverTypeFilter) {
      return servers; // No filtering applied
    }

    return servers.filter(server => {
      const serverType = server.server_type?.type;
      
      // Apply type inclusion filters
      if (serverTypeFilter.official_only && serverType !== 'official') {
        return false;
      }
      
      if (serverTypeFilter.github_only && serverType !== 'github') {
        return false;
      }

      if (!serverTypeFilter.include_official && serverType === 'official') {
        return false;
      }

      if (!serverTypeFilter.include_github && serverType === 'github') {
        return false;
      }

      // Apply verification requirements
      if (serverTypeFilter.require_domain_verification && !server.server_type?.domain_verified) {
        return false;
      }

      if (serverTypeFilter.require_github_verification && !server.server_type?.github_verified) {
        return false;
      }

      // Apply minimum official status
      if (serverTypeFilter.minimum_official_status && serverType === 'official') {
        const currentStatusRank = this.getOfficialStatusRank(server.server_type?.official_status);
        const minimumStatusRank = this.getOfficialStatusRank(serverTypeFilter.minimum_official_status);
        if (currentStatusRank < minimumStatusRank) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get numeric rank for official status comparison
   */
  private getOfficialStatusRank(status?: string): number {
    const ranks = {
      'unofficial': 0,
      'community': 1,
      'verified': 2,
      'enterprise': 3
    };
    return ranks[status as keyof typeof ranks] || 0;
  }

  /**
   * Apply all filters to server list
   */
  private async applyAllFilters(servers: MCPServerRecord[], request: any, filtersApplied: string[]): Promise<MCPServerRecord[]> {
    let filteredServers = servers;

    // Apply existing filters
    filteredServers = await this.applySemanticFilters(filteredServers, request, filtersApplied);
    filteredServers = this.applyTechnicalFilters(filteredServers, request, filtersApplied);
    filteredServers = this.applyAvailabilityFilters(filteredServers, request, filtersApplied);
    
    if (request.include?.health_metrics) {
      filteredServers = await this.applyHealthFilters(filteredServers, request, filtersApplied);
    }

    // Apply server type filters
    filteredServers = this.filterByServerType(filteredServers, request.server_type_filter);

    // Sort and enhance results
    filteredServers = this.sortResults(filteredServers, request.sort_by || 'relevance');
    filteredServers = await this.enhanceResults(filteredServers, request);

    return filteredServers;
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

      // Enhanced server record with SDK data (only modify existing properties)
      const enhancedServer = { ...server };

      // Update name and description if SDK provides better ones
      if (resolvedPackage.displayName || resolvedPackage.packageName) {
        enhancedServer.name = resolvedPackage.displayName || resolvedPackage.packageName || server.name;
      }
      if (resolvedPackage.description) {
        enhancedServer.description = resolvedPackage.description;
      }

      // Enhanced verification (only update existing verification object)
      if (enhancedServer.verification) {
        enhancedServer.verification = {
          endpoint_verified: server.verification?.endpoint_verified || false,
          dns_verified: resolvedPackage.verified || false,
          ssl_verified: server.verification?.ssl_verified || false,
          last_verification: server.verification?.last_verification || new Date().toISOString(),
          verification_method: server.verification?.verification_method || 'sdk_resolution',
          dns_record: server.verification?.dns_record,
          verified_at: server.verification?.verified_at
        };
      }

      // Enhanced packages with SDK-generated instructions (only if packages exist)
      if (enhancedServer.packages && enhancedServer.packages.length > 0) {
        enhancedServer.packages = server.packages?.map(pkg => ({
          ...pkg,
          // Add SDK instructions to setup_instructions if available
          setup_instructions: instructions.steps?.join('\n') || pkg.setup_instructions
        })) || [];
      }

      return enhancedServer;

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
  // GITHUB-SEARCH-DRIVEN DISCOVERY METHODS
  // ========================================================================

  /**
   * Build GitHub search query from discovery request
   */
  private buildGitHubSearchQuery(request: any): string {
    const terms: string[] = [];

    // Add query/intent terms
    if (request.query) {
      terms.push(request.query);
    }
    if (request.intent) {
      terms.push(request.intent);
    }

    // Add capability terms
    if (request.capability) {
      terms.push(request.capability);
    }

    // Add category terms
    if (request.category) {
      terms.push(request.category);
    }

    // Add keywords
    if (request.keywords && Array.isArray(request.keywords)) {
      terms.push(...request.keywords);
    }

    // Default search if no terms
    if (terms.length === 0) {
      terms.push('mcp server');
    }

    // Add MCP-specific filters
    const searchQuery = terms.join(' ') + ' mcp OR "model context protocol" OR claude';
    return searchQuery;
  }

  /**
   * Get cached GitHub search results from Redis
   */
  private async getCachedGitHubResults(cacheKey: string): Promise<GitHubRepoWithInstallation[] | null> {
    if (!this.redisClient) return null;

    try {
      const cached = await this.redisClient.get(cacheKey);
      if (!cached) return null;

      const cachedResult: CachedSearchResult = JSON.parse(cached);

      // Check if expired
      if (Date.now() > cachedResult.expiresAt) {
        await this.redisClient.del(cacheKey);
        return null;
      }

      return cachedResult.results;
    } catch (error) {
      console.warn('Failed to get cached GitHub results:', error);
      return null;
    }
  }

  /**
   * Search GitHub and cache results
   */
  private async searchGitHubAndCache(searchQuery: string, cacheKey: string): Promise<GitHubRepoWithInstallation[]> {
    try {
      // Search GitHub using the parser service
      const results = await this.githubSearchService.searchRepositories(searchQuery, {
        maxResults: this.MAX_GITHUB_RESULTS,
        includeAnalysis: true
      });

      // Cache results for 1 week
      if (this.redisClient) {
        const cacheData: CachedSearchResult = {
          query: searchQuery,
          results,
          timestamp: Date.now(),
          expiresAt: Date.now() + (this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        };

        await this.redisClient.setex(
          cacheKey,
          this.CACHE_EXPIRY_DAYS * 24 * 60 * 60,
          JSON.stringify(cacheData)
        );
      }

      return results;
    } catch (error) {
      console.error('GitHub search failed:', error);
      return [];
    }
  }

  /**
   * Load existing servers from database for GitHub repos
   */
  private async loadExistingServersFromRepos(githubResults: GitHubRepoWithInstallation[]): Promise<MCPServerRecord[]> {
    const servers: MCPServerRecord[] = [];

    for (const repo of githubResults) {
      const domain = `github.com/${repo.repository.fullName}`;
      try {
        const existingServer = await this.registryService.getServersByDomain(domain);
        if (existingServer && existingServer.length > 0) {
          // Filter for MCP servers only
          const mcpServers = existingServer.filter(server =>
            server.capabilities?.category === 'development' ||
            server.description?.toLowerCase().includes('mcp') ||
            server.name?.toLowerCase().includes('mcp')
          );
          servers.push(...mcpServers);
        }
      } catch (error) {
        console.warn(`Failed to load server for ${domain}:`, error);
      }
    }

    return servers;
  }

  /**
   * Find repos that don't have corresponding servers in database
   */
  private findMissingRepos(githubResults: GitHubRepoWithInstallation[], existingServers: MCPServerRecord[]): GitHubRepoWithInstallation[] {
    const existingDomains = new Set(existingServers.map(server => server.domain));

    return githubResults.filter(repo => {
      const domain = `github.com/${repo.repository.fullName}`;
      return !existingDomains.has(domain);
    });
  }

  /**
   * Queue repos for background discovery and processing
   */
  private async queueReposForDiscovery(repos: GitHubRepoWithInstallation[], priority: 'background' | 'priority'): Promise<void> {
    if (!this.redisClient) return;

    const queueKey = 'discovery_queue';
    const priorityScore = priority === 'priority' ? 1 : 0;

    for (const repo of repos) {
      const queueItem: DiscoveryQueueItem = {
        repo,
        priority: priorityScore,
        addedAt: Date.now()
      };

      try {
        // Add to Redis sorted set with priority score
        await this.redisClient.zadd(
          queueKey,
          priorityScore,
          JSON.stringify(queueItem)
        );
      } catch (error) {
        console.warn('Failed to queue repo for discovery:', error);
      }
    }
  }

  /**
   * Format successful response with existing servers
   */
  private formatSuccessResponse(
    servers: MCPServerRecord[],
    request: any,
    startTime: number,
    metadata: any
  ): DiscoveryResponse {
    // Apply pagination
    const offset = request.offset || 0;
    const limit = request.limit || 10;
    const paginatedServers = servers.slice(offset, offset + limit);

    return {
      servers: paginatedServers,
      pagination: {
        total_count: servers.length,
        returned_count: paginatedServers.length,
        offset: offset,
        has_more: offset + limit < servers.length
      },
      query_metadata: {
        query_time_ms: Date.now() - startTime,
        cache_hit: metadata.cached_search || false,
        filters_applied: ['github_search', 'mcp_filter'],
        ...metadata
      }
    };
  }

  /**
   * Format indexing response when not enough results are available
   */
  private formatIndexingResponse(
    existingServers: MCPServerRecord[],
    request: any,
    startTime: number,
    metadata: any
  ): DiscoveryResponse {
    return {
      servers: existingServers,
      pagination: {
        total_count: existingServers.length,
        returned_count: existingServers.length,
        offset: 0,
        has_more: false
      },
      query_metadata: {
        query_time_ms: Date.now() - startTime,
        cache_hit: false,
        filters_applied: ['github_search', 'indexing'],
        status: 'indexing',
        message: 'Currently indexing and discovering good results. Try again in 5 minutes.',
        retry_after_seconds: 300,
        ...metadata
      }
    };
  }

  /**
   * Format error response
   */
  private formatErrorResponse(error: any, startTime: number): DiscoveryResponse {
    return {
      servers: [],
      pagination: {
        total_count: 0,
        returned_count: 0,
        offset: 0,
        has_more: false
      },
      query_metadata: {
        query_time_ms: Date.now() - startTime,
        cache_hit: false,
        filters_applied: ['error'],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }

  /**
   * Transform GitHub parser result using SDK (no more duplicates!)
   */
  private transformGitHubParserResult(githubRepo: GitHubRepoWithInstallation): MCPServerRecord {
    // Use SDK transformation directly - no more duplication!
    return transformGitHubRepoToMCPServer(githubRepo);
  }

  /**
   * Map MCP classification to category
   */
  private mapMCPClassificationToCategory(classification?: string): string {
    const categoryMap: Record<string, string> = {
      'mcp_server': 'development',
      'mcp_framework': 'development',
      'mcp_sdk': 'development',
      'mcp_tool': 'productivity',
      'mcp_example': 'development',
      'mcp_template': 'development'
    };
    return categoryMap[classification || ''] || 'other';
  }

  // ========================================================================
  // BACKGROUND PROCESSING METHODS
  // ========================================================================

  /**
   * Process discovery queue - should be called by background worker
   */
  async processDiscoveryQueue(batchSize: number = 5): Promise<{ processed: number; errors: number }> {
    if (!this.redisClient) {
      throw new Error('Redis client required for queue processing');
    }

    const queueKey = 'discovery_queue';
    let processed = 0;
    let errors = 0;

    try {
      // Get highest priority items from queue
      const queueItems = await this.redisClient.zrevrange(queueKey, 0, batchSize - 1);

      for (const itemJson of queueItems) {
        try {
          const queueItem: DiscoveryQueueItem = JSON.parse(itemJson);

          // Process the repo
          await this.processRepoForDiscovery(queueItem.repo);

          // Remove from queue
          await this.redisClient.zrem(queueKey, itemJson);

          processed++;
        } catch (error) {
          console.error('Failed to process queue item:', error);
          errors++;

          // Remove failed item from queue to prevent infinite retries
          await this.redisClient.zrem(queueKey, itemJson);
        }
      }

      return { processed, errors };
    } catch (error) {
      console.error('Queue processing failed:', error);
      return { processed, errors: errors + 1 };
    }
  }

  /**
   * Process a single repo for discovery and add to database
   */
  private async processRepoForDiscovery(repo: GitHubRepoWithInstallation): Promise<void> {
    try {
      // Check if repo is actually an MCP server
      if (!this.isValidMCPServer(repo)) {
        console.log(`Skipping ${repo.repository.fullName} - not a valid MCP server`);
        return;
      }

      // Transform to MCPServerRecord
      const serverRecord = this.transformGitHubParserResult(repo);

      // Save to database via registry service
      await this.registryService.addServer(serverRecord);

      console.log(`Successfully processed and added ${repo.repository.fullName}`);
    } catch (error) {
      console.error(`Failed to process repo ${repo.repository.fullName}:`, error);
      throw error;
    }
  }

  /**
   * Validate if a GitHub repo is actually an MCP server
   */
  private isValidMCPServer(repo: GitHubRepoWithInstallation): boolean {
    const computed = repo.computed;

    // Must be identified as MCP server with reasonable confidence
    if (!computed?.isMcpServer || (computed.mcpConfidence || 0) < 0.3) {
      return false;
    }

    // Must have installation methods
    if (!repo.installationMethods || repo.installationMethods.length === 0) {
      return false;
    }

    // Must have some documentation or examples
    if (!computed.hasDocumentation && !computed.hasExamples) {
      return false;
    }

    return true;
  }

  /**
   * Get queue status for monitoring
   */
  async getQueueStatus(): Promise<{ total: number; priority: number; background: number }> {
    if (!this.redisClient) {
      return { total: 0, priority: 0, background: 0 };
    }

    try {
      const queueKey = 'discovery_queue';
      const total = await this.redisClient.zcard(queueKey);
      const priority = await this.redisClient.zcount(queueKey, 1, 1);
      const background = await this.redisClient.zcount(queueKey, 0, 0);

      return { total, priority, background };
    } catch (error) {
      console.error('Failed to get queue status:', error);
      return { total: 0, priority: 0, background: 0 };
    }
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
  addServer(server: MCPServerRecord): Promise<void>;
}

export interface IHealthService {
  checkServerHealth(endpoint: string): Promise<import('../schemas/discovery').HealthMetrics>;
  batchHealthCheck(endpoints: string[]): Promise<Map<string, import('../schemas/discovery').HealthMetrics>>;
}

export interface IIntentService {
  intentToCapabilities(intent: string): Promise<string[]>;
  getSimilarIntents(intent: string): Promise<string[]>;
}
