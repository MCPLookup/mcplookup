#!/bin/bash
# Comprehensive Security Audit Script
# Checks for various security issues in the codebase

set -e

echo "🔒 MCPLookup.org Security Audit"
echo "==============================="
echo ""

ISSUES_FOUND=0

# Function to report issues
report_issue() {
    echo "❌ ISSUE: $1"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
}

report_ok() {
    echo "✅ OK: $1"
}

echo "🔍 1. CREDENTIAL LEAK SCAN"
echo "-------------------------"

# Check for common secret patterns
SECRET_PATTERNS=(
    "sk-[A-Za-z0-9]+"                       # OpenAI API keys
    "ghp_[A-Za-z0-9]+"                      # GitHub personal access tokens
    "gho_[A-Za-z0-9]+"                      # GitHub OAuth tokens
    "github_pat_[A-Za-z0-9_]+"              # GitHub fine-grained tokens
    "glpat-[A-Za-z0-9\-]+"                  # GitLab personal access tokens
    "AKIA[A-Z0-9]{16}"                      # AWS access key IDs
    "ya29\.[A-Za-z0-9\-_]+"                 # Google OAuth tokens
    "AIza[A-Za-z0-9\-_]{35}"                # Google API keys
    "Bearer [A-Za-z0-9\-\._~\+/]+=*"        # Bearer tokens
    "[A-Za-z0-9]{32,}"                      # Long alphanumeric strings (potential tokens)
)

SECRETS_FOUND=false
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -rE "$pattern" . --exclude-dir=.git --exclude-dir=node_modules --exclude="*.log" --exclude="security-audit.sh" --exclude="setup-security-hooks.sh" 2>/dev/null; then
        report_issue "Potential secret pattern found: $pattern"
        SECRETS_FOUND=true
    fi
done

if [ "$SECRETS_FOUND" = false ]; then
    report_ok "No secret patterns detected"
fi

echo ""
echo "🔍 2. ENVIRONMENT FILE SECURITY"
echo "-------------------------------"

# Check .env files
if [ -f ".env" ]; then
    report_issue ".env file exists (should be .env.local or .env.example)"
fi

if [ -f ".env.production" ]; then
    report_issue ".env.production file exists (should use environment variables)"
fi

if [ -f ".env.local" ]; then
    if grep -q "your-" .env.local; then
        report_ok ".env.local contains placeholder values"
    else
        report_issue ".env.local may contain real credentials"
    fi
fi

if [ -f ".env.example" ]; then
    if grep -q "your-" .env.example; then
        report_ok ".env.example contains placeholder values"
    else
        report_issue ".env.example may contain real credentials"
    fi
fi

echo ""
echo "🔍 3. GITIGNORE VERIFICATION"
echo "---------------------------"

if grep -q "\.env" .gitignore; then
    report_ok ".env files are gitignored"
else
    report_issue ".env files not properly gitignored"
fi

if grep -q "node_modules" .gitignore; then
    report_ok "node_modules is gitignored"
else
    report_issue "node_modules not gitignored"
fi

echo ""
echo "🔍 4. DEPENDENCY VULNERABILITIES"
echo "--------------------------------"

if command -v npm &> /dev/null; then
    echo "Running npm audit..."
    if npm audit --audit-level=moderate 2>/dev/null; then
        report_ok "No moderate+ vulnerabilities found"
    else
        report_issue "Vulnerabilities found - run 'npm audit fix'"
    fi
else
    report_issue "npm not available for dependency audit"
fi

echo ""
echo "🔍 5. SECURITY HEADERS CHECK"
echo "---------------------------"

if [ -f "next.config.js" ]; then
    if grep -q "X-Frame-Options\|X-Content-Type-Options\|X-XSS-Protection" next.config.js; then
        report_ok "Security headers configured in next.config.js"
    else
        report_issue "Security headers not configured in next.config.js"
    fi
fi

echo ""
echo "🔍 6. CORS CONFIGURATION"
echo "-----------------------"

if grep -r "Access-Control-Allow-Origin.*\*" src/ 2>/dev/null; then
    report_issue "Wildcard CORS detected - consider restricting origins"
else
    report_ok "No wildcard CORS found"
fi

echo ""
echo "🔍 7. INPUT VALIDATION"
echo "---------------------"

if grep -r "z\.object\|z\.string\|z\.number" src/ 2>/dev/null >/dev/null; then
    report_ok "Zod validation schemas found"
else
    report_issue "No Zod validation schemas detected"
fi

echo ""
echo "🔍 8. AUTHENTICATION SECURITY"
echo "-----------------------------"

if [ -f "auth.ts" ]; then
    if grep -q "trustHost.*true" auth.ts; then
        report_issue "trustHost: true found - ensure this is intentional"
    fi
    
    if grep -q "session.*strategy.*database" auth.ts; then
        report_ok "Database session strategy configured"
    fi
fi

echo ""
echo "🔍 9. GIT HOOKS STATUS"
echo "---------------------"

if [ -f ".git/hooks/pre-commit" ] && [ -x ".git/hooks/pre-commit" ]; then
    report_ok "Pre-commit hook installed and executable"
else
    report_issue "Pre-commit hook not installed - run ./scripts/setup-security-hooks.sh"
fi

echo ""
echo "🔍 10. PRODUCTION READINESS"
echo "--------------------------"

if [ -f "Dockerfile" ]; then
    if grep -q "USER.*node\|USER.*app" Dockerfile; then
        report_ok "Dockerfile uses non-root user"
    else
        report_issue "Dockerfile may be running as root"
    fi
fi

if [ -f "package.json" ]; then
    if grep -q '"engines"' package.json; then
        report_ok "Node.js version specified in package.json"
    else
        report_issue "Node.js version not specified in package.json"
    fi
fi

echo ""
echo "📊 SECURITY AUDIT SUMMARY"
echo "========================="

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "🎉 EXCELLENT! No security issues found."
    echo "   Your repository appears to be secure."
else
    echo "⚠️  Found $ISSUES_FOUND security issue(s) that should be addressed."
    echo "   Please review and fix the issues listed above."
fi

echo ""
echo "🛡️ RECOMMENDATIONS:"
echo "- Run this audit regularly (weekly)"
echo "- Keep dependencies updated"
echo "- Monitor for new security advisories"
echo "- Review code changes for security implications"
echo ""

exit $ISSUES_FOUND
