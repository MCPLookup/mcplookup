"use client"

import { useSession } from "next-auth/react"
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Badge,
  SimpleGrid,
  Icon,
  useColorModeValue
} from "@chakra-ui/react"
import { FaRing, FaSearch, FaPlus, FaShield, FaGlobe } from "react-icons/fa"
import { Header } from "@/components/layout/header"
import { SignInButton } from "@/components/auth/signin-button"
import Link from "next/link"

export default function HomePage() {
  const { data: session } = useSession()
  const bgGradient = useColorModeValue(
    "linear(to-br, orange.50, yellow.50)",
    "linear(to-br, gray.900, gray.800)"
  )

  return (
    <Box minH="100vh" bg={bgGradient}>
      <Header />
      
      <Container maxW="7xl" py={16}>
        {/* Hero Section */}
        <VStack spacing={8} textAlign="center" mb={16}>
          <HStack spacing={3}>
            <Icon as={FaRing} boxSize={12} color="orange.500" />
            <Heading size="2xl" bgGradient="linear(to-r, orange.400, yellow.400)" bgClip="text">
              The One Ring
            </Heading>
          </HStack>
          
          <Heading size="xl" maxW="4xl">
            Universal MCP Discovery Service
          </Heading>
          
          <Text fontSize="xl" color="gray.600" _dark={{ color: "gray.300" }} maxW="3xl">
            Discover and register Model Context Protocol servers. 
            The central registry that connects AI agents with the tools they need.
          </Text>

          {!session && (
            <VStack spacing={4}>
              <Text fontSize="lg" fontWeight="semibold">
                Get started by signing in
              </Text>
              <HStack spacing={4}>
                <SignInButton provider="github" width="200px" />
                <SignInButton provider="google" width="200px" />
              </HStack>
            </VStack>
          )}

          {session && (
            <VStack spacing={4}>
              <Text fontSize="lg" color="green.600" _dark={{ color: "green.400" }}>
                Welcome back, {session.user?.name}! 👋
              </Text>
              <HStack spacing={4}>
                <Link href="/discover">
                  <Button colorScheme="orange" size="lg" leftIcon={<FaSearch />}>
                    Discover Servers
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" leftIcon={<FaPlus />}>
                    Register Server
                  </Button>
                </Link>
              </HStack>
            </VStack>
          )}
        </VStack>

        {/* Features Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={16}>
          <Card>
            <CardBody textAlign="center">
              <Icon as={FaSearch} boxSize={8} color="blue.500" mb={4} />
              <Heading size="md" mb={2}>Discovery</Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                Find MCP servers by domain, capability, or intent
              </Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Icon as={FaPlus} boxSize={8} color="green.500" mb={4} />
              <Heading size="md" mb={2}>Registration</Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                Register your MCP server with DNS verification
              </Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Icon as={FaShield} boxSize={8} color="purple.500" mb={4} />
              <Heading size="md" mb={2}>Verification</Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                Cryptographic proof of domain ownership
              </Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Icon as={FaGlobe} boxSize={8} color="orange.500" mb={4} />
              <Heading size="md" mb={2}>Global Registry</Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                Serverless, scalable, open-source platform
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Stats */}
        <Card>
          <CardBody>
            <VStack spacing={4} textAlign="center">
              <Heading size="lg">Registry Statistics</Heading>
              <HStack spacing={8} justify="center">
                <VStack>
                  <Text fontSize="3xl" fontWeight="bold" color="orange.500">1,247</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>Registered Servers</Text>
                </VStack>
                <VStack>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.500">98.7%</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>Uptime</Text>
                </VStack>
                <VStack>
                  <Text fontSize="3xl" fontWeight="bold" color="green.500">847</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>Verified Domains</Text>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
