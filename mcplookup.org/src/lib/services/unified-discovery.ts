// @ts-nocheck
// Unified Discovery Service - No More Transformations!
// Uses SDK types everywhere, stores rich objects

import {
  MCPServer,
  GitHubRepoWithInstallation,
  buildMCPServerFromGitHubRepo
} from '@mcplookup-org/mcp-sdk';
import { StoredServerData } from '../types/unified';

export class UnifiedDiscoveryService {
  
  /**
   * Discover GitHub repos and store as complete SDK objects
   */
  async discoverGitHubServers(searchQuery: string): Promise<MCPServer[]> {
    // 1. Get GitHub repos from parser (already rich SDK objects)
    const githubRepos = await this.githubSearchService.searchRepositories(searchQuery);
    
    // 2. Check what we already have (no transformation needed!)
    const existingServers = await this.loadExistingServers(githubRepos);
    
    if (existingServers.length >= this.MIN_RESULTS_THRESHOLD) {
      // Return stored SDK objects directly
      return existingServers.map(stored => stored.server);
    }
    
    // 3. Process new repos (single transformation using SDK)
    await this.processNewRepos(githubRepos);
    
    // 4. Return updated results (still no transformation!)
    const updatedServers = await this.loadExistingServers(githubRepos);
    return updatedServers.map(stored => stored.server);
  }
  
  /**
   * Load servers using SDK types - no transformation needed
   */
  private async loadExistingServers(githubRepos: GitHubRepoWithInstallation[]): Promise<StoredServerData[]> {
    const servers: StoredServerData[] = [];
    
    for (const repo of githubRepos) {
      const id = `github.com/${repo.repository.fullName}`;
      const stored = await this.storage.getServer(id);
      
      if (stored) {
        servers.push(stored); // Already in SDK format!
      }
    }
    
    return servers;
  }
  
  /**
   * Process new repos - single SDK transformation
   */
  private async processNewRepos(githubRepos: GitHubRepoWithInstallation[]): Promise<void> {
    for (const githubRepo of githubRepos) {
      // Single transformation using SDK
      const mcpServer = buildMCPServerFromGitHubRepo(githubRepo);
      
      // Wrap with metadata
      const storedData: StoredServerData = {
        server: mcpServer,
        metadata: {
          discoveredAt: new Date().toISOString(),
          lastAnalyzed: new Date().toISOString(),
          registrationSource: 'github_auto'
        },
        original: {
          githubRepo,
          parserVersion: githubRepo.parsingMetadata?.parserVersion || 'unknown'
        }
      };
      
      // Store complete object
      await this.storage.storeServer(mcpServer.id, storedData);
    }
  }
  
  /**
   * Search returns SDK objects directly
   */
  async searchServers(query: string): Promise<MCPServer[]> {
    const storedResults = await this.storage.searchServers(query);
    return storedResults.map(stored => stored.server); // No transformation!
  }
}

// Usage Example:
const discovery = new UnifiedDiscoveryService();
const servers = await discovery.discoverGitHubServers('email automation');

// servers is already MCPServer[] - use directly in API responses!
return NextResponse.json({ servers }); // No more transformations!
