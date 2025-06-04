import type { Metadata } from "next"
import { ClientProviders } from "@/components/providers/client-providers"
import { ToasterProvider } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "MCPLookup.org - Serverless MCP Discovery Service",
  description: "The One Ring MCP Server - Discover and register Model Context Protocol servers. Zero infrastructure, no database required.",
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
          <ToasterProvider>
            {children}
          </ToasterProvider>
        </ClientProviders>
      </body>
    </html>
  )
}
