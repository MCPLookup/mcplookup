#!/bin/bash
# MCPLookup.org Universal Bridge Installer
# Quick setup script for the MCP Universal Bridge

set -e

echo "🌉 MCPLookup.org Universal Bridge Installer"
echo "============================================"
echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker found"
    DOCKER_AVAILABLE=true
else
    echo "❌ Docker not found"
    DOCKER_AVAILABLE=false
fi

# Check if Node.js is available
if command -v node &> /dev/null; then
    echo "✅ Node.js found ($(node --version))"
    NODE_AVAILABLE=true
else
    echo "❌ Node.js not found"
    NODE_AVAILABLE=false
fi

echo ""

# Determine installation method
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "🐳 Recommended: Docker installation"
    echo "1) Docker (Recommended)"
    echo "2) NPM Package"
    echo "3) Source Code"
    echo ""
    read -p "Choose installation method (1-3): " choice
else
    if [ "$NODE_AVAILABLE" = true ]; then
        echo "📦 Node.js installation"
        echo "1) NPM Package"
        echo "2) Source Code"
        echo ""
        read -p "Choose installation method (1-2): " choice
        # Adjust choice for non-Docker systems
        case $choice in
            1) choice=2 ;;
            2) choice=3 ;;
        esac
    else
        echo "❌ Neither Docker nor Node.js found!"
        echo "Please install Docker or Node.js first:"
        echo "  Docker: https://docs.docker.com/get-docker/"
        echo "  Node.js: https://nodejs.org/"
        exit 1
    fi
fi

case $choice in
    1)
        echo ""
        echo "🐳 Installing with Docker..."
        
        # Clone repository
        if [ ! -d "mcplookup.org" ]; then
            echo "📥 Cloning repository..."
            git clone https://github.com/TSavo/mcplookup.org.git
        fi
        
        cd mcplookup.org
        
        # Start Docker container
        echo "🚀 Starting Docker container..."
        docker-compose -f docker-compose.bridge.yml up -d
        
        echo ""
        echo "✅ Docker installation complete!"
        echo ""
        echo "📋 Add this to your Claude Desktop config:"
        echo '{'
        echo '  "mcpServers": {'
        echo '    "universal-bridge": {'
        echo '      "command": "docker",'
        echo '      "args": ["exec", "-i", "mcp-universal-bridge", "tsx", "scripts/mcp-bridge.ts"]'
        echo '    }'
        echo '  }'
        echo '}'
        ;;
        
    2)
        echo ""
        echo "📦 Installing NPM package..."
        
        # Install globally
        npm install -g @mcplookup/bridge
        
        echo ""
        echo "✅ NPM installation complete!"
        echo ""
        echo "📋 Add this to your Claude Desktop config:"
        echo '{'
        echo '  "mcpServers": {'
        echo '    "universal-bridge": {'
        echo '      "command": "npx",'
        echo '      "args": ["@mcplookup/bridge"]'
        echo '    }'
        echo '  }'
        echo '}'
        ;;
        
    3)
        echo ""
        echo "⚡ Installing from source..."
        
        # Clone repository
        if [ ! -d "mcplookup.org" ]; then
            echo "📥 Cloning repository..."
            git clone https://github.com/TSavo/mcplookup.org.git
        fi
        
        cd mcplookup.org
        
        # Install dependencies
        echo "📦 Installing dependencies..."
        npm install
        
        # Build project
        echo "🔨 Building project..."
        npm run build
        
        # Install tsx globally if not present
        if ! command -v tsx &> /dev/null; then
            echo "📦 Installing tsx..."
            npm install -g tsx
        fi
        
        BRIDGE_PATH="$(pwd)/scripts/mcp-bridge.ts"
        
        echo ""
        echo "✅ Source installation complete!"
        echo ""
        echo "📋 Add this to your Claude Desktop config:"
        echo '{'
        echo '  "mcpServers": {'
        echo '    "universal-bridge": {'
        echo '      "command": "tsx",'
        echo "      \"args\": [\"$BRIDGE_PATH\"]"
        echo '    }'
        echo '  }'
        echo '}'
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎯 Next steps:"
echo "1. Add the configuration above to your Claude Desktop config file"
echo "2. Restart Claude Desktop"
echo "3. Try: 'Find email servers' or 'What document tools are available?'"
echo ""
echo "📍 Claude Desktop config location:"
echo "  macOS: ~/.config/claude-desktop/config.json"
echo "  Windows: %APPDATA%\\Claude\\config.json"
echo ""
echo "🔗 More info: https://mcplookup.org/how-to-use"
