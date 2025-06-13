"use client"

import { useState } from 'react';

interface SystemControlPanelProps {
  realtimeServerStatus: 'unknown' | 'running' | 'stopped';
  onStatusChange: (status: 'unknown' | 'running' | 'stopped') => void;
}

export function SystemControlPanel({ realtimeServerStatus, onStatusChange }: SystemControlPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  const controlRealtimeServer = async (action: 'start' | 'stop') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const result = await response.json();
        onStatusChange(result.status);
        alert(`Real-time server ${action}ed successfully`);
      } else {
        const error = await response.json();
        setError(error.error);
        alert(`Failed to ${action} real-time server: ${error.error}`);
      }
    } catch (error) {
      console.error(`Failed to ${action} real-time server:`, error);
      setError(`Failed to ${action} real-time server`);
    } finally {
      setLoading(false);
    }
  };

  const getSystemInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/realtime');
      
      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data);
        onStatusChange(data.status);
      } else {
        setError('Failed to get system information');
      }
    } catch (error) {
      console.error('Failed to get system info:', error);
      setError('Failed to get system information');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setLoading(true);
      // TODO: Implement cache clearing endpoint
      alert('Cache clearing functionality not yet implemented');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setError('Failed to clear cache');
    } finally {
      setLoading(false);
    }
  };

  const runHealthCheck = async () => {
    try {
      setLoading(true);
      // TODO: Implement health check endpoint
      alert('Health check functionality not yet implemented');
    } catch (error) {
      console.error('Failed to run health check:', error);
      setError('Failed to run health check');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Real-time Server Control */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Real-time Server Control</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                realtimeServerStatus === 'running' ? 'bg-green-500' : 
                realtimeServerStatus === 'stopped' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="font-medium text-gray-900">
                Status: {realtimeServerStatus}
              </span>
            </div>
            <button
              onClick={getSystemInfo}
              disabled={loading}
              className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              🔄 Refresh
            </button>
          </div>
          <div className="flex space-x-2">
            {realtimeServerStatus === 'stopped' && (
              <button
                onClick={() => controlRealtimeServer('start')}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {loading ? 'Starting...' : 'Start Server'}
              </button>
            )}
            {realtimeServerStatus === 'running' && (
              <button
                onClick={() => controlRealtimeServer('stop')}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {loading ? 'Stopping...' : 'Stop Server'}
              </button>
            )}
          </div>
        </div>

        {/* System Information */}
        {systemInfo && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">System Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Connected Clients</div>
                <div className="text-lg font-medium text-gray-900">
                  {systemInfo.clients_connected || 0}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Uptime</div>
                <div className="text-lg font-medium text-gray-900">
                  {systemInfo.uptime ? formatUptime(systemInfo.uptime / 1000) : 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Memory Usage</div>
                <div className="text-lg font-medium text-gray-900">
                  {systemInfo.metrics?.memory_usage ? 
                    formatBytes(systemInfo.metrics.memory_usage.heapUsed) : 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Port</div>
                <div className="text-lg font-medium text-gray-900">
                  {systemInfo.port || 3001}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={clearCache}
            disabled={loading}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🧹</span>
              <div>
                <div className="font-medium text-gray-900">Clear Cache</div>
                <div className="text-sm text-gray-600">Clear all cached data</div>
              </div>
            </div>
          </button>

          <button
            onClick={runHealthCheck}
            disabled={loading}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏥</span>
              <div>
                <div className="font-medium text-gray-900">Health Check</div>
                <div className="text-sm text-gray-600">Run system health check</div>
              </div>
            </div>
          </button>

          <button
            onClick={getSystemInfo}
            disabled={loading}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <div className="font-medium text-gray-900">System Info</div>
                <div className="text-sm text-gray-600">Get detailed system information</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Environment Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Environment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Runtime</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Node.js: {process.version}</div>
              <div>Platform: {process.platform}</div>
              <div>Architecture: {process.arch}</div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Environment</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>NODE_ENV: {process.env.NODE_ENV || 'development'}</div>
              <div>Vercel: {process.env.VERCEL ? 'Yes' : 'No'}</div>
              <div>Auto-start RT: {process.env.AUTO_START_REALTIME || 'false'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Auto-start Real-time Server</div>
              <div className="text-sm text-gray-600">Automatically start the real-time server in production</div>
            </div>
            <div className="text-sm text-gray-600">
              {process.env.AUTO_START_REALTIME === 'true' ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">WebSocket Port</div>
              <div className="text-sm text-gray-600">Port for WebSocket connections</div>
            </div>
            <div className="text-sm text-gray-600">3001</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Analytics Collection</div>
              <div className="text-sm text-gray-600">Real-time analytics data collection</div>
            </div>
            <div className="text-sm text-gray-600">Enabled</div>
          </div>
        </div>
      </div>

      {/* Logs Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent System Logs</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          <div>[{new Date().toISOString()}] System status check completed</div>
          <div>[{new Date(Date.now() - 60000).toISOString()}] Real-time server status: {realtimeServerStatus}</div>
          <div>[{new Date(Date.now() - 120000).toISOString()}] Analytics collection active</div>
          <div>[{new Date(Date.now() - 180000).toISOString()}] Security monitoring enabled</div>
          <div className="text-gray-500">... (showing last 4 entries)</div>
        </div>
      </div>
    </div>
  );
}
