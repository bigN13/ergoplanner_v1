# Ergoplanner Backend

## Architecture

This backend follows Clean Architecture principles with the following projects:

### Core Layer
- **Ergoplanner.Domain**: Contains all entities, value objects, domain events, and domain-specific logic
- **Ergoplanner.Application**: Contains all application business logic, use cases, DTOs, interfaces, and commands/queries

### Infrastructure Layer
- **Ergoplanner.Infrastructure**: Contains all external concerns like data access, external services, file system, etc.

### Presentation Layer
- **Ergoplanner.API**: ASP.NET Core Web API project with controllers, middleware, and API configuration

### Shared
- **Ergoplanner.Shared**: Contains shared DTOs and utilities that can be used across layers

### Tests
- **Ergoplanner.Domain.Tests**: Unit tests for domain logic
- **Ergoplanner.Application.Tests**: Unit tests for application services and use cases
- **Ergoplanner.Infrastructure.Tests**: Integration tests for infrastructure services
- **Ergoplanner.API.Tests**: Integration tests for API endpoints

## Prerequisites

- .NET 8.0 SDK or later
- PostgreSQL 14+
- Redis (for caching)
- Docker (optional, for containerized development)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Restore packages**
   ```bash
   dotnet restore
   ```

3. **Configure database connection**
   Update the connection string in `src/Ergoplanner.API/appsettings.Development.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Database=ergoplanner_dev;Username=your_user;Password=your_password"
   }
   ```

4. **Create the database**
   ```bash
   # Create PostgreSQL database
   createdb ergoplanner_dev

   # Run migrations (when available)
   dotnet ef database update -p src/Ergoplanner.Infrastructure -s src/Ergoplanner.API
   ```

5. **Run the application**
   ```bash
   dotnet run --project src/Ergoplanner.API
   ```

   The API will be available at:
   - https://localhost:5001
   - http://localhost:5000
   - Swagger UI: https://localhost:5001 (or root path in development)

## Development

### Building the solution
```bash
# Build entire solution
dotnet build

# Build with strict mode (treat warnings as errors)
dotnet build --no-incremental /warnaserror

# Clean and rebuild
dotnet clean && dotnet build --no-incremental
```

### Running tests
```bash
# Run all tests
dotnet test

# Run tests with coverage
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover

# Run specific test project
dotnet test tests/Ergoplanner.Domain.Tests
```

### Entity Framework Core Commands
```bash
# Add migration
dotnet ef migrations add <MigrationName> -p src/Ergoplanner.Infrastructure -s src/Ergoplanner.API

# Update database
dotnet ef database update -p src/Ergoplanner.Infrastructure -s src/Ergoplanner.API

# Remove last migration
dotnet ef migrations remove -p src/Ergoplanner.Infrastructure -s src/Ergoplanner.API

# Generate SQL script
dotnet ef migrations script -p src/Ergoplanner.Infrastructure -s src/Ergoplanner.API
```

## Key Technologies

- **ASP.NET Core 8.0**: Web framework
- **Entity Framework Core 8.0**: ORM
- **PostgreSQL**: Primary database
- **Redis**: Distributed caching
- **MediatR**: CQRS implementation
- **FluentValidation**: Request validation
- **AutoMapper**: Object mapping
- **Serilog**: Structured logging
- **JWT**: Authentication
- **Swagger/OpenAPI**: API documentation
- **xUnit**: Testing framework
- **Moq**: Mocking framework
- **FluentAssertions**: Test assertions
- **AutoFixture**: Test data generation

## Project Structure

```
backend/
├── src/
│   ├── Ergoplanner.Domain/          # Domain entities and logic
│   │   ├── Common/                  # Base classes and interfaces
│   │   ├── Entities/                # Domain entities
│   │   ├── ValueObjects/            # Value objects
│   │   └── Events/                  # Domain events
│   ├── Ergoplanner.Application/     # Application business logic
│   │   ├── Common/                  # Shared application code
│   │   │   ├── Interfaces/          # Application interfaces
│   │   │   ├── Behaviours/          # MediatR pipeline behaviors
│   │   │   └── Exceptions/          # Custom exceptions
│   │   ├── Services/                # Application services
│   │   └── Features/                # CQRS features (commands/queries)
│   ├── Ergoplanner.Infrastructure/  # External concerns
│   │   ├── Persistence/             # Database context and configurations
│   │   ├── Services/                # External service implementations
│   │   └── Repositories/            # Repository implementations
│   ├── Ergoplanner.API/            # Web API
│   │   ├── Controllers/             # API controllers
│   │   ├── Middleware/              # Custom middleware
│   │   └── Services/                # API-specific services
│   └── Ergoplanner.Shared/         # Shared code
│       └── DTOs/                    # Shared data transfer objects
├── tests/                           # Test projects
├── Ergoplanner.sln                 # Solution file
└── global.json                     # .NET SDK configuration
```

## Configuration

### JWT Settings
Configure JWT in appsettings.json:
```json
{
  "Jwt": {
    "Issuer": "Ergoplanner",
    "Audience": "Ergoplanner.Users",
    "Key": "YourSecretKeyHere",
    "ExpirationInMinutes": 60
  }
}
```

### CORS Settings
Configure allowed origins:
```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001"
    ]
  }
}
```

### Logging
Serilog configuration:
```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
```

## Docker Support

Build and run with Docker:
```bash
# Build image
docker build -t ergoplanner-api .

# Run container
docker run -d -p 5000:80 --name ergoplanner-api ergoplanner-api

# Using docker-compose
docker-compose up -d
```

## Health Checks

The API includes health check endpoints:
- `/health` - Basic health status
- `/health/ready` - Readiness check (includes database)
- `/health/live` - Liveness check

## Contributing

1. Follow Clean Architecture principles
2. Write unit tests for all business logic
3. Use async/await for all I/O operations
4. Follow SOLID principles
5. Use dependency injection
6. Document public APIs with XML comments
7. Handle errors appropriately
8. Use structured logging with correlation IDs

## License

[Your License Here]