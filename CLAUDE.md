# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ergoplanner AI Suite is an intelligent P&ID (Piping & Instrumentation Diagram) management system for engineering companies in construction and water treatment industries. The system provides a Draw.io-like interface built on ReactFlow for creating professional P&IDs with automatic Bill of Quantities (BoQ) generation, AI-powered design assistance, and real-time collaboration.

## Technology Stack

### Backend (.NET Core 8+)
- **Architecture**: Clean Architecture with Domain-Driven Design (DDD)
- **API**: ASP.NET Core Web API with JWT authentication
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: Entity Framework Core
- **Caching**: Redis
- **Message Broker**: RabbitMQ
- **Testing**: xUnit, Moq, FluentAssertions, AutoFixture

### Frontend (Next.js 14+)
- **Framework**: Next.js with App Router
- **UI Library**: React with TypeScript
- **Drawing Engine**: ReactFlow for P&ID canvas
- **Styling**: Tailwind CSS
- **State Management**: Zustand or Context API
- **Testing**: Jest, React Testing Library, Playwright/Cypress for E2E

### ML Services (.NET Core 8+)
- **Framework**: ASP.NET Core Web API with ML.NET
- **ML Libraries**: ML.NET for drawing generation and symbol recognition, ONNX Runtime for model inference
- **Testing**: xUnit, integration tests with TestContainers

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes (AKS for production)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana, ELK Stack

## Development Commands

### Backend (.NET)
```bash
# Build
dotnet build --no-incremental

# Run tests
dotnet test

# Run with hot reload
dotnet watch run --project src/Ergoplanner.API

# Database migrations
dotnet ef migrations add MigrationName -p Ergoplanner.Infrastructure -s Ergoplanner.API
dotnet ef database update -p Ergoplanner.Infrastructure -s Ergoplanner.API

# Clean build
dotnet clean && dotnet build --no-incremental /warnaserror
```

### Frontend (Next.js)
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Linting
npm run lint -- --max-warnings 0

# Type checking
npx tsc --noEmit --strict

# Tests
npm test
npm run test:e2e
```

### ML Services (.NET)
```bash
# Build ML services
dotnet build src/Ergoplanner.MLServices.sln --no-incremental

# Run ML services
dotnet run --project src/Ergoplanner.MLServices.API

# Run tests
dotnet test src/Ergoplanner.MLServices.Tests

# Train models
dotnet run --project src/Ergoplanner.MLServices.Training

# Model evaluation
dotnet run --project src/Ergoplanner.MLServices.Evaluation
```

### Docker
```bash
# Build all services
docker-compose build

# Run development environment
docker-compose up -d

# Run specific service
docker-compose up backend frontend -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down
```

## Architecture Overview

### Backend Structure (Clean Architecture)
```
backend/
├── Ergoplanner.Domain/        # Entities, value objects, domain events
├── Ergoplanner.Application/   # Use cases, DTOs, interfaces
├── Ergoplanner.Infrastructure/# Data access, external services
├── Ergoplanner.API/          # Controllers, middleware, configuration
└── Ergoplanner.Shared/       # Shared DTOs and utilities
```

### Frontend Structure (Next.js App Router)
```
frontend/src/
├── app/                      # App Router pages and layouts
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Protected dashboard routes
│   └── api/                 # API routes
├── components/
│   ├── drawing/             # P&ID drawing components (Canvas, Toolbar, SymbolLibrary)
│   ├── boq/                # Bill of Quantities components
│   └── ui/                 # Reusable UI components
└── lib/                     # Utilities, hooks, API clients
```

### Key Features Implementation Areas

1. **P&ID Drawing Engine** (`frontend/src/components/drawing/`)
   - ReactFlow-based canvas with infinite zoom/pan
   - Symbol library with drag-and-drop
   - Smart pipe routing and connection validation

2. **BoQ Synchronization** (`backend/src/Ergoplanner.Application/Services/BoQService/`)
   - Bidirectional sync between drawings and BoQ
   - Real-time updates via SignalR

3. **AI Features** (`backend/src/Ergoplanner.MLServices/`)
   - Natural language to P&ID generation using ML.NET
   - Design validation and suggestions with trained models
   - Symbol recognition using ONNX models

4. **Symbol Library** (`frontend/public/symbols/`, `backend/src/Ergoplanner.Domain/Entities/Symbol.cs`)
   - ISA-5.1, ISO 14617 standards
   - UK water company standards (Thames Water, United Utilities, etc.)

## Development Workflow

### Quality Assurance Pipeline
Follow the build-review-fix cycle after each task:

1. **Implement feature/fix**
2. **Run build with strict settings**
3. **Fix all errors and warnings**
4. **Run tests**
5. **Verify no regression**

### Error Resolution Priority
1. Compilation/Type Errors (Must fix immediately)
2. Test Failures (Fix before committing)
3. Linting Warnings (Fix before PR)
4. Code Style Issues (Fix when touched)

### Git Workflow
- Feature branches: `feature/[task-name]`
- Bug fixes: `fix/[issue-description]`
- Commit format: `type: description` (e.g., `feat: add symbol library`, `fix: correct BoQ sync`)

## Key Validation Requirements

### Backend API
- All endpoints require JWT authentication except `/api/auth/*`
- Use DTOs for request/response (never expose domain entities)
- Implement proper error handling with consistent error responses
- Follow RESTful conventions with proper HTTP status codes

### Frontend
- All components must be TypeScript with proper type definitions
- Use server components by default, client components only when needed
- Implement proper loading and error states
- Follow accessibility guidelines (WCAG 2.1 AA)

### Database
- Use migrations for all schema changes
- Implement soft deletes for audit trail
- Add indexes for frequently queried columns
- Use transactions for multi-table operations

## Common Patterns

### API Endpoint Pattern (.NET)
```csharp
[HttpPost("drawings")]
[Authorize]
public async Task<ActionResult<DrawingDto>> CreateDrawing(
    [FromBody] CreateDrawingCommand command,
    CancellationToken cancellationToken)
{
    var result = await _mediator.Send(command, cancellationToken);
    return result.Match(
        drawing => Ok(drawing),
        error => Problem(error)
    );
}
```

### React Component Pattern (Next.js)
```typescript
interface ComponentProps {
  data: DataType;
  onAction: (id: string) => void;
}

export default function Component({ data, onAction }: ComponentProps) {
  // Implementation
}
```

### Service Pattern (Application Layer)
Use CQRS pattern with MediatR for commands and queries, maintaining separation between read and write operations.

## Security Considerations
- Never expose sensitive configuration in code
- Use environment variables for secrets
- Implement rate limiting on all public endpoints
- Validate all user inputs on both client and server
- Use parameterized queries to prevent SQL injection
- Implement proper CORS configuration

## Performance Guidelines
- Use pagination for large datasets (default: 50 items)
- Implement caching for frequently accessed data
- Use lazy loading for heavy components
- Optimize images and assets
- Implement database query optimization
- Use connection pooling for database connections

## Testing Requirements
- Minimum 80% code coverage for business logic
- Unit tests for all services and utilities
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance tests for heavy operations

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
