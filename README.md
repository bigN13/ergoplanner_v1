# Ergoplanner AI Suite

## 🚀 Intelligent P&ID Management System

Ergoplanner AI Suite is an enterprise-grade Piping & Instrumentation Diagram (P&ID) management system designed for engineering companies in construction and water treatment industries. Built with modern technologies and enforcing strict quality standards.

## ✨ Key Features

- **P&ID Drawing Engine**: ReactFlow-based canvas with drag-and-drop symbols
- **AI-Powered Assistance**: Natural language to P&ID generation
- **Real-time Collaboration**: Multi-user editing with conflict resolution
- **Bill of Quantities**: Automatic BoQ generation from drawings
- **Version Control**: Git-like branching and versioning for drawings
- **Symbol Library**: ISA-5.1, ISO 14617, and UK water standards

## 🛠️ Technology Stack

### Backend
- **.NET Core 8+** with Clean Architecture
- **PostgreSQL** with PostGIS extension
- **Redis** for distributed caching
- **SignalR** for real-time features
- **ML.NET** for machine learning services

### Frontend
- **Next.js 14+** with App Router
- **React 18+** with TypeScript
- **ReactFlow** for P&ID canvas
- **Tailwind CSS** for styling
- **Zustand** for state management

### Infrastructure
- **Docker** containerization
- **Kubernetes** orchestration
- **GitHub Actions** CI/CD
- **Prometheus & Grafana** monitoring

## 📋 Project Management

This project uses **Task Master AI** for comprehensive task management with strict quality gates.

### Quality Standards

**ZERO TOLERANCE POLICY:**
- ❌ NO build errors allowed
- ❌ NO build warnings allowed
- ❌ NO commits with failing tests
- ✅ Minimum 80% code coverage
- ✅ All quality gates must pass

### Quick Commands

```bash
# Run quality validation
./scripts/run-quality-gates.sh

# Validate build
./scripts/validate-build.sh

# Install git hooks
./scripts/install-hooks.sh

# Create comprehensive commit
./scripts/commit-with-details.sh
```

## 🚦 Getting Started

### Prerequisites
- .NET Core SDK 8.0+
- Node.js 18+
- Docker Desktop
- PostgreSQL 15+
- Redis

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ergoplanner.git
cd ergoplanner
```

2. Install git hooks:
```bash
./scripts/install-hooks.sh
```

3. Set up environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run initial validation:
```bash
./scripts/run-quality-gates.sh
```

## 📁 Project Structure

```
ergoplanner/
├── backend/              # .NET Core API
├── frontend/            # Next.js application
├── ml-services/         # ML.NET services
├── .claude/             # Claude AI configuration
│   ├── agents/         # Specialized AI agents
│   └── commands/       # Claude commands
├── .taskmaster/        # Task management
│   └── tasks/         # Task definitions
├── scripts/            # Automation scripts
└── docs/              # Documentation
```

## 🤖 Claude AI Integration

This project is optimized for development with Claude AI (claude.ai/code) with:
- 13 specialized agents for different aspects
- 20+ custom commands for automation
- Comprehensive task orchestration
- Strict quality enforcement

## 📊 Current Status

- **Phase**: Initial Setup Complete
- **Tasks**: 15 main tasks with 43 subtasks defined
- **Quality**: All validation scripts operational
- **Next**: Begin Phase 1 implementation

## 🧪 Testing

```bash
# Backend tests
cd backend
dotnet test --collect:"XPlat Code Coverage"

# Frontend tests
cd frontend
npm test -- --coverage

# Full validation
./scripts/run-quality-gates.sh
```

## 📝 Documentation

- [Project Documentation](.taskmaster/docs/README.md)
- [API Documentation](docs/api/README.md)
- [Development Guide](CLAUDE.md)
- [Task Master Guide](.taskmaster/CLAUDE.md)

## 🔒 Security

- JWT authentication
- Role-based access control
- Data encryption at rest
- Regular security audits
- Automated vulnerability scanning

## 🤝 Contributing

All contributions must:
1. Pass all quality gates
2. Include comprehensive tests
3. Update documentation
4. Follow coding standards
5. Zero errors/warnings

## 📄 License

[License Type] - See LICENSE file for details

## 🙏 Acknowledgments

- Developed with Claude AI assistance
- Task Master AI for project management
- ReactFlow for diagram capabilities

---

**Remember: Quality is NON-NEGOTIABLE!**

For detailed development instructions, see [CLAUDE.md](CLAUDE.md)