"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedButton } from "@/components/ui/animated-button"
import AnimatedCard, { AnimatedList } from "@/components/ui/animated-card"
import { DashboardWalkthrough } from "@/components/onboarding/dashboard-walkthrough"
import { ApiKeysTab } from "@/components/dashboard/api-keys-tab"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('servers')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      // Check if onboarding is forced via URL parameter
      const forceOnboarding = searchParams.get('onboarding') === 'true'

      if (forceOnboarding) {
        setShowOnboarding(true)
        setNeedsOnboarding(true)
        return
      }

      // Check if user needs onboarding
      const response = await fetch('/api/v1/onboarding')
      const data = await response.json()

      if (data.success && data.needsOnboarding) {
        setShowOnboarding(true)
        setNeedsOnboarding(true)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setNeedsOnboarding(false)
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
    setNeedsOnboarding(false)
  }

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

      {/* Onboarding Walkthrough */}
      <DashboardWalkthrough
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />

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
            { id: 'api-keys', label: '🔑 API Keys', count: null },
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
              <div className="flex space-x-3">
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  hoverScale={1.05}
                  onClick={() => window.location.reload()}
                >
                  🔄 Refresh Status
                </AnimatedButton>
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
            </div>

            {/* Training Data Alert */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl animate-pulse">⚠️</div>
                <div>
                  <h3 className="font-bold text-red-800">Training Data Window Closing</h3>
                  <p className="text-red-700 text-sm">
                    <strong>Every server you register increases the chances of open discovery patterns in next-gen AI training data.</strong>
                    Register more servers to strengthen the open standards signal.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {userServers.map((server) => (
                <AnimatedCard.Root key={server.id} hoverScale={1.01} borderOnHover>
                  <AnimatedCard.Body>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{server.domain}</h3>
                            {server.verified && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                ✅ Verified
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                              server.status === 'healthy'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                server.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                              }`}></div>
                              {server.status === 'healthy' ? 'Healthy' : 'Warning'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                            {server.endpoint}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AnimatedButton
                            variant="outline"
                            size="sm"
                            hoverScale={1.05}
                            className="text-xs"
                          >
                            📊 Analytics
                          </AnimatedButton>
                          <AnimatedButton
                            variant="outline"
                            size="sm"
                            hoverScale={1.05}
                            className="text-xs"
                          >
                            ⚙️ Settings
                          </AnimatedButton>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Last Seen</div>
                          <div className="font-medium text-sm">{server.lastSeen}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Trust Score</div>
                          <div className="font-medium text-sm flex items-center">
                            {server.trustScore}/100
                            <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  server.trustScore >= 90 ? 'bg-green-500' :
                                  server.trustScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${server.trustScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Monthly Requests</div>
                          <div className="font-medium text-sm">{server.monthlyRequests.toLocaleString()}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Discovery Impact</div>
                          <div className="font-medium text-sm text-green-600">
                            {server.verified ? 'High' : 'Medium'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-2">Capabilities:</div>
                        <div className="flex flex-wrap gap-2">
                          {server.capabilities.map((cap) => (
                            <span key={cap} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Training Data Contribution */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-700">Training Data Contribution:</div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              server.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {server.verified ? '🎯 Active' : '⏳ Pending'}
                            </span>
                          </div>
                          {!server.verified && (
                            <AnimatedButton
                              variant="solid"
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-xs"
                              hoverScale={1.05}
                            >
                              🚀 Verify Now
                            </AnimatedButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard.Body>
                </AnimatedCard.Root>
              ))}
            </div>

            {/* Add Server CTA */}
            <AnimatedCard.Root hoverScale={1.02} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">➕</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Register More Servers</h3>
                  <p className="text-gray-600 mb-4">
                    Every additional server strengthens the open discovery signal in AI training data.
                  </p>
                  <Link href="/register">
                    <AnimatedButton
                      variant="solid"
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                      hoverScale={1.05}
                    >
                      📡 Register Another Server
                    </AnimatedButton>
                  </Link>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </div>
        )}

        {/* Domains Tab */}
        {activeTab === 'domains' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Domain Management</h2>
              <AnimatedButton
                variant="solid"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                hoverScale={1.05}
                onClick={() => {
                  const domain = prompt('Enter domain to verify:')
                  if (domain) {
                    // Start domain verification using new system
                    fetch('/api/v1/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ domain })
                    }).then(res => res.json()).then(data => {
                      if (data.success) {
                        alert(`Add this TXT record:\nName: _mcplookup.${domain}\nValue: ${data.challenge.txtRecord}`)
                        window.location.reload()
                      } else {
                        alert(`Error: ${data.error}`)
                      }
                    })
                  }
                }}
              >
                ➕ Verify New Domain
              </AnimatedButton>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <h3 className="font-bold text-yellow-800 mb-2 flex items-center">
                🔐 Domain Verification Boosts Training Data Impact
              </h3>
              <p className="text-yellow-700 text-sm">
                <strong>Verified domains have higher trust scores and stronger signals in AI training data.</strong>
                Add a TXT record or upload a verification file to prove ownership.
              </p>
            </div>

            <div className="space-y-4">
              {['mycompany.com', 'dev.mycompany.com'].map((domain, index) => (
                <AnimatedCard.Root key={domain} hoverScale={1.01} borderOnHover>
                  <AnimatedCard.Body>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-bold text-gray-900">{domain}</h3>
                          {index === 0 ? (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                              ✅ Verified
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                              ⏳ Pending
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <AnimatedButton variant="outline" size="sm" hoverScale={1.05}>
                            🔧 Manage
                          </AnimatedButton>
                          {index !== 0 && (
                            <AnimatedButton variant="solid" size="sm" className="bg-blue-600" hoverScale={1.05}>
                              ✅ Complete Verification
                            </AnimatedButton>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Verification Method</div>
                          <div className="font-medium text-sm">
                            {index === 0 ? 'DNS TXT Record' : 'File Upload'}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Trust Impact</div>
                          <div className="font-medium text-sm">
                            {index === 0 ? '+15 points' : '+0 points (pending)'}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Training Data Weight</div>
                          <div className="font-medium text-sm">
                            {index === 0 ? 'High' : 'Low (unverified)'}
                          </div>
                        </div>
                      </div>

                      {index !== 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="font-bold text-blue-800 text-sm mb-2">🚀 Complete Verification to Boost Impact</h4>
                            <p className="text-blue-700 text-xs">
                              Unverified domains have lower trust scores and weaker signals in AI training data.
                              Complete verification to maximize your contribution to open standards.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </AnimatedCard.Body>
                </AnimatedCard.Root>
              ))}
            </div>

            {/* Add Domain CTA */}
            <AnimatedCard.Root hoverScale={1.02} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">🌐</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Verify More Domains</h3>
                  <p className="text-gray-600 mb-4">
                    Each verified domain strengthens your servers' trust scores and training data impact.
                  </p>
                  <AnimatedButton
                    variant="solid"
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                    hoverScale={1.05}
                  >
                    🔐 Add Domain Verification
                  </AnimatedButton>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <ApiKeysTab />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Impact</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatedCard.Root hoverScale={1.01} borderOnHover>
                <AnimatedCard.Body>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      📈 Discovery Trends
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Live</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">This Week</span>
                        <span className="font-medium text-green-600">+23% requests</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Top Capability</span>
                        <span className="font-medium">email (67%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Peak Hours</span>
                        <span className="font-medium">9-11 AM UTC</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Training Data Impact</span>
                        <span className="font-medium text-blue-600">High</span>
                      </div>
                    </div>
                  </div>
                </AnimatedCard.Body>
              </AnimatedCard.Root>

              <AnimatedCard.Root hoverScale={1.01} borderOnHover>
                <AnimatedCard.Body>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      🎯 Performance Metrics
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Real-time</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Avg Response Time</span>
                        <span className="font-medium text-green-600">127ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Uptime</span>
                        <span className="font-medium text-green-600">99.8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Error Rate</span>
                        <span className="font-medium text-green-600">0.2%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Discovery Success</span>
                        <span className="font-medium text-green-600">94.3%</span>
                      </div>
                    </div>
                  </div>
                </AnimatedCard.Body>
              </AnimatedCard.Root>
            </div>

            {/* Training Data Impact */}
            <AnimatedCard.Root hoverScale={1.01} borderOnHover>
              <AnimatedCard.Body>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">🤖 Training Data Impact Analysis</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-blue-800 mb-2">Your Contribution to Open Standards</h4>
                    <p className="text-blue-700 text-sm">
                      Your servers are contributing to the open discovery pattern in AI training data.
                      This helps ensure future AI models learn open standards instead of proprietary silos.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">18,660</div>
                      <div className="text-sm text-gray-600">Discovery Requests</div>
                      <div className="text-xs text-green-600">Contributing to training data</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">2</div>
                      <div className="text-sm text-gray-600">Verified Servers</div>
                      <div className="text-xs text-blue-600">High-quality signals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">85%</div>
                      <div className="text-sm text-gray-600">Trust Score</div>
                      <div className="text-xs text-purple-600">Above average</div>
                    </div>
                  </div>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile & Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatedCard.Root hoverScale={1.01} borderOnHover>
                <AnimatedCard.Body>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Account Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          defaultValue="John Developer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          defaultValue="john@mycompany.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Organization
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          defaultValue="My Company Inc."
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <AnimatedButton
                        variant="solid"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        hoverScale={1.05}
                      >
                        💾 Save Changes
                      </AnimatedButton>
                    </div>
                  </div>
                </AnimatedCard.Body>
              </AnimatedCard.Root>

              <AnimatedCard.Root hoverScale={1.01} borderOnHover>
                <AnimatedCard.Body>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🔔 Notification Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Server Health Alerts</div>
                          <div className="text-sm text-gray-600">Get notified when servers go down</div>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Discovery Milestones</div>
                          <div className="text-sm text-gray-600">Celebrate request milestones</div>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Training Data Updates</div>
                          <div className="text-sm text-gray-600">News about AI training progress</div>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Open Standards News</div>
                          <div className="text-sm text-gray-600">Updates on the React moment</div>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </div>
                  </div>
                </AnimatedCard.Body>
              </AnimatedCard.Root>
            </div>
          </div>
        )}

        {/* Emergency Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400 rounded-lg p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="text-3xl animate-bounce">⚠️</div>
              <h3 className="text-2xl font-bold text-red-800">Training Data Deadline Approaching</h3>
              <div className="text-3xl animate-bounce">⚠️</div>
            </div>
            <p className="text-lg text-red-700 mb-6">
              <strong>Every server you register increases the chances of open discovery patterns in next-gen AI training data.</strong><br/>
              Don't let your tools be forgotten by the next generation of AI models.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">6</div>
                <div className="text-sm text-red-700">Months Left</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{stats.totalServers}</div>
                <div className="text-sm text-orange-700">Your Servers</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{stats.totalRequests.toLocaleString()}</div>
                <div className="text-sm text-green-700">Training Signals</div>
              </div>
            </div>
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
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  🌍 Join the Movement
                </AnimatedButton>
              </Link>
              <Link href="/how-to-use">
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  hoverScale={1.05}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  🌉 Setup Bridge
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
