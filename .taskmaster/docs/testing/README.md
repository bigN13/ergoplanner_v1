# Testing Documentation

This document outlines the comprehensive testing strategy for the Ergoplanner AI Suite, covering unit tests, integration tests, performance tests, and end-to-end testing.

## Overview

The Ergoplanner testing framework is designed to ensure:
- **Code Quality**: 80%+ test coverage across all layers
- **Reliability**: Comprehensive test suites for critical business logic
- **Performance**: Load testing and performance benchmarks
- **Security**: Authentication, authorization, and input validation testing
- **User Experience**: End-to-end testing of user workflows

## Testing Pyramid

```
     /\        E2E Tests (10%)
    /  \       - Complete user workflows
   /    \      - Browser automation
  /______\     - Integration scenarios
 /        \
/  UNIT    \   Integration Tests (20%)
\ TESTS    /   - API endpoints
 \  (70%)  /   - Database integration
  \______/     - External service mocking
```

## Backend Testing (.NET Core)

### Test Projects

1. **Ergoplanner.UnitTests**
   - Domain entity testing
   - Business logic validation
   - Service layer testing
   - 95% coverage target for domain layer

2. **Ergoplanner.IntegrationTests**
   - API endpoint testing
   - Database integration
   - SignalR hub testing
   - External service integration

3. **Ergoplanner.PerformanceTests**
   - Load testing with NBomber
   - Performance benchmarks with BenchmarkDotNet
   - Stress testing scenarios

### Test Structure

```
backend/tests/
├── Ergoplanner.UnitTests/
│   ├── Domain/                    # Domain entity tests
│   ├── Application/               # Application service tests
│   ├── Infrastructure/            # Infrastructure tests
│   ├── Fixtures/                  # Test data builders
│   └── coverlet.runsettings       # Coverage configuration
├── Ergoplanner.IntegrationTests/
│   ├── Controllers/               # API endpoint tests
│   ├── Hubs/                     # SignalR hub tests
│   ├── Services/                 # Service integration tests
│   └── TestWebApplicationFactory.cs
└── Ergoplanner.PerformanceTests/
    ├── LoadTests/                # NBomber load tests
    └── Benchmarks/               # BenchmarkDotNet micro-benchmarks
```

### Running Backend Tests

```bash
# Run all tests
dotnet test

# Run unit tests with coverage
dotnet test tests/Ergoplanner.UnitTests --collect:"XPlat Code Coverage"

# Run integration tests
dotnet test tests/Ergoplanner.IntegrationTests

# Run performance tests
dotnet test tests/Ergoplanner.PerformanceTests

# Generate coverage report
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:"coverage-report"
```

### Test Categories

#### Domain Layer Tests (95% Coverage Target)
- **Entity Behavior**: Constructor validation, property constraints, business rules
- **Value Objects**: Equality, validation, immutability
- **Domain Events**: Event creation, serialization, handling
- **Specifications**: Business rule evaluation, composition

#### Application Layer Tests (90% Coverage Target)
- **Command Handlers**: Input validation, business logic orchestration
- **Query Handlers**: Data retrieval, filtering, projection
- **Services**: Business logic, external integrations
- **Validators**: Input validation rules

#### Infrastructure Layer Tests (80% Coverage Target)
- **Repositories**: Data access, query optimization
- **External Services**: API clients, file storage, email
- **Caching**: Redis integration, cache invalidation
- **Database**: Entity Framework configurations, migrations

## Frontend Testing (React/TypeScript)

### Test Configuration

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking
- **Playwright**: End-to-end testing

### Test Structure

```
frontend/tests/
├── unit/
│   ├── components/               # Component unit tests
│   ├── hooks/                   # Custom hook tests
│   ├── utils/                   # Utility function tests
│   └── store/                   # Redux store tests
├── integration/
│   ├── api/                     # API integration tests
│   └── features/                # Feature integration tests
├── e2e/
│   ├── drawing/                 # Drawing workflow tests
│   ├── collaboration/           # Real-time collaboration tests
│   └── approval/                # Approval workflow tests
├── __mocks__/                   # Mock implementations
├── utils/                       # Test utilities
├── setup.ts                     # Jest setup
└── globalSetup.ts              # Global test configuration
```

