#!/bin/bash

# Development Environment Startup Script
# Starts both backend and frontend in development mode

set -e

echo "🚀 Starting Appointments Bot Development Environment..."

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait a moment for backend to start
sleep 3

# Start frontend (React Admin Panel)
echo "🎨 Starting React admin panel..."
cd ../admin-panel-react
npm run dev &
FRONTEND_PID=$!
echo "✅ React admin panel started (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Development environment is running!"
echo ""
echo "📱 Backend API: http://localhost:4000"
echo "🌐 React Admin Panel (Main): http://localhost:4200"
echo "📊 API Health Check: http://localhost:4000/api/health"
echo ""
echo "💡 React admin panel is now the main interface!"
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait
