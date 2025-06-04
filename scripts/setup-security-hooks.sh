#!/bin/bash
# Security Hooks Setup Script
# Installs pre-commit hooks to prevent credential leaks

set -e

echo "🔒 Setting up security hooks for MCPLookup.org"
echo "=============================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook to prevent credential leaks

echo "🔍 Scanning for potential secrets..."

# Patterns to detect (case-insensitive)
SECRET_PATTERNS=(
    "AZUTAA[A-Za-z0-9]+"                    # Upstash token pattern
    "[A-Za-z0-9]{32,}"                      # Long alphanumeric strings
    "sk-[A-Za-z0-9]+"                       # OpenAI API keys
    "ghp_[A-Za-z0-9]+"                      # GitHub personal access tokens
    "gho_[A-Za-z0-9]+"                      # GitHub OAuth tokens
    "github_pat_[A-Za-z0-9_]+"              # GitHub fine-grained tokens
    "glpat-[A-Za-z0-9\-]+"                  # GitLab personal access tokens
    "AKIA[A-Z0-9]{16}"                      # AWS access key IDs
    "[A-Za-z0-9/+=]{40}"                    # AWS secret access keys
    "ya29\.[A-Za-z0-9\-_]+"                 # Google OAuth tokens
    "AIza[A-Za-z0-9\-_]{35}"                # Google API keys
    "postgres://[^\\s]+"                    # PostgreSQL connection strings
    "mysql://[^\\s]+"                       # MySQL connection strings
    "mongodb://[^\\s]+"                     # MongoDB connection strings
    "redis://[^\\s]+"                       # Redis connection strings
    "Bearer [A-Za-z0-9\-\._~\+/]+=*"        # Bearer tokens
    "password[\"'\\s]*[:=][\"'\\s]*[^\\s\"']{8,}" # Password assignments
)

# Files to check (staged files)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
    echo "✅ No staged files to check"
    exit 0
fi

# Check each staged file
SECRETS_FOUND=false

for file in $STAGED_FILES; do
    # Skip binary files and certain file types
    if [[ "$file" =~ \.(jpg|jpeg|png|gif|pdf|zip|tar|gz|exe|dll|so|dylib)$ ]]; then
        continue
    fi
    
    # Skip node_modules and other directories
    if [[ "$file" =~ ^(node_modules|\.git|dist|build)/ ]]; then
        continue
    fi
    
    # Check if file exists (might be deleted)
    if [ ! -f "$file" ]; then
        continue
    fi
    
    echo "🔍 Checking: $file"
    
    # Check each pattern
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if grep -qiE "$pattern" "$file"; then
            echo "🚨 POTENTIAL SECRET DETECTED in $file:"
            grep -niE "$pattern" "$file" | head -3
            echo ""
            SECRETS_FOUND=true
        fi
    done
    
    # Check for specific known bad patterns
    if grep -q "your-database-name" "$file"; then
        echo "🚨 EXPOSED UPSTASH URL DETECTED in $file"
        SECRETS_FOUND=true
    fi
    
    if grep -q "REDACTED_TOKEN" "$file"; then
        echo "🚨 EXPOSED UPSTASH TOKEN DETECTED in $file"
        SECRETS_FOUND=true
    fi
done

if [ "$SECRETS_FOUND" = true ]; then
    echo ""
    echo "❌ COMMIT BLOCKED: Potential secrets detected!"
    echo ""
    echo "🔧 To fix:"
    echo "1. Remove or replace the detected secrets with placeholders"
    echo "2. Use environment variables for real secrets"
    echo "3. Add sensitive files to .gitignore"
    echo ""
    echo "🚨 If these are false positives, you can:"
    echo "   - Use git commit --no-verify to bypass (NOT RECOMMENDED)"
    echo "   - Update the patterns in .git/hooks/pre-commit"
    echo ""
    exit 1
fi

echo "✅ No secrets detected. Commit allowed."
exit 0
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit

# Create commit-msg hook for additional validation
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash
# Commit message hook to warn about security-related commits

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Check for security-related keywords in commit message
if echo "$COMMIT_MSG" | grep -qiE "(secret|password|token|key|credential|api.key)"; then
    echo "⚠️  WARNING: Commit message contains security-related keywords"
    echo "   Please ensure no actual secrets are being committed"
    echo ""
fi

# Check for common mistake patterns
if echo "$COMMIT_MSG" | grep -qiE "(fix.secret|remove.secret|hide.secret)"; then
    echo "🚨 SECURITY ALERT: This commit appears to be fixing a secret leak"
    echo "   Remember to scrub git history if secrets were previously committed"
    echo ""
fi

exit 0
EOF

chmod +x .git/hooks/commit-msg

echo ""
echo "✅ Security hooks installed successfully!"
echo ""
echo "📋 Installed hooks:"
echo "   • pre-commit: Scans for potential secrets before commit"
echo "   • commit-msg: Warns about security-related commit messages"
echo ""
echo "🧪 Test the hooks:"
echo "   echo 'UPSTASH_REDIS_REST_TOKEN=sk-test123' > test-secret.txt"
echo "   git add test-secret.txt"
echo "   git commit -m 'test commit' # Should be blocked"
echo "   rm test-secret.txt"
echo ""
echo "🔧 To bypass hooks (NOT RECOMMENDED):"
echo "   git commit --no-verify"
echo ""
echo "📝 To update hook patterns:"
echo "   Edit .git/hooks/pre-commit"
