#!/bin/bash
# MCPLookup.org Docker Development Environment Manager

set -e

DOCKER_COMPOSE_DEV="docker-compose -f docker-compose.dev.yml"
DOCKER_COMPOSE_PROD="docker-compose -f docker-compose.yml"

show_help() {
    echo "MCPLookup.org Docker Development Environment Manager"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dev-up         Start development environment (Redis + App + UI)"
    echo "  dev-down       Stop development environment"
    echo "  dev-logs       Show development logs"
    echo "  dev-redis      Start only Redis and Redis UI for development"
    echo "  dev-app        Start only the app (requires Redis to be running)"
    echo "  dev-build      Build development app image"
    echo "  prod-up        Start production environment"
    echo "  prod-down      Stop production environment"
    echo "  prod-build     Build production app image"
    echo "  redis-cli      Connect to Redis CLI"
    echo "  test-redis     Test Redis storage integration"
    echo "  clean          Remove all containers and volumes"
    echo "  status         Show container status"
    echo "  help           Show this help message"
    echo ""
    echo "URLs:"
    echo "  App:         http://localhost:3000"
    echo "  Redis UI:    http://localhost:8081 (admin/admin123)"
    echo "  Redis:       localhost:6379"
}

case "${1:-help}" in
    "dev-up")
        echo "🚀 Starting development environment..."
        $DOCKER_COMPOSE_DEV up -d
        echo "✅ Development environment started!"
        echo "🌐 App: http://localhost:3000"
        echo "🔍 Redis UI: http://localhost:8081 (admin/admin123)"
        ;;
    
    "dev-down")
        echo "🛑 Stopping development environment..."
        $DOCKER_COMPOSE_DEV down
        echo "✅ Development environment stopped!"
        ;;
    
    "dev-logs")
        $DOCKER_COMPOSE_DEV logs -f ${2:-}
        ;;
    
    "dev-redis")
        echo "🚀 Starting Redis services for development..."
        $DOCKER_COMPOSE_DEV up redis redis-commander -d
        echo "✅ Redis services started!"
        echo "🔍 Redis UI: http://localhost:8081 (admin/admin123)"
        ;;
    
    "dev-app")
        echo "🚀 Starting development app..."
        $DOCKER_COMPOSE_DEV up app -d
        echo "✅ Development app started!"
        echo "🌐 App: http://localhost:3000"
        ;;
    
    "dev-build")
        echo "🔨 Building development app image..."
        $DOCKER_COMPOSE_DEV build app
        echo "✅ Development app built!"
        ;;
    
    "prod-up")
        echo "🚀 Starting production environment..."
        $DOCKER_COMPOSE_PROD up -d
        echo "✅ Production environment started!"
        ;;
    
    "prod-down")
        echo "🛑 Stopping production environment..."
        $DOCKER_COMPOSE_PROD down
        echo "✅ Production environment stopped!"
        ;;
    
    "prod-build")
        echo "🔨 Building production app image..."
        $DOCKER_COMPOSE_PROD build app
        echo "✅ Production app built!"
        ;;
    
    "redis-cli")
        echo "🔗 Connecting to Redis CLI..."
        docker exec -it mcplookup-redis-dev redis-cli
        ;;
    
    "test-redis")
        echo "🧪 Testing Redis storage integration..."
        if [ -f "scripts/test-redis-storage.ts" ]; then
            npm run tsx scripts/test-redis-storage.ts
        else
            echo "❌ Test script not found!"
        fi
        ;;
    
    "clean")
        echo "🧹 Cleaning up all containers and volumes..."
        $DOCKER_COMPOSE_DEV down -v --remove-orphans
        $DOCKER_COMPOSE_PROD down -v --remove-orphans
        docker system prune -f
        echo "✅ Cleanup complete!"
        ;;
    
    "status")
        echo "📊 Container Status:"
        echo ""
        echo "Development:"
        $DOCKER_COMPOSE_DEV ps 2>/dev/null || echo "  No development containers running"
        echo ""
        echo "Production:"
        $DOCKER_COMPOSE_PROD ps 2>/dev/null || echo "  No production containers running"
        ;;
    
    "help"|*)
        show_help
        ;;
esac