### Running Frontend Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test Button.test.tsx
```

### Frontend Test Categories

#### Component Tests (80% Coverage Target)
- **Rendering**: Props, state, conditional rendering
- **User Interactions**: Click, input, form submission
- **Accessibility**: ARIA attributes, keyboard navigation
- **Error Boundaries**: Error handling, fallback UI

#### Redux Store Tests
- **Actions**: Action creators, payloads
- **Reducers**: State transitions, immutability
- **Selectors**: Data selection, memoization
- **Middleware**: Async actions, side effects

#### Hook Tests
- **Custom Hooks**: Input/output behavior
- **State Management**: Local state, effects
- **API Integration**: Data fetching, error handling

## Integration Testing

### API Testing
- **Authentication**: Login, logout, token validation
- **Authorization**: Role-based access control
- **CRUD Operations**: Create, read, update, delete
- **Business Workflows**: End-to-end business processes

### Database Testing
- **Data Integrity**: Foreign key constraints, validation
- **Transactions**: Rollback scenarios, concurrency
- **Performance**: Query optimization, indexing
- **Migrations**: Schema changes, data migration

### Real-time Testing
- **SignalR Hubs**: Connection management, message delivery
- **Collaboration**: Multi-user editing, conflict resolution
- **Notifications**: Real-time updates, push notifications

## Performance Testing

### Load Testing Scenarios

1. **Normal Load**: 10-20 concurrent users, 95th percentile < 2s
2. **Peak Load**: 50+ concurrent users, 95th percentile < 5s
3. **Stress Test**: 100+ concurrent users, monitor degradation
4. **Endurance Test**: Extended periods, memory leak detection

### Performance Metrics

- **Response Time**: p50, p95, p99 percentiles
- **Throughput**: Requests per second
- **Error Rate**: < 1% under normal load, < 5% under stress
- **Resource Usage**: CPU, memory, database connections

### Critical Performance Tests

#### Drawing Operations
- **Load Large Drawings**: 500+ components, < 3s load time
- **Real-time Collaboration**: < 100ms latency for updates
- **Auto-save**: Batched updates, no blocking operations
- **Export Operations**: Large BoQ exports, < 30s completion

#### API Performance
- **Drawing CRUD**: Standard operations < 2s
- **Search Operations**: Complex queries < 5s
- **File Operations**: Upload/download < 10s for 10MB files
- **Report Generation**: BoQ reports < 30s

## End-to-End Testing

### Test Scenarios

#### Drawing Workflow
1. **Create Project**: User creates new project
2. **Create Drawing**: Add drawing with basic metadata
3. **Add Components**: Drag-drop components from symbol library
4. **Connect Components**: Create pipes and connections
5. **Configure Properties**: Set component specifications
6. **Generate BoQ**: Extract bill of quantities
7. **Export Drawing**: PDF, DWG, and BoQ exports

#### Collaboration Workflow
1. **Multi-user Access**: Multiple users open same drawing
2. **Concurrent Editing**: Simultaneous component manipulation
3. **Conflict Resolution**: Handle editing conflicts
4. **Real-time Updates**: Live cursor and change tracking
5. **Communication**: Comments and annotations

#### Approval Workflow
1. **Submit for Approval**: Author submits drawing
2. **Review Process**: Checker reviews and comments
3. **Revision Cycle**: Author makes revisions
4. **Final Approval**: Approver signs off
5. **Version Control**: Track all changes and approvals

### Browser Support
- **Chrome**: Latest stable version
- **Firefox**: Latest stable version
- **Safari**: Latest stable version
- **Edge**: Latest stable version

## Test Data Management

### Test Data Strategy
- **Builders**: Use Bogus library for realistic test data
- **Factories**: Consistent entity creation
- **Fixtures**: Reusable test scenarios
- **Cleanup**: Automatic test data cleanup

### Seed Data
- **Organizations**: Test organization structures
- **Users**: Various roles and permissions
- **Projects**: Sample projects with drawings
- **Symbols**: Standard P&ID symbol library

## Continuous Integration

### GitHub Actions Workflow
1. **Code Quality**: Linting, formatting, type checking
2. **Unit Tests**: Fast feedback on code changes
3. **Integration Tests**: API and database validation
4. **E2E Tests**: Critical user journey validation
5. **Performance Tests**: Regression detection
6. **Coverage Reports**: Quality gate enforcement

### Quality Gates
- **Unit Test Coverage**: > 80% for all projects
- **Integration Test Coverage**: > 70% for API endpoints
- **Performance Regression**: < 20% degradation
- **Security Scans**: No high/critical vulnerabilities
- **Code Quality**: SonarQube quality gate passing

## Test Environment Setup

### Local Development
```bash
# Backend
cd backend
dotnet restore
dotnet test

# Frontend
cd frontend
npm install
npm test
```

### Docker Environment
```bash
# Start test infrastructure
docker-compose -f docker-compose.test.yml up -d

# Run full test suite
npm run test:all
```

### CI/CD Environment
- **PostgreSQL**: Test database container
- **Redis**: Caching test container
- **Test Secrets**: Encrypted environment variables
- **Parallel Execution**: Test parallelization

## Best Practices

### Writing Tests
1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive Names**: Clear test intentions
3. **Independent Tests**: No test dependencies
4. **Fast Execution**: Unit tests < 100ms
5. **Deterministic**: Consistent results

### Test Organization
1. **Logical Grouping**: Related tests together
2. **Shared Setup**: Common test fixtures
3. **Clear Naming**: Consistent naming conventions
4. **Documentation**: Complex test scenarios documented

### Maintenance
1. **Regular Updates**: Keep tests updated with code changes
2. **Flaky Test Detection**: Monitor and fix unstable tests
3. **Performance Monitoring**: Track test execution times
4. **Coverage Analysis**: Regular coverage reviews

## Troubleshooting

### Common Issues
1. **Flaky Tests**: Network timeouts, timing issues
2. **Slow Tests**: Database queries, external dependencies
3. **Environment Issues**: Missing dependencies, configuration

### Debug Strategies
1. **Verbose Logging**: Enable detailed test output
2. **Isolation**: Run individual test methods
3. **Debugging**: Attach debugger to test process
4. **Mocking**: Isolate external dependencies

## Tools and Libraries

### Backend Testing
- **xUnit**: Test framework
- **FluentAssertions**: Assertion library
- **Moq/NSubstitute**: Mocking frameworks
- **AutoFixture**: Test data generation
- **Bogus**: Realistic fake data
- **Testcontainers**: Integration test containers
- **NBomber**: Load testing
- **BenchmarkDotNet**: Performance benchmarking

### Frontend Testing
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **MSW**: API mocking
- **Playwright**: E2E testing
- **user-event**: User interaction simulation
- **jest-axe**: Accessibility testing

### Quality Tools
- **Coverlet**: .NET code coverage
- **ReportGenerator**: Coverage reporting
- **SonarQube**: Code quality analysis
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting