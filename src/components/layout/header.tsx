"use client"

import { useSession, signOut } from "next-auth/react"
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Button,
  Icon,
  Text
} from "@chakra-ui/react"
import { Menu } from "@/components/ui/menu"
import { Avatar } from "@/components/ui/avatar"
import { FaRing, FaUser, FaSignOutAlt } from "react-icons/fa"
import { ColorModeButton } from "@/components/ui/color-mode"
import Link from "next/link"

export function Header() {
  const { data: session } = useSession()

  return (
    <Box borderBottomWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
      <Container maxW="7xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Link href="/">
            <HStack gap={2} cursor="pointer">
              <Icon color="orange.500" fontSize="1.5rem">
                <FaRing />
              </Icon>
              <Heading size="md" color="orange.500">
                MCPLookup
              </Heading>
            </HStack>
          </Link>

          {/* Navigation */}
          <HStack gap={4}>
            <Link href="/discover">
              <Button variant="ghost">Discover</Button>
            </Link>
            <Link href="/register">
              <Button variant="ghost">Register</Button>
            </Link>

            <ColorModeButton />

            {session ? (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="ghost" p={0}>
                    <HStack gap={2}>
                      <Avatar.Root size="sm">
                        <Avatar.Image
                          src={session.user?.image || undefined}
                          alt={session.user?.name || "User"}
                        />
                        <Avatar.Fallback>
                          <Icon>
                            <FaUser />
                          </Icon>
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <Text fontSize="sm" display={{ base: "none", md: "block" }}>
                        {session.user?.name}
                      </Text>
                    </HStack>
                  </Button>
                </Menu.Trigger>
                <Menu.Content>
                  <Menu.Item
                    value="signout"
                    onClick={() => signOut()}
                    color="red.500"
                  >
                    <Icon mr={2}>
                      <FaSignOutAlt />
                    </Icon>
                    Sign Out
                  </Menu.Item>
                </Menu.Content>
              </Menu.Root>
            ) : (
              <Link href="/auth/signin">
                <Button colorPalette="orange" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
