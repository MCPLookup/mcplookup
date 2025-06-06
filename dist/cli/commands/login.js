// Login command - API key management
import { BaseCommand } from './base-command.js';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
export class LoginCommand extends BaseCommand {
    configDir = join(homedir(), '.mcpl');
    configFile = join(this.configDir, 'config.json');
    async execute(options) {
        this.setVerbose(options.verbose || false);
        try {
            let apiKey = options.key;
            if (!apiKey) {
                apiKey = await this.promptForApiKey();
            }
            if (!apiKey) {
                this.error('API key is required');
                return;
            }
            await this.validateApiKey(apiKey);
            await this.saveApiKey(apiKey);
            this.success('Successfully logged in to MCPLookup');
            this.info('API key saved to ~/.mcpl/config.json');
        }
        catch (error) {
            this.handleError(error, 'Login failed');
        }
    }
    async promptForApiKey() {
        console.log('🔑 MCPLookup Login');
        console.log('Get your API key from: https://mcplookup.org/dashboard');
        console.log('');
        return await this.prompt('Enter your MCPLookup API key:');
    }
    async validateApiKey(apiKey) {
        this.info('Validating API key...');
        try {
            // Test the API key by making a simple request
            const testBridge = new (await import('@mcplookup-org/mcp-server')).MCPLookupBridge(apiKey);
            await testBridge.api.getOnboardingState();
        }
        catch (error) {
            throw new Error('Invalid API key or network error');
        }
    }
    async saveApiKey(apiKey) {
        try {
            // Ensure config directory exists
            await mkdir(this.configDir, { recursive: true });
            // Read existing config or create new
            let config = {};
            try {
                const existing = await readFile(this.configFile, 'utf-8');
                config = JSON.parse(existing);
            }
            catch {
                // File doesn't exist, start with empty config
            }
            // Update API key
            config.apiKey = apiKey;
            config.lastLogin = new Date().toISOString();
            // Save config
            await writeFile(this.configFile, JSON.stringify(config, null, 2));
        }
        catch (error) {
            throw new Error(`Failed to save API key: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
//# sourceMappingURL=login.js.map