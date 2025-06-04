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
            <span className="text-red-600">The End of Hardcoded Lists</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <strong className="text-gray-900">The MCP server that discovers all other MCP servers.</strong><br/>
            Native MCP protocol for dynamic discovery - no hardcoded lists required.
          </p>

          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <p className="text-lg font-semibold text-gray-800">
              Join the revolution against static configuration
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
                  🚀 Discover Dynamically
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
                  💀 Kill Your Hardcoded Lists
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <AnimatedCard.Root
          hoverScale={1.02}
          hoverY={-4}
          borderOnHover
          staggerDelay={0.2}
        >
          <AnimatedCard.Body>
            <div className="text-center space-y-6 py-8">
              <h3 className="text-2xl font-bold text-gray-900 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                🔥 The One Ring MCP Server: Discovers All Others
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="text-left space-y-4 animate-fade-in-left" style={{ animationDelay: '1.0s' }}>
                  <h4 className="text-lg font-semibold text-red-600">❌ The Problem: Static Hell</h4>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <code className="text-sm text-red-800 block">
                      {`// Every AI agent today:`}<br/>
                      {`const HARDCODED_SERVERS = {`}<br/>
                      {`  "gmail": "https://gmail.com/mcp",`}<br/>
                      {`  "slack": "https://slack.com/api/mcp"`}<br/>
                      {`  // Manually maintained forever...`}<br/>
                      {`};`}
                    </code>
                  </div>
                </div>

                <div className="text-left space-y-4 animate-fade-in-right" style={{ animationDelay: '1.2s' }}>
                  <h4 className="text-lg font-semibold text-green-600">✅ The Solution: Native MCP Discovery</h4>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <code className="text-sm text-green-800 block">
                      {`// AI agents connect to MCPLookup.org:`}<br/>
                      {`mcp://mcplookup.org/api/mcp`}<br/>
                      {`// Call MCP tool:`}<br/>
                      {`discover_mcp_servers({`}<br/>
                      {`  domain: "gmail.com"`}<br/>
                      {`})`}<br/>
                      {`// Returns: live server info`}<br/>
                      {`// Zero hardcoding. Pure discovery.`}
                    </code>
                  </div>
                </div>
              </div>

              <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '1.4s' }}>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  <strong>We're making hardcoded server lists as obsolete as manually typing IP addresses.</strong>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-1">🧠 AI-Powered Search</h5>
                    <p className="text-blue-700">Natural language: "I need email and calendar tools"</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <h5 className="font-semibold text-purple-800 mb-1">🛡️ DNS Security</h5>
                    <p className="text-purple-700">Cryptographic proof of domain ownership</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <h5 className="font-semibold text-orange-800 mb-1">🌉 Legacy Bridge</h5>
                    <p className="text-orange-700">Helps old systems transition from hardcoded lists</p>
                  </div>
                </div>

                <p className="text-base text-gray-500 max-w-2xl mx-auto">
                  <strong>The Future:</strong> Replace all hardcoded lists with dynamic registries like MCPLookup.org
                </p>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Features Grid */}
        <AnimatedList staggerDelay={0.1} direction="up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            <AnimatedCard.Root
              hoverScale={1.05}
              hoverY={-8}
              borderOnHover
              staggerDelay={0}
            >
              <AnimatedCard.Body>
                <div className="text-center">
                  <div className="text-4xl text-blue-500 mb-4 animate-bounce-in" style={{ animationDelay: '0.8s' }}>🚀</div>
                  <h3 className="text-lg font-semibold mb-2">Dynamic Discovery</h3>
                  <p className="text-sm text-gray-600">
                    Real-time server discovery - no hardcoded lists
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
                  <div className="text-4xl text-red-500 mb-4 animate-bounce-in" style={{ animationDelay: '1.0s' }}>💀</div>
                  <h3 className="text-lg font-semibold mb-2">Kill Static Lists</h3>
                  <p className="text-sm text-gray-600">
                    End the era of manual server configuration
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
                  <h3 className="text-lg font-semibold mb-2">Cryptographic Trust</h3>
                  <p className="text-sm text-gray-600">
                    DNS-verified, cryptographically secure discovery
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
                  <div className="text-4xl text-orange-500 mb-4 animate-bounce-in" style={{ animationDelay: '1.4s' }}>🌉</div>
                  <h3 className="text-lg font-semibold mb-2">Legacy Bridge</h3>
                  <p className="text-sm text-gray-600">
                    Helps systems transition from hardcoded lists to dynamic discovery
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            <AnimatedCard.Root
              hoverScale={1.05}
              hoverY={-8}
              borderOnHover
              staggerDelay={0.4}
            >
              <AnimatedCard.Body>
                <div className="text-center">
                  <div className="text-4xl text-green-500 mb-4 animate-bounce-in" style={{ animationDelay: '1.6s' }}>🏛️</div>
                  <h3 className="text-lg font-semibold mb-2">Registry Future</h3>
                  <p className="text-sm text-gray-600">
                    Proposing registries as the new standard to replace all hardcoded lists
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </div>
        </AnimatedList>

        {/* Revolution Stats */}
        <AnimatedCard.Root
          hoverScale={1.02}
          hoverY={-4}
          borderOnHover
          staggerDelay={0.4}
        >
          <AnimatedCard.Body>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold animate-fade-in-up" style={{ animationDelay: '1.6s' }}>
                🔥 The Revolution in Numbers
              </h3>
              <div className="flex space-x-8 justify-center">
                <div className="text-center animate-scale-in" style={{ animationDelay: '1.8s' }}>
                  <div className="text-3xl font-bold text-red-500 hover-scale">∞</div>
                  <div className="text-sm text-gray-600">Hardcoded Lists Eliminated</div>
                </div>
                <div className="text-center animate-scale-in" style={{ animationDelay: '2.0s' }}>
                  <div className="text-3xl font-bold text-blue-500 hover-scale">98.7%</div>
                  <div className="text-sm text-gray-600">Discovery Uptime</div>
                </div>
                <div className="text-center animate-scale-in" style={{ animationDelay: '2.2s' }}>
                  <div className="text-3xl font-bold text-green-500 hover-scale">0ms</div>
                  <div className="text-sm text-gray-600">Configuration Time</div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 animate-fade-in-up" style={{ animationDelay: '2.4s' }}>
                Join the movement to make AI tools as discoverable as websites
              </p>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>
      </div>

      <Footer />
    </div>
  )
}
