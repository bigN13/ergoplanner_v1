# Claude CLI for Ergoplanner Development

A comprehensive command-line interface for AI-assisted development of the Ergoplanner P&ID Management System. These commands leverage Claude's capabilities to automate development workflows, ensure code quality, and accelerate project completion.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Commands](#core-commands)
- [Command Reference](#command-reference)
- [Workflows](#workflows)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

The Claude CLI provides structured, AI-powered commands to manage the entire development lifecycle of the Ergoplanner project - from brainstorming features to deploying production-ready code. Each command follows industry best practices and includes built-in quality gates to ensure robust, maintainable code.

### Key Benefits
- **Automated Workflow**: Reduces manual tasks and ensures consistency
- **Quality Assurance**: Built-in testing, linting, and security checks
- **Smart Development**: AI-assisted code generation and debugging
- **Progress Tracking**: Automatic documentation and task management
- **Error Prevention**: Multiple validation gates before code reaches production

## Prerequisites

### Required Software
```bash
# Version Control
git >= 2.40

# Containerization
docker >= 4.20
docker-compose >= 2.18

# Development Runtimes
node >= 20.0.0 (LTS)
dotnet >= 8.0
python >= 3.11

# Database
postgresql-client >= 15
redis-cli >= 7.0

# Claude CLI
claude >= 0.1.0  # or appropriate version
```

### Project Structure
Ensure your project follows the Ergoplanner structure:
```
ergoplanner-ai-suite/
├── backend/          # .NET Core services
├── frontend/         # Next.js application
├── ml-services/      # Python ML services
├── docs/            # Documentation
├── docker/          # Docker configurations
├── .github/         # CI/CD workflows
└── task-master.md   # Task tracking file
```

### Environment Setup
```bash
# Clone the repository
git clone https://github.com/your-org/ergoplanner-ai-suite.git
cd ergoplanner-ai-suite

# Copy environment template
cp .env.example .env

# Edit .env with your configurations
nano .env
```

## Installation

### 1. Install Claude CLI
```bash
# macOS
brew install claude-cli

# Linux
curl -fsSL https://claude.ai/install.sh | bash

# Windows
winget install claude-cli

# Verify installation
claude --version
```

### 2. Configure Claude CLI
```bash
# Set API key (if required)
claude config set api-key YOUR_API_KEY

# Set project context
claude config set project-path ./ergoplanner-ai-suite

# Configure preferences
claude config set auto-commit true
claude config set test-coverage-threshold 80
```

### 3. Initialize Project
```bash
# Run setup command
claude do-setup-development.md

# Verify setup
claude do-check-health.md
```

## Quick Start

### Your First Task
```bash
# 1. Review available tasks
cat task-master.md

# 2. Start the enhanced task master
claude do-task-master-enhanced.md

# 3. Monitor progress
tail -f .claude/session.log
```

### Common Workflows

#### Feature Development
```bash
# Brainstorm and plan
claude do-brainstorm-feature.md
claude do-plan-sprint.md

# Implement
claude do-implement-component.md DrawingCanvas
claude do-task-master-enhanced.md
```

#### Bug Fixing
```bash
# Debug and fix
claude do-debug-issue.md "Canvas not rendering"
claude do-quick-fix.md all
claude do-review-code.md
```

#### Daily Routine
```bash
# Morning
claude do-check-health.md
claude do-daily-standup.md

# Development
claude do-task-master-enhanced.md

# Evening
claude do-generate-documentation.md
git push origin feature/current-task
```

## Core Commands

### Task Management

#### `do-task-master-enhanced.md`
Complete task orchestration with safety gates and quality checks.
```bash
claude do-task-master-enhanced.md

# What it does:
# 1. Selects next task from task-master.md
# 2. Creates feature branch
# 3. Implements with tests
# 4. Validates quality
# 5. Creates PR
```

#### `do-task-master-advanced.md`
Continuous execution until all tasks complete (use with caution).
```bash
claude do-task-master-advanced.md \
  --max-iterations=100 \
  --auto-commit=true \
  --break-interval=5

# Options:
#   --max-iterations    Maximum tasks to process (default: 1000)
#   --auto-commit       Automatically commit changes (default: true)
#   --break-interval    Tasks between health checks (default: 10)
#   --parallel          Enable parallel execution (default: false)
#   --dry-run          Preview without making changes (default: false)
```

### Development Commands

#### `do-implement-component.md`
Systematic component implementation with TDD.
```bash
claude do-implement-component.md SymbolLibrary

# Creates:
# - Component.tsx
# - Component.types.ts
# - Component.test.tsx
# - Component.stories.tsx
# - Component.module.css
```

#### `do-debug-issue.md`
Structured debugging approach.
```bash
claude do-debug-issue.md "BoQ not syncing with drawing changes"

# Process:
# 1. Reproduces issue
# 2. Isolates cause
# 3. Develops fix
# 4. Adds regression test
```

### Planning Commands

#### `do-brainstorm-feature.md`
AI-assisted feature ideation.
```bash
claude do-brainstorm-feature.md

# Interactive prompts:
# - Feature category?
# - Target users?
# - Problem to solve?
# Outputs: feature-proposal-[date].md
```

#### `do-plan-sprint.md`
Sprint planning and task breakdown.
```bash
claude do-plan-sprint.md

# Generates:
# - Sprint backlog
# - Task assignments
# - Risk register
# - Daily schedule
```

### Quality Commands

#### `do-review-code.md`
Comprehensive code review.
```bash
claude do-review-code.md feature/drawing-canvas

# Checks:
# - Code quality
# - Security
# - Performance
# - Testing
# - Documentation
```

#### `do-optimize-performance.md`
Performance analysis and optimization.
```bash
claude do-optimize-performance.md DrawingCanvas

# Analyzes:
# - Render performance
# - Memory usage
# - Bundle size
# - Query efficiency
```

## Command Reference

### Complete Command List

| Command | Purpose | Usage |
|---------|---------|--------|
| `do-task-master-enhanced` | Single task execution | `claude do-task-master-enhanced.md` |
| `do-task-master-advanced` | Continuous execution | `claude do-task-master-advanced.md --max-iterations=50` |
| `do-brainstorm-feature` | Feature ideation | `claude do-brainstorm-feature.md` |
| `do-plan-sprint` | Sprint planning | `claude do-plan-sprint.md` |
| `do-implement-component` | Component creation | `claude do-implement-component.md [name]` |
| `do-debug-issue` | Issue debugging | `claude do-debug-issue.md "[description]"` |
| `do-review-code` | Code review | `claude do-review-code.md [branch]` |
| `do-optimize-performance` | Performance tuning | `claude do-optimize-performance.md [component]` |
| `do-setup-development` | Environment setup | `claude do-setup-development.md` |
| `do-generate-documentation` | Doc generation | `claude do-generate-documentation.md [type]` |
| `do-milestone-complete` | Release preparation | `claude do-milestone-complete.md [version]` |
| `do-quick-fix` | Common fixes | `claude do-quick-fix.md [type]` |
| `do-check-health` | System health | `claude do-check-health.md` |
| `do-daily-standup` | Progress update | `claude do-daily-standup.md` |

### Command Options

Most commands support common options:
```bash
--verbose          # Detailed output
--dry-run         # Preview without changes
--force           # Skip confirmations
--config [file]   # Use custom config
--log-level       # Set log verbosity (debug|info|warn|error)
```

## Workflows

### New Feature Workflow
```bash
# 1. Ideation
claude do-brainstorm-feature.md

# 2. Planning
claude do-plan-sprint.md

# 3. Implementation
for task in $(cat sprint-tasks.txt); do
  claude do-task-master-enhanced.md
done

# 4. Review
claude do-review-code.md feature/new-feature

# 5. Release
claude do-milestone-complete.md
```

### Emergency Fix Workflow
```bash
# 1. Identify issue
claude do-debug-issue.md "Production error in BoQ calculation"

# 2. Quick fix
claude do-quick-fix.md all

# 3. Test
npm test && dotnet test

# 4. Deploy hotfix
git checkout -b hotfix/boq-calculation
git commit -am "fix: Correct BoQ calculation error"
git push origin hotfix/boq-calculation
```

### Daily Development Workflow
```bash
#!/bin/bash
# daily-dev.sh

# Morning routine
claude do-check-health.md
claude do-daily-standup.md
git pull origin develop

# Development
claude do-task-master-enhanced.md

# Afternoon check
claude do-review-code.md --self
claude do-generate-documentation.md

# End of day
git push origin feature/current
claude do-daily-standup.md --update
```

### Continuous Integration Workflow
```yaml
# .github/workflows/claude-ci.yml
name: Claude CI
on: [push, pull_request]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Claude Review
        run: |
          claude do-review-code.md ${{ github.head_ref }}
          claude do-check-health.md
```

## Best Practices

### 1. Task Management
- Keep `task-master.md` updated
- Break large tasks into subtasks (max 4 hours)
- Define clear success criteria
- Estimate complexity before starting

### 2. Code Quality
- Run tests after every change
- Commit frequently with clear messages
- Review code before merging
- Document as you code

### 3. Using Claude CLI
- Start with `do-check-health.md` daily
- Use `--dry-run` for unfamiliar commands
- Monitor logs during execution
- Set up command aliases for efficiency

### 4. Error Handling
- Don't ignore warnings
- Fix issues immediately
- Document solutions
- Add tests for bugs

### 5. Collaboration
- Communicate task status
- Use PR templates
- Request reviews early
- Share knowledge

## Troubleshooting

### Common Issues

#### Claude CLI Not Found
```bash
# Check installation
which claude

# Add to PATH
export PATH="$PATH:/usr/local/bin"

# Reinstall if needed
brew reinstall claude-cli
```

#### Task Master Stuck
```bash
# Check status
ps aux | grep claude

# View logs
tail -f .claude/session.log

# Force stop
kill -9 $(pgrep claude)

# Clean up
claude do-quick-fix.md cleanup
```

#### Test Failures
```bash
# Run specific test
npm test -- --watch DrawingCanvas

# Debug test
claude do-debug-issue.md "Test: DrawingCanvas render"

# Skip tests temporarily (not recommended)
claude do-task-master-enhanced.md --skip-tests
```

#### Git Conflicts
```bash
# Stash changes
git stash

# Update branch
git pull origin develop

# Apply changes
git stash pop

# Resolve conflicts
claude do-quick-fix.md conflicts
```

### Error Recovery

If commands fail:
1. Run `do-check-health.md` to diagnose
2. Check `.claude/error.log` for details
3. Use `do-debug-issue.md` for investigation
4. Apply `do-quick-fix.md` for common issues
5. Rollback if necessary: `git reset --hard HEAD^`

### Getting Help
```bash
# View command help
claude help do-task-master-enhanced

# Check documentation
claude docs

# View examples
claude examples task-management

# Community support
Visit: https://github.com/your-org/ergoplanner-ai-suite/discussions
```

## Contributing

### Adding New Commands

1. Create command file:
```markdown
# do-your-command.md
Purpose: Brief description
Input: Required parameters
Process:
1. Step one
2. Step two
Output: What it produces
```

2. Test command:
```bash
claude do-your-command.md --dry-run
```

3. Document in README:
```markdown
#### `do-your-command.md`
Your description here.
```

4. Submit PR:
```bash
git checkout -b feat/new-command
git add do-your-command.md README.md
git commit -m "feat: Add new command for X"
git push origin feat/new-command
```

### Command Guidelines
- Keep commands focused (single responsibility)
- Include validation steps
- Add error handling
- Provide clear output
- Document thoroughly

## License

MIT License - See LICENSE file for details

## Support

- **Documentation**: [docs.ergoplanner.ai](https://docs.ergoplanner.ai)
- **Issues**: [GitHub Issues](https://github.com/your-org/ergoplanner-ai-suite/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/ergoplanner-ai-suite/discussions)
- **Email**: support@ergoplanner.ai

---

## Quick Reference Card

```bash
# Essential Commands
claude do-check-health.md                    # System check
claude do-task-master-enhanced.md           # Execute next task
claude do-daily-standup.md                  # Progress update
claude do-quick-fix.md all                  # Fix common issues

# Aliases (add to ~/.bashrc or ~/.zshrc)
alias cth="claude do-check-health.md"
alias task="claude do-task-master-enhanced.md"
alias debug="claude do-debug-issue.md"
alias review="claude do-review-code.md"
alias docs="claude do-generate-documentation.md"
alias standup="claude do-daily-standup.md"

# One-liner workflows
alias start-day="cth && standup && task"
alias fix-and-review="claude do-quick-fix.md all && review"
alias complete-feature="task && docs && review"
```

---

Built with ❤️ for the Ergoplanner team. Happy coding! 🚀