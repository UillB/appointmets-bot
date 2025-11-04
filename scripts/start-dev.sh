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
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "ngrok" 2>/dev/null || true

sleep 2

# Start Backend API (Port 4000)
start_service "backend" "backend" "npm run dev" "4000"

# Start React Admin Panel (Port 4200)
start_service "admin-panel-react" "admin-panel-react" "npm run dev" "4200"

# Start Landing Page (Port 3000)
start_service "landing" "landing" "npm run dev" "3000"

# Start Ngrok Tunnel for HTTPS (Port 4040)
# ⚠️ IMPORTANT: Telegram WebApp requires HTTPS, so we tunnel backend (port 4000)
echo "🌐 Starting Ngrok tunnel for HTTPS (backend port 4000)..."
cd "$(dirname "$0")/.." || exit 1

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "⚠️  Ngrok not installed. Install with: brew install ngrok/ngrok/ngrok"
    echo "⚠️  Or run manually: ngrok http 4000"
else
    nohup ngrok http 4000 --log=stdout > "logs/ngrok.log" 2>&1 &
    NGROK_PID=$!
    echo $NGROK_PID > "logs/ngrok.pid"
    sleep 3
    
    # Get ngrok URL
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[] | select(.proto=="https") | .public_url' | head -1)
    
    if [ -n "$NGROK_URL" ]; then
        echo "✅ Ngrok tunnel started (PID: $NGROK_PID)"
        echo "📄 Logs: logs/ngrok.log"
        echo "🌐 HTTPS URL: $NGROK_URL"
        echo ""
        echo "⚠️  IMPORTANT: Update backend/.env with PUBLIC_BASE_URL:"
        echo "   echo 'PUBLIC_BASE_URL=$NGROK_URL' >> backend/.env"
        echo "   Then restart backend!"
    else
        echo "✅ Ngrok started, but URL not yet available"
        echo "   Check logs/ngrok.log or run: curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.proto==\"https\") | .public_url'"
    fi
fi

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📊 Service Status:"
echo "   🔧 Backend API:     http://localhost:4000"
echo "   🎨 React Admin Panel: http://localhost:4200"
echo "   🌐 Landing Page:    http://localhost:3000"
if [ -n "$NGROK_URL" ]; then
    echo "   🚀 Ngrok HTTPS:     $NGROK_URL"
    echo ""
    echo "⚠️  IMPORTANT: Update backend/.env with PUBLIC_BASE_URL=$NGROK_URL"
    echo "   Then restart backend for Telegram WebApp to work!"
else
    echo "   🚀 Ngrok Tunnel:    https://[tunnel-url].ngrok.io"
fi
echo ""
echo "📄 Logs are available in the 'logs/' directory"
echo "🛑 To stop all services, run: ./scripts/stop-dev.sh"
echo ""
echo "💡 For Telegram WebApp testing:"
echo "   1. Ngrok provides HTTPS tunnel for backend (port 4000)"
echo "   2. Update backend/.env: PUBLIC_BASE_URL=https://[ngrok-url].ngrok-free.dev"
echo "   3. Restart backend"
echo "   4. Telegram WebApp buttons will use HTTPS URL"
