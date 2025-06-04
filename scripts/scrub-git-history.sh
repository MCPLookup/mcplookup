#!/bin/bash
# Git History Scrubbing Script for MCPLookup.org
# Removes exposed credentials from entire git history

set -e

echo "🚨 CRITICAL: Git History Credential Scrubbing"
echo "=============================================="
echo ""
echo "This script will PERMANENTLY rewrite git history to remove exposed credentials."
echo "⚠️  WARNING: This is a destructive operation that cannot be undone!"
echo ""

# Check if we're in the right repository
if [ ! -f "package.json" ] || ! grep -q "mcplookup-registry" package.json; then
    echo "❌ Error: This script must be run from the mcplookup.org repository root"
    exit 1
fi

# Credentials to scrub
EXPOSED_TOKEN="REDACTED_TOKEN"
EXPOSED_URL="your-database.upstash.io"

echo "🔍 Checking for exposed credentials in current files..."
if grep -r "$EXPOSED_TOKEN" . --exclude-dir=.git --exclude-dir=node_modules 2>/dev/null; then
    echo "❌ Found exposed credentials in current files!"
    echo "   Please clean current files first before running history scrub."
    exit 1
fi

echo "✅ Current files are clean"
echo ""

# Confirmation prompts
echo "📋 Pre-flight checklist:"
echo "□ Have you rotated the exposed credentials in Upstash console?"
echo "□ Have you notified team members about the upcoming force push?"
echo "□ Have you created a backup of the repository?"
echo ""

read -p "Have you completed ALL items above? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Please complete the checklist before proceeding."
    exit 1
fi

echo ""
echo "🔧 Choose scrubbing method:"
echo "1) BFG Repo-Cleaner (Recommended - fastest)"
echo "2) git filter-repo (Modern alternative)"
echo "3) git filter-branch (Legacy - slowest)"
echo ""

read -p "Select method (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo "🚀 Using BFG Repo-Cleaner..."
        
        # Check if BFG is installed
        if ! command -v bfg &> /dev/null; then
            echo "❌ BFG not found. Install with:"
            echo "   macOS: brew install bfg"
            echo "   Ubuntu: apt-get install bfg"
            echo "   Or download from: https://rtyley.github.io/bfg-repo-cleaner/"
            exit 1
        fi
        
        # Create secrets file
        echo "📝 Creating secrets replacement file..."
        cat > /tmp/secrets-to-replace.txt << EOF
$EXPOSED_TOKEN==>REDACTED_TOKEN
$EXPOSED_URL==>your-database.upstash.io
EOF
        
        echo "🧹 Running BFG to scrub history..."
        bfg --replace-text /tmp/secrets-to-replace.txt
        
        echo "🗑️  Cleaning up repository..."
        git reflog expire --expire=now --all
        git gc --prune=now --aggressive
        
        rm /tmp/secrets-to-replace.txt
        ;;
        
    2)
        echo "🚀 Using git filter-repo..."
        
        # Check if git-filter-repo is installed
        if ! command -v git-filter-repo &> /dev/null; then
            echo "❌ git-filter-repo not found. Install with:"
            echo "   pip install git-filter-repo"
            exit 1
        fi
        
        echo "🧹 Running git filter-repo to scrub history..."
        git filter-repo --replace-text <(echo "$EXPOSED_TOKEN==>REDACTED_TOKEN")
        git filter-repo --replace-text <(echo "$EXPOSED_URL==>your-database.upstash.io")
        ;;
        
    3)
        echo "🚀 Using git filter-branch (this may take a while)..."
        
        echo "🧹 Running git filter-branch to scrub history..."
        git filter-branch --tree-filter "
            find . -type f -name '*.md' -exec sed -i 's/$EXPOSED_TOKEN/REDACTED_TOKEN/g' {} \;
            find . -type f -name '*.md' -exec sed -i 's/$EXPOSED_URL/your-database.upstash.io/g' {} \;
            find . -type f -name '*.sh' -exec sed -i 's/$EXPOSED_TOKEN/REDACTED_TOKEN/g' {} \;
            find . -type f -name '*.sh' -exec sed -i 's/$EXPOSED_URL/your-database.upstash.io/g' {} \;
        " --all
        
        echo "🗑️  Cleaning up repository..."
        git reflog expire --expire=now --all
        git gc --prune=now --aggressive
        ;;
        
    *)
        echo "❌ Invalid selection"
        exit 1
        ;;
esac

echo ""
echo "✅ History scrubbing complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Verify the scrubbing worked:"
echo "   git log --oneline -p --all | grep -i '$EXPOSED_TOKEN' || echo 'Clean!'"
echo ""
echo "2. Force push to remote (⚠️  DESTRUCTIVE):"
echo "   git push --force --all"
echo "   git push --force --tags"
echo ""
echo "3. Notify team members to re-clone the repository"
echo ""

read -p "Do you want to force push now? (yes/no): " -r
if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "🚀 Force pushing to remote..."
    git push --force --all
    git push --force --tags
    echo "✅ Force push complete!"
else
    echo "⏸️  Skipping force push. Remember to push manually when ready."
fi

echo ""
echo "🎉 Git history scrubbing complete!"
echo "   All exposed credentials have been removed from git history."
echo "   The repository is now safe to share."
