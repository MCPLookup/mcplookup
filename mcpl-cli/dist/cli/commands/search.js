// Search command - Enhanced server discovery with mcplookup.org
import { BaseCommand } from './base-command.js';
export class SearchCommand extends BaseCommand {
    async execute(query = '', options) {
        this.setVerbose(options.verbose || false);
        try {
            if (!query && !options.category) {
                this.error('Please provide a search query or category');
                this.info('Examples:');
                this.info('  mcpl search "email automation"');
                this.info('  mcpl search --category productivity');
                this.info('  mcpl search filesystem --verified');
                return;
            }
            const limit = parseInt(options.limit) || 10;
            if (options.smart && query) {
                await this.performSmartSearch(query, limit);
            }
            else {
                await this.performRegularSearch(query, options, limit);
            }
        }
        catch (error) {
            this.handleError(error, 'Search failed');
        }
    }
    async performSmartSearch(query, limit) {
        this.info(`🧠 Smart search for: "${query}"`);
        await this.withSpinner('Searching with AI...', async () => {
            const result = await this.bridge.api.smartDiscovery({
                query,
                limit
            });
            const response = JSON.parse(result.content[0].text);
            this.displaySmartResults(response);
        });
    }
    async performRegularSearch(query, options, limit) {
        this.info(`🔍 Searching for: "${query || 'servers'}"`);
        await this.withSpinner('Searching registry...', async () => {
            const searchParams = {
                limit
            };
            if (query)
                searchParams.query = query;
            if (options.category)
                searchParams.category = options.category;
            if (options.transport)
                searchParams.transport = options.transport;
            if (options.verified)
                searchParams.verified_only = true;
            const result = await this.bridge.api.discoverServers(searchParams);
            const response = JSON.parse(result.content[0].text);
            this.displayRegularResults(response);
        });
    }
    displaySmartResults(response) {
        if (!response.servers || response.servers.length === 0) {
            this.warn('No servers found matching your query');
            this.info('Try a different search term or use regular search');
            return;
        }
        console.log(`\n🎯 Found ${response.servers.length} relevant servers:\n`);
        response.servers.forEach((server, index) => {
            console.log(`${index + 1}. ${server.name}`);
            console.log(`   📝 ${server.description}`);
            if (server.npm_package) {
                console.log(`   📦 NPM: ${server.npm_package}`);
            }
            if (server.docker_image) {
                console.log(`   🐳 Docker: ${server.docker_image}`);
            }
            if (server.category) {
                console.log(`   🏷️  Category: ${server.category}`);
            }
            if (server.verified) {
                console.log(`   ✅ Verified`);
            }
            if (server.tools && server.tools.length > 0) {
                console.log(`   🔧 Tools: ${server.tools.slice(0, 3).join(', ')}${server.tools.length > 3 ? '...' : ''}`);
            }
            console.log('');
        });
        if (response.reasoning) {
            console.log(`💡 AI Reasoning: ${response.reasoning}`);
        }
        this.showInstallInstructions(response.servers[0]);
    }
    displayRegularResults(response) {
        if (!response.servers || response.servers.length === 0) {
            this.warn('No servers found matching your criteria');
            this.info('Try different search terms or remove filters');
            return;
        }
        console.log(`\n📋 Found ${response.servers.length} servers:\n`);
        const tableData = response.servers.map((server) => ({
            Name: server.name,
            Description: server.description?.substring(0, 50) + (server.description?.length > 50 ? '...' : ''),
            Category: server.category || 'N/A',
            Package: server.npm_package || server.docker_image || 'N/A',
            Verified: server.verified ? '✅' : '❌',
            Tools: server.tools?.length || 0
        }));
        this.formatOutput(tableData, 'table');
        if (response.servers.length > 0) {
            this.showInstallInstructions(response.servers[0]);
        }
    }
    showInstallInstructions(server) {
        console.log('\n💡 To install a server:');
        if (server.npm_package) {
            console.log(`  mcpl install ${server.npm_package}`);
            console.log(`  mcpl install ${server.npm_package} --mode bridge  # For instant testing`);
        }
        else if (server.docker_image) {
            console.log(`  mcpl install ${server.docker_image}`);
        }
        else {
            console.log(`  mcpl install "${server.name}"`);
        }
        console.log('\n🔍 For more details:');
        console.log(`  mcpl inspect "${server.name}"`);
    }
}
//# sourceMappingURL=search.js.map