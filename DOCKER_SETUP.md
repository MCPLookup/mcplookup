# 🐳 Docker Setup for MCPLookup.org

Complete Docker setup for development and testing with Redis integration.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the automated development setup
npm run dev:setup
```

### Option 2: Manual Setup
```bash
# Install dependencies
npm install

# Start Redis container
npm run docker:up

# Test the setup
npm run test:docker

# Start development server
npm run dev
```

## 📋 Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker** - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** - Usually included with Docker Desktop

## 🏗️ Architecture

### Development Environment
```
┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Redis Server  │
│   (localhost:   │◄──►│   (localhost:   │
│      3000)      │    │      6379)      │
└─────────────────┘    └─────────────────┘
```

### Production Environment
```
┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Upstash Redis  │
│   (Vercel)      │◄──►│    (Cloud)      │
└─────────────────┘    └─────────────────┘
```

## 🛠️ Available Commands

### Development Commands
```bash
npm run dev:setup      # Complete development environment setup
npm run dev            # Start development server
npm run build          # Build for production
```

### Docker Commands
```bash
npm run docker:up      # Start all Docker services
npm run docker:down    # Stop all Docker services
npm run docker:logs    # View logs from all services
npm run redis:cli      # Access Redis CLI
```

### Testing Commands
```bash
npm run test:docker    # Complete Docker integration test
npm run test:storage   # Test storage providers
npm run test:ai        # Test AI setup
npm run test           # Run unit tests
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` for development:
```bash
# Development Configuration
NODE_ENV=development
REDIS_URL=redis://localhost:6379

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production

# AI Providers (Optional)
TOGETHER_API_KEY=your-together-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# OAuth Providers (Optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Docker Compose Services

#### Redis Service
- **Image**: `redis:7-alpine`
- **Port**: `6379`
- **Persistence**: Volume mounted for data persistence
- **Health Check**: Automatic health monitoring

#### Application Service (Optional)
- **Build**: From local Dockerfile
- **Port**: `3000`
- **Dependencies**: Waits for Redis to be healthy
- **Hot Reload**: Source code mounted for development

## 🧪 Testing

### Comprehensive Test Suite
```bash
# Run complete Docker integration test
npm run test:docker
```

This test includes:
- ✅ Docker availability check
- ✅ Redis connectivity test
- ✅ Storage provider tests
- ✅ AI storage tests
- ✅ Application startup test
- ✅ API endpoint tests
- ✅ Performance benchmarks

### Individual Tests
```bash
# Test storage providers with Redis
npm run test:storage

# Test AI setup and providers
npm run test:ai

# Test unit tests
npm run test
```

## 🔍 Monitoring & Debugging

### View Logs
```bash
# All services
npm run docker:logs

# Specific service
docker-compose logs redis
docker-compose logs app
```

### Access Redis CLI
```bash
# Direct access
npm run redis:cli

# Or manually
docker-compose exec redis redis-cli
```

### Health Checks
```bash
# Check Redis health
docker-compose exec redis redis-cli ping

# Check application health
curl http://localhost:3000/api/v1/health
```

## 🚀 Production Deployment

### Using Upstash Redis
```bash
# Set production environment variables
export UPSTASH_REDIS_REST_URL=your-upstash-url
export UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Use production Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production
```bash
NODE_ENV=production
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=secure-random-secret
```

## 🔧 Troubleshooting

### Common Issues

#### Redis Connection Failed
```bash
# Check if Redis is running
docker-compose ps redis

# Restart Redis
docker-compose restart redis

# Check Redis logs
docker-compose logs redis
```

#### Port Already in Use
```bash
# Stop existing services
npm run docker:down

# Check what's using the port
lsof -i :6379  # Redis
lsof -i :3000  # Application

# Kill processes if needed
sudo kill -9 <PID>
```

#### Permission Denied
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

### Reset Everything
```bash
# Complete cleanup and restart
npm run docker:down
docker system prune -f --volumes
npm run dev:setup
```

## 📊 Performance

### Redis Performance
- **Local Redis**: ~50,000+ ops/second
- **Upstash Redis**: ~10,000+ ops/second (network dependent)

### Application Performance
- **Cold Start**: ~2-3 seconds
- **Hot Reload**: ~100-500ms
- **API Response**: ~50-200ms

## 🔐 Security

### Development Security
- Redis runs in isolated Docker network
- No external Redis access by default
- Environment variables for sensitive data

### Production Security
- TLS encryption with Upstash Redis
- Environment variable validation
- Secure authentication flows

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Upstash Documentation](https://docs.upstash.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🆘 Support

If you encounter issues:

1. **Check the logs**: `npm run docker:logs`
2. **Run diagnostics**: `npm run test:docker`
3. **Reset environment**: `npm run docker:down && npm run dev:setup`
4. **Check GitHub Issues**: [MCPLookup Issues](https://github.com/TSavo/mcplookup.org/issues)

---

**Happy Developing! 🚀**
