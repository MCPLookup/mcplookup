"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedButton } from "@/components/ui/animated-button"
import AnimatedCard from "@/components/ui/animated-card"
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

        {/* Our Open Standards */}
        <AnimatedCard.Root hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Our Open Standards
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="text-xl mr-2">🔍</span>
                      Discovery Protocol
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Open API for discovering MCP servers based on capabilities, domains, and natural language queries.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• RESTful API endpoints</li>
                      <li>• JSON-based responses</li>
                      <li>• Standardized metadata format</li>
                      <li>• Health monitoring integration</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="text-xl mr-2">🛡️</span>
                      Verification System
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Cryptographic verification using DNS TXT records to prove domain ownership and authenticity.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• DNS-based verification</li>
                      <li>• Cryptographic signatures</li>
                      <li>• Trust score calculation</li>
                      <li>• Transparent audit trail</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <span className="text-xl mr-2">📖</span>
                    Open Source Implementation
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    All our code is open source and available for inspection, contribution, and forking.
                  </p>
                  <div className="flex gap-3">
                    <a
                      href="https://github.com/TSavo/mcplookup.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      View Source Code
                    </a>
                    <a
                      href="https://github.com/TSavo/mcplookup.org/blob/main/API.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      API Documentation
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Technical Specifications */}
        <AnimatedCard.Root hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Technical Specifications
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Discovery API Endpoints</h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                    <div className="text-gray-400"># Search by domain</div>
                    <div>GET /api/v1/discover?type=domain&q=gmail.com</div>
                    <div className="mt-2 text-gray-400"># Search by capability</div>
                    <div>GET /api/v1/discover?type=capability&q=email</div>
                    <div className="mt-2 text-gray-400"># AI-powered search</div>
                    <div>POST /api/v1/discover/smart</div>
                    <div className="text-yellow-400">{`{`}</div>
                    <div>  "intent": "Find email servers"</div>
                    <div className="text-yellow-400">{`}`}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Verification Format</h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                    <div className="text-gray-400"># DNS TXT record format</div>
                    <div>mcplookup-verify=signature:timestamp</div>
                    <div className="mt-2 text-gray-400"># Example</div>
                    <div>mcplookup-verify=abc123:1703980800</div>
                    <div className="mt-2 text-gray-400"># Verification endpoint</div>
                    <div>GET /api/v1/verify/domain.com</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Community & Contribution */}
        <AnimatedCard.Root hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Community & Contribution
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Contribute Code</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Help improve the discovery protocol and implementation.
                  </p>
                  <a
                    href="https://github.com/TSavo/mcplookup.org/blob/main/CONTRIBUTING.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Contribution Guide
                  </a>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Propose Standards</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Submit proposals for new features and protocol improvements.
                  </p>
                  <a
                    href="https://github.com/TSavo/mcplookup.org/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Submit Proposal
                  </a>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-2xl">🔧</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Build Tools</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Create tools and integrations using our open APIs.
                  </p>
                  <Link href="/api/docs">
                    <span className="inline-block text-xs bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors">
                      API Documentation
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Join the Open Standards Movement
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Help us build the future of AI tool discovery with open, transparent, and community-driven standards.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://github.com/TSavo/mcplookup.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AnimatedButton
                  variant="solid"
                  size="lg"
                  className="bg-slate-700 hover:bg-slate-800 text-white"
                  hoverScale={1.02}
                >
                  🚀 View on GitHub
                </AnimatedButton>
              </a>
              <Link href="/register">
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  hoverScale={1.02}
                >
                  📡 Register Your Server
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
