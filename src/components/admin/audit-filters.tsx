"use client"

import { useState } from 'react'

interface AuditFiltersProps {
  filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    success?: boolean;
    limit?: number;
    offset?: number;
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
}

export function AuditFilters({ filters, onFilterChange, onReset }: AuditFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const commonActions = [
    'user_create',
    'user_update',
    'user_delete',
    'user_login',
    'server_register',
    'server_verify',
    'api_access',
    'admin_action'
  ]

  const commonResources = [
    'user',
    'server',
    'authentication',
    'api',
    'system',
    'data',
    'security'
  ]

  const quickFilters = [
    { label: 'Last Hour', startDate: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { label: 'Last 24 Hours', startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { label: 'Last 7 Days', startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { label: 'Last 30 Days', startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
  ]

  const handleQuickFilter = (quickFilter: any) => {
    onFilterChange({
      startDate: quickFilter.startDate,
      endDate: undefined,
      offset: 0
    })
  }

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toISOString().slice(0, 16)
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const isoDate = value ? new Date(value).toISOString() : undefined
    onFilterChange({
      [field]: isoDate,
      offset: 0
    })
  }

  const activeFilterCount = Object.keys(filters).filter(key => 
    key !== 'limit' && key !== 'offset' && filters[key as keyof typeof filters] !== undefined
  ).length

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                {activeFilterCount} active
              </span>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? 'Less Filters' : 'More Filters'}
            </button>
            <button
              onClick={onReset}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Time Filters
          </label>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => handleQuickFilter(filter)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action || ''}
              onChange={(e) => onFilterChange({ action: e.target.value || undefined, offset: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Actions</option>
              {commonActions.map(action => (
                <option key={action} value={action}>
                  {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource
            </label>
            <select
              value={filters.resource || ''}
              onChange={(e) => onFilterChange({ resource: e.target.value || undefined, offset: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Resources</option>
              {commonResources.map(resource => (
                <option key={resource} value={resource}>
                  {resource.charAt(0).toUpperCase() + resource.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.success === undefined ? '' : filters.success ? 'true' : 'false'}
              onChange={(e) => onFilterChange({ 
                success: e.target.value === '' ? undefined : e.target.value === 'true',
                offset: 0 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Status</option>
              <option value="true">Success Only</option>
              <option value="false">Failed Only</option>
            </select>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={formatDateForInput(filters.startDate)}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={formatDateForInput(filters.endDate)}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={filters.userId || ''}
                  onChange={(e) => onFilterChange({ userId: e.target.value || undefined, offset: 0 })}
                  placeholder="Enter user ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Results per page
                </label>
                <select
                  value={filters.limit || 50}
                  onChange={(e) => onFilterChange({ limit: parseInt(e.target.value), offset: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
