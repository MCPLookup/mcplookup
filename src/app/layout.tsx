import type { Metadata } from "next"
import { ClientProviders } from "@/components/providers/client-providers"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "MCPLookup.org - Professional MCP Discovery Service",
  description: "Enterprise-grade Model Context Protocol server discovery and registration. Secure, scalable, and serverless architecture.",
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
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  )
}
