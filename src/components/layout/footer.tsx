"use client"

import Link from 'next/link'
import { FaGithub, FaTwitter, FaDiscord, FaHeart } from 'react-icons/fa'

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-xl text-blue-600">🔍</div>
              <span className="text-xl font-semibold text-slate-900">MCPLookup.org</span>
            </div>
            <p className="text-slate-600 mb-4 max-w-md leading-relaxed">
              Professional Model Context Protocol server discovery and registration.
              Enterprise-grade security, global scale, serverless architecture.
            </p>
            <div className="flex items-center space-x-1 text-slate-600">
              <span>Built with</span>
              <FaHeart className="text-red-500 text-sm" />
              <span>for the developer community</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/discover" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Discover Servers
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Register Server
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api/docs" className="text-slate-600 hover:text-slate-900 transition-colors">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/TSavo/mcplookup.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors flex items-center space-x-2"
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
                  className="text-slate-600 hover:text-slate-900 transition-colors flex items-center space-x-2"
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
                  className="text-slate-600 hover:text-slate-900 transition-colors flex items-center space-x-2"
                >
                  <FaTwitter className="text-sm" />
                  <span>Twitter</span>
                </a>
              </li>
              <li>
                <Link href="/status" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Service Status
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-slate-600">
              <span>&copy; 2024 MCPLookup.org. All rights reserved.</span>
              <div className="flex space-x-6">
                <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-slate-900 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/security" className="hover:text-slate-900 transition-colors">
                  Security
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-slate-600">
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
