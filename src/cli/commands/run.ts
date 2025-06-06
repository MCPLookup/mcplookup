// Run command - Temporary server execution

import { BaseCommand } from './base-command.js';

export interface RunOptions {
  config?: string;
  env?: string;
  port?: string;
  detach?: boolean;
  verbose?: boolean;
}

export class RunCommand extends BaseCommand {
  async execute(server: string, options: RunOptions): Promise<void> {
    this.setVerbose(options.verbose || false);

    try {
      this.info(`▶️ Running server: ${server}`);
      
      // Find server
      const serverInfo = await this.findServer(server);
      if (!serverInfo) {
        this.error(`Server not found: ${server}`);
        return;
      }

      if (serverInfo.mode === 'bridge') {
        await this.runBridgeServer(serverInfo, options);
      } else {
        this.warn('Direct mode servers are managed by Claude Desktop');
        this.info('Use "mcpl status" to check if Claude Desktop is running the server');
      }

    } catch (error) {
      this.handleError(error, 'Run failed');
    }
  }

  private async findServer(serverName: string): Promise<any> {
    try {
      const bridgeResult = await this.bridge.components.serverManagementTools['listManagedServers']();
      const bridgeServers = JSON.parse(bridgeResult.content[0].text);
      const found = bridgeServers.find((s: any) => s.name === serverName);
      if (found) return { ...found, mode: 'bridge' };
    } catch (error) {
      this.debug(`Bridge search failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      const directResult = await this.bridge.components.serverManagementTools['listClaudeServers']();
      const directServers = JSON.parse(directResult.content[0].text);
      const found = directServers.find((s: any) => s.name === serverName);
      if (found) return { ...found, mode: 'direct' };
    } catch (error) {
      this.debug(`Direct search failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return null;
  }

  private async runBridgeServer(server: any, options: RunOptions): Promise<void> {
    if (server.status === 'running') {
      this.info('Server is already running');
      return;
    }

    await this.withSpinner('Starting server...', async () => {
      const result = await this.bridge.components.serverManagementTools['controlServer']({
        name: server.name,
        action: 'start'
      });

      if (result.isError) {
        throw new Error(result.content[0].text);
      }
    });

    this.success('Server started successfully');
    this.info('Use "mcpl status" to monitor the server');
  }
}
