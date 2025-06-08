// Health command - System health checks and auto-fix

import { BaseCommand } from './base-command.js';

export interface HealthOptions {
  server?: string;
  fix?: boolean;
  report?: boolean;
  verbose?: boolean;
}

export class HealthCommand extends BaseCommand {
  async execute(options: HealthOptions): Promise<void> {
    this.setVerbose(options.verbose || false);

    try {
      this.info('🏥 Running health checks...');

      if (options.server) {
        await this.checkServerHealth(options.server, options);
      } else {
        await this.checkSystemHealth(options);
      }

    } catch (error) {
      this.handleError(error, 'Health check failed');
    }
  }

  private async checkServerHealth(serverName: string, options: HealthOptions): Promise<void> {
    this.info(`Checking health of server: ${serverName}`);
    
    try {
      const health = await this.bridge.components.serverRegistry.getServerHealth(serverName);
      
      console.log(`Status: ${health.status}`);
      console.log(`Tools: ${health.toolCount}`);
      
      if (health.lastError) {
        this.error(`Last error: ${health.lastError}`);
        
        if (options.fix) {
          await this.fixServerIssues(serverName);
        }
      } else {
        this.success('Server is healthy');
      }
      
    } catch (error) {
      this.error(`Server health check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async checkSystemHealth(options: HealthOptions): Promise<void> {
    const health = await this.bridge.healthCheck();
    
    console.log('\n🌉 Bridge Health:');
    console.log(`Status: ${health.bridge ? '✅ Healthy' : '❌ Unhealthy'}`);
    
    console.log('\n🔗 API Client:');
    console.log(`Status: ${health.apiClient ? '✅ Connected' : '❌ Disconnected'}`);
    
    console.log('\n🐳 Docker:');
    console.log(`Status: ${health.docker ? '✅ Available' : '❌ Not available'}`);
    
    console.log('\n⚙️ Claude Config:');
    console.log(`Status: ${health.claudeConfig ? '✅ Found' : '❌ Not found'}`);

    // Check server health
    console.log('\n📊 Server Health:');
    let healthyCount = 0;
    let totalCount = 0;
    
    for (const [serverName, serverHealth] of health.servers) {
      totalCount++;
      if (serverHealth.healthy) {
        healthyCount++;
        console.log(`✅ ${serverName}: Healthy`);
      } else {
        console.log(`❌ ${serverName}: ${serverHealth.issues.join(', ')}`);
      }
    }

    console.log(`\n📈 Summary: ${healthyCount}/${totalCount} servers healthy`);

    if (options.fix && healthyCount < totalCount) {
      await this.autoFix();
    }

    if (options.report) {
      await this.generateHealthReport(health);
    }
  }

  private async fixServerIssues(serverName: string): Promise<void> {
    this.info(`Attempting to fix issues with ${serverName}...`);
    
    try {
      await this.bridge.components.serverManagementTools['controlServer']({
        name: serverName,
        action: 'restart'
      });
      
      this.success(`Restarted ${serverName}`);
    } catch (error) {
      this.error(`Failed to fix ${serverName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async autoFix(): Promise<void> {
    this.info('🔧 Attempting to fix issues...');
    
    try {
      const results = await this.bridge.performMaintenance();
      
      if (results.restarted.length > 0) {
        this.success(`Restarted servers: ${results.restarted.join(', ')}`);
      }
      
      if (results.cleaned.length > 0) {
        this.success(`Cleaned up: ${results.cleaned.join(', ')}`);
      }
      
      if (results.errors.length > 0) {
        this.error(`Errors: ${results.errors.join(', ')}`);
      }
      
    } catch (error) {
      this.error(`Auto-fix failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async generateHealthReport(health: any): Promise<void> {
    this.info('📋 Generating health report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      bridge: health.bridge,
      apiClient: health.apiClient,
      docker: health.docker,
      claudeConfig: health.claudeConfig,
      servers: Array.from(health.servers.entries()).map((entry: any) => {
        const [name, serverHealth] = entry;
        return {
          name,
          healthy: serverHealth.healthy,
          issues: serverHealth.issues
        };
      })
    };

    console.log('\n📄 Health Report:');
    console.log(JSON.stringify(report, null, 2));
  }
}
