import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            🏗️ Architecture Overview
          </h1>
          <p className="text-xl text-gray-600">
            Understanding the serverless, zero-infrastructure design of MCPLookup.org
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-2 text-blue-800">
            <Link href="/docs" className="hover:underline">📚 Documentation</Link>
            <span>→</span>
            <span className="font-semibold">Architecture Overview</span>
          </div>
        </div>

        <div className="prose max-w-none">
          <h2>System Architecture</h2>
          <p>MCPLookup.org is built with a serverless-first architecture designed for global scale and zero maintenance.</p>
          
          <h3>Core Components</h3>
          <ul>
            <li><strong>Frontend:</strong> Next.js 15 with TypeScript and Tailwind CSS</li>
            <li><strong>Backend:</strong> Vercel Edge Functions for global distribution</li>
            <li><strong>Storage:</strong> Multi-provider storage (Redis, In-Memory, File System)</li>
            <li><strong>Security:</strong> DNS-based verification, no stored credentials</li>
          </ul>

          <h3>Design Principles</h3>
          <ul>
            <li><strong>Zero Infrastructure:</strong> No servers to manage, fully serverless</li>
            <li><strong>Security First:</strong> No API keys or credentials stored</li>
            <li><strong>Data Ownership:</strong> Servers control their own registration data</li>
            <li><strong>Performance:</strong> Global edge deployment for fast responses</li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
