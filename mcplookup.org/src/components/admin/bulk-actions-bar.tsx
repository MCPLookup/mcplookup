"use client"

import { useState } from 'react'
import { AnimatedButton } from '@/components/ui/animated-button'

interface BulkActionsBarProps {
  selectedCount: number;
  onAction: (action: string, data?: any) => void;
  onClear: () => void;
}

export function BulkActionsBar({ selectedCount, onAction, onClear }: BulkActionsBarProps) {
  const [showConfirm, setShowConfirm] = useState<string | null>(null)

  const actions = [
    {
      id: 'activate',
      label: 'Activate',
      icon: '▶️',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Activate selected users'
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: '⏸️',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      description: 'Deactivate selected users'
    },
    {
      id: 'verify_email',
      label: 'Verify Email',
      icon: '✅',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Mark emails as verified'
    },
    {
      id: 'promote_to_admin',
      label: 'Promote to Admin',
      icon: '👑',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Promote to admin role',
      requiresConfirm: true
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: '🗑️',
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Delete selected users',
      requiresConfirm: true
    }
  ]

  const handleAction = (actionId: string) => {
    const action = actions.find(a => a.id === actionId)
    
    if (action?.requiresConfirm) {
      setShowConfirm(actionId)
    } else {
      onAction(actionId)
    }
  }

  const confirmAction = (actionId: string) => {
    onAction(actionId)
    setShowConfirm(null)
  }

  return (
    <>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-orange-800">
                {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={onClear}
                className="text-orange-600 hover:text-orange-800 text-sm underline"
              >
                Clear selection
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-orange-700 mr-2">Bulk actions:</span>
            {actions.map((action) => (
              <AnimatedButton
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleAction(action.id)}
                className={`${action.color} text-white border-transparent`}
                hoverScale={1.05}
                title={action.description}
              >
                <span className="mr-1">{action.icon}</span>
                {action.label}
              </AnimatedButton>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Bulk Action
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to{' '}
                <strong>
                  {actions.find(a => a.id === showConfirm)?.label.toLowerCase()}
                </strong>{' '}
                <strong>{selectedCount}</strong> selected user{selectedCount !== 1 ? 's' : ''}?
              </p>
              
              {showConfirm === 'delete' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm font-medium">
                    ⚠️ This action cannot be undone. All user data will be permanently deleted.
                  </p>
                </div>
              )}

              {showConfirm === 'promote_to_admin' && (
                <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
                  <p className="text-purple-700 text-sm font-medium">
                    👑 This will give admin privileges to all selected users.
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmAction(showConfirm)}
                className={`
                  flex-1 px-4 py-2 text-white rounded-lg
                  ${showConfirm === 'delete' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-orange-500 hover:bg-orange-600'
                  }
                `}
              >
                {showConfirm === 'delete' ? 'Delete Users' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
