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
cd admin-panel && ng serve         # Angular Admin Panel (Port 4201)
cd landing && npm run dev          # Landing Page (Port 3000)
ngrok http 4200                    # NG Rock Tunnel (Port 4040)
```

### 🔧 Development Commands
```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database

# React Admin Panel (Main)
cd admin-panel-react
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests

# Angular Admin Panel (Legacy)
cd admin-panel
ng serve             # Start development server
ng build             # Build for production
ng test              # Run tests

# Landing Page
cd landing
npm run dev          # Start development server
npm run build        # Build for production
```

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | `http://localhost:4000` | Main API server |
| **React Admin Panel** | `http://localhost:4200` | Main admin dashboard |
| **Angular Admin Panel** | `http://localhost:4201` | Legacy admin dashboard |
| **Landing Page** | `http://localhost:3000` | Marketing website |
| **NG Rock** | `https://[tunnel].ngrok.io` | TWA testing tunnel |

## 📱 TWA Testing

For Telegram Web App testing:
1. Start all services: `./scripts/start-dev.sh`
2. Get NG Rock URL from logs
3. Use URL: `https://[tunnel].ngrok.io` (React admin panel)
4. Configure in Telegram bot settings

## 📄 Logs

All service logs are saved in `logs/` directory:
- `logs/backend.log`
- `logs/admin-panel-react.log` 
- `logs/admin-panel.log` 
- `logs/landing.log`
- `logs/ngrok.log`

## 🛑 Stop Services

```bash
# Stop all services
./scripts/stop-dev.sh

# Or manually
pkill -f "ng serve"
pkill -f "npm run dev" 
pkill -f "next dev"
pkill -f "ngrok"
```

## 📚 Documentation

- **Infrastructure**: `docs/INFRASTRUCTURE.md`
- **API Documentation**: `docs/api/README.md`
- **Deployment Guide**: `docs/deployment/README.md`
