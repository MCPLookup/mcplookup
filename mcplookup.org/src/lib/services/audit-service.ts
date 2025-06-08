// Audit Service - Business logic for audit logging
// Uses unified storage interface for data persistence

import { IStorage, StorageResult, QueryOptions, isSuccessResult } from './storage/unified-storage';
import { createStorage, StorageConfig } from './storage/factory';

// =============================================================================
// AUDIT DATA TYPES
// =============================================================================

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  userRole?: 'user' | 'admin' | 'moderator';
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  success: boolean;
  error?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
}

export interface AuditStats {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ userEmail: string; count: number }>;
  actionsByHour: Array<{ hour: string; count: number }>;
}

/**
 * Audit Service
 * Handles all business logic for audit logging operations
 * Storage-agnostic through the unified storage interface
 */
export class AuditService {
  private storage: IStorage;
  private readonly COLLECTION = 'audit';

  constructor() {
    this.storage = createStorage();
  }

  // ==========================================================================
  // CORE AUDIT OPERATIONS
  // ==========================================================================

  /**
   * Log an audit entry
   */
  async logAction(actionData: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...actionData
    };

    const result = await this.storage.set(this.COLLECTION, entry.id, entry);
    
    if (!isSuccessResult(result)) {
      // Don't throw for audit failures - just log to console
      console.error(`Failed to store audit log: ${result.error}`, entry);
    }
  }

  /**
   * Get a specific audit log entry by ID
   */
  async getAuditLog(id: string): Promise<AuditLogEntry | null> {
    const result = await this.storage.get<AuditLogEntry>(this.COLLECTION, id);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get audit log: ${result.error}`);
    }

    return result.data;
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(filters?: AuditLogFilters): Promise<{
    logs: AuditLogEntry[];
    total: number;
    hasMore: boolean;
  }> {
    const queryOptions: QueryOptions = {
      pagination: {
        limit: filters?.limit || 50,
        offset: filters?.offset || 0
      },
      sort: {
        field: 'timestamp',
        direction: 'desc'
      },
      filters: {}
    };

    // Add filters
    if (filters?.userId) {
      queryOptions.filters!.userId = filters.userId;
    }
    if (filters?.action) {
      queryOptions.filters!.action = filters.action;
    }
    if (filters?.resource) {
      queryOptions.filters!.resource = filters.resource;
    }
    if (filters?.success !== undefined) {
      queryOptions.filters!.success = filters.success;
    }

    // Date range filtering (simplified - in production you'd want more sophisticated date filtering)
    if (filters?.startDate || filters?.endDate) {
      // For now, we'll get all and filter in memory
      // In production, you'd want the storage layer to handle date range queries
      const allResult = await this.storage.getAll<AuditLogEntry>(this.COLLECTION, {
        sort: queryOptions.sort
      });
      
      if (!isSuccessResult(allResult)) {
        throw new Error(`Failed to get audit logs: ${allResult.error}`);
      }

      let filteredLogs = allResult.data.items;

      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }

      // Apply other filters
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

      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      const paginatedLogs = filteredLogs.slice(offset, offset + limit);

      return {
        logs: paginatedLogs,
        total: filteredLogs.length,
        hasMore: offset + limit < filteredLogs.length
      };
    }

    const result = await this.storage.query<AuditLogEntry>(this.COLLECTION, queryOptions);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get audit logs: ${result.error}`);
    }

    return {
      logs: result.data.items,
      total: result.data.total,
      hasMore: result.data.hasMore
    };
  }

  /**
   * Get audit statistics for a time range
   */
  async getAuditStats(timeRange: '24h' | '7d' | '30d'): Promise<AuditStats> {
    // Calculate start date based on time range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    const logs = await this.getAuditLogs({
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      limit: 10000 // Get a large number for stats
    });

    const totalActions = logs.logs.length;
    const successfulActions = logs.logs.filter(log => log.success).length;
    const failedActions = totalActions - successfulActions;

    // Count actions
    const actionCounts = new Map<string, number>();
    logs.logs.forEach(log => {
      actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
    });

    // Count users
    const userCounts = new Map<string, number>();
    logs.logs.forEach(log => {
      if (log.userEmail) {
        userCounts.set(log.userEmail, (userCounts.get(log.userEmail) || 0) + 1);
      }
    });

    // Count by hour
    const hourCounts = new Map<string, number>();
    logs.logs.forEach(log => {
      const hour = log.timestamp.substring(0, 13); // YYYY-MM-DDTHH
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    return {
      totalActions,
      successfulActions,
      failedActions,
      topActions: Array.from(actionCounts.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topUsers: Array.from(userCounts.entries())
        .map(([userEmail, count]) => ({ userEmail, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      actionsByHour: Array.from(hourCounts.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour.localeCompare(b.hour))
    };
  }

  /**
   * Clean up old audit logs before a cutoff date
   */
  async cleanupOldLogs(cutoffDate: string): Promise<number> {
    // Get all logs before cutoff date
    const allResult = await this.storage.getAll<AuditLogEntry>(this.COLLECTION);
    
    if (!isSuccessResult(allResult)) {
      throw new Error(`Failed to get audit logs for cleanup: ${allResult.error}`);
    }

    const logsToDelete = allResult.data.items.filter(log => log.timestamp < cutoffDate);
    
    if (logsToDelete.length === 0) {
      return 0;
    }

    const idsToDelete = logsToDelete.map(log => log.id);
    const deleteResult = await this.storage.deleteBatch(this.COLLECTION, idsToDelete);
    
    if (!isSuccessResult(deleteResult)) {
      throw new Error(`Failed to delete old audit logs: ${deleteResult.error}`);
    }

    return deleteResult.data.successful.length;
  }

  // ==========================================================================
  // CONVENIENCE METHODS
  // ==========================================================================

  /**
   * Log a user action
   */
  async logUserAction(
    userId: string,
    userEmail: string,
    action: string,
    resource: string,
    details: Record<string, any>,
    options?: {
      resourceId?: string;
      success?: boolean;
      error?: string;
      duration?: number;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
    }
  ): Promise<void> {
    await this.logAction({
      userId,
      userEmail,
      action,
      resource,
      resourceId: options?.resourceId,
      details,
      success: options?.success ?? true,
      error: options?.error,
      duration: options?.duration,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      sessionId: options?.sessionId
    });
  }

  /**
   * Log a system action
   */
  async logSystemAction(
    action: string,
    resource: string,
    details: Record<string, any>,
    options?: {
      resourceId?: string;
      success?: boolean;
      error?: string;
      duration?: number;
    }
  ): Promise<void> {
    await this.logAction({
      action,
      resource,
      resourceId: options?.resourceId,
      details,
      success: options?.success ?? true,
      error: options?.error,
      duration: options?.duration
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const result = await this.storage.healthCheck();
      return {
        healthy: result.healthy,
        details: result
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: String(error) }
      };
    }
  }
}
