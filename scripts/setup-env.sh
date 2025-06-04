#!/bin/bash
# Environment Setup Script for MCPLookup.org
# Safely sets up environment variables without committing secrets

set -e

echo "🔧 MCPLookup.org Environment Setup"
echo "=================================="

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

# Copy the example file
echo "📋 Copying .env.example to .env.local..."
cp .env.example .env.local

echo ""
echo "🔐 Environment Setup Options:"
echo "1) Development (in-memory storage)"
echo "2) Development with local Redis (Docker)"
echo "3) Production with Upstash Redis"
echo ""

read -p "Choose an option (1-3): " -n 1 -r
echo

case $REPLY in
    1)
        echo "✅ Setting up for development with in-memory storage..."
        cat >> .env.local << EOF

# Development Configuration (In-Memory Storage)
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-$(openssl rand -hex 16)

# No Redis configuration needed - will use in-memory storage
EOF
        ;;
    2)
        echo "✅ Setting up for development with local Redis..."
        cat >> .env.local << EOF

# Development Configuration (Local Redis)
NODE_ENV=development
REDIS_URL=redis://localhost:6379
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-$(openssl rand -hex 16)

# Start Redis with: docker-compose up -d redis
EOF
        echo ""
        echo "🐳 To start local Redis:"
        echo "   docker-compose up -d redis"
        ;;
    3)
        echo "🔐 Setting up for production with Upstash Redis..."
        echo ""
        echo "Please enter your Upstash Redis credentials:"
        echo "(Get them from: https://console.upstash.com/)"
        echo ""
        
        read -p "Upstash Redis REST URL: " UPSTASH_URL
        read -s -p "Upstash Redis REST Token: " UPSTASH_TOKEN
        echo ""
        
        if [ -z "$UPSTASH_URL" ] || [ -z "$UPSTASH_TOKEN" ]; then
            echo "❌ Both URL and token are required!"
            exit 1
        fi
        
        cat >> .env.local << EOF

# Production Configuration (Upstash Redis)
NODE_ENV=production
UPSTASH_REDIS_REST_URL=$UPSTASH_URL
UPSTASH_REDIS_REST_TOKEN=$UPSTASH_TOKEN
NEXTAUTH_URL=https://mcplookup.org
NEXTAUTH_SECRET=prod-secret-$(openssl rand -hex 32)
EOF
        ;;
    *)
        echo "❌ Invalid option selected."
        exit 1
        ;;
esac

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "📁 Created: .env.local (git-ignored)"
echo ""
echo "🧪 Test your setup:"
echo "   npm run test:storage"
echo ""
echo "🚀 Start development:"
echo "   npm run dev"
echo ""
echo "⚠️  SECURITY REMINDER:"
echo "   - .env.local is git-ignored and safe"
echo "   - NEVER commit real credentials to git"
echo "   - See SECURITY.md for more details"
echo ""

# Verify the file is git-ignored
if git check-ignore .env.local >/dev/null 2>&1; then
    echo "✅ .env.local is properly git-ignored"
else
    echo "⚠️  WARNING: .env.local might not be git-ignored!"
    echo "   Check your .gitignore file"
fi
