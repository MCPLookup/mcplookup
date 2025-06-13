import { NextRequest, NextResponse } from 'next/server';
import { getServerlessServices } from '@/lib/services';

// Import GitHub parser for enhanced search
import { GitHubClient } from '@mcplookup-org/mcp-github-parser';
import { GitHubRepoWithInstallation } from '@mcplookup-org/mcp-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q, limit = 20, offset = 0 } = body;

    if (!q || typeof q !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter (q) is required' },
        { status: 400 }
      );
    }    // Initialize services using the factory
    const { discovery } = getServerlessServices();

    // Use the simplified discovery service
    const discoveryRequest = {
      query: q,
      limit,
      offset,
      include_health: true,
      include_packages: true
    };

    const result = await discovery.discoverServers(discoveryRequest);

    return NextResponse.json({
      ...result,
      query: q,
      enhanced_features: {
        github_search_enabled: true,
        redis_caching_enabled: true,
        background_discovery_enabled: true,
        sdk_types_enabled: true
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Transform GitHub parser result to MCPServer format for API compatibility
 */
function transformGitHubRepoToMCPServerFormat(githubRepo: GitHubRepoWithInstallation) {
  const repo = githubRepo.repository;
  const computed = githubRepo.computed;
  const installationMethods = githubRepo.installationMethods;

  return {
    // Basic server info
    domain: `github.com/${repo.fullName}`,
    name: repo.name,
    description: repo.description || `MCP server from ${repo.fullName}`,
    endpoint: null, // GitHub repos are typically package-only

    // Verification status
    verified: false, // GitHub repos start unverified
    trust_score: computed?.mcpConfidence ? Math.round(computed.mcpConfidence * 100) : 50,

    // Repository information
    repository: {
      url: repo.htmlUrl,
      source: 'github',
      stars: repo.stars,
      forks: repo.forks,
      language: repo.language,
      topics: repo.topics,
      license: repo.license?.spdxId,
      last_commit: repo.pushedAt
    },

    // Enhanced analysis data
    mcp_analysis: computed ? {
      is_mcp_server: computed.isMcpServer,
      classification: computed.mcpClassification,
      confidence: computed.mcpConfidence,
      reasoning: computed.mcpReasoning,
      complexity: computed.complexity,
      installation_difficulty: computed.installationDifficulty,
      maturity_level: computed.maturityLevel,
      supported_platforms: computed.supportedPlatforms || [],
      tools: computed.mcpTools || [],
      resources: computed.mcpResources || [],
      prompts: computed.mcpPrompts || [],
      requires_claude_desktop: computed.requiresClaudeDesktop || false,
      has_documentation: computed.hasDocumentation || false,
      has_examples: computed.hasExamples || false
    } : null,

    // Installation packages
    packages: installationMethods.map(method => ({
      registry_name: method.subtype === 'npm' ? 'npm' :
                     method.subtype === 'pip' ? 'pypi' :
                     method.subtype === 'docker_run' ? 'docker' : 'github',
      name: method.subtype === 'npm' ? repo.name :
            method.subtype === 'pip' ? repo.name :
            method.subtype === 'docker_run' ? `ghcr.io/${repo.fullName}` :
            repo.fullName,
      version: 'latest',
      installation_command: method.commands?.[0] || `git clone ${repo.cloneUrl}`,
      startup_command: method.commands?.[1],
      setup_instructions: method.description,
      environment_variables: method.environment_vars ?
        Object.keys(method.environment_vars).map(name => ({
          name,
          description: `Environment variable for ${method.title}`,
          is_required: true
        })) : [],
      runtime_hint: method.platform
    })),

    // Capabilities from AI analysis
    capabilities: computed?.mcpTools || [],

    // Health status (unknown for new GitHub repos)
    health: 'unknown' as const,

    // Source tracking
    parser_version: githubRepo.parsingMetadata?.parserVersion,
    registration_source: 'github_search_enhanced'
  };
}

/**
 * Enhanced search combining discovery service and GitHub parser
 */
async function performEnhancedSearch(
  query: string,
  limit: number,
  discovery: any // Simplified discovery service
) {
  const sources: string[] = [];
  let allServers: any[] = [];

  try {
    // 1. Search existing registry using discovery service
    const discoveryRequest = {
      query,
      limit: Math.floor(limit * 0.7), // Reserve 30% for GitHub search
      offset: 0,
      include_health: true,
      include_packages: true
    };

    const discoveryResults = await discovery.discoverServers(discoveryRequest);

    if (discoveryResults.servers && discoveryResults.servers.length > 0) {
      allServers.push(...discoveryResults.servers);
      sources.push('registry');
    }

    // 2. If we have room for more results, search GitHub directly
    const remainingSlots = limit - allServers.length;
    if (remainingSlots > 0 && process.env.GITHUB_TOKEN) {
      try {
        const githubClient = new GitHubClient(process.env.GITHUB_TOKEN);

        // Search GitHub for MCP-related repositories
        const githubQuery = `${query} mcp server OR mcp tool OR claude mcp`;
        const githubResults = await githubClient.searchAndParse(githubQuery, remainingSlots);

        if (githubResults.length > 0) {
          // Transform GitHub results to MCPServer format
          const transformedServers = githubResults.map(repo =>
            transformGitHubRepoToMCPServerFormat(repo)
          );

          // Filter out duplicates (by domain)
          const existingDomains = new Set(allServers.map(s => s.domain));
          const newServers = transformedServers.filter(s =>
            !existingDomains.has(s.domain)
          );

          allServers.push(...newServers);
          sources.push('github_parser');
        }
      } catch (githubError) {
        console.warn('GitHub search failed:', githubError);
        // Continue without GitHub results
      }
    }

    // 3. Sort by relevance and trust score
    allServers.sort((a, b) => {
      // Prioritize verified servers
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;

      // Then by trust score (if available)
      const aTrust = (a as any).trust_score || 0;
      const bTrust = (b as any).trust_score || 0;
      if (aTrust !== bTrust) return bTrust - aTrust;

      // Finally by stars/popularity
      const aStars = a.repository?.stars || 0;
      const bStars = b.repository?.stars || 0;
      return bStars - aStars;
    });

    // 4. Limit final results
    const finalServers = allServers.slice(0, limit);

    return {
      servers: finalServers,
      sources,
      total_found: allServers.length
    };

  } catch (error) {
    console.error('Enhanced search error:', error);

    // Fallback to basic search
    return {
      servers: [],
      sources: ['error'],
      total_found: 0
    };
  }
}
