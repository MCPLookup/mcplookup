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
        {/* EMERGENCY ALERT */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-center py-4 mb-8 rounded-lg animate-pulse">
          <div className="flex items-center justify-center space-x-3">
            <div className="text-2xl animate-bounce">🚨</div>
            <h2 className="text-xl font-bold">CODE RED: AI TRAINING WINDOW CLOSING</h2>
            <div className="text-2xl animate-bounce">🚨</div>
          </div>
          <p className="text-sm mt-2 font-medium">
            Next-gen AI models training NOW. Whatever discovery patterns exist in 6 months become permanent.
          </p>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-20 space-y-8">
          <div className="flex items-center justify-center space-x-4 animate-fade-in-down">
            <div className="w-12 h-12 text-red-600 animate-float">⚠️</div>
            <h1 className="text-5xl font-bold text-slate-900">
              THE REACT MOMENT
            </h1>
          </div>

          <h2 className="text-3xl font-bold max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="text-red-600">We Have 6 Months to Save the Open Web</span>
          </h2>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400 rounded-lg p-6 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-xl font-bold text-red-800 mb-4">🔥 Just Like React Defined UI Development for a Decade</h3>
            <p className="text-lg text-red-700 mb-4">
              <strong>The discovery patterns we establish RIGHT NOW will be baked into the next generation of AI models.</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-4 rounded border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">⏰ The Window:</h4>
                <ul className="text-red-700 space-y-1">
                  <li>• GPT-5, Claude 4, Gemini 2.0 training NOW</li>
                  <li>• Training data cutoff: 6 months</li>
                  <li>• Whatever patterns exist then = permanent</li>
                  <li>• No do-overs for 5-10 years</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">💀 The Stakes:</h4>
                <ul className="text-red-700 space-y-1">
                  <li>• Open discovery = open web survives</li>
                  <li>• Proprietary discovery = corporate capture</li>
                  <li>• Billions of users affected</li>
                  <li>• Generational lock-in</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-red-50 border-2 border-yellow-400 rounded-lg p-6 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg font-bold text-yellow-800 mb-3">🚨 ALL HANDS ON DECK</h3>
            <p className="text-yellow-700 font-medium">
              <strong>This is not a drill.</strong> Every developer, every company, every user needs to act NOW.
              Use open discovery. Build open tools. Demand open standards.
            </p>
          </div>

          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <p className="text-xl font-bold text-gray-900">
              🎯 THREE EMERGENCY ACTIONS:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              <Link href="/discover">
                <AnimatedButton
                  variant="solid"
                  size="lg"
                  hoverScale={1.02}
                  clickScale={0.98}
                  rippleEffect
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4"
                >
                  🔍 USE OPEN DISCOVERY<br/>
                  <span className="text-sm font-normal">Stop hardcoded lists NOW</span>
                </AnimatedButton>
              </Link>
              <Link href="/register">
                <AnimatedButton
                  variant="solid"
                  size="lg"
                  hoverScale={1.02}
                  clickScale={0.98}
                  rippleEffect
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4"
                >
                  📡 REGISTER YOUR TOOLS<br/>
                  <span className="text-sm font-normal">Get in the training data</span>
                </AnimatedButton>
              </Link>
              <Link href="/open-standards">
                <AnimatedButton
                  variant="solid"
                  size="lg"
                  hoverScale={1.02}
                  clickScale={0.98}
                  rippleEffect
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4"
                >
                  🌍 SPREAD THE WORD<br/>
                  <span className="text-sm font-normal">Rally the troops</span>
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

        {/* Bridge Solution - The Temporary Fix */}
        <AnimatedCard.Root
          hoverScale={1.02}
          hoverY={-4}
          borderOnHover
          staggerDelay={0.3}
        >
          <AnimatedCard.Body>
            <div className="text-center space-y-6 py-8">
              <h3 className="text-2xl font-bold text-orange-900 animate-fade-in-up" style={{ animationDelay: '1.6s' }}>
                🌉 The Bridge: A Temporary Fix for a Fundamental Flaw
              </h3>

              <div className="bg-orange-50 border-l-4 border-orange-400 p-6 max-w-4xl mx-auto text-left">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <h4 className="text-lg font-bold text-orange-800 mb-2">This Bridge Should NOT Exist</h4>
                    <p className="text-orange-700 mb-4">
                      <strong>Someone else should be figuring this out.</strong> The fact that we need a "Universal MCP Bridge"
                      to eliminate hardcoded server lists is a symptom of a broken ecosystem.
                    </p>
                    <div className="space-y-3 text-sm">
                      <div className="bg-white p-3 rounded border border-orange-200">
                        <strong className="text-orange-800">What the bridge does:</strong> Replaces ALL hardcoded MCP servers with ONE dynamic bridge
                        <code className="block mt-1 text-xs bg-gray-100 p-2 rounded">
                          {`// Instead of hardcoding 50+ servers:`}<br/>
                          {`// Just use one bridge that discovers everything`}<br/>
                          {`"universal-bridge": {"command": "node", "args": ["scripts/mcp-bridge.mjs"]}`}
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-orange-200">
                        <strong className="text-orange-800">Why it's a stopgap:</strong> This project succeeds when the bridge dies.
                        The future should be registries, not tools, in that JSON configuration.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-left">
                  <h4 className="font-bold text-red-800 mb-2">🚨 Current Broken State</h4>
                  <div className="text-sm text-red-700 space-y-2">
                    <p>• Claude Desktop requires hardcoded server lists</p>
                    <p>• Every new MCP server = manual config update</p>
                    <p>• No dynamic discovery built into MCP clients</p>
                    <p>• Ecosystem fragmentation and poor UX</p>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-left">
                  <h4 className="font-bold text-green-800 mb-2">✅ Future Proper State</h4>
                  <div className="text-sm text-green-700 space-y-2">
                    <p>• MCP clients have built-in discovery</p>
                    <p>• JSON config lists registries, not individual tools</p>
                    <p>• Dynamic server discovery is native</p>
                    <p>• This bridge becomes obsolete</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 max-w-3xl mx-auto">
                <p className="text-sm text-yellow-800 font-medium">
                  🎯 <strong>Success Metric:</strong> This project succeeds when major MCP client developers
                  (Claude, Cursor, etc.) implement native discovery and this bridge becomes unnecessary.
                  <strong> We're building the solution they should have built.</strong>
                </p>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Open Standards Call to Action */}
        <AnimatedCard.Root
          hoverScale={1.02}
          hoverY={-4}
          borderOnHover
          staggerDelay={0.4}
        >
          <AnimatedCard.Body>
            <div className="text-center space-y-6 py-8">
              <h3 className="text-2xl font-bold text-red-900 animate-fade-in-up" style={{ animationDelay: '1.8s' }}>
                ⚠️ This Is Our React Moment
              </h3>

              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                <strong>The next generation of AI models will be trained on whatever standards we create now.</strong><br/>
                Either we work together for open standards, or face corporate lock-in forever.
              </p>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-6 max-w-4xl mx-auto">
                <h4 className="text-lg font-bold text-red-800 mb-2">🚨 Time Is Running Out</h4>
                <p className="text-sm text-red-700">
                  Just like MCP solved tool use with open standards, we must solve discovery the same way.
                  <strong> If we don't act now, Big Tech will create proprietary discovery and we'll lose the open web.</strong>
                </p>
              </div>

              <Link href="/open-standards">
                <AnimatedButton
                  variant="solid"
                  size="lg"
                  hoverScale={1.05}
                  clickScale={0.95}
                  rippleEffect
                  className="bg-red-600 hover:bg-red-700"
                >
                  🌍 Why Open Standards Matter
                </AnimatedButton>
              </Link>
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
              <h3 className="text-2xl font-bold text-gray-900 animate-fade-in-up" style={{ animationDelay: '3.0s' }}>
                🎯 Three Calls to Action
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="text-center space-y-4 animate-fade-in-up" style={{ animationDelay: '3.2s' }}>
                  <div className="text-6xl text-red-600 mb-4">1</div>
                  <h4 className="text-xl font-bold text-red-600">Fix Your MCP Tools NOW</h4>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 font-medium">
                      <strong>Use the Universal Bridge.</strong> Replace ALL hardcoded MCP servers with ONE bridge.
                      End static configuration hell. Get dynamic discovery today.
                    </p>
                    <div className="mt-2 text-xs bg-white p-2 rounded border">
                      <code className="text-red-700">
                        {`// Replace 50+ hardcoded servers with:`}<br/>
                        {`"universal-bridge": {`}<br/>
                        {`  "command": "node",`}<br/>
                        {`  "args": ["scripts/mcp-bridge.mjs"]`}<br/>
                        {`}`}
                      </code>
                    </div>
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
                      🌉 Get the Bridge
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

                <div className="text-center space-y-4 animate-fade-in-up" style={{ animationDelay: '3.6s' }}>
                  <div className="text-6xl text-green-600 mb-4">3</div>
                  <h4 className="text-xl font-bold text-green-600">Kill the Bridge</h4>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      <strong>Industry Leaders:</strong> Build native discovery into MCP clients.
                      Make our bridge obsolete. The future should be registries in JSON, not individual tools.
                      <strong>Someone else should be solving this.</strong>
                    </p>
                    <div className="mt-2 text-xs bg-white p-2 rounded border">
                      <code className="text-green-700">
                        {`// Future JSON should be:`}<br/>
                        {`"registries": [`}<br/>
                        {`  "https://mcplookup.org"`}<br/>
                        {`]`}<br/>
                        {`// Not 50+ hardcoded servers`}
                      </code>
                    </div>
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
                      💀 Kill the Bridge
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
