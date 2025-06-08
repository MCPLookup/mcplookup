# Redis Sync PowerShell Script
# Wrapper for the Node.js Redis sync tool

param(
    [switch]$Reverse,
    [switch]$Watch,
    [switch]$DryRun,
    [switch]$Backup,
    [string]$Restore,
    [string]$Pattern = "*",
    [switch]$SkipExisting,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput([string]$message, [string]$color = "White") {
    $colors = @{
        "Red" = [ConsoleColor]::Red
        "Green" = [ConsoleColor]::Green
        "Yellow" = [ConsoleColor]::Yellow
        "Blue" = [ConsoleColor]::Blue
        "Cyan" = [ConsoleColor]::Cyan
        "Magenta" = [ConsoleColor]::Magenta
        "White" = [ConsoleColor]::White
    }
    Write-Host $message -ForegroundColor $colors[$color]
}

function Show-Help {
    Write-ColorOutput "🔄 Redis Sync Tool - Mirror Upstash Redis to Local Docker Redis" "Cyan"
    Write-Host ""
    Write-ColorOutput "Usage:" "Yellow"
    Write-Host "  .\scripts\redis-sync.ps1 [options]"
    Write-Host ""
    Write-ColorOutput "Options:" "Yellow"
    Write-Host "  -DryRun         Show what would be synced without making changes"
    Write-Host "  -Reverse        Sync from local to Upstash (⚠️  dangerous!)"
    Write-Host "  -Watch          Continuous sync mode (monitors changes)"
    Write-Host "  -Backup         Create backup before sync"
    Write-Host "  -Restore <file> Restore from backup file"
    Write-Host "  -Pattern <glob> Only sync keys matching pattern (default: *)"
    Write-Host "  -SkipExisting   Skip keys that already exist in destination"
    Write-Host "  -Help           Show this help message"
    Write-Host ""
    Write-ColorOutput "Examples:" "Yellow"
    Write-Host "  # Basic sync from Upstash to local"
    Write-Host "  .\scripts\redis-sync.ps1"
    Write-Host ""
    Write-Host "  # Dry run to see what would be synced"
    Write-Host "  .\scripts\redis-sync.ps1 -DryRun"
    Write-Host ""
    Write-Host "  # Sync specific pattern"
    Write-Host "  .\scripts\redis-sync.ps1 -Pattern 'mcp:*'"
    Write-Host ""
    Write-Host "  # Continuous sync"
    Write-Host "  .\scripts\redis-sync.ps1 -Watch"
    Write-Host ""
    Write-Host "  # Backup Upstash data"
    Write-Host "  .\scripts\redis-sync.ps1 -Backup"
    Write-Host ""
    Write-Host "  # Reverse sync (local to Upstash) - BE CAREFUL!"
    Write-Host "  .\scripts\redis-sync.ps1 -Reverse -DryRun"
    Write-Host ""
    Write-ColorOutput "NPM Shortcuts:" "Yellow"
    Write-Host "  npm run redis:sync           # Basic sync"
    Write-Host "  npm run redis:sync:dry       # Dry run"
    Write-Host "  npm run redis:sync:watch     # Continuous sync"
    Write-Host "  npm run redis:sync:reverse   # Reverse sync (dry run)"
    Write-Host "  npm run redis:backup:upstash # Backup Upstash data"
    Write-Host "  npm run redis:backup:local   # Backup local data"
    Write-Host ""
    Write-ColorOutput "Prerequisites:" "Yellow"
    Write-Host "  1. Docker Desktop running"
    Write-Host "  2. Local Redis running: npm run docker:up"
    Write-Host "  3. Environment variables set in .env.local"
}

function Test-Prerequisites {
    Write-ColorOutput "🔍 Checking prerequisites..." "Blue"
    
    # Check if Node.js is available
    try {
        $nodeVersion = node --version
        Write-ColorOutput "✅ Node.js: $nodeVersion" "Green"
    } catch {
        Write-ColorOutput "❌ Node.js not found. Please install Node.js." "Red"
        exit 1
    }

    # Check if .env.local exists
    if (!(Test-Path ".env.local")) {
        Write-ColorOutput "❌ .env.local not found. Please create it with your Upstash credentials." "Red"
        exit 1
    }
    Write-ColorOutput "✅ .env.local found" "Green"

    # Check if Docker is running
    try {
        docker info | Out-Null
        Write-ColorOutput "✅ Docker is running" "Green"
    } catch {
        Write-ColorOutput "❌ Docker is not running. Please start Docker Desktop." "Red"
        exit 1
    }

    # Check if local Redis is running
    try {
        $redisStatus = docker ps --filter "name=mcplookup-redis" --format "table {{.Names}}\t{{.Status}}"
        if ($redisStatus -match "mcplookup-redis") {
            Write-ColorOutput "✅ Local Redis is running" "Green"
        } else {
            Write-ColorOutput "⚠️  Local Redis not running. Starting it..." "Yellow"
            docker-compose up -d redis
            Start-Sleep 5
            Write-ColorOutput "✅ Local Redis started" "Green"
        }
    } catch {
        Write-ColorOutput "❌ Could not check Redis status. Run: npm run docker:up" "Red"
        exit 1
    }
}

function Build-Arguments {
    $args = @()
    
    if ($DryRun) { $args += "--dry-run" }
    if ($Reverse) { $args += "--reverse" }
    if ($Watch) { $args += "--watch" }
    if ($Backup) { $args += "--backup" }
    if ($Restore) { $args += "--restore=$Restore" }
    if ($Pattern -ne "*") { $args += "--pattern=$Pattern" }
    if ($SkipExisting) { $args += "--skip-existing" }
    
    return $args
}

function Main {
    if ($Help) {
        Show-Help
        return
    }

    Write-ColorOutput "🚀 Redis Sync Tool Starting..." "Cyan"
    Write-Host ""

    # Test prerequisites
    Test-Prerequisites
    Write-Host ""

    # Show warning for reverse sync
    if ($Reverse -and !$DryRun) {
        Write-ColorOutput "⚠️  WARNING: REVERSE SYNC MODE" "Red"
        Write-ColorOutput "You are about to sync FROM local TO Upstash (production)!" "Red"
        Write-ColorOutput "This will overwrite production data!" "Red"
        Write-Host ""
        
        $confirmation = Read-Host "Are you absolutely sure? Type 'YES' to continue"
        if ($confirmation -ne "YES") {
            Write-ColorOutput "❌ Operation cancelled for safety" "Yellow"
            return
        }
    }

    # Build arguments
    $nodeArgs = Build-Arguments
    
    # Show what we're about to do
    $direction = if ($Reverse) { "Local → Upstash" } else { "Upstash → Local" }
    $mode = if ($Watch) { "Continuous" } else { "One-time" }
    $dryText = if ($DryRun) { " (DRY RUN)" } else { "" }
    
    Write-ColorOutput "📋 Sync Configuration:" "Blue"
    Write-Host "   Direction: $direction"
    Write-Host "   Mode: $mode$dryText"
    Write-Host "   Pattern: $Pattern"
    if ($SkipExisting) { Write-Host "   Skip existing: Yes" }
    Write-Host ""

    # Execute the sync
    try {
        Write-ColorOutput "🔄 Starting sync..." "Blue"
        $command = "node"
        $scriptArgs = @("scripts/redis-sync.js") + $nodeArgs
        
        & $command $scriptArgs
        
        Write-Host ""
        Write-ColorOutput "✅ Sync completed successfully!" "Green"
        
    } catch {
        Write-Host ""
        Write-ColorOutput "❌ Sync failed: $($_.Exception.Message)" "Red"
        exit 1
    }
}

# Run the main function
Main
