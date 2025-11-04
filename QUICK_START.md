# 🚀 Quick Start Guide

## 📋 Available Commands

### 🏗️ Infrastructure Commands
```bash
# Start all services
./scripts/start-dev.sh

# Stop all services  
./scripts/stop-dev.sh

# Individual services
cd backend && npm run dev          # Backend API (Port 4000)
cd admin-panel-react && npm run dev # React Admin Panel (Port 4200)
cd landing && npm run dev          # Landing Page (Port 3000)
ngrok http 4000                    # Ngrok HTTPS Tunnel (Port 4040) - ⚠️ REQUIRED for Telegram WebApp
```

### 🔧 Development Commands
```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database

# React Admin Panel
cd admin-panel-react
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests

# Landing Page
cd landing
npm run dev          # Start development server
npm run build        # Build for production
```

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | `http://localhost:4000` | Main API server |
| **React Admin Panel** | `http://localhost:4200` | Admin dashboard |
| **Landing Page** | `http://localhost:3000` | Marketing website |
| **Ngrok HTTPS** | `https://[tunnel].ngrok.io` | HTTPS tunnel for Telegram WebApp (required!) |

## 📱 TWA Testing (Telegram WebApp)

**⚠️ CRITICAL: Telegram WebApp requires HTTPS!**

### Setup Ngrok for Development:

1. **Start all services:**
   ```bash
   ./start-all.sh
   # или
   ./scripts/start-dev.sh
   ```

2. **Get Ngrok HTTPS URL:**
   ```bash
   curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.proto=="https") | .public_url'
   ```

3. **Update backend/.env with ngrok URL:**
   ```bash
   cd backend
   ngrok_url=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.proto=="https") | .public_url' | head -1)
   echo "PUBLIC_BASE_URL=$ngrok_url" >> .env
   ```

4. **Restart backend:**
   ```bash
   # Stop current backend
   lsof -ti:4000 | xargs kill -9
   # Start again
   cd backend && npm run dev
   ```

5. **Verify:**
   - Backend uses HTTPS URL for Telegram WebApp buttons
   - WebApp calendar opens via HTTPS
   - No "Only HTTPS links are allowed" errors

### Manual Ngrok Setup:
```bash
# Start ngrok tunnel for backend
ngrok http 4000

# Get URL from ngrok web interface: http://localhost:4040
# Or via API: curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.proto=="https") | .public_url'
```

## 📄 Logs

All service logs are saved in `logs/` directory:
- `logs/backend.log`
- `logs/admin-panel-react.log` 
- `logs/landing.log`
- `logs/ngrok.log` (ngrok tunnel logs)

View logs:
```bash
tail -f logs/backend.log          # Backend logs
tail -f logs/ngrok.log            # Ngrok logs
tail -f logs/*.log                # All logs
```

## 🛑 Stop Services

```bash
# Stop all services
./scripts/stop-dev.sh

# Or manually
pkill -f "npm run dev" 
pkill -f "next dev"
pkill -f "ngrok"
```

## 📚 Documentation

- **Infrastructure**: `docs/INFRASTRUCTURE.md`
- **API Documentation**: `docs/api/README.md`
- **Deployment Guide**: `docs/deployment/README.md`
