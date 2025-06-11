"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/client'
import { clientGitHubOwnershipService } from '@/lib/services/client/github-ownership-client'
import { clientUserServersService } from '@/lib/services/client/user-servers-client'
import { EmailChangeSupportModal } from './email-change-support-modal'
import { ServerList } from '@/components/servers/server-display'
import { RepositoryList } from '@/components/repositories/repository-display'
import { ServerEditModal, ServerEditData } from '@/components/servers/server-edit-modal'
import Link from 'next/link'
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  Badge,
  Avatar,
  Separator,
  Grid
} from '@chakra-ui/react'
import { Alert } from '@/components/ui/alert'
import { Field } from '@/components/ui/field'
import { FaGithub, FaEdit, FaSave, FaTimes, FaLock, FaEnvelope, FaServer, FaExternalLinkAlt, FaEye, FaEyeSlash } from 'react-icons/fa'

// Update interfaces to match the new components
interface OwnedRepo {
  name: string;
  verified_at: string;
  verification_branch: string;
  description?: string;
  stars?: number;
  language?: string;
  full_name?: string;
}

interface UserServer {
  id: string;
  domain: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  ownership_status: 'unowned' | 'owned';
  type: 'github' | 'official';
  github_repo?: string;
  github_stars?: number;
  registered_at: string;
  language?: string;
  capabilities?: string[];
  owner_user_id?: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  newsletter: boolean;
  // Privacy settings
  profile_visibility: 'public' | 'private';
  show_github_repos: boolean;
  show_registered_servers: boolean;
  show_activity_stats: boolean;
}

