"use client"

import { useState, useEffect } from 'react';

interface AnalyticsData {
  period: {
    start: string;
    end: string;
    duration: string;
  };
  analytics: {
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
    topActions: Array<{ action: string; count: number }>;
    topCategories: Array<{ category: string; count: number }>;
    timeSeriesData: Array<{ timestamp: string; count: number }>;
    conversionFunnels: Record<string, number>;
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
    throughput: number;
    uptime: number;
  };
  userBehavior: {
    averageSessionDuration: number;
    bounceRate: number;
    pagesPerSession: number;
    topPages: Array<{ page: string; views: number }>;
    userFlow: Array<{ from: string; to: string; count: number }>;
    retentionRate: number;
  };
  insights: {
    summary: Array<{ metric: string; value: number; description: string }>;
    alerts: Array<{ type: string; severity: string; message: string; recommendation: string }>;
    recommendations: Array<{ type: string; priority: string; message: string; actions: string[] }>;
    trends: Array<{ type: string; data: any; description: string }>;
  };
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('day');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={loadAnalyticsData}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Analytics Overview</h3>
          <p className="text-sm text-gray-600">
            {new Date(analyticsData.period.start).toLocaleDateString()} - {new Date(analyticsData.period.end).toLocaleDateString()}
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="hour">Last Hour</option>
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(analyticsData.analytics.totalEvents)}
          </div>
          <div className="text-sm text-blue-600">Total Events</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(analyticsData.analytics.uniqueUsers)}
          </div>
          <div className="text-sm text-green-600">Unique Users</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {analyticsData.performance.averageResponseTime}ms
          </div>
          <div className="text-sm text-purple-600">Avg Response Time</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {analyticsData.userBehavior.bounceRate.toFixed(1)}%
          </div>
          <div className="text-sm text-orange-600">Bounce Rate</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {analyticsData.performance.averageResponseTime}ms
            </div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {analyticsData.performance.p95ResponseTime}ms
            </div>
            <div className="text-sm text-gray-600">95th Percentile</div>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${
              analyticsData.performance.errorRate > 5 ? 'text-red-600' : 'text-green-600'
            }`}>
              {analyticsData.performance.errorRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Error Rate</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {analyticsData.performance.throughput.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Req/min</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {analyticsData.performance.uptime.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
        </div>
      </div>

      {/* User Behavior */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Behavior</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatDuration(analyticsData.userBehavior.averageSessionDuration)}
            </div>
            <div className="text-sm text-gray-600">Avg Session Duration</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {analyticsData.userBehavior.pagesPerSession.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Pages per Session</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {analyticsData.userBehavior.bounceRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Bounce Rate</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {analyticsData.userBehavior.retentionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Retention Rate</div>
          </div>
        </div>
      </div>

      {/* Top Actions and Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Actions</h3>
          <div className="space-y-3">
            {analyticsData.analytics.topActions.slice(0, 5).map((action, index) => (
              <div key={action.action} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="text-sm text-gray-900">{action.action}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(action.count)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {analyticsData.analytics.topCategories.slice(0, 5).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="text-sm text-gray-900">{category.category}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(category.count)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      {analyticsData.analytics.conversionFunnels && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(analyticsData.analytics.conversionFunnels).map(([step, count]) => (
              <div key={step} className="text-center">
                <div className="text-xl font-bold text-gray-900">{formatNumber(count)}</div>
                <div className="text-sm text-gray-600 capitalize">{step.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights and Alerts */}
      {analyticsData.insights && (
        <div className="space-y-6">
          {/* Alerts */}
          {analyticsData.insights.alerts && analyticsData.insights.alerts.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Alerts</h3>
              <div className="space-y-3">
                {analyticsData.insights.alerts.map((alert, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className={`font-medium ${
                      alert.severity === 'high' ? 'text-red-800' :
                      alert.severity === 'medium' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {alert.message}
                    </div>
                    <div className={`text-sm mt-1 ${
                      alert.severity === 'high' ? 'text-red-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {alert.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analyticsData.insights.recommendations && analyticsData.insights.recommendations.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-4">
                {analyticsData.insights.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{rec.message}</div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Actions:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {rec.actions.map((action, actionIndex) => (
                          <li key={actionIndex}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
