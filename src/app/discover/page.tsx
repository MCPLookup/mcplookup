"use client"

import React, { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedButton } from "@/components/ui/animated-button"
import AnimatedCard from "@/components/ui/animated-card"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface MCPServer {
  domain: string
  endpoint: string
  name?: string
  description?: string
  capabilities: string[]
  verified: boolean
  health: "healthy" | "degraded" | "down"
  trust_score: number
  response_time_ms: number
  tools?: Array<{
    name: string
    description: string
  }>
  resources?: Array<{
    name: string
    description: string
    uri: string
  }>
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"domain" | "capability" | "smart">("smart")
  const [servers, setServers] = useState<MCPServer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      const endpoint = searchType === "smart" ? '/api/v1/discover/smart' : '/api/v1/discover'
      
      let response
      if (searchType === "smart") {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intent: searchQuery,
            context: { max_results: 20 }
          })
        })
      } else {
        const params = new URLSearchParams({
          q: searchQuery,
          type: searchType,
          limit: '20'
        })
        response = await fetch(`${endpoint}?${params}`)
      }

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      setServers(data.servers || [])
    } catch (err) {
      console.error('Search error:', err)
      setError("Failed to search for servers. Please try again.")
      setServers([])
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy": return "text-green-600 bg-green-100"
      case "degraded": return "text-yellow-600 bg-yellow-100"
      case "down": return "text-red-600 bg-red-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-5xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Discover MCP Servers
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find Model Context Protocol servers using AI-powered search, domain lookup, or capability matching.
          </p>
        </div>

        {/* Search Interface */}
        <AnimatedCard.Root hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-6">
              <div className="space-y-4">
                {/* Search Type Tabs */}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setSearchType("smart")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchType === "smart"
                        ? "bg-slate-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    🧠 AI Search
                  </button>
                  <button
                    onClick={() => setSearchType("domain")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchType === "domain"
                        ? "bg-slate-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    🌐 Domain
                  </button>
                  <button
                    onClick={() => setSearchType("capability")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchType === "capability"
                        ? "bg-slate-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    🔧 Capability
                  </button>
                </div>

                {/* Search Input */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder={
                      searchType === "smart"
                        ? "Ask in natural language: 'Find email servers like Gmail'"
                        : searchType === "domain"
                        ? "Enter domain: gmail.com"
                        : "Enter capability: email, calendar, etc."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                  <AnimatedButton
                    onClick={handleSearch}
                    disabled={loading || !searchQuery.trim()}
                    variant="solid"
                    size="lg"
                    hoverScale={1.02}
                    className="bg-slate-700 hover:bg-slate-800 text-white px-6"
                  >
                    {loading ? "Searching..." : "🔍 Search"}
                  </AnimatedButton>
                </div>

                {/* Search Type Description */}
                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    {searchType === "smart" && "AI-powered search understands natural language queries"}
                    {searchType === "domain" && "Find servers by their domain name"}
                    {searchType === "capability" && "Search by what the server can do"}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results */}
        {servers.length > 0 && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-slate-600">Found {servers.length} MCP servers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servers.map((server, index) => (
                <AnimatedCard.Root key={server.domain} hoverScale={1.02} borderOnHover>
                  <AnimatedCard.Body>
                    <div className="p-6 space-y-4">
                      {/* Server Header */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {server.name || server.domain}
                          </h3>
                          {server.verified && (
                            <span className="text-green-600 text-sm">✓ Verified</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{server.domain}</p>
                      </div>

                      {/* Description */}
                      {server.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {server.description}
                        </p>
                      )}

                      {/* Health Status */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(server.health)}`}>
                          {server.health || 'unknown'}
                        </span>
                        {server.response_time_ms && (
                          <span className="text-xs text-slate-500">
                            {server.response_time_ms}ms
                          </span>
                        )}
                      </div>

                      {/* Capabilities */}
                      {server.capabilities && server.capabilities.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-700">Capabilities:</p>
                          <div className="flex flex-wrap gap-1">
                            {server.capabilities.slice(0, 3).map((cap) => (
                              <span
                                key={cap}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                              >
                                {cap}
                              </span>
                            ))}
                            {server.capabilities.length > 3 && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                +{server.capabilities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tools */}
                      {server.tools && server.tools.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-700">Tools:</p>
                          <div className="space-y-1">
                            {server.tools.slice(0, 2).map((tool) => (
                              <div key={tool.name} className="text-xs">
                                <span className="font-medium">{tool.name}</span>
                                {tool.description && (
                                  <span className="text-slate-500 ml-1">- {tool.description}</span>
                                )}
                              </div>
                            ))}
                            {server.tools.length > 2 && (
                              <p className="text-xs text-slate-500">+{server.tools.length - 2} more tools</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Endpoint */}
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-500 font-mono truncate">
                          {server.endpoint}
                        </p>
                      </div>
                    </div>
                  </AnimatedCard.Body>
                </AnimatedCard.Root>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && servers.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-slate-600">No servers found. Try a different search term.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
