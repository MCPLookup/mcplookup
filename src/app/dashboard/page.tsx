"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedButton } from "@/components/ui/animated-button"
import AnimatedCard, { AnimatedList } from "@/components/ui/animated-card"
import Link from "next/link"
import { useState } from "react"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('servers')

  // Mock data - in real app this would come from API
  const userServers = [
    {
      id: 1,
      domain: "mycompany.com",
      endpoint: "https://api.mycompany.com/mcp",
      status: "healthy",
      verified: true,
      lastSeen: "2 minutes ago",
      capabilities: ["email", "calendar", "crm"],
      trustScore: 92,
      monthlyRequests: 15420
    },
    {
      id: 2,
      domain: "dev.mycompany.com",
      endpoint: "https://dev-api.mycompany.com/mcp",
      status: "warning",
      verified: false,
      lastSeen: "1 hour ago",
      capabilities: ["testing", "development"],
      trustScore: 78,
      monthlyRequests: 3240
    }
  ]

  const stats = {
    totalServers: 2,
    totalRequests: 18660,
    averageTrustScore: 85,
    verifiedServers: 1
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto py-20 px-4">
        {/* EMERGENCY BANNER */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-center py-4 mb-12 rounded-lg animate-pulse">
          <div className="flex items-center justify-center space-x-3">
            <div className="text-2xl animate-bounce">📡</div>
            <h1 className="text-xl font-bold">GET YOUR SERVERS IN THE TRAINING DATA</h1>
            <div className="text-2xl animate-bounce">📡</div>
          </div>
          <p className="text-sm mt-2">
            Register NOW. Every server not in the registry risks being forgotten by next-gen AI.
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Developer Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage your MCP servers, monitor health, and track discovery metrics
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <AnimatedCard.Root hoverScale={1.02} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-3xl text-blue-600 mb-2">🖥️</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalServers}</div>
                <div className="text-sm text-gray-600">Registered Servers</div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.02} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-3xl text-green-600 mb-2">📊</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Monthly Requests</div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.02} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-3xl text-orange-600 mb-2">⭐</div>
                <div className="text-2xl font-bold text-gray-900">{stats.averageTrustScore}</div>
                <div className="text-sm text-gray-600">Avg Trust Score</div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.02} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-3xl text-purple-600 mb-2">✅</div>
                <div className="text-2xl font-bold text-gray-900">{stats.verifiedServers}</div>
                <div className="text-sm text-gray-600">Verified Servers</div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          {[
            { id: 'servers', label: '🖥️ My Servers', count: stats.totalServers },
            { id: 'domains', label: '🌐 Domains', count: 2 },
            { id: 'analytics', label: '📊 Analytics', count: null },
            { id: 'profile', label: '👤 Profile', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content - Servers */}
        {activeTab === 'servers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My MCP Servers</h2>
              <Link href="/register">
                <AnimatedButton
                  variant="solid"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  hoverScale={1.05}
                >
                  ➕ Add New Server
                </AnimatedButton>
              </Link>
            </div>

            <div className="space-y-4">
              {userServers.map((server) => (
                <AnimatedCard.Root key={server.id} hoverScale={1.01} borderOnHover>
                  <AnimatedCard.Body>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            {server.domain}
                            {server.verified && (
                              <span className="ml-2 text-green-600 text-sm">✅ Verified</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{server.endpoint}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            server.status === 'healthy'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {server.status === 'healthy' ? '🟢 Healthy' : '🟡 Warning'}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            ⚙️
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Last Seen:</span>
                          <div className="font-medium">{server.lastSeen}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Trust Score:</span>
                          <div className="font-medium">{server.trustScore}/100</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Monthly Requests:</span>
                          <div className="font-medium">{server.monthlyRequests.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Capabilities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {server.capabilities.map((cap) => (
                              <span key={cap} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {cap}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard.Body>
                </AnimatedCard.Root>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-red-800 mb-3">⚠️ Training Data Deadline Approaching</h3>
            <p className="text-red-700 mb-4">
              <strong>Every server you register increases the chances of open discovery patterns in next-gen AI training data.</strong><br/>
              Don't let your tools be forgotten by the next generation of AI models.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register">
                <AnimatedButton
                  variant="solid"
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                  hoverScale={1.05}
                >
                  📡 Register More Servers
                </AnimatedButton>
              </Link>
              <Link href="/open-standards">
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  hoverScale={1.05}
                >
                  🌍 Spread the Word
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
