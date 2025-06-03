"use client"

import { signIn } from "next-auth/react"
import { Button, Icon } from "@chakra-ui/react"
import { FaGithub, FaGoogle } from "react-icons/fa"

interface SignInButtonProps {
  provider: "github" | "google"
  width?: string
}

export function SignInButton({ provider, width }: SignInButtonProps) {
  const handleSignIn = () => {
    signIn(provider, { callbackUrl: "/" })
  }

  const providerConfig = {
    github: {
      icon: FaGithub,
      label: "Continue with GitHub",
      colorPalette: "gray"
    },
    google: {
      icon: FaGoogle,
      label: "Continue with Google",
      colorPalette: "blue"
    }
  }

  const config = providerConfig[provider]

  return (
    <Button
      onClick={handleSignIn}
      colorPalette={config.colorPalette}
      variant="outline"
      size="lg"
      width={width}
    >
      <Icon mr={2}>
        <config.icon />
      </Icon>
      {config.label}
    </Button>
  )
}
