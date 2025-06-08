// Redis Discovery Service
// High-level service for discovering and retrieving structured server data

import redis from 'redis';
import { RedisServerTransformer, ServerMetadata, InstallationMethod } from './server-transformer';

export interface DiscoveryParams {
  query?: string;
  category?: string;
  installationType?: 'npm' | 'python' | 'docker' | 'git';
  qualityThreshold?: number;
  limit?: number;
  sortBy?: 'quality' | 'stars' | 'updated' | 'relevance';
}

export interface DiscoveryResult {
  servers: ServerMetadata[];
  total: number;
  filters: {
    categories: string[];
    installationTypes: string[];
    qualityRange: { min: number; max: number };
  };
}

export interface SmartDiscoveryParams {
  intent: string;
  preferredInstallMethod?: 'npm' | 'python' | 'docker';
  requiresAuth?: boolean;
  maxComplexity?: 'simple' | 'moderate' | 'complex';
}

export class RedisDiscoveryService {
  private client: redis.RedisClientType;
  private transformer: RedisServerTransformer;

  constructor(redisClient: redis.RedisClientType) {
    this.client = redisClient;
    this.transformer = new RedisServerTransformer();
  }

  /**
   * Discover servers based on search criteria
   */
  async discoverServers(params: DiscoveryParams): Promise<DiscoveryResult> {
    const {
      query,
      category,
      installationType,
      qualityThreshold = 60,
      limit = 50,
      sortBy = 'quality'
    } = params;

    // Get candidate server IDs
    let candidateIds = await this.getCandidateServerIds(query, category, installationType);
    
    // Load and transform servers
    const servers = await this.loadServers(candidateIds);
    
    // Apply filters
    let filteredServers = servers.filter(server => 
      server.quality.score >= qualityThreshold
    );
    
    // Sort results
    filteredServers = this.sortServers(filteredServers, sortBy);
    
    // Limit results
    const limitedServers = filteredServers.slice(0, limit);
    
    return {
      servers: limitedServers,
      total: filteredServers.length,
      filters: await this.generateFilters(servers)
    };
  }

