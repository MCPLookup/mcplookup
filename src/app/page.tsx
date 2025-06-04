"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SignInButton } from "@/components/auth/signin-button"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCardNamespace as AnimatedCard, AnimatedList } from "@/components/ui/animated-card"
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

          <h2 className="text-3xl font-semibold text-slate-700 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Professional MCP Discovery Service
          </h2>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Enterprise-grade Model Context Protocol server discovery and registration.
            Secure, scalable, and built for professional AI development teams.
          </p>

          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/discover">
                <AnimatedButton
                  variant="primary"
                  size="lg"
                  hoverScale={1.02}
                  clickScale={0.98}
                  rippleEffect
                  className="min-w-[160px]"
                >
                  Discover Servers
                </AnimatedButton>
              </Link>
              <Link href="/register">
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  hoverScale={1.02}
                  clickScale={0.98}
                  rippleEffect
                  className="min-w-[160px]"
                >
                  Register Server
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <AnimatedList staggerDelay={0.1} direction="up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <AnimatedCard.Root
              hoverScale={1.02}
              hoverY={-4}
              borderOnHover
              staggerDelay={0}
            >
              <AnimatedCard.Body>
                <div className="text-center p-2">
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="text-2xl text-blue-600">🔍</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900">Discovery</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Find MCP servers by domain, capability, or intent with advanced search
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
                <div className="text-center p-2">
                  <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="text-2xl text-green-600">📝</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900">Registration</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Register your MCP server with secure DNS verification
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
                <div className="text-center p-2">
                  <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center">
                    <div className="text-2xl text-purple-600">🛡️</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900">Security</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Enterprise-grade security with cryptographic verification
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
                <div className="text-center p-2">
                  <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="text-2xl text-slate-600">🌐</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900">Global Scale</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Serverless architecture built for worldwide deployment
                  </p>
                </div>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </div>
        </AnimatedList>

        {/* Stats */}
        <AnimatedCard.Root
          hoverScale={1.01}
          hoverY={-2}
          borderOnHover
          staggerDelay={0.4}
        >
          <AnimatedCard.Body>
            <div className="text-center space-y-8 py-4">
              <h3 className="text-2xl font-semibold text-slate-900 animate-fade-in-up" style={{ animationDelay: '1.6s' }}>
                Trusted by Development Teams
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center animate-scale-in" style={{ animationDelay: '1.8s' }}>
                  <div className="text-4xl font-bold text-blue-600 mb-2">1,247</div>
                  <div className="text-sm text-slate-600 font-medium">Registered Servers</div>
                </div>
                <div className="text-center animate-scale-in" style={{ animationDelay: '2.0s' }}>
                  <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
                  <div className="text-sm text-slate-600 font-medium">Service Uptime</div>
                </div>
                <div className="text-center animate-scale-in" style={{ animationDelay: '2.2s' }}>
                  <div className="text-4xl font-bold text-purple-600 mb-2">847</div>
                  <div className="text-sm text-slate-600 font-medium">Verified Domains</div>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>
      </div>

      <Footer />
    </div>
  )
}
