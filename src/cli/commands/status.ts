// Status command - Real-time server monitoring

import { BaseCommand } from './base-command.js';

export interface StatusOptions {
  client?: string;
  watch?: boolean;
  format: 'table' | 'json';
  verbose?: boolean;
}

export class StatusCommand extends BaseCommand {
  private watchMode = false;

  async execute(options: StatusOptions): Promise<void> {
    this.setVerbose(options.verbose || false);
    this.watchMode = options.watch || false;

    try {
      if (this.watchMode) {
        await this.watchStatus(options);
      } else {
        await this.showStatus(options);
      }
    } catch (error) {
      this.handleError(error, 'Status check failed');
    }
  }

  private async showStatus(options: StatusOptions): Promise<void> {
    this.info('📊 Checking server status...');

    const status = await this.collectStatusData();
    
    if (options.format === 'json') {
      console.log(JSON.stringify(status, null, 2));
      return;
    }

    this.displayStatus(status);
  }

  private async watchStatus(options: StatusOptions): Promise<void> {
    this.info('👀 Watching server status (Press Ctrl+C to exit)...');

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping watch mode...');
      process.exit(0);
    });

    while (true) {
      // Clear screen
      console.clear();
      console.log('🔄 Live Status Monitor - ' + new Date().toLocaleTimeString());
      console.log('Press Ctrl+C to exit\n');

      try {
        const status = await this.collectStatusData();
        this.displayStatus(status);
      } catch (error) {
        this.error(`Status update failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Wait 5 seconds before next update
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  private async collectStatusData(): Promise<any> {
    const status = {
      timestamp: new Date().toISOString(),
      bridge: {
        healthy: true,
        stats: {}
      },
      servers: {
        bridge: [],
        direct: []
      },
      system: {
        docker: false,
        claudeConfig: false
      }
    };

    // Get bridge statistics
    try {
      status.bridge.stats = this.bridge.getStats();
    } catch (error) {
      this.debug(`Failed to get bridge stats: ${error instanceof Error ? error.message : String(error)}`);
      status.bridge.healthy = false;
    }

    // Get bridge mode servers
    try {
      const bridgeResult = await this.bridge.components.serverManagementTools['listManagedServers']();
      const bridgeServers = JSON.parse(bridgeResult.content[0].text);
      
      // Add health information
      for (const server of bridgeServers) {
        try {
          const health = await this.bridge.components.serverRegistry.getServerHealth(server.name);
          server.health = health;
        } catch (error) {
          server.health = { status: 'unknown', error: error instanceof Error ? error.message : String(error) };
        }
      }
      
      status.servers.bridge = bridgeServers;
    } catch (error) {
      this.debug(`Failed to get bridge servers: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Get direct mode servers
    try {
      const directResult = await this.bridge.components.serverManagementTools['listClaudeServers']();
      status.servers.direct = JSON.parse(directResult.content[0].text);
    } catch (error) {
      this.debug(`Failed to get direct servers: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Check system components
    try {
      const healthCheck = await this.bridge.healthCheck();
      status.system.docker = healthCheck.docker;
      status.system.claudeConfig = healthCheck.claudeConfig;
    } catch (error) {
      this.debug(`Failed to get system health: ${error instanceof Error ? error.message : String(error)}`);
    }

    return status;
  }

  private displayStatus(status: any): void {
    // Bridge status
    console.log('🌉 MCP Bridge Status:');
    if (status.bridge.healthy) {
      this.success('Bridge is healthy');
    } else {
      this.error('Bridge has issues');
    }

    if (status.bridge.stats) {
      console.log(`   Core tools: ${status.bridge.stats.coreTools}`);
      console.log(`   Management tools: ${status.bridge.stats.managementTools}`);
      console.log(`   Dynamic tools: ${status.bridge.stats.dynamicTools}`);
      console.log(`   Managed servers: ${status.bridge.stats.managedServers}`);
    }

    // System status
    console.log('\n🖥️  System Status:');
    console.log(`   Docker: ${status.system.docker ? '✅ Available' : '❌ Not available'}`);
    console.log(`   Claude Config: ${status.system.claudeConfig ? '✅ Found' : '❌ Not found'}`);

    // Bridge mode servers
    if (status.servers.bridge.length > 0) {
      console.log('\n🔗 Bridge Mode Servers:');
      
      const bridgeTable = status.servers.bridge.map((server: any) => ({
        Name: server.name,
        Status: this.getStatusIcon(server.status),
        Tools: server.tools?.length || 0,
        Health: server.health ? this.getHealthIcon(server.health.status) : '❓',
        Type: server.type || 'unknown'
      }));

      this.formatOutput(bridgeTable, 'table');
    }

    // Direct mode servers
    if (status.servers.direct.length > 0) {
      console.log('\n⚙️  Direct Mode Servers:');
      
      const directTable = status.servers.direct.map((server: any) => ({
        Name: server.name,
        Command: server.command,
        Args: server.args?.join(' ') || '',
        Mode: 'direct'
      }));

      this.formatOutput(directTable, 'table');
    }

    // Summary
    const totalServers = status.servers.bridge.length + status.servers.direct.length;
    const runningServers = status.servers.bridge.filter((s: any) => s.status === 'running').length;
    const errorServers = status.servers.bridge.filter((s: any) => s.status === 'error').length;

    console.log('\n📈 Summary:');
    console.log(`   Total servers: ${totalServers}`);
    console.log(`   Running: ${runningServers}`);
    console.log(`   Errors: ${errorServers}`);

    if (errorServers > 0) {
      console.log('\n💡 Fix errors with: mcpl health --fix');
    }

    if (!this.watchMode) {
      console.log('\n💡 Use --watch for real-time monitoring');
    }
  }

  private getStatusIcon(status: string): string {
    switch (status) {
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

  private getHealthIcon(health: string): string {
    switch (health) {
      case 'running':
        return '💚 healthy';
      case 'error':
        return '💔 unhealthy';
      default:
        return '❓ unknown';
    }
  }
}
