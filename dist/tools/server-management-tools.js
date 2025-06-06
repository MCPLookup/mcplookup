// Server management tools for bridge and direct modes
import { z } from 'zod';
import { createErrorResult, executeWithErrorHandling } from '@mcplookup-org/mcp-sdk/utils';
import { validateInstallOptions } from '@mcplookup-org/mcp-sdk/utils';
export class ServerManagementTools {
    serverRegistry;
    claudeConfigManager;
    dockerManager;
    dynamicToolRegistry;
    constructor(serverRegistry, claudeConfigManager, dockerManager, dynamicToolRegistry) {
        this.serverRegistry = serverRegistry;
        this.claudeConfigManager = claudeConfigManager;
        this.dockerManager = dockerManager;
        this.dynamicToolRegistry = dynamicToolRegistry;
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
        // Tool: Install MCP server (enhanced with installation modes)
        server.tool('install_mcp_server', {
            name: z.string().describe('Local name for the server'),
            type: z.enum(['docker', 'npm']).describe('Installation type'),
            command: z.string().describe('Docker command or npm package name'),
            mode: z.enum(['bridge', 'direct']).default('bridge').describe('Installation mode: bridge (dynamic) or direct (Claude config)'),
            auto_start: z.boolean().default(true).describe('Start server immediately after install (bridge mode only)'),
            global_install: z.boolean().default(false).describe('Install npm package globally (direct mode only, like Smithery)'),
            env: z.record(z.string()).optional().describe('Environment variables for the server')
        }, async (options) => this.installServer(options));
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
    // Implementation methods
    async installServer(options) {
        // Validate installation options
        const validation = validateInstallOptions(options);
        if (!validation.isValid) {
            return createErrorResult(new Error(validation.errors.join('; ')), 'Invalid installation options');
        }
        return executeWithErrorHandling(async () => {
            if (options.mode === 'direct') {
                return await this.installDirectMode(options);
            }
            else {
                return await this.installBridgeMode(options);
            }
        }, `Failed to install ${options.name}`);
    }
    async installBridgeMode(options) {
        if (this.serverRegistry.hasServer(options.name)) {
            return {
                content: [{
                        type: 'text',
                        text: `❌ Server '${options.name}' already exists. Use control_mcp_server to manage it.`
                    }],
                isError: true
            };
        }
        const server = {
            name: options.name,
            type: options.type,
            mode: 'bridge',
            command: options.type === 'docker' ? options.command.split(' ') : ['npx', options.command],
            tools: [],
            status: 'installing'
        };
        this.serverRegistry.addServer(server);
        if (options.type === 'npm') {
            // For npm packages, dockerize them using centralized method
            // Environment variables are handled inside dockerizeNpmServer
            await this.dockerManager.dockerizeNpmServer(server, options.env || {});
        }
        else if (options.type === 'docker') {
            // Add environment variables to existing Docker command if provided
            if (options.env && Object.keys(options.env).length > 0) {
                server.command = this.dockerManager.addEnvironmentVariables(server.command, options.env);
            }
        }
        if (options.auto_start) {
            await this.serverRegistry.startServer(options.name);
            // Register dynamic tools
            await this.dynamicToolRegistry.addServerTools(options.name, server);
        }
        return {
            content: [{
                    type: 'text',
                    text: `✅ Installed ${options.name} (${options.type}, bridge mode)\n${options.auto_start ? 'Server started and tools available with prefix: ' + options.name + '_' : 'Use control_mcp_server to start.'}`
                }]
        };
    }
    async installDirectMode(options) {
        // Check if server already exists in Claude config
        if (await this.claudeConfigManager.hasServer(options.name)) {
            return {
                content: [{
                        type: 'text',
                        text: `❌ Server '${options.name}' already exists in Claude Desktop config. Remove it first or use a different name.`
                    }],
                isError: true
            };
        }
        // Add server to Claude Desktop config
        if (options.type === 'docker') {
            const dockerArgs = options.command.split(' ').slice(1); // Remove 'docker' command
            await this.claudeConfigManager.addServer(options.name, 'docker', dockerArgs, options.env || {});
        }
        else {
            // npm package handling
            if (options.global_install) {
                // Smithery-style: use the package name directly (assumes global install)
                // Extract package name from scoped packages (@org/pkg -> pkg)
                const packageName = options.command.includes('/')
                    ? options.command.split('/').pop() || options.command
                    : options.command;
                await this.claudeConfigManager.addServer(options.name, packageName, [], options.env || {});
            }
            else {
                // Default: Dockerize the npx command using centralized Docker manager
                const dockerArgs = this.dockerManager.createDirectModeDockerArgs(options.command, options.env || {});
                await this.claudeConfigManager.addServer(options.name, 'docker', dockerArgs, {} // env already included in docker command
                );
            }
        }
        const configPath = await this.claudeConfigManager.getConfigPath();
        const installMethod = options.global_install ? 'host (Smithery-style)' : 'Docker container';
        return {
            content: [{
                    type: 'text',
                    text: `✅ Installed ${options.name} in Claude Desktop config (direct mode)\n📋 Config updated at: ${configPath}\n🔄 Please restart Claude Desktop to use the server.\n\n🏃 Runtime: ${installMethod}\nServer will be available as: ${options.name}`
                }]
        };
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