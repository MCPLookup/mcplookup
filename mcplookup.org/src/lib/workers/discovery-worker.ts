// Background Discovery Worker
// Processes the discovery queue to add new MCP servers to the database

import { DiscoveryService } from '../services/discovery';
import { RegistryService } from '../services/registry';
import { HealthService } from '../services/health';
import { IntentService } from '../services/intent';

export class DiscoveryWorker {
  private discoveryService: DiscoveryService;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  constructor(redisClient: any) {
    // Initialize services
    const registryService = new RegistryService();
    const healthService = new HealthService();
    const intentService = new IntentService();
    
    this.discoveryService = new DiscoveryService(
      registryService,
      healthService,
      intentService,
      redisClient
    );
  }

  /**
   * Start the background worker
   */
  async start(intervalSeconds: number = 30): Promise<void> {
    if (this.isRunning) {
      console.log('Discovery worker is already running');
      return;
    }

    this.isRunning = true;
    console.log(`Starting discovery worker with ${intervalSeconds}s interval`);

    // Process queue immediately
    await this.processQueue();

    // Set up interval processing
    this.intervalId = setInterval(async () => {
      await this.processQueue();
    }, intervalSeconds * 1000);
  }

  /**
   * Stop the background worker
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('Discovery worker stopped');
  }

  /**
   * Process the discovery queue
   */
  private async processQueue(): Promise<void> {
    try {
      const result = await this.discoveryService.processDiscoveryQueue(5);
      
      if (result.processed > 0 || result.errors > 0) {
        console.log(`Discovery worker processed ${result.processed} items, ${result.errors} errors`);
      }

      // Log queue status periodically
      const status = await this.discoveryService.getQueueStatus();
      if (status.total > 0) {
        console.log(`Discovery queue status: ${status.total} total (${status.priority} priority, ${status.background} background)`);
      }
    } catch (error) {
      console.error('Discovery worker error:', error);
    }
  }

  /**
   * Get worker status
   */
  getStatus(): { running: boolean; queueStatus?: any } {
    return {
      running: this.isRunning
    };
  }
}

/**
 * Standalone function to run the discovery worker
 */
export async function runDiscoveryWorker(redisClient: any, intervalSeconds: number = 30): Promise<DiscoveryWorker> {
  const worker = new DiscoveryWorker(redisClient);
  await worker.start(intervalSeconds);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Received SIGINT, stopping discovery worker...');
    worker.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, stopping discovery worker...');
    worker.stop();
    process.exit(0);
  });

  return worker;
}
