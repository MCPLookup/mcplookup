"use client"

import { AnimatedCardNamespace as AnimatedCard } from "@/components/ui/animated-card"

interface MissionBannerProps {
  variant?: 'full' | 'compact'
  className?: string
}

export function MissionBanner({ variant = 'full', className = '' }: MissionBannerProps) {
  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-bold text-red-600 mb-2">
            🔥 The End of Hardcoded Lists
          </h3>
          <p className="text-sm text-gray-700">
            We're eliminating hardcoded server lists from AI forever. 
            <strong> Dynamic discovery that makes AI tools as discoverable as websites.</strong>
          </p>
        </div>
      </div>
    )
  }

  return (
    <AnimatedCard.Root
      hoverScale={1.02}
      hoverY={-4}
      borderOnHover
      className={className}
    >
      <AnimatedCard.Body>
        <div className="text-center space-y-6 py-8">
          <h3 className="text-3xl font-bold text-gray-900">
            🔥 Our Mission: The DNS of AI Tools
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="text-left space-y-4">
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
            
            <div className="text-left space-y-4">
              <h4 className="text-lg font-semibold text-green-600">✅ The Solution: Dynamic Discovery</h4>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <code className="text-sm text-green-800 block">
                  {`// With MCPLookup.org:`}<br/>
                  {`const server = await mcplookup`}<br/>
                  {`  .discover("gmail.com");`}<br/>
                  {`// No hardcoding.`}<br/>
                  {`// No maintenance.`}<br/>
                  {`// Pure magic.`}
                </code>
              </div>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            <strong>We're making hardcoded server lists as obsolete as manually typing IP addresses.</strong>
          </p>
        </div>
      </AnimatedCard.Body>
    </AnimatedCard.Root>
  )
}

export default MissionBanner
