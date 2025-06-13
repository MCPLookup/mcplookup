// New Clean MCP Route - Refactored for maintainability and testability
// Replaces the monolithic 1000+ line route with clean architecture

import { createMCPHandler } from '@/lib/mcp/route-factory';

// Create the MCP handler using the factory
const handler = createMCPHandler();

// Export the handler for all HTTP methods
export { handler as GET, handler as POST, handler as DELETE };

/**
 * This new route implementation provides:
 * 
 * ✅ CLEAN ARCHITECTURE:
 * - Separation of concerns with individual tool classes
 * - Dependency injection for loose coupling
 * - Single responsibility principle
 * 
 * ✅ TESTABILITY:
 * - Easy to mock services for testing
 * - Individual tools can be tested in isolation
 * - Clear interfaces and contracts
 * 
 * ✅ MAINTAINABILITY:
 * - DRY principle - no code duplication
 * - Easy to add new tools
 * - Clear error handling patterns
 * 
 * ✅ SCALABILITY:
 * - Tool registry for dynamic tool management
 * - Service container for dependency management
 * - Modular architecture for easy extension
 * 
 * The old monolithic route (route.ts) can be gradually migrated
 * by implementing the remaining tools and then switching over.
 */
