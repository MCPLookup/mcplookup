#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Two-way mirror sync between TSavo/mcplookup.org and mcplookup-org/mcplookup.org

.DESCRIPTION
    This script synchronizes changes between your personal repo (origin) and 
    the organization repo (org) in both directions.

.PARAMETER Direction
    Sync direction: "to-org", "from-org", or "both" (default)

.PARAMETER Force
    Force push (use with caution)

.EXAMPLE
    .\sync-mirrors.ps1
    .\sync-mirrors.ps1 -Direction "to-org"
    .\sync-mirrors.ps1 -Direction "from-org"
#>

param(
    [ValidateSet("to-org", "from-org", "both")]
    [string]$Direction = "both",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

function Write-Status {
    param([string]$Message, [string]$Color = "Green")
    Write-Host "🔄 $Message" -ForegroundColor $Color
}

function Write-Error-Status {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

# Ensure we're in the right directory
if (!(Test-Path ".git")) {
    Write-Error-Status "Not in a git repository. Please run from the project root."
    exit 1
}

Write-Status "Starting two-way mirror sync..."

try {
    # Fetch latest from both remotes
    Write-Status "Fetching latest changes from both remotes..."
    git fetch origin --prune
    git fetch org --prune

    if ($Direction -eq "to-org" -or $Direction -eq "both") {
        Write-Status "Syncing from origin (TSavo) to org (mcplookup-org)..."
        
        # Push all branches and tags from origin to org
        if ($Force) {
            git push org --all --force
            git push org --tags --force
        } else {
            git push org --all
            git push org --tags
        }
        
        Write-Success "Synced to organization repo"
    }

    if ($Direction -eq "from-org" -or $Direction -eq "both") {
        Write-Status "Checking for changes in org that need to be pulled..."
        
        # Check if org has commits that origin doesn't
        $orgCommits = git log origin/main..org/main --oneline 2>$null
        
        if ($orgCommits) {
            Write-Status "Found new commits in org repo, merging..."
            
            # Make sure we're on main branch
            git checkout main
            
            # Merge changes from org
            git merge org/main --no-edit
            
            # Push merged changes back to origin
            git push origin main
            
            Write-Success "Merged changes from organization repo"
        } else {
            Write-Status "No new changes in organization repo"
        }
    }

    Write-Success "Mirror sync completed successfully!"

} catch {
    Write-Error-Status "Mirror sync failed: $_"
    Write-Host "You may need to resolve conflicts manually." -ForegroundColor Yellow
    exit 1
}
