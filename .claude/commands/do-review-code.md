## Code Review Command - Task Master Integration

INPUT: PR number, branch name, or file path

### PRE-REVIEW QUALITY GATES (MANDATORY)

**NO review can proceed if:**
- ❌ Build errors exist
- ❌ Build warnings exist
- ❌ Tests are failing
- ❌ Code coverage < 80%

```bash
# Run validation first
./scripts/validate-build.sh
# MUST PASS before review
```

### 1. CONTEXT & TASK INTEGRATION
   a. Load standards from CLAUDE.md and .taskmaster/CLAUDE.md
   b. Check .taskmaster/tasks/tasks.json for related task
   c. Read PR description and linked issues
   d. Review task acceptance criteria
   e. Verify CI/CD status GREEN

### 2. AUTOMATED QUALITY CHECKS
   ```bash
   # Backend
   dotnet build --no-incremental /warnaserror
   dotnet test --collect:"XPlat Code Coverage"
   dotnet format --verify-no-changes

   # Frontend
   npm run build
   npm run lint -- --max-warnings 0
   npm test -- --coverage --watchAll=false
   npx tsc --noEmit --strict
   ```

   **Code Quality Metrics:**
   a. SOLID principles adherence
   b. DRY (Don't Repeat Yourself)
   c. Proper abstraction levels
   d. Naming conventions (C#/TypeScript standards)
   e. Code complexity < 10 (cyclomatic)

### 3. FUNCTIONAL REVIEW
   a. Business logic correctness
   b. Edge case handling
   c. Error handling
   d. Input validation
   e. Output correctness

### 4. SECURITY REVIEW
   a. No hardcoded secrets
   b. Input sanitization
   c. SQL injection prevention
   d. XSS prevention
   e. Authentication/authorization
   f. Data encryption where needed

### 5. PERFORMANCE REVIEW
   a. Algorithm efficiency
   b. Database query optimization
   c. Caching implementation
   d. Bundle size impact
   e. Memory leaks
   f. Render performance

### 6. TESTING REVIEW
   a. Test coverage adequate (>=80%)
   b. Test cases comprehensive
   c. Edge cases tested
   d. Mocks appropriate
   e. Integration tests present

### 7. DOCUMENTATION REVIEW
   a. Code comments clear
   b. README updated
   c. API docs updated
   d. JSDoc/XML documentation
   e. Examples provided

### 8. STYLE & CONSISTENCY
   a. Code formatting
   b. Import organization
   c. File structure
   d. Naming consistency
   e. Pattern consistency

### 9. FEEDBACK GENERATION

   **Severity Levels:**
   a. 🚨 **BLOCKING** - Cannot merge until fixed
      - Build errors/warnings
      - Failing tests
      - Security vulnerabilities
      - Coverage < 80%

   b. 🔴 **CRITICAL** - Must fix before approval
      - Unhandled errors
      - Missing validation
      - Performance issues

   c. 🟡 **MAJOR** - Should fix
      - Code smells
      - Missing documentation
      - Inefficient algorithms

   d. 🔵 **MINOR** - Consider fixing
      - Style inconsistencies
      - Naming improvements

   e. ✅ **PRAISE** - Good practices to highlight

### 10. TASK-MASTER INTEGRATION

   **Update task status based on review:**
   ```bash
   # If review passes all checks
   task-master set-status --id=<task-id> --status=review
   task-master update-task --id=<task-id> --prompt="Code review passed"

   # If issues found
   task-master set-status --id=<task-id> --status=in-progress
   task-master update-task --id=<task-id> --prompt="Review issues: [list]"
   ```

### 11. REVIEW DECISION MATRIX

| Status | Build | Tests | Coverage | Security | Action |
|--------|-------|-------|----------|----------|--------|
| ✅ APPROVED | Pass | Pass | ≥80% | Clean | Merge allowed |
| ⚠️ CONDITIONAL | Pass | Pass | ≥80% | Minor | Fix then merge |
| ❌ NEEDS CHANGES | Fail | - | - | - | Fix required |
| 🚫 BLOCKED | - | - | <80% | Critical | Major rework |

### 12. POST-REVIEW ACTIONS
   a. Update .taskmaster/tasks/tasks.json
   b. Log review metrics
   c. Create follow-up tasks if needed
   d. Update documentation
   e. Share learnings with team

**Remember: NO code with errors/warnings can pass review!**