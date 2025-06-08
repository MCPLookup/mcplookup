#!/bin/bash

# Development Environment Setup Script
# Sets up complete development environment with Docker Redis

set -e

echo "🚀 MCPLookup Development Environment Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    node_version=$(node --version | cut -d'v' -f2)
    if [ "$(printf '%s\n' "18.0.0" "$node_version" | sort -V | head -n1)" != "18.0.0" ]; then
        print_error "Node.js version 18+ required, found $node_version"
        exit 1
    fi
    
    print_success "Node.js $node_version is available"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "npm is available"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        print_status "Please install Docker from https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        print_status "Please start Docker and try again"
        exit 1
    fi
    
    print_success "Docker is available and running"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available"
        exit 1
    fi
    
    print_success "Docker Compose is available"
}

# Install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "Dependencies installed"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment configuration..."
    
    # Create .env.local if it doesn't exist
    if [ ! -f ".env.local" ]; then
        print_status "Creating .env.local file..."
        cat > .env.local << 'EOF'
# Development Environment Configuration
NODE_ENV=development

# Redis Configuration (Docker)
REDIS_URL=redis://localhost:6379

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production-please

# AI Provider Configuration (Optional)
# Get free API keys from:
# Together AI: https://api.together.xyz/
# OpenRouter: https://openrouter.ai/
# TOGETHER_API_KEY=your-together-api-key
# OPENROUTER_API_KEY=your-openrouter-api-key

# OAuth Provider Configuration (Optional)
# GitHub: https://github.com/settings/applications/new
# Google: https://console.developers.google.com/
# GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Upstash Redis (Production - Optional for development)
# UPSTASH_REDIS_REST_URL=your-upstash-url
# UPSTASH_REDIS_REST_TOKEN=your-upstash-token
EOF
        print_success "Created .env.local with development defaults"
    else
        print_warning ".env.local already exists, skipping creation"
    fi
    
    # Update .env.local with Redis URL if not set
    if ! grep -q "REDIS_URL" .env.local; then
        echo "REDIS_URL=redis://localhost:6379" >> .env.local
        print_status "Added Redis URL to .env.local"
    fi
}

# Start Docker services
start_docker_services() {
    print_status "Starting Docker services..."
    
    # Stop any existing services
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Start Redis
    print_status "Starting Redis container..."
    docker-compose up -d redis
    
    # Wait for Redis to be ready
    print_status "Waiting for Redis to be ready..."
    timeout=30
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
            print_success "Redis is ready"
            break
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    if [ $timeout -eq 0 ]; then
        print_error "Redis failed to start"
        docker-compose logs redis
        exit 1
    fi
}

# Test the setup
test_setup() {
    print_status "Testing the development setup..."
    
    # Test Redis connectivity
    if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
        print_success "Redis connectivity test passed"
    else
        print_error "Redis connectivity test failed"
        exit 1
    fi
    
    # Test storage providers
    print_status "Testing storage providers..."
    if npx tsx scripts/test-storage.ts; then
        print_success "Storage provider tests passed"
    else
        print_warning "Storage tests had issues (may be expected)"
    fi
    
    # Test AI setup
    print_status "Testing AI setup..."
    if node scripts/test-ai-setup.js; then
        print_success "AI setup tests passed"
    else
        print_warning "AI setup tests had issues (may be expected without API keys)"
    fi
}

# Build the application
build_application() {
    print_status "Building the application..."
    
    npm run build
    print_success "Application built successfully"
}

# Start development server
start_dev_server() {
    print_status "Development environment is ready!"
    print_success "Redis is running on localhost:6379"
    print_success "Application will start on localhost:3000"
    
    echo ""
    print_status "Available commands:"
    echo "  npm run dev          - Start development server"
    echo "  npm run build        - Build for production"
    echo "  npm run test         - Run tests"
    echo "  npm run test:storage - Test storage providers"
    echo ""
    print_status "Docker commands:"
    echo "  docker-compose logs redis     - View Redis logs"
    echo "  docker-compose exec redis redis-cli - Access Redis CLI"
    echo "  docker-compose down           - Stop all services"
    echo ""
    print_status "Useful development URLs:"
    echo "  http://localhost:3000         - Application"
    echo "  http://localhost:3000/api/docs - API Documentation"
    echo ""
    
    read -p "Start development server now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Starting development server..."
        npm run dev
    else
        print_status "Run 'npm run dev' when ready to start the development server"
    fi
}

# Main setup function
main() {
    print_status "Setting up MCPLookup development environment..."
    
    check_prerequisites
    install_dependencies
    setup_environment
    start_docker_services
    test_setup
    
    print_success "Development environment setup completed!"
    start_dev_server
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Setup failed. Cleaning up..."
        docker-compose down --remove-orphans 2>/dev/null || true
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Run main function
main "$@"
