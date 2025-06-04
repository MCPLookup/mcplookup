"use client"

// Header Component
// Enhanced header with mobile menu and dark mode toggle

import Link from 'next/link'
import { useState } from 'react'
import { FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa'
import { ColorModeButton } from '@/components/ui/color-mode'
import { SignInButton } from '@/components/auth/signin-button'
import { useSession } from 'next-auth/react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  const navigation = [
    { name: 'Discover', href: '/discover' },
    { name: 'Register', href: '/register' },
    { name: 'Docs', href: '/docs' },
    { name: 'API', href: '/api/docs' },
  ]

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl">🔍</div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                MCPLookup.org
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ColorModeButton />
            {!session && (
              <SignInButton
                size="sm"
                variant="outline"
                colorScheme="orange"
              />
            )}
            {session && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {session.user?.name || session.user?.email}
                </span>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ColorModeButton />
            <button
              type="button"
              className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Auth */}
              <div className="px-3 py-2">
                {!session ? (
                  <SignInButton
                    size="sm"
                    variant="outline"
                    colorScheme="orange"
                    width="full"
                  />
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {session.user?.name || session.user?.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header;
