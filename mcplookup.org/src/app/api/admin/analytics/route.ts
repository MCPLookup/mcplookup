// Analytics API Endpoints
// Provides comprehensive analytics data for admin dashboard

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { authOptions } from '@/lib/auth/config';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { z } from 'zod';

// Validation schemas
const AnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['hour', 'day', 'week', 'month']).optional().default('day'),
  category: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().optional()
});

/**
 * GET /api/admin/analytics - Get comprehensive analytics data
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin permissions
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const validation = AnalyticsQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { startDate, endDate, period, category, action, userId } = validation.data;

    // Calculate date range based on period if not provided
    const now = new Date();
    let start: Date, end: Date;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = now;
      switch (period) {
        case 'hour':
          start = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'day':
          start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
    }

    // Build filters
    const filters: Record<string, any> = {};
    if (category) filters.category = category;
    if (action) filters.action = action;
    if (userId) filters.userId = userId;

    // Get analytics data
    const analyticsService = new AnalyticsService();
    
    const [analyticsMetrics, performanceMetrics, userBehaviorMetrics] = await Promise.all([
      analyticsService.getAnalyticsMetrics(start, end, Object.keys(filters).length > 0 ? filters : undefined),
      analyticsService.getPerformanceMetrics(start, end),
      analyticsService.getUserBehaviorMetrics(start, end)
    ]);

    return NextResponse.json({
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        duration: period
      },
      filters,
      analytics: analyticsMetrics,
      performance: performanceMetrics,
      userBehavior: userBehaviorMetrics,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/analytics - Track custom analytics event
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      type,
      category,
      action,
      label,
      value,
      properties = {},
      userId
    } = body;

    // Validate required fields
    if (!type || !category || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: type, category, action' },
        { status: 400 }
      );
    }

    // Track the event
    const analyticsService = new AnalyticsService();
    await analyticsService.trackEvent({
      type,
      category,
      action,
      label,
      value,
      properties,
      userId: userId || session.user.id,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown'
    });

    return NextResponse.json({
      message: 'Event tracked successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
