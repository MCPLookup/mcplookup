// Server management tools for bridge and direct modes

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  ServerInstallOptions,
  ServerControlOptions,
  ToolCallResult,
  ManagedServer,
  InstallationResolver,
  InstallationContext,
  ResolvedPackage
} from '@mcplookup-org/mcp-sdk';
import { ServerRegistry } from '../server-management/server-registry.js';
import { ClaudeConfigManager } from '../server-management/claude-config-manager.js';
import { DockerManager } from '../server-management/docker-manager.js';
import { DynamicToolRegistry } from './dynamic-tool-registry.js';
import {
  createSuccessResult,
  createErrorResult,
  executeWithErrorHandling,
  sanitizeIdentifier,
  validateInstallOptions
} from '@mcplookup-org/mcp-sdk';

export class ServerManagementTools {
  private serverRegistry: ServerRegistry;
  private claudeConfigManager: ClaudeConfigManager;
  private dockerManager: DockerManager;
  private dynamicToolRegistry: DynamicToolRegistry;
  private installationResolver: InstallationResolver;

  constructor(
    serverRegistry: ServerRegistry,
    claudeConfigManager: ClaudeConfigManager,
    dockerManager: DockerManager,
    dynamicToolRegistry: DynamicToolRegistry
  ) {
    this.serverRegistry = serverRegistry;
    this.claudeConfigManager = claudeConfigManager;
    this.dockerManager = dockerManager;
    this.dynamicToolRegistry = dynamicToolRegistry;
    this.installationResolver = new InstallationResolver();
  }

  /**
   * Register all server management tools with the MCP server
   */
  registerTools(server: McpServer): void {
    this.registerInstallationTools(server);
    this.registerBridgeModeTools(server);
    this.registerDirectModeTools(server);
  }

  private registerInstallationTools(server: McpServer): void {
    // Tool: Install MCP server (enhanced with SDK package resolution)
    server.tool(
      'install_mcp_server',
      {
        package_query: z.string().describe('Package name, Docker image, or natural language description of the server to install'),
        name: z.string().optional().describe('Custom local name for the server (auto-generated if not provided)'),
        mode: z.enum(['bridge', 'direct']).default('bridge').describe('Installation mode: bridge (dynamic) or direct (Claude config)'),
        auto_start: z.boolean().default(true).describe('Start server immediately after install (bridge mode only)'),
        global_install: z.boolean().default(false).describe('Install npm package globally (direct mode only, like Smithery)'),
        env: z.record(z.string()).optional().describe('Environment variables for the server')
      },
      async (options: {
        package_query: string;
        name?: string;
        mode: 'bridge' | 'direct';
        auto_start: boolean;
        global_install: boolean;
        env?: Record<string, string>;
      }) => this.installServerWithSDK(options)
    );
  }

  private registerBridgeModeTools(server: McpServer): void {
    // Tool: List managed servers
    server.tool(
      'list_managed_servers',
      {},
      async () => this.listManagedServers()
    );

    // Tool: Control MCP server
    server.tool(
      'control_mcp_server',
      {
        name: z.string().describe('Server name'),
        action: z.enum(['start', 'stop', 'restart', 'remove']).describe('Action to perform')
      },
      async (options: ServerControlOptions) => this.controlServer(options)
    );
  }

  private registerDirectModeTools(server: McpServer): void {
    // Tool: List Claude Desktop servers
    server.tool(
      'list_claude_servers',
      {},
      async () => this.listClaudeServers()
    );

    // Tool: Remove server from Claude Desktop config
    server.tool(
      'remove_claude_server',
      {
        name: z.string().describe('Server name to remove from Claude Desktop config')
      },
      async ({ name }: { name: string }) => this.removeClaudeServer(name)
    );
  }

