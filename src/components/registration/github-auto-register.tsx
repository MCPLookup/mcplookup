'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  CardHeader,
  Alert,
  AlertIcon,
  AlertDescription,
  Badge,
  Divider,
  Icon,
  Grid,
  GridItem,
  Code,
  List,
  ListItem,
  ListIcon,
  Link,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaGithub, 
  FaPackage, 
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

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
      <VStack spacing={6} align="stretch">
        {/* Main Registration Form */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <HStack spacing={2}>
              <Icon as={FaGithub} boxSize={5} />
              <Heading size="md">Auto-Register from GitHub</Heading>
            </HStack>
            <Text color="gray.600" mt={2}>
              Automatically register your MCP server by providing a GitHub repository URL. 
              We'll analyze the repository and extract MCP configuration, installation instructions, and metadata.
            </Text>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>GitHub Repository URL</FormLabel>
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
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contact Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                  loadingText="Analyzing Repository..."
                  isDisabled={!isValidGitHubUrl(githubUrl)}
                  width="full"
                >
                  Auto-Register MCP Server
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Results */}
        {result && (
          <VStack spacing={6} align="stretch">
            {/* Success Message */}
            <Alert status="success">
              <AlertIcon />
              <AlertDescription fontWeight="medium">
                {result.message}
              </AlertDescription>
            </Alert>

            {/* Server Information */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Registered Server</Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <GridItem>
                    <FormLabel fontSize="sm" fontWeight="medium">Server Name</FormLabel>
                    <Text fontSize="sm" color="gray.600">{result.server.name}</Text>
                  </GridItem>
                  <GridItem>
                    <FormLabel fontSize="sm" fontWeight="medium">Domain</FormLabel>
                    <Text fontSize="sm" color="gray.600">{result.server.domain}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <FormLabel fontSize="sm" fontWeight="medium">Description</FormLabel>
                    <Text fontSize="sm" color="gray.600">{result.server.description}</Text>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Repository Analysis */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Repository Analysis</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Icon as={FaGithub} boxSize={4} />
                      <Text fontWeight="medium">
                        {result.analysis.repository.owner}/{result.analysis.repository.repo}
                      </Text>
                    </HStack>
                    <HStack spacing={4}>
                      <HStack spacing={1}>
                        <Icon as={FaStar} boxSize={4} />
                        <Text fontSize="sm">{result.analysis.repository.stars}</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Icon as={getLanguageIcon(result.analysis.repository.language)} boxSize={4} />
                        <Text fontSize="sm">{result.analysis.repository.language}</Text>
                      </HStack>
                    </HStack>
                  </HStack>

                  <Box>
                    <FormLabel fontSize="sm" fontWeight="medium">Topics</FormLabel>
                    <HStack spacing={1} flexWrap="wrap">
                      {result.analysis.repository.topics.map((topic) => (
                        <Badge key={topic} variant="subtle" fontSize="xs">
                          {topic}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>

                  <Box>
                    <FormLabel fontSize="sm" fontWeight="medium">Detected Capabilities</FormLabel>
                    <HStack spacing={1} flexWrap="wrap">
                      {result.analysis.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" fontSize="xs">
                          {capability}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* MCP Features */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">MCP Features Detected</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <GridItem>
                      <HStack spacing={2}>
                        <Box
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg={result.analysis.mcp_features.has_claude_config ? 'green.500' : 'gray.300'}
                        />
                        <Text fontSize="sm">Claude Desktop Config</Text>
                      </HStack>
                    </GridItem>
                    <GridItem>
                      <HStack spacing={2}>
                        <Box
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg={result.analysis.mcp_features.npm_package ? 'green.500' : 'gray.300'}
                        />
                        <Text fontSize="sm">NPM Package</Text>
                      </HStack>
                    </GridItem>
                    <GridItem>
                      <HStack spacing={2}>
                        <Box
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg={result.analysis.mcp_features.python_package ? 'green.500' : 'gray.300'}
                        />
                        <Text fontSize="sm">Python Package</Text>
                      </HStack>
                    </GridItem>
                    <GridItem>
                      <HStack spacing={2}>
                        <Box
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg={result.analysis.mcp_features.docker_info ? 'green.500' : 'gray.300'}
                        />
                        <Text fontSize="sm">Docker Support</Text>
                      </HStack>
                    </GridItem>
                  </Grid>

                  {(result.analysis.mcp_features.npm_package || result.analysis.mcp_features.python_package) && (
                    <Box>
                      <FormLabel fontSize="sm" fontWeight="medium">Package Information</FormLabel>
                      <Box bg="gray.50" p={3} borderRadius="md">
                        <HStack spacing={2} mb={2}>
                          <Icon as={FaPackage} boxSize={4} />
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
                      <FormLabel fontSize="sm" fontWeight="medium">Environment Variables</FormLabel>
                      <HStack spacing={1} flexWrap="wrap">
                        {result.analysis.mcp_features.environment_variables.map((envVar) => (
                          <Badge key={envVar} variant="outline" fontSize="xs" fontFamily="mono">
                            {envVar}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  )}

                  <Box>
                    <FormLabel fontSize="sm" fontWeight="medium">Authentication Type</FormLabel>
                    <Badge 
                      variant={result.analysis.mcp_features.suggested_auth_type === 'none' ? 'subtle' : 'solid'}
                      colorScheme={result.analysis.mcp_features.suggested_auth_type === 'none' ? 'gray' : 'blue'}
                    >
                      {result.analysis.mcp_features.suggested_auth_type}
                    </Badge>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Next Steps */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Next Steps</Heading>
              </CardHeader>
              <CardBody>
                <List spacing={2}>
                  {result.next_steps.map((step, index) => (
                    <ListItem key={index}>
                      <HStack align="flex-start" spacing={2}>
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
                    </ListItem>
                  ))}
                </List>
              </CardBody>
            </Card>

            {/* Actions */}
            <HStack spacing={4}>
              <Button
                as={Link}
                href={`/servers/${result.server.domain}`}
                colorScheme="blue"
                leftIcon={<FaExternalLinkAlt />}
                isExternal
              >
                View Server Details
              </Button>
              <Button
                variant="outline"
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
