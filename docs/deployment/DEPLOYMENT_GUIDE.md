# 🚀 Deployment Guide - Appointments Bot

## 📋 Overview

This guide provides step-by-step instructions for deploying the Appointments Bot system in different environments.

## 🏗️ Architecture

```
appointments-bot/
├── backend/          # Node.js + Express + Prisma + Telegram Bot
├── admin-panel/      # Angular 20 Admin Panel  
├── scripts/          # Automation scripts
├── docs/             # Documentation
└── docker-compose.yml # Production deployment
```

## 🛠️ Prerequisites

- Node.js 20+ [[memory:2591400]]
- npm
- Docker & Docker Compose (for production)
- Git

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd appointments-bot
```

### 2. Automated Setup
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. Start Development Environment
```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

## 🔧 Manual Setup

### Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

### Frontend Setup
```bash
cd admin-panel
npm install
npm run dev
```

## 🐳 Docker Deployment

### Production Deployment
```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your settings

# 2. Deploy with Docker
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Manual Docker Commands
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Environment Configuration

### Required Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"

# Web App URL
WEBAPP_URL="http://localhost:4200"

# Node Environment
NODE_ENV="development"

# API Port
PORT=4000
```

### Production Environment Variables

```env
# Database (PostgreSQL recommended for production)
DATABASE_URL="postgresql://username:password@localhost:5432/appointments"

# JWT Secret (MUST be changed!)
JWT_SECRET="your-production-jwt-secret-here"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your_production_bot_token"

# Web App URL
WEBAPP_URL="https://yourdomain.com"

# Node Environment
NODE_ENV="production"

# API Port
PORT=4000
```

## 📱 Telegram Bot Setup

### 1. Create Bot
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Use `/newbot` command
3. Follow instructions to create bot
4. Save the bot token

### 2. Configure Bot
1. Add token to `.env` file
2. Set webhook (optional):
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://yourdomain.com/api/telegram/webhook"}'
   ```

## 🗄️ Database Setup

### SQLite (Development)
```bash
cd backend
npx prisma migrate dev
npx prisma generate
npm run seed
```

### PostgreSQL (Production)
```bash
# 1. Install PostgreSQL
# 2. Create database
createdb appointments

# 3. Update DATABASE_URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/appointments"

# 4. Run migrations
cd backend
npx prisma migrate deploy
npx prisma generate
npm run seed
```

## 🔐 Authentication Setup

### Create Super Admin
```bash
cd backend
npm run create-super-admin
```

### Default Credentials
- **Email:** admin@system.com
- **Password:** admin123

**⚠️ IMPORTANT:** Change default credentials in production!

## 🌍 Multi-language Support

The system supports:
- 🇷🇺 Russian
- 🇺🇸 English
- 🇮🇱 Hebrew

Language files are located in:
- Backend: `backend/src/i18n/lang/`
- Frontend: `admin-panel/src/assets/i18n/`

## 📊 Service URLs

After deployment:

- **Backend API:** http://localhost:4000
- **Admin Panel:** http://localhost:4200
- **API Health Check:** http://localhost:4000/api/health
- **API Documentation:** http://localhost:4000/api/docs

## 🔍 Health Checks

### Backend Health
```bash
curl http://localhost:4000/api/health
```

### Frontend Health
```bash
curl http://localhost:4200
```

### Database Health
```bash
cd backend
npx prisma db pull
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :4000
   lsof -i :4200
   
   # Kill process
   kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   cd backend
   npx prisma db push
   npx prisma generate
   ```

3. **Permission Issues**
   ```bash
   chmod +x scripts/*.sh
   ```

4. **Docker Issues**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Logs

```bash
# Backend logs
cd backend && npm run dev

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# System logs
journalctl -u appointments-bot
```

## 🔄 Updates

### Update Application
```bash
git pull origin main
npm install
npx prisma migrate deploy
npm run build
```

### Update Docker
```bash
docker-compose pull
docker-compose up -d
```

## 📈 Monitoring

### Performance Monitoring
- Monitor API response times
- Check database performance
- Monitor Telegram bot usage

### Log Monitoring
- Application logs
- Error logs
- Access logs

## 🔒 Security

### Production Security Checklist
- [ ] Change default JWT secret
- [ ] Change default admin credentials
- [ ] Use HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular security updates

## 📞 Support

For issues and questions:
1. Check [documentation](docs/)
2. Create [GitHub Issue](https://github.com/your-repo/issues)
3. Contact development team

---

**Status:** ✅ Ready for Production Deployment
