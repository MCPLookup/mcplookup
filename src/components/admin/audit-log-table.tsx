"use client"

import { formatRelativeTime, formatDateTime } from '@/lib/utils'

interface AuditLog {
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
  success: boolean;
  error?: string;
  duration?: number;
}

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  pagination: {
    total: number;
    hasMore: boolean;
  };
  onLoadMore: () => void;
  isConnected: boolean;
}

export function AuditLogTable({ 
  logs, 
  isLoading, 
  pagination, 
  onLoadMore, 
  isConnected 
}: AuditLogTableProps) {
  const getActionColor = (action: string, success: boolean) => {
    if (!success) return 'text-red-600 bg-red-50'
    
    if (action.includes('delete') || action.includes('remove')) return 'text-red-600 bg-red-50'
    if (action.includes('create') || action.includes('register')) return 'text-green-600 bg-green-50'
    if (action.includes('update') || action.includes('modify')) return 'text-blue-600 bg-blue-50'
    if (action.includes('login') || action.includes('auth')) return 'text-purple-600 bg-purple-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'user': return '👤'
      case 'server': return '🔧'
      case 'authentication': return '🔐'
      case 'api': return '🌐'
      case 'system': return '⚙️'
      case 'data': return '📊'
      case 'security': return '🛡️'
      default: return '📋'
    }
  }

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'moderator': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return null
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(2)}s`
  }

  if (isLoading && logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Audit Logs ({pagination.total.toLocaleString()})
          </h2>
          {isConnected && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">LIVE</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log, index) => (
              <tr 
                key={log.id} 
                className={`hover:bg-gray-50 ${
                  index === 0 && isConnected ? 'bg-green-50 border-l-4 border-green-500' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">
                      {formatRelativeTime(log.timestamp)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(log.timestamp)}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`
                    inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${getActionColor(log.action, log.success)}
                  `}>
                    {formatAction(log.action)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2">{getResourceIcon(log.resource)}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {log.resource}
                      </div>
                      {log.resourceId && (
                        <div className="text-xs text-gray-500 truncate max-w-32">
                          {log.resourceId}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {log.userEmail ? (
                    <div>
                      <div className="text-sm text-gray-900">{log.userEmail}</div>
                      {log.userRole && (
                        <span className={`
                          inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1
                          ${getRoleBadgeColor(log.userRole)}
                        `}>
                          {log.userRole}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">System</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      log.success ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm ${
                      log.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  {log.duration && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDuration(log.duration)}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    {log.error && (
                      <div className="text-xs text-red-600 mb-1 truncate">
                        Error: {log.error}
                      </div>
                    )}
                    {log.ipAddress && (
                      <div className="text-xs text-gray-500 mb-1">
                        IP: {log.ipAddress}
                      </div>
                    )}
                    {Object.keys(log.details).length > 0 && (
                      <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-800">
                          View Details
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More / Pagination */}
      {pagination.hasMore && (
        <div className="p-6 border-t border-gray-200 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {logs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-4xl text-gray-300 mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
          <p className="text-gray-500">
            No logs match your current filters, or no activities have been logged yet.
          </p>
        </div>
      )}
    </div>
  )
}
