## Task Master Workflow - Ergoplanner AI Suite

This command executes the complete Task Master workflow with **STRICT QUALITY GATES** that prevent task completion or GitHub commits when there are ANY build errors or warnings.

### ⚠️ CRITICAL REQUIREMENTS

**NO TASK CAN BE MARKED COMPLETE IF:**
- ❌ Build errors exist
- ❌ Build warnings exist
- ❌ Tests are failing
- ❌ Code coverage < 80%
- ❌ Linting errors present
- ❌ Security vulnerabilities detected

**NO CODE CAN BE COMMITTED TO GITHUB IF:**
- ❌ Any of the above conditions exist
- ❌ Code review not performed
- ❌ Documentation not updated

### WORKFLOW PHASES

1. **INITIALIZATION PHASE**
   a. Load project context from CLAUDE.md and .taskmaster/CLAUDE.md
   b. Check current git branch and ensure clean working directory
   c. Verify Task Master configuration in `.taskmaster/config.json`
   d. Load current tasks from `.taskmaster/tasks/tasks.json`
   e. **Run initial build check to establish baseline - MUST PASS**

2. **TASK SELECTION PHASE**
   a. Use `task-master list` or read `.taskmaster/tasks/tasks.json` for incomplete tasks
   b. Use `task-master next` to get the next available task
   c. Analyze task dependencies using `task-master validate-dependencies`
   d. Select next task based on priority and dependencies
   e. Estimate complexity and time required

3. **PLANNING PHASE**
   a. Use `task-master show <id>` to get full task details
   b. Review subtasks if they exist in the task structure
   c. Define success criteria from task's `testStrategy` field
   d. Identify potential risks and mitigation strategies
   e. Use `task-master update-subtask --id=<id> --prompt="plan"` to log approach
   f. **Define specific quality metrics that must be met**

4. **BRANCH CREATION**
   a. Create feature branch: `git checkout -b feature/task-<id>-description`
   b. Write detailed branch description including:
      - Task objective from task details
      - Success criteria from testStrategy
      - Quality gates that must pass
      - Dependencies from task dependencies array
   c. Update task status: `task-master set-status --id=<id> --status=in-progress`

5. **IMPLEMENTATION PHASE**
   a. Follow implementation details from task's `details` field
   b. Write implementation following project standards in CLAUDE.md
   c. Create tests based on task's `testStrategy`
   d. **After each change, run build to catch errors immediately**
   e. Use `task-master update-subtask --id=<id> --prompt="progress"` to log updates
   f. For subtasks, implement them sequentially with validation after each

6. **VALIDATION PHASE - MANDATORY QUALITY GATES** ⚠️

   **6.1 Build Validation (ZERO TOLERANCE)**
   ```bash
   # Backend - MUST HAVE ZERO ERRORS AND WARNINGS
   dotnet clean
   dotnet build --no-incremental /warnaserror /p:TreatWarningsAsErrors=true
   # If ANY errors or warnings: STOP - Fix immediately

   # Frontend - MUST BUILD WITHOUT ERRORS
   npm run build
   # If build fails: STOP - Fix immediately

   # ML Services - MUST BUILD WITHOUT ERRORS
   dotnet build src/Ergoplanner.MLServices.sln --no-incremental /warnaserror
   # If ANY errors: STOP - Fix immediately
   ```

   **6.2 Linting (ZERO TOLERANCE)**
   ```bash
   # Backend
   dotnet format --verify-no-changes
   # If changes needed: STOP - Fix formatting

   # Frontend
   npm run lint -- --max-warnings 0
   # If ANY warnings: STOP - Fix all issues

   # TypeScript
   npx tsc --noEmit --strict
   # If ANY type errors: STOP - Fix immediately
   ```

   **6.3 Testing (MANDATORY PASS)**
   ```bash
   # Backend
   dotnet test --collect:"XPlat Code Coverage"
   # MUST: All tests pass, Coverage >= 80%

   # Frontend
   npm test -- --coverage --watchAll=false
   # MUST: All tests pass, Coverage >= 80%

   # Integration Tests
   npm run test:integration
   dotnet test --filter Category=Integration
   # MUST: All integration tests pass
   ```

   **6.4 Security Scanning**
   ```bash
   # Dependency scanning
   npm audit --audit-level=high
   dotnet list package --vulnerable
   # If vulnerabilities: STOP - Fix or document

   # Code scanning (if available)
   # Run OWASP dependency check
   # Run static analysis security testing
   ```

   **6.5 Final Build Verification**
   ```bash
   # Clean everything and rebuild from scratch
   git clean -xfd
   npm install && npm run build
   dotnet restore && dotnet build --no-incremental /warnaserror
   # MUST: Complete without ANY errors or warnings
   ```

7. **CODE REVIEW PHASE (SELF-REVIEW MANDATORY)**

   **Quality Checklist - ALL MUST BE ✓**
   - [ ] Zero build errors
   - [ ] Zero build warnings
   - [ ] All tests passing
   - [ ] Code coverage >= 80%
   - [ ] No linting errors or warnings
   - [ ] No console.log or debug code
   - [ ] No commented-out code
   - [ ] No TODO comments without issue numbers
   - [ ] No hardcoded values or secrets
   - [ ] Error handling implemented
   - [ ] Input validation present
   - [ ] Documentation updated
   - [ ] Type definitions complete (TypeScript)
   - [ ] Unit tests for new functions
   - [ ] Integration tests for new endpoints

   **If ANY item is not checked: CANNOT PROCEED**

