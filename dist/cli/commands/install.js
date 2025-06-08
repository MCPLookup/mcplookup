// Install command - Enhanced Smithery parity with mcplookup.org integration
import { BaseCommand } from './base-command.js';
import { InstallationResolver } from '@mcplookup-org/mcp-sdk';
export class InstallCommand extends BaseCommand {
    resolver;
    constructor(bridge) {
        super(bridge);
        this.resolver = new InstallationResolver();
    }
    async execute(packageName, options) {
        this.setVerbose(options.verbose || false);
        try {
            this.info(`Installing MCP server: ${packageName}`);
            this.debug(`Options: ${JSON.stringify(options, null, 2)}`);
            // Parse configuration
            const config = options.config ? this.parseJSON(options.config) : {};
            const env = options.env ? this.parseJSON(options.env) : {};
            // Create installation context
            const context = {
                mode: options.mode,
                platform: process.platform,
                globalInstall: options.globalInstall,
                client: options.client,
                dryRun: options.dryRun,
                verbose: options.verbose
            };
            // Resolve the actual package to install using SDK
            const resolvedPackage = await this.resolvePackage(packageName);
            this.debug(`Resolved package: ${JSON.stringify(resolvedPackage, null, 2)}`);
            // Get installation instructions from SDK
            const instructions = await this.resolver.getInstallationInstructions(resolvedPackage, context);
            // Dry run mode
            if (options.dryRun) {
                await this.performDryRun(resolvedPackage, options, config, env, instructions);
                return;
            }
            // Install based on mode
            if (options.mode === 'bridge') {
                await this.installBridgeMode(resolvedPackage, config, env, options, instructions);
            }
            else {
                await this.installDirectMode(resolvedPackage, config, env, options, instructions);
            }
            this.success(`Successfully installed ${resolvedPackage.displayName || resolvedPackage.packageName}`);
            // Post-installation instructions
            this.showPostInstallInstructions(options.mode, options.client);
        }
        catch (error) {
            this.handleError(error, 'Installation failed');
        }
    }
    /**
     * Resolve package name using SDK utilities
     */
    async resolvePackage(input) {
        this.info(`🔍 Resolving package: "${input}"`);
        try {
            const resolved = await this.resolver.resolvePackage(input);
            if (resolved.source === 'smart_search') {
                this.info(`✅ Found: ${resolved.displayName}`);
                if (resolved.description) {
                    this.info(`📝 ${resolved.description}`);
                }
                if (resolved.verified) {
                    this.info('🔐 Verified server');
                }
            }
            return resolved;
        }
        catch (error) {
            throw new Error(`Failed to resolve package "${input}": ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async performDryRun(resolvedPackage, options, config, env, instructions) {
        this.info('🔍 Dry run mode - showing what would be installed:');
        const runtimeInfo = this.resolver.getRuntimeInfo(resolvedPackage.type, options.mode, options.globalInstall);
        console.log(`
📦 Package: ${resolvedPackage.packageName}
🏷️  Display Name: ${resolvedPackage.displayName}
📝 Description: ${resolvedPackage.description || 'N/A'}
🎯 Client: ${options.client}
🔧 Mode: ${options.mode}
📋 Type: ${resolvedPackage.type}
🔍 Source: ${resolvedPackage.source}
${resolvedPackage.verified ? '✅ Verified' : '⚠️  Unverified'}
🏃 Runtime: ${runtimeInfo}
⚙️ Config: ${Object.keys(config).length} keys
🌍 Environment: ${Object.keys(env).length} variables
🚀 Auto-start: ${options.autoStart}

📋 Installation Steps:
${instructions.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

🔧 Command: ${instructions.command}
📝 Args: ${instructions.args.join(' ')}
    `);
        if (options.mode === 'direct') {
            this.warn('Direct mode installation would require Claude Desktop restart');
        }
        this.info('Use --force to proceed with actual installation');
    }
    async installBridgeMode(resolvedPackage, config, env, options, instructions) {
        this.info('Installing in bridge mode (dynamic, no restart required)');
        // Show what we're installing
        if (resolvedPackage.source !== 'direct') {
            this.info(`📦 Installing: ${resolvedPackage.displayName}`);
            if (resolvedPackage.description) {
                this.info(`📝 ${resolvedPackage.description}`);
            }
            if (resolvedPackage.verified) {
                this.info('✅ This is a verified server');
            }
        }
        await this.withSpinner('Installing server...', async () => {
            const result = await this.bridge.api.installServer({
                name: this.resolver.generateServerName(resolvedPackage.packageName),
                type: resolvedPackage.type,
                command: instructions.command,
                args: instructions.args,
                mode: 'bridge',
                auto_start: options.autoStart,
                env: { ...env, ...config, ...instructions.env_vars }
            });
            if (result.isError) {
                throw new Error(result.content[0].text);
            }
        });
        this.success('Server installed and ready to use immediately!');
        if (options.autoStart) {
            this.info('Server is running and tools are available with prefix');
        }
    }
    async installDirectMode(resolvedPackage, config, env, options, instructions) {
        this.info('Installing in direct mode (permanent, requires restart)');
        // Show what we're installing
        if (resolvedPackage.source !== 'direct') {
            this.info(`📦 Installing: ${resolvedPackage.displayName}`);
            if (resolvedPackage.description) {
                this.info(`📝 ${resolvedPackage.description}`);
            }
            if (resolvedPackage.verified) {
                this.info('✅ This is a verified server');
            }
        }
        // Show runtime information
        const runtimeInfo = this.resolver.getRuntimeInfo(resolvedPackage.type, 'direct', options.globalInstall);
        this.info(`🏃 Runtime: ${runtimeInfo}`);
        // For npm packages with global install, perform npm install -g
        if (resolvedPackage.type === 'npm' && options.globalInstall) {
            await this.performGlobalNpmInstall(resolvedPackage.packageName);
        }
        await this.withSpinner('Adding to Claude Desktop configuration...', async () => {
            // Generate Claude config using SDK utilities
            const context = {
                mode: options.mode,
                platform: process.platform,
                globalInstall: options.globalInstall,
                client: options.client
            };
            const claudeConfig = this.resolver.generateClaudeConfig(resolvedPackage, context, { ...env, ...config, ...instructions.env_vars });
            const result = await this.bridge.api.installServer({
                name: this.resolver.generateServerName(resolvedPackage.packageName),
                type: resolvedPackage.type,
                command: instructions.command,
                args: instructions.args,
                mode: 'direct',
                global_install: options.globalInstall,
                claude_config: claudeConfig.mcpServers,
                env: { ...env, ...config, ...instructions.env_vars }
            });
            if (result.isError) {
                throw new Error(result.content[0].text);
            }
        });
        this.success('Server added to Claude Desktop configuration');
        if (options.globalInstall && resolvedPackage.type === 'npm') {
            this.info('🏠 Package runs directly on host (Smithery-style)');
        }
        else if (resolvedPackage.type === 'npm') {
            this.info('🐳 Package runs in Docker container (secure isolation)');
        }
        else {
            this.info('🐳 Docker image runs in container');
        }
    }
    async performGlobalNpmInstall(packageName) {
        const { spawn } = await import('child_process');
        await this.withSpinner(`Installing ${packageName} globally...`, async () => {
            return new Promise((resolve, reject) => {
                const npmProcess = spawn('npm', ['install', '-g', packageName], {
                    stdio: this.verbose ? 'inherit' : 'pipe'
                });
                npmProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    }
                    else {
                        reject(new Error(`npm install failed with code ${code}`));
                    }
                });
                npmProcess.on('error', (error) => {
                    reject(new Error(`Failed to run npm install: ${error.message}`));
                });
            });
        });
    }
    generateServerName(packageName) {
        // Generate a clean server name from package name
        return packageName
            .replace(/[@\/]/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase();
    }
    getRuntimeInfo(type, mode, globalInstall) {
        if (mode === 'bridge') {
            return type === 'docker' ? 'Docker container (bridge)' : 'Docker container (npm via npx)';
        }
        // Direct mode
        if (type === 'docker') {
            return 'Docker container (direct)';
        }
        // NPM package in direct mode
        if (globalInstall) {
            return 'Host system (Smithery-style)';
        }
        else {
            return 'Docker container (npm via npx)';
        }
    }
    showPostInstallInstructions(mode, client) {
        console.log('\n📋 Next Steps:');
        if (mode === 'direct') {
            this.warn(`Please restart ${client} to use the installed server`);
            this.info('After restart, tools will be available with their native names');
        }
        else {
            this.info('Server is ready to use immediately!');
            this.info('Tools are available with the server name prefix');
            this.info('Use "mcpl status" to see running servers');
        }
        console.log('\n💡 Useful commands:');
        console.log('  mcpl status          - Check server status');
        console.log('  mcpl inspect <name>  - Inspect server details');
        console.log('  mcpl health          - Run health checks');
    }
}
//# sourceMappingURL=install.js.map