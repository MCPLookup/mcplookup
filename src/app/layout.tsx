import type { Metadata } from "next"
import { Provider } from "@/components/ui/provider"
import { SessionProvider } from "next-auth/react"

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
        <SessionProvider>
          <Provider>
            {children}
          </Provider>
        </SessionProvider>
      </body>
    </html>
  )
}
