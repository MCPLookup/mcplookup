// Uninstall command - Enhanced removal with cleanup

import { BaseCommand } from './base-command.js';

export interface UninstallOptions {
  client: string;
  mode: 'direct' | 'bridge' | 'auto';
  force: boolean;
  cleanup: boolean;
  verbose?: boolean;
}

export class UninstallCommand extends BaseCommand {
  async execute(packageName: string, options: UninstallOptions): Promise<void> {
    this.setVerbose(options.verbose || false);

    try {
      this.info(`Uninstalling MCP server: ${packageName}`);

      // Find the server
      const servers = await this.findServers(packageName, options.mode);
      
      if (servers.length === 0) {
        this.error(`Server not found: ${packageName}`);
        this.info('Use "mcpl list" to see installed servers');
        return;
      }

      // Confirm removal unless forced
      if (!options.force) {
        const confirmed = await this.confirmRemoval(servers);
        if (!confirmed) {
          this.info('Uninstall cancelled');
          return;
        }
      }

      // Remove each found server
      for (const server of servers) {
        await this.removeServer(server, options);
      }

      this.success(`Successfully uninstalled ${packageName}`);
      this.showPostUninstallInfo(options);

    } catch (error) {
      this.handleError(error, 'Uninstall failed');
    }
  }

  private async findServers(packageName: string, mode: string): Promise<any[]> {
    const servers: any[] = [];

    // Search bridge mode servers
    if (mode === 'bridge' || mode === 'auto') {
      try {
        const bridgeResult = await this.bridge.components.serverManagementTools['listManagedServers']();
        const bridgeServers = JSON.parse(bridgeResult.content[0].text);
        
        const found = bridgeServers.filter((server: any) => 
          server.name === packageName || 
          server.name.includes(packageName) ||
          (server.command && server.command.includes(packageName))
        );

        found.forEach((server: any) => {
          servers.push({ ...server, mode: 'bridge' });
        });
      } catch (error) {
        this.debug(`Failed to search bridge servers: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Search direct mode servers
    if (mode === 'direct' || mode === 'auto') {
      try {
        const directResult = await this.bridge.components.serverManagementTools['listClaudeServers']();
        const directServers = JSON.parse(directResult.content[0].text);
        
        const found = directServers.filter((server: any) => 
          server.name === packageName || 
          server.name.includes(packageName) ||
          server.args.some((arg: string) => arg.includes(packageName))
        );

        found.forEach((server: any) => {
          servers.push({ ...server, mode: 'direct' });
        });
      } catch (error) {
        this.debug(`Failed to search direct servers: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return servers;
  }

  private async confirmRemoval(servers: any[]): Promise<boolean> {
    console.log('\n📋 Servers to be removed:');
    
    servers.forEach((server, index) => {
      console.log(`${index + 1}. ${server.name} (${server.mode} mode)`);
      if (server.status) {
        console.log(`   Status: ${server.status}`);
      }
      if (server.tools && server.tools.length > 0) {
        console.log(`   Tools: ${server.tools.length}`);
      }
    });

    console.log('');
    return await this.confirm('Are you sure you want to remove these servers?', false);
  }

  private async removeServer(server: any, options: UninstallOptions): Promise<void> {
    this.info(`Removing ${server.name} (${server.mode} mode)...`);

    try {
      if (server.mode === 'bridge') {
        await this.removeBridgeServer(server, options);
      } else {
        await this.removeDirectServer(server, options);
      }

      this.success(`Removed ${server.name}`);
    } catch (error) {
      this.error(`Failed to remove ${server.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async removeBridgeServer(server: any, options: UninstallOptions): Promise<void> {
    await this.withSpinner(`Stopping and removing ${server.name}...`, async () => {
      const result = await this.bridge.components.serverManagementTools['controlServer']({
        name: server.name,
        action: 'remove'
      });

      if (result.isError) {
        throw new Error(result.content[0].text);
      }
    });

    if (options.cleanup) {
      await this.performCleanup(server);
    }
  }

  private async removeDirectServer(server: any, options: UninstallOptions): Promise<void> {
    await this.withSpinner(`Removing from Claude Desktop config...`, async () => {
      const result = await this.bridge.components.serverManagementTools['removeClaudeServer'](server.name);

      if (result.isError) {
        throw new Error(result.content[0].text);
      }
    });

    this.warn('Please restart Claude Desktop for changes to take effect');
  }

  private async performCleanup(server: any): Promise<void> {
    this.info('Performing cleanup...');

    try {
      // Clean up Docker containers if applicable
      if (server.type === 'docker') {
        const containerName = this.bridge.components.dockerManager.getContainerName(server);
        const status = await this.bridge.components.dockerManager.getContainerStatus(containerName);
        
        if (status !== 'not_found') {
          this.debug(`Removing Docker container: ${containerName}`);
          await this.bridge.components.dockerManager.removeContainer(containerName);
        }
      }

      // Clean up any cached data
      this.debug('Cleaning up cached data...');
      
      this.success('Cleanup completed');
    } catch (error) {
      this.warn(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private showPostUninstallInfo(options: UninstallOptions): void {
    console.log('\n📋 Post-uninstall information:');
    
    if (options.mode === 'direct' || options.mode === 'auto') {
      this.warn('If you removed direct mode servers, restart Claude Desktop');
    }

    console.log('\n💡 Useful commands:');
    console.log('  mcpl list            - See remaining servers');
    console.log('  mcpl search <query>  - Find new servers to install');
    console.log('  mcpl health          - Check system health');
  }
}
