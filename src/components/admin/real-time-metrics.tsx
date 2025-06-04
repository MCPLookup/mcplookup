"use client"

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/use-websocket'

interface MetricData {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: 'green' | 'red' | 'yellow' | 'blue';
}

interface RealTimeMetricsProps {
  isConnected: boolean;
}

export function RealTimeMetrics({ isConnected }: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState<MetricData[]>([
    { label: 'Response Time', value: 85, unit: 'ms', trend: 'stable', color: 'green' },
    { label: 'Active Connections', value: 12, unit: '', trend: 'up', color: 'blue' },
    { label: 'Requests/min', value: 45, unit: '/min', trend: 'up', color: 'green' },
    { label: 'Error Rate', value: 0.2, unit: '%', trend: 'down', color: 'green' },
    { label: 'Memory Usage', value: 68, unit: '%', trend: 'stable', color: 'yellow' },
    { label: 'CPU Usage', value: 23, unit: '%', trend: 'stable', color: 'green' }
  ])

  const { onMessage } = useWebSocket()

  // Set up real-time metric updates
  useEffect(() => {
    if (isConnected) {
      const unsubscribeMetrics = onMessage('metrics_update', (data) => {
        if (data.metrics) {
          setMetrics(prev => prev.map(metric => {
            const update = data.metrics[metric.label.toLowerCase().replace(/[^a-z]/g, '_')]
            if (update) {
              return {
                ...metric,
                value: update.value,
                trend: update.trend || metric.trend,
                color: update.color || metric.color
              }
            }
            return metric
          }))
        }
      })

      return unsubscribeMetrics
    }
  }, [isConnected, onMessage])

  // Simulate real-time updates when not connected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        setMetrics(prev => prev.map(metric => ({
          ...metric,
          value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
          trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable'
        })))
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [isConnected])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      default: return '➡️'
    }
  }

  const getTrendColor = (trend: string, color: string) => {
    if (trend === 'stable') return 'text-gray-500'
    if (color === 'red' || (trend === 'up' && color === 'yellow')) return 'text-red-500'
    if (trend === 'up') return 'text-green-500'
    if (trend === 'down') return 'text-green-500' // Down is good for error rate
    return 'text-gray-500'
  }

  const getValueColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600'
      case 'red': return 'text-red-600'
      case 'yellow': return 'text-yellow-600'
      case 'blue': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Live Metrics</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time system performance</p>
          </div>
          {isConnected && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">LIVE</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {metric.label}
                  </span>
                  <span className={`text-xs ${getTrendColor(metric.trend, metric.color)}`}>
                    {getTrendIcon(metric.trend)}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${getValueColor(metric.color)}`}>
                  {typeof metric.value === 'number' ? metric.value.toFixed(metric.unit === '%' || metric.unit === 'ms' ? 1 : 0) : metric.value}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    {metric.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isConnected && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              ⚠️ Showing simulated data. Connect to WebSocket for live metrics.
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Updated every 5 seconds</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
