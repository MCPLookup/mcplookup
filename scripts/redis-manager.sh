#!/bin/bash

# Redis Management Script for MCPLookup
# Provides easy commands to manage the local Redis instance

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_help() {
    echo "Redis Management Script for MCPLookup"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start       Start Redis container"
    echo "  stop        Stop Redis container"
    echo "  restart     Restart Redis container"
    echo "  status      Show Redis status"
    echo "  logs        Show Redis logs"
    echo "  cli         Open Redis CLI"
    echo "  ui          Start Redis Commander (Web UI)"
    echo "  flush       Flush all Redis data (WARNING: destructive)"
    echo "  backup      Create a backup of Redis data"
    echo "  restore     Restore Redis data from backup"
    echo "  stats       Show Redis statistics"
    echo "  help        Show this help message"
    echo ""
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}Error: Docker daemon is not running${NC}"
        exit 1
    fi
}

start_redis() {
    echo -e "${BLUE}Starting Redis container...${NC}"
    docker-compose up -d redis
    
    echo -e "${YELLOW}Waiting for Redis to be ready...${NC}"
    timeout=30
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
            echo -e "${GREEN}✅ Redis is ready!${NC}"
            echo "Redis URL: redis://localhost:6379"
            return 0
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    echo -e "${RED}❌ Redis failed to start within 30 seconds${NC}"
    exit 1
}

stop_redis() {
    echo -e "${BLUE}Stopping Redis container...${NC}"
    docker-compose stop redis
    echo -e "${GREEN}✅ Redis stopped${NC}"
}

restart_redis() {
    echo -e "${BLUE}Restarting Redis container...${NC}"
    docker-compose restart redis
    
    echo -e "${YELLOW}Waiting for Redis to be ready...${NC}"
    timeout=30
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
            echo -e "${GREEN}✅ Redis restarted successfully!${NC}"
            return 0
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    echo -e "${RED}❌ Redis failed to restart${NC}"
    exit 1
}

show_status() {
    echo -e "${BLUE}Redis Status:${NC}"
    
    if docker-compose ps redis | grep -q "Up"; then
        echo -e "${GREEN}✅ Container: Running${NC}"
        
        if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
            echo -e "${GREEN}✅ Service: Responding${NC}"
            
            # Get Redis info
            echo ""
            echo -e "${BLUE}Redis Information:${NC}"
            docker-compose exec -T redis redis-cli info server | grep -E "(redis_version|uptime_in_seconds|connected_clients)"
            
            echo ""
            echo -e "${BLUE}Memory Usage:${NC}"
            docker-compose exec -T redis redis-cli info memory | grep -E "(used_memory_human|used_memory_peak_human)"
            
            echo ""
            echo -e "${BLUE}Database Info:${NC}"
            docker-compose exec -T redis redis-cli info keyspace
        else
            echo -e "${RED}❌ Service: Not responding${NC}"
        fi
    else
        echo -e "${RED}❌ Container: Not running${NC}"
    fi
}

show_logs() {
    echo -e "${BLUE}Redis Logs (last 50 lines):${NC}"
    docker-compose logs --tail=50 redis
}

open_cli() {
    echo -e "${BLUE}Opening Redis CLI...${NC}"
    echo -e "${YELLOW}Type 'exit' to close the CLI${NC}"
    docker-compose exec redis redis-cli
}

start_ui() {
    echo -e "${BLUE}Starting Redis Commander (Web UI)...${NC}"
    docker-compose up -d redis-commander
    
    echo -e "${GREEN}✅ Redis Commander started!${NC}"
    echo "Web UI: http://localhost:8081"
    echo "Username: admin"
    echo "Password: admin123"
}

flush_data() {
    echo -e "${RED}⚠️  WARNING: This will delete ALL Redis data!${NC}"
    read -p "Are you sure? Type 'yes' to confirm: " confirm
    
    if [ "$confirm" = "yes" ]; then
        echo -e "${BLUE}Flushing Redis data...${NC}"
        docker-compose exec -T redis redis-cli flushall
        echo -e "${GREEN}✅ All Redis data has been deleted${NC}"
    else
        echo -e "${YELLOW}Operation cancelled${NC}"
    fi
}

