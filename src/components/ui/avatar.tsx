"use client"

import { Avatar as ChakraAvatar } from "@chakra-ui/react"
import * as React from "react"

export interface AvatarRootProps extends ChakraAvatar.RootProps {}
export interface AvatarImageProps extends ChakraAvatar.ImageProps {}
export interface AvatarFallbackProps extends ChakraAvatar.FallbackProps {}

export const AvatarRoot = React.forwardRef<HTMLDivElement, AvatarRootProps>(
  function AvatarRoot(props, ref) {
    return <ChakraAvatar.Root ref={ref} {...props} />
  }
)

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  function AvatarImage(props, ref) {
    return <ChakraAvatar.Image ref={ref} {...props} />
  }
)

export const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  function AvatarFallback(props, ref) {
    return <ChakraAvatar.Fallback ref={ref} {...props} />
  }
)

// Export as namespace for dot notation usage
export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
}
