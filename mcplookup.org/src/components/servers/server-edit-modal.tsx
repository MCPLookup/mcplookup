// Server Edit Modal Component (Simplified)
// Allows server owners to edit their server metadata

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Heading,
  Badge
} from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import { Field } from '@/components/ui/field';
import { FaSave, FaTimes } from 'react-icons/fa';
import { BaseServer } from './server-display';

export interface ServerEditData {
  name: string;
  description: string;
  language?: string;
  capabilities: string[];
  documentation_url?: string;
  homepage_url?: string;
  contact_email?: string;
  license?: string;
  version?: string;
  is_public: boolean;
  allow_discovery: boolean;
}

export interface ServerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: BaseServer;
  onSave: (serverId: string, data: ServerEditData) => Promise<{ success: boolean; error?: string }>;
}

const COMMON_LANGUAGES = [
  'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 
  'C#', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Other'
];

const COMMON_CAPABILITIES = [
  'file-operations', 'database', 'api-integration', 'data-processing',
  'authentication', 'notifications', 'search', 'analytics',
  'machine-learning', 'image-processing', 'text-processing',
  'web-scraping', 'email', 'storage', 'monitoring', 'logging'
];

export function ServerEditModal({ 
  isOpen, 
  onClose, 
  server, 
  onSave 
}: ServerEditModalProps) {
  const [formData, setFormData] = useState<ServerEditData>({
    name: '',
    description: '',
    language: '',
    capabilities: [],
    documentation_url: '',
    homepage_url: '',
    contact_email: '',
    license: '',
    version: '',
    is_public: true,
    allow_discovery: true
  });
  
  const [customCapability, setCustomCapability] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form data when server changes
  useEffect(() => {
    if (server) {
      setFormData({
        name: server.name || '',
        description: server.description || '',
        language: server.language || '',
        capabilities: server.capabilities || [],
        documentation_url: '',
        homepage_url: '',
        contact_email: '',
        license: '',
        version: '',
        is_public: true,
        allow_discovery: true
      });
    }
  }, [server]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onSave(server.id, formData);
      
      if (result.success) {
        setSuccess('Server updated successfully!');
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 1500);
      } else {
        setError(result.error || 'Failed to update server');
      }
    } catch (err) {
      setError('An error occurred while updating the server');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  const addCapability = (capability: string) => {
    if (capability && !formData.capabilities.includes(capability)) {
      setFormData({
        ...formData,
        capabilities: [...formData.capabilities, capability]
      });
    }
  };

  const removeCapability = (capability: string) => {
    setFormData({
      ...formData,
      capabilities: formData.capabilities.filter(cap => cap !== capability)
    });
  };

  const addCustomCapability = () => {
    if (customCapability.trim()) {
      addCapability(customCapability.trim());
      setCustomCapability('');
    }
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="lg"
        maxWidth="4xl"
        maxHeight="90vh"
        overflowY="auto"
        p={6}
        w="full"
      >
        <VStack gap={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <HStack gap={2}>
              <Heading size="lg">Edit Server: {server.name}</Heading>
              <Badge variant="outline" colorPalette="blue">
                {server.domain}
              </Badge>
            </HStack>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <FaTimes />
            </Button>
          </HStack>

          <form onSubmit={handleSubmit}>
            <VStack gap={6} align="stretch">
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

              {/* Basic Information */}
              <Box>
                <Heading size="sm" mb={4}>Basic Information</Heading>
                <VStack gap={4} align="stretch">
                  <Field label="Server Name" required>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="My Awesome MCP Server"
                      required
                    />
                  </Field>

                  <Field label="Description" required>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="A brief description of what your server does..."
                      rows={3}
                      required
                    />
                  </Field>

                  <Field label="Programming Language">
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select language...</option>
                      {COMMON_LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </Field>
                </VStack>
              </Box>

              {/* Capabilities */}
              <Box>
                <Heading size="sm" mb={4}>Capabilities</Heading>
                <VStack gap={3} align="stretch">
                  {/* Current capabilities */}
                  {formData.capabilities.length > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Current capabilities:</Text>
                      <HStack gap={2} flexWrap="wrap">
                        {formData.capabilities.map(capability => (
                          <Badge
                            key={capability}
                            variant="solid"
                            colorPalette="blue"
                            cursor="pointer"
                            onClick={() => removeCapability(capability)}
                            _hover={{ bg: 'red.500' }}
                            title="Click to remove"
                          >
                            {capability} ×
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  )}

                  {/* Add common capabilities */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Add capabilities:</Text>
                    <HStack gap={2} flexWrap="wrap">
                      {COMMON_CAPABILITIES
                        .filter(cap => !formData.capabilities.includes(cap))
                        .map(capability => (
                        <Badge
                          key={capability}
                          variant="outline"
                          colorPalette="gray"
                          cursor="pointer"
                          onClick={() => addCapability(capability)}
                          _hover={{ bg: 'blue.50' }}
                          title="Click to add"
                        >
                          {capability} +
                        </Badge>
                      ))}
                    </HStack>
                  </Box>

                  {/* Custom capability */}
                  <HStack>
                    <Input
                      value={customCapability}
                      onChange={(e) => setCustomCapability(e.target.value)}
                      placeholder="Custom capability..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCapability())}
                    />
                    <Button onClick={addCustomCapability} variant="outline">
                      Add
                    </Button>
                  </HStack>
                </VStack>
              </Box>

              {/* Additional Metadata */}
              <Box>
                <Heading size="sm" mb={4}>Additional Information</Heading>
                <VStack gap={4} align="stretch">
                  <HStack gap={4}>
                    <Field label="Version" flex={1}>
                      <Input
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        placeholder="1.0.0"
                      />
                    </Field>

                    <Field label="License" flex={1}>
                      <Input
                        value={formData.license}
                        onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                        placeholder="MIT"
                      />
                    </Field>
                  </HStack>

                  <Field label="Documentation URL">
                    <Input
                      value={formData.documentation_url}
                      onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
                      placeholder="https://github.com/user/repo#readme"
                      type="url"
                    />
                  </Field>

                  <Field label="Homepage URL">
                    <Input
                      value={formData.homepage_url}
                      onChange={(e) => setFormData({ ...formData, homepage_url: e.target.value })}
                      placeholder="https://myserver.com"
                      type="url"
                    />
                  </Field>

                  <Field label="Contact Email">
                    <Input
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="contact@example.com"
                      type="email"
                    />
                  </Field>
                </VStack>
              </Box>

              {/* Visibility Settings */}
              <Box>
                <Heading size="sm" mb={4}>Visibility Settings</Heading>
                <VStack gap={3} align="stretch">
                  <Box>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_public}
                        onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Text fontSize="sm">Make server publicly visible</Text>
                    </label>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Public servers appear in search results and listings
                    </Text>
                  </Box>

                  <Box>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.allow_discovery}
                        onChange={(e) => setFormData({ ...formData, allow_discovery: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Text fontSize="sm">Allow discovery by AI assistants</Text>
                    </label>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Let AI assistants discover and recommend your server
                    </Text>
                  </Box>
                </VStack>
              </Box>

              {/* Action Buttons */}
              <HStack gap={3} justify="end" pt={4} borderTop="1px solid" borderColor="gray.200">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorPalette="blue"
                  loading={isSaving}
                >
                  <FaSave className="mr-2" />
                  Save Changes
                </Button>
              </HStack>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
}