export function ProfileTab() {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ownedRepos, setOwnedRepos] = useState<OwnedRepo[]>([]);
  const [userServers, setUserServers] = useState<UserServer[]>([]);
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [showServerEditModal, setShowServerEditModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState<UserServer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    profile_name: '',
    email: user?.email || '',
    preferences: {
      theme: 'system' as 'light' | 'dark' | 'system',
      notifications: true,
      newsletter: false,
      // Privacy defaults - secure by default
      profile_visibility: 'private' as 'public' | 'private',
      show_github_repos: false,
      show_registered_servers: false,
      show_activity_stats: false
    }
  })
  useEffect(() => {
    if (user) {
      loadUserData()
      loadOwnedRepositories()
      loadUserServers()
    }
  }, [user])

  const loadUserData = async () => {
    try {      const response = await fetch('/api/dashboard/profile');
      if (response.ok) {
        const data = await response.json();        setFormData({
          name: data.name || '',
          profile_name: data.profile_name || '',
          email: data.email || '',
          preferences: data.preferences || {
            theme: 'system',
            notifications: true,
            newsletter: false,
            // Privacy defaults - secure by default
            profile_visibility: 'private',
            show_github_repos: false,
            show_registered_servers: false,
            show_activity_stats: false
          }
        });
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }
  const loadOwnedRepositories = async () => {
    if (!user) return
      try {
      // Get user's owned repositories
      const reposResponse = await clientGitHubOwnershipService.getUserRepositories(user.id)
      
      if (!reposResponse.success || !reposResponse.repositories) {
        console.error('Failed to load repositories:', reposResponse.error)
        return
      }
      
      // For each repo, get verification details
      const repoDetails = await Promise.all(
        reposResponse.repositories.map(async (repoInfo) => {
          const ownership = await clientGitHubOwnershipService.verifyRepositoryOwnership(user.id, repoInfo.githubRepo)
          return {
            name: repoInfo.githubRepo,
            verified_at: ownership.status === 'owned' ? 'verified' : '',
            verification_branch: 'main' // Would get from storage
          }
        })
      )
      
      setOwnedRepos(repoDetails)
    } catch (error) {
      console.error('Failed to load owned repositories:', error)
    }
  }

  const loadUserServers = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/dashboard/servers?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserServers(data.servers || [])
      }
    } catch (error) {
      console.error('Failed to load user servers:', error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {      const response = await fetch('/api/dashboard/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          profile_name: formData.profile_name,
          preferences: formData.preferences
        })
      })

      if (response.ok) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        // Reload to get fresh data
        setTimeout(() => loadUserData(), 1000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update profile')
      }
    } catch (error) {
      setError('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    setSuccess(null)
    // Reset form data
    loadUserData()
  }
  const handleEmailChangeSuccess = () => {
    setSuccess('Email change request submitted successfully!')
  }

  const handleServerEdit = (server: UserServer) => {
    setSelectedServer(server);
    setShowServerEditModal(true);
  }

  const handleServerSave = async (serverId: string, data: ServerEditData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/servers/${serverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // Reload servers to get updated data
        await loadUserServers();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to update server' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  const handleRepositoryEdit = (repository: OwnedRepo) => {
    // Navigate to repository management page or open modal
    window.open(`https://github.com/${repository.full_name || repository.name}`, '_blank');
  }

  if (!isAuthenticated || !user) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.600">Please sign in to view your profile</Text>
      </Box>
    )
  }

  return (
    <VStack gap={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Heading size="lg" color="gray.900">Profile & Settings</Heading>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <FaEdit className="mr-2" />
            Edit Profile
          </Button>
        ) : (
          <HStack gap={2}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              <FaTimes className="mr-2" />
              Cancel
            </Button>
            <Button
              colorPalette="blue"
              size="sm"
              onClick={handleSave}
              loading={isSaving}
            >
              <FaSave className="mr-2" />
              Save Changes
            </Button>
          </HStack>
        )}
      </HStack>

      {/* Alerts */}
      {error && (
        <Alert.Root status="error">
          <Alert.Icon />
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      )}
      
      {success && (
        <Alert.Root status="success">
          <Alert.Icon />
          <Alert.Description>{success}</Alert.Description>
        </Alert.Root>
      )}

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Profile Information */}
        <Card.Root>
          <Card.Header>
            <Heading size="md">Profile Information</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              {/* Avatar */}
              <HStack gap={4}>
                <Avatar.Root size="lg">
                  <Avatar.Image src={user.image} alt={user.name} />
                  <Avatar.Fallback>{user.name?.charAt(0) || 'U'}</Avatar.Fallback>
                </Avatar.Root>
                <Box>
                  <Text fontWeight="medium">{user.name || 'Unnamed User'}</Text>
                  <Text color="gray.600" fontSize="sm">{user.email}</Text>
                  <Badge variant="subtle" colorPalette="green" size="sm">
                    {user.emailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </Box>
              </HStack>

              <Separator />              {/* Editable Fields */}
              <Field label="Display Name">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </Field>

              <Field label="Profile Name (URL-friendly)">
                <Input
                  value={formData.profile_name}
                  onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
                  placeholder="your-profile-name"
                  disabled={!isEditing}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  This will be your public profile URL: mcplookup.org/profile/{formData.profile_name || 'your-profile-name'}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Use only letters, numbers, and hyphens. Must be 2-50 characters.
                </Text>
              </Field>

              <Field label="Email Address">
                <HStack gap={2}>
                  <Input
                    value={formData.email}
                    disabled={true} // Email can't be changed directly
                    flex="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEmailChangeModal(true)}
                  >
                    <FaEnvelope className="mr-2" />
                    Change
                  </Button>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  Email changes require security verification through support
                </Text>
              </Field>
            </VStack>
          </Card.Body>
        </Card.Root>        {/* Preferences */}
        <Card.Root>
          <Card.Header>
            <Heading size="md">Privacy & Preferences</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={6} align="stretch">
              {/* Profile Visibility Section */}
              <Box>
                <Heading size="sm" mb={3}>Profile Visibility</Heading>
                <VStack gap={3} align="stretch">
                  <Field label="Profile Visibility">
                    <select
                      value={formData.preferences.profile_visibility}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          profile_visibility: e.target.value as 'public' | 'private'
                        }
                      })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="private">Private (default)</option>
                      <option value="public">Public</option>
                    </select>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {formData.preferences.profile_visibility === 'private' 
                        ? 'Your repositories and servers will show as "Private"'
                        : 'Your repositories and servers will be visible to others'
                      }
                    </Text>
                  </Field>

                  <Field label="Show GitHub Repositories">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.preferences.show_github_repos}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            show_github_repos: e.target.checked
                          }
                        })}
                        disabled={!isEditing || formData.preferences.profile_visibility === 'private'}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <Text fontSize="sm">Show your owned GitHub repositories</Text>
                    </label>
                  </Field>

                  <Field label="Show Registered Servers">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.preferences.show_registered_servers}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            show_registered_servers: e.target.checked
                          }
                        })}
                        disabled={!isEditing || formData.preferences.profile_visibility === 'private'}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <Text fontSize="sm">Show your registered MCP servers</Text>
                    </label>
                  </Field>

                  <Field label="Show Activity Statistics">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.preferences.show_activity_stats}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            show_activity_stats: e.target.checked
                          }
                        })}
                        disabled={!isEditing || formData.preferences.profile_visibility === 'private'}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <Text fontSize="sm">Show server counts and activity stats</Text>
                    </label>
                  </Field>
                </VStack>
              </Box>

              <Separator />

              {/* Notification Section */}
              <Box>
                <Heading size="sm" mb={3}>Notifications</Heading>
                <VStack gap={3} align="stretch">
                  <Field label="Theme">
                    <select
                      value={formData.preferences.theme}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          theme: e.target.value as 'light' | 'dark' | 'system'
                        }
                      })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </Field>

                  <Field label="Email Notifications">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.preferences.notifications}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            notifications: e.target.checked
                          }
                        })}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <Text fontSize="sm">Receive email notifications for account activities</Text>
                    </label>
                  </Field>

                  <Field label="Newsletter">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.preferences.newsletter}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            newsletter: e.target.checked
                          }
                        })}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <Text fontSize="sm">Subscribe to product updates and newsletter</Text>
                    </label>
                  </Field>
                </VStack>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Grid>      {/* Owned GitHub Repositories */}
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between">
            <Heading size="md">Owned GitHub Repositories</Heading>
            {formData.preferences.profile_visibility === 'private' || !formData.preferences.show_github_repos ? (
              <Badge variant="subtle" colorPalette="gray">
                <FaEyeSlash className="mr-1" />
                Private
              </Badge>
            ) : (
              <Badge variant="subtle" colorPalette="blue">
                <FaEye className="mr-1" />
                {ownedRepos.length} owned
              </Badge>
            )}
          </HStack>
        </Card.Header>
        <Card.Body>
          {formData.preferences.profile_visibility === 'private' || !formData.preferences.show_github_repos ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.600" mb={4}>
                GitHub repositories are private
              </Text>
              <Text fontSize="sm" color="gray.500">
                Enable "Show GitHub Repositories" and set profile to "Public" to display your owned repositories
              </Text>
            </Box>
          ) : ownedRepos.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.600" mb={4}>
                You haven't claimed ownership of any GitHub repositories yet
              </Text>
              <Link href="/register">
                <Button variant="outline" size="sm">
                  <FaGithub className="mr-2" />
                  Claim Repository Ownership
                </Button>
              </Link>
            </Box>
          ) : (
            <RepositoryList
              repositories={ownedRepos}
              currentUserId={user?.id}
              variant="list"
              showEditButton={true}
              onEdit={handleRepositoryEdit}
              emptyMessage="No repositories found"
            />
          )}
        </Card.Body>
      </Card.Root>

      {/* Registered MCP Servers */}
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between">
            <Heading size="md">Registered MCP Servers</Heading>
            {formData.preferences.profile_visibility === 'private' || !formData.preferences.show_registered_servers ? (
              <Badge variant="subtle" colorPalette="gray">
                <FaEyeSlash className="mr-1" />
                Private
              </Badge>
            ) : (
              <Badge variant="subtle" colorPalette="purple">
                <FaEye className="mr-1" />
                {userServers.length} registered
              </Badge>
            )}
          </HStack>
        </Card.Header>
        <Card.Body>
          {formData.preferences.profile_visibility === 'private' || !formData.preferences.show_registered_servers ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.600" mb={4}>
                Registered servers are private
              </Text>
              <Text fontSize="sm" color="gray.500">
                Enable "Show Registered Servers" and set profile to "Public" to display your registered MCP servers
              </Text>
            </Box>
          ) : userServers.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.600" mb={4}>
                You haven't registered any MCP servers yet
              </Text>
              <Link href="/register">
                <Button variant="outline" size="sm">
                  <FaServer className="mr-2" />
                  Register MCP Server
                </Button>
              </Link>
            </Box>
          ) : (
            <ServerList
              servers={userServers}
              currentUserId={user?.id}
              variant="list"
              showEditButton={true}
              onEdit={handleServerEdit}
              emptyMessage="No servers found"
            />
          )}
        </Card.Body>
      </Card.Root>      {/* Email Change Modal */}
      <EmailChangeSupportModal
        isOpen={showEmailChangeModal}
        onClose={() => setShowEmailChangeModal(false)}
        currentEmail={user.email || ''}
        onSuccess={handleEmailChangeSuccess}
      />

      {/* Server Edit Modal */}
      {selectedServer && (
        <ServerEditModal
          isOpen={showServerEditModal}
          onClose={() => {
            setShowServerEditModal(false);
            setSelectedServer(null);
          }}
          server={selectedServer}
          onSave={handleServerSave}
        />
      )}
    </VStack>
  )
}
