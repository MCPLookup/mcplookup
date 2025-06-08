"use client"

import { Button, ButtonProps } from "@chakra-ui/react"
import Link from "next/link"
import { forwardRef } from "react"

interface LinkButtonProps extends Omit<ButtonProps, 'as'> {
  href: string
  external?: boolean
}

export const LinkButton = forwardRef<HTMLButtonElement, LinkButtonProps>(
  ({ href, external = false, children, ...props }, ref) => {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <Button ref={ref} {...props}>
            {children}
          </Button>
        </a>
      )
    }

    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        <Button ref={ref} {...props}>
          {children}
        </Button>
      </Link>
    )
  }
)

LinkButton.displayName = "LinkButton"
