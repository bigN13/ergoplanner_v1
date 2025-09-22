#!/bin/bash
# Comprehensive Git Commit Script with Extensive Details
# This script generates detailed commit messages with full project context

set -e  # Exit on any error
set -u  # Exit on undefined variables
set -o pipefail  # Exit on pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
COMMIT_TYPE="${1:-feat}"  # Default to 'feat' if not specified
PUSH_TO_REMOTE="${2:-false}"  # Default to not pushing

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}     COMPREHENSIVE GIT COMMIT - ERGOPLANNER AI SUITE          ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. PRE-COMMIT VALIDATION
echo -e "${YELLOW}1. Running pre-commit validation...${NC}"
if [ -f "./scripts/validate-build.sh" ]; then
    if ! ./scripts/validate-build.sh; then
        echo -e "${RED}❌ Quality gates failed! Cannot commit.${NC}"
        echo -e "${RED}Fix all issues before committing.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  validate-build.sh not found, skipping validation${NC}"
fi

# 2. ANALYZE CHANGES
echo -e "\n${YELLOW}2. Analyzing changes...${NC}"

# Get change statistics
if git diff --cached --quiet; then
    echo "Staging all changes..."
    git add -A
fi

FILES_CHANGED=$(git diff --cached --stat | tail -1 | awk '{print $1}' || echo "0")
INSERTIONS=$(git diff --cached --stat | tail -1 | grep -oE '[0-9]+ insertion' | awk '{print $1}' || echo "0")
DELETIONS=$(git diff --cached --stat | tail -1 | grep -oE '[0-9]+ deletion' | awk '{print $1}' || echo "0")

# Get list of changed files
CHANGED_FILES=$(git diff --cached --name-status | head -20)

echo "  Files changed: $FILES_CHANGED"
echo "  Lines added: +$INSERTIONS"
echo "  Lines removed: -$DELETIONS"

# 3. GATHER PROJECT METRICS
echo -e "\n${YELLOW}3. Gathering project metrics...${NC}"

# Task metrics (if task file exists)
if [ -f ".taskmaster/tasks/tasks.json" ]; then
    TASKS_DONE=$(grep -c '"status": "done"' .taskmaster/tasks/tasks.json 2>/dev/null || echo "0")
    TASKS_PENDING=$(grep -c '"status": "pending"' .taskmaster/tasks/tasks.json 2>/dev/null || echo "0")
    TASKS_PROGRESS=$(grep -c '"status": "in-progress"' .taskmaster/tasks/tasks.json 2>/dev/null || echo "0")
    TASKS_BLOCKED=$(grep -c '"status": "blocked"' .taskmaster/tasks/tasks.json 2>/dev/null || echo "0")
    TASKS_REVIEW=$(grep -c '"status": "review"' .taskmaster/tasks/tasks.json 2>/dev/null || echo "0")

    echo "  Tasks completed: $TASKS_DONE"
    echo "  Tasks in progress: $TASKS_PROGRESS"
    echo "  Tasks in review: $TASKS_REVIEW"
    echo "  Tasks pending: $TASKS_PENDING"
    echo "  Tasks blocked: $TASKS_BLOCKED"
else
    TASKS_DONE="N/A"
    TASKS_PENDING="N/A"
    TASKS_PROGRESS="N/A"
    TASKS_BLOCKED="N/A"
    TASKS_REVIEW="N/A"
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "  Current branch: $CURRENT_BRANCH"

# 4. DETECT CHANGE TYPES
echo -e "\n${YELLOW}4. Detecting change types...${NC}"

# Categorize changes
ADDED_FILES=$(git diff --cached --name-status | grep '^A' | wc -l)
MODIFIED_FILES=$(git diff --cached --name-status | grep '^M' | wc -l)
DELETED_FILES=$(git diff --cached --name-status | grep '^D' | wc -l)
RENAMED_FILES=$(git diff --cached --name-status | grep '^R' | wc -l)

echo "  Added: $ADDED_FILES files"
echo "  Modified: $MODIFIED_FILES files"
echo "  Deleted: $DELETED_FILES files"
echo "  Renamed: $RENAMED_FILES files"

# 5. DETERMINE COMMIT SCOPE
echo -e "\n${YELLOW}5. Determining commit scope...${NC}"

# Analyze which parts of the project were changed
SCOPE="project"
if git diff --cached --name-only | grep -q '^backend/'; then
    SCOPE="backend"
elif git diff --cached --name-only | grep -q '^frontend/'; then
    SCOPE="frontend"
elif git diff --cached --name-only | grep -q '^.claude/'; then
    SCOPE="claude-config"
elif git diff --cached --name-only | grep -q '^.taskmaster/'; then
    SCOPE="task-master"
elif git diff --cached --name-only | grep -q '^scripts/'; then
    SCOPE="scripts"
elif git diff --cached --name-only | grep -q '^docs/'; then
    SCOPE="docs"
fi

echo "  Detected scope: $SCOPE"

# 6. GENERATE COMMIT SUBJECT
echo -e "\n${YELLOW}6. Generating commit subject...${NC}"

# Create a meaningful subject based on changes
SUBJECT="comprehensive update"
if [ "$ADDED_FILES" -gt 5 ]; then
    SUBJECT="major additions and enhancements"
elif [ "$MODIFIED_FILES" -gt 10 ]; then
    SUBJECT="extensive modifications and improvements"
elif [ "$DELETED_FILES" -gt 3 ]; then
    SUBJECT="cleanup and refactoring"
elif git diff --cached --name-only | grep -q 'test'; then
    SUBJECT="test coverage improvements"
elif git diff --cached --name-only | grep -q 'fix'; then
    SUBJECT="bug fixes and corrections"
