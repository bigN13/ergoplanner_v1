#!/bin/bash
# Pre-commit validation script for Ergoplanner AI Suite
# This script MUST pass before ANY code can be committed to GitHub

set -e  # Exit immediately on any error
set -u  # Exit on undefined variables
set -o pipefail  # Exit on pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚫 PRE-COMMIT QUALITY GATES FOR ERGOPLANNER${NC}"
echo "=================================================="
echo -e "${YELLOW}NO commits allowed with errors, warnings, or failing tests!${NC}"
echo ""

# Track validation status
COMMIT_BLOCKED=0

# Function to block commit with reason
block_commit() {
    echo -e "${RED}❌ COMMIT BLOCKED: $1${NC}"
    COMMIT_BLOCKED=1
}

# 1. Check for unstaged changes
echo -e "${YELLOW}1. Checking for unstaged changes...${NC}"
if [ -n "$(git diff --name-only)" ]; then
    echo -e "${YELLOW}⚠️  Warning: You have unstaged changes that won't be committed${NC}"
    git diff --name-only | head -10
fi

# 2. Check staged files
echo -e "\n${YELLOW}2. Checking staged files...${NC}"
STAGED_FILES=$(git diff --cached --name-only)
if [ -z "$STAGED_FILES" ]; then
    block_commit "No files staged for commit"
    exit 1
fi
echo "  Files to be committed: $(echo "$STAGED_FILES" | wc -l) files"

# 3. Check for merge conflicts
echo -e "\n${YELLOW}3. Checking for merge conflicts...${NC}"
if git diff --cached --name-only | xargs grep -l "<<<<<<< HEAD" 2>/dev/null; then
    block_commit "Merge conflicts detected in staged files"
fi

# 4. Check for large files
echo -e "\n${YELLOW}4. Checking for large files...${NC}"
while IFS= read -r file; do
    if [ -f "$file" ]; then
        size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
        if [ "$size" -gt 10485760 ]; then  # 10MB
            block_commit "Large file detected: $file ($(($size / 1048576))MB)"
        fi
    fi
done <<< "$STAGED_FILES"

# 5. Check for sensitive data
echo -e "\n${YELLOW}5. Scanning for sensitive data...${NC}"
SENSITIVE_PATTERNS=(
    "password.*=.*['\"][^'\"]{8,}['\"]"
    "api[_-]?key.*=.*['\"][^'\"]{20,}['\"]"
    "secret.*=.*['\"][^'\"]{8,}['\"]"
    "token.*=.*['\"][^'\"]{20,}['\"]"
    "private[_-]?key"
    "BEGIN RSA PRIVATE KEY"
    "BEGIN OPENSSH PRIVATE KEY"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if echo "$STAGED_FILES" | xargs grep -E -i "$pattern" 2>/dev/null | grep -v ".example" | grep -v ".test" | grep -v ".md"; then
        block_commit "Potential sensitive data detected"
        break
    fi
done

# 6. Run full build validation
echo -e "\n${YELLOW}6. Running full build validation...${NC}"
if [ -f "./scripts/validate-build.sh" ]; then
    if ! ./scripts/validate-build.sh; then
        block_commit "Build validation failed"
    fi
else
    echo -e "${YELLOW}⚠️  validate-build.sh not found, attempting basic validation...${NC}"

    # Basic backend check
    if [ -d "backend" ]; then
        echo "  Checking backend build..."
        cd backend
        if ! dotnet build --no-incremental /warnaserror 2>&1 | tail -5; then
            block_commit "Backend build failed"
        fi
        cd ..
    fi

    # Basic frontend check
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        echo "  Checking frontend build..."
        cd frontend
        if ! npm run build 2>&1 | tail -5; then
            block_commit "Frontend build failed"
        fi
        cd ..
    fi
fi

# 7. Check commit message format (if available)
echo -e "\n${YELLOW}7. Checking commit message format...${NC}"
if [ -f ".gitmessage" ]; then
    echo "  Commit message template found"
else
    echo -e "${YELLOW}  Reminder: Use format: type(scope): subject${NC}"
    echo "  Examples: feat(auth): add JWT validation"
    echo "           fix(drawing): correct symbol rotation"
fi

# 8. Final quality checklist
echo -e "\n${YELLOW}8. Final Quality Checklist:${NC}"
echo "  Please confirm ALL of the following are true:"
echo "  ✓ Zero build errors"
echo "  ✓ Zero build warnings"
echo "  ✓ All tests passing"
echo "  ✓ Code coverage >= 80%"
echo "  ✓ No linting errors"
echo "  ✓ No console.log statements"
echo "  ✓ No commented-out code"
echo "  ✓ Documentation updated"
echo "  ✓ Type definitions complete"
echo "  ✓ Error handling implemented"

# Final decision
echo ""
echo "=================================================="

if [ $COMMIT_BLOCKED -eq 1 ]; then
    echo -e "${RED}❌ COMMIT BLOCKED - Fix all issues above before committing${NC}"
    echo -e "${RED}DO NOT use --no-verify flag!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Pre-commit checks PASSED${NC}"
    echo -e "${GREEN}Proceeding with commit...${NC}"

    # Optional: Add commit message enhancement
    echo ""
    echo -e "${BLUE}📝 Commit Message Tips:${NC}"
    echo "  - Reference task ID (e.g., 'task-1.1')"
    echo "  - Include test status (e.g., 'all tests pass')"
    echo "  - Mention coverage if improved"

    exit 0
fi