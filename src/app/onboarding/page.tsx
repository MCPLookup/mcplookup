"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedButton } from "@/components/ui/animated-button"
import AnimatedCard, { AnimatedList } from "@/components/ui/animated-card"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSkipOnboarding = async () => {
    setLoading(true)
    try {
      // Skip onboarding API call
      await fetch('/api/v1/onboarding/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      // Still redirect to dashboard
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleStartOnboarding = async () => {
    setLoading(true)
    try {
      // Initialize onboarding
      await fetch('/api/v1/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      router.push('/dashboard?onboarding=true')
    } catch (error) {
      console.error('Error starting onboarding:', error)
      // Still redirect to dashboard with onboarding
      router.push('/dashboard?onboarding=true')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-5xl mx-auto py-20 px-4">
        {/* EMERGENCY WELCOME */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white text-center py-8 mb-12 rounded-lg animate-pulse">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-4xl animate-bounce">🚨</div>
            <h1 className="text-3xl font-bold">WELCOME TO THE REACT MOMENT</h1>
            <div className="text-4xl animate-bounce">🚨</div>
          </div>
          <p className="text-xl font-medium mb-2">
            <strong>6 MONTHS TO SAVE THE OPEN WEB</strong>
          </p>
          <p className="text-sm">
            Your participation in the next 5 minutes could influence AI development for the next decade
          </p>
        </div>

        {/* Welcome Content */}
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">
            🎯 Ready to Join the Fight?
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            <strong>You're about to contribute to the most important moment in AI development.</strong><br/>
            Let's get you set up to register your MCP servers and strengthen open standards.
          </p>
        </div>

        {/* Two Paths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Guided Setup */}
          <AnimatedCard.Root hoverScale={1.02} borderOnHover>
            <AnimatedCard.Body>
              <div className="p-8 text-center">
                <div className="text-6xl mb-6">🎯</div>
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  Guided Setup (Recommended)
                </h3>
                <p className="text-gray-600 mb-6">
                  <strong>5-minute walkthrough</strong> to verify your domain, register your first MCP server, 
                  and understand your impact on AI training data.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-green-800 mb-2">🚀 What You'll Do:</h4>
                  <ul className="text-sm text-green-700 text-left space-y-1">
                    <li>• ⚡ Learn why this matters (30 seconds)</li>
                    <li>• 🔐 Verify domain ownership (2 minutes)</li>
                    <li>• 📡 Register your MCP server (2 minutes)</li>
                    <li>• 🎯 See your training data impact (30 seconds)</li>
                  </ul>
                </div>

                <AnimatedButton
                  variant="solid"
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700"
                  hoverScale={1.05}
                  onClick={handleStartOnboarding}
                  disabled={loading}
                >
                  🚀 Start 5-Minute Setup
                </AnimatedButton>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          {/* Skip to Dashboard */}
          <AnimatedCard.Root hoverScale={1.02} borderOnHover>
            <AnimatedCard.Body>
              <div className="p-8 text-center">
                <div className="text-6xl mb-6">⚡</div>
                <h3 className="text-2xl font-bold text-blue-600 mb-4">
                  Skip to Dashboard
                </h3>
                <p className="text-gray-600 mb-6">
                  <strong>I know what I'm doing.</strong> Take me straight to the dashboard 
                  where I can manage my servers and domain verifications.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-yellow-800 mb-2">⚠️ Remember:</h4>
                  <ul className="text-sm text-yellow-700 text-left space-y-1">
                    <li>• You must verify domain ownership first</li>
                    <li>• Then register MCP servers for verified domains</li>
                    <li>• Every server strengthens open standards</li>
                    <li>• 6 months left to influence AI training</li>
                  </ul>
                </div>

                <AnimatedButton
                  variant="outline"
                  size="lg"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                  hoverScale={1.05}
                  onClick={handleSkipOnboarding}
                  disabled={loading}
                >
                  ⚡ Skip to Dashboard
                </AnimatedButton>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>
        </div>

        {/* Crisis Context */}
        <AnimatedCard.Root hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-red-900 mb-6 text-center">
                ⏰ Why This Matters Right Now
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-bold text-red-800 mb-2">🕐 6 Months Left</h4>
                  <p className="text-red-700 text-sm">
                    GPT-5, Claude 4, and Gemini 2.0 are training NOW. 
                    Whatever discovery patterns exist in 6 months become permanent.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">🎯 Your Impact</h4>
                  <p className="text-blue-700 text-sm">
                    Every MCP server you register creates training signals for open discovery. 
                    Your servers help teach AI to use open standards.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">🌍 The Stakes</h4>
                  <p className="text-green-700 text-sm">
                    Open discovery vs. corporate silos. 
                    The patterns we establish now will define AI tool use for a decade.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-center">
                <p className="text-yellow-800 font-medium">
                  <strong>This is the React moment for AI tool discovery.</strong><br/>
                  Just like React defined UI development for a generation, 
                  the patterns we create now will define AI tool discovery for a generation.
                </p>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Quick Links */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Want to learn more before starting?
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/open-standards">
              <AnimatedButton
                variant="outline"
                size="sm"
                hoverScale={1.05}
              >
                🌍 Read About Open Standards
              </AnimatedButton>
            </Link>
            <Link href="/how-to-use">
              <AnimatedButton
                variant="outline"
                size="sm"
                hoverScale={1.05}
              >
                📖 How to Use Guide
              </AnimatedButton>
            </Link>
            <Link href="/discover">
              <AnimatedButton
                variant="outline"
                size="sm"
                hoverScale={1.05}
              >
                🔍 Explore Existing Servers
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
