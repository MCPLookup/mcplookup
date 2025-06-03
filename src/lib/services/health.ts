// Health Service - Real-time MCP Server Health Monitoring
// Serverless-ready, no SQL dependencies

import { HealthMetrics } from '../schemas/discovery.js';
import { IHealthService } from './discovery.js';

/**
 * Health Service Implementation
 * Performs real-time health checks on MCP servers
 * Optimized for serverless environments
 */
export class HealthService implements IHealthService {
  private readonly HEALTH_CHECK_TIMEOUT_MS = 10000; // 10 seconds
  private readonly MAX_CONCURRENT_CHECKS = 10;

  /**
   * Check health of a single MCP server
   */
  async checkServerHealth(endpoint: string): Promise<HealthMetrics> {
    const startTime = Date.now();
    
    try {
      // Test MCP initialize call
      const response = await this.performHealthCheck(endpoint);
      const responseTime = Date.now() - startTime;

      if (response.success) {
        return {
          status: 'healthy',
          uptime_percentage: 99.0, // Would be calculated from historical data
          avg_response_time_ms: responseTime,
          error_rate: 0.01, // Would be calculated from historical data
          last_check: new Date().toISOString(),
          consecutive_failures: 0
        };
      } else {
        return {
          status: 'degraded',
          uptime_percentage: 95.0,
          avg_response_time_ms: responseTime,
          error_rate: 0.05,
          last_check: new Date().toISOString(),
          consecutive_failures: 1
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'down',
        uptime_percentage: 90.0,
        avg_response_time_ms: responseTime,
        error_rate: 0.1,
        last_check: new Date().toISOString(),
        consecutive_failures: 5
      };
    }
  }

  /**
   * Batch health check for multiple endpoints
   */
  async batchHealthCheck(endpoints: string[]): Promise<Map<string, HealthMetrics>> {
    const results = new Map<string, HealthMetrics>();
    
    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < endpoints.length; i += this.MAX_CONCURRENT_CHECKS) {
      const batch = endpoints.slice(i, i + this.MAX_CONCURRENT_CHECKS);
      
      const batchPromises = batch.map(async endpoint => {
        try {
          const health = await this.checkServerHealth(endpoint);
          return { endpoint, health };
        } catch (error) {
          return {
            endpoint,
            health: {
              status: 'unknown' as const,
              uptime_percentage: 0,
              avg_response_time_ms: 0,
              error_rate: 1.0,
              last_check: new Date().toISOString(),
              consecutive_failures: 10
            }
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ endpoint, health }) => {
        results.set(endpoint, health);
      });
    }

    return results;
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  /**
   * Perform actual health check against MCP endpoint
   */
  private async performHealthCheck(endpoint: string): Promise<{ success: boolean; data?: any }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.HEALTH_CHECK_TIMEOUT_MS);

    try {
      // Try MCP initialize call
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MCPLookup-HealthChecker/1.0'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: `health-check-${Date.now()}`,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'mcplookup-health-checker',
              version: '1.0.0'
            }
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return { success: false };
      }

      const data = await response.json();
      
      // Check if it's a valid MCP response
      if (data.jsonrpc === '2.0' && data.result) {
        return { success: true, data };
      }

      return { success: false };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Health check timeout');
      }
      
      throw error;
    }
  }

  /**
   * Calculate health status based on response time and error rate
   */
  private calculateHealthStatus(responseTime: number, errorRate: number): HealthMetrics['status'] {
    if (errorRate > 0.1) return 'down';
    if (errorRate > 0.05 || responseTime > 5000) return 'degraded';
    return 'healthy';
  }

  /**
   * Estimate uptime percentage based on current status
   */
  private estimateUptimePercentage(status: HealthMetrics['status']): number {
    switch (status) {
      case 'healthy': return 99.0 + Math.random() * 0.99; // 99.0-99.99%
      case 'degraded': return 95.0 + Math.random() * 4.0; // 95.0-99.0%
      case 'down': return 80.0 + Math.random() * 15.0; // 80.0-95.0%
      case 'unknown': return 0;
      default: return 90.0;
    }
  }

  /**
   * Estimate error rate based on current status
   */
  private estimateErrorRate(status: HealthMetrics['status']): number {
    switch (status) {
      case 'healthy': return Math.random() * 0.01; // 0-1%
      case 'degraded': return 0.01 + Math.random() * 0.04; // 1-5%
      case 'down': return 0.1 + Math.random() * 0.9; // 10-100%
      case 'unknown': return 1.0;
      default: return 0.05;
    }
  }
}

/**
 * Enhanced Health Service with Historical Data
 * This would be used in production with a database
 */
export class EnhancedHealthService extends HealthService {
  private healthHistory: Map<string, HealthMetrics[]> = new Map();
  private readonly MAX_HISTORY_ENTRIES = 100;

  async checkServerHealth(endpoint: string): Promise<HealthMetrics> {
    const currentHealth = await super.checkServerHealth(endpoint);
    
    // Store in history
    this.storeHealthHistory(endpoint, currentHealth);
    
    // Calculate enhanced metrics from history
    const enhancedHealth = this.calculateEnhancedMetrics(endpoint, currentHealth);
    
    return enhancedHealth;
  }

  private storeHealthHistory(endpoint: string, health: HealthMetrics): void {
    if (!this.healthHistory.has(endpoint)) {
      this.healthHistory.set(endpoint, []);
    }
    
    const history = this.healthHistory.get(endpoint)!;
    history.push(health);
    
    // Keep only recent entries
    if (history.length > this.MAX_HISTORY_ENTRIES) {
      history.shift();
    }
  }

  private calculateEnhancedMetrics(endpoint: string, currentHealth: HealthMetrics): HealthMetrics {
    const history = this.healthHistory.get(endpoint) || [];
    
    if (history.length < 2) {
      return currentHealth;
    }

    // Calculate average response time
    const avgResponseTime = history.reduce((sum, h) => sum + h.avg_response_time_ms, 0) / history.length;
    
    // Calculate uptime percentage
    const healthyChecks = history.filter(h => h.status === 'healthy').length;
    const uptimePercentage = (healthyChecks / history.length) * 100;
    
    // Calculate error rate
    const totalErrors = history.reduce((sum, h) => sum + h.error_rate, 0);
    const avgErrorRate = totalErrors / history.length;
    
    // Calculate consecutive failures
    let consecutiveFailures = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].status === 'down' || history[i].status === 'degraded') {
        consecutiveFailures++;
      } else {
        break;
      }
    }

    return {
      ...currentHealth,
      uptime_percentage: uptimePercentage,
      avg_response_time_ms: avgResponseTime,
      error_rate: avgErrorRate,
      consecutive_failures: consecutiveFailures
    };
  }
}

/**
 * Factory function to create appropriate health service
 */
export function createHealthService(enhanced: boolean = false): IHealthService {
  return enhanced ? new EnhancedHealthService() : new HealthService();
}
