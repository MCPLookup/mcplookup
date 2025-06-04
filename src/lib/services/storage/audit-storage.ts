// Audit Storage Implementation
// In-memory implementation with Redis and Upstash support

import { 
  IAuditStorage, 
  AuditLogEntry, 
  AuditLogFilters, 
  AuditStats, 
  StorageResult 
} from './interfaces';

/**
 * In-Memory Audit Storage Implementation
 * Stores audit logs in memory with efficient querying
 */
export class InMemoryAuditStorage implements IAuditStorage {
  private logs: Map<string, AuditLogEntry> = new Map();
  private logsByTimestamp: AuditLogEntry[] = [];
  private logsByUser: Map<string, AuditLogEntry[]> = new Map();
  private logsByAction: Map<string, AuditLogEntry[]> = new Map();

  async storeAuditLog(id: string, entry: AuditLogEntry): Promise<StorageResult<void>> {
    try {
      this.logs.set(id, entry);
      
      // Add to timestamp-sorted array
      this.logsByTimestamp.push(entry);
      this.logsByTimestamp.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Index by user
      if (entry.userId) {
        if (!this.logsByUser.has(entry.userId)) {
          this.logsByUser.set(entry.userId, []);
        }
        this.logsByUser.get(entry.userId)!.push(entry);
      }

      // Index by action
      if (!this.logsByAction.has(entry.action)) {
        this.logsByAction.set(entry.action, []);
      }
      this.logsByAction.get(entry.action)!.push(entry);

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: `Failed to store audit log: ${error}`
      };
    }
  }

  async getAuditLog(id: string): Promise<StorageResult<AuditLogEntry>> {
    try {
      const log = this.logs.get(id);
      if (!log) {
        return {
          success: false,
          error: 'Audit log not found'
        };
      }

      return { success: true, data: log };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get audit log: ${error}`
      };
    }
  }

  async getAuditLogs(filters: AuditLogFilters = {}): Promise<StorageResult<{
    logs: AuditLogEntry[];
    total: number;
    hasMore: boolean;
  }>> {
    try {
      let filteredLogs = [...this.logsByTimestamp];

      // Apply filters
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }

      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }

      if (filters.resource) {
        filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
      }

      if (filters.success !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.success === filters.success);
      }

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
      }

      const total = filteredLogs.length;
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      const paginatedLogs = filteredLogs.slice(offset, offset + limit);
      const hasMore = offset + limit < total;

      return {
        success: true,
        data: {
          logs: paginatedLogs,
          total,
          hasMore
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get audit logs: ${error}`
      };
    }
  }

  async getAuditStats(timeRange: '24h' | '7d' | '30d'): Promise<StorageResult<AuditStats>> {
    try {
      const now = new Date();
      const cutoffTime = new Date();
      
      switch (timeRange) {
        case '24h':
          cutoffTime.setHours(cutoffTime.getHours() - 24);
          break;
        case '7d':
          cutoffTime.setDate(cutoffTime.getDate() - 7);
          break;
        case '30d':
          cutoffTime.setDate(cutoffTime.getDate() - 30);
          break;
      }

      const recentLogs = this.logsByTimestamp.filter(
        log => new Date(log.timestamp) >= cutoffTime
      );

      const totalActions = recentLogs.length;
      const successfulActions = recentLogs.filter(log => log.success).length;
      const failedActions = totalActions - successfulActions;

      // Top actions
      const actionCounts = new Map<string, number>();
      recentLogs.forEach(log => {
        actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
      });
      const topActions = Array.from(actionCounts.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top users
      const userCounts = new Map<string, number>();
      recentLogs.forEach(log => {
        if (log.userEmail) {
          userCounts.set(log.userEmail, (userCounts.get(log.userEmail) || 0) + 1);
        }
      });
      const topUsers = Array.from(userCounts.entries())
        .map(([userEmail, count]) => ({ userEmail, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Actions by hour
      const hourCounts = new Map<string, number>();
      recentLogs.forEach(log => {
        const hour = new Date(log.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      });
      const actionsByHour = Array.from(hourCounts.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour.localeCompare(b.hour));

      return {
        success: true,
        data: {
          totalActions,
          successfulActions,
          failedActions,
          topActions,
          topUsers,
          actionsByHour
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get audit stats: ${error}`
      };
    }
  }

  async cleanupOldLogs(cutoffDate: string): Promise<StorageResult<number>> {
    try {
      const cutoff = new Date(cutoffDate);
      let deletedCount = 0;

      // Remove from main map and arrays
      for (const [id, log] of this.logs) {
        if (new Date(log.timestamp) < cutoff) {
          this.logs.delete(id);
          deletedCount++;
        }
      }

      // Rebuild indexes
      this.logsByTimestamp = this.logsByTimestamp.filter(log => new Date(log.timestamp) >= cutoff);
      
      this.logsByUser.clear();
      this.logsByAction.clear();
      
      for (const log of this.logsByTimestamp) {
        if (log.userId) {
          if (!this.logsByUser.has(log.userId)) {
            this.logsByUser.set(log.userId, []);
          }
          this.logsByUser.get(log.userId)!.push(log);
        }

        if (!this.logsByAction.has(log.action)) {
          this.logsByAction.set(log.action, []);
        }
        this.logsByAction.get(log.action)!.push(log);
      }

      return { success: true, data: deletedCount };
    } catch (error) {
      return {
        success: false,
        error: `Failed to cleanup old logs: ${error}`
      };
    }
  }

  // Additional utility methods
  getTotalLogCount(): number {
    return this.logs.size;
  }

  getLogsByUserCount(userId: string): number {
    return this.logsByUser.get(userId)?.length || 0;
  }

  getLogsByActionCount(action: string): number {
    return this.logsByAction.get(action)?.length || 0;
  }

  clear(): void {
    this.logs.clear();
    this.logsByTimestamp = [];
    this.logsByUser.clear();
    this.logsByAction.clear();
  }
}

/**
 * Local Redis Audit Storage Implementation
 * Extends in-memory with Redis persistence
 */
export class LocalRedisAuditStorage extends InMemoryAuditStorage {
  // TODO: Implement Redis-specific methods
  // This would use Redis for persistence while maintaining in-memory performance
}

/**
 * Upstash Redis Audit Storage Implementation
 * Cloud-based Redis storage for serverless environments
 */
export class UpstashAuditStorage extends InMemoryAuditStorage {
  // TODO: Implement Upstash-specific methods
  // This would use Upstash Redis for serverless persistence
}
