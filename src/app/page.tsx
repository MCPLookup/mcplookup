"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SignInButton } from "@/components/auth/signin-button"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCardNamespace as AnimatedCard, AnimatedList } from "@/components/ui/animated-card"
import Link from "next/link"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-16 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-8">
          <div className="flex items-center justify-center space-x-3 animate-fade-in-down">
            <div className="w-12 h-12 text-orange-500 animate-float">🔍</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              MCPLookup.org
            </h1>
          </div>

          <h2 className="text-3xl font-bold max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Universal MCP Discovery Service
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Discover and register Model Context Protocol servers.
            The central registry that connects AI agents with the tools they need.
          </p>

          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <p className="text-lg font-semibold">
              Get started with MCP discovery
            </p>
            <div className="flex space-x-4 justify-center">
              <Link href="/discover">
                <AnimatedButton
                  variant="primary"
                  size="lg"
                  hoverScale={1.05}
                  clickScale={0.95}
                  rippleEffect
                  glowOnHover
                >
                  🔍 Discover Servers
                </AnimatedButton>
              </Link>
              <Link href="/register">
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  hoverScale={1.05}
                  clickScale={0.95}
                  rippleEffect
                >
                  ➕ Register Server
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <AnimatedList staggerDelay={0.1} direction="up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <AnimatedCard.Root
              hoverScale={1.05}
              hoverY={-8}
              borderOnHover
              staggerDelay={0}
            >
              <AnimatedCard.Body>
                <div className="text-center">
                  <div className="text-4xl text-blue-500 mb-4 animate-bounce-in" style={{ animationDelay: '0.8s' }}>🔍</div>
                  <h3 className="text-lg font-semibold mb-2">Discovery</h3>
                  <p className="text-sm text-gray-600">
                    Find MCP servers by domain, capability, or intent
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            <AnimatedCard.Root
              hoverScale={1.05}
              hoverY={-8}
              borderOnHover
              staggerDelay={0.1}
            >
              <AnimatedCard.Body>
                <div className="text-center">
                  <div className="text-4xl text-green-500 mb-4 animate-bounce-in" style={{ animationDelay: '1.0s' }}>➕</div>
                  <h3 className="text-lg font-semibold mb-2">Registration</h3>
                  <p className="text-sm text-gray-600">
                    Register your MCP server with DNS verification
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            <AnimatedCard.Root
              hoverScale={1.05}
              hoverY={-8}
              borderOnHover
              staggerDelay={0.2}
            >
              <AnimatedCard.Body>
                <div className="text-center">
                  <div className="text-4xl text-purple-500 mb-4 animate-bounce-in" style={{ animationDelay: '1.2s' }}>🛡️</div>
                  <h3 className="text-lg font-semibold mb-2">Verification</h3>
                  <p className="text-sm text-gray-600">
                    Cryptographic proof of domain ownership
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            <AnimatedCard.Root
              hoverScale={1.05}
              hoverY={-8}
              borderOnHover
              staggerDelay={0.3}
            >
              <AnimatedCard.Body>
                <div className="text-center">
                  <div className="text-4xl text-orange-500 mb-4 animate-bounce-in" style={{ animationDelay: '1.4s' }}>🌍</div>
                  <h3 className="text-lg font-semibold mb-2">Global Registry</h3>
                  <p className="text-sm text-gray-600">
                    Serverless, scalable, open-source platform
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </div>
        </AnimatedList>

        {/* Stats */}
        <AnimatedCard.Root
          hoverScale={1.02}
          hoverY={-4}
          borderOnHover
          staggerDelay={0.4}
        >
          <AnimatedCard.Body>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold animate-fade-in-up" style={{ animationDelay: '1.6s' }}>Registry Statistics</h3>
              <div className="flex space-x-8 justify-center">
                <div className="text-center animate-scale-in" style={{ animationDelay: '1.8s' }}>
                  <div className="text-3xl font-bold text-orange-500 hover-scale">1,247</div>
                  <div className="text-sm text-gray-600">Registered Servers</div>
                </div>
                <div className="text-center animate-scale-in" style={{ animationDelay: '2.0s' }}>
                  <div className="text-3xl font-bold text-blue-500 hover-scale">98.7%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center animate-scale-in" style={{ animationDelay: '2.2s' }}>
                  <div className="text-3xl font-bold text-green-500 hover-scale">847</div>
                  <div className="text-sm text-gray-600">Verified Domains</div>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>
      </div>

      <Footer />
    </div>
  )
}
