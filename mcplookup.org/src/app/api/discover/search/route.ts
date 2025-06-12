import { NextRequest, NextResponse } from 'next/server';
import { getServerlessServices } from '@/lib/services';

// Import GitHub parser for enhanced search
import { GitHubClient } from '@mcplookup-org/mcp-github-parser';
import { GitHubRepoWithInstallation, buildMCPServerFromGitHubRepo } from '@mcplookup-org/mcp-sdk';

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
          // Transform GitHub results to MCPServer format using SDK helper
          const transformedServers = githubResults.map(repo =>
            buildMCPServerFromGitHubRepo(repo)
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
      if (a.verification_status === 'verified' && b.verification_status !== 'verified') return -1;
      if (a.verification_status !== 'verified' && b.verification_status === 'verified') return 1;

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
