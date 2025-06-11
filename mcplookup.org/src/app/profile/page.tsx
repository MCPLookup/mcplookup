import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProfileTab } from '@/components/dashboard/profile-tab'
import { Box } from '@chakra-ui/react'

export const metadata: Metadata = {
  title: 'Profile Settings | MCPLookup.org',
  description: 'Manage your profile settings and GitHub repository ownership',
}

export default async function ProfilePage() {
  // Require authentication
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin?callbackUrl=/profile')
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      
      <Box maxW="7xl" mx="auto" py={8} px={4}>
        <ProfileTab />
      </Box>
      
      <Footer />
    </Box>
  )
}
