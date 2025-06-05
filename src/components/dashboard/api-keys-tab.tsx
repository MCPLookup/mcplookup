"use client"

import { useState, useEffect } from 'react';
import { AnimatedButton } from '@/components/ui/animated-button';
import AnimatedCard from '@/components/ui/animated-card';
import { ApiKey, ApiKeyStats, CreateApiKeyRequest } from '@/lib/services/api-keys/types';

interface ApiKeyWithStats extends ApiKey {
  stats?: ApiKeyStats | null;
}

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateApiKeyModal({ isOpen, onClose, onSuccess }: CreateApiKeyModalProps) {
  const [formData, setFormData] = useState<CreateApiKeyRequest>({
    name: '',
    permissions: [],
    expires_at: undefined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create API key');
      }

      const data = await response.json();
      setCreatedKey(data.raw_key);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', permissions: [], expires_at: undefined });
    setCreatedKey(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">
          {createdKey ? 'API Key Created' : 'Create New API Key'}
        </h3>

        {createdKey ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 mb-2">
                Your API key has been created. Copy it now - it won't be shown again.
              </p>
              <div className="bg-white border rounded p-2 font-mono text-sm break-all">
                {createdKey}
              </div>
            </div>
            <AnimatedButton
              variant="solid"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleClose}
            >
              Done
            </AnimatedButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="My API Key"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permissions
              </label>
              <div className="space-y-2">
                {[
                  { id: 'discovery:read', label: 'Discovery (Read)' },
                  { id: 'servers:read', label: 'Servers (Read)' },
                  { id: 'servers:write', label: 'Servers (Write)' },
                  { id: 'analytics:read', label: 'Analytics (Read)' }
                ].map((permission) => (
                  <label key={permission.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.id as any)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            permissions: [...formData.permissions, permission.id as any]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            permissions: formData.permissions.filter(p => p !== permission.id)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{permission.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires At (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at ? formData.expires_at.slice(0, 16) : ''}
                onChange={(e) => setFormData({
                  ...formData,
                  expires_at: e.target.value ? new Date(e.target.value).toISOString() : undefined
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
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
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create API Key'}
              </AnimatedButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function ApiKeysTab() {
  const [apiKeys, setApiKeys] = useState<ApiKeyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/api-keys');
      
      if (!response.ok) {
        throw new Error('Failed to load API keys');
      }

      const data = await response.json();
      setApiKeys(data.api_keys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const revokeApiKey = async (apiKeyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/api-keys?id=${apiKeyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      await loadApiKeys();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to revoke API key');
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading API keys...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <AnimatedButton
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={loadApiKeys}
        >
          Retry
        </AnimatedButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
          <p className="text-gray-600">Manage your API keys for programmatic access</p>
        </div>
        <AnimatedButton
          variant="solid"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Create API Key
        </AnimatedButton>
      </div>

      {apiKeys.length === 0 ? (
        <AnimatedCard.Root>
          <AnimatedCard.Body>
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔑</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h3>
              <p className="text-gray-600 mb-4">
                Create your first API key to access the MCPLookup API programmatically
              </p>
              <AnimatedButton
                variant="solid"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First API Key
              </AnimatedButton>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <AnimatedCard.Root key={apiKey.id} hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                      <p className="text-sm text-gray-600 font-mono">{apiKey.key_prefix}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apiKey.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {apiKey.is_active ? 'Active' : 'Revoked'}
                      </span>
                      {apiKey.is_active && (
                        <AnimatedButton
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => revokeApiKey(apiKey.id)}
                        >
                          Revoke
                        </AnimatedButton>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Total Requests</div>
                      <div className="text-lg font-medium">{apiKey.stats?.total_requests || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Today</div>
                      <div className="text-lg font-medium">{apiKey.stats?.requests_today || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">This Week</div>
                      <div className="text-lg font-medium">{apiKey.stats?.requests_this_week || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Error Rate</div>
                      <div className="text-lg font-medium">{apiKey.stats?.error_rate || 0}%</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {apiKey.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500">
                    Created: {new Date(apiKey.created_at).toLocaleDateString()}
                    {apiKey.last_used_at && (
                      <> • Last used: {new Date(apiKey.last_used_at).toLocaleDateString()}</>
                    )}
                    {apiKey.expires_at && (
                      <> • Expires: {new Date(apiKey.expires_at).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          ))}
        </div>
      )}

      <CreateApiKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadApiKeys();
        }}
      />
    </div>
  );
}
