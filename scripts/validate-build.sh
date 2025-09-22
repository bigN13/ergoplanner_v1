#!/bin/bash
# Strict build validation script for Ergoplanner AI Suite
# This script MUST pass before any task can be marked complete or code committed

set -e  # Exit immediately on any error
set -u  # Exit on undefined variables
set -o pipefail  # Exit on pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
VALIDATION_FAILED=0

echo -e "${YELLOW}🔍 Running strict build validation for Ergoplanner...${NC}"
echo "=================================================="

# Function to check if directory exists
check_directory() {
    if [ ! -d "$1" ]; then
        echo -e "${YELLOW}⚠️  Directory $1 not found, skipping...${NC}"
        return 1
    fi
    return 0
}

# Function to validate backend
validate_backend() {
    echo -e "\n${YELLOW}📦 Validating Backend (.NET)...${NC}"

    if ! check_directory "backend"; then
        return 0
    fi

    cd backend

    # Clean build
    echo "  Cleaning previous build..."
    dotnet clean > /dev/null 2>&1 || true

    # Build with warnings as errors
    echo "  Building with strict validation..."
    if ! dotnet build --no-incremental /warnaserror /p:TreatWarningsAsErrors=true; then
        echo -e "${RED}❌ Backend build FAILED - Contains errors or warnings${NC}"
        VALIDATION_FAILED=1
        cd ..
        return 1
    fi

    # Run tests
    echo "  Running tests..."
    if ! dotnet test --no-build --collect:"XPlat Code Coverage"; then
        echo -e "${RED}❌ Backend tests FAILED${NC}"
        VALIDATION_FAILED=1
        cd ..
        return 1
    fi

    # Check for vulnerable packages
    echo "  Checking for vulnerable packages..."
    dotnet list package --vulnerable 2>/dev/null | grep -q "has no vulnerable" || {
        echo -e "${YELLOW}⚠️  Vulnerable packages detected (review required)${NC}"
    }

    echo -e "${GREEN}✅ Backend validation passed${NC}"
    cd ..
    return 0
}

# Function to validate frontend
validate_frontend() {
    echo -e "\n${YELLOW}📦 Validating Frontend (Next.js)...${NC}"

    if ! check_directory "frontend"; then
        return 0
    fi

    cd frontend

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "${YELLOW}⚠️  No package.json found, skipping frontend validation${NC}"
        cd ..
        return 0
    fi

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "  Installing dependencies..."
        npm install
    fi

    # Build
    echo "  Building frontend..."
    if ! npm run build; then
        echo -e "${RED}❌ Frontend build FAILED${NC}"
        VALIDATION_FAILED=1
        cd ..
        return 1
    fi

    # Linting with zero warnings tolerance
    echo "  Running linter..."
    if ! npm run lint -- --max-warnings 0; then
        echo -e "${RED}❌ Frontend linting FAILED - Contains warnings or errors${NC}"
        VALIDATION_FAILED=1
        cd ..
        return 1
    fi

    # TypeScript check
    echo "  Checking TypeScript..."
    if ! npx tsc --noEmit --strict; then
        echo -e "${RED}❌ TypeScript validation FAILED${NC}"
        VALIDATION_FAILED=1
        cd ..
        return 1
    fi

    # Run tests
    echo "  Running tests..."
    if ! npm test -- --watchAll=false --passWithNoTests; then
        echo -e "${RED}❌ Frontend tests FAILED${NC}"
        VALIDATION_FAILED=1
        cd ..
        return 1
    fi

    # Security audit
    echo "  Running security audit..."
    npm audit --audit-level=high 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Security vulnerabilities detected (review required)${NC}"
    }

    echo -e "${GREEN}✅ Frontend validation passed${NC}"
    cd ..
    return 0
}

# Function to validate ML services
validate_ml_services() {
    echo -e "\n${YELLOW}📦 Validating ML Services (.NET ML)...${NC}"

    if ! check_directory "ml-services"; then
        return 0
    fi

    cd ml-services

    # Look for .NET solution or project files
    if ls *.sln 1> /dev/null 2>&1; then
        echo "  Building ML services..."
        if ! dotnet build --no-incremental /warnaserror; then
            echo -e "${RED}❌ ML Services build FAILED${NC}"
            VALIDATION_FAILED=1
            cd ..
            return 1
        fi

        # Run tests if they exist
        if ls *Tests*.csproj 1> /dev/null 2>&1; then
            echo "  Running ML services tests..."
            if ! dotnet test --no-build; then
                echo -e "${RED}❌ ML Services tests FAILED${NC}"
                VALIDATION_FAILED=1
                cd ..
                return 1
            fi
        fi

        echo -e "${GREEN}✅ ML Services validation passed${NC}"
    else
        echo -e "${YELLOW}⚠️  No ML services solution found, skipping...${NC}"
    fi

    cd ..
    return 0
}

# Function to check for common issues
check_common_issues() {
    echo -e "\n${YELLOW}🔍 Checking for common issues...${NC}"

    # Check for console.log in JavaScript/TypeScript files
    if grep -r "console\.log" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | grep -v "// console.log"; then
        echo -e "${RED}❌ Found console.log statements (remove or convert to proper logging)${NC}"
        VALIDATION_FAILED=1
    fi

    # Check for TODO without issue numbers
    if grep -r "TODO" --include="*.cs" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v "#[0-9]"; then
        echo -e "${YELLOW}⚠️  Found TODO comments without issue numbers${NC}"
    fi

    # Check for hardcoded secrets (basic check)
    if grep -r -E "(password|secret|key|token)\s*=\s*[\"'][^\"']{8,}[\"']" --include="*.cs" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -v ".example" | grep -v ".test"; then
        echo -e "${RED}❌ Possible hardcoded secrets detected${NC}"
        VALIDATION_FAILED=1
    fi

    echo -e "${GREEN}✅ Common issues check completed${NC}"
}

# Main execution
echo "Starting validation at $(date)"

# Run all validations
validate_backend
validate_frontend
validate_ml_services
check_common_issues

# Final report
echo ""
echo "=================================================="
if [ $VALIDATION_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL VALIDATIONS PASSED!${NC}"
    echo -e "${GREEN}Code is ready for commit and task completion.${NC}"
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED!${NC}"
    echo -e "${RED}Fix all issues before committing or marking tasks complete.${NC}"
    exit 1
fi