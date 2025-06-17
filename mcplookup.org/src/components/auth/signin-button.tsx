"use client"

import { Button, Icon } from "@chakra-ui/react"
import { FaGithub, FaGoogle, FaSignInAlt, FaEnvelope } from "react-icons/fa"
import { signIn, useSession } from "next-auth/react"

interface SignInButtonProps {
  provider?: string
  callbackUrl?: string
  size?: "sm" | "md" | "lg"
  variant?: "solid" | "outline" | "ghost" | "subtle" | "surface" | "plain"
  colorScheme?: string
  width?: string
}

export function SignInButton({
  provider,
  callbackUrl = "/",
  size = "md",
  variant = "solid",
  colorScheme = "orange",
  width
}: SignInButtonProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <Button
        loading
        size={size}
        variant={variant}
        colorScheme={colorScheme}
        width={width}
      >
        Loading...
      </Button>
    )
  }

  if (session) {
    return null // User is already signed in
  }

  const getProviderIcon = () => {
    switch (provider) {
      case 'github':
        return FaGithub
      case 'google':
        return FaGoogle
      case 'email':
        return FaEnvelope
      default:
        return FaSignInAlt
    }
  }

  const getProviderLabel = () => {
    switch (provider) {
      case 'github':
        return 'Sign in with GitHub'
      case 'google':
        return 'Sign in with Google'
      case 'email':
        return 'Sign in with Email'
      default:
        return 'Sign In'
    }
  }

  const getProviderColorScheme = () => {
    switch (provider) {
      case 'github':
        return 'gray'
      case 'google':
        return 'red'
      case 'email':
        return 'blue'
      default:
        return colorScheme
    }
  }

  return (
    <Button
      onClick={() => signIn(provider, { callbackUrl })}
      size={size}
      variant={variant}
      colorScheme={getProviderColorScheme()}
      width={width}
    >
      <Icon as={getProviderIcon()} mr={2} />
      {getProviderLabel()}
    </Button>
  )
}

export default SignInButton;
