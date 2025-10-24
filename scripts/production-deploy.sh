#!/bin/bash

# Production Deployment Script for Appointments Bot
# This script handles production deployment with Docker Compose

set -e

echo "🚀 Starting Production Deployment..."

# Colors for output
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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for production."
fi

# Check prerequisites
print_status "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please create .env file with required environment variables."
    print_status "You can copy .env.example and modify it:"
    print_status "cp .env.example .env"
    exit 1
fi

print_success "Prerequisites check passed"

# Load environment variables
print_status "Loading environment variables..."
export $(cat .env | grep -v '^#' | xargs)

# Validate required environment variables
print_status "Validating environment variables..."

required_vars=("TELEGRAM_BOT_TOKEN" "JWT_SECRET" "DATABASE_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env file."
        exit 1
    fi
done

print_success "Environment validation passed"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p ssl
mkdir -p uploads

# Set proper permissions
chmod 755 logs
chmod 755 ssl
chmod 755 uploads

# Stop existing services
print_status "Stopping existing services..."
docker-compose down --remove-orphans || true

# Clean up old images (optional)
if [ "$1" = "--clean" ]; then
    print_status "Cleaning up old Docker images..."
    docker system prune -f
    docker image prune -f
fi

# Build and start services
print_status "Building Docker images..."
docker-compose build --no-cache

print_status "Starting services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 15

# Health checks
print_status "Performing health checks..."

# Check backend health
backend_health_url="http://localhost:4000/api/health"
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f -s "$backend_health_url" > /dev/null 2>&1; then
        print_success "Backend is healthy"
        break
    else
        print_status "Backend health check attempt $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    print_error "Backend health check failed after $max_attempts attempts"
    print_status "Backend logs:"
    docker-compose logs backend
    exit 1
fi

# Check frontend
frontend_health_url="http://localhost:4200"
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f -s "$frontend_health_url" > /dev/null 2>&1; then
        print_success "Frontend is healthy"
        break
    else
        print_status "Frontend health check attempt $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    print_error "Frontend health check failed after $max_attempts attempts"
    print_status "Frontend logs:"
    docker-compose logs frontend
    exit 1
fi

# Check database
print_status "Checking database connection..."
if docker-compose exec -T db pg_isready -U appointments > /dev/null 2>&1; then
    print_success "Database is healthy"
else
    print_error "Database health check failed"
    docker-compose logs db
    exit 1
fi

# Run database migrations
print_status "Running database migrations..."
docker-compose exec backend npx prisma migrate deploy

# Seed database if needed
if [ "$SEED_DATABASE" = "true" ]; then
    print_status "Seeding database..."
    docker-compose exec backend npm run seed
fi

# Display deployment information
echo ""
print_success "🎉 Production deployment completed successfully!"
echo ""
echo "📱 Services:"
echo "  • Backend API: http://localhost:4000"
echo "  • Frontend Admin Panel: http://localhost:4200"
echo "  • Database: localhost:5432"
echo "  • Nginx Reverse Proxy: http://localhost:80"
echo ""
echo "🔧 Management Commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart services: docker-compose restart"
echo "  • Update services: docker-compose pull && docker-compose up -d"
echo ""
echo "📊 Health Checks:"
echo "  • API Health: http://localhost:4000/api/health"
echo "  • Frontend: http://localhost:4200"
echo ""

# Check if SSL certificates exist
if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    print_success "SSL certificates found. HTTPS is available."
else
    print_warning "SSL certificates not found. HTTPS is not available."
    print_status "To enable HTTPS, place your SSL certificates in the ssl/ directory:"
    print_status "  • ssl/cert.pem (SSL certificate)"
    print_status "  • ssl/key.pem (SSL private key)"
fi

print_success "Deployment completed successfully!"
