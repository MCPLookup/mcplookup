"use client"

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/use-websocket'
import { formatRelativeTime } from '@/lib/utils'

interface ActivityItem {
  id: string;
  type: 'user_registered' | 'server_verified' | 'server_registered' | 'admin_action' | 'audit_log';
  message: string;
  timestamp: string;
  user?: string;
  metadata?: Record<string, any>;
  success?: boolean;
}

interface RealTimeActivityFeedProps {
  isConnected: boolean;
}

export function RealTimeActivityFeed({ isConnected }: RealTimeActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { onMessage } = useWebSocket()

  // Load initial activity
  useEffect(() => {
    loadInitialActivity()
  }, [])

  // Set up real-time updates
  useEffect(() => {
    if (isConnected) {
      const unsubscribeActivity = onMessage('activity_update', (data) => {
        if (data.activity) {
          setActivities(prev => [data.activity, ...prev.slice(0, 49)]) // Keep last 50
        }
      })

      const unsubscribeAudit = onMessage('audit_log', (data) => {
        if (data.entry) {
          const activity: ActivityItem = {
            id: data.entry.id,
            type: 'audit_log',
            message: data.entry.summary || `${data.entry.action} on ${data.entry.resource}`,
            timestamp: data.entry.timestamp,
            user: data.entry.userEmail,
            success: data.entry.success,
            metadata: {
              action: data.entry.action,
              resource: data.entry.resource
            }
          }
          setActivities(prev => [activity, ...prev.slice(0, 49)])
        }
      })

      return () => {
        unsubscribeActivity()
        unsubscribeAudit()
      }
    }
  }, [isConnected, onMessage])

  const loadInitialActivity = async () => {
    try {
      setIsLoading(true)
      
      // Load recent audit logs as activity
      const response = await fetch('/api/v1/admin/audit/recent?limit=20')
      
      if (response.ok) {
        const data = await response.json()
        const activities = data.logs?.map((log: any) => ({
          id: log.id,
          type: 'audit_log',
          message: `${log.action.replace(/_/g, ' ')} on ${log.resource}`,
          timestamp: log.timestamp,
          user: log.userEmail,
          success: log.success,
          metadata: {
            action: log.action,
            resource: log.resource,
            details: log.details
          }
        })) || []
        
        setActivities(activities)
      }
    } catch (error) {
      console.error('Error loading initial activity:', error)
      // Set some mock data for demonstration
      setActivities([
        {
          id: '1',
          type: 'user_registered',
          message: 'New user registered: john@example.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          user: 'john@example.com',
          success: true
        },
        {
          id: '2',
          type: 'server_verified',
          message: 'MCP server verified: gmail.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          success: true,
          metadata: { domain: 'gmail.com' }
        },
        {
          id: '3',
          type: 'admin_action',
          message: 'User promoted to admin: admin@example.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: 'admin@example.com',
          success: true
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string, success?: boolean) => {
    if (success === false) return '❌'
    
    switch (type) {
      case 'user_registered': return '👤'
      case 'server_verified': return '✅'
      case 'server_registered': return '🔧'
      case 'admin_action': return '⚡'
      case 'audit_log': return '📋'
      default: return 'ℹ️'
    }
  }

  const getActivityColor = (type: string, success?: boolean) => {
    if (success === false) return 'text-red-600'
    
    switch (type) {
      case 'user_registered': return 'text-blue-600'
      case 'server_verified': return 'text-green-600'
      case 'server_registered': return 'text-orange-600'
      case 'admin_action': return 'text-purple-600'
      case 'audit_log': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Live Activity Feed</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time system events and user actions</p>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">LIVE</span>
              </div>
            )}
            <button 
              onClick={loadInitialActivity}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((item, index) => (
              <div 
                key={item.id} 
                className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
                  index === 0 && isConnected ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${getActivityColor(item.type, item.success)} bg-gray-50
                `}>
                  {getActivityIcon(item.type, item.success)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {item.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                    {item.user && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">
                          {item.user}
                        </p>
                      </>
                    )}
                    {item.success === false && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-red-600 font-medium">FAILED</span>
                      </>
                    )}
                  </div>
                </div>
                
                {index === 0 && isConnected && (
                  <div className="text-xs text-green-600 font-medium">
                    NEW
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLoading && activities.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl text-gray-300 mb-2">📭</div>
            <p className="text-gray-500">No recent activity</p>
            <button 
              onClick={loadInitialActivity}
              className="mt-2 text-orange-600 hover:text-orange-700 text-sm underline"
            >
              Refresh to check for updates
            </button>
          </div>
        )}

        {!isConnected && activities.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              ⚠️ Real-time updates are disabled. Activity shown may not be current.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
