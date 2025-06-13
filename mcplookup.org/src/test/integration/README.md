# Integration Tests

This directory contains comprehensive integration tests for the MCPLookup.org platform. These tests verify that all services work correctly with the in-memory storage backend and can handle real-world scenarios.

## Test Coverage

### 🗄️ Storage Service (`storage.test.ts`)
- **Basic CRUD Operations**: Create, read, update, delete operations
- **Batch Operations**: Bulk retrieval and prefix-based queries
- **Multiple Collections**: Data isolation between different collections
- **Health Checks**: Storage system health monitoring
- **Complex Data Types**: Nested objects, arrays, null/undefined values
- **Helper Functions**: Success/error result handling

**Tests**: 8 tests covering all storage functionality

### 📊 Analytics Service (`analytics.test.ts`)
- **Event Tracking**: Page views, user actions, API usage, server operations
- **Metrics Calculation**: Analytics metrics, performance metrics, user behavior
- **Data Filtering**: By category, action, user, date range
- **Error Handling**: Storage failures, malformed data
- **Real-time Integration**: Live metric updates

**Tests**: 8 tests covering comprehensive analytics functionality

### 🔄 Cross-Service Integration (`cross-service.test.ts`)
- **Multi-Session Tracking**: User journeys across multiple sessions
- **Concurrent Operations**: Multiple users, high-volume data processing
- **Performance Testing**: 1000+ events, load testing, consistency checks
- **Error Recovery**: Partial failures, complete storage failures
- **Data Integrity**: Concurrent operations, unique constraints

**Tests**: 7 tests covering service integration and performance

## Running Tests

### Run All Integration Tests
```bash
npm run test:integration
```

### Watch Mode (Development)
```bash
npm run test:integration:watch
```

### UI Mode (Interactive)
```bash
npm run test:integration:ui
```

### Run All Tests (Unit + Integration)
```bash
npm run test:all
```

## Test Environment

- **Storage Backend**: In-memory storage (zero configuration)
- **Test Framework**: Vitest with happy-dom environment
- **Mocking**: Console methods, external APIs
- **Isolation**: Fresh storage instance for each test

## Performance Benchmarks

Based on integration test results:

- **Storage Operations**: 1000+ operations in <10 seconds
- **Analytics Processing**: 1000 events in <10 seconds
- **Concurrent Operations**: 100+ concurrent operations without data corruption
- **Memory Usage**: Efficient in-memory storage with health monitoring

## Key Features Tested

### ✅ Zero Configuration
- Tests run with no external dependencies
- In-memory storage works out of the box
- No Redis, database, or external services required

### ✅ Real-World Scenarios
- User registration and server management flows
- Multi-session user journeys
- High-volume analytics processing
- Concurrent user operations

### ✅ Error Resilience
- Graceful handling of storage failures
- Recovery from partial system failures
- Data consistency under error conditions
- Comprehensive error logging

### ✅ Performance Validation
- Load testing with 1000+ operations
- Concurrent operation safety
- Memory efficiency validation
- Response time benchmarking

## Test Data Patterns

The tests use realistic data patterns:

- **Users**: Multiple user IDs with different usage patterns
- **Sessions**: Multi-session user journeys
- **Events**: Page views, actions, API calls, registrations
- **Domains**: Realistic domain names and server configurations
- **Timestamps**: Proper time-based filtering and ordering

## Continuous Integration

These integration tests are designed to:

1. **Validate Core Functionality**: Ensure all services work correctly
2. **Catch Regressions**: Detect breaking changes early
3. **Performance Monitoring**: Track system performance over time
4. **Documentation**: Serve as living examples of system usage

## Adding New Tests

When adding new integration tests:

1. **Follow Naming Convention**: `service-name.test.ts`
2. **Use Realistic Data**: Mirror production usage patterns
3. **Test Error Cases**: Include failure scenarios
4. **Verify Performance**: Add performance assertions where relevant
5. **Clean Up**: Use `beforeEach` to reset state

## Debugging Tests

For debugging failed tests:

1. **Check Console Output**: Tests log performance metrics
2. **Use Watch Mode**: `npm run test:integration:watch`
3. **Enable UI Mode**: `npm run test:integration:ui`
4. **Add Debug Logs**: Temporary console.log statements
5. **Isolate Tests**: Run specific test files

## Future Enhancements

Planned improvements:

- **Redis Integration Tests**: Test with actual Redis backend
- **API Endpoint Tests**: Full HTTP request/response testing
- **WebSocket Tests**: Real-time functionality testing
- **Security Tests**: Authentication and authorization flows
- **Migration Tests**: Data migration and schema changes
