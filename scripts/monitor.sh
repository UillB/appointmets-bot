#!/bin/bash

# Production Monitoring Script for Appointments Bot
# This script monitors the health and performance of the production deployment

set -e

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

# Configuration
BACKEND_URL="http://localhost:4000"
FRONTEND_URL="http://localhost:4200"
HEALTH_ENDPOINT="$BACKEND_URL/api/health"
WS_HEALTH_ENDPOINT="$BACKEND_URL/api/health/websocket"

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local timeout=${3:-10}
    
    if curl -f -s --max-time $timeout "$url" > /dev/null 2>&1; then
        print_success "$name is healthy"
        return 0
    else
        print_error "$name is not responding"
        return 1
    fi
}

# Function to get detailed health information
get_health_info() {
    local url=$1
    local name=$2
    
    print_status "Getting detailed health information for $name..."
    
    local response=$(curl -s --max-time 10 "$url" 2>/dev/null || echo "{}")
    if [ "$response" != "{}" ]; then
        echo "Response: $response"
    else
        print_warning "Could not get detailed health information for $name"
    fi
}

# Function to check Docker containers
check_containers() {
    print_status "Checking Docker containers..."
    
    local containers=("appointments-bot-backend-1" "appointments-bot-frontend-1" "appointments-bot-db-1" "appointments-bot-nginx-1")
    local all_healthy=true
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container.*Up"; then
            print_success "Container $container is running"
        else
            print_error "Container $container is not running"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        print_success "All containers are running"
    else
        print_error "Some containers are not running"
        return 1
    fi
}

# Function to check resource usage
check_resources() {
    print_status "Checking resource usage..."
    
    # CPU and Memory usage
    echo "Docker stats:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    # Disk usage
    echo ""
    print_status "Disk usage:"
    df -h | grep -E "(Filesystem|/dev/)"
    
    # Memory usage
    echo ""
    print_status "Memory usage:"
    free -h
}

# Function to check logs for errors
check_logs() {
    print_status "Checking recent logs for errors..."
    
    local services=("backend" "frontend" "db" "nginx")
    
    for service in "${services[@]}"; do
        print_status "Checking $service logs..."
        local error_count=$(docker-compose logs --tail=50 "$service" 2>/dev/null | grep -i "error\|exception\|fatal" | wc -l)
        
        if [ "$error_count" -gt 0 ]; then
            print_warning "Found $error_count potential errors in $service logs"
            docker-compose logs --tail=10 "$service" | grep -i "error\|exception\|fatal" || true
        else
            print_success "No errors found in $service logs"
        fi
    done
}

# Function to check database connectivity
check_database() {
    print_status "Checking database connectivity..."
    
    if docker-compose exec -T db pg_isready -U appointments > /dev/null 2>&1; then
        print_success "Database is accessible"
        
        # Check database size
        local db_size=$(docker-compose exec -T db psql -U appointments -d appointments -t -c "SELECT pg_size_pretty(pg_database_size('appointments'));" 2>/dev/null | tr -d ' ')
        if [ -n "$db_size" ]; then
            print_status "Database size: $db_size"
        fi
    else
        print_error "Database is not accessible"
        return 1
    fi
}

# Function to check WebSocket connectivity
check_websocket() {
    print_status "Checking WebSocket connectivity..."
    
    local ws_response=$(curl -s --max-time 10 "$WS_HEALTH_ENDPOINT" 2>/dev/null || echo "{}")
    if [ "$ws_response" != "{}" ]; then
        print_success "WebSocket is healthy"
        echo "WebSocket stats: $ws_response"
    else
        print_warning "WebSocket health check failed"
    fi
}

# Function to perform load test
load_test() {
    print_status "Performing basic load test..."
    
    local concurrent_requests=10
    local total_requests=50
    
    print_status "Sending $total_requests requests with $concurrent_requests concurrent connections..."
    
    if command -v ab &> /dev/null; then
        ab -n $total_requests -c $concurrent_requests "$HEALTH_ENDPOINT" 2>/dev/null | grep -E "(Requests per second|Time per request|Failed requests)" || true
    else
        print_warning "Apache Bench (ab) not installed. Skipping load test."
    fi
}

# Function to generate monitoring report
generate_report() {
    local report_file="monitoring-report-$(date +%Y%m%d-%H%M%S).txt"
    
    print_status "Generating monitoring report: $report_file"
    
    {
        echo "=== Appointments Bot Monitoring Report ==="
        echo "Generated: $(date)"
        echo ""
        
        echo "=== Container Status ==="
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        
        echo "=== Resource Usage ==="
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
        echo ""
        
        echo "=== Health Checks ==="
        echo "Backend Health: $(curl -s --max-time 5 "$HEALTH_ENDPOINT" || echo "FAILED")"
        echo "WebSocket Health: $(curl -s --max-time 5 "$WS_HEALTH_ENDPOINT" || echo "FAILED")"
        echo ""
        
        echo "=== Recent Errors ==="
        docker-compose logs --tail=100 | grep -i "error\|exception\|fatal" | tail -20 || echo "No errors found"
        
    } > "$report_file"
    
    print_success "Monitoring report saved to: $report_file"
}

# Main monitoring function
main() {
    echo "🔍 Appointments Bot Production Monitoring"
    echo "========================================"
    echo ""
    
    local all_healthy=true
    
    # Check containers
    if ! check_containers; then
        all_healthy=false
    fi
    
    echo ""
    
    # Check endpoints
    if ! check_endpoint "$HEALTH_ENDPOINT" "Backend API"; then
        all_healthy=false
    fi
    
    if ! check_endpoint "$FRONTEND_URL" "Frontend"; then
        all_healthy=false
    fi
    
    echo ""
    
    # Get detailed health information
    get_health_info "$HEALTH_ENDPOINT" "Backend API"
    get_health_info "$WS_HEALTH_ENDPOINT" "WebSocket"
    
    echo ""
    
    # Check database
    if ! check_database; then
        all_healthy=false
    fi
    
    echo ""
    
    # Check WebSocket
    check_websocket
    
    echo ""
    
    # Check resources
    check_resources
    
    echo ""
    
    # Check logs
    check_logs
    
    echo ""
    
    # Load test (optional)
    if [ "$1" = "--load-test" ]; then
        load_test
        echo ""
    fi
    
    # Generate report
    generate_report
    
    echo ""
    echo "========================================"
    
    if [ "$all_healthy" = true ]; then
        print_success "🎉 All systems are healthy!"
        exit 0
    else
        print_error "❌ Some systems are not healthy. Check the report above."
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "--help"|"-h")
        echo "Usage: $0 [--load-test] [--help]"
        echo ""
        echo "Options:"
        echo "  --load-test    Perform basic load testing"
        echo "  --help, -h     Show this help message"
        echo ""
        echo "This script monitors the health and performance of the Appointments Bot production deployment."
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
