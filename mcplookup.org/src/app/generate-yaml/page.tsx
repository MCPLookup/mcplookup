'use client';

import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Box,
  Alert,
  Icon
} from '@chakra-ui/react';
import YAMLGeneratorWorkflow from '@/components/yaml/YAMLGeneratorWorkflow';
import { Card } from '@/components/ui/card';
import { FaRocket, FaCheckCircle, FaGithub } from 'react-icons/fa';

export default function GenerateYAMLPage() {
  return (
    <Container maxW="6xl" py={8}>
      <VStack gap={8} align="stretch">
        {/* Hero Section */}
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            🔧 Fix What AI Gets Wrong About Your Repository
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="3xl" mx="auto">
            Instead of creating .mcplookup.yaml from scratch, let our AI analyze your repository first. 
            Then you can easily fix what it gets wrong - much faster than starting from nothing!
          </Text>
        </Box>

        {/* Benefits */}
        <Card.Root bg="blue.50" borderColor="blue.200" borderWidth={1}>
          <Card.Body>
            <VStack gap={4}>
              <Heading size="md" color="blue.800">
                🎯 Why This Approach Works Better
              </Heading>
              
              <HStack gap={8} wrap="wrap" justify="center">
                <VStack gap={2} align="center" minW="200px">
                  <Icon as={FaCheckCircle} color="green.500" boxSize={6} />
                  <Text fontWeight="bold">See AI Mistakes</Text>
                  <Text fontSize="sm" textAlign="center" color="gray.600">
                    Confidence scores show you exactly what needs fixing
                  </Text>
                </VStack>
                
                <VStack gap={2} align="center" minW="200px">
                  <Icon as={FaRocket} color="blue.500" boxSize={6} />
                  <Text fontWeight="bold">Faster Than Scratch</Text>
                  <Text fontSize="sm" textAlign="center" color="gray.600">
                    Edit and improve rather than create from nothing
                  </Text>
                </VStack>
                
                <VStack gap={2} align="center" minW="200px">
                  <Icon as={FaGithub} color="purple.500" boxSize={6} />
                  <Text fontWeight="bold">One-Click Commit</Text>
                  <Text fontSize="sm" textAlign="center" color="gray.600">
                    Direct integration with GitHub for easy deployment
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Process Overview */}
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>How It Works:</Alert.Title>
            <Alert.Description>
              <VStack align="start" gap={1}>
                <Text>1. 🔍 <strong>Analyze:</strong> We scan your repository for installation methods and metadata</Text>
                <Text>2. 🎯 <strong>Review:</strong> See confidence scores and fix what AI got wrong</Text>
                <Text>3. ✅ <strong>Deploy:</strong> Download or commit directly to your repository</Text>
              </VStack>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>

        {/* Main Workflow */}
        <YAMLGeneratorWorkflow />

        {/* Footer */}
        <Box textAlign="center" pt={8}>
          <Text fontSize="sm" color="gray.500">
            Need help? Check out our{' '}
            <Text as="span" color="blue.500" textDecoration="underline">
              documentation
            </Text>{' '}
            or see{' '}
            <Text as="span" color="blue.500" textDecoration="underline">
              example YAML files
            </Text>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}
