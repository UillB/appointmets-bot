#!/bin/bash

# 🛑 Development Environment Shutdown Script
# This script stops all development services

echo "🛑 Stopping Appointments Bot Development Environment..."

# Function to stop service
stop_service() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "🔄 Stopping $service_name (PID: $pid)..."
            kill "$pid"
            rm "$pid_file"
            echo "✅ $service_name stopped"
        else
            echo "⚠️  $service_name was not running"
            rm "$pid_file"
        fi
    else
        echo "⚠️  No PID file found for $service_name"
    fi
}

# Stop services
stop_service "backend"
stop_service "admin-panel-react"
stop_service "admin-panel"
stop_service "landing"
stop_service "ngrok"

# Kill any remaining processes
echo "🔄 Cleaning up remaining processes..."
pkill -f "ng serve" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "ngrok" 2>/dev/null || true

echo ""
echo "✅ All services stopped successfully!"
echo "📄 Logs are preserved in the 'logs/' directory"
