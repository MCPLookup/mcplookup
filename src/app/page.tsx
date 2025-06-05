"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedButton } from "@/components/ui/animated-button"
import AnimatedCard, { AnimatedList } from "@/components/ui/animated-card"
import Link from "next/link"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Discover AI Tools
                <span className="block text-blue-600">Dynamically</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Stop hardcoding AI tool lists. Find and connect to Model Context Protocol servers
                automatically with intelligent discovery.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
              <Link href="/discover">
                <AnimatedButton
                  variant="solid"
                  size="lg"
                  hoverScale={1.02}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 text-base font-medium"
                >
                  🔍 Start Discovering
                </AnimatedButton>
              </Link>
              <Link href="/how-to-use">
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  hoverScale={1.02}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 text-base"
                >
                  📖 How It Works
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* User Journey Paths */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Choose Your Path
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're building AI applications, creating tools, or just exploring,
              we have the right solution for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Developers Path */}
            <AnimatedCard.Root hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-2xl">👨‍💻</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">For Developers</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Start with free discovery to find AI tools. Get API keys for advanced features like server registration and analytics.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Link href="/discover">
                      <AnimatedButton
                        variant="solid"
                        size="sm"
                        hoverScale={1.01}
                        className="w-full bg-slate-700 hover:bg-slate-800 text-white text-sm py-2"
                      >
                        🔍 Discover Tools
                      </AnimatedButton>
                    </Link>
                    <Link href="/how-to-use">
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-300 text-slate-600 hover:bg-slate-50 text-xs py-1.5"
                      >
                        📖 Integration Guide
                      </AnimatedButton>
                    </Link>
                  </div>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            {/* Tool Creators Path */}
            <AnimatedCard.Root hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-2xl">🛠️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">For Tool Creators</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Make your AI tools discoverable. Get API keys to register your MCP servers and reach more users.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Link href="/dashboard">
                      <AnimatedButton
                        variant="solid"
                        size="sm"
                        hoverScale={1.01}
                        className="w-full bg-slate-700 hover:bg-slate-800 text-white text-sm py-2"
                      >
                        🔑 Get API Keys
                      </AnimatedButton>
                    </Link>
                    <Link href="/register">
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-300 text-slate-600 hover:bg-slate-50 text-xs py-1.5"
                      >
                        📡 Register Your Tool
                      </AnimatedButton>
                    </Link>
                  </div>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            {/* Explorers Path */}
            <AnimatedCard.Root hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">For Explorers</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Curious about AI tools? Browse the ecosystem and learn what's possible.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Link href="/discover">
                      <AnimatedButton
                        variant="solid"
                        size="sm"
                        hoverScale={1.01}
                        className="w-full bg-slate-700 hover:bg-slate-800 text-white text-sm py-2"
                      >
                        🌍 Explore Ecosystem
                      </AnimatedButton>
                    </Link>
                    <Link href="/docs">
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-300 text-slate-600 hover:bg-slate-50 text-xs py-1.5"
                      >
                        📚 Learn More
                      </AnimatedButton>
                    </Link>
                  </div>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              From Static Lists to Dynamic Discovery
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stop maintaining hardcoded server lists. Discover AI tools automatically with intelligent search.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Before: The Problem */}
            <AnimatedCard.Root hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-red-600 text-sm font-bold">❌</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Before: Manual Configuration</h3>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <code className="text-green-400 text-sm block leading-relaxed">
                      <span className="text-gray-500">// Hardcoded server lists</span><br/>
                      <span className="text-blue-400">const</span> <span className="text-yellow-300">servers</span> = {`{`}<br/>
                      &nbsp;&nbsp;<span className="text-orange-300">"gmail"</span>: <span className="text-orange-300">"https://gmail.com/mcp"</span>,<br/>
                      &nbsp;&nbsp;<span className="text-orange-300">"slack"</span>: <span className="text-orange-300">"https://slack.com/api/mcp"</span>,<br/>
                      &nbsp;&nbsp;<span className="text-gray-500">// Manually maintained...</span><br/>
                      {`};`}
                    </code>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="text-red-400 mr-2">•</span>
                      Manual updates for every new tool
                    </div>
                    <div className="flex items-center">
                      <span className="text-red-400 mr-2">•</span>
                      Broken links and outdated endpoints
                    </div>
                    <div className="flex items-center">
                      <span className="text-red-400 mr-2">•</span>
                      No discovery of new capabilities
                    </div>
                    <div className="flex items-center">
                      <span className="text-red-400 mr-2">•</span>
                      Poor developer experience
                    </div>
                  </div>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            {/* After: The Solution */}
            <AnimatedCard.Root hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm font-bold">✅</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">After: Dynamic Discovery</h3>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <code className="text-green-400 text-sm block leading-relaxed">
                      <span className="text-gray-500">// Dynamic discovery</span><br/>
                      <span className="text-blue-400">const</span> <span className="text-yellow-300">servers</span> = <span className="text-blue-400">await</span> <span className="text-yellow-300">discover</span>({`{`}<br/>
                      &nbsp;&nbsp;<span className="text-orange-300">capability</span>: <span className="text-orange-300">"email"</span>,<br/>
                      &nbsp;&nbsp;<span className="text-orange-300">verified</span>: <span className="text-blue-400">true</span><br/>
                      {`});`}<br/>
                      <span className="text-gray-500">// Always up-to-date!</span>
                    </code>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">•</span>
                      Automatic discovery of new tools
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">•</span>
                      Real-time health monitoring
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">•</span>
                      AI-powered capability matching
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">•</span>
                      Zero maintenance required
                    </div>
                  </div>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for scale, security, and simplicity. Everything you need to build modern AI applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI-Powered Search */}
            <AnimatedCard.Root hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-5 text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">🧠</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">AI-Powered Search</h3>
                  <p className="text-gray-600 text-sm">
                    Find tools using natural language. "I need email and calendar integration" returns relevant MCP servers.
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            {/* DNS Verification */}
            <AnimatedCard.Root hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-5 text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">🛡️</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">DNS Verification</h3>
                  <p className="text-gray-600 text-sm">
                    Cryptographic proof of domain ownership ensures you're connecting to legitimate services.
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            {/* Real-time Health */}
            <AnimatedCard.Root hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-5 text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">💓</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Health Monitoring</h3>
                  <p className="text-gray-600 text-sm">
                    Continuous monitoring ensures you only connect to healthy, responsive servers.
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            {/* Global Scale */}
            <AnimatedCard.Root hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-5 text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">🌍</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Global Scale</h3>
                  <p className="text-gray-600 text-sm">
                    Serverless architecture with edge distribution for sub-100ms response times worldwide.
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            {/* Open Standards */}
            <AnimatedCard.Root hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-5 text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">🔓</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Open Standards</h3>
                  <p className="text-gray-600 text-sm">
                    Built on open protocols. Fork our code, compete with us, improve the ecosystem.
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            {/* Developer Friendly */}
            <AnimatedCard.Root hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-5 text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">⚡</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Developer Friendly</h3>
                  <p className="text-gray-600 text-sm">
                    Start with free discovery, then get API keys for advanced features. Simple REST API and comprehensive docs.
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Trusted by Developers Worldwide
            </h2>
            <p className="text-lg text-gray-600">
              Join the growing ecosystem of AI tools and applications.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">500+</div>
              <div className="text-gray-700 text-sm">Registered Servers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">99.9%</div>
              <div className="text-gray-700 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">&lt;100ms</div>
              <div className="text-gray-700 text-sm">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">24/7</div>
              <div className="text-gray-700 text-sm">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-blue-100 max-w-xl mx-auto">
              Join developers building the next generation of AI applications with dynamic tool discovery.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/discover">
                <AnimatedButton
                  variant="solid"
                  size="lg"
                  hoverScale={1.02}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 text-base font-medium"
                >
                  🚀 Start Building
                </AnimatedButton>
              </Link>
              <Link href="/register">
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  hoverScale={1.02}
                  className="border-blue-200 text-white hover:bg-blue-500 px-6 py-3 text-base"
                >
                  📡 Register Your Tool
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