backup_data() {
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="backups/redis"
    backup_file="$backup_dir/redis_backup_$timestamp.rdb"
    
    echo -e "${BLUE}Creating Redis backup...${NC}"
    
    # Create backup directory
    mkdir -p "$backup_dir"
    
    # Create backup
    docker-compose exec -T redis redis-cli bgsave
    sleep 2
    
    # Copy the dump file
    docker cp mcplookup-redis:/data/dump.rdb "$backup_file"
    
    echo -e "${GREEN}✅ Backup created: $backup_file${NC}"
    echo "Backup size: $(du -h "$backup_file" | cut -f1)"
}

restore_data() {
    backup_dir="backups/redis"
    
    if [ ! -d "$backup_dir" ]; then
        echo -e "${RED}❌ No backups found in $backup_dir${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}Available backups:${NC}"
    ls -la "$backup_dir"/*.rdb 2>/dev/null || {
        echo -e "${RED}❌ No backup files found${NC}"
        exit 1
    }
    
    echo ""
    read -p "Enter backup filename (without path): " backup_file
    
    if [ ! -f "$backup_dir/$backup_file" ]; then
        echo -e "${RED}❌ Backup file not found: $backup_dir/$backup_file${NC}"
        exit 1
    fi
    
    echo -e "${RED}⚠️  WARNING: This will replace all current Redis data!${NC}"
    read -p "Are you sure? Type 'yes' to confirm: " confirm
    
    if [ "$confirm" = "yes" ]; then
        echo -e "${BLUE}Stopping Redis...${NC}"
        docker-compose stop redis
        
        echo -e "${BLUE}Restoring backup...${NC}"
        docker cp "$backup_dir/$backup_file" mcplookup-redis:/data/dump.rdb
        
        echo -e "${BLUE}Starting Redis...${NC}"
        start_redis
        
        echo -e "${GREEN}✅ Backup restored successfully${NC}"
    else
        echo -e "${YELLOW}Operation cancelled${NC}"
    fi
}

show_stats() {
    echo -e "${BLUE}Redis Statistics:${NC}"
    echo ""
    
    # Server info
    echo -e "${YELLOW}Server Information:${NC}"
    docker-compose exec -T redis redis-cli info server | grep -E "(redis_version|uptime_in_days|tcp_port)"
    
    echo ""
    echo -e "${YELLOW}Memory Usage:${NC}"
    docker-compose exec -T redis redis-cli info memory | grep -E "(used_memory_human|used_memory_peak_human|mem_fragmentation_ratio)"
    
    echo ""
    echo -e "${YELLOW}Client Connections:${NC}"
    docker-compose exec -T redis redis-cli info clients | grep -E "(connected_clients|blocked_clients)"
    
    echo ""
    echo -e "${YELLOW}Database Statistics:${NC}"
    docker-compose exec -T redis redis-cli info keyspace
    
    echo ""
    echo -e "${YELLOW}Command Statistics:${NC}"
    docker-compose exec -T redis redis-cli info commandstats | head -10
}

# Main script logic
case "${1:-help}" in
    start)
        check_docker
        start_redis
        ;;
    stop)
        check_docker
        stop_redis
        ;;
    restart)
        check_docker
        restart_redis
        ;;
    status)
        check_docker
        show_status
        ;;
    logs)
        check_docker
        show_logs
        ;;
    cli)
        check_docker
        open_cli
        ;;
    ui)
        check_docker
        start_ui
        ;;
    flush)
        check_docker
        flush_data
        ;;
    backup)
        check_docker
        backup_data
        ;;
    restore)
        check_docker
        restore_data
        ;;
    stats)
        check_docker
        show_stats
        ;;
    help|--help|-h)
        print_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        print_help
        exit 1
        ;;
esac
