#!/usr/bin/env tsx

/**
 * Discovery Worker Startup Script
 * Starts the background discovery worker to process GitHub repos
 */

import { createClient } from 'redis';
import { runDiscoveryWorker } from '../src/lib/workers/discovery-worker';

async function main() {
  console.log('Starting Discovery Worker...');

  // Initialize Redis client
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redisClient = createClient({ url: redisUrl });

  try {
    await redisClient.connect();
    console.log('Connected to Redis');

    // Start the discovery worker
    const worker = await runDiscoveryWorker(redisClient, 30); // 30 second intervals

    console.log('Discovery worker started successfully');
    console.log('Press Ctrl+C to stop');

    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      worker.stop();
      await redisClient.quit();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start discovery worker:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
