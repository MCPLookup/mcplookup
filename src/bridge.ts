// Refactored MCP Bridge with modular architecture

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { MCPLookupAPIClient } from '@mcplookup-org/mcp-sdk/client';

// Core components
import { CoreTools } from './tools/core-tools.js';
import { ServerManagementTools } from './tools/server-management-tools.js';
import { DynamicToolRegistry } from './tools/dynamic-tool-registry.js';
import { ToolInvoker } from './tools/tool-invoker.js';

// Server management components
import { ServerRegistry } from './server-management/server-registry.js';
import { ClaudeConfigManager } from './server-management/claude-config-manager.js';
import { DockerManager } from './server-management/docker-manager.js';

/**
 * Refactored MCP Bridge with clean separation of concerns
 * 
 * Architecture:
 * - CoreTools: Handles mcplookup.org API integration
 * - ServerManagementTools: Handles server installation and lifecycle
 * - DynamicToolRegistry: Manages dynamic tool registration from bridge servers
 * - ServerRegistry: Manages bridge-mode server state
 * - ClaudeConfigManager: Manages direct-mode Claude Desktop configuration
 * - DockerManager: Handles Docker container operations
 * - ToolInvoker: Handles dynamic tool invocation on remote servers
 */
export class MCPLookupBridge {
  private server: McpServer;
  private apiClient: MCPLookupAPIClient;
  
  // Core components
  private coreTools: CoreTools;
  private serverManagementTools: ServerManagementTools;
  private dynamicToolRegistry: DynamicToolRegistry;
  private toolInvoker: ToolInvoker;
  
  // Server management components
  private serverRegistry: ServerRegistry;
  private claudeConfigManager: ClaudeConfigManager;
  private dockerManager: DockerManager;

  constructor(apiKey?: string, baseUrl?: string) {
    // Initialize MCP server
    this.server = new McpServer({
      name: 'mcplookup-bridge',
      version: '1.0.0',
    });

    // Initialize API client
    this.apiClient = new MCPLookupAPIClient(
      baseUrl || 'https://mcplookup.org/api/v1',
      apiKey || process.env.MCPLOOKUP_API_KEY
    );

    // Initialize server management components
    this.serverRegistry = new ServerRegistry();
    this.claudeConfigManager = new ClaudeConfigManager();
    this.dockerManager = new DockerManager();

    // Initialize tool components
    this.dynamicToolRegistry = new DynamicToolRegistry(this.server);
    this.toolInvoker = new ToolInvoker();
    this.coreTools = new CoreTools(this.apiClient);
    this.serverManagementTools = new ServerManagementTools(
      this.serverRegistry,
      this.claudeConfigManager,
      this.dockerManager,
      this.dynamicToolRegistry
    );

    this.setupTools();
  }

  /**
   * Set up all tools by delegating to component classes
   */
  private setupTools(): void {
    // Register core tools (8 tools)
    this.coreTools.registerTools(this.server);
    
    // Register server management tools (5 tools)
    this.serverManagementTools.registerTools(this.server);
    
    // Dynamic tools are registered automatically when servers are installed
  }

