#!/bin/bash

# Setup script for Resend email configuration
# This script helps configure environment variables securely

echo "🚀 MCPLookup.org - Resend Email Setup"
echo "======================================"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    touch .env.local
fi

# Function to add or update environment variable
update_env_var() {
    local key=$1
    local value=$2
    local file=".env.local"
    
    if grep -q "^${key}=" "$file"; then
        # Update existing variable
        sed -i.bak "s/^${key}=.*/${key}=${value}/" "$file"
        echo "✅ Updated ${key}"
    else
        # Add new variable
        echo "${key}=${value}" >> "$file"
        echo "✅ Added ${key}"
    fi
}

echo ""
echo "📧 Configuring Resend email service..."
echo ""

# Prompt for API key
read -p "🔑 Enter your Resend API key (starts with 're_'): " api_key

if [[ ! $api_key =~ ^re_ ]]; then
    echo "⚠️  Warning: API key should start with 're_'"
    read -p "Continue anyway? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Prompt for from email
read -p "📮 Enter FROM email address (e.g., noreply@yourdomain.com): " from_email

if [[ ! $from_email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "⚠️  Warning: Email format may be invalid"
    read -p "Continue anyway? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Update environment variables
echo ""
echo "📝 Updating .env.local..."
update_env_var "RESEND_API_KEY" "$api_key"
update_env_var "EMAIL_FROM" "$from_email"

echo ""
echo "✅ Resend configuration complete!"
echo ""
echo "📋 Your .env.local now contains:"
echo "   RESEND_API_KEY=re_****"
echo "   EMAIL_FROM=$from_email"
echo ""
echo "🧪 Test your configuration:"
echo "   export TEST_EMAIL=test@nefariousplan.com"
echo "   npx tsx scripts/test-email-sending.ts"
echo ""
echo "🚀 Start your development server:"
echo "   npm run dev"
echo ""
echo "🔒 Security note: .env.local is in .gitignore and won't be committed to Git"
