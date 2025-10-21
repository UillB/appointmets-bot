#!/bin/bash

# 🚀 Development Environment Startup Script
# This script starts all development services for the Appointments Bot project

echo "🏗️ Starting Appointments Bot Development Environment..."

# Function to start service in background
start_service() {
    local service_name=$1
    local directory=$2
    local command=$3
    local port=$4
    
    echo "📦 Starting $service_name on port $port..."
    cd "$directory" || exit 1
    
    # Start service in background
    nohup $command > "../logs/${service_name}.log" 2>&1 &
    local pid=$!
    echo "$pid" > "../logs/${service_name}.pid"
    
    echo "✅ $service_name started (PID: $pid)"
    echo "📄 Logs: logs/${service_name}.log"
}

# Create logs directory
mkdir -p logs

# Kill existing processes
echo "🔄 Stopping existing services..."
pkill -f "ng serve" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "ngrok" 2>/dev/null || true

sleep 2

# Start Backend API (Port 4000)
start_service "backend" "backend" "npm run dev" "4000"

# Start Admin Panel (Port 4200)
start_service "admin-panel" "admin-panel" "ng serve" "4200"

# Start Landing Page (Port 3000)
start_service "landing" "landing" "npm run dev" "3000"

# Start NG Rock Tunnel (Port 4040)
echo "🌐 Starting NG Rock tunnel for TWA testing..."
cd "$(dirname "$0")/.." || exit 1
nohup ngrok http 4200 > "logs/ngrok.log" 2>&1 &
echo $! > "logs/ngrok.pid"
echo "✅ NG Rock tunnel started"
echo "📄 Logs: logs/ngrok.log"

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📊 Service Status:"
echo "   🔧 Backend API:     http://localhost:4000"
echo "   🎨 Admin Panel:     http://localhost:4200"
echo "   🌐 Landing Page:    http://localhost:3000"
echo "   🚀 NG Rock Tunnel:  https://[tunnel-url].ngrok.io"
echo ""
echo "📄 Logs are available in the 'logs/' directory"
echo "🛑 To stop all services, run: ./scripts/stop-dev.sh"
echo ""
echo "💡 For TWA testing, use the NG Rock URL with /admin-panel path"
