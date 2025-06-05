"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedButton } from "@/components/ui/animated-button"
import AnimatedCard, { AnimatedList } from "@/components/ui/animated-card"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalServers: 89,
    verifiedServers: 67,
    pendingVerifications: 22,
    activeUsers: 892,
    registrationsToday: 23,
    trainingDataSignals: 156420,
    openStandardsAdoption: 78
  })

  const [recentActivity] = useState([
    { type: 'registration', message: 'New server registered: gmail.com/api/mcp', time: '2 minutes ago', severity: 'success' },
    { type: 'verification', message: 'Domain verified: slack.com', time: '5 minutes ago', severity: 'success' },
    { type: 'alert', message: 'Training data milestone: 150k signals reached', time: '12 minutes ago', severity: 'info' },
    { type: 'user', message: 'New user registration: developer@anthropic.com', time: '18 minutes ago', severity: 'success' },
    { type: 'warning', message: 'Server health check failed: dev.example.com', time: '25 minutes ago', severity: 'warning' }
  ])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto py-20 px-4">
        {/* EMERGENCY ADMIN BANNER */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white text-center py-6 mb-12 rounded-lg animate-pulse">
          <div className="flex items-center justify-center space-x-4 mb-3">
            <div className="text-3xl animate-bounce">👑</div>
            <h1 className="text-2xl font-bold">ADMIN MISSION CONTROL - THE REACT MOMENT</h1>
            <div className="text-3xl animate-bounce">👑</div>
          </div>
          <p className="text-lg font-medium">
            <strong>MONITORING THE FIGHT FOR OPEN STANDARDS</strong>
          </p>
          <p className="text-sm mt-2">
            Every registration, every verification, every signal matters for the training data
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Real-time monitoring of the open standards movement
          </p>
        </div>

        {/* Critical Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <AnimatedCard.Root hoverScale={1.02} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-3xl text-red-600 mb-2 animate-pulse">🎯</div>
                <div className="text-2xl font-bold text-gray-900">{stats.trainingDataSignals.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Training Data Signals</div>
                <div className="text-xs text-red-600 font-medium mt-1">Critical for AI training</div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.02} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-3xl text-blue-600 mb-2">🖥️</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalServers}</div>
                <div className="text-sm text-gray-600">Total MCP Servers</div>
                <div className="text-xs text-green-600 font-medium mt-1">+{stats.registrationsToday} today</div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.02} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-3xl text-green-600 mb-2">✅</div>
                <div className="text-2xl font-bold text-gray-900">{stats.verifiedServers}</div>
                <div className="text-sm text-gray-600">Verified Servers</div>
                <div className="text-xs text-blue-600 font-medium mt-1">{Math.round((stats.verifiedServers/stats.totalServers)*100)}% verified</div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.02} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-3xl text-purple-600 mb-2">👥</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-xs text-orange-600 font-medium mt-1">{stats.activeUsers} active</div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>
        </div>

        {/* React Moment Progress */}
        <AnimatedCard.Root hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-red-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">⚠️</span>
                React Moment Progress Tracker
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-bold text-red-800 mb-2">🕐 Time Remaining</h4>
                  <div className="text-2xl font-bold text-red-600">6 months</div>
                  <div className="text-sm text-red-700">Until training cutoff</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">📊 Open Standards Adoption</h4>
                  <div className="text-2xl font-bold text-blue-600">{stats.openStandardsAdoption}%</div>
                  <div className="text-sm text-blue-700">vs proprietary solutions</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">🎯 Training Impact</h4>
                  <div className="text-2xl font-bold text-green-600">High</div>
                  <div className="text-sm text-green-700">Signal strength</div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <h4 className="font-bold text-yellow-800 mb-2">🚨 Critical Actions Needed</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• <strong>{stats.pendingVerifications} domains</strong> need verification (higher trust scores)</li>
                  <li>• <strong>Industry leaders</strong> need to build native discovery (kill the bridge)</li>
                  <li>• <strong>Developer outreach</strong> to increase registration rate</li>
                  <li>• <strong>Training data quality</strong> monitoring and optimization</li>
                </ul>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/admin/users">
            <AnimatedCard.Root hoverScale={1.05} borderOnHover>
              <AnimatedCard.Body>
                <div className="text-center p-6 cursor-pointer">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">User Management</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Manage user accounts and permissions
                  </p>
                  <div className="bg-blue-50 p-2 rounded text-xs text-blue-700">
                    {stats.totalUsers.toLocaleString()} users
                  </div>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </Link>

          <AnimatedCard.Root hoverScale={1.05} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6 cursor-pointer">
                <div className="text-4xl mb-4">🖥️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Server Management</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Monitor and verify MCP servers
                </p>
                <div className="bg-green-50 p-2 rounded text-xs text-green-700">
                  {stats.totalServers} servers
                </div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.05} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6 cursor-pointer">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Training data and adoption metrics
                </p>
                <div className="bg-purple-50 p-2 rounded text-xs text-purple-700">
                  Real-time data
                </div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.05} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6 cursor-pointer">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">System Settings</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure system parameters
                </p>
                <div className="bg-orange-50 p-2 rounded text-xs text-orange-700">
                  Admin only
                </div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard.Root hoverScale={1.01} borderOnHover>
            <AnimatedCard.Body>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  📈 Recent Activity
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Live</span>
                </h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.severity === 'success' ? 'bg-green-500' :
                        activity.severity === 'warning' ? 'bg-yellow-500' :
                        activity.severity === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.01} borderOnHover>
            <AnimatedCard.Body>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Priority Actions</h3>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-bold text-red-800 text-sm mb-2">🚨 Urgent: Verification Backlog</h4>
                    <p className="text-red-700 text-xs mb-3">
                      {stats.pendingVerifications} domains awaiting verification. Each verified domain strengthens training data signals.
                    </p>
                    <AnimatedButton
                      variant="solid"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-xs"
                      hoverScale={1.05}
                    >
                      🔍 Review Pending
                    </AnimatedButton>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-800 text-sm mb-2">📞 Industry Outreach</h4>
                    <p className="text-blue-700 text-xs mb-3">
                      Contact Anthropic, OpenAI, Cursor team about native discovery integration.
                    </p>
                    <AnimatedButton
                      variant="solid"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-xs"
                      hoverScale={1.05}
                    >
                      📧 Send Outreach
                    </AnimatedButton>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-bold text-green-800 text-sm mb-2">📊 Training Data Quality</h4>
                    <p className="text-green-700 text-xs mb-3">
                      Monitor signal quality and optimize for maximum training impact.
                    </p>
                    <AnimatedButton
                      variant="solid"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-xs"
                      hoverScale={1.05}
                    >
                      📈 View Analytics
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>
        </div>

        {/* Emergency Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400 rounded-lg p-8 max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-red-800 mb-4">⚠️ Admin Mission: Save the Open Web</h3>
            <p className="text-lg text-red-700 mb-6">
              <strong>As an admin, you're on the front lines of the React moment.</strong><br/>
              Every action you take influences whether open standards or corporate silos win the training data.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{stats.pendingVerifications}</div>
                <div className="text-sm text-red-700">Pending Verifications</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{stats.registrationsToday}</div>
                <div className="text-sm text-blue-700">Registrations Today</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{stats.trainingDataSignals.toLocaleString()}</div>
                <div className="text-sm text-green-700">Training Signals</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/admin/users">
                <AnimatedButton
                  variant="solid"
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                  hoverScale={1.05}
                >
                  👥 Manage Users
                </AnimatedButton>
              </Link>
              <AnimatedButton
                variant="outline"
                size="lg"
                hoverScale={1.05}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                🖥️ Monitor Servers
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                size="lg"
                hoverScale={1.05}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                📊 View Analytics
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
