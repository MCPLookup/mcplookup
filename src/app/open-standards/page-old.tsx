"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedButton } from "@/components/ui/animated-button"
import AnimatedCard, { AnimatedList } from "@/components/ui/animated-card"
import Link from "next/link"

export default function OpenStandardsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-5xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Open Standards for AI Discovery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Building the future of AI tool discovery with open protocols, transparent development, and community collaboration.
          </p>
        </div>

        {/* Why Open Standards Matter */}
        <AnimatedCard.Root hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Why Open Standards Matter
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-2xl">🔓</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">No Vendor Lock-in</h3>
                  <p className="text-sm text-gray-600">
                    Open protocols ensure you're never trapped by a single provider's implementation.
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Global Interoperability</h3>
                  <p className="text-sm text-gray-600">
                    Standards enable different systems to work together seamlessly across the ecosystem.
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Innovation Acceleration</h3>
                  <p className="text-sm text-gray-600">
                    Open standards lower barriers to entry and enable rapid innovation by the community.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* The React Parallel */}
        <AnimatedCard.Root
          hoverScale={1.02}
          hoverY={-4}
          borderOnHover
          staggerDelay={0.1}
        >
          <AnimatedCard.Body>
            <div className="text-center space-y-6 py-8">
              <h3 className="text-2xl font-bold text-blue-900 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                📚 History Lesson: The React Moment (2013-2015)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="text-left space-y-4 animate-fade-in-left" style={{ animationDelay: '1.0s' }}>
                  <h4 className="text-lg font-semibold text-red-600">❌ Before React (2010-2013)</h4>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <ul className="text-sm text-red-800 space-y-2">
                      <li>• Every framework had different patterns</li>
                      <li>• jQuery spaghetti code everywhere</li>
                      <li>• Backbone, Angular 1, Ember all different</li>
                      <li>• No standard way to build UIs</li>
                      <li>• Fragmented ecosystem</li>
                    </ul>
                  </div>
                </div>

                <div className="text-left space-y-4 animate-fade-in-right" style={{ animationDelay: '1.2s' }}>
                  <h4 className="text-lg font-semibold text-green-600">✅ After React Won (2015+)</h4>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <ul className="text-sm text-green-800 space-y-2">
                      <li>• Component-based architecture everywhere</li>
                      <li>• Virtual DOM became standard</li>
                      <li>• Vue, Angular 2+ copied React patterns</li>
                      <li>• Even mobile development changed</li>
                      <li>• 10+ years of React dominance</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 max-w-4xl mx-auto">
                <p className="text-lg text-blue-800 font-bold text-center mb-3">
                  🎯 <strong>React didn't just win - it defined how an entire generation thinks about building UIs</strong>
                </p>
                <p className="text-blue-700 text-center">
                  The patterns established in 2013-2015 are STILL the dominant paradigm in 2024.
                  <strong> That's the power of a "moment" - it lasts for decades.</strong>
                </p>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* The Current Crisis */}
        <AnimatedCard.Root
          hoverScale={1.02}
          hoverY={-4}
          borderOnHover
          staggerDelay={0.2}
        >
          <AnimatedCard.Body>
            <div className="text-center space-y-6 py-8">
              <h3 className="text-2xl font-bold text-red-900 animate-fade-in-up" style={{ animationDelay: '1.4s' }}>
                🔥 RIGHT NOW: The AI Discovery Moment (2024-2026)
              </h3>

              <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6 max-w-5xl mx-auto">
                <h4 className="text-xl font-bold text-red-800 mb-4">🚨 WE ARE IN THE WINDOW RIGHT NOW</h4>
                <p className="text-lg text-red-700 mb-4">
                  <strong>Just like React's 2-year window (2013-2015) defined UI development for a decade,</strong><br/>
                  <strong>our 2-year window (2024-2026) will define AI tool discovery for a decade.</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded border border-red-300">
                    <h5 className="font-bold text-red-800 mb-2">⚠️ Current Chaos (Like Pre-React):</h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Everyone hardcodes MCP server lists</li>
                      <li>• Claude Desktop: manual configs</li>
                      <li>• No standard discovery protocol</li>
                      <li>• Fragmented, brittle systems</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded border border-red-300">
                    <h5 className="font-bold text-red-800 mb-2">💀 What's at Stake:</h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Next-gen AI models training NOW</li>
                      <li>• Patterns learned = permanent</li>
                      <li>• Open discovery vs. corporate silos</li>
                      <li>• The future of the open web</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* The Solution */}
        <AnimatedCard.Root
          hoverScale={1.02}
          hoverY={-4}
          borderOnHover
          staggerDelay={0.3}
        >
          <AnimatedCard.Body>
            <div className="text-center space-y-6 py-8">
              <h3 className="text-2xl font-bold text-green-900 animate-fade-in-up" style={{ animationDelay: '2.0s' }}>
                🌍 The Solution: Open Standards (Like MCP Did for Tools)
              </h3>

              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 max-w-5xl mx-auto">
                <h4 className="text-xl font-bold text-green-800 mb-4">✅ MCP Already Proved This Works</h4>
                <p className="text-lg text-green-700 mb-4">
                  <strong>MCP solved the tool use problem with open standards.</strong> Before MCP, every AI had different tool interfaces.
                  Now we have ONE protocol that works everywhere.
                </p>
                <p className="text-green-600 font-medium">
                  <strong>We need to do the SAME THING for discovery that MCP did for tool use.</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">🔓 Open Source</h4>
                  <p className="text-sm text-blue-700">
                    All code public, forkable, improvable. No black boxes.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2">🌐 Open Standards</h4>
                  <p className="text-sm text-purple-700">
                    Protocols anyone can implement. No gatekeepers.
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-2">🤝 Open Collaboration</h4>
                  <p className="text-sm text-orange-700">
                    Community-driven development. Ecosystem health first.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* EMERGENCY CALL TO ACTION */}
        <AnimatedCard.Root
          hoverScale={1.02}
          hoverY={-4}
          borderOnHover
          staggerDelay={0.4}
        >
          <AnimatedCard.Body>
            <div className="text-center space-y-6 py-8">
              <h3 className="text-3xl font-bold text-red-900 animate-fade-in-up" style={{ animationDelay: '2.4s' }}>
                🚨 ALL HANDS ON DECK
              </h3>

              <div className="bg-gradient-to-r from-yellow-50 to-red-50 border-2 border-red-400 rounded-lg p-6 max-w-5xl mx-auto">
                <h4 className="text-xl font-bold text-red-800 mb-4">⏰ THIS IS NOT A DRILL</h4>
                <p className="text-lg text-red-700 mb-4">
                  <strong>Every developer, every company, every user needs to act NOW.</strong><br/>
                  The training window is closing. Whatever patterns exist in 12-18 months become permanent.
                </p>
                <p className="text-red-600 font-medium">
                  Use open discovery. Build open tools. Demand open standards. Spread the word.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-red-50 p-6 rounded-lg border-2 border-red-300">
                  <h4 className="font-bold text-red-800 mb-3 text-lg">🔧 DEVELOPERS</h4>
                  <p className="text-sm text-red-700 mb-4">
                    <strong>STOP using hardcoded lists.</strong> Use open discovery. Register your servers. 
                    Get your patterns into the training data.
                  </p>
                  <Link href="/register">
                    <AnimatedButton
                      variant="solid"
                      size="sm"
                      hoverScale={1.05}
                      rippleEffect
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      🚨 REGISTER NOW
                    </AnimatedButton>
                  </Link>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
                  <h4 className="font-bold text-blue-800 mb-3 text-lg">🏢 INDUSTRY LEADERS</h4>
                  <p className="text-sm text-blue-700 mb-4">
                    <strong>ANTHROPIC, OPENAI, CURSOR TEAM:</strong> Build native discovery into MCP clients.
                    Connect directly to <code className="bg-blue-100 px-1 rounded">mcplookup.org/api/mcp</code>.
                    Make our bridge obsolete. <strong>That's how we win.</strong>
                  </p>
                  <div className="bg-white p-3 rounded border border-blue-200 mb-4">
                    <p className="text-xs text-blue-600">
                      <strong>The architecture exists:</strong> HTTP Streaming MCP discovery server is live.
                      Just connect to it instead of requiring hardcoded lists.
                    </p>
                  </div>
                  <Link href="https://github.com/TSavo/mcplookup.org">
                    <AnimatedButton
                      variant="solid"
                      size="sm"
                      hoverScale={1.05}
                      rippleEffect
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      🤝 BUILD NATIVE DISCOVERY
                    </AnimatedButton>
                  </Link>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
                  <h4 className="font-bold text-green-800 mb-3 text-lg">👥 EVERYONE</h4>
                  <p className="text-sm text-green-700 mb-4">
                    <strong>DEMAND open standards.</strong> Use tools that support open discovery. 
                    Share this message. Rally the troops.
                  </p>
                  <Link href="/discover">
                    <AnimatedButton
                      variant="solid"
                      size="sm"
                      hoverScale={1.05}
                      rippleEffect
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      🌍 SPREAD THE WORD
                    </AnimatedButton>
                  </Link>
                </div>
              </div>

              <div className="bg-red-100 border-2 border-red-500 rounded-lg p-6 max-w-4xl mx-auto">
                <p className="text-xl text-red-800 font-bold text-center">
                  ⏰ <strong>TIME IS RUNNING OUT.</strong><br/>
                  <span className="text-lg">The next generation of AI models is being trained RIGHT NOW.</span><br/>
                  <span className="text-base">Let's make sure they learn open standards, not corporate lock-in.</span>
                </p>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>
      </div>

      <Footer />
    </div>
  )
}