  /**
   * Smart discovery using AI-like intent matching
   */
  async smartDiscovery(params: SmartDiscoveryParams): Promise<ServerMetadata[]> {
    const {
      intent,
      preferredInstallMethod,
      requiresAuth = false,
      maxComplexity = 'moderate'
    } = params;

    // Extract keywords from intent
    const keywords = this.extractKeywords(intent);
    
    // Search by intent keywords
    const candidateIds = await this.searchByKeywords(keywords);
    const servers = await this.loadServers(candidateIds);
    
    // Score servers based on intent match
    const scoredServers = servers.map(server => ({
      server,
      score: this.calculateIntentScore(server, intent, keywords)
    }));
    
    // Filter by preferences
    let filteredServers = scoredServers
      .filter(({ server }) => {
        // Installation method preference
        if (preferredInstallMethod) {
          const hasPreferredMethod = server.installationMethods.some(
            method => method.type === preferredInstallMethod
          );
          if (!hasPreferredMethod) return false;
        }
        
        // Auth requirement
        if (requiresAuth && server.auth.type === 'none') return false;
        if (!requiresAuth && server.auth.type !== 'none') return false;
        
        // Complexity filter
        const complexityScore = this.calculateComplexityScore(server);
        const maxScore = maxComplexity === 'simple' ? 50 : 
                        maxComplexity === 'moderate' ? 80 : 100;
        if (complexityScore > maxScore) return false;
        
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .map(({ server }) => server);
    
    return filteredServers.slice(0, 20);
  }

  /**
   * Get installation options for a specific server
   */
  async getInstallationOptions(serverId: string): Promise<{
    server: ServerMetadata;
    recommendedMethod: InstallationMethod;
    allMethods: InstallationMethod[];
    environmentSetup: string[];
  }> {
    const server = await this.getServer(serverId);
    const recommendedMethod = this.getRecommendedInstallMethod(server);
    
    return {
      server,
      recommendedMethod,
      allMethods: server.installationMethods,
      environmentSetup: this.generateEnvironmentSetup(server)
    };
  }

  /**
   * Get servers by category with installation type breakdown
   */
  async getServersByCategory(category: string): Promise<{
    npm: ServerMetadata[];
    python: ServerMetadata[];
    docker: ServerMetadata[];
    git: ServerMetadata[];
  }> {
    const categoryIds = await this.client.sMembers(`servers_enhanced_filtered:category:${category}`);
    const servers = await this.loadServers(categoryIds);
    
    return {
      npm: servers.filter(s => s.installationMethods.some(m => m.type === 'npm')),
      python: servers.filter(s => s.installationMethods.some(m => m.type === 'python')),
      docker: servers.filter(s => s.installationMethods.some(m => m.type === 'docker')),
      git: servers.filter(s => s.installationMethods.some(m => m.type === 'git'))
    };
  }

  /**
   * Get high-quality servers by installation type
   */
  async getQualityServersByType(installationType: 'npm' | 'python' | 'docker'): Promise<ServerMetadata[]> {
    const deploymentIds = await this.client.sMembers(`servers_enhanced_filtered:deployment:${installationType}`);
    const servers = await this.loadServers(deploymentIds);
    
    return servers
      .filter(server => server.quality.score >= 80)
      .sort((a, b) => b.quality.score - a.quality.score)
      .slice(0, 50);
  }

  // Private helper methods

  private async getCandidateServerIds(
    query?: string,
    category?: string,
    installationType?: string
  ): Promise<string[]> {
    let candidateIds: string[] = [];
    
    if (category) {
      candidateIds = await this.client.sMembers(`servers_enhanced_filtered:category:${category}`);
    } else if (installationType) {
      candidateIds = await this.client.sMembers(`servers_enhanced_filtered:deployment:${installationType}`);
    } else {
      // Get all servers
      const keys = await this.client.keys('servers_enhanced_filtered:*');
      candidateIds = keys
        .filter(key => 
          !key.includes(':category:') && 
          !key.includes(':quality:') && 
          !key.includes(':deployment:') &&
          !key.includes(':all') &&
          key.split(':').length === 2
        )
        .map(key => key.replace('servers_enhanced_filtered:', ''));
    }
    
    // Apply text search if query provided
    if (query) {
      candidateIds = await this.filterByTextSearch(candidateIds, query);
    }
    
    return candidateIds;
  }

  private async loadServers(serverIds: string[]): Promise<ServerMetadata[]> {
    const servers: ServerMetadata[] = [];
    
    // Load in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < serverIds.length; i += batchSize) {
      const batch = serverIds.slice(i, i + batchSize);
      const batchPromises = batch.map(async (id) => {
        try {
          const rawData = await this.client.hGetAll(`servers_enhanced_filtered:${id}`);
          if (Object.keys(rawData).length > 0) {
            return this.transformer.transformServer(rawData);
          }
        } catch (error) {
          console.warn(`Failed to load server ${id}:`, error);
        }
        return null;
      });
      
      const batchResults = await Promise.all(batchPromises);
      servers.push(...batchResults.filter(s => s !== null) as ServerMetadata[]);
    }
    
    return servers;
  }

  private async getServer(serverId: string): Promise<ServerMetadata> {
    const rawData = await this.client.hGetAll(`servers_enhanced_filtered:${serverId}`);
    return this.transformer.transformServer(rawData);
  }

  private sortServers(servers: ServerMetadata[], sortBy: string): ServerMetadata[] {
    switch (sortBy) {
      case 'quality':
        return servers.sort((a, b) => b.quality.score - a.quality.score);
      case 'stars':
        return servers.sort((a, b) => b.repository.stars - a.repository.stars);
      case 'updated':
        return servers.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      default:
        return servers;
    }
  }

  private extractKeywords(intent: string): string[] {
    return intent
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'for', 'with', 'that', 'this'].includes(word));
  }

  private async searchByKeywords(keywords: string[]): Promise<string[]> {
    // This would ideally use Redis search or full-text search
    // For now, we'll search through all servers and match keywords
    const allKeys = await this.client.keys('servers_enhanced_filtered:*');
    const serverKeys = allKeys.filter(key => 
      !key.includes(':category:') && 
      !key.includes(':quality:') && 
      !key.includes(':deployment:') &&
      key.split(':').length === 2
    );
    
    const matchingIds: string[] = [];
    
    for (const key of serverKeys.slice(0, 500)) { // Limit for performance
      const data = await this.client.hGetAll(key);
      const searchText = [
        data.name,
        data.description,
        data['capabilities.use_cases'],
        data['capabilities.intent_keywords']
      ].join(' ').toLowerCase();
      
      const hasMatch = keywords.some(keyword => searchText.includes(keyword));
      if (hasMatch) {
        matchingIds.push(key.replace('servers_enhanced_filtered:', ''));
      }
    }
    
    return matchingIds;
  }

  private calculateIntentScore(server: ServerMetadata, intent: string, keywords: string[]): number {
    let score = 0;
    const searchText = [
      server.name,
      server.description,
      ...server.capabilities.useCase,
      ...server.capabilities.intentKeywords
    ].join(' ').toLowerCase();
    
    // Keyword matching
    keywords.forEach(keyword => {
      if (searchText.includes(keyword)) score += 10;
    });
    
    // Quality bonus
    score += server.quality.score * 0.1;
    
    // Popularity bonus
    score += Math.min(server.repository.stars * 0.01, 5);
    
    return score;
  }

  private calculateComplexityScore(server: ServerMetadata): number {
    let complexity = 0;
    
    // Environment variables add complexity
    complexity += server.environmentVariables.length * 10;
    
    // Multiple installation methods add complexity
    complexity += server.installationMethods.length * 5;
    
    // Auth requirements add complexity
    if (server.auth.type !== 'none') complexity += 20;
    
    // Docker adds some complexity
    if (server.docker?.hasDocker) complexity += 15;
    
    return Math.min(complexity, 100);
  }

  private getRecommendedInstallMethod(server: ServerMetadata): InstallationMethod {
    // Prefer npm for simplicity, then python, then docker
    const preferences = ['npm', 'python', 'docker', 'git'];
    
    for (const preferred of preferences) {
      const method = server.installationMethods.find(m => m.type === preferred);
      if (method) return method;
    }
    
    return server.installationMethods[0];
  }

  private generateEnvironmentSetup(server: ServerMetadata): string[] {
    const setup: string[] = [];
    
    server.environmentVariables.forEach(envVar => {
      if (envVar.required) {
        setup.push(`export ${envVar.name}="your_${envVar.name.toLowerCase()}"`);
      }
    });
    
    return setup;
  }

  private async filterByTextSearch(serverIds: string[], query: string): Promise<string[]> {
    const filtered: string[] = [];
    const queryLower = query.toLowerCase();
    
    for (const id of serverIds) {
      const data = await this.client.hGetAll(`servers_enhanced_filtered:${id}`);
      const searchText = [
        data.name,
        data.description,
        data['capabilities.use_cases']
      ].join(' ').toLowerCase();
      
      if (searchText.includes(queryLower)) {
        filtered.push(id);
      }
    }
    
    return filtered;
  }

  private async generateFilters(servers: ServerMetadata[]) {
    const categories = [...new Set(servers.map(s => s.category))];
    const installationTypes = [...new Set(
      servers.flatMap(s => s.installationMethods.map(m => m.type))
    )];
    const qualities = servers.map(s => s.quality.score);
    
    return {
      categories,
      installationTypes,
      qualityRange: {
        min: Math.min(...qualities),
        max: Math.max(...qualities)
      }
    };
  }
}
