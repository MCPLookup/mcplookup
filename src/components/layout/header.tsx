"use client"

// Header Component
// Enhanced header with mobile menu and dark mode toggle

import Link from 'next/link'
import { useState } from 'react'
import { FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa'
import { ColorModeButton } from '@/components/ui/color-mode'
import { SignInButton } from '@/components/auth/signin-button'
import { useSession, signOut } from 'next-auth/react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  const navigation = [
    { name: 'Discover', href: '/discover' },
    { name: 'How to Use', href: '/how-to-use' },
    { name: 'Register', href: '/register' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Open Standards', href: '/open-standards' },
    { name: 'API', href: '/api/docs' },
  ]

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl">🔍</div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  MCPLookup.org
                </span>
                <span className="text-xs text-red-600 dark:text-red-400 font-bold hidden sm:block animate-pulse">
                  🚨 THE REACT MOMENT - 12 MONTHS LEFT
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium"
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
                <div className="relative group">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer">
                    {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      <div className="font-medium">{session.user?.name}</div>
                      <div className="text-gray-500">{session.user?.email}</div>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
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
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {session.user?.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {session.user?.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                    >
                      Sign out
                    </button>
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
