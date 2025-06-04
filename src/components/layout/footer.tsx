"use client"

import Link from 'next/link'
import { FaGithub, FaTwitter, FaDiscord, FaHeart } from 'react-icons/fa'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-2xl">🔍</div>
              <span className="text-xl font-bold text-gray-900">MCPLookup.org</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              The universal discovery service for Model Context Protocol servers. 
              Zero infrastructure, serverless architecture, open source.
            </p>
            <div className="flex items-center space-x-1 text-gray-600">
              <span>Made with</span>
              <FaHeart className="text-red-500 text-sm" />
              <span>for the MCP community</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/discover" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Discover Servers
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Register Server
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Community
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://github.com/TSavo/mcplookup.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
                >
                  <FaGithub className="text-sm" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.gg/mcp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
                >
                  <FaDiscord className="text-sm" />
                  <span>Discord</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/mcplookup" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
                >
                  <FaTwitter className="text-sm" />
                  <span>Twitter</span>
                </a>
              </li>
              <li>
                <Link href="/status" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Service Status
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-600">
              <span>&copy; 2024 MCPLookup.org. All rights reserved.</span>
              <div className="flex space-x-6">
                <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/security" className="hover:text-gray-900 transition-colors">
                  Security
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Powered by</span>
              <div className="flex items-center space-x-2">
                <img 
                  src="https://vercel.com/favicon.ico" 
                  alt="Vercel" 
                  className="w-4 h-4"
                />
                <span>Vercel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
