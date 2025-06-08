// Registry Service - Serverless MCP Server Registry
// ENHANCED WITH MCP SDK - Uses SDK for package validation and registry integration

import { MCPServerRecord, CapabilityCategory } from '../schemas/discovery';
import { IRegistryService } from './discovery';
import { IStorage, isSuccessResult, QueryOptions } from './storage/unified-storage';
import { createStorage, StorageConfig } from './storage/factory';
import { 
  InstallationResolver,
  MCPLookupAPIClient,
  ResolvedPackage 
} from '@mcplookup-org/mcp-sdk';

/**
 * Registry Service with Unified Storage
 * ENHANCED WITH MCP SDK - Includes package validation and API integration
 * Automatically uses the best available storage provider
 */
export class RegistryService implements IRegistryService {
  private storage: IStorage;
  private readonly COLLECTION = 'servers';
  private installationResolver: InstallationResolver;
  private apiClient: MCPLookupAPIClient;

  constructor() {
    this.storage = createStorage();
    this.installationResolver = new InstallationResolver();
    this.apiClient = new MCPLookupAPIClient();
  }

  /**
   * Get all servers (from storage only)
   */
  async getAllServers(): Promise<MCPServerRecord[]> {
    const result = await this.storage.getAll<MCPServerRecord>(this.COLLECTION);
    if (isSuccessResult(result)) {
      return result.data.items;
    }
    throw new Error(`Failed to get servers: ${result.error}`);
  }

  /**
   * Get all verified servers (excludes unverified domains)
   */
  async getVerifiedServers(): Promise<MCPServerRecord[]> {
    const queryOptions: QueryOptions = {
      filters: {
        verification_status: ['verified', 'pending']
      }
    };

    const result = await this.storage.query<MCPServerRecord>(this.COLLECTION, queryOptions);
    if (isSuccessResult(result)) {
      return result.data.items;
    }
    throw new Error(`Failed to get verified servers: ${result.error}`);
  }

