# Redis Sync Tool

This tool allows you to mirror data between your Upstash Redis (production) and local Docker Redis (development).

## Quick Start

### 1. Prerequisites
```powershell
# Make sure Docker Desktop is running
# Start local Redis
npm run docker:up

# Verify .env.local has your Upstash credentials
# UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-token
```

### 2. Basic Usage

```powershell
# Sync from Upstash to local (most common)
npm run redis:sync

# Dry run - see what would be synced without making changes
npm run redis:sync:dry

# Continuous sync - monitors for changes
npm run redis:sync:watch

# Create backup of Upstash data
npm run redis:backup:upstash
```

### 3. Advanced Usage

```powershell
# Using the PowerShell script directly
.\scripts\redis-sync.ps1 -DryRun
.\scripts\redis-sync.ps1 -Pattern "mcp:*"
.\scripts\redis-sync.ps1 -Watch

# Using Node.js script directly
node scripts/redis-sync.js --help
node scripts/redis-sync.js --dry-run
node scripts/redis-sync.js --pattern="session:*"
```

## Available Commands

### NPM Scripts
| Command | Description |
|---------|-------------|
| `npm run redis:sync` | Basic sync from Upstash to local |
| `npm run redis:sync:dry` | Dry run - preview changes |
| `npm run redis:sync:watch` | Continuous sync mode |
| `npm run redis:sync:reverse` | Reverse sync (local → Upstash) with dry run |
| `npm run redis:backup:upstash` | Backup Upstash data |
| `npm run redis:backup:local` | Backup local data |

### PowerShell Script Options
| Option | Description |
|--------|-------------|
| `-DryRun` | Show what would be synced without making changes |
| `-Reverse` | Sync from local to Upstash (⚠️ dangerous!) |
| `-Watch` | Continuous sync mode |
| `-Backup` | Create backup before sync |
| `-Restore <file>` | Restore from backup file |
| `-Pattern <glob>` | Only sync keys matching pattern |
| `-SkipExisting` | Skip keys that already exist in destination |

### Node.js Script Options
| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes without applying them |
| `--reverse` | Sync from local to Upstash |
| `--watch` | Continuous sync mode |
| `--backup` | Create backup |
| `--restore=<file>` | Restore from backup |
| `--pattern=<glob>` | Filter keys by pattern |
| `--skip-existing` | Skip existing keys |

## Examples

### Development Workflow
```powershell
# 1. Start with a clean local Redis
npm run docker:down
npm run docker:up

# 2. Sync production data to local
npm run redis:sync

# 3. Develop your feature locally...

# 4. Optional: backup your local changes
npm run redis:backup:local
```

### Specific Data Patterns
```powershell
# Sync only MCP-related keys
node scripts/redis-sync.js --pattern="mcp:*"

# Sync only user sessions
node scripts/redis-sync.js --pattern="session:*"

# Sync everything except temporary keys
node scripts/redis-sync.js --pattern="*" --skip-existing
```

### Backup & Restore
```powershell
# Create backup
npm run redis:backup:upstash

# Restore from backup
node scripts/redis-sync.js --restore=backups/upstash-backup-2024-06-07T10-30-00-000Z.json
```

### Continuous Development Sync
```powershell
# Keep local Redis in sync with production (read-only)
npm run redis:sync:watch

# This will:
# 1. Do initial sync
# 2. Check for changes every 30 seconds
# 3. Only sync new/changed keys
```

## Safety Features

### Reverse Sync Protection
- Reverse sync (local → Upstash) requires explicit confirmation
- Always runs in dry-run mode first via npm scripts
- Shows warnings before overwriting production data

### Dry Run Mode
- Preview all changes before applying them
- Shows detailed statistics
- No data is modified

### Backup System
- Automatic backup creation before major operations
- JSON format for easy inspection
- Timestamped backup files
- Restore capability

## Monitoring & Debugging

### Real-time Progress
The tool shows:
- Connection status
- Progress bars for large syncs
- Keys processed/skipped/failed
- Speed metrics (keys/second)
- Final statistics

### Error Handling
- Graceful handling of network issues
- Detailed error messages
- Partial sync capability
- Automatic retries for transient failures

## Redis Data Types Supported

The tool handles all Redis data types:
- Strings
- Hashes
- Lists
- Sets
- Sorted Sets (ZSETs)
- TTL preservation

## Environment Variables

Required in `.env.local`:
```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
REDIS_URL=redis://localhost:6379  # Optional, defaults to localhost
```

## Troubleshooting

### Common Issues

#### "Failed to connect to Upstash Redis"
- Check your `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Verify your Upstash Redis instance is active
- Check network connectivity

#### "Failed to connect to local Redis"
- Make sure Docker Desktop is running
- Start local Redis: `npm run docker:up`
- Check if port 6379 is available

#### "Permission denied" on PowerShell
- Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Or use the npm scripts instead

### Performance Tips

- Use `--pattern` to sync only needed data
- Use `--skip-existing` for incremental syncs
- Smaller batch sizes for large datasets
- Monitor memory usage during large syncs

## Security Notes

- Never commit `.env.local` to version control
- Use separate Redis instances for production/staging
- Be extremely careful with reverse sync
- Regular backups recommended before major changes
- Consider using read-only tokens for sync operations
