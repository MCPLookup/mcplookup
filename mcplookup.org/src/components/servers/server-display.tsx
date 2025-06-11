// Reusable Server Display Components
// Consistent server presentation across the application

import Link from 'next/link';
import { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  Card,
  Grid,
  Skeleton
} from '@chakra-ui/react';
import { 
  FaServer, 
  FaGithub, 
  FaExternalLinkAlt, 
  FaEdit, 
  FaStar,
  FaCode,
  FaCube,
  FaCalendarAlt,
  FaUser,
  FaUsers
} from 'react-icons/fa';

// Base server interface - extend this as needed
export interface BaseServer {
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
  author?: string;
  verification_badges?: string[];
}

// Server component configuration
export interface ServerDisplayProps {
  server: BaseServer;
  currentUserId?: string;
  variant?: 'card' | 'compact' | 'detailed' | 'list';
  showEditButton?: boolean;
  showOwnershipBadge?: boolean;
  showCapabilities?: boolean;
  showStats?: boolean;
  showDescription?: boolean;
  maxCapabilities?: number;
  onEdit?: (server: BaseServer) => void;
  className?: string;
}

/**
 * Status Badge Component
 */
export function ServerStatusBadge({ status }: { status: BaseServer['status'] }) {
  const colorMap = {
    active: 'green',
    pending: 'yellow',
    inactive: 'gray',
    rejected: 'red'
  };

  return (
    <Badge 
      variant="solid" 
      colorPalette={colorMap[status]} 
      size="sm"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

/**
 * Ownership Badge Component
 */
export function ServerOwnershipBadge({ 
  ownership_status, 
  verification_badges = [] 
}: { 
  ownership_status: BaseServer['ownership_status'];
  verification_badges?: string[];
}) {
  const isOwned = ownership_status === 'owned';
  const hasVerification = verification_badges.length > 0;

  return (
    <HStack gap={1}>
      <Badge 
        variant={isOwned ? 'solid' : 'outline'} 
        colorPalette={isOwned ? 'blue' : 'gray'}
        size="sm"
      >
        {isOwned ? 'Owned' : 'Community'}
      </Badge>
      {hasVerification && (
        <Badge variant="solid" colorPalette="purple" size="sm">
          Verified
        </Badge>
      )}
    </HStack>
  );
}

/**
 * Server Type Icon Component
 */
export function ServerTypeIcon({ type, github_repo }: { type: BaseServer['type']; github_repo?: string }) {
  if (type === 'github' && github_repo) {
    return <FaGithub className="text-gray-600" />;
  }
  return <FaServer className="text-purple-600" />;
}

/**
 * Server Capabilities Component
 */
export function ServerCapabilities({ 
  capabilities = [], 
  maxDisplay = 3,
  size = 'sm' as 'sm' | 'md'
}: { 
  capabilities?: string[];
  maxDisplay?: number;
  size?: 'sm' | 'md';
}) {
  if (!capabilities.length) return null;

  const displayCaps = capabilities.slice(0, maxDisplay);
  const remainingCount = capabilities.length - maxDisplay;

  return (
    <HStack gap={1} flexWrap="wrap">
      {displayCaps.map((capability) => (
        <Badge key={capability} variant="subtle" size={size} colorPalette="blue">
          {capability}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="subtle" size={size} colorPalette="gray">
          +{remainingCount} more
        </Badge>
      )}
    </HStack>
  );
}

/**
 * Server Stats Component
 */
export function ServerStats({ 
  server, 
  showGithubLink = true 
}: { 
  server: BaseServer;
  showGithubLink?: boolean;
}) {
  return (
    <HStack gap={4} fontSize="sm" color="gray.600" flexWrap="wrap">
      <HStack gap={1}>
        <FaCube />
        <Text fontWeight="medium">Type:</Text>
        <Text>{server.type}</Text>
      </HStack>
      
      {server.language && (
        <HStack gap={1}>
          <FaCode />
          <Text fontWeight="medium">Language:</Text>
          <Text>{server.language}</Text>
        </HStack>
      )}
      
      {server.github_stars && (
        <HStack gap={1}>
          <FaStar />
          <Text fontWeight="medium">Stars:</Text>
          <Text>{server.github_stars}</Text>
        </HStack>
      )}

      {server.github_repo && showGithubLink && (
        <Link href={`https://github.com/${server.github_repo}`} target="_blank">
          <HStack gap={1} color="blue.600" _hover={{ color: 'blue.800' }}>
            <FaGithub />
            <Text fontSize="sm">{server.github_repo}</Text>
          </HStack>
        </Link>
      )}
    </HStack>
  );
}

/**
 * Server Actions Component
 */
export function ServerActions({ 
  server, 
  currentUserId,
  showEditButton = true,
  onEdit 
}: { 
  server: BaseServer;
  currentUserId?: string;
  showEditButton?: boolean;
  onEdit?: (server: BaseServer) => void;
}) {
  const isOwner = currentUserId && server.owner_user_id === currentUserId;

  return (
    <HStack gap={2}>
      <Link href={`/servers/${server.domain}`}>
        <Button size="sm" variant="outline">
          <FaExternalLinkAlt className="mr-1" />
          View
        </Button>
      </Link>
      
      {isOwner && showEditButton && (
        <Button 
          size="sm" 
          variant="solid" 
          colorPalette="blue"
          onClick={() => onEdit?.(server)}
        >
          <FaEdit className="mr-1" />
          Edit
        </Button>
      )}
    </HStack>
  );
}

/**
 * Main Server Display Component
 */
export function ServerDisplay({
  server,
  currentUserId,
  variant = 'card',
  showEditButton = true,
  showOwnershipBadge = true,
  showCapabilities = true,
  showStats = true,
  showDescription = true,
  maxCapabilities = 3,
  onEdit,
  className = ''
}: ServerDisplayProps) {
  
  if (variant === 'compact') {
    return (
      <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md" className={className}>
        <HStack gap={3}>
          <ServerTypeIcon type={server.type} github_repo={server.github_repo} />
          <Box>
            <Text fontWeight="medium" fontSize="sm">{server.name}</Text>
            <Text fontSize="xs" color="gray.600">{server.domain}</Text>
          </Box>
        </HStack>
        
        <HStack gap={2}>
          <ServerStatusBadge status={server.status} />
          {showOwnershipBadge && (
            <ServerOwnershipBadge 
              ownership_status={server.ownership_status}
              verification_badges={server.verification_badges}
            />
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
            <ServerTypeIcon type={server.type} github_repo={server.github_repo} />
            <VStack gap={1} align="start" flex={1}>
              <HStack gap={2} align="center">
                <Text fontWeight="medium">{server.name}</Text>
                <ServerStatusBadge status={server.status} />
                {showOwnershipBadge && (
                  <ServerOwnershipBadge 
                    ownership_status={server.ownership_status}
                    verification_badges={server.verification_badges}
                  />
                )}
              </HStack>
              
              {showDescription && server.description && (
                <Text fontSize="sm" color="gray.600">{server.description}</Text>
              )}
              
              {showStats && (
                <ServerStats server={server} />
              )}
            </VStack>
          </HStack>
          
          <ServerActions 
            server={server}
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
              <ServerTypeIcon type={server.type} github_repo={server.github_repo} />
              <Box>
                <Text fontWeight="medium">{server.name}</Text>
                <Text fontSize="sm" color="gray.600">{server.domain}</Text>
              </Box>
            </HStack>
            
            <VStack gap={1} align="end">
              <ServerStatusBadge status={server.status} />
              {showOwnershipBadge && (
                <ServerOwnershipBadge 
                  ownership_status={server.ownership_status}
                  verification_badges={server.verification_badges}
                />
              )}
            </VStack>
          </HStack>
          
          {/* Description */}
          {showDescription && server.description && (
            <Text fontSize="sm" color="gray.600">
              {server.description}
            </Text>
          )}
          
          {/* Stats */}
          {showStats && (
            <ServerStats server={server} />
          )}
          
          {/* Capabilities */}
          {showCapabilities && server.capabilities && server.capabilities.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>Capabilities:</Text>
              <ServerCapabilities 
                capabilities={server.capabilities}
                maxDisplay={maxCapabilities}
              />
            </Box>
          )}
          
          {/* Footer */}
          <HStack justify="space-between" align="center" mt={2}>
            <Text fontSize="xs" color="gray.500">
              <FaCalendarAlt className="inline mr-1" />
              Registered {new Date(server.registered_at).toLocaleDateString()}
            </Text>
            
            <ServerActions 
              server={server}
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
 * Server List Component
 */
export function ServerList({
  servers,
  currentUserId,
  variant = 'card',
  showEditButton = true,
  onEdit,
  loading = false,
  emptyMessage = "No servers found",
  className = ''
}: {
  servers: BaseServer[];
  currentUserId?: string;
  variant?: ServerDisplayProps['variant'];
  showEditButton?: boolean;
  onEdit?: (server: BaseServer) => void;
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

  if (servers.length === 0) {
    return (
      <Box textAlign="center" py={8} className={className}>
        <Text color="gray.600">{emptyMessage}</Text>
      </Box>
    );
  }

  const containerClass = variant === 'card' ? 'grid gap-4' : 'space-y-0';

  return (
    <Box className={`${containerClass} ${className}`}>
      {servers.map((server) => (
        <ServerDisplay
          key={server.id}
          server={server}
          currentUserId={currentUserId}
          variant={variant}
          showEditButton={showEditButton}
          onEdit={onEdit}
        />
      ))}
    </Box>
  );
}

/**
 * Server Grid Component
 */
export function ServerGrid({
  servers,
  currentUserId,
  showEditButton = true,
  onEdit,
  loading = false,
  emptyMessage = "No servers found",
  columns = { base: 1, md: 2, lg: 3 },
  className = ''
}: {
  servers: BaseServer[];
  currentUserId?: string;
  showEditButton?: boolean;
  onEdit?: (server: BaseServer) => void;
  loading?: boolean;
  emptyMessage?: string;
  columns?: { base: number; md: number; lg: number };
  className?: string;
}) {
  
  if (loading) {
    return (
      <Grid templateColumns={{ base: `repeat(${columns.base}, 1fr)`, md: `repeat(${columns.md}, 1fr)`, lg: `repeat(${columns.lg}, 1fr)` }} gap={4} className={className}>
        {Array(6).fill(0).map((_, index) => (
          <Card.Root key={index}>
            <Card.Body p={4}>
              <VStack gap={3} align="stretch">
                <Skeleton height="20px" width="100%" />
                <Skeleton height="16px" width="80%" />
                <Skeleton height="16px" width="60%" />
              </VStack>
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>
    );
  }

  if (servers.length === 0) {
    return (
      <Box textAlign="center" py={8} className={className}>
        <Text color="gray.600">{emptyMessage}</Text>
      </Box>
    );
  }

  return (
    <Grid 
      templateColumns={{ 
        base: `repeat(${columns.base}, 1fr)`, 
        md: `repeat(${columns.md}, 1fr)`, 
        lg: `repeat(${columns.lg}, 1fr)` 
      }} 
      gap={4} 
      className={className}
    >
      {servers.map((server) => (
        <ServerDisplay
          key={server.id}
          server={server}
          currentUserId={currentUserId}
          variant="card"
          showEditButton={showEditButton}
          onEdit={onEdit}
        />
      ))}
    </Grid>
  );
}
