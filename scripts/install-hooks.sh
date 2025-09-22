#!/bin/bash
# Install git hooks for Ergoplanner AI Suite

echo "Installing git hooks for quality enforcement..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Ergoplanner pre-commit hook
# This hook runs quality checks before allowing commits

echo "Running pre-commit quality checks..."

# Run the pre-commit check script
if [ -f "./scripts/pre-commit-check.sh" ]; then
    ./scripts/pre-commit-check.sh
    exit $?
else
    echo "Warning: pre-commit-check.sh not found"
    echo "Please ensure scripts/pre-commit-check.sh exists"
    exit 1
fi
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit
chmod +x scripts/validate-build.sh
chmod +x scripts/pre-commit-check.sh

echo "✅ Git hooks installed successfully!"
echo ""
echo "The following hooks are now active:"
echo "  - pre-commit: Runs build validation and quality checks"
echo ""
echo "To bypass hooks in emergency (NOT RECOMMENDED):"
echo "  git commit --no-verify"
echo ""
echo "⚠️  WARNING: Bypassing hooks is FORBIDDEN in normal workflow!"