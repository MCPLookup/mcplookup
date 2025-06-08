'use client';

import React, { useState } from 'react';
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
  Separator,
  Icon,
  SimpleGrid,
  Code,
  Link
} from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import { Field } from '@/components/ui/field';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaGithub, 
  FaStar, 
  FaCode, 
  FaExternalLinkAlt,
  FaDocker,
  FaPython,
  FaJs
} from 'react-icons/fa';

interface GitHubAnalysis {
  repository: {
    owner: string;
    repo: string;
    stars: number;
    language: string;
    topics: string[];
  };
  mcp_features: {
    has_claude_config: boolean;
    npm_package: string | null;
    python_package: string | null;
    docker_info: any;
    installation_command: string | null;
    environment_variables: string[];
    suggested_auth_type: string;
  };
  capabilities: string[];
}

interface RegistrationResult {
  success: boolean;
  message: string;
  server: {
    domain: string;
    name: string;
    description: string;
    github_url: string;
    registration_type: string;
  };
  analysis: GitHubAnalysis;
  next_steps: string[];
}

export function GitHubAutoRegister() {
  const [githubUrl, setGithubUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use static values instead of useColorModeValue
  const cardBg = 'white';
  const borderColor = 'gray.200';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/v1/register/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          github_url: githubUrl,
          contact_email: contactEmail,
          deployment_preference: 'package_only'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Registration failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidGitHubUrl = (url: string) => {
    return url.includes('github.com/') && url.split('/').length >= 5;
  };

  const getLanguageIcon = (language: string) => {
    switch (language?.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        return FaJs;
      case 'python':
        return FaPython;
      default:
        return FaCode;
    }
  };

  return (
    <Box maxW="4xl" mx="auto" p={6}>
      <VStack gap={6} align="stretch">
        {/* Main Registration Form */}
        <Card.Root bg={cardBg} borderColor={borderColor}>
          <Card.Header>
            <HStack gap={2}>
              <Icon color="blue.500">
                <FaGithub />
              </Icon>
              <Heading size="md">Auto-Register from GitHub</Heading>
            </HStack>
            <Text color="gray.600" mt={2}>
              Automatically register your MCP server by providing a GitHub repository URL. 
              We'll analyze the repository and extract MCP configuration, installation instructions, and metadata.
            </Text>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleSubmit}>
              <VStack gap={4} align="stretch">
                <Field label="GitHub Repository URL" required>
                  <Input
                    type="url"
                    placeholder="https://github.com/owner/mcp-server-repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                  />
                  {githubUrl && !isValidGitHubUrl(githubUrl) && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      Please enter a valid GitHub repository URL
                    </Text>
                  )}
                </Field>

                <Field label="Contact Email" required>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </Field>

                <Button
                  type="submit"
                  colorPalette="blue"
                  loading={isLoading}
                  disabled={!isValidGitHubUrl(githubUrl)}
                  width="full"
                >
                  {isLoading ? 'Analyzing Repository...' : 'Auto-Register MCP Server'}
                </Button>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>

        {/* Error Alert */}
        {error && (
          <Alert.Root status="error">
            <Alert.Icon />
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}

        {/* Success Results */}
        {result && (
          <VStack gap={6} align="stretch">
            {/* Success Message */}
            <Alert.Root status="success">
              <Alert.Icon />
              <Alert.Description fontWeight="medium">
                {result.message}
              </Alert.Description>
            </Alert.Root>

            {/* Server Information */}
            <Card.Root bg={cardBg} borderColor={borderColor}>
              <Card.Header>
                <Heading size="md">Registered Server</Heading>
              </Card.Header>
              <Card.Body>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">Server Name</Text>
                    <Text fontSize="sm" color="gray.600">{result.server.name}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">Domain</Text>
                    <Text fontSize="sm" color="gray.600">{result.server.domain}</Text>
                  </Box>
                  <Box gridColumn={{ base: 1, md: "1 / -1" }}>
                    <Text fontSize="sm" fontWeight="medium">Description</Text>
                    <Text fontSize="sm" color="gray.600">{result.server.description}</Text>
                  </Box>
                </SimpleGrid>
              </Card.Body>
            </Card.Root>

            {/* Repository Analysis */}
            <Card.Root bg={cardBg} borderColor={borderColor}>
              <Card.Header>
                <Heading size="md">Repository Analysis</Heading>
              </Card.Header>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  <HStack justify="space-between">
                    <HStack gap={2}>
                      <Icon color="gray.500">
                        <FaGithub />
                      </Icon>
                      <Text fontWeight="medium">
                        {result.analysis.repository.owner}/{result.analysis.repository.repo}
                      </Text>
                    </HStack>
                    <HStack gap={4}>
                      <HStack gap={1}>
                        <Icon color="yellow.500">
                          <FaStar />
                        </Icon>
                        <Text fontSize="sm">{result.analysis.repository.stars}</Text>
                      </HStack>
                      <HStack gap={1}>                        <Icon color="blue.500" as={getLanguageIcon(result.analysis.repository.language)} />
                        <Text fontSize="sm">{result.analysis.repository.language}</Text>
                      </HStack>
                    </HStack>
                  </HStack>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Topics</Text>
                    <HStack gap={1} flexWrap="wrap">
                      {result.analysis.repository.topics.map((topic) => (
                        <Badge key={topic} variant="subtle" size="sm">
                          {topic}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Detected Capabilities</Text>
                    <HStack gap={1} flexWrap="wrap">
                      {result.analysis.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" size="sm">
                          {capability}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* MCP Features */}
            <Card.Root bg={cardBg} borderColor={borderColor}>
              <Card.Header>
                <Heading size="md">MCP Features Detected</Heading>
              </Card.Header>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Box>
                      <HStack gap={2}>
                        <Box
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg={result.analysis.mcp_features.has_claude_config ? 'green.500' : 'gray.300'}
                        />
                        <Text fontSize="sm">Claude Desktop Config</Text>
                      </HStack>
                    </Box>
                    <Box>
                      <HStack gap={2}>
                        <Box
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg={result.analysis.mcp_features.npm_package ? 'green.500' : 'gray.300'}
                        />
                        <Text fontSize="sm">NPM Package</Text>
                      </HStack>
                    </Box>
                    <Box>
                      <HStack gap={2}>
                        <Box
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg={result.analysis.mcp_features.python_package ? 'green.500' : 'gray.300'}
                        />
                        <Text fontSize="sm">Python Package</Text>
                      </HStack>
                    </Box>
                    <Box>
                      <HStack gap={2}>
                        <Box
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg={result.analysis.mcp_features.docker_info ? 'green.500' : 'gray.300'}
                        />
                        <Text fontSize="sm">Docker Support</Text>
                      </HStack>
                    </Box>
                  </SimpleGrid>

                  {(result.analysis.mcp_features.npm_package || result.analysis.mcp_features.python_package) && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Package Information</Text>
                      <Box bg="gray.50" p={3} borderRadius="md">
                        <HStack gap={2} mb={2}>
                          <Icon color="purple.500">
                            <FaCode />
                          </Icon>
                          <Code fontSize="sm">
                            {result.analysis.mcp_features.npm_package || result.analysis.mcp_features.python_package}
                          </Code>
                        </HStack>
                        {result.analysis.mcp_features.installation_command && (
                          <Code fontSize="xs" color="gray.600" display="block">
                            {result.analysis.mcp_features.installation_command}
                          </Code>
                        )}
                      </Box>
                    </Box>
                  )}

                  {result.analysis.mcp_features.environment_variables.length > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Environment Variables</Text>
                      <HStack gap={1} flexWrap="wrap">
                        {result.analysis.mcp_features.environment_variables.map((envVar) => (
                          <Badge key={envVar} variant="outline" size="sm" fontFamily="mono">
                            {envVar}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  )}

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Authentication Type</Text>
                    <Badge 
                      variant={result.analysis.mcp_features.suggested_auth_type === 'none' ? 'subtle' : 'solid'}
                      colorPalette={result.analysis.mcp_features.suggested_auth_type === 'none' ? 'gray' : 'blue'}
                    >
                      {result.analysis.mcp_features.suggested_auth_type}
                    </Badge>
                  </Box>
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Next Steps */}
            <Card.Root bg={cardBg} borderColor={borderColor}>
              <Card.Header>
                <Heading size="md">Next Steps</Heading>
              </Card.Header>
              <Card.Body>
                <VStack gap={2} align="stretch">
                  {result.next_steps.map((step, index) => (
                    <HStack key={index} align="flex-start" gap={2}>
                      <Box
                        w={6}
                        h={6}
                        bg="blue.100"
                        color="blue.600"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="medium"
                        flexShrink={0}
                      >
                        {index + 1}
                      </Box>
                      <Text fontSize="sm">{step}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Actions */}
            <HStack gap={4}>
              <Link href={`/servers/${result.server.domain}`}>
                <Button colorPalette="blue" size="sm">
                  <Icon mr={2}>
                    <FaExternalLinkAlt />
                  </Icon>
                  View Server Details
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setResult(null);
                  setGithubUrl('');
                  setContactEmail('');
                }}
              >
                Register Another Server
              </Button>
            </HStack>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
