"use client"

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/use-websocket'
import { AdminStatsCard } from './stats-card'
import { RealTimeActivityFeed } from './real-time-activity-feed'
import { RealTimeMetrics } from './real-time-metrics'
import { ConnectionStatus } from './connection-status'

interface DashboardStats {
  totalUsers: number;
  totalServers: number;
  verifiedServers: number;
  pendingVerifications: number;
  activeUsers: number;
  registrationsToday: number;
  lastUpdated: string;
}

export function RealTimeDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    connectionStatus,
    sendMessage
  } = useWebSocket('ws://localhost:3001/ws', {
    shouldReconnect: true,
    maxReconnectAttempts: 5,
    reconnectInterval: 3000,
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'stats_update') {
          setStats(prev => ({ ...prev, ...data.stats }))
        } else if (data.type === 'system_update' && data.error) {
          setError(data.message)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
  })

  const isConnected = connectionStatus === 'connected'
  const isConnecting = connectionStatus === 'connecting'
  const wsError = connectionStatus === 'error' ? 'Connection error' : null

  // Load initial stats
  useEffect(() => {
    loadInitialStats()
  }, [])

  // Subscribe to admin channels when connected
  useEffect(() => {
    if (isConnected) {
      // Send subscription messages
      sendMessage({ type: 'subscribe', channels: ['admin:stats', 'admin:activity', 'admin:audit', 'admin:system'] })
    }
  }, [isConnected, sendMessage])

  const loadInitialStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/v1/admin/stats')
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError('Failed to load dashboard statistics')
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      setError('Failed to load dashboard statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshStats = async () => {
    await loadInitialStats()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Real-time Dashboard</h1>
          <ConnectionStatus 
            isConnected={false} 
            isConnecting={true} 
            error={null} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Real-time Dashboard</h1>
          <ConnectionStatus 
            isConnected={isConnected} 
            isConnecting={isConnecting} 
            error={wsError} 
          />
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={refreshStats}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real-time Dashboard</h1>
          <p className="text-gray-600">Live updates and system monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <ConnectionStatus 
            isConnected={isConnected} 
            isConnecting={isConnecting} 
            error={wsError} 
          />
          <button
            onClick={refreshStats}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <p className="text-yellow-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
          trend={stats?.registrationsToday ? `+${stats.registrationsToday} today` : undefined}
          color="blue"
          className={isConnected ? 'ring-2 ring-green-200' : ''}
        />
        
        <AdminStatsCard
          title="MCP Servers"
          value={stats?.totalServers || 0}
          icon="🔧"
          trend={stats?.verifiedServers ? `${stats.verifiedServers} verified` : undefined}
          color="green"
          className={isConnected ? 'ring-2 ring-green-200' : ''}
        />
        
        <AdminStatsCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon="⚡"
          color="orange"
          className={isConnected ? 'ring-2 ring-green-200' : ''}
        />
        
        <AdminStatsCard
          title="Pending Verifications"
          value={stats?.pendingVerifications || 0}
          icon="⏳"
          color="yellow"
          className={isConnected ? 'ring-2 ring-green-200' : ''}
        />
      </div>

      {/* Real-time Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Metrics */}
        <div className="lg:col-span-1">
          <RealTimeMetrics isConnected={isConnected} />
        </div>

        {/* Real-time Activity Feed */}
        <div className="lg:col-span-2">
          <RealTimeActivityFeed isConnected={isConnected} />
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">WebSocket Connection</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">Storage System</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">DNS Verification</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">MCP Server</span>
            </div>
          </div>
          
          {stats?.lastUpdated && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Last updated: {new Date(stats.lastUpdated).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
