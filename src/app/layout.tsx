import type { Metadata } from "next"
import { ClientProviders } from "@/components/providers/client-providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "MCPLookup.org - Universal MCP Discovery Service",
  description: "The One Ring MCP Server - Discover and register Model Context Protocol servers",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
