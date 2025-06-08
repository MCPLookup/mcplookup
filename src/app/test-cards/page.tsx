"use client"

import { Card, PathCard, FeatureCard, CodeCard } from "@/components/ui/readable-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import Link from "next/link"

export default function TestCardsPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100">
          Card Components Test
        </h1>

        {/* Basic Cards */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100">
            Basic Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card.Root variant="default">
              <Card.Header>Default Card</Card.Header>
              <Card.Body>This is a default card with proper text contrast.</Card.Body>
            </Card.Root>

            <Card.Root variant="elevated">
              <Card.Header>Elevated Card</Card.Header>
              <Card.Body>This is an elevated card with enhanced shadow.</Card.Body>
            </Card.Root>

            <Card.Root variant="outlined">
              <Card.Header>Outlined Card</Card.Header>
              <Card.Body>This is an outlined card with visible borders.</Card.Body>
            </Card.Root>
          </div>
        </section>

        {/* Path Cards */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100">
            Path Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PathCard
              icon={<span className="text-2xl">👨‍💻</span>}
              title="For Developers"
              description="Test path card for developers with proper contrast and readability."
              actions={
                <div className="space-y-2">
                  <AnimatedButton
                    variant="solid"
                    size="sm"
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                  >
                    Test Action
                  </AnimatedButton>
                </div>
              }
            />

            <PathCard
              icon={<span className="text-2xl">🛠️</span>}
              title="For Tool Creators"
              description="Test path card for tool creators with good text contrast."
              actions={
                <div className="space-y-2">
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    Test Action
                  </AnimatedButton>
                </div>
              }
            />

            <PathCard
              icon={<span className="text-2xl">🌟</span>}
              title="For Explorers"
              description="Test path card for explorers with readable text."
            />
          </div>
        </section>

        {/* Feature Cards */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100">
            Feature Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<span className="text-lg">🧠</span>}
              title="AI-Powered Search"
              description="Test feature card with proper text contrast and readability."
            />

            <FeatureCard
              icon={<span className="text-lg">🛡️</span>}
              title="DNS Verification"
              description="Another test feature card to verify contrast."
            />

            <FeatureCard
              icon={<span className="text-lg">💓</span>}
              title="Health Monitoring"
              description="Third test feature card for validation."
            />
          </div>
        </section>

        {/* Code Cards */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100">
            Code Cards
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CodeCard
              type="problem"
              title="Before: Manual Configuration"
              code={`<span class="text-gray-500">// Test problem code</span><br/>
<span class="text-blue-400">const</span> <span class="text-yellow-300">test</span> = "problem";`}
              features={[
                "Manual updates required",
                "Prone to errors",
                "Hard to maintain"
              ]}
            />

            <CodeCard
              type="solution"
              title="After: Automated Solution"
              code={`<span class="text-gray-500">// Test solution code</span><br/>
<span class="text-blue-400">const</span> <span class="text-yellow-300">test</span> = "solution";`}
              features={[
                "Automatic updates",
                "Error-free operation",
                "Easy maintenance"
              ]}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
