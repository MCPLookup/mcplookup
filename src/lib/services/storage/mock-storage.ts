// Mock Storage for Testing
// Simple in-memory storage that implements the same interfaces

import { MCPServerRecord, CapabilityCategory } from '../../schemas/discovery.js';
import { IRegistryStorage } from './registry-storage.js';

/**
 * Mock storage for testing - implements the registry storage interface
 * but uses in-memory storage internally
 */
export class MockRegistryStorage implements IRegistryStorage {
  private servers = new Map<string, MCPServerRecord>();

  async storeServer(domain: string, server: MCPServerRecord): Promise<void> {
    this.servers.set(domain, server);
  }

  async getServer(domain: string): Promise<MCPServerRecord | null> {
    return this.servers.get(domain) || null;
  }

  async deleteServer(domain: string): Promise<void> {
    this.servers.delete(domain);
  }

  async getAllServers(): Promise<MCPServerRecord[]> {
    return Array.from(this.servers.values());
  }

  async getServersByCategory(category: CapabilityCategory): Promise<MCPServerRecord[]> {
    return Array.from(this.servers.values()).filter(
      server => server.capabilities.category === category
    );
  }

  async getServersByCapability(capability: string): Promise<MCPServerRecord[]> {
    return Array.from(this.servers.values()).filter(server =>
      server.capabilities.subcategories?.some(cap => 
        cap.toLowerCase().includes(capability.toLowerCase())
      )
    );
  }

  async searchServers(query: string): Promise<MCPServerRecord[]> {
    const searchTerms = query.toLowerCase().split(/\s+/);
    return Array.from(this.servers.values()).filter(server => {
      const searchText = [
        server.name,
        server.description,
        server.capabilities.category,
        ...(server.capabilities.subcategories || [])
      ].join(' ').toLowerCase();
      
      return searchTerms.some(term => searchText.includes(term));
    });
  }

  async getStats(): Promise<{ totalServers: number; categories: Record<string, number> }> {
    const servers = Array.from(this.servers.values());
    const categories: Record<string, number> = {};
    
    servers.forEach(server => {
      const category = server.capabilities.category;
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return {
      totalServers: servers.length,
      categories
    };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
