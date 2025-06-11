// Reusable Repository Display Components
// Consistent GitHub repository presentation across the application

import Link from 'next/link';
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  Card,
  Skeleton
} from '@chakra-ui/react';
import { 
  FaGithub, 
  FaExternalLinkAlt, 
  FaEdit, 
  FaStar,
  FaCodeBranch,
  FaCalendarAlt,
  FaCheck
} from 'react-icons/fa';

// Base repository interface
export interface BaseRepository {
  name: string;
  full_name?: string;
  verified_at: string;
  verification_branch: string;
  description?: string;
  stars?: number;
  forks?: number;
  language?: string;
  updated_at?: string;
  is_private?: boolean;
  html_url?: string;
}

// Repository component configuration
export interface RepositoryDisplayProps {
  repository: BaseRepository;
  currentUserId?: string;
  variant?: 'card' | 'compact' | 'detailed' | 'list';
  showEditButton?: boolean;
  showVerificationInfo?: boolean;
  showStats?: boolean;
  showDescription?: boolean;
  onEdit?: (repository: BaseRepository) => void;
  className?: string;
}

/**
 * Repository Verification Badge Component
 */
export function RepositoryVerificationBadge({ 
  verified_at, 
  verification_branch 
}: { 
  verified_at: string;
  verification_branch: string;
}) {
  return (
    <VStack gap={1} align="end">
      <Badge variant="solid" colorPalette="green" size="sm">
        <FaCheck className="mr-1" />
        Owned
      </Badge>
      <Text fontSize="xs" color="gray.500">
        Branch: {verification_branch}
      </Text>
    </VStack>
  );
}

/**
 * Repository Stats Component
 */
export function RepositoryStats({ 
  repository 
}: { 
  repository: BaseRepository;
}) {
  const githubUrl = repository.html_url || `https://github.com/${repository.full_name || repository.name}`;
  
  return (
    <HStack gap={4} fontSize="sm" color="gray.600" flexWrap="wrap">
      {repository.language && (
        <HStack gap={1}>
          <Text fontWeight="medium">Language:</Text>
          <Text>{repository.language}</Text>
        </HStack>
      )}
      
      {repository.stars !== undefined && (
        <HStack gap={1}>
          <FaStar />
          <Text>{repository.stars}</Text>
        </HStack>
      )}
      
      {repository.forks !== undefined && (
        <HStack gap={1}>
          <FaCodeBranch />
          <Text>{repository.forks}</Text>
        </HStack>
      )}

      <Link href={githubUrl} target="_blank">
        <HStack gap={1} color="blue.600" _hover={{ color: 'blue.800' }}>
          <FaGithub />
          <Text fontSize="sm">View on GitHub</Text>
        </HStack>
      </Link>
    </HStack>
  );
}

/**
 * Repository Actions Component
 */
export function RepositoryActions({ 
  repository, 
  currentUserId,
  showEditButton = true,
  onEdit 
}: { 
  repository: BaseRepository;
  currentUserId?: string;
  showEditButton?: boolean;
  onEdit?: (repository: BaseRepository) => void;
}) {
  const githubUrl = repository.html_url || `https://github.com/${repository.full_name || repository.name}`;

  return (
    <HStack gap={2}>
      <Link href={githubUrl} target="_blank">
        <Button size="sm" variant="outline">
          <FaExternalLinkAlt className="mr-1" />
          View
        </Button>
      </Link>
      
      {showEditButton && onEdit && (
        <Button 
          size="sm" 
          variant="solid" 
          colorPalette="blue"
          onClick={() => onEdit(repository)}
        >
          <FaEdit className="mr-1" />
          Manage
        </Button>
      )}
    </HStack>
  );
}

/**
 * Main Repository Display Component
 */
