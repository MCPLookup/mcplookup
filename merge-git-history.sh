#!/bin/bash
# Script to merge git histories from 4 separate repos into monorepo
# This preserves all commit history from each repository

set -e

echo "🚀 Merging git histories into monorepo..."

# Function to merge a subdirectory's git history
merge_repo_history() {
    local dir_name=$1
    local repo_path=$2
    
    echo "📁 Processing $dir_name..."
    
    # Add the subdirectory as a remote
    git remote add "$dir_name-remote" "$repo_path"
    
    # Fetch the history
    git fetch "$dir_name-remote"
    
    # Determine which branch to use
    local branch_to_use=""
    if git show-ref --verify --quiet "refs/remotes/$dir_name-remote/main"; then
        branch_to_use="main"
        echo "   Using main branch"
    elif git show-ref --verify --quiet "refs/remotes/$dir_name-remote/master"; then
        branch_to_use="master"
        echo "   Using master branch"
    else
        echo "⚠️  Could not find main/master branch for $dir_name"
        git remote remove "$dir_name-remote"
        return 1
    fi
    
    # Merge the history with subtree strategy
    git merge -s ours --no-commit --allow-unrelated-histories "$dir_name-remote/$branch_to_use"
    
    # Read the tree from the remote and put it in the subdirectory
    git read-tree --prefix="$dir_name/" -u "$dir_name-remote/$branch_to_use"
    
    # Commit the merge
    git commit -m "Merge $dir_name repository history

- Preserves full git history from original $dir_name repository
- All commits, authors, and timestamps maintained
- Integrated into monorepo structure"
    
    # Remove the remote
    git remote remove "$dir_name-remote"
    
    echo "✅ $dir_name history merged successfully"
}

# Store current directory
MONOREPO_ROOT=$(pwd)



# Remove existing directories (we'll recreate them with history)
echo "🧹 Removing existing directories to recreate with history..."
rm -rf mcp-sdk mcp-server mcpl-cli mcplookup.org

# Merge each repository
merge_repo_history "mcp-sdk" "./mcp-sdk.backup"
merge_repo_history "mcp-server" "./mcp-server.backup" 
merge_repo_history "mcpl-cli" "./mcpl-cli.backup"
merge_repo_history "mcplookup.org" "./mcplookup.org.backup"

echo ""
echo "🎉 Monorepo creation complete!"
echo ""
echo "📊 Summary:"
git log --oneline --graph -10
echo ""
echo "📁 Directory structure:"
ls -la
echo ""
echo "🔧 Next steps:"
echo "1. npm install  # Reinstall dependencies"
echo "2. npm run build  # Test the build"
echo "3. git log --oneline  # View merged history"
echo ""
echo "💾 Backups available at:"
echo "   - mcp-sdk.backup/"
echo "   - mcp-server.backup/"
echo "   - mcpl-cli.backup/"
echo "   - mcplookup.org.backup/"
echo ""
echo "🗑️  Remove backups when you're satisfied:"
echo "   rm -rf *.backup"
