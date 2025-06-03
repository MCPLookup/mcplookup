// Header Component
// Simple header for the MCP Lookup application

import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              MCPLookup.org
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href="/discover" className="text-gray-500 hover:text-gray-900">
              Discover
            </Link>
            <Link href="/register" className="text-gray-500 hover:text-gray-900">
              Register
            </Link>
            <Link href="/docs" className="text-gray-500 hover:text-gray-900">
              Docs
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/api/docs"
              className="text-gray-500 hover:text-gray-900"
            >
              API
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
