// Inspect command - Server details and interactive testing
import { BaseCommand } from './base-command.js';
export class InspectCommand extends BaseCommand {
    async execute(server, options) {
        this.setVerbose(options.verbose || false);
        try {
            this.info(`🔍 Inspecting server: ${server}`);
            const serverInfo = await this.findServer(server);
            if (!serverInfo) {
                this.error(`Server not found: ${server}`);
                return;
            }
            await this.displayServerInfo(serverInfo, options);
            if (options.interactive) {
                await this.interactiveMode(serverInfo);
            }
        }
        catch (error) {
            this.handleError(error, 'Inspection failed');
        }
    }
    async findServer(serverName) {
        // Search in bridge mode
        try {
            const bridgeResult = await this.bridge.components.serverManagementTools['listManagedServers']();
            const bridgeServers = JSON.parse(bridgeResult.content[0].text);
            const found = bridgeServers.find((s) => s.name === serverName);
            if (found)
                return { ...found, mode: 'bridge' };
        }
        catch (error) {
            this.debug(`Bridge search failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        // Search in direct mode
        try {
            const directResult = await this.bridge.components.serverManagementTools['listClaudeServers']();
            const directServers = JSON.parse(directResult.content[0].text);
            const found = directServers.find((s) => s.name === serverName);
            if (found)
                return { ...found, mode: 'direct' };
        }
        catch (error) {
            this.debug(`Direct search failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        return null;
    }
    async displayServerInfo(server, options) {
        console.log(`\n📋 Server Information:`);
        console.log(`Name: ${server.name}`);
        console.log(`Mode: ${server.mode}`);
        if (server.type)
            console.log(`Type: ${server.type}`);
        if (server.status)
            console.log(`Status: ${server.status}`);
        if (server.command)
            console.log(`Command: ${server.command}`);
        if (server.args)
            console.log(`Args: ${server.args.join(' ')}`);
        if (options.config || !options.tools && !options.health) {
            await this.showConfiguration(server);
        }
        if (options.tools || !options.config && !options.health) {
            await this.showTools(server);
        }
        if (options.health || !options.config && !options.tools) {
            await this.showHealth(server);
        }
    }
    async showConfiguration(server) {
        console.log(`\n⚙️ Configuration:`);
        if (server.env && Object.keys(server.env).length > 0) {
            console.log(`Environment variables:`);
            Object.entries(server.env).forEach(([key, value]) => {
                console.log(`  ${key}: ${value}`);
            });
        }
        else {
            console.log(`No environment variables configured`);
        }
    }
    async showTools(server) {
        console.log(`\n🔧 Available Tools:`);
        if (server.tools && server.tools.length > 0) {
            server.tools.forEach((tool, index) => {
                const displayName = server.mode === 'bridge' ? tool : tool.replace(`${server.name}_`, '');
                console.log(`${index + 1}. ${displayName}`);
            });
        }
        else {
            console.log(`No tools available (server may not be running)`);
        }
    }
    async showHealth(server) {
        console.log(`\n🏥 Health Status:`);
        if (server.mode === 'bridge') {
            try {
                const health = await this.bridge.components.serverRegistry.getServerHealth(server.name);
                console.log(`Status: ${health.status}`);
                console.log(`Tool count: ${health.toolCount}`);
                if (health.lastError) {
                    console.log(`Last error: ${health.lastError}`);
                }
            }
            catch (error) {
                console.log(`Health check failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        else {
            console.log(`Health checks not available for direct mode servers`);
        }
    }
    async interactiveMode(server) {
        if (server.mode !== 'bridge' || !server.tools || server.tools.length === 0) {
            this.warn('Interactive mode only available for running bridge mode servers with tools');
            return;
        }
        this.info('🎮 Entering interactive mode...');
        console.log('Type "exit" to quit, "help" for commands\n');
        while (true) {
            try {
                const input = await this.prompt('> ');
                if (input.toLowerCase() === 'exit') {
                    break;
                }
                if (input.toLowerCase() === 'help') {
                    this.showInteractiveHelp(server);
                    continue;
                }
                await this.executeInteractiveCommand(server, input);
            }
            catch (error) {
                this.error(`Command failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        this.info('👋 Exiting interactive mode');
    }
    showInteractiveHelp(server) {
        console.log('Available commands:');
        console.log('  help     - Show this help');
        console.log('  exit     - Exit interactive mode');
        console.log('  tools    - List available tools');
        console.log('  call <tool> <args> - Call a tool with JSON args');
        console.log('\nAvailable tools:');
        server.tools.forEach((tool) => {
            console.log(`  ${tool}`);
        });
    }
    async executeInteractiveCommand(server, input) {
        const parts = input.trim().split(' ');
        const command = parts[0].toLowerCase();
        switch (command) {
            case 'tools':
                this.showTools(server);
                break;
            case 'call':
                if (parts.length < 2) {
                    this.error('Usage: call <tool> [args]');
                    return;
                }
                await this.callTool(server, parts[1], parts.slice(2).join(' '));
                break;
            default:
                this.error(`Unknown command: ${command}. Type "help" for available commands.`);
        }
    }
    async callTool(server, toolName, argsString) {
        try {
            const args = argsString ? this.parseJSON(argsString, {}) : {};
            // For bridge mode, tools are prefixed
            const fullToolName = server.mode === 'bridge' ? `${server.name}_${toolName}` : toolName;
            this.info(`Calling ${fullToolName}...`);
            // This would need to be implemented to actually call the tool
            // For now, just show what would be called
            console.log(`Tool: ${fullToolName}`);
            console.log(`Args: ${JSON.stringify(args, null, 2)}`);
        }
        catch (error) {
            this.error(`Tool call failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
//# sourceMappingURL=inspect.js.map