// Server management tools for bridge and direct modes
import { z } from 'zod';
import { InstallationResolver } from '@mcplookup-org/mcp-sdk';
import { createSuccessResult, createErrorResult, executeWithErrorHandling } from '@mcplookup-org/mcp-sdk';
export class ServerManagementTools {
    serverRegistry;
    claudeConfigManager;
    dockerManager;
    dynamicToolRegistry;
    installationResolver;
    constructor(serverRegistry, claudeConfigManager, dockerManager, dynamicToolRegistry) {
        this.serverRegistry = serverRegistry;
        this.claudeConfigManager = claudeConfigManager;
        this.dockerManager = dockerManager;
        this.dynamicToolRegistry = dynamicToolRegistry;
        this.installationResolver = new InstallationResolver();
    }
    /**
     * Register all server management tools with the MCP server
     */
    registerTools(server) {
        this.registerInstallationTools(server);
        this.registerBridgeModeTools(server);
        this.registerDirectModeTools(server);
    }
    registerInstallationTools(server) {
        // Tool: Install MCP server (enhanced with SDK package resolution)
        server.tool('install_mcp_server', {
            package_query: z.string().describe('Package name, Docker image, or natural language description of the server to install'),
            name: z.string().optional().describe('Custom local name for the server (auto-generated if not provided)'),
            mode: z.enum(['bridge', 'direct']).default('bridge').describe('Installation mode: bridge (dynamic) or direct (Claude config)'),
            auto_start: z.boolean().default(true).describe('Start server immediately after install (bridge mode only)'),
            global_install: z.boolean().default(false).describe('Install npm package globally (direct mode only, like Smithery)'),
            env: z.record(z.string()).optional().describe('Environment variables for the server')
        }, async (options) => this.installServerWithSDK(options));
    }
    registerBridgeModeTools(server) {
        // Tool: List managed servers
        server.tool('list_managed_servers', {}, async () => this.listManagedServers());
        // Tool: Control MCP server
        server.tool('control_mcp_server', {
            name: z.string().describe('Server name'),
            action: z.enum(['start', 'stop', 'restart', 'remove']).describe('Action to perform')
        }, async (options) => this.controlServer(options));
    }
    registerDirectModeTools(server) {
        // Tool: List Claude Desktop servers
        server.tool('list_claude_servers', {}, async () => this.listClaudeServers());
        // Tool: Remove server from Claude Desktop config
        server.tool('remove_claude_server', {
            name: z.string().describe('Server name to remove from Claude Desktop config')
        }, async ({ name }) => this.removeClaudeServer(name));
    }
    // Implementation methods - SDK-powered installation
    async installServerWithSDK(options) {
        return executeWithErrorHandling(async () => {
            // Step 1: Use SDK to resolve the package query to actual package
            const resolvedPackage = await this.installationResolver.resolvePackage(options.package_query);
            // Step 2: Generate server name if not provided
            const serverName = options.name || this.installationResolver.generateServerName(resolvedPackage.packageName);
            // Step 3: Create installation context
            const context = {
                mode: options.mode,
                platform: process.platform,
                globalInstall: options.global_install,
                client: 'mcp-bridge',
                verbose: true
            };
            // Step 4: Get installation instructions from SDK
            const instructions = await this.installationResolver.getInstallationInstructions(resolvedPackage, context);
            // Step 5: Install based on mode using SDK instructions
            if (options.mode === 'direct') {
                return await this.installDirectModeWithSDK(resolvedPackage, serverName, instructions, options.env || {});
            }
            else {
                return await this.installBridgeModeWithSDK(resolvedPackage, serverName, instructions, options);
            }
        }, `Failed to install server from query: "${options.package_query}"`);
    }
    async installBridgeModeWithSDK(resolvedPackage, serverName, instructions, options) {
        if (this.serverRegistry.hasServer(serverName)) {
            return createErrorResult(new Error(`Server '${serverName}' already exists`), 'Server already exists');
        }
        const server = {
            name: serverName,
            type: resolvedPackage.type,
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
        }
        else if (resolvedPackage.type === 'docker') {
            if (instructions.env_vars && Object.keys(instructions.env_vars).length > 0) {
                server.command = this.dockerManager.addEnvironmentVariables(server.command, { ...options.env, ...instructions.env_vars });
            }
        }
        if (options.auto_start) {
            await this.serverRegistry.startServer(serverName);
            await this.dynamicToolRegistry.addServerTools(serverName, server);
        }
        return createSuccessResult(`✅ Installed ${resolvedPackage.displayName || resolvedPackage.packageName} as '${serverName}' (${resolvedPackage.type}, bridge mode)
📦 Package: ${resolvedPackage.packageName}
${resolvedPackage.description ? `📝 Description: ${resolvedPackage.description}` : ''}
${resolvedPackage.verified ? '🔐 Verified server' : '⚠️ Unverified server'}
${options.auto_start ?
            `🚀 Server started and tools available with prefix: ${serverName}_` :
            '⏳ Use control_mcp_server to start.'}

💡 Installation steps completed:
${instructions.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`);
    }
    async installDirectModeWithSDK(resolvedPackage, serverName, instructions, env) {
        // Check if server already exists in Claude config
        if (await this.claudeConfigManager.hasServer(serverName)) {
            return createErrorResult(new Error(`Server '${serverName}' already exists in Claude Desktop config`), 'Server already exists in Claude config');
        }
        // Generate Claude Desktop configuration using SDK
        const context = {
            mode: 'direct',
            platform: process.platform,
            client: 'claude-desktop'
        };
        const claudeConfig = this.installationResolver.generateClaudeConfig(resolvedPackage, context, { ...env, ...instructions.env_vars });
        // Extract the server config from the generated Claude config
        const serverConfig = Object.values(claudeConfig.mcpServers)[0];
        // Add server to Claude Desktop config using SDK-generated configuration
        await this.claudeConfigManager.addServer(serverName, serverConfig.command, serverConfig.args || [], serverConfig.env || {});
        const configPath = await this.claudeConfigManager.getConfigPath();
        const runtimeInfo = this.installationResolver.getRuntimeInfo(resolvedPackage.type, 'direct', false // global install handled by SDK
        );
        return createSuccessResult(`✅ Installed ${resolvedPackage.displayName || resolvedPackage.packageName} as '${serverName}' in Claude Desktop config
📦 Package: ${resolvedPackage.packageName}
${resolvedPackage.description ? `📝 Description: ${resolvedPackage.description}` : ''}
${resolvedPackage.verified ? '🔐 Verified server' : '⚠️ Unverified server'}
📋 Config updated at: ${configPath}
🏃 Runtime: ${runtimeInfo}
🔄 Please restart Claude Desktop to use the server.

💡 Installation steps completed:
${instructions.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

🔧 Generated command: ${instructions.command}
📝 Generated args: ${instructions.args.join(' ')}`);
    }
    async listManagedServers() {
        const servers = this.serverRegistry.listServers().map(server => ({
            name: server.name,
            type: server.type,
            status: server.status,
            tools: server.tools,
            endpoint: server.endpoint
        }));
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(servers, null, 2)
                }]
        };
    }
    async controlServer(options) {
        try {
            if (!this.serverRegistry.hasServer(options.name)) {
                return {
                    content: [{
                            type: 'text',
                            text: `❌ Server '${options.name}' not found. Use list_managed_servers to see available servers.`
                        }],
                    isError: true
                };
            }
            switch (options.action) {
                case 'start':
                    await this.serverRegistry.startServer(options.name);
                    const server = this.serverRegistry.getServer(options.name);
                    await this.dynamicToolRegistry.addServerTools(options.name, server);
                    break;
                case 'stop':
                    await this.serverRegistry.stopServer(options.name);
                    await this.dynamicToolRegistry.removeServerTools(options.name);
                    break;
                case 'restart':
                    await this.serverRegistry.restartServer(options.name);
                    const restartedServer = this.serverRegistry.getServer(options.name);
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
                        type: 'text',
                        text: `✅ ${options.action}ed server '${options.name}'`
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `❌ Failed to ${options.action} server '${options.name}': ${error instanceof Error ? error.message : 'Unknown error'}`
                    }],
                isError: true
            };
        }
    }
    async listClaudeServers() {
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
                        type: 'text',
                        text: JSON.stringify(formattedServers, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `❌ Failed to read Claude Desktop config: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }],
                isError: true
            };
        }
    }
    async removeClaudeServer(name) {
        try {
            const removed = await this.claudeConfigManager.removeServer(name);
            if (!removed) {
                return {
                    content: [{
                            type: 'text',
                            text: `❌ Server '${name}' not found in Claude Desktop config.`
                        }],
                    isError: true
                };
            }
            return {
                content: [{
                        type: 'text',
                        text: `✅ Removed '${name}' from Claude Desktop config.\n🔄 Please restart Claude Desktop for changes to take effect.`
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `❌ Failed to remove server: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }],
                isError: true
            };
        }
    }
}
//# sourceMappingURL=server-management-tools.js.map