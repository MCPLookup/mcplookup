// Example Server Page Component
// Shows how to use the reusable server components with edit functionality

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/client';
import { ServerDisplay, ServerEditModal, ServerEditData } from '@/components/servers';
import { Box, VStack, Heading, Text, Button, HStack } from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface ServerPageProps {
  serverId: string;
}

export function ServerPage({ serverId }: ServerPageProps) {
  const { user } = useAuth();
  const [server, setServer] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServer();
  }, [serverId]);

  const loadServer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/servers/${serverId}`);
      
      if (response.ok) {
        const data = await response.json();
        setServer(data);
      } else {
        setError('Server not found');
      }
    } catch (err) {
      setError('Failed to load server');
    } finally {
      setLoading(false);
    }
  };

  const handleServerEdit = () => {
    setShowEditModal(true);
  };

  const handleServerSave = async (serverId: string, data: ServerEditData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/servers/${serverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // Reload server to get updated data
        await loadServer();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to update server' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text>Loading server...</Text>
      </Box>
    );
  }

  if (error || !server) {
    return (
      <Box p={6}>
        <Text color="red.500">{error || 'Server not found'}</Text>
        <Link href="/servers">
          <Button mt={4} variant="outline">
            <FaArrowLeft className="mr-2" />
            Back to Servers
          </Button>
        </Link>
      </Box>
    );
  }

  const isOwner = user?.id === server.owner_user_id;

  return (
    <VStack gap={6} align="stretch" p={6}>
      {/* Navigation */}
      <HStack>
        <Link href="/servers">
          <Button variant="outline" size="sm">
            <FaArrowLeft className="mr-2" />
            Back to Servers
          </Button>
        </Link>
      </HStack>

      {/* Page Header */}
      <Box>
        <Heading size="xl" mb={2}>{server.name}</Heading>
        <Text color="gray.600" fontSize="lg">
          {server.description}
        </Text>
      </Box>

      {/* Server Display with Edit */}
      <ServerDisplay
        server={server}
        currentUserId={user?.id}
        variant="detailed"
        showEditButton={isOwner}
        showOwnershipBadge={true}
        showCapabilities={true}
        showStats={true}
        showDescription={false} // Already shown above
        onEdit={handleServerEdit}
      />

      {/* Server Edit Modal */}
      {isOwner && (
        <ServerEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          server={server}
          onSave={handleServerSave}
        />
      )}

      {/* Additional server details could go here */}
      {/* Installation instructions, examples, etc. */}
    </VStack>
  );
}

// Usage in a Next.js page:
// 
// // pages/servers/[id].tsx or app/servers/[id]/page.tsx
// export default function ServerPageRoute({ params }) {
//   return <ServerPage serverId={params.id} />;
// }
