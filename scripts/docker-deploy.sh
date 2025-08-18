#!/bin/bash

# HealthZone Docker Deployment Script for Homelab
# Optimized for Cloudflare Tunnel deployment

set -e  # Exit on any error

echo "🏠 Starting HealthZone Homelab Deployment"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running"

# Check if environment file exists
if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
    print_warning "No environment file found!"
    print_status "Creating .env.production from .env.example..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env.production
        print_warning "Please edit .env.production with your actual values before continuing"
        echo "Press Enter when ready to continue..."
        read
    else
        print_error ".env.example not found. Please create environment configuration."
        exit 1
    fi
fi

# Use .env.production if it exists, otherwise .env.local
ENV_FILE=".env.production"
if [ -f ".env.local" ] && [ ! -f ".env.production" ]; then
    ENV_FILE=".env.local"
fi

print_status "Using environment file: $ENV_FILE"

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

# Validate required environment variables
REQUIRED_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in $ENV_FILE"
        exit 1
    fi
done

print_success "Environment variables validated"

# Stop existing container if running
if docker-compose ps | grep -q "healthzone-app"; then
    print_status "Stopping existing HealthZone container..."
    docker-compose down
fi

# Remove old images (optional, saves space)
if [ "$1" = "--clean" ]; then
    print_status "Cleaning up old Docker images..."
    docker system prune -f
    docker image prune -f
fi

# Build and start the container
print_status "Building HealthZone Docker image..."
docker-compose build --no-cache

print_status "Starting HealthZone container..."
docker-compose up -d

# Wait for container to be healthy
print_status "Waiting for container to be healthy..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if docker-compose ps | grep -q "healthy"; then
        print_success "Container is healthy and running!"
        break
    fi
    
    if [ $counter -eq $timeout ]; then
        print_error "Container failed to become healthy within $timeout seconds"
        print_status "Container logs:"
        docker-compose logs healthzone
        exit 1
    fi
    
    sleep 2
    counter=$((counter + 2))
    echo -n "."
done

echo ""

# Display deployment information
print_success "🎉 HealthZone deployment completed!"
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🌐 Access Information:"
echo "   Internal URL: http://localhost:3001"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo "☁️ Cloudflare Tunnel Configuration:"
echo "   Point your tunnel to: http://localhost:3001"
echo "   Or use container IP: $(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' healthzone-app):80"
echo ""
echo "📱 Next Steps:"
echo "   1. Configure your Cloudflare Tunnel to point to this service"
echo "   2. Update your domain DNS settings"
echo "   3. Test the application through your Cloudflare domain"
echo "   4. Deploy Supabase Edge Functions (see DEPLOYMENT.md)"
echo ""
echo "📋 Management Commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop:         docker-compose down"
echo "   Restart:      docker-compose restart"
echo "   Update:       ./scripts/docker-deploy.sh --clean"
echo ""

print_success "Deployment complete! 🚀"