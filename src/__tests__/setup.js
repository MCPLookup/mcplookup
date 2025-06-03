// Jest setup file
// Configure test environment and global mocks

// Mock fetch for testing
global.fetch = jest.fn();

// Mock AbortSignal.timeout for Node.js compatibility
if (!global.AbortSignal.timeout) {
  global.AbortSignal.timeout = (delay) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), delay);
    return controller.signal;
  };
}

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
