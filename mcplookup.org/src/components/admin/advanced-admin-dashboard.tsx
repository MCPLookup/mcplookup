"use client"

import { useState, useEffect } from 'react';
import { RealTimeDashboard } from './real-time-dashboard';
import { SecurityMonitoringPanel } from './security-monitoring-panel';
import { AnalyticsDashboard } from './analytics-dashboard';
import { SystemControlPanel } from './system-control-panel';

type TabType = 'realtime' | 'security' | 'analytics' | 'system';

export function AdvancedAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('realtime');
  const [realtimeServerStatus, setRealtimeServerStatus] = useState<'unknown' | 'running' | 'stopped'>('unknown');

  // Check real-time server status on mount
  useEffect(() => {
    checkRealtimeServerStatus();
  }, []);

  const checkRealtimeServerStatus = async () => {
    try {
      const response = await fetch('/api/admin/realtime');
      if (response.ok) {
        const data = await response.json();
        setRealtimeServerStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to check real-time server status:', error);
    }
  };

  const tabs = [
    {
      id: 'realtime' as TabType,
      name: 'Real-time Dashboard',
      icon: '📊',
      description: 'Live system monitoring and metrics'
    },
    {
      id: 'security' as TabType,
      name: 'Security Monitoring',
      icon: '🔒',
      description: 'Domain challenges and threat detection'
    },
    {
      id: 'analytics' as TabType,
      name: 'Analytics',
      icon: '📈',
      description: 'Usage analytics and insights'
    },
    {
      id: 'system' as TabType,
      name: 'System Control',
      icon: '⚙️',
      description: 'Server management and configuration'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                realtimeServerStatus === 'running' ? 'bg-green-500' : 
                realtimeServerStatus === 'stopped' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-900">
                Real-time Server: {realtimeServerStatus}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Analytics: Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Security: Monitoring</span>
            </div>
          </div>
          <button
            onClick={checkRealtimeServerStatus}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
          >
            <span>🔄</span>
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'realtime' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Real-time Dashboard</h2>
                <p className="text-gray-600">Live system monitoring with WebSocket updates</p>
              </div>
              <RealTimeDashboard />
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Security Monitoring</h2>
                <p className="text-gray-600">Domain transfer protection and threat detection</p>
              </div>
              <SecurityMonitoringPanel />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
                <p className="text-gray-600">Comprehensive usage analytics and insights</p>
              </div>
              <AnalyticsDashboard />
            </div>
          )}

          {activeTab === 'system' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">System Control</h2>
                <p className="text-gray-600">Server management and system configuration</p>
              </div>
              <SystemControlPanel 
                realtimeServerStatus={realtimeServerStatus}
                onStatusChange={setRealtimeServerStatus}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Security Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
              🔍 Run Security Sweep
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
              🚨 View Active Threats
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
              📋 Export Security Report
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
              📊 Generate Report
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
              📈 View Trends
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
              💾 Export Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={checkRealtimeServerStatus}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
            >
              🔄 Refresh All Status
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
              🧹 Clear Cache
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
              📋 System Health Check
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Advanced admin features are enabled. All actions are logged for security.
          </div>
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
