// List command - Enhanced listing with multiple modes

import { BaseCommand } from './base-command.js';

export interface ListOptions {
  client: string;
  mode: 'direct' | 'bridge' | 'all';
  format: 'table' | 'json' | 'yaml';
  status?: boolean;
  verbose?: boolean;
}

export class ListCommand extends BaseCommand {
  async execute(type: string = 'servers', options: ListOptions): Promise<void> {
    this.setVerbose(options.verbose || false);

    try {
      switch (type.toLowerCase()) {
        case 'servers':
        case 'installed':
          await this.listServers(options);
          break;
        case 'clients':
          await this.listClients(options);
          break;
        case 'available':
          await this.listAvailable(options);
          break;
        default:
          this.error(`Unknown list type: ${type}`);
          this.info('Available types: servers, clients, available');
          break;
      }
    } catch (error) {
      this.handleError(error, 'List operation failed');
    }
  }

  private async listServers(options: ListOptions): Promise<void> {
    this.info('📋 Listing installed MCP servers...');

    const servers: any[] = [];

    // Get bridge mode servers
    if (options.mode === 'bridge' || options.mode === 'all') {
      try {
        const bridgeResult = await this.bridge.api.listManagedServers();
        const bridgeServers = JSON.parse(bridgeResult.content[0].text);

        bridgeServers.forEach((server: any) => {
          servers.push({
            ...server,
            mode: 'bridge',
            client: 'bridge'
          });
        });
      } catch (error) {
        this.debug(`Failed to get bridge servers: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Get direct mode servers
    if (options.mode === 'direct' || options.mode === 'all') {
      try {
        const directResult = await this.bridge.api.listClaudeServers();
        const directServers = JSON.parse(directResult.content[0].text);

        directServers.forEach((server: any) => {
          servers.push({
            name: server.name,
            command: server.command,
            args: server.args.join(' '),
            mode: 'direct',
            client: 'claude',
            status: 'configured',
            tools: []
          });
        });
      } catch (error) {
        this.debug(`Failed to get direct servers: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (servers.length === 0) {
      this.warn('No servers found');
      this.info('Install a server with: mcpl install <package>');
      return;
    }

    // Add status information if requested
    if (options.status) {
      await this.addStatusInformation(servers);
    }

    // Format and display results
    this.displayServers(servers, options);
  }

  private async addStatusInformation(servers: any[]): Promise<void> {
    this.debug('Adding status information...');
    
    for (const server of servers) {
      if (server.mode === 'bridge') {
        try {
          const health = await this.bridge.components.serverRegistry.getServerHealth(server.name);
          server.health = health;
          server.toolCount = health.toolCount;
        } catch (error) {
          this.debug(`Failed to get health for ${server.name}: ${error instanceof Error ? error.message : String(error)}`);
          server.health = { status: 'unknown' };
        }
      }
    }
  }

  private displayServers(servers: any[], options: ListOptions): void {
    if (options.format === 'json') {
      console.log(JSON.stringify(servers, null, 2));
      return;
    }

    if (options.format === 'yaml') {
      this.formatOutput(servers, 'yaml');
      return;
    }

    // Table format
    console.log(`\n📊 Found ${servers.length} servers:\n`);

    const tableData = servers.map(server => {
      const row: any = {
        Name: server.name,
        Mode: server.mode,
        Status: this.getStatusDisplay(server),
        Tools: server.tools?.length || server.toolCount || 0
      };

      if (options.status && server.mode === 'bridge') {
        row.Health = server.health?.status || 'unknown';
      }

      return row;
    });

    this.formatOutput(tableData, 'table');

    // Show summary
    const bridgeCount = servers.filter(s => s.mode === 'bridge').length;
    const directCount = servers.filter(s => s.mode === 'direct').length;
    const runningCount = servers.filter(s => s.status === 'running').length;

    console.log(`\n📈 Summary:`);
    console.log(`  Bridge mode: ${bridgeCount}`);
    console.log(`  Direct mode: ${directCount}`);
    console.log(`  Running: ${runningCount}`);

    this.showManagementTips();
  }

  private getStatusDisplay(server: any): string {
    if (server.mode === 'direct') {
      return '⚙️ configured';
    }

    switch (server.status) {
      case 'running':
        return '🟢 running';
      case 'stopped':
        return '🔴 stopped';
      case 'error':
        return '❌ error';
      case 'installing':
        return '🔄 installing';
      default:
        return '❓ unknown';
    }
  }

  private async listClients(options: ListOptions): Promise<void> {
    this.info('📱 Available MCP clients:');

    const clients = [
      {
        name: 'claude',
        description: 'Claude Desktop (Anthropic)',
        supported: true,
        configPath: await this.getClaudeConfigPath()
      },
      {
        name: 'cursor',
        description: 'Cursor IDE',
        supported: false,
        note: 'Coming soon'
      },
      {
        name: 'vscode',
        description: 'Visual Studio Code',
        supported: false,
        note: 'Planned'
      }
    ];

    this.formatOutput(clients, options.format);
  }

  private async getClaudeConfigPath(): Promise<string> {
    try {
      return await this.bridge.components.claudeConfigManager.getConfigPath();
    } catch {
      return 'Not found';
    }
  }

  private async listAvailable(options: ListOptions): Promise<void> {
    this.info('🌐 Searching available servers...');

    try {
      const result = await this.bridge.api.discoverServers({
        limit: 20
      });

      const response = JSON.parse(result.content[0].text);
      
      if (!response.servers || response.servers.length === 0) {
        this.warn('No servers found in registry');
        return;
      }

      const tableData = response.servers.map((server: any) => ({
        Name: server.name,
        Description: server.description?.substring(0, 60) + (server.description?.length > 60 ? '...' : ''),
        Category: server.category || 'N/A',
        Verified: server.verified ? '✅' : '❌',
        Package: server.npm_package || server.docker_image || 'N/A'
      }));

      this.formatOutput(tableData, options.format);

      console.log(`\n💡 To install: mcpl install <package-name>`);
      console.log(`🔍 To search: mcpl search <query>`);

    } catch (error) {
      this.handleError(error, 'Failed to list available servers');
    }
  }

  private showManagementTips(): void {
    console.log(`\n💡 Management commands:`);
    console.log(`  mcpl status           - Show detailed status`);
    console.log(`  mcpl inspect <name>   - Inspect server details`);
    console.log(`  mcpl health           - Run health checks`);
    console.log(`  mcpl uninstall <name> - Remove server`);
  }
}
