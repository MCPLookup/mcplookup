"use client"

import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Button,
  useColorModeValue,
  Icon,
  Spacer,
} from "@chakra-ui/react"
import { FaRing, FaGithub } from "react-icons/fa"
import { useSession, signIn, signOut } from "next-auth/react"
import { ColorModeButton } from "@/components/ui/color-mode"
import Link from "next/link"

export function Header() {
  const { data: session } = useSession()
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const bg = useColorModeValue("white", "gray.800")

  return (
    <Box
      as="header"
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={1000}
      shadow="sm"
    >
      <Container maxW="container.xl" py={4}>
        <Flex align="center">
          {/* Logo */}
          <Link href="/">
            <HStack spacing={2} cursor="pointer">
              <Icon as={FaRing} boxSize={8} color="orange.500" />
              <Heading size="lg" color="orange.500">
                MCPLookup.org
              </Heading>
            </HStack>
          </Link>

          <Spacer />

          {/* Navigation */}
          <HStack spacing={4}>
            <Link href="/discover">
              <Button variant="ghost" size="sm">
                Discover
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="ghost" size="sm">
                Register
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="ghost" size="sm">
                Docs
              </Button>
            </Link>
            
            {/* GitHub Link */}
            <Button
              as="a"
              href="https://github.com/TSavo/mcplookup.org"
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="sm"
              leftIcon={<Icon as={FaGithub} />}
            >
              GitHub
            </Button>

            {/* Color Mode Toggle */}
            <ColorModeButton />

            {/* Auth */}
            {session ? (
              <HStack spacing={2}>
                <Button variant="ghost" size="sm">
                  {session.user?.name || session.user?.email}
                </Button>
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                  size="sm"
                  colorScheme="red"
                >
                  Sign Out
                </Button>
              </HStack>
            ) : (
              <Button
                onClick={() => signIn()}
                colorScheme="orange"
                size="sm"
              >
                Sign In
              </Button>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
