// Install command - Enhanced Smithery parity with mcplookup.org integration
import { BaseCommand } from './base-command.js';
export class InstallCommand extends BaseCommand {
    async execute(packageName, options) {
        this.setVerbose(options.verbose || false);
        try {
            this.info(`Installing MCP server: ${packageName}`);
            this.debug(`Options: ${JSON.stringify(options, null, 2)}`);
            // Parse configuration
            const config = options.config ? this.parseJSON(options.config) : {};
            const env = options.env ? this.parseJSON(options.env) : {};
            // Resolve the actual package to install
            const resolvedPackage = await this.resolvePackage(packageName);
            this.debug(`Resolved package: ${JSON.stringify(resolvedPackage, null, 2)}`);
            // Dry run mode
            if (options.dryRun) {
                await this.performDryRun(resolvedPackage, options, config, env);
                return;
            }
            // Install based on mode
            if (options.mode === 'bridge') {
                await this.installBridgeMode(resolvedPackage, config, env, options);
            }
            else {
                await this.installDirectMode(resolvedPackage, config, env, options);
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
     * Resolve package name to actual installable package
     * Handles: NPM packages, Docker images, natural language queries
     */
    async resolvePackage(input) {
        // 1. Direct NPM package (e.g., @npmorg/package, package-name)
        if (this.isNpmPackage(input)) {
            return {
                packageName: input,
                displayName: input,
                type: 'npm',
                source: 'direct'
            };
        }
        // 2. Docker image (e.g., company/server:latest)
        if (this.isDockerImage(input)) {
            return {
                packageName: input,
                displayName: input,
                type: 'docker',
                source: 'direct'
            };
        }
        // 3. Natural language or server name - search mcplookup.org
        this.info(`🔍 Searching for: "${input}"`);
        return await this.searchForPackage(input);
    }
    isNpmPackage(input) {
        // NPM package patterns: @scope/name, package-name, etc.
        return /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(input) &&
            !input.includes(':') &&
            !input.includes(' ');
    }
    isDockerImage(input) {
        // Docker image patterns: name:tag, registry/name:tag, etc.
        return input.includes(':') && !input.includes(' ') && !input.startsWith('@');
    }
    async searchForPackage(query) {
        try {
            // First try smart discovery for better matching
            const smartResult = await this.bridge.api.smartDiscovery({
                query,
                limit: 5
            });
            const smartResponse = JSON.parse(smartResult.content[0].text);
            if (smartResponse.servers && smartResponse.servers.length > 0) {
                const server = smartResponse.servers[0]; // Take the best match
                // Prefer NPM package if available
                if (server.npm_package) {
                    return {
                        packageName: server.npm_package,
                        displayName: server.name,
                        description: server.description,
                        type: 'npm',
                        source: 'smart_search',
                        verified: server.verified
                    };
                }
                // Fall back to Docker if available
                if (server.docker_image) {
                    return {
                        packageName: server.docker_image,
                        displayName: server.name,
                        description: server.description,
                        type: 'docker',
                        source: 'smart_search',
                        verified: server.verified
                    };
                }
            }
            // Fall back to regular discovery
            const regularResult = await this.bridge.api.discoverServers({
                query,
                limit: 5
            });
            const regularResponse = JSON.parse(regularResult.content[0].text);
            if (regularResponse.servers && regularResponse.servers.length > 0) {
                const server = regularResponse.servers[0];
                if (server.npm_package) {
                    return {
                        packageName: server.npm_package,
                        displayName: server.name,
                        description: server.description,
                        type: 'npm',
                        source: 'registry_search',
                        verified: server.verified
                    };
                }
                if (server.docker_image) {
                    return {
                        packageName: server.docker_image,
                        displayName: server.name,
                        description: server.description,
                        type: 'docker',
                        source: 'registry_search',
                        verified: server.verified
                    };
                }
            }
            throw new Error(`No installable package found for: "${query}"`);
        }
        catch (error) {
            throw new Error(`Search failed for "${query}": ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async performDryRun(resolvedPackage, options, config, env) {
        this.info('🔍 Dry run mode - showing what would be installed:');
        const runtimeInfo = this.getRuntimeInfo(resolvedPackage.type, options.mode, options.globalInstall);
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
    `);
        if (options.mode === 'direct') {
            this.warn('Direct mode installation would require Claude Desktop restart');
        }
        this.info('Use --force to proceed with actual installation');
    }
    async installBridgeMode(resolvedPackage, config, env, options) {
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
                name: this.generateServerName(resolvedPackage.packageName),
                type: resolvedPackage.type,
                command: resolvedPackage.packageName,
                mode: 'bridge',
                auto_start: options.autoStart,
                env: { ...env, ...config }
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
    async installDirectMode(resolvedPackage, config, env, options) {
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
        const runtimeInfo = this.getRuntimeInfo(resolvedPackage.type, 'direct', options.globalInstall);
        this.info(`🏃 Runtime: ${runtimeInfo}`);
        // For npm packages with global install, perform npm install -g
        if (resolvedPackage.type === 'npm' && options.globalInstall) {
            await this.performGlobalNpmInstall(resolvedPackage.packageName);
        }
        await this.withSpinner('Adding to Claude Desktop configuration...', async () => {
            const result = await this.bridge.api.installServer({
                name: this.generateServerName(resolvedPackage.packageName),
                type: resolvedPackage.type,
                command: resolvedPackage.packageName,
                mode: 'direct',
                global_install: options.globalInstall,
                env: { ...env, ...config }
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