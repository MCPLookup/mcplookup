# Redis Setup for MCPLookup

This directory contains the Redis configuration and setup for local development.

## Quick Start

```bash
# Start Redis
npm run redis:start

# Check status
npm run redis:status

# Open Redis CLI
npm run redis:cli

# Open Web UI
npm run redis:ui
```

## What's Included

### 🐳 Docker Services

- **Redis Server** - Main Redis instance on port 6379
- **Redis Commander** - Web UI on port 8081 (admin/admin123)

### ⚙️ Configuration

- **Persistence**: Both RDB snapshots and AOF enabled
- **Memory**: Optimized for development (no memory limits)
- **Performance**: Tuned for local development
- **Security**: Disabled for local development convenience

### 📁 File Structure

```
docker/redis/
├── README.md          # This file
├── redis.conf         # Redis configuration
└── backups/           # Backup directory (created automatically)
```

## Storage Providers

The unified storage system automatically detects and uses the appropriate provider:

### 🏠 Local Development
```bash
# Redis provider (when REDIS_URL is set)
REDIS_URL=redis://localhost:6379
```

### ☁️ Production
```bash
# Upstash provider (when Upstash credentials are set)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### 🧪 Testing
```bash
# In-memory provider (no persistence)
NODE_ENV=test
```

## Management Commands

### Basic Operations
```bash
npm run redis:start     # Start Redis container
npm run redis:stop      # Stop Redis container
npm run redis:status    # Show Redis status
npm run redis:cli       # Open Redis CLI
```

### Web Interface
```bash
npm run redis:ui        # Start Redis Commander
# Then open: http://localhost:8081
# Login: admin / admin123
```

### Data Management
```bash
npm run redis:flush     # Delete all data (WARNING!)
npm run redis:backup    # Create backup
```

### Testing
```bash
npm run test:redis      # Test Redis storage provider
npm run test:storage    # Test all storage providers
```

## Configuration Details

### Redis Configuration (`redis.conf`)

- **Persistence**: RDB + AOF for maximum durability
- **Memory**: No limits (good for development)
- **Networking**: Accepts connections from any IP
- **Security**: Protected mode disabled (local only)
- **Performance**: Optimized for development workloads

### Docker Configuration

- **Image**: `redis:7-alpine` (latest stable)
- **Volumes**: Persistent data storage
- **Health Checks**: Automatic health monitoring
- **Networking**: Bridge network for service communication

## Data Persistence

### Automatic Backups
Redis is configured to automatically save data:
- Every 15 minutes if at least 1 key changed
- Every 5 minutes if at least 10 keys changed  
- Every 1 minute if at least 10,000 keys changed

### Manual Backups
```bash
npm run redis:backup    # Creates timestamped backup
```

Backups are stored in `backups/redis/` directory.

### Data Recovery
```bash
# List available backups
ls backups/redis/

# Restore from backup
./scripts/redis-manager.sh restore
```

## Troubleshooting

### Redis Won't Start
```bash
# Check Docker status
docker info

# Check container logs
docker-compose logs redis

# Restart Docker service
sudo systemctl restart docker  # Linux
# or restart Docker Desktop
```

### Connection Issues
```bash
# Test Redis connectivity
npm run redis:status

# Check if port is available
netstat -an | grep 6379

# Test with Redis CLI
npm run redis:cli
> ping
PONG
```

### Performance Issues
```bash
# Check Redis stats
npm run redis:cli
> info memory
> info stats
> slowlog get 10
```

### Data Issues
```bash
# Check database info
npm run redis:cli
> info keyspace
> dbsize

# Monitor commands in real-time
npm run redis:cli
> monitor
```

## Development Tips

### Environment Variables
Add to your `.env.local`:
```bash
# Use Redis for development
REDIS_URL=redis://localhost:6379

# Or use in-memory for testing
# NODE_ENV=test
```

### Storage Provider Selection
The storage factory automatically chooses the best provider:

1. **Upstash** (if credentials available) - Production
2. **Redis** (if REDIS_URL set) - Development  
3. **In-Memory** (fallback) - Testing

### Monitoring
- **Web UI**: http://localhost:8081
- **CLI**: `npm run redis:cli`
- **Logs**: `docker-compose logs redis`
- **Stats**: `npm run redis:status`

## Security Notes

⚠️ **Development Only**: This Redis setup is configured for local development and should NOT be used in production without proper security configuration.

For production, use:
- Upstash Redis (recommended)
- Redis Cloud
- Self-hosted Redis with proper security

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Docker and Redis logs
3. Test with the provided test scripts
4. Open an issue on GitHub

## Related Files

- `docker-compose.yml` - Docker services configuration
- `scripts/redis-manager.sh` - Redis management script
- `scripts/test-redis-storage.ts` - Redis storage tests
- `src/lib/services/storage/` - Storage system implementation
