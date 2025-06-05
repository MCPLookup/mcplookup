'use client';

import { useState } from 'react';
import { AnimatedButton } from '@/components/ui/animated-button';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ApiKeyResponse {
  api_key: {
    id: string;
    name: string;
    key_prefix: string;
    permissions: string[];
    created_at: string;
  };
  raw_key: string;
  message: string;
  warning: string;
}

export function CreateApiKeyModal({ isOpen, onClose, onSuccess }: CreateApiKeyModalProps) {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>(['discovery:read', 'servers:read', 'servers:write', 'analytics:read']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdKey, setCreatedKey] = useState<ApiKeyResponse | null>(null);

  const availablePermissions = [
    { id: 'discovery:read', label: 'Discovery Read', description: 'Access discovery endpoints' },
    { id: 'servers:read', label: 'Servers Read', description: 'Read server information' },
    { id: 'servers:write', label: 'Servers Write', description: 'Register and update servers' },
    { id: 'servers:delete', label: 'Servers Delete', description: 'Delete servers' },
    { id: 'analytics:read', label: 'Analytics Read', description: 'Access usage analytics' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dashboard/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          permissions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create API key');
      }

      const data: ApiKeyResponse = await response.json();
      setCreatedKey(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setPermissions(['discovery:read', 'servers:read', 'servers:write', 'analytics:read']);
    setError('');
    setCreatedKey(null);
    onClose();
  };

  const handleSuccess = () => {
    handleClose();
    onSuccess();
  };

  const togglePermission = (permission: string) => {
    setPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('API key copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {createdKey ? (
          // Success state - show the created API key
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">API Key Created!</h2>
              <p className="text-gray-600">Your API key has been created successfully.</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Important Security Notice</h3>
              <p className="text-red-800 text-sm mb-3">
                This is the only time you'll see your complete API key. Store it securely and never share it.
              </p>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm break-all">
                {createdKey.raw_key}
              </div>
              
              <div className="flex gap-2 mt-3">
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdKey.raw_key)}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  📋 Copy API Key
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`export MCP_API_KEY="${createdKey.raw_key}"`)}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  📋 Copy as Environment Variable
                </AnimatedButton>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">API Key Details</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {createdKey.api_key.name}</div>
                <div><strong>Key ID:</strong> {createdKey.api_key.key_prefix}</div>
                <div><strong>Permissions:</strong> {createdKey.api_key.permissions.join(', ')}</div>
                <div><strong>Created:</strong> {new Date(createdKey.api_key.created_at).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <AnimatedButton
                variant="solid"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSuccess}
              >
                Done
              </AnimatedButton>
            </div>
          </div>
        ) : (
          // Form state - create new API key
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Free API Key</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  API Key Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., My App API Key"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Choose a descriptive name to identify this API key
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissions
                </label>
                <div className="space-y-3">
                  {availablePermissions.map((perm) => (
                    <label key={perm.id} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{perm.label}</div>
                        <div className="text-xs text-gray-500">{perm.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select the permissions your application needs. You can always create additional keys with different permissions.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <AnimatedButton
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  type="submit"
                  variant="solid"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading || !name.trim() || permissions.length === 0}
                >
                  {loading ? 'Creating...' : 'Create API Key'}
                </AnimatedButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
