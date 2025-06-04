"use client"

import { useState, useEffect } from 'react'
import { AdminStatsCard } from '@/components/admin/stats-card'
import { AnimatedButton } from '@/components/ui/animated-button'
import { UserActionsMenu } from '@/components/admin/user-actions-menu'
import { UserCreateModal } from '@/components/admin/user-create-modal'
import { BulkActionsBar } from '@/components/admin/bulk-actions-bar'

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'moderator';
  provider: 'github' | 'google' | 'email';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  email_verified: boolean;
  metadata?: Record<string, any>;
}

interface UserStats {
  total: number;
  active: number;
  verified: number;
  admins: number;
  moderators: number;
  byProvider: Record<string, number>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'admin' | 'user' | 'moderator' | 'active' | 'inactive'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'email' | 'name' | 'role'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [filter, sortBy, sortOrder])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        ...(filter !== 'all' && filter !== 'active' && filter !== 'inactive' ? { role: filter } : {}),
        sortBy,
        sortOrder,
        ...(searchQuery ? { search: searchQuery } : {})
      })

      const response = await fetch(`/api/v1/admin/users?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        let filteredUsers = data.users || []

        // Apply client-side filters for active/inactive
        if (filter === 'active') {
          filteredUsers = filteredUsers.filter((u: User) => u.is_active)
        } else if (filter === 'inactive') {
          filteredUsers = filteredUsers.filter((u: User) => !u.is_active)
        }

        setUsers(filteredUsers)
        setStats(data.stats)
      } else {
        setError('Failed to load users')
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    try {
      let response;
      
      switch (action) {
        case 'delete':
          response = await fetch(`/api/v1/admin/users/${userId}`, {
            method: 'DELETE'
          })
          break;
        
        case 'edit':
          response = await fetch(`/api/v1/admin/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          break;
        
        default:
          // Handle other actions via bulk endpoint
          response = await fetch('/api/v1/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userIds: [userId], 
              action,
              ...(data ? { data } : {})
            })
          })
      }

      if (response.ok) {
        await loadUsers() // Refresh the list
      } else {
        const error = await response.json()
        alert(`Action failed: ${error.error}`)
      }
    } catch (error) {
      console.error('User action failed:', error)
      alert('Action failed')
    }
  }

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedUsers.size === 0) return

    try {
      const response = await fetch('/api/v1/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userIds: Array.from(selectedUsers), 
          action,
          ...(data ? { data } : {})
        })
      })

      if (response.ok) {
        setSelectedUsers(new Set())
        await loadUsers()
      } else {
        const error = await response.json()
        alert(`Bulk action failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Bulk action failed:', error)
      alert('Bulk action failed')
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Debounce the search
    setTimeout(() => {
      if (query === searchQuery) {
        loadUsers()
      }
    }, 500)
  }

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true
    return user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'moderator': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github': return '🐙'
      case 'google': return '🔍'
      default: return '📧'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="flex space-x-3">
          <AnimatedButton
            variant="outline"
            hoverScale={1.02}
            onClick={loadUsers}
          >
            🔄 Refresh
          </AnimatedButton>
          <AnimatedButton
            variant="solid"
            hoverScale={1.02}
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Add User
          </AnimatedButton>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={loadUsers}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AdminStatsCard
            title="Total Users"
            value={stats.total}
            icon="👥"
            color="blue"
          />
          <AdminStatsCard
            title="Admin Users"
            value={stats.admins}
            icon="👑"
            color="red"
          />
          <AdminStatsCard
            title="Active Users"
            value={stats.active}
            icon="⚡"
            trend={`${Math.round((stats.active / stats.total) * 100)}% active`}
            color="green"
          />
          <AdminStatsCard
            title="Verified Users"
            value={stats.verified}
            icon="✅"
            trend={`${Math.round((stats.verified / stats.total) * 100)}% verified`}
            color="orange"
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Users</option>
              <option value="admin">Admins Only</option>
              <option value="moderator">Moderators Only</option>
              <option value="user">Regular Users</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field as any)
                setSortOrder(order as any)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="email-asc">Email A-Z</option>
              <option value="email-desc">Email Z-A</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
          
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.size}
          onAction={handleBulkAction}
          onClear={() => setSelectedUsers(new Set())}
        />
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={() => {
                      if (selectedUsers.size === filteredUsers.length) {
                        setSelectedUsers(new Set())
                      } else {
                        setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => {
                        const newSelected = new Set(selectedUsers)
                        if (newSelected.has(user.id)) {
                          newSelected.delete(user.id)
                        } else {
                          newSelected.add(user.id)
                        }
                        setSelectedUsers(newSelected)
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || 'Unnamed User'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="mr-2">{getProviderIcon(user.provider)}</span>
                      <span className="text-sm text-gray-900 capitalize">{user.provider}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-900">
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {user.email_verified && (
                        <span className="text-xs text-green-600">✓</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <UserActionsMenu 
                      user={user}
                      onAction={(action, data) => handleUserAction(user.id, action, data)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-4xl text-gray-300 mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No users have been registered yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <UserCreateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadUsers()
          }}
        />
      )}
    </div>
  )
}
