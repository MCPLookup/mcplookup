# Quick sync script for immediate mirroring
# Usage: .\quick-sync.ps1

Write-Host "Quick Mirror Sync" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

try {
    # Fetch both remotes
    Write-Host "Fetching from both remotes..." -ForegroundColor Yellow
    git fetch origin --prune
    git fetch org --prune

    # Push to org
    Write-Host "Pushing to organization..." -ForegroundColor Yellow
    git push org --all
    git push org --tags

    # Check for org changes
    $orgCommits = git log origin/main..org/main --oneline 2>$null
    if ($orgCommits) {
        Write-Host "Found changes in org, merging..." -ForegroundColor Yellow
        git checkout main
        git merge org/main --no-edit
        git push origin main
    }

    Write-Host "Quick sync completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Sync failed: $_" -ForegroundColor Red
}
