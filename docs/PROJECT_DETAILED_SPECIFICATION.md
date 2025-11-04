# 📋 Detailed Project Specification - Appointments Bot

**Version:** 1.0.0  
**Last Updated:** January 18, 2025  
**Status:** Production Ready ✅

---

## 🎯 Project Overview

**Appointments Bot** is a fully functional multi-tenant appointment booking system with Telegram bot integration. Designed for organizations (clinics, salons, consultants) to provide clients with convenient appointment booking through Telegram.

### Key Features

1. **Multi-tenant Architecture** - Each organization has isolated bot and data
2. **Telegram Bot** - Complete appointment booking flow via Telegram
3. **Admin Panel** - Web-based management for appointments, services, organizations
4. **AI Assistant** - Configurable AI for answering client questions
5. **Multi-language** - Support for Russian, English, Hebrew
6. **WebSocket Real-time** - Live updates and notifications
7. **Production Ready** - Docker, SSL, monitoring, backups

---

## 🏗️ System Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Appointments Bot System                  │
├─────────────────────────────────────────────────────────────┤
│  Backend (4000)    Frontend (4200)    Telegram Bot          │
│  ┌──────────┐      ┌──────────┐       ┌──────────┐          │
│  │ Node.js  │◄────►│  React   │       │ Telegraf │          │
│  │ Express  │      │  Admin   │       │  Bot API │          │
│  │ Prisma   │      │  Panel   │       │          │          │
│  └──────────┘      └──────────┘       └──────────┘          │
│       │                  │                   │               │
│       └──────────────────┼───────────────────┘             │
│                          │                                   │
│                  ┌────────▼────────┐                         │
│                  │   Database      │                         │
│                  │ SQLite/Postgres │                         │
│                  └─────────────────┘                         │
│                                                              │
│  Landing (3000)    WebSocket Server    Analytics             │
│  ┌──────────┐      ┌──────────┐       ┌──────────┐          │
│  │ Next.js  │      │ WebSocket│       │ Tracking │          │
│  │ Marketing│      │ Real-time│       │ Events   │          │
│  └──────────┘      └──────────┘       └──────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Node.js 20+, Express.js, Prisma ORM
- Telegraf.js (Telegram Bot)
- WebSocket (ws) for real-time
- SQLite (dev) / PostgreSQL (prod)

**Frontend:**
- React 18 + TypeScript + Vite (Admin Panel)
- Next.js 14 (Landing Page)
- Tailwind CSS + Radix UI

