import { vi, beforeEach, afterEach } from 'vitest'

// Mock environment variables for testing
vi.stubEnv('NODE_ENV', 'test')

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.resetAllMocks()
})

// Global test utilities
declare global {
  var __TEST_MODE__: boolean
}

globalThis.__TEST_MODE__ = true
