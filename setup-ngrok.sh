#!/bin/bash

# 🚀 Ngrok Setup Script for Telegram WebApp
# This script helps set up ngrok for HTTPS tunnel

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🌐 Ngrok Setup for Telegram WebApp"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ Ngrok is not installed${NC}"
    echo "Install it with: brew install ngrok/ngrok/ngrok"
    exit 1
fi

# Check if authtoken is configured
if ! ngrok config check &> /dev/null; then
    echo -e "${YELLOW}⚠️  Ngrok authtoken not configured${NC}"
    echo ""
    echo "To set up ngrok:"
    echo "1. Sign up for free account: https://dashboard.ngrok.com/signup"
    echo "2. Get your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "3. Run: ngrok config add-authtoken YOUR_AUTHTOKEN"
    echo ""
    read -p "Do you have an authtoken? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your ngrok authtoken: " authtoken
        ngrok config add-authtoken "$authtoken"
        echo -e "${GREEN}✅ Authtoken configured${NC}"
    else
        echo "Please set up ngrok authentication first, then run this script again."
        exit 1
    fi
fi

# Stop any existing ngrok processes
pkill -f "ngrok http" 2>/dev/null || true
sleep 1

# Start ngrok
echo ""
echo "🚀 Starting ngrok tunnel on port 4000..."
mkdir -p logs
ngrok http 4000 --log=stdout > logs/ngrok.log 2>&1 &
NGROK_PID=$!
echo $NGROK_PID > .ngrok.pid
echo -e "${GREEN}✅ Ngrok started (PID: $NGROK_PID)${NC}"

# Wait for ngrok to start
echo "⏳ Waiting for ngrok to initialize..."
sleep 5

# Get HTTPS URL
echo ""
echo "🔍 Getting ngrok HTTPS URL..."
NGROK_URL=""
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
    if [ -n "$NGROK_URL" ]; then
        break
    fi
    echo "   Attempt $i/10..."
    sleep 2
done

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}❌ Could not get ngrok URL${NC}"
    echo "Check ngrok logs: tail -f logs/ngrok.log"
    echo "Or check ngrok web interface: http://localhost:4040"
    exit 1
fi

echo -e "${GREEN}✅ Ngrok HTTPS URL: $NGROK_URL${NC}"

# Update backend .env
echo ""
echo "📝 Updating backend/.env with ngrok URL..."
cd backend

# Remove old PUBLIC_BASE_URL if exists
if grep -q "^PUBLIC_BASE_URL=" .env 2>/dev/null; then
    sed -i.bak '/^PUBLIC_BASE_URL=/d' .env
fi

# Add new PUBLIC_BASE_URL
echo "PUBLIC_BASE_URL=$NGROK_URL" >> .env
echo -e "${GREEN}✅ Updated backend/.env${NC}"

cd ..

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Restart your backend to use the new HTTPS URL:"
echo "   cd backend && npm run dev"
echo ""
echo "2. Test the Telegram bot - clicking 'book appointment' should now work!"
echo ""
echo "🌐 Ngrok URLs:"
echo "   HTTPS Tunnel: $NGROK_URL"
echo "   Web Interface: http://localhost:4040"
echo "   Logs: logs/ngrok.log"
echo ""
echo "⚠️  Note: If you restart ngrok, the URL will change. Run this script again to update .env"

