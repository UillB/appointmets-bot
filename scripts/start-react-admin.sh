#!/bin/bash

# 🚀 React Admin Panel Quick Start Script
# This script starts only the React admin panel with backend

echo "🎨 Starting React Admin Panel..."

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
pkill -f "npm run dev" 2>/dev/null || true

sleep 2

# Start Backend API (Port 4000)
start_service "backend" "backend" "npm run dev" "4000"

# Start React Admin Panel (Port 4200)
start_service "admin-panel-react" "admin-panel-react" "npm run dev" "4200"

echo ""
echo "🎉 React Admin Panel started successfully!"
echo ""
echo "📊 Service Status:"
echo "   🔧 Backend API:     http://localhost:4000"
echo "   🎨 React Admin Panel: http://localhost:4200"
echo ""
echo "📄 Logs are available in the 'logs/' directory"
echo "🛑 To stop services, run: ./scripts/stop-dev.sh"
echo ""
echo "💡 React admin panel is now the main interface!"