8. **DOCUMENTATION UPDATE**
   a. Update relevant documentation based on task changes
   b. Update task notes: `task-master update-task --id=<id> --prompt="completed: [summary]"`
   c. If API changes, update OpenAPI specs
   d. Update CHANGELOG.md if significant feature
   e. **Document any technical debt or known limitations**

9. **PRE-COMMIT VALIDATION** ⚠️

   **BLOCKING CHECKS - Cannot commit if ANY fail:**
   ```bash
   # Run complete validation suite
   ./scripts/pre-commit-check.sh  # Or manually:

   # 1. Check for uncommitted changes that shouldn't be there
   git status --porcelain

   # 2. Run full build chain
   dotnet clean && dotnet build --no-incremental /warnaserror
   npm run build

   # 3. Run all tests
   dotnet test
   npm test -- --watchAll=false

   # 4. Check for secrets
   git secrets --scan  # or equivalent

   # 5. Validate no merge conflicts
   git merge-tree $(git merge-base HEAD origin/main) HEAD origin/main
   ```

   **If ANY check fails: STOP - DO NOT COMMIT**

10. **COMMIT & PUSH** (Only if ALL quality gates passed)
    a. Stage changes selectively (no generated files)
    b. Run pre-commit hooks: `git commit --no-verify` is FORBIDDEN
    c. Commit with format: `feat(task-<id>): <description>`
    d. Include in commit message:
       - What was implemented
       - All tests pass confirmation
       - Coverage percentage
    e. Push to remote branch ONLY after local validation
    f. Mark task complete: `task-master set-status --id=<id> --status=done`

    **COMMIT BLOCKED IF:**
    - Build has errors or warnings
    - Tests are failing
    - Coverage < 80%
    - Linting issues exist

11. **PULL REQUEST**
    a. Create PR referencing task ID
    b. In PR description, confirm:
       - ✅ Zero build errors
       - ✅ Zero build warnings
       - ✅ All tests passing
       - ✅ Coverage >= 80%
       - ✅ Security scan clean
    c. Ensure CI/CD pipeline passes
    d. Request reviews
    e. **Do not merge until all checks pass**

12. **ITERATION**
    a. Use `task-master next` to get the next task
    b. If no tasks available, check dependencies
    c. Update `.taskmaster/tasks/tasks.json` if needed
    d. Return to step 2 for next task

### QUALITY GATE ENFORCEMENT SCRIPTS

Create these helper scripts to enforce quality:

**scripts/validate-build.sh**
```bash
#!/bin/bash
set -e  # Exit on any error

echo "🔍 Running strict build validation..."

# Backend validation
echo "Validating backend..."
cd backend
dotnet clean
dotnet build --no-incremental /warnaserror /p:TreatWarningsAsErrors=true || exit 1
dotnet test || exit 1
cd ..

# Frontend validation
echo "Validating frontend..."
cd frontend
npm run build || exit 1
npm run lint -- --max-warnings 0 || exit 1
npm test -- --watchAll=false || exit 1
cd ..

echo "✅ All validations passed!"
```

**scripts/pre-commit-check.sh**
```bash
#!/bin/bash
set -e

echo "🚫 Pre-commit quality gates..."

# Check for build issues
./scripts/validate-build.sh || {
    echo "❌ BUILD FAILED - COMMIT BLOCKED"
    exit 1
}

# Check for secrets
git diff --cached --name-only | xargs grep -E "(password|secret|key|token)" && {
    echo "❌ POSSIBLE SECRETS DETECTED - COMMIT BLOCKED"
    exit 1
}

echo "✅ Pre-commit checks passed!"
```

### TASK MASTER COMMANDS WITH QUALITY GATES

```bash
# Before marking any task as done
task-master set-status --id=<id> --status=review  # First mark for review

# Run validation
./scripts/validate-build.sh  # MUST PASS

# Only then mark as done
task-master set-status --id=<id> --status=done

# If validation fails
task-master set-status --id=<id> --status=in-progress
task-master update-task --id=<id> --prompt="Build validation failed: [errors]"
```

### FILE LOCATIONS

- **Tasks Database**: `.taskmaster/tasks/tasks.json`
- **Configuration**: `.taskmaster/config.json`
- **State**: `.taskmaster/state.json`
- **Task Master Guide**: `.taskmaster/CLAUDE.md`
- **Project Guide**: `CLAUDE.md`
- **Validation Scripts**: `scripts/validate-build.sh`, `scripts/pre-commit-check.sh`

### AGENT INTEGRATION WITH QUALITY GATES

Agents must enforce quality gates:

- **task-orchestrator**: Plans tasks with quality requirements
- **task-executor**: Implements with continuous validation
- **task-checker**: Verifies ALL quality gates before approval

### ⛔ FORBIDDEN PRACTICES

The following are STRICTLY FORBIDDEN:
- ❌ Committing with build warnings
- ❌ Skipping tests to save time
- ❌ Using `--no-verify` on git commits
- ❌ Marking tasks done without validation
- ❌ Pushing code without local testing
- ❌ Ignoring linting errors
- ❌ Lowering coverage thresholds
- ❌ Commenting out failing tests
- ❌ Using `any` type in TypeScript (except documented cases)
- ❌ Suppressing warnings without documentation

### 🎯 SUCCESS CRITERIA

A task is ONLY considered complete when:
1. ✅ Zero build errors
2. ✅ Zero build warnings
3. ✅ 100% tests passing
4. ✅ >= 80% code coverage
5. ✅ Zero linting issues
6. ✅ Security scan clean
7. ✅ Documentation updated
8. ✅ Code reviewed (self or peer)
9. ✅ Commits follow convention
10. ✅ CI/CD pipeline green