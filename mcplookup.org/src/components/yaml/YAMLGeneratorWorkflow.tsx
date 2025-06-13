'use client';

import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Code,
  Badge,
  Flex,
  Link,
  Icon,
  Field,
  Alert
} from '@chakra-ui/react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { 
  FaGithub, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimesCircle,
  FaDownload,
  FaCopy,
  FaEdit
} from 'react-icons/fa';

interface YAMLGeneratorWorkflowProps {
  onComplete?: (yamlContent: string) => void;
}

interface AnalysisResult {
  yamlContent: string;
  aiAnalysis: {
    installationMethods: AIAnalysisItem;
    capabilities: AIAnalysisItem;
    metadata: AIAnalysisItem;
    overall: AIAnalysisItem;
  };
  beforeAfterComparison: {
    aiParsed: any;
    yamlStructured: any;
  };
}

interface AIAnalysisItem {
  confidence: number;
  reasoning: string;
  issues: string[];
  suggestions: string[];
}

export function YAMLGeneratorWorkflow({ onComplete }: YAMLGeneratorWorkflowProps) {
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editedYAML, setEditedYAML] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null);

  const handleAnalyze = async () => {
    if (!repositoryUrl.trim()) {
      setNotification({
        type: 'warning',
        message: 'Please enter a GitHub repository URL'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/generate-yaml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryUrl: repositoryUrl.trim(),
          includeConfidenceScores: true,
          includeAIAnalysis: true
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisResult(data);
      setEditedYAML(data.yamlContent);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.5) return 'yellow';
    return 'red';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return FaCheckCircle;
    if (confidence >= 0.5) return FaExclamationTriangle;
    return FaTimesCircle;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedYAML);
      setNotification({
        type: 'success',
        message: 'YAML content copied to clipboard'
      });
      setTimeout(() => setNotification(null), 2000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to copy to clipboard'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([editedYAML], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.mcplookup.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setNotification({
      type: 'success',
      message: '.mcplookup.yaml file downloaded'
    });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleCommitToGitHub = () => {
    if (repositoryUrl && editedYAML) {
      const commitUrl = `${repositoryUrl}/new/main?filename=.mcplookup.yaml&value=${encodeURIComponent(editedYAML)}`;
      window.open(commitUrl, '_blank');
    }
  };

  return (
    <VStack gap={6} align="stretch" maxW="6xl" mx="auto">
      {/* Notification */}
      {notification && (
        <Box
          bg={notification.type === 'success' ? 'green.50' : notification.type === 'error' ? 'red.50' : 'yellow.50'}
          border="1px solid"
          borderColor={notification.type === 'success' ? 'green.200' : notification.type === 'error' ? 'red.200' : 'yellow.200'}
          p={3}
          borderRadius="md"
          textAlign="center"
        >
          <Text color={notification.type === 'success' ? 'green.800' : notification.type === 'error' ? 'red.800' : 'yellow.800'}>
            {notification.message}
          </Text>
        </Box>
      )}

      {/* Header */}
      <Box textAlign="center">
        <Heading size="lg" mb={2}>
          🔧 Generate .mcplookup.yaml from Your Repository
        </Heading>
        <Text color="gray.600">
          Let AI analyze your repository, then fix what it gets wrong. Much easier than starting from scratch!
        </Text>
      </Box>

      {/* Step 1: Repository Input */}
      <Card.Root>
        <Card.Body>
          <VStack gap={4} align="stretch">
            <Heading size="md">Step 1: Analyze Your Repository</Heading>
            
            <Field.Root>
              <Field.Label>GitHub Repository URL</Field.Label>
              <Input
                placeholder="https://github.com/username/repository"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                disabled={isAnalyzing}
              />
              <Field.HelperText>
                We'll analyze your repository and generate a baseline .mcplookup.yaml file
              </Field.HelperText>
            </Field.Root>

            <Button
              colorScheme="blue"
              onClick={handleAnalyze}
              loading={isAnalyzing}
              disabled={!repositoryUrl.trim()}
            >
              🔍 {isAnalyzing ? 'Analyzing repository...' : 'Analyze Repository'}
            </Button>

            {isAnalyzing && (
              <Box bg="blue.50" p={3} borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" color="blue.700" fontWeight="bold">
                  🔍 Analyzing repository structure, dependencies, and installation methods...
                </Text>
              </Box>
            )}

            {error && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Analysis Failed</Alert.Title>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Step 2: Analysis Results */}
      {analysisResult && (
        <Card.Root>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Heading size="md">Step 2: Review AI Analysis (Fix What's Wrong!)</Heading>
              
              <Alert.Root status="warning">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>AI Analysis Complete - Please Review!</Alert.Title>
                  <Alert.Description>
                    The AI made its best guesses about your repository. Red items need your attention!
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>

              {/* Confidence Scores */}
              <Box>
                <Text fontWeight="bold" mb={3}>AI Confidence Scores:</Text>
                <VStack gap={2} align="stretch">
                  {Object.entries(analysisResult.aiAnalysis).map(([key, analysis]) => {
                    const IconComponent = getConfidenceIcon(analysis.confidence);
                    return (
                      <Flex key={key} align="center" gap={3}>
                        <Icon as={IconComponent} color={`${getConfidenceColor(analysis.confidence)}.500`} />
                        <Text flex={1} textTransform="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Text>
                        <Badge colorScheme={getConfidenceColor(analysis.confidence)}>
                          {Math.round(analysis.confidence * 100)}%
                        </Badge>
                        <Text fontSize="sm" color="gray.600" flex={2}>
                          {analysis.reasoning}
                        </Text>
                      </Flex>
                    );
                  })}
                </VStack>
              </Box>

              {/* Issues and Suggestions */}
              <Box>
                <Text fontWeight="bold" mb={2}>🔴 Issues to Fix:</Text>
                <VStack align="start" gap={1}>
                  {Object.values(analysisResult.aiAnalysis).flatMap(analysis => 
                    analysis.issues.map((issue, idx) => (
                      <Text key={idx} fontSize="sm" color="red.600">• {issue}</Text>
                    ))
                  )}
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>💡 Suggestions:</Text>
                <VStack align="start" gap={1}>
                  {Object.values(analysisResult.aiAnalysis).flatMap(analysis => 
                    analysis.suggestions.map((suggestion, idx) => (
                      <Text key={idx} fontSize="sm" color="blue.600">• {suggestion}</Text>
                    ))
                  )}
                </VStack>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Step 3: Edit and Download */}
      {analysisResult && (
        <Card.Root>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Heading size="md">Step 3: Edit Your .mcplookup.yaml</Heading>

              <VStack gap={4} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  Edit the generated YAML below. Focus on the red/yellow confidence areas first.
                </Text>

                <textarea
                  value={editedYAML}
                  onChange={(e) => setEditedYAML(e.target.value)}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    padding: '16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    minHeight: '400px',
                    backgroundColor: '#F7FAFC',
                    width: '100%',
                    resize: 'vertical'
                  }}
                />

                <HStack gap={3}>
                  <Button
                    onClick={handleCopy}
                    size="sm"
                  >
                    📋 Copy
                  </Button>
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    colorScheme="blue"
                  >
                    💾 Download
                  </Button>
                  <Button
                    onClick={handleCommitToGitHub}
                    size="sm"
                    colorScheme="green"
                  >
                    🚀 Commit to GitHub
                  </Button>
                </HStack>

                {/* Before/After Comparison */}
                <Box mt={6}>
                  <Text fontWeight="bold" mb={4}>Before (AI Parsing) vs After (Your YAML):</Text>

                  <Flex gap={4}>
                    <Box flex={1}>
                      <Text fontWeight="bold" color="red.600" mb={2}>❌ AI Parsing (Uncertain)</Text>
                      <Code p={3} bg="red.50" borderRadius="md" fontSize="sm" whiteSpace="pre-wrap">
                        {JSON.stringify(analysisResult.beforeAfterComparison.aiParsed, null, 2)}
                      </Code>
                    </Box>

                    <Box flex={1}>
                      <Text fontWeight="bold" color="green.600" mb={2}>✅ YAML Verified (Reliable)</Text>
                      <Code p={3} bg="green.50" borderRadius="md" fontSize="sm" whiteSpace="pre-wrap">
                        {JSON.stringify(analysisResult.beforeAfterComparison.yamlStructured, null, 2)}
                      </Code>
                    </Box>
                  </Flex>
                </Box>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  );
}

export default YAMLGeneratorWorkflow;