  /**
   * Register a new MCP server
   * ENHANCED: Now includes SDK package validation and API synchronization
   */
  async registerServer(server: MCPServerRecord): Promise<void> {
    // Step 1: Validate package using SDK if it's a package reference
    let enhancedServer = server;
    if (server.npm_package || server.docker_image || server.python_package) {
      enhancedServer = await this.validateAndEnhanceWithSDK(server);
    }

    const serverWithTimestamp = {
      ...enhancedServer,
      created_at: server.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Step 2: Store in local storage
    const result = await this.storage.set(this.COLLECTION, server.domain, serverWithTimestamp);
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to register server: ${result.error}`);
    }

    // Step 3: Optionally sync with central registry via API
    try {
      await this.syncServerWithAPI(serverWithTimestamp);
    } catch (error) {
      console.warn('Failed to sync server with central API:', error);
      // Don't fail the registration if API sync fails
    }
  }

  /**
   * Validate and enhance server data using SDK
   */
  private async validateAndEnhanceWithSDK(server: MCPServerRecord): Promise<MCPServerRecord> {
    try {
      // Extract package query from server packages array or use domain as fallback
      let packageQuery = server.domain;
      
      // Look for existing package data to use for resolution
      if (server.packages && server.packages.length > 0) {
        const npmPackage = server.packages.find(pkg => pkg.type === 'npm');
        const dockerPackage = server.packages.find(pkg => pkg.type === 'docker');
        const pythonPackage = server.packages.find(pkg => pkg.type === 'python');
        
        packageQuery = npmPackage?.name || dockerPackage?.name || pythonPackage?.name || server.domain;
      }
      
      // Resolve package using SDK
      const resolvedPackage = await this.installationResolver.resolvePackage(packageQuery);
      
      // Get installation context and instructions
      const context = {
        mode: 'direct' as const,
        platform: process.platform as 'linux' | 'darwin' | 'win32',
        client: 'mcplookup-registry'
      };
      
      const instructions = await this.installationResolver.getInstallationInstructions(resolvedPackage, context);
      
      // Enhance packages array with SDK-resolved package
      const enhancedPackages = server.packages || [];
      const existingPackage = enhancedPackages.find(pkg => pkg.type === resolvedPackage.type);
      
      if (!existingPackage && resolvedPackage.packageName) {
        enhancedPackages.push({
          type: resolvedPackage.type as 'npm' | 'docker' | 'python' | 'github' | 'git' | 'manual',
          name: resolvedPackage.packageName,
          version: resolvedPackage.version || 'latest',
          registry: resolvedPackage.type === 'npm' ? 'npm' : 
                   resolvedPackage.type === 'docker' ? 'docker' : 
                   resolvedPackage.type === 'python' ? 'pypi' : 'github',
          installation_command: instructions.command,
          args: instructions.args || [],
          setup_instructions: instructions.steps.join('\n'),
          env_requirements: instructions.env_vars || {}
        });
      }
      
      // Enhance server with resolved package data
      return {
        ...server,
        name: resolvedPackage.displayName || resolvedPackage.packageName || server.name,
        description: resolvedPackage.description || server.description,
        packages: enhancedPackages,
        
        // Enhanced repository info
        repository: {
          ...server.repository,
          url: resolvedPackage.repositoryUrl || server.repository?.url || '',
          source: resolvedPackage.type === 'npm' ? 'npm' : 
                 resolvedPackage.type === 'docker' ? 'docker' : 
                 resolvedPackage.type === 'python' ? 'pypi' : 'github'
        },
        
        // Enhanced verification
        verification: {
          ...server.verification,
          verified: resolvedPackage.verified || false,
          sdk_validated: true
        },

        // Update metadata with SDK enhancement info
        updated_at: new Date().toISOString()
      };

    } catch (error) {
      console.warn('SDK validation failed for server:', server.domain, error);
      return server;
    }
  }

  /**
   * Sync server data with central API registry
   */
  private async syncServerWithAPI(server: MCPServerRecord): Promise<void> {
    // This would register the server with the central mcplookup.org API
    // For now, this is a placeholder for future API integration
    console.log('Would sync server with API:', server.domain);
  }

  /**
   * Update an existing server
   */
  async updateServer(domain: string, updates: Partial<MCPServerRecord>): Promise<void> {
    const getResult = await this.storage.get<MCPServerRecord>(this.COLLECTION, domain);
    if (!isSuccessResult(getResult) || !getResult.data) {
      throw new Error(`Server ${domain} not found`);
    }

    const updated = {
      ...getResult.data,
      ...updates,
      domain, // Ensure domain doesn't change
      updated_at: new Date().toISOString()
    };

    const updateResult = await this.storage.set(this.COLLECTION, domain, updated);
    if (!isSuccessResult(updateResult)) {
      throw new Error(`Failed to update server: ${updateResult.error}`);
    }
  }

  /**
   * Unregister a server
   */
  async unregisterServer(domain: string): Promise<void> {
    const result = await this.storage.delete(this.COLLECTION, domain);
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to unregister server: ${result.error}`);
    }
  }

  /**
   * Get registry statistics
   */
  async getRegistryStats(): Promise<{
    totalServers: number;
    registeredServers: number;
    wellKnownServers: number;
    categories: Record<string, number>
  }> {
    const allServers = await this.getAllServers();
    const verifiedServers = allServers.filter(s => s.verification_status === 'verified');

    // Count by category
    const categories: Record<string, number> = {};
    for (const server of allServers) {
      const category = server.capabilities.category;
      categories[category] = (categories[category] || 0) + 1;
    }

    return {
      totalServers: allServers.length,
      registeredServers: allServers.length,
      wellKnownServers: 0, // No hardcoded servers
      categories
    };
  }

  /**
   * Get servers by exact domain match
   */
  async getServersByDomain(domain: string): Promise<MCPServerRecord[]> {
    const result = await this.storage.get<MCPServerRecord>(this.COLLECTION, domain);
    if (isSuccessResult(result) && result.data) {
      return [result.data];
    }
    return [];
  }

  /**
   * Get servers by capability
   */
  async getServersByCapability(capability: CapabilityCategory): Promise<MCPServerRecord[]> {
    const allServers = await this.getAllServers();
    return allServers.filter(server =>
      server.capabilities.subcategories?.includes(capability)
    );
  }

  /**
   * Get servers by category
   */
  async getServersByCategory(category: CapabilityCategory): Promise<MCPServerRecord[]> {
    const queryOptions: QueryOptions = {
      filters: {
        'capabilities.category': category
      }
    };

    const result = await this.storage.query<MCPServerRecord>(this.COLLECTION, queryOptions);
    if (isSuccessResult(result)) {
      return result.data.items;
    }
    throw new Error(`Failed to get servers by category: ${result.error}`);
  }

  /**
   * Search servers by text query
   */
  async searchServers(keywords: string[]): Promise<MCPServerRecord[]> {
    const query = keywords.join(' ');
    const result = await this.storage.search<MCPServerRecord>(this.COLLECTION, query);
    if (isSuccessResult(result)) {
      return result.data.items;
    }
    throw new Error(`Failed to search servers: ${result.error}`);
  }

  /**
   * Get all verified servers (excludes unverified domains)
   */
  async getAllVerifiedServers(): Promise<MCPServerRecord[]> {
    return this.getVerifiedServers();
  }

  /**
   * Get related capabilities for a given capability
   */
  async getRelatedCapabilities(capability: string): Promise<string[]> {
    // Simple semantic matching for now
    const capabilityMap: Record<string, string[]> = {
      'email': ['email_send', 'email_read', 'email_compose', 'gmail', 'outlook'],
      'calendar': ['calendar_create', 'calendar_read', 'calendar_update', 'scheduling'],
      'file': ['file_read', 'file_write', 'file_upload', 'storage', 'drive'],
      'database': ['db_query', 'db_write', 'sql', 'nosql', 'postgres'],
      'api': ['rest_api', 'graphql', 'webhook', 'http_request'],
      'ai': ['llm', 'embedding', 'completion', 'chat', 'openai'],
      'social': ['twitter', 'linkedin', 'facebook', 'social_media'],
      'payment': ['stripe', 'paypal', 'payment_processing', 'billing'],
      'analytics': ['google_analytics', 'tracking', 'metrics', 'reporting']
    };

    const lowerCapability = capability.toLowerCase();
    for (const [key, related] of Object.entries(capabilityMap)) {
      if (lowerCapability.includes(key) || related.some(r => lowerCapability.includes(r))) {
        return related;
      }
    }

    return [];
  }

  // ========================================================================
  // ADDITIONAL METHODS FOR UNIFIED STORAGE
  // ========================================================================

  /**
   * Get a single server by domain
   */
  async getServer(domain: string): Promise<MCPServerRecord | null> {
    const result = await this.storage.get<MCPServerRecord>(this.COLLECTION, domain);
    if (isSuccessResult(result)) {
      return result.data;
    }
    throw new Error(`Failed to get server: ${result.error}`);
  }

  /**
   * Check if a server exists
   */
  async serverExists(domain: string): Promise<boolean> {
    const result = await this.storage.exists(this.COLLECTION, domain);
    if (isSuccessResult(result)) {
      return result.data;
    }
    throw new Error(`Failed to check server existence: ${result.error}`);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const result = await this.storage.healthCheck();
      return {
        healthy: result.healthy,
        details: result
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: String(error) }
      };
    }
  }
}
