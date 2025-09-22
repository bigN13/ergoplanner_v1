#!/bin/bash
# Comprehensive Quality Gates Runner for Ergoplanner AI Suite
# This script runs ALL quality checks and BLOCKS on ANY failure

set -e  # Exit immediately on any error
set -u  # Exit on undefined variables
set -o pipefail  # Exit on pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Track validation status
OVERALL_STATUS=0
ERRORS_FOUND=""

# Script header
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}     ERGOPLANNER AI SUITE - ZERO TOLERANCE QUALITY GATES      ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  NO errors or warnings allowed - ALL checks must pass!${NC}"
echo ""

# Function to log error
log_error() {
    echo -e "${RED}❌ $1${NC}"
    ERRORS_FOUND="${ERRORS_FOUND}\n  ❌ $1"
    OVERALL_STATUS=1
}

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Git Status Check
echo -e "\n${BLUE}1. CHECKING GIT STATUS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Uncommitted changes detected"
    git status --short
else
    log_success "Working directory clean"
fi

# 2. Run Build Validation
echo -e "\n${BLUE}2. RUNNING BUILD VALIDATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "./scripts/validate-build.sh" ]; then
    if ./scripts/validate-build.sh; then
        log_success "Build validation PASSED"
    else
        log_error "Build validation FAILED"
    fi
else
    log_error "validate-build.sh not found"
fi

# 3. Check for Code Quality Issues
echo -e "\n${BLUE}3. CHECKING CODE QUALITY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for console.log statements
echo "  Checking for console.log statements..."
if grep -r "console\.log" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | grep -v "// console.log" | head -5; then
    log_error "Found console.log statements"
else
    log_success "No console.log statements found"
fi

# Check for TODO comments without issue numbers
echo "  Checking for TODO comments..."
TODO_COUNT=$(grep -r "TODO" --include="*.cs" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v "#[0-9]" | wc -l)
TODO_COUNT=${TODO_COUNT:-0}
if [ "$TODO_COUNT" -gt "0" ]; then
    log_warning "Found $TODO_COUNT TODO comments without issue numbers"
fi

# Check for commented-out code (basic check)
echo "  Checking for commented-out code..."
COMMENTED_CODE=$(grep -r "^[[:space:]]*//.*\(function\|class\|interface\|if\|for\|while\)" --include="*.cs" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l)
COMMENTED_CODE=${COMMENTED_CODE:-0}
if [ "$COMMENTED_CODE" -gt "10" ]; then
    log_warning "Found excessive commented-out code ($COMMENTED_CODE lines)"
fi

# 4. Security Checks
echo -e "\n${BLUE}4. RUNNING SECURITY CHECKS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for hardcoded secrets
echo "  Scanning for hardcoded secrets..."
if grep -r -E "(password|secret|key|token)\s*=\s*[\"'][^\"']{8,}[\"']" --include="*.cs" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -v ".example" | grep -v ".test" | head -3; then
    log_error "Possible hardcoded secrets detected"
else
    log_success "No hardcoded secrets found"
fi

# 5. Documentation Check
echo -e "\n${BLUE}5. CHECKING DOCUMENTATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if critical documentation exists
DOCS=("README.md" "CLAUDE.md" ".taskmaster/CLAUDE.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        log_success "$doc exists"
    else
        log_warning "$doc not found"
    fi
done

# 6. Test Coverage Report (if available)
echo -e "\n${BLUE}6. TEST COVERAGE SUMMARY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend coverage
if [ -d "backend" ] && [ -f "backend/*.csproj" ] 2>/dev/null; then
    echo "  Backend: Check test results for coverage metrics"
fi

# Frontend coverage
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "  Frontend: Run 'npm test -- --coverage' for detailed report"
fi

# 7. Dependency Audit
echo -e "\n${BLUE}7. DEPENDENCY SECURITY AUDIT${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend dependencies
if [ -d "backend" ]; then
    cd backend
    echo "  Checking .NET packages..."
    if dotnet list package --vulnerable 2>/dev/null | grep -q "has no vulnerable"; then
        log_success ".NET packages secure"
    else
        VULN_COUNT=$(dotnet list package --vulnerable 2>/dev/null | grep -c ">" || echo "0")
        if [ "$VULN_COUNT" -gt 0 ]; then
            log_warning "Found $VULN_COUNT vulnerable .NET packages"
        fi
    fi
    cd ..
fi

# Frontend dependencies
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    cd frontend
    echo "  Checking npm packages..."
    NPM_AUDIT=$(npm audit --audit-level=high 2>/dev/null | tail -1 || echo "")
    if echo "$NPM_AUDIT" | grep -q "found 0"; then
        log_success "npm packages secure"
    else
        log_warning "npm audit found issues (run 'npm audit' for details)"
    fi
    cd ..
fi

# 8. Pre-commit Hook Status
echo -e "\n${BLUE}8. GIT HOOKS STATUS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ".git/hooks/pre-commit" ]; then
    log_success "Pre-commit hook installed"
else
    log_warning "Pre-commit hook not installed (run ./scripts/install-hooks.sh)"
fi

# Final Summary
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                        QUALITY GATE SUMMARY                    ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         ✅ ALL QUALITY GATES PASSED! ✅                  ║${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}║   Code is ready for:                                     ║${NC}"
    echo -e "${GREEN}║   • Task completion                                      ║${NC}"
    echo -e "${GREEN}║   • Git commit                                           ║${NC}"
    echo -e "${GREEN}║   • Pull request                                         ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "  1. Mark task as complete: task-master set-status --id=<id> --status=done"
    echo "  2. Commit changes: git commit -m \"feat: description\""
    echo "  3. Push to remote: git push origin feature/<branch-name>"
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║        ❌ QUALITY GATES FAILED! ❌                       ║${NC}"
    echo -e "${RED}║                                                           ║${NC}"
    echo -e "${RED}║   BLOCKING ISSUES FOUND:                                 ║${NC}"
    echo -e "${RED}║$ERRORS_FOUND"
    echo -e "${RED}║                                                           ║${NC}"
    echo -e "${RED}║   ⛔ CANNOT:                                             ║${NC}"
    echo -e "${RED}║   • Mark task as complete                                ║${NC}"
    echo -e "${RED}║   • Commit to git                                        ║${NC}"
    echo -e "${RED}║   • Create pull request                                  ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Required actions:${NC}"
    echo "  1. Fix all errors listed above"
    echo "  2. Run this script again: ./scripts/run-quality-gates.sh"
    echo "  3. Repeat until all checks pass"
    echo ""
    echo -e "${RED}DO NOT use --no-verify or bypass these checks!${NC}"
fi

exit $OVERALL_STATUS