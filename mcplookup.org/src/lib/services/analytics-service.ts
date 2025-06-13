// Comprehensive Analytics Service
// Collects, processes, and provides insights on system usage and performance

import { StorageService } from '../storage/types';
import { getStorageService } from '../storage';

export interface AnalyticsEvent {
  id: string;
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  topActions: Array<{ action: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
  timeSeriesData: Array<{ timestamp: string; count: number }>;
  conversionFunnels: Record<string, number>;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  throughput: number;
  uptime: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface UserBehaviorMetrics {
  averageSessionDuration: number;
  bounceRate: number;
  pagesPerSession: number;
  topPages: Array<{ page: string; views: number }>;
  userFlow: Array<{ from: string; to: string; count: number }>;
  retentionRate: number;
}

export class AnalyticsService {
  private storage: StorageService;
  private readonly EVENTS_COLLECTION = 'analytics_events';
  private readonly METRICS_COLLECTION = 'analytics_metrics';
  private readonly PERFORMANCE_COLLECTION = 'performance_metrics';
  private readonly USER_BEHAVIOR_COLLECTION = 'user_behavior_metrics';

  constructor() {
    this.storage = getStorageService();
  }

  // ==========================================================================
  // EVENT TRACKING
  // ==========================================================================

  /**
   * Track an analytics event
   */
  async trackEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...eventData
      };

      // Store event
      const result = await this.storage.set(this.EVENTS_COLLECTION, event.id, event);
      
      if (!result.success) {
        console.error('Failed to store analytics event:', result.error);
        return;
      }

      // Update real-time metrics
      this.updateRealTimeMetrics(event);

      // Process for aggregated metrics (async)
      this.processEventForAggregation(event).catch(error => {
        console.error('Failed to process event for aggregation:', error);
      });

    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(
    page: string,
    userId?: string,
    sessionId?: string,
    properties?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      type: 'pageview',
      category: 'navigation',
      action: 'page_view',
      label: page,
      properties: {
        page,
        ...properties
      },
      userId,
      sessionId
    });
  }

  /**
   * Track user action
   */
  async trackUserAction(
    action: string,
    category: string,
    label?: string,
    value?: number,
    userId?: string,
    properties?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      type: 'action',
      category,
      action,
      label,
      value,
      properties: properties || {},
      userId
    });
  }

  /**
   * Track API usage
   */
  async trackApiUsage(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    userId?: string,
    apiKeyId?: string
  ): Promise<void> {
    await this.trackEvent({
      type: 'api_usage',
      category: 'api',
      action: `${method}_${endpoint}`,
      value: responseTime,
      properties: {
        endpoint,
        method,
        statusCode,
        responseTime,
        apiKeyId
      },
      userId
    });
  }

  /**
   * Track server discovery
   */
  async trackServerDiscovery(
    query: string,
    resultsCount: number,
    userId?: string,
    filters?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      type: 'discovery',
      category: 'servers',
      action: 'search',
      label: query,
      value: resultsCount,
      properties: {
        query,
        resultsCount,
        filters: filters || {}
      },
      userId
    });
  }

  /**
   * Track server registration
   */
  async trackServerRegistration(
    domain: string,
    success: boolean,
    userId?: string,
    errorReason?: string
  ): Promise<void> {
    await this.trackEvent({
      type: 'registration',
      category: 'servers',
      action: success ? 'register_success' : 'register_failure',
      label: domain,
      value: success ? 1 : 0,
      properties: {
        domain,
        success,
        errorReason
      },
      userId
    });
  }

  // ==========================================================================
  // METRICS RETRIEVAL
  // ==========================================================================

  /**
   * Get analytics metrics for a time period
   */
  async getAnalyticsMetrics(
    startDate: Date,
    endDate: Date,
    filters?: Record<string, any>
  ): Promise<AnalyticsMetrics> {
    try {
      // Get events in time range
      const events = await this.getEventsInRange(startDate, endDate, filters);

      // Calculate metrics
      const totalEvents = events.length;
      const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
      const uniqueSessions = new Set(events.map(e => e.sessionId).filter(Boolean)).size;

      // Top actions
      const actionCounts = new Map<string, number>();
      events.forEach(event => {
        actionCounts.set(event.action, (actionCounts.get(event.action) || 0) + 1);
      });
      const topActions = Array.from(actionCounts.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top categories
      const categoryCounts = new Map<string, number>();
      events.forEach(event => {
        categoryCounts.set(event.category, (categoryCounts.get(event.category) || 0) + 1);
      });
      const topCategories = Array.from(categoryCounts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Time series data (hourly buckets)
      const timeSeriesData = this.generateTimeSeriesData(events, startDate, endDate);

      // Conversion funnels
      const conversionFunnels = this.calculateConversionFunnels(events);

      return {
        totalEvents,
        uniqueUsers,
        uniqueSessions,
        topActions,
        topCategories,
        timeSeriesData,
        conversionFunnels
      };

    } catch (error) {
      console.error('Failed to get analytics metrics:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceMetrics> {
    try {
      // Get API usage events
      const apiEvents = await this.getEventsInRange(startDate, endDate, { type: 'api_usage' });

      if (apiEvents.length === 0) {
        return {
          averageResponseTime: 0,
          p95ResponseTime: 0,
          errorRate: 0,
          throughput: 0,
          uptime: 100
        };
      }

      // Calculate response time metrics
      const responseTimes = apiEvents
        .map(e => e.value || 0)
        .filter(time => time > 0)
        .sort((a, b) => a - b);

      const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const p95Index = Math.floor(responseTimes.length * 0.95);
      const p95ResponseTime = responseTimes[p95Index] || 0;

      // Calculate error rate
      const errorEvents = apiEvents.filter(e => {
        const statusCode = e.properties.statusCode;
        return statusCode >= 400;
      });
      const errorRate = (errorEvents.length / apiEvents.length) * 100;

      // Calculate throughput (requests per minute)
      const timeRangeMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
      const throughput = apiEvents.length / timeRangeMinutes;

      return {
        averageResponseTime: Math.round(averageResponseTime),
        p95ResponseTime: Math.round(p95ResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        throughput: Math.round(throughput * 100) / 100,
        uptime: 100 // TODO: Calculate actual uptime
      };

    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get user behavior metrics
   */
  async getUserBehaviorMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<UserBehaviorMetrics> {
    try {
      // Get page view events
      const pageViews = await this.getEventsInRange(startDate, endDate, { type: 'pageview' });

      // Calculate session-based metrics
      const sessions = this.groupEventsBySession(pageViews);
      
      const sessionDurations = sessions.map(session => {
        if (session.length < 2) return 0;
        const start = new Date(session[0].timestamp).getTime();
        const end = new Date(session[session.length - 1].timestamp).getTime();
        return (end - start) / 1000; // Duration in seconds
      }).filter(duration => duration > 0);

      const averageSessionDuration = sessionDurations.length > 0
        ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length
        : 0;

      // Calculate bounce rate (sessions with only 1 page view)
      const singlePageSessions = sessions.filter(session => session.length === 1).length;
      const bounceRate = sessions.length > 0 ? (singlePageSessions / sessions.length) * 100 : 0;

      // Calculate pages per session
      const totalPageViews = pageViews.length;
      const pagesPerSession = sessions.length > 0 ? totalPageViews / sessions.length : 0;

      // Top pages
      const pageCounts = new Map<string, number>();
      pageViews.forEach(event => {
        const page = event.properties.page || event.label || 'unknown';
        pageCounts.set(page, (pageCounts.get(page) || 0) + 1);
      });
      const topPages = Array.from(pageCounts.entries())
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // User flow (simplified)
      const userFlow = this.calculateUserFlow(sessions);

      return {
        averageSessionDuration: Math.round(averageSessionDuration),
        bounceRate: Math.round(bounceRate * 100) / 100,
        pagesPerSession: Math.round(pagesPerSession * 100) / 100,
        topPages,
        userFlow,
        retentionRate: 0 // TODO: Calculate retention rate
      };

    } catch (error) {
      console.error('Failed to get user behavior metrics:', error);
      throw error;
    }
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  private async getEventsInRange(
    startDate: Date,
    endDate: Date,
    filters?: Record<string, any>
  ): Promise<AnalyticsEvent[]> {
    // TODO: Implement efficient time-range queries
    // For now, get all events and filter (not efficient for large datasets)
    const result = await this.storage.getAll(this.EVENTS_COLLECTION);
    
    if (!result.success) {
      console.error('Failed to get events:', result.error);
      return [];
    }

    return (result.data || []).filter((event: AnalyticsEvent) => {
      const eventDate = new Date(event.timestamp);
      const inRange = eventDate >= startDate && eventDate <= endDate;

      if (!inRange) return false;

      // Apply filters
      if (filters) {
        return Object.entries(filters).every(([key, value]) => {
          return event[key as keyof AnalyticsEvent] === value;
        });
      }

      return true;
    });
  }

  private updateRealTimeMetrics(event: AnalyticsEvent): void {
    try {
      // TODO: Implement real-time server integration
      // For now, just log the event
      console.log('Analytics event:', {
        type: event.type,
        action: event.action,
        category: event.category,
        timestamp: event.timestamp
      });
    } catch (error) {
      console.error('Failed to update real-time metrics:', error);
    }
  }

  private async processEventForAggregation(event: AnalyticsEvent): Promise<void> {
    // TODO: Implement event aggregation for efficient querying
    // This could involve updating daily/hourly aggregates
  }

  private generateTimeSeriesData(
    events: AnalyticsEvent[],
    startDate: Date,
    endDate: Date
  ): Array<{ timestamp: string; count: number }> {
    const hourlyBuckets = new Map<string, number>();
    
    // Initialize buckets
    const current = new Date(startDate);
    while (current <= endDate) {
      const hourKey = current.toISOString().substring(0, 13); // YYYY-MM-DDTHH
      hourlyBuckets.set(hourKey, 0);
      current.setHours(current.getHours() + 1);
    }

    // Fill buckets with event counts
    events.forEach(event => {
      const hourKey = event.timestamp.substring(0, 13);
      hourlyBuckets.set(hourKey, (hourlyBuckets.get(hourKey) || 0) + 1);
    });

    return Array.from(hourlyBuckets.entries())
      .map(([timestamp, count]) => ({ timestamp: timestamp + ':00:00.000Z', count }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  private calculateConversionFunnels(events: AnalyticsEvent[]): Record<string, number> {
    // Define conversion funnel steps
    const funnelSteps = {
      'page_view': events.filter(e => e.type === 'pageview').length,
      'search': events.filter(e => e.action === 'search').length,
      'server_view': events.filter(e => e.action === 'server_view').length,
      'registration_attempt': events.filter(e => e.action === 'register_attempt').length,
      'registration_success': events.filter(e => e.action === 'register_success').length
    };

    return funnelSteps;
  }

  private groupEventsBySession(events: AnalyticsEvent[]): AnalyticsEvent[][] {
    const sessions = new Map<string, AnalyticsEvent[]>();
    
    events.forEach(event => {
      if (!event.sessionId) return;
      
      if (!sessions.has(event.sessionId)) {
        sessions.set(event.sessionId, []);
      }
      sessions.get(event.sessionId)!.push(event);
    });

    // Sort events within each session by timestamp
    sessions.forEach(session => {
      session.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    });

    return Array.from(sessions.values());
  }

  private calculateUserFlow(sessions: AnalyticsEvent[][]): Array<{ from: string; to: string; count: number }> {
    const flowCounts = new Map<string, number>();
    
    sessions.forEach(session => {
      for (let i = 0; i < session.length - 1; i++) {
        const from = session[i].properties.page || session[i].label || 'unknown';
        const to = session[i + 1].properties.page || session[i + 1].label || 'unknown';
        const flowKey = `${from} -> ${to}`;
        flowCounts.set(flowKey, (flowCounts.get(flowKey) || 0) + 1);
      }
    });

    return Array.from(flowCounts.entries())
      .map(([flow, count]) => {
        const [from, to] = flow.split(' -> ');
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 flows
  }
}