  /**
   * Run the bridge on stdio (for Claude Desktop integration)
   */
  async run(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      this.logStartupInfo();

    } catch (error) {
      console.error('❌ Failed to start bridge server:', error);
      throw error;
    }
  }

  /**
   * Run the bridge as an HTTP server
   */
  async runHTTP(port: number = 3000): Promise<void> {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });

      await this.server.connect(transport);

      this.logStartupInfo();
      console.log(`🔗 MCP endpoint: http://localhost:${port}/mcp`);
      console.log(`🏥 Health check: http://localhost:${port}/health`);

    } catch (error) {
      console.error('❌ Failed to start HTTP bridge server:', error);
      throw error;
    }
  }

  /**
   * Log startup information
   */
  private logStartupInfo(): void {
    console.log('🌉 Starting MCPLookup Bridge v1.0.0');
    console.log('🔧 Available tools: 13+ (8 core + 5 management + dynamic tools)');
    console.log('📡 API endpoint: https://mcplookup.org/api/v1');
    console.log('🔌 Listening on stdio...');
    console.log('✅ MCPLookup Bridge started successfully');
    
    console.log('🎯 Core Tools available:');
    console.log('  • discover_mcp_servers - Search for MCP servers');
    console.log('  • discover_smart - AI-powered discovery');
    console.log('  • register_server - Register a new MCP server');
    console.log('  • verify_domain - Start domain verification');
    console.log('  • check_domain_ownership - Check domain ownership');
    console.log('  • get_server_health - Get server health metrics');
    console.log('  • get_onboarding_state - Get user onboarding progress');
    console.log('  • invoke_tool - Call any MCP server dynamically');
    
    console.log('🔧 Server Management Tools:');
    console.log('  • install_mcp_server - Install MCP server (bridge or direct mode)');
    console.log('  • list_managed_servers - List bridge-managed servers');
    console.log('  • control_mcp_server - Start/stop/restart bridge servers');
    console.log('  • list_claude_servers - List Claude Desktop config servers');
    console.log('  • remove_claude_server - Remove server from Claude config');

    const managedCount = this.serverRegistry.listServers().length;
    if (managedCount > 0) {
      console.log(`📦 Managed Servers (${managedCount}):`);
      for (const server of this.serverRegistry.listServers()) {
        console.log(`  • ${server.name} (${server.status}) - ${server.tools.length} tools`);
      }
    }

    // Show dynamic tools stats
    const toolStats = this.dynamicToolRegistry.getStats();
    if (toolStats.totalTools > 0) {
      console.log(`⚡ Dynamic Tools (${toolStats.totalTools}):`);
      for (const [serverName, count] of Object.entries(toolStats.serverToolCounts)) {
        console.log(`  • ${serverName}: ${count} tools`);
      }
    }
  }

  /**
   * Get bridge statistics
   */
  getStats(): {
    coreTools: number;
    managementTools: number;
    dynamicTools: number;
    managedServers: number;
    serverRegistry: ReturnType<ServerRegistry['getStats']>;
    dynamicRegistry: ReturnType<DynamicToolRegistry['getStats']>;
  } {
    return {
      coreTools: 8,
      managementTools: 5,
      dynamicTools: this.dynamicToolRegistry.getStats().totalTools,
      managedServers: this.serverRegistry.listServers().length,
      serverRegistry: this.serverRegistry.getStats(),
      dynamicRegistry: this.dynamicToolRegistry.getStats()
    };
  }

  /**
   * Health check for all components
   */
  async healthCheck(): Promise<{
    bridge: boolean;
    apiClient: boolean;
    docker: boolean;
    claudeConfig: boolean;
    servers: Map<string, { healthy: boolean; issues: string[] }>;
  }> {
    const health = {
      bridge: true,
      apiClient: false,
      docker: false,
      claudeConfig: false,
      servers: new Map<string, { healthy: boolean; issues: string[] }>()
    };

    // Check API client
    try {
      await this.apiClient.getServerHealth('test');
      health.apiClient = true;
    } catch {
      health.apiClient = false;
    }

    // Check Docker
    health.docker = await this.dockerManager.isDockerAvailable();

    // Check Claude config
    try {
      await this.claudeConfigManager.readConfig();
      health.claudeConfig = true;
    } catch {
      health.claudeConfig = false;
    }

    // Check managed servers
    health.servers = await this.serverRegistry.healthCheckAll();

    return health;
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    console.log('🔄 Shutting down MCPLookup Bridge...');

    try {
      // Close tool invoker connections
      await this.toolInvoker.close();

      // Close server registry (stops all managed servers)
      await this.serverRegistry.close();

      // Clear dynamic tool registry
      this.dynamicToolRegistry.clearAll();

      // Close MCP server
      await this.server.close();

      console.log('✅ MCPLookup Bridge shut down successfully');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Auto-maintenance routine
   */
  async performMaintenance(): Promise<{
    restarted: string[];
    cleaned: string[];
    errors: string[];
  }> {
    const results = {
      restarted: [] as string[],
      cleaned: [] as string[],
      errors: [] as string[]
    };

    try {
      // Auto-restart failed servers
      results.restarted = await this.serverRegistry.autoRestart();

      // Cleanup stopped containers
      results.cleaned = await this.serverRegistry.cleanup();

      console.log(`🔧 Maintenance completed: ${results.restarted.length} restarted, ${results.cleaned.length} cleaned`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(errorMsg);
      console.error('❌ Maintenance error:', errorMsg);
    }

    return results;
  }

  /**
   * Export bridge state for debugging
   */
  exportState(): {
    servers: ReturnType<ServerRegistry['listServers']>;
    dynamicTools: ReturnType<DynamicToolRegistry['exportState']>;
    stats: ReturnType<MCPLookupBridge['getStats']>;
  } {
    return {
      servers: this.serverRegistry.listServers(),
      dynamicTools: this.dynamicToolRegistry.exportState(),
      stats: this.getStats()
    };
  }

  // Expose component access for advanced usage
  get components() {
    return {
      serverRegistry: this.serverRegistry,
      claudeConfigManager: this.claudeConfigManager,
      dockerManager: this.dockerManager,
      dynamicToolRegistry: this.dynamicToolRegistry,
      toolInvoker: this.toolInvoker,
      coreTools: this.coreTools,
      serverManagementTools: this.serverManagementTools
    };
  }

  // Expose API client for CLI usage
  get client() {
    return this.apiClient;
  }

  // High-level API methods for CLI (combines API client + local operations)
  get api() {
    const coreTools = this.coreTools as any;
    const serverManagementTools = this.serverManagementTools;
    const serverRegistry = this.serverRegistry;

    return {
      // Remote API operations (delegate to core tools for consistency)
      async discoverServers(params: any) {
        return await coreTools['discoverServers'](params);
      },

      async smartDiscovery(params: any) {
        return await coreTools['smartDiscovery'](params);
      },

      async registerServer(params: any) {
        return await coreTools['registerServer'](params);
      },

      async getOnboardingState() {
        return await coreTools['getOnboardingState']();
      },

      // Local bridge operations (delegate to components)
      async installServer(params: any) {
        return await serverManagementTools.installServer(params);
      },

      async listManagedServers() {
        return await serverManagementTools.listManagedServers();
      },

      async controlServer(params: any) {
        return await serverManagementTools.controlServer(params);
      },

      async listClaudeServers() {
        return await serverManagementTools.listClaudeServers();
      },

      async getServerHealth(serverName: string) {
        return await serverRegistry.getServerHealth(serverName);
      }
    };
  }
}

// Legacy exports for backwards compatibility
export const MCPHttpBridge = MCPLookupBridge;
export const EnhancedMCPBridge = MCPLookupBridge;
export const MCPDiscoveryBridge = MCPLookupBridge;