  // Implementation methods - SDK-powered installation
  async installServerWithSDK(options: {
    package_query: string;
    name?: string;
    mode: 'bridge' | 'direct';
    auto_start: boolean;
    global_install: boolean;
    env?: Record<string, string>;
  }): Promise<ToolCallResult> {
    return executeWithErrorHandling(async () => {
      // Step 1: Use SDK to resolve the package query to actual package
      const resolvedPackage = await this.installationResolver.resolvePackage(options.package_query);
      
      // Step 2: Generate server name if not provided
      const serverName = options.name || this.installationResolver.generateServerName(resolvedPackage.packageName);
      
      // Step 3: Create installation context
      const context: InstallationContext = {
        mode: options.mode,
        platform: process.platform as 'linux' | 'darwin' | 'win32',
        globalInstall: options.global_install,
        client: 'mcp-bridge',
        verbose: true
      };
      
      // Step 4: Get installation instructions from SDK
      const instructions = await this.installationResolver.getInstallationInstructions(resolvedPackage, context);
      
      // Step 5: Install based on mode using SDK instructions
      if (options.mode === 'direct') {
        return await this.installDirectModeWithSDK(resolvedPackage, serverName, instructions, options.env || {});
      } else {
        return await this.installBridgeModeWithSDK(resolvedPackage, serverName, instructions, options);
      }
    }, `Failed to install server from query: "${options.package_query}"`);
  }

  private async installBridgeModeWithSDK(
    resolvedPackage: ResolvedPackage,
    serverName: string,
    instructions: any,
    options: { auto_start: boolean; env?: Record<string, string> }
  ): Promise<ToolCallResult> {
    if (this.serverRegistry.hasServer(serverName)) {
      return createErrorResult(
        new Error(`Server '${serverName}' already exists`),
        'Server already exists'
      );
    }

    const server: ManagedServer = {
      name: serverName,
      type: resolvedPackage.type as 'npm' | 'docker',
      mode: 'bridge',
      command: instructions.args || [instructions.command],
      tools: [],
      status: 'installing'
    };

    this.serverRegistry.addServer(server);

    // Use SDK-generated instructions for setup
    if (resolvedPackage.type === 'npm') {
      await this.dockerManager.dockerizeNpmServer(server, { 
        ...options.env, 
        ...instructions.env_vars 
      });
    } else if (resolvedPackage.type === 'docker') {
      if (instructions.env_vars && Object.keys(instructions.env_vars).length > 0) {
        server.command = this.dockerManager.addEnvironmentVariables(
          server.command, 
          { ...options.env, ...instructions.env_vars }
        );
      }
    }

    if (options.auto_start) {
      await this.serverRegistry.startServer(serverName);
      await this.dynamicToolRegistry.addServerTools(serverName, server);
    }

    return createSuccessResult(
      `✅ Installed ${resolvedPackage.displayName || resolvedPackage.packageName} as '${serverName}' (${resolvedPackage.type}, bridge mode)
📦 Package: ${resolvedPackage.packageName}
${resolvedPackage.description ? `📝 Description: ${resolvedPackage.description}` : ''}
${resolvedPackage.verified ? '🔐 Verified server' : '⚠️ Unverified server'}
${options.auto_start ? 
  `🚀 Server started and tools available with prefix: ${serverName}_` : 
  '⏳ Use control_mcp_server to start.'
}

💡 Installation steps completed:
${instructions.steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}`
    );
  }

