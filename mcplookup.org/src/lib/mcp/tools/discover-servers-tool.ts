// Discover MCP Servers Tool - Clean, testable implementation
// Separated from monolithic route for better maintainability

import { z } from 'zod';
import { BaseMCPTool, ToolContext, MCPToolResponse } from './base-tool';

/**
 * Schema for discover_mcp_servers tool arguments
 */
const DiscoverServersSchema = z.object({
  query: z.string().optional(),
  domain: z.string().optional(),
  domains: z.array(z.string()).optional(),
  capabilities: z.array(z.string()).optional(),
  similar_to: z.string().optional(),
  categories: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  performance: z.object({
    min_response_time: z.number().optional(),
    max_response_time: z.number().optional(),
    min_uptime: z.number().optional()
  }).optional(),
  availability_filter: z.enum(['all', 'live_only', 'package_only']).optional(),
  technical: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
  include_alternatives: z.boolean().optional(),
  include_similar: z.boolean().optional(),
  sort_by: z.enum(['relevance', 'popularity', 'performance', 'recent']).optional()
});

type DiscoverServersArgs = z.infer<typeof DiscoverServersSchema>;

/**
 * MCP Server Discovery Tool
 * Handles flexible server discovery with natural language queries
 */
export class DiscoverServersTool extends BaseMCPTool<DiscoverServersArgs> {
  constructor() {
    super({
      name: 'discover_mcp_servers',
      description: 'Flexible MCP server discovery with natural language queries, similarity search, complex capability matching, and performance constraints.',
      schema: DiscoverServersSchema,
      requiredPermissions: ['servers:read']
    });
  }

  protected async executeInternal(
    args: DiscoverServersArgs,
    context: ToolContext
  ): Promise<MCPToolResponse> {
    const { storage, analytics } = context.services;

    try {
      // Record analytics
      if (context.auth?.userId) {
        await analytics.recordEvent({
          user_id: context.auth.userId,
          event_type: 'mcp_tool_used',
          event_data: {
            tool_name: 'discover_mcp_servers',
            query: args.query,
            filters: {
              domain: args.domain,
              capabilities: args.capabilities,
              categories: args.categories
            }
          }
        });
      }

      // Build search criteria
      const searchCriteria = this.buildSearchCriteria(args);
      
      // Execute search
      const servers = await this.searchServers(storage, searchCriteria);
      
      // Apply filters and sorting
      const filteredServers = this.applyFilters(servers, args);
      const sortedServers = this.applySorting(filteredServers, args.sort_by || 'relevance');
      
      // Limit results
      const limitedServers = sortedServers.slice(0, args.limit || 10);
      
      // Format response
      return this.createSuccessResponse({
        servers: limitedServers,
        total_results: sortedServers.length,
        search_criteria: searchCriteria,
        filters_applied: this.getAppliedFilters(args),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      return this.createErrorResponse(
        'Server discovery failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Build search criteria from arguments
   */
  private buildSearchCriteria(args: DiscoverServersArgs): any {
    const criteria: any = {};

    if (args.query) {
      criteria.query = args.query;
    }

    if (args.domain) {
      criteria.domain = args.domain;
    }

    if (args.domains?.length) {
      criteria.domains = args.domains;
    }

    if (args.capabilities?.length) {
      criteria.capabilities = args.capabilities;
    }

    if (args.categories?.length) {
      criteria.categories = args.categories;
    }

    if (args.keywords?.length) {
      criteria.keywords = args.keywords;
    }

    return criteria;
  }

  /**
   * Search servers using storage service
   */
  private async searchServers(storage: any, criteria: any): Promise<any[]> {
    // Use the existing storage service search functionality
    const searchResult = await storage.searchServers(criteria);
    return searchResult.servers || [];
  }

  /**
   * Apply filters to server results
   */
  private applyFilters(servers: any[], args: DiscoverServersArgs): any[] {
    let filtered = [...servers];

    // Performance filters
    if (args.performance) {
      filtered = filtered.filter(server => {
        if (args.performance!.min_response_time && 
            server.performance?.response_time < args.performance!.min_response_time) {
          return false;
        }
        if (args.performance!.max_response_time && 
            server.performance?.response_time > args.performance!.max_response_time) {
          return false;
        }
        if (args.performance!.min_uptime && 
            server.performance?.uptime < args.performance!.min_uptime) {
          return false;
        }
        return true;
      });
    }

    // Availability filter
    if (args.availability_filter && args.availability_filter !== 'all') {
      filtered = filtered.filter(server => {
        if (args.availability_filter === 'live_only') {
          return server.status === 'active' && server.health?.is_live;
        }
        if (args.availability_filter === 'package_only') {
          return server.type === 'package';
        }
        return true;
      });
    }

    return filtered;
  }

  /**
   * Apply sorting to server results
   */
  private applySorting(servers: any[], sortBy: string): any[] {
    const sorted = [...servers];

    switch (sortBy) {
      case 'popularity':
        return sorted.sort((a, b) => (b.stats?.usage_count || 0) - (a.stats?.usage_count || 0));
      
      case 'performance':
        return sorted.sort((a, b) => {
          const aScore = (a.performance?.uptime || 0) - (a.performance?.response_time || 1000);
          const bScore = (b.performance?.uptime || 0) - (b.performance?.response_time || 1000);
          return bScore - aScore;
        });
      
      case 'recent':
        return sorted.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      
      case 'relevance':
      default:
        // Keep original order (relevance-based from search)
        return sorted;
    }
  }

  /**
   * Get summary of applied filters
   */
  private getAppliedFilters(args: DiscoverServersArgs): string[] {
    const filters: string[] = [];

    if (args.domain) filters.push(`domain: ${args.domain}`);
    if (args.capabilities?.length) filters.push(`capabilities: ${args.capabilities.join(', ')}`);
    if (args.categories?.length) filters.push(`categories: ${args.categories.join(', ')}`);
    if (args.performance) filters.push('performance constraints');
    if (args.availability_filter && args.availability_filter !== 'all') {
      filters.push(`availability: ${args.availability_filter}`);
    }

    return filters;
  }
}