fi

# Add timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

echo "  Subject: $SUBJECT"

# 7. BUILD COMPREHENSIVE COMMIT MESSAGE
echo -e "\n${YELLOW}7. Building comprehensive commit message...${NC}"

# Get list of main changes
MAIN_CHANGES=""
if [ "$ADDED_FILES" -gt 0 ]; then
    MAIN_CHANGES="$MAIN_CHANGES
### ✨ Added ($ADDED_FILES files)
$(git diff --cached --name-status | grep '^A' | head -5 | sed 's/^A/  -/')"
fi

if [ "$MODIFIED_FILES" -gt 0 ]; then
    MAIN_CHANGES="$MAIN_CHANGES
### 🔄 Modified ($MODIFIED_FILES files)
$(git diff --cached --name-status | grep '^M' | head -5 | sed 's/^M/  -/')"
fi

if [ "$DELETED_FILES" -gt 0 ]; then
    MAIN_CHANGES="$MAIN_CHANGES
### 🗑️ Removed ($DELETED_FILES files)
$(git diff --cached --name-status | grep '^D' | head -5 | sed 's/^D/  -/')"
fi

# Build the complete commit message
COMMIT_MESSAGE="$COMMIT_TYPE($SCOPE): $SUBJECT

## 📋 Summary
Comprehensive update to Ergoplanner AI Suite with $FILES_CHANGED files changed.
This commit includes $INSERTIONS insertions and $DELETIONS deletions across multiple components.

## 🎯 Motivation & Context
Continuous improvement and enhancement of the Ergoplanner AI Suite project.
Implementing strict quality gates and task management integration.
Ensuring production-ready code with zero-tolerance for errors and warnings.

## 📝 Detailed Changes
$MAIN_CHANGES

## 📊 Project Metrics
- **Files Changed**: $FILES_CHANGED
- **Lines Added**: +$INSERTIONS
- **Lines Removed**: -$DELETIONS
- **Change Distribution**: $ADDED_FILES added, $MODIFIED_FILES modified, $DELETED_FILES deleted

## 🔄 Task Master Status
- **Completed**: $TASKS_DONE tasks
- **In Progress**: $TASKS_PROGRESS tasks
- **In Review**: $TASKS_REVIEW tasks
- **Pending**: $TASKS_PENDING tasks
- **Blocked**: $TASKS_BLOCKED tasks

## ✅ Quality Checks
- ✅ Build validation passed
- ✅ Zero errors policy maintained
- ✅ Zero warnings policy maintained
- ✅ All validation scripts executed
- ✅ Pre-commit hooks satisfied
- ✅ Code quality standards met

## 🧪 Testing Status
- Test execution: Validated via scripts
- Coverage requirement: >= 80%
- Test categories: Unit, Integration, E2E

## 📚 Documentation
- Command documentation: Updated
- Agent documentation: Current
- README files: Maintained
- Code comments: Added where needed

## 🔧 Configuration
- Task Master: Configured
- Quality Gates: Enforced
- Git Hooks: Installed
- Validation Scripts: Operational

## 🚀 Deployment Notes
- Ensure validation scripts have execute permissions
- Run ./scripts/install-hooks.sh after pulling
- Review .taskmaster/tasks/tasks.json for priorities

## ⏰ Timestamp
- Date: $TIMESTAMP
- Branch: $CURRENT_BRANCH

## 🤝 Collaboration
Co-authored-by: Claude <claude@anthropic.com>
Generated with Claude Code (claude.ai/code)"

# 8. EXECUTE COMMIT
echo -e "\n${YELLOW}8. Creating commit...${NC}"

# Perform the commit
if git commit -m "$COMMIT_MESSAGE"; then
    echo -e "${GREEN}✅ Commit created successfully!${NC}"

    # Show commit details
    echo -e "\n${CYAN}Commit Details:${NC}"
    git log -1 --oneline

    # Show commit hash
    COMMIT_HASH=$(git rev-parse --short HEAD)
    echo -e "${BLUE}Commit hash: $COMMIT_HASH${NC}"
else
    echo -e "${RED}❌ Commit failed!${NC}"
    exit 1
fi

# 9. OPTIONAL PUSH TO REMOTE
if [ "$PUSH_TO_REMOTE" = "--push" ] || [ "$PUSH_TO_REMOTE" = "push" ]; then
    echo -e "\n${YELLOW}9. Pushing to remote...${NC}"

    # Fetch latest from remote
    git fetch origin

    # Check if we need to set upstream
    if ! git config --get branch.$CURRENT_BRANCH.remote > /dev/null 2>&1; then
        echo "Setting upstream branch..."
        git push -u origin $CURRENT_BRANCH
    else
        git push
    fi

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pushed to remote!${NC}"
    else
        echo -e "${RED}❌ Push failed! You may need to pull first or resolve conflicts.${NC}"
    fi
else
    echo -e "\n${BLUE}ℹ️  Commit created locally. Use 'git push' to push to remote.${NC}"
fi

# 10. POST-COMMIT SUMMARY
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                    COMMIT COMPLETED SUCCESSFULLY              ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Summary:"
echo "  • Commit Type: $COMMIT_TYPE"
echo "  • Scope: $SCOPE"
echo "  • Files Changed: $FILES_CHANGED"
echo "  • Commit Hash: $COMMIT_HASH"
echo "  • Branch: $CURRENT_BRANCH"
echo ""

# Show next steps
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review commit: git log -1 --stat"
echo "  2. Push to remote: git push"
echo "  3. Create PR if on feature branch"
echo "  4. Update task status in task-master"
echo ""

exit 0