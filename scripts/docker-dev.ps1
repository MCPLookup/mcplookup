# MCPLookup.org Docker Development Environment Manager (PowerShell)

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    [Parameter(Position=1)]
    [string]$Service = ""
)

$DOCKER_COMPOSE_DEV = "docker-compose -f docker-compose.dev.yml"
$DOCKER_COMPOSE_PROD = "docker-compose -f docker-compose.yml"

function Show-Help {
    Write-Host "MCPLookup.org Docker Development Environment Manager" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-dev.ps1 [COMMAND] [OPTIONS]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Green
    Write-Host "  dev-up         Start development environment (Redis + App + UI)"
    Write-Host "  dev-down       Stop development environment"
    Write-Host "  dev-logs       Show development logs"
    Write-Host "  dev-redis      Start only Redis and Redis UI for development"
    Write-Host "  dev-app        Start only the app (requires Redis to be running)"
    Write-Host "  dev-build      Build development app image"
    Write-Host "  prod-up        Start production environment"
    Write-Host "  prod-down      Stop production environment"
    Write-Host "  prod-build     Build production app image"
    Write-Host "  redis-cli      Connect to Redis CLI"
    Write-Host "  test-redis     Test Redis storage integration"
    Write-Host "  clean          Remove all containers and volumes"
    Write-Host "  status         Show container status"
    Write-Host "  help           Show this help message"
    Write-Host ""
    Write-Host "URLs:" -ForegroundColor Magenta
    Write-Host "  App:         http://localhost:3000"
    Write-Host "  Redis UI:    http://localhost:8081 (admin/admin123)"
    Write-Host "  Redis:       localhost:6379"
}

switch ($Command) {
    "dev-up" {
        Write-Host "🚀 Starting development environment..." -ForegroundColor Green
        Invoke-Expression "$DOCKER_COMPOSE_DEV up -d"
        Write-Host "✅ Development environment started!" -ForegroundColor Green
        Write-Host "🌐 App: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "🔍 Redis UI: http://localhost:8081 (admin/admin123)" -ForegroundColor Cyan
    }
    
    "dev-down" {
        Write-Host "🛑 Stopping development environment..." -ForegroundColor Yellow
        Invoke-Expression "$DOCKER_COMPOSE_DEV down"
        Write-Host "✅ Development environment stopped!" -ForegroundColor Green
    }
    
    "dev-logs" {
        if ($Service) {
            Invoke-Expression "$DOCKER_COMPOSE_DEV logs -f $Service"
        } else {
            Invoke-Expression "$DOCKER_COMPOSE_DEV logs -f"
        }
    }
    
    "dev-redis" {
        Write-Host "🚀 Starting Redis services for development..." -ForegroundColor Green
        Invoke-Expression "$DOCKER_COMPOSE_DEV up redis redis-commander -d"
        Write-Host "✅ Redis services started!" -ForegroundColor Green
        Write-Host "🔍 Redis UI: http://localhost:8081 (admin/admin123)" -ForegroundColor Cyan
    }
    
    "dev-app" {
        Write-Host "🚀 Starting development app..." -ForegroundColor Green
        Invoke-Expression "$DOCKER_COMPOSE_DEV up app -d"
        Write-Host "✅ Development app started!" -ForegroundColor Green
        Write-Host "🌐 App: http://localhost:3000" -ForegroundColor Cyan
    }
    
    "dev-build" {
        Write-Host "🔨 Building development app image..." -ForegroundColor Yellow
        Invoke-Expression "$DOCKER_COMPOSE_DEV build app"
        Write-Host "✅ Development app built!" -ForegroundColor Green
    }
    
    "prod-up" {
        Write-Host "🚀 Starting production environment..." -ForegroundColor Green
        Invoke-Expression "$DOCKER_COMPOSE_PROD up -d"
        Write-Host "✅ Production environment started!" -ForegroundColor Green
    }
    
    "prod-down" {
        Write-Host "🛑 Stopping production environment..." -ForegroundColor Yellow
        Invoke-Expression "$DOCKER_COMPOSE_PROD down"
        Write-Host "✅ Production environment stopped!" -ForegroundColor Green
    }
    
    "prod-build" {
        Write-Host "🔨 Building production app image..." -ForegroundColor Yellow
        Invoke-Expression "$DOCKER_COMPOSE_PROD build app"
        Write-Host "✅ Production app built!" -ForegroundColor Green
    }
    
    "redis-cli" {
        Write-Host "🔗 Connecting to Redis CLI..." -ForegroundColor Cyan
        docker exec -it mcplookup-redis-dev redis-cli
    }
    
    "test-redis" {
        Write-Host "🧪 Testing Redis storage integration..." -ForegroundColor Cyan
        if (Test-Path "scripts/test-redis-storage.ts") {
            npm run tsx scripts/test-redis-storage.ts
        } else {
            Write-Host "❌ Test script not found!" -ForegroundColor Red
        }
    }
    
    "clean" {
        Write-Host "🧹 Cleaning up all containers and volumes..." -ForegroundColor Yellow
        Invoke-Expression "$DOCKER_COMPOSE_DEV down -v --remove-orphans"
        Invoke-Expression "$DOCKER_COMPOSE_PROD down -v --remove-orphans"
        docker system prune -f
        Write-Host "✅ Cleanup complete!" -ForegroundColor Green
    }
    
    "status" {
        Write-Host "📊 Container Status:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Development:" -ForegroundColor Yellow
        try {
            Invoke-Expression "$DOCKER_COMPOSE_DEV ps"
        } catch {
            Write-Host "  No development containers running" -ForegroundColor Gray
        }
        Write-Host ""
        Write-Host "Production:" -ForegroundColor Yellow
        try {
            Invoke-Expression "$DOCKER_COMPOSE_PROD ps"
        } catch {
            Write-Host "  No production containers running" -ForegroundColor Gray
        }
    }
    
    default {
        Show-Help
    }
}
