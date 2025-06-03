"use client"

import { Button, Icon } from "@chakra-ui/react"
import { FaSignInAlt } from "react-icons/fa"
import { signIn, useSession } from "next-auth/react"

interface SignInButtonProps {
  provider?: string
  callbackUrl?: string
  size?: "sm" | "md" | "lg"
  variant?: "solid" | "outline" | "ghost" | "link"
  colorScheme?: string
}

export function SignInButton({
  provider,
  callbackUrl = "/",
  size = "md",
  variant = "solid",
  colorScheme = "orange"
}: SignInButtonProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <Button
        isLoading
        size={size}
        variant={variant}
        colorScheme={colorScheme}
      >
        Loading...
      </Button>
    )
  }

  if (session) {
    return null // User is already signed in
  }

  return (
    <Button
      onClick={() => signIn(provider, { callbackUrl })}
      leftIcon={<Icon as={FaSignInAlt} />}
      size={size}
      variant={variant}
      colorScheme={colorScheme}
    >
      Sign In
    </Button>
  )
}