  private async installDirectModeWithSDK(
    resolvedPackage: ResolvedPackage,
    serverName: string,
    instructions: any,
    env: Record<string, string>
  ): Promise<ToolCallResult> {
    // Check if server already exists in Claude config
    if (await this.claudeConfigManager.hasServer(serverName)) {
      return createErrorResult(
        new Error(`Server '${serverName}' already exists in Claude Desktop config`),
        'Server already exists in Claude config'
      );
    }

    // Generate Claude Desktop configuration using SDK
    const context: InstallationContext = {
      mode: 'direct',
      platform: process.platform as 'linux' | 'darwin' | 'win32',
      client: 'claude-desktop'
    };

    const claudeConfig = this.installationResolver.generateClaudeConfig(
      resolvedPackage,
      context,
      { ...env, ...instructions.env_vars }
    );

    // Extract the server config from the generated Claude config
    const serverConfig = Object.values(claudeConfig.mcpServers)[0] as any;

    // Add server to Claude Desktop config using SDK-generated configuration
    await this.claudeConfigManager.addServer(
      serverName,
      serverConfig.command,
      serverConfig.args || [],
      serverConfig.env || {}
    );

    const configPath = await this.claudeConfigManager.getConfigPath();
    const runtimeInfo = this.installationResolver.getRuntimeInfo(
      resolvedPackage.type as string,
      'direct',
      false // global install handled by SDK
    );

    return createSuccessResult(
      `✅ Installed ${resolvedPackage.displayName || resolvedPackage.packageName} as '${serverName}' in Claude Desktop config
📦 Package: ${resolvedPackage.packageName}
${resolvedPackage.description ? `📝 Description: ${resolvedPackage.description}` : ''}
${resolvedPackage.verified ? '🔐 Verified server' : '⚠️ Unverified server'}
📋 Config updated at: ${configPath}
🏃 Runtime: ${runtimeInfo}
🔄 Please restart Claude Desktop to use the server.

💡 Installation steps completed:
${instructions.steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

🔧 Generated command: ${instructions.command}
📝 Generated args: ${instructions.args.join(' ')}`
    );
  }



  async listManagedServers(): Promise<ToolCallResult> {
    const servers = this.serverRegistry.listServers().map(server => ({
      name: server.name,
      type: server.type,
      status: server.status,
      tools: server.tools,
      endpoint: server.endpoint
    }));

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(servers, null, 2)
      }]
    };
  }

  async controlServer(options: ServerControlOptions): Promise<ToolCallResult> {
    try {
      if (!this.serverRegistry.hasServer(options.name)) {
        return {
          content: [{
            type: 'text' as const,
            text: `❌ Server '${options.name}' not found. Use list_managed_servers to see available servers.`
          }],
          isError: true
        };
      }

      switch (options.action) {
        case 'start':
          await this.serverRegistry.startServer(options.name);
          const server = this.serverRegistry.getServer(options.name)!;
          await this.dynamicToolRegistry.addServerTools(options.name, server);
          break;
        case 'stop':
          await this.serverRegistry.stopServer(options.name);
          await this.dynamicToolRegistry.removeServerTools(options.name);
          break;
        case 'restart':
          await this.serverRegistry.restartServer(options.name);
          const restartedServer = this.serverRegistry.getServer(options.name)!;
          await this.dynamicToolRegistry.removeServerTools(options.name);
          await this.dynamicToolRegistry.addServerTools(options.name, restartedServer);
          break;
        case 'remove':
          await this.serverRegistry.removeServerCompletely(options.name);
          await this.dynamicToolRegistry.removeServerTools(options.name);
          break;
      }

      return {
        content: [{
          type: 'text' as const,
          text: `✅ ${options.action}ed server '${options.name}'`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: `❌ Failed to ${options.action} server '${options.name}': ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  async listClaudeServers(): Promise<ToolCallResult> {
    try {
      const servers = await this.claudeConfigManager.listServers();
      
      const formattedServers = servers.map(server => ({
        name: server.name,
        command: server.command,
        args: server.args,
        env: server.env,
        mode: 'direct'
      }));

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(formattedServers, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: `❌ Failed to read Claude Desktop config: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  private async removeClaudeServer(name: string): Promise<ToolCallResult> {
    try {
      const removed = await this.claudeConfigManager.removeServer(name);
      
      if (!removed) {
        return {
          content: [{
            type: 'text' as const,
            text: `❌ Server '${name}' not found in Claude Desktop config.`
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text' as const,
          text: `✅ Removed '${name}' from Claude Desktop config.\n🔄 Please restart Claude Desktop for changes to take effect.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: `❌ Failed to remove server: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
}
