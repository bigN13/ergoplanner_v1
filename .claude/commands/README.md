# Claude Commands - Ergoplanner AI Suite

## Command Overview

All commands are integrated with Task Master and enforce **STRICT QUALITY GATES**.

### ⚠️ CRITICAL: Quality Enforcement

**NO task can be completed or code committed if:**
- ❌ Build errors exist
- ❌ Build warnings exist
- ❌ Tests are failing
- ❌ Code coverage < 80%
- ❌ Linting errors present
- ❌ Security vulnerabilities detected

## Available Commands

### Core Task Management

| Command | Purpose | Task Master Integration | Quality Gates |
|---------|---------|------------------------|---------------|
| `/do-taskmaster-list` | Execute tasks with quality gates | ✅ Full | ✅ Strict |
| `/do-task-master-advanced` | Advanced task execution with zero tolerance | ✅ Full | ✅ Zero Tolerance |
| `/do-prompt-plan` | Plan implementation approach | ✅ Partial | ⚠️ Planning |

### Development Commands

| Command | Purpose | Task Master Integration | Quality Gates |
|---------|---------|------------------------|---------------|
| `/do-implement-component` | Create new React/Next.js components | ✅ Updates tasks | ✅ Test-first |
| `/do-debug-issue` | Debug and fix issues | ✅ Logs issues | ✅ Validation |
| `/do-quick-fix` | Quick fixes for common issues | ✅ Updates status | ✅ Auto-check |
| `/do-review-code` | Comprehensive code review | ✅ Full | ✅ Blocking |

### Planning & Documentation

| Command | Purpose | Task Master Integration | Quality Gates |
|---------|---------|------------------------|---------------|
| `/do-brainstorm-feature` | Feature ideation and planning | ✅ Creates tasks | ⚠️ Planning |
| `/do-plan-sprint` | Sprint planning and task selection | ✅ Full | ✅ Capacity |
| `/do-generate-documentation` | Auto-generate documentation | ✅ Updates docs | ✅ Validation |

### Quality & Performance

| Command | Purpose | Task Master Integration | Quality Gates |
|---------|---------|------------------------|---------------|
| `/do-optimize-performance` | Performance optimization | ✅ Metrics tracking | ✅ Benchmarks |
| `/do-check-health` | System health check | ✅ Status update | ✅ Full scan |

### Process & Communication

| Command | Purpose | Task Master Integration | Quality Gates |
|---------|---------|------------------------|---------------|
| `/do-daily-standup` | Daily progress update | ✅ Full | ✅ Metrics |
| `/do-milestone-complete` | Milestone completion process | ✅ Full | ✅ Release gates |

## File Locations

### Task Master Files
- **Tasks Database**: `.taskmaster/tasks/tasks.json`
- **Configuration**: `.taskmaster/config.json`
- **State**: `.taskmaster/state.json`
- **Task Guide**: `.taskmaster/CLAUDE.md`

### Project Files
- **Project Guide**: `CLAUDE.md`
- **Commands**: `.claude/commands/`
- **Scripts**: `scripts/`
  - `validate-build.sh` - Build validation
  - `pre-commit-check.sh` - Pre-commit hooks
  - `run-quality-gates.sh` - Complete quality suite
  - `install-hooks.sh` - Git hooks installer

## Quality Gate Scripts

### Running Quality Checks

```bash
# Full quality gate validation
./scripts/run-quality-gates.sh

# Build validation only
./scripts/validate-build.sh

# Pre-commit validation
./scripts/pre-commit-check.sh

# Install git hooks
./scripts/install-hooks.sh
```

## Task Master Commands

### Basic Commands
```bash
# List all tasks
task-master list

# Get next task
task-master next

# Show task details
task-master show <task-id>

# Update task status
task-master set-status --id=<id> --status=<status>

# Update task notes
task-master update-task --id=<id> --prompt="notes"
```

### Status Values
- `pending` - Not started
- `in-progress` - Currently working
- `review` - In code review
- `blocked` - Blocked by issues
- `done` - Completed

## Agent Integration

Commands work with specialized agents:

### Task Management Agents
- **task-orchestrator** - Coordinates task execution
- **task-executor** - Implements specific tasks
- **task-checker** - Verifies task completion

### Development Agents
- **ergoplanner-backend-developer** - Backend implementation
- **frontend-react-engineer** - Frontend development
- **ml-pid-engineer** - ML services (ML.NET)
- **database-devops-architect** - Database & DevOps

### Quality & Process Agents
- **security-compliance-engineer** - Security enforcement
- **qa-testing-engineer** - Testing strategy
- **agile-project-manager** - Sprint management
- **technical-docs-writer** - Documentation

### Architecture Agents
- **system-architect-ergoplanner** - System design
- **ux-ui-designer** - UI/UX design

## Workflow Example

```bash
# 1. Start daily standup
claude /do-daily-standup

# 2. Get next task
task-master next

# 3. Plan implementation
claude /do-prompt-plan

# 4. Implement component
claude /do-implement-component SymbolLibrary

# 5. Run quality gates
./scripts/run-quality-gates.sh

# 6. Review code
claude /do-review-code feature/symbol-library

# 7. Complete task (only if quality gates pass)
task-master set-status --id=2.1 --status=done
```

## ⛔ Forbidden Practices

The following will cause IMMEDIATE HALT:
- ❌ Skipping validation
- ❌ Committing with warnings
- ❌ Marking tasks done with failing tests
- ❌ Using `--no-verify` on commits
- ❌ Lowering coverage thresholds
- ❌ Ignoring linting errors
- ❌ Suppressing warnings
- ❌ Using `any` type without documentation
- ❌ Commenting out tests

## Success Criteria

Tasks/commits are ONLY successful when:
1. ✅ Zero build errors
2. ✅ Zero build warnings
3. ✅ 100% tests passing
4. ✅ >= 80% code coverage
5. ✅ Zero linting issues
6. ✅ No security vulnerabilities
7. ✅ Documentation updated
8. ✅ Code reviewed
9. ✅ Commits follow convention
10. ✅ Quality gates passed

## Quick Reference

### Check Everything
```bash
./scripts/run-quality-gates.sh
```

### Before Committing
```bash
./scripts/pre-commit-check.sh
```

### Task Completion
```bash
# First validate
./scripts/validate-build.sh

# Then mark complete (only if passed)
task-master set-status --id=<id> --status=done
```

**Remember: Quality is NON-NEGOTIABLE!**