export function RepositoryDisplay({
  repository,
  currentUserId,
  variant = 'card',
  showEditButton = true,
  showVerificationInfo = true,
  showStats = true,
  showDescription = true,
  onEdit,
  className = ''
}: RepositoryDisplayProps) {
  
  if (variant === 'compact') {
    return (
      <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md" className={className}>
        <HStack gap={3}>
          <FaGithub className="text-gray-600" />
          <Box>
            <Text fontWeight="medium" fontSize="sm">{repository.name}</Text>
            <Text fontSize="xs" color="gray.600">
              Verified {new Date(repository.verified_at).toLocaleDateString()}
            </Text>
          </Box>
        </HStack>
        
        <HStack gap={2}>
          <Badge variant="solid" colorPalette="green" size="sm">
            Owned
          </Badge>
          {repository.stars !== undefined && (
            <HStack gap={1} fontSize="xs" color="gray.600">
              <FaStar />
              <Text>{repository.stars}</Text>
            </HStack>
          )}
        </HStack>
      </HStack>
    );
  }

  if (variant === 'list') {
    return (
      <Box p={4} borderBottom="1px solid" borderColor="gray.200" className={className}>
        <HStack justify="space-between" align="start">
          <HStack gap={3} flex={1}>
            <FaGithub className="text-gray-600" />
            <VStack gap={1} align="start" flex={1}>
              <HStack gap={2} align="center">
                <Text fontWeight="medium">{repository.name}</Text>
                <Badge variant="solid" colorPalette="green" size="sm">
                  <FaCheck className="mr-1" />
                  Owned
                </Badge>
              </HStack>
              
              {showDescription && repository.description && (
                <Text fontSize="sm" color="gray.600">{repository.description}</Text>
              )}
              
              <Text fontSize="sm" color="gray.600">
                Verified on {new Date(repository.verified_at).toLocaleDateString()}
              </Text>
              
              {showStats && (
                <RepositoryStats repository={repository} />
              )}
            </VStack>
          </HStack>
          
          <RepositoryActions 
            repository={repository}
            currentUserId={currentUserId}
            showEditButton={showEditButton}
            onEdit={onEdit}
          />
        </HStack>
      </Box>
    );
  }

  // Default 'card' and 'detailed' variants
  return (
    <Card.Root className={className}>
      <Card.Body p={4}>
        <VStack gap={3} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="start">
            <HStack gap={3}>
              <FaGithub className="text-gray-600" />
              <Box>
                <Text fontWeight="medium">{repository.name}</Text>
                <Text fontSize="sm" color="gray.600">
                  {repository.full_name || repository.name}
                </Text>
              </Box>
            </HStack>
            
            {showVerificationInfo && (
              <RepositoryVerificationBadge 
                verified_at={repository.verified_at}
                verification_branch={repository.verification_branch}
              />
            )}
          </HStack>
          
          {/* Description */}
          {showDescription && repository.description && (
            <Text fontSize="sm" color="gray.600">
              {repository.description}
            </Text>
          )}
          
          {/* Stats */}
          {showStats && (
            <RepositoryStats repository={repository} />
          )}
          
          {/* Footer */}
          <HStack justify="space-between" align="center" mt={2}>
            <Text fontSize="xs" color="gray.500">
              <FaCalendarAlt className="inline mr-1" />
              Verified {new Date(repository.verified_at).toLocaleDateString()}
            </Text>
            
            <RepositoryActions 
              repository={repository}
              currentUserId={currentUserId}
              showEditButton={showEditButton}
              onEdit={onEdit}
            />
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

/**
 * Repository List Component
 */
export function RepositoryList({
  repositories,
  currentUserId,
  variant = 'card',
  showEditButton = true,
  onEdit,
  loading = false,
  emptyMessage = "No repositories found",
  className = ''
}: {
  repositories: BaseRepository[];
  currentUserId?: string;
  variant?: RepositoryDisplayProps['variant'];
  showEditButton?: boolean;
  onEdit?: (repository: BaseRepository) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}) {
  
  if (loading) {
    return (
      <VStack gap={4} align="stretch" className={className}>
        {Array(3).fill(0).map((_, index) => (
          <Card.Root key={index}>
            <Card.Body p={4}>
              <VStack gap={3} align="stretch">
                <HStack gap={3}>
                  <Skeleton height="20px" width="20px" />
                  <Skeleton height="20px" width="200px" />
                </HStack>
                <Skeleton height="16px" width="100%" />
                <Skeleton height="16px" width="80%" />
              </VStack>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>
    );
  }

  if (repositories.length === 0) {
    return (
      <Box textAlign="center" py={8} className={className}>
        <Text color="gray.600">{emptyMessage}</Text>
      </Box>
    );
  }

  const containerClass = variant === 'card' ? 'grid gap-4' : 'space-y-0';

  return (
    <Box className={`${containerClass} ${className}`}>
      {repositories.map((repository, index) => (
        <RepositoryDisplay
          key={`${repository.name}-${index}`}
          repository={repository}
          currentUserId={currentUserId}
          variant={variant}
          showEditButton={showEditButton}
          onEdit={onEdit}
        />
      ))}
    </Box>
  );
}
