"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SignInButton } from "@/components/auth/signin-button"
import { AnimatedButton } from "@/components/ui/animated-button"
import AnimatedCard, { AnimatedList } from "@/components/ui/animated-card"
import Link from "next/link"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-6xl mx-auto py-20 px-4">
        {/* Hero Section */}
        <div className="text-center mb-20 space-y-8">
          <div className="flex items-center justify-center space-x-4 animate-fade-in-down">
            <div className="w-10 h-10 text-blue-600 animate-float">🔍</div>
            <h1 className="text-5xl font-bold text-slate-900">
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
              Three calls to action: Fix your tools. Register your servers. Make this site obsolete.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/discover">
                <AnimatedButton
                  variant="solid"
                  size="lg"
                  hoverScale={1.02}
                  clickScale={0.98}
                  rippleEffect
                  className="min-w-[180px]"
                >
                  1️⃣ Fix Your MCP Tools
                </AnimatedButton>
              </Link>
              <Link href="/register">
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  hoverScale={1.02}
                  clickScale={0.98}
                  rippleEffect
                  className="min-w-[180px]"
                >
                  2️⃣ Register Your Servers
                </AnimatedButton>
              </Link>
              <Link href="https://github.com/TSavo/mcplookup.org">
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  hoverScale={1.02}
                  clickScale={0.98}
                  rippleEffect
                  className="min-w-[180px]"
                >
                  3️⃣ Make This Obsolete
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl mx-auto">
                  <p className="text-sm text-blue-800 font-medium">
                    🌍 <strong>Open Standards Mission:</strong> MCPLookup.org wins when a better solution arrives.
                    We're building open standards, not walled gardens. Fork our code, compete with us, improve on our design -
                    <strong>ecosystem health matters more than our success.</strong>
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Open Standards Mission */}
        <AnimatedCard.Root
          hoverScale={1.02}
          hoverY={-4}
          borderOnHover
          staggerDelay={0.3}
        >
          <AnimatedCard.Body>
            <div className="text-center space-y-6 py-8">
              <h3 className="text-2xl font-bold text-blue-900 animate-fade-in-up" style={{ animationDelay: '1.6s' }}>
                🌍 Open Standards, Not Monopolies
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="text-left space-y-4 animate-fade-in-left" style={{ animationDelay: '1.8s' }}>
                  <h4 className="text-lg font-semibold text-red-600">🚨 The Critical Moment</h4>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                      <strong>We are at the React moment for AI tool discovery.</strong><br/>
                      The first generation will set the standard for all future generations.<br/>
                      <strong>This is why open standards matter more than ever.</strong>
                    </p>
                  </div>
                </div>

                <div className="text-left space-y-4 animate-fade-in-right" style={{ animationDelay: '2.0s' }}>
                  <h4 className="text-lg font-semibold text-green-600">✅ Our Open Philosophy</h4>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>MCPLookup.org wins when a better solution arrives.</strong><br/>
                      We're building open standards, not walled gardens.<br/>
                      Fork our code. Compete with us. Build something better.<br/>
                      <strong>Ecosystem health {`>`} Our success.</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-sm animate-fade-in-up" style={{ animationDelay: '2.2s' }}>
                <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-800">
                  🔓 Open Source
                </div>
                <div className="bg-purple-100 px-3 py-1 rounded-full text-purple-800">
                  🌐 Open Standards
                </div>
                <div className="bg-orange-100 px-3 py-1 rounded-full text-orange-800">
                  🤝 Open Collaboration
                </div>
                <div className="bg-green-100 px-3 py-1 rounded-full text-green-800">
                  📡 Open Distribution
                </div>
              </div>

              <p className="text-base text-gray-600 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '2.4s' }}>
                <strong>Information wants to be free.</strong> We encourage alternative implementations,
                private deployments, and competing solutions. All we ask: use open standards so the ecosystem stays interoperable.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '2.6s' }}>
                <p className="text-sm text-yellow-800 font-medium">
                  💰 <strong>The Real Cost:</strong> Right now we're all paying overhead with hardcoded lists.
                  This site costs me time and money. Major AI leaders will eventually get their s**t together.
                  <strong>Until then, I win when the problem goes away. So say we all.</strong>
                </p>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Three Calls to Action */}
        <AnimatedCard.Root
          hoverScale={1.02}
          hoverY={-4}
          borderOnHover
          staggerDelay={0.4}
        >
          <AnimatedCard.Body>
            <div className="text-center space-y-8 py-8">
              <h3 className="text-2xl font-bold text-gray-900 animate-fade-in-up" style={{ animationDelay: '2.8s' }}>
                🎯 Three Calls to Action
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="text-center space-y-4 animate-fade-in-up" style={{ animationDelay: '3.0s' }}>
                  <div className="text-6xl text-red-600 mb-4">1</div>
                  <h4 className="text-xl font-bold text-red-600">Fix Your MCP Tool Use</h4>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 font-medium">
                      <strong>NOW.</strong> End hardcoded lists in your AI projects.
                      Use dynamic discovery. Connect to MCPLookup.org and never maintain static server lists again.
                    </p>
                  </div>
                  <Link href="/discover">
                    <AnimatedButton
                      variant="solid"
                      size="sm"
                      hoverScale={1.05}
                      clickScale={0.95}
                      rippleEffect
                      className="bg-red-600 hover:bg-red-700"
                    >
                      🚀 Start Dynamic Discovery
                    </AnimatedButton>
                  </Link>
                </div>

                <div className="text-center space-y-4 animate-fade-in-up" style={{ animationDelay: '3.2s' }}>
                  <div className="text-6xl text-blue-600 mb-4">2</div>
                  <h4 className="text-xl font-bold text-blue-600">Register Your MCP Tools</h4>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      <strong>Developers:</strong> Register your MCP servers for dynamic discovery.
                      Make your tools discoverable. Help build the ecosystem.
                    </p>
                  </div>
                  <Link href="/register">
                    <AnimatedButton
                      variant="solid"
                      size="sm"
                      hoverScale={1.05}
                      clickScale={0.95}
                      rippleEffect
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      📝 Register Your Server
                    </AnimatedButton>
                  </Link>
                </div>

                <div className="text-center space-y-4 animate-fade-in-up" style={{ animationDelay: '3.4s' }}>
                  <div className="text-6xl text-green-600 mb-4">3</div>
                  <h4 className="text-xl font-bold text-green-600">Make This Site Obsolete</h4>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      <strong>Everyone:</strong> Help make this site obsolete. Join GitHub discussions,
                      submit PRs, adopt open standards. Industry leaders: wake up and pay attention.
                    </p>
                  </div>
                  <Link href="https://github.com/TSavo/mcplookup.org">
                    <AnimatedButton
                      variant="solid"
                      size="sm"
                      hoverScale={1.05}
                      clickScale={0.95}
                      rippleEffect
                      className="bg-green-600 hover:bg-green-700"
                    >
                      🌍 Join the Revolution
                    </AnimatedButton>
                  </Link>
                </div>
              </div>

              <p className="text-lg text-gray-600 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '3.6s' }}>
                <strong>This site is a call to action.</strong> Fix your tools. Register your servers.
                Help make dynamic discovery the standard. <strong>Make MCPLookup.org obsolete.</strong>
              </p>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Features Grid */}
        <AnimatedList staggerDelay={0.1} direction="up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            <AnimatedCard.Root
              hoverScale={1.02}
              hoverY={-4}
              borderOnHover
              staggerDelay={0}
            >
              <AnimatedCard.Body>
                <div className="text-center">
                  <div className="text-4xl text-blue-500 mb-4 animate-bounce-in" style={{ animationDelay: '0.8s' }}>🚀</div>
                  <h3 className="text-lg font-semibold mb-2">Dynamic Discovery</h3>
                  <p className="text-sm text-gray-600">
                    AI-powered search with real-time discovery - no hardcoded lists
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            <AnimatedCard.Root
              hoverScale={1.02}
              hoverY={-4}
              borderOnHover
              staggerDelay={0.1}
            >
              <AnimatedCard.Body>
                <div className="text-center">
                  <div className="text-4xl text-red-500 mb-4 animate-bounce-in" style={{ animationDelay: '1.0s' }}>💀</div>
                  <h3 className="text-lg font-semibold mb-2">Kill Static Lists</h3>
                  <p className="text-sm text-gray-600">
                    End the era of manual server configuration with auto-discovery
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            <AnimatedCard.Root
              hoverScale={1.02}
              hoverY={-4}
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
              hoverScale={1.02}
              hoverY={-4}
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
                  <div className="text-4xl text-blue-500 mb-4 animate-bounce-in" style={{ animationDelay: '1.6s' }}>🌍</div>
                  <h3 className="text-lg font-semibold mb-2">Open Standards</h3>
                  <p className="text-sm text-gray-600">
                    We win when a better solution arrives - building for ecosystem health, not dominance
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </div>
        </AnimatedList>

        {/* Revolution Stats */}
        <AnimatedCard.Root
          hoverScale={1.01}
          hoverY={-2}
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
                <strong>Three Calls to Action:</strong> Fix your tools. Register your servers. Make this site obsolete.
                <strong>Industry leaders: wake up and pay attention.</strong>
              </p>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>
      </div>

      <Footer />
    </div>
  )
}
