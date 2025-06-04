"use client"

import { useState } from 'react'

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'moderator';
  is_active: boolean;
  email_verified: boolean;
}

interface UserActionsMenuProps {
  user: User;
  onAction: (action: string, data?: any) => void;
}

export function UserActionsMenu({ user, onAction }: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const actions = [
    {
      id: 'view_details',
      label: 'View Details',
      icon: '👁️',
      color: 'text-blue-600 hover:text-blue-800'
    },
    {
      id: 'edit',
      label: 'Edit User',
      icon: '✏️',
      color: 'text-gray-600 hover:text-gray-800'
    },
    ...(user.role !== 'admin' ? [{
      id: 'promote_to_admin',
      label: 'Promote to Admin',
      icon: '👑',
      color: 'text-purple-600 hover:text-purple-800'
    }] : []),
    ...(user.is_active ? [{
      id: 'deactivate',
      label: 'Deactivate',
      icon: '⏸️',
      color: 'text-yellow-600 hover:text-yellow-800'
    }] : [{
      id: 'activate',
      label: 'Activate',
      icon: '▶️',
      color: 'text-green-600 hover:text-green-800'
    }]),
    ...(!user.email_verified ? [{
      id: 'verify_email',
      label: 'Verify Email',
      icon: '✅',
      color: 'text-green-600 hover:text-green-800'
    }] : []),
    {
      id: 'reset_password',
      label: 'Reset Password',
      icon: '🔑',
      color: 'text-orange-600 hover:text-orange-800'
    },
    {
      id: 'view_activity',
      label: 'View Activity',
      icon: '📊',
      color: 'text-indigo-600 hover:text-indigo-800'
    },
    {
      id: 'delete',
      label: 'Delete User',
      icon: '🗑️',
      color: 'text-red-600 hover:text-red-800'
    }
  ]

  const handleAction = (actionId: string) => {
    setIsOpen(false)
    
    if (actionId === 'delete') {
      if (confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
        onAction(actionId)
      }
    } else if (actionId === 'edit') {
      setShowEditModal(true)
    } else if (actionId === 'promote_to_admin') {
      if (confirm(`Are you sure you want to promote ${user.email} to admin?`)) {
        onAction(actionId)
      }
    } else {
      onAction(actionId)
    }
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  className={`
                    w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2
                    ${action.color}
                  `}
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <UserEditModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={(data) => {
            onAction('edit', data)
            setShowEditModal(false)
          }}
        />
      )}
    </>
  )
}

// Simple edit modal component
function UserEditModal({ user, onClose, onSave }: {
  user: User;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    role: user.role,
    is_active: user.is_active,
    email_verified: user.email_verified
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit User</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.email_verified}
                onChange={(e) => setFormData({ ...formData, email_verified: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Email Verified</span>
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
