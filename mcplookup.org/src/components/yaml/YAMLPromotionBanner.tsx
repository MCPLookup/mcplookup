'use client';

import {
  Box,
  Button,
  Heading,
  Text,
  Icon,
  Badge,
  Link,
  Flex
} from '@chakra-ui/react';
import { Card } from '@/components/ui/card';
import {
  FaFileCode,
  FaCheckCircle,
  FaCode,
  FaDownload,
  FaGithub
} from 'react-icons/fa';

interface YAMLPromotionBannerProps {
  repositoryUrl?: string;
  hasYAML?: boolean;
  onGenerateTemplate?: () => void;
}

export function YAMLPromotionBanner({ 
  repositoryUrl, 
  hasYAML = false,
  onGenerateTemplate 
}: YAMLPromotionBannerProps) {

  if (hasYAML) {
    return (
      <Card.Root bg="green.50" borderColor="green.200" borderWidth={1}>
        <Card.Body>
          <Flex gap={3} align="center">
            <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
            <Box flex={1}>
              <Heading size="sm" color="green.800">
                ✅ Verified MCP Server
              </Heading>
              <Text fontSize="sm" color="green.700">
                This repository includes a <code>.mcplookup.yaml</code> file with verified installation instructions.
              </Text>
            </Box>
            <Badge colorScheme="green" variant="solid">
              YAML Verified
            </Badge>
          </Flex>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root bg="blue.50" borderColor="blue.200" borderWidth={1}>
      <Card.Body>
        <Box>
          <Flex gap={3} align="center" mb={4}>
            <Icon as={FaFileCode} color="blue.500" boxSize={6} />
            <Box flex={1}>
              <Heading size="md" color="blue.800">
                📝 Add .mcplookup.yaml for Better Discovery
              </Heading>
              <Text fontSize="sm" color="blue.700">
                Skip AI parsing uncertainty! Add a <code>.mcplookup.yaml</code> file to your repository
                for precise installation instructions and better discoverability.
              </Text>
            </Box>
          </Flex>

          <Box pl={4} mb={4}>
            <Flex gap={2} align="center" mb={2}>
              <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
              <Text fontSize="sm">
                <strong>Precise Installation:</strong> Define exact Docker, npm, pip commands
              </Text>
            </Flex>
            <Flex gap={2} align="center" mb={2}>
              <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
              <Text fontSize="sm">
                <strong>Environment Variables:</strong> Document required API keys and config
              </Text>
            </Flex>
            <Flex gap={2} align="center">
              <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
              <Text fontSize="sm">
                <strong>Better Rankings:</strong> Verified servers rank higher in search
              </Text>
            </Flex>
          </Box>

          <Flex gap={3} wrap="wrap">
            <Button
              size="sm"
              colorScheme="blue"
              onClick={onGenerateTemplate}
            >
              📝 Generate Template
            </Button>
            <Text fontSize="sm" color="blue.600">
              📚 <Link href="/docs/mcplookup-yaml" color="blue.600" textDecoration="underline">View Documentation</Link>
            </Text>
            {repositoryUrl && (
              <Text fontSize="sm" color="blue.600">
                🔗 <Link href={`${repositoryUrl}/new/main?filename=.mcplookup.yaml`} color="blue.600" textDecoration="underline" target="_blank">Add to GitHub</Link>
              </Text>
            )}
          </Flex>
        </Box>
      </Card.Body>
    </Card.Root>
  );
}

export default YAMLPromotionBanner;