**Infrastructure:**
- Docker & Docker Compose
- Nginx (reverse proxy)
- SSL/TLS (Let's Encrypt)

---

## 📦 Project Structure

```
appointments-bot/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── api/          # REST API routes
│   │   ├── bot/          # Telegram bot handlers
│   │   ├── websocket/    # WebSocket server
│   │   └── lib/          # Utilities
│   └── prisma/           # Database schema & migrations
│
├── admin-panel-react/    # React Admin Panel
├── landing/              # Next.js Landing Page
├── docs/                 # Documentation
├── scripts/              # Automation scripts
└── docker-compose.yml    # Docker configuration
```

---

## 🗄️ Database Schema

### Core Models

**Organization** - Multi-tenant organizations
- `id`, `name`, `description`, `address`, `workingHours`
- `botToken`, `botUsername` (Telegram bot)
- Relations: `users[]`, `services[]`, `aiConfig`, `notifications[]`

**User** - System users
- `id`, `email`, `password`, `name`, `role`
- `organizationId`, `telegramId` (for Web App auth)
- Roles: `SUPER_ADMIN`, `OWNER`, `MANAGER`

**Service** - Organization services
- `id`, `name`, `nameRu`, `nameEn`, `nameHe` (multi-language)
- `description`, `descriptionRu`, `descriptionEn`, `descriptionHe`
- `durationMin`, `price`, `currency`, `organizationId`
- Relations: `slots[]`, `appointments[]`

**Slot** - Time slots for booking
- `id`, `serviceId`, `startAt`, `endAt`, `capacity`
- Relations: `service`, `bookings[]`

**Appointment** - Client bookings
- `id`, `chatId`, `serviceId`, `slotId`, `status`, `createdAt`
- Status: `confirmed`, `cancelled`, `completed`

**OrganizationAIConfig** - AI assistant configuration
- `id`, `organizationId`, `provider`, `apiKey`, `model`
- `baseSystemPrompt`, `contextInstructions`, `behaviorInstructions`
- `fallbackPrompt`, `customPrompts` (JSON), `enabled`

**Notification** - User notifications
- `id`, `userId`, `organizationId`, `type`, `title`, `message`
- `isRead`, `isArchived`, `data` (JSON)

**EventLog** - System event tracking
- `id`, `organizationId`, `type`, `source`, `userId`
- `data` (JSON), `metadata` (JSON), `timestamp`

---

## 🔐 Authentication & Security

### Authentication

- **JWT Tokens:** Access (1h) + Refresh (7d)
- **Roles:** SUPER_ADMIN (full access), OWNER (organization owner), MANAGER (organization manager)
- **Multi-tenant Isolation:** All data filtered by `organizationId`
- **Telegram Web App Auth:** Login via Telegram initData with signature verification

### Security

- **API:** CORS, rate limiting, input validation (Zod), SQL injection protection (Prisma), XSS protection
- **WebSocket:** JWT token required, organization-based event isolation
- **Production:** HTTPS/SSL required, security headers (CSP, HSTS), environment variables for secrets

---

## 🌍 Multi-language Support

**Supported Languages:**
- Russian (ru) - default
- English (en)
- Hebrew (he)

**Implementation:**
- Backend: Translation files in `/backend/src/i18n/lang/`, auto-detection from headers/Telegram
- Frontend: Built-in i18n systems (React, Angular, Next.js)
- Database: Localized fields in Service model (nameRu, nameEn, nameHe)
- Bot: Auto-detection, language switching via `/lang` command

---

## 🤖 Telegram Bot

### Architecture

- **Multi-tenant:** Each organization has its own bot
- **Bot Token:** Stored in `Organization.botToken`
- **Bot Manager:** Manages multiple bots simultaneously

### Commands

- `/start` - Start bot interaction
- `/book` - Book appointment
- `/my` - View user appointments
- `/slots` - View available slots
- `/admin` - Admin panel (Web App)
- `/lang` - Change language
- `/help` - Show help

### Features

- Complete booking flow (service selection → date/time → confirmation)
- Multi-language interface
- Web App integration for admins
- AI assistant for answering questions

---

## 🧠 AI Assistant

### Configuration

Each organization can configure its own AI assistant:

- **Providers:** OpenAI (GPT-4, GPT-3.5), Claude (Anthropic), Custom API
- **Settings:** API key, model, maxTokens, temperature
- **Prompts:**
  - `baseSystemPrompt` - Base system prompt
  - `contextInstructions` - Context handling instructions
  - `behaviorInstructions` - Behavior instructions
  - `fallbackPrompt` - Fallback for unknown questions
  - `customPrompts` - JSON with custom prompts for different scenarios

### Usage

- Answers client questions in bot
- Service information
- Booking assistance
- General organization information

### Logging

- All AI requests logged in `AIUsageLog`
- Token usage tracking
- Analytics by usage scenarios

---

## ⚡ WebSocket Real-time System

### Architecture

- **Server:** Port 4000 (same as HTTP API), path `/ws`
- **Authentication:** JWT token required
- **Event Types:**
  - Appointment events (created, updated, cancelled, confirmed)
  - Service events (created, updated, deleted)
  - Slot events (created, updated, deleted)
  - Bot events (message received, command executed, booking started/completed)
  - User events (login, logout, activity)
  - System events (error, maintenance)

### Features

- Real-time data updates
- Notification system (read, mark all read, clear)
- Live dashboard updates
- Event tracking and analytics

---

## 🚀 Development Setup

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker & Docker Compose (optional)
- Git

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd appointments-bot

# Setup (automated)
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start development
./scripts/dev.sh
```

### Manual Setup

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev

# React Admin Panel
cd admin-panel-react
npm install
npm run dev

# Landing Page
cd landing
npm install
npm run dev
```

### Service URLs

- Backend API: http://localhost:4000
- React Admin Panel: http://localhost:4200
- Landing Page: http://localhost:3000
- Health Check: http://localhost:4000/api/health

### Docker Development

```bash
# Start database only
docker-compose up -d db

# Configure Backend for PostgreSQL
cd backend
echo 'DATABASE_URL="postgresql://appointments:appointments_password@localhost:5432/appointments"' > .env
npx prisma db push
npm run seed

# Run Backend and Frontend locally
cd backend && npm run dev
cd admin-panel-react && npm run dev
```

---

## 🚀 Production Deployment

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@db:5432/appointments

# JWT (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Public URLs
PUBLIC_BASE_URL=https://your-domain.com
WEBAPP_URL=https://your-domain.com

# Node
NODE_ENV=production
PORT=4000

# AI (optional)
OPENAI_API_KEY=your_openai_api_key

# WebSocket
WS_ENABLED=true
WS_PORT=4000
```

### Docker Compose Deployment (Recommended)

```bash
# Setup environment
cp .env.example .env
nano .env  # Edit variables

# Setup SSL certificates
mkdir -p ssl
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem

# Deploy
docker-compose -f docker-compose-secure.yml up -d

# Initialize database
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run seed

# Verify
docker-compose ps
docker-compose logs -f
curl https://your-domain.com/api/health
```

### VPS Manual Deployment

1. **Server Setup:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. **Clone & Configure:**
   ```bash
   git clone <repository-url>
   cd appointments-bot
   cp .env.example .env
   nano .env
   ```

3. **SSL Setup:**
   ```bash
   sudo apt install -y certbot
   sudo certbot certonly --standalone -d your-domain.com
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
   ```

4. **Deploy:**
   ```bash
   docker-compose -f docker-compose-secure.yml up -d
   docker-compose exec backend npx prisma migrate deploy
   ```

5. **Firewall:**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

---

## 📊 Monitoring & Maintenance

### Health Checks

- `GET /api/health` - Overall health
- `GET /api/health/websocket` - WebSocket server
- `GET /api/health/database` - Database
- `GET /api/health/bot` - Telegram bot

### Metrics

- Response time, memory usage, CPU usage
- Database connections, WebSocket connections
- Active bots count

### Logging

- Backend: Console + file logs (`logs/backend.log`)
- Structured logging (JSON format)
- Log levels: error, warn, info, debug

### Backups

```bash
# Automated backup
./scripts/backup.sh

# Encrypted backup
./scripts/backup-encrypted.sh

# Schedule daily backup
crontab -e
0 2 * * * /path/to/appointments-bot/scripts/backup.sh
```

### Updates

```bash
# Update application
git pull origin main
npm install
npx prisma migrate deploy
npm run build
docker-compose restart
```

---

## 📈 Performance & Scaling

### Current Metrics

- **Response Time:** < 100ms average, < 200ms (95th percentile)
- **Memory Usage:** ~200-300MB total
- **Database:** < 50ms query time, 10 connection pool
- **WebSocket:** < 100ms connection, < 50ms message delivery, 100+ concurrent connections

### Optimization

- Database indexes on frequently used fields
- Query optimization and connection pooling
- Response caching for frequent requests
- Code splitting and lazy loading in frontend

### Scaling

- Horizontal: Load balancer, multiple backend instances, Redis for shared state
- Vertical: Increase RAM/CPU, database optimization
- CDN: Static assets on CDN, image optimization

---

## 📚 Documentation Structure

```
docs/
├── PROJECT_DETAILED_SPECIFICATION.md  # This file
├── AGENT_ONBOARDING_GUIDE.md          # Agent onboarding
├── PRODUCTION_DEPLOYMENT_GUIDE.md     # Production deployment
├── CRITICAL_FEATURES_ROADMAP.md       # Feature roadmap
├── architecture/                       # System architecture
├── api/                                # API documentation
├── deployment/                         # Deployment guides
├── development/                        # Development guides
└── business/                           # Business documentation
```

---

## 🎯 Production Checklist

### Pre-Deployment

- [ ] All tests passed
- [ ] Environment variables configured
- [ ] SSL certificates ready
- [ ] Database migrations applied
- [ ] Backups configured
- [ ] Monitoring configured
- [ ] Security audit passed

### Post-Deployment

- [ ] Health checks passing
- [ ] API endpoints working
- [ ] Frontend loading
- [ ] Authentication working
- [ ] Telegram bot working
- [ ] WebSocket connections working
- [ ] Database operations working

---

## 📞 Support & Resources

### Key Documentation

- `README.md` - Main project documentation
- `AGENT_ONBOARDING_GUIDE.md` - Agent onboarding guide
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Production deployment guide
- `docs/CRITICAL_FEATURES_ROADMAP.md` - Feature roadmap

### Useful Commands

```bash
# Backend
cd backend
npm run dev              # Start dev server
npm run build            # Build for production
npm run slots:month      # Generate monthly slots
npm run bot:commands     # Set bot commands

# Frontend
cd admin-panel-react
npm run dev              # Start dev server
npm run build            # Build for production

# Database
cd backend
npx prisma studio        # Database GUI
npx prisma migrate dev   # Create migration
npx prisma migrate deploy # Apply migrations
npm run seed             # Seed test data

# Docker
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
```

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** January 18, 2025

---

*This document provides comprehensive project specification for understanding, building, and deploying the Appointments Bot system.*
