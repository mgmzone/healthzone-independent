#!/bin/bash

# HealthZone Deployment Script

set -e  # Exit on any error

echo "🚀 Starting HealthZone Deployment Process"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your environment variables."
    echo "See .env.example for template."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run security audit
echo "🔍 Running security audit..."
npm audit --audit-level=moderate

# Run linting (if available)
if npm run lint --silent 2>/dev/null; then
    echo "🧹 Running linter..."
    npm run lint
fi

# Build the application
echo "🏗️  Building application..."
npm run build

# Check build output
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📂 Built files are in the dist/ directory"

# Provide deployment instructions
echo ""
echo "🎯 Next steps for deployment:"
echo "1. Upload the contents of dist/ to your web server"
echo "2. Configure your web server for SPA routing"
echo "3. Set environment variables on your hosting platform"
echo "4. Deploy Supabase Edge Functions (see DEPLOYMENT.md)"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"