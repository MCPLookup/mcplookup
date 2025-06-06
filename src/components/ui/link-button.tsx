"use client"

import { Button, ButtonProps } from "@chakra-ui/react"
import Link from "next/link"
import { forwardRef } from "react"

interface LinkButtonProps extends Omit<ButtonProps, 'as'> {
  href: string
  external?: boolean
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, external = false, children, ...props }, ref) => {
    if (external) {
      return (
        <Button
          as="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          ref={ref}
          {...props}
        >
          {children}
        </Button>
      )
    }

    return (
      <Link href={href} passHref legacyBehavior>
        <Button as="a" ref={ref} {...props}>
          {children}
        </Button>
      </Link>
    )
  }
)

LinkButton.displayName = "LinkButton"
