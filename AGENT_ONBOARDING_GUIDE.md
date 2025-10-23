# 🤖 Agent Onboarding Guide - Appointments Bot

**Version:** 1.0  
**Last Updated:** January 18, 2025  
**Status:** Production Ready System

---

## 📋 Quick Overview

This is a **full-stack appointment booking system** with Telegram bot integration, multi-language support, and AI assistant capabilities. The system is **production-ready** and fully functional.

### 🏗️ Architecture
```
appointments-bot/
├── backend/              # Node.js + Express + Prisma + SQLite + Telegram Bot
├── admin-panel-react/    # React Admin Panel (MAIN - Port 4200)
├── admin-panel/          # Angular Admin Panel (Legacy - Port 4201)
├── landing/              # Next.js Landing Page (Port 3000)
├── scripts/              # Automation scripts
└── docs/                # Comprehensive documentation
```

---

## 🚀 Quick Start Commands

### 1. **Start All Services**
```bash
# Option 1: Use automation script
./scripts/start-dev.sh

# Option 2: Manual start
cd backend && npm run dev &          # Backend API (Port 4000)
cd admin-panel-react && npm run dev  # React Admin (Port 4200)
cd landing && npm run dev            # Landing Page (Port 3000)
```

### 2. **Stop All Services**
```bash
./scripts/stop-dev.sh
```

### 3. **Database Operations**
```bash
cd backend
npx prisma studio        # Database GUI
npx prisma migrate dev    # Create migrations
npx prisma db push        # Apply schema changes
npm run seed             # Seed database
```

---

## 🌐 Service URLs & Ports

| Service | URL | Port | Status | Description |
|---------|-----|------|--------|-------------|
| **Backend API** | http://localhost:4000 | 4000 | ✅ Running | Main API server |
| **React Admin Panel** | http://localhost:4200 | 4200 | ✅ Running | Main admin dashboard |
| **Angular Admin Panel** | http://localhost:4201 | 4201 | Optional | Legacy admin panel |
| **Landing Page** | http://localhost:3000 | 3000 | Optional | Marketing website |
| **Database GUI** | http://localhost:5555 | 5555 | Optional | Prisma Studio |

---

## 🔐 Authentication & Users

### **Default Login Credentials**
- **Email:** `some@example.com`
- **Password:** `Test1234`
- **Role:** OWNER
- **Organization:** Demo Org

### **User Roles**
- `SUPER_ADMIN` - Full system access
- `OWNER` - Organization owner
- `MANAGER` - Organization manager

### **Authentication Flow**
1. **Web Login:** POST `/api/auth/login`
2. **Telegram Login:** POST `/api/auth/telegram-login`
3. **JWT Tokens:** Access (1h) + Refresh (7d)
4. **Role-based Access:** Middleware protection

---

## 🗄️ Database Schema

### **Core Models**
```prisma
Organization {
  id, name, description, address, workingHours, phone, email
  avatar, botToken, botUsername
  users[], services[], aiConfig, aiUsageLogs[]
}

User {
  id, email, password, name, role, organizationId
  telegramId, organization, createdAt, updatedAt
}

Service {
  id, name, nameRu, nameEn, nameHe
  description, descriptionRu, descriptionEn, descriptionHe
  durationMin, price, currency, organizationId
  slots[], appointments[]
}

Slot {
  id, serviceId, startAt, endAt, capacity
  service, bookings[]
}

Appointment {
  id, chatId, serviceId, slotId, createdAt, status
  service, slot
}

OrganizationAIConfig {
  id, organizationId, provider, apiKey, model
  maxTokens, temperature, systemPrompt, baseSystemPrompt
  contextInstructions, behaviorInstructions, fallbackPrompt
  customPrompts, enabled
}
```

### **Database Operations**
```bash
# View database
npx prisma studio

# Create migration
npx prisma migrate dev --name "description"

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

---

## 🔌 API Endpoints

### **Authentication Routes**
```
POST /api/auth/login              # Web login
POST /api/auth/register           # User registration
POST /api/auth/telegram-login     # Telegram Web App login
POST /api/auth/refresh            # Token refresh
POST /api/auth/logout             # Logout
```

### **Core API Routes**
```
GET    /api/health                # Health check
GET    /api/appointments          # List appointments
POST   /api/appointments          # Create appointment
PUT    /api/appointments/:id      # Update appointment
DELETE /api/appointments/:id      # Delete appointment

GET    /api/services              # List services
POST   /api/services              # Create service
PUT    /api/services/:id          # Update service
DELETE /api/services/:id         # Delete service

GET    /api/organizations         # List organizations
POST   /api/organizations          # Create organization
PUT    /api/organizations/:id      # Update organization

GET    /api/slots                 # List time slots
POST   /api/slots                 # Create slots
DELETE /api/slots/:id             # Delete slot
```

### **Bot Management Routes**
```
GET    /api/bot/status            # Bot status
POST   /api/bot/start             # Start bot
POST   /api/bot/stop              # Stop bot
POST   /api/bot/restart           # Restart bot
GET    /api/bot/commands          # Bot commands
POST   /api/bot/commands          # Set bot commands
```

### **AI Configuration Routes**
```
GET    /api/ai/config             # Get AI config
POST   /api/ai/config             # Create AI config
PUT    /api/ai/config/:id         # Update AI config
POST   /api/ai/test               # Test AI integration
```

---

## 🤖 Telegram Bot Integration

### **Bot Configuration**
- **Token:** Stored in `Organization.botToken`
- **Username:** Stored in `Organization.botUsername`
- **Multi-tenant:** Each organization has its own bot
- **Web App:** Integrated with React admin panel

### **Bot Features**
- **Booking Flow:** Complete appointment booking
- **Service Selection:** Multi-language service display
- **Slot Management:** Real-time availability
- **AI Assistant:** Contextual responses
- **Web App:** Admin panel access

### **Bot Commands**
```
/start - Start bot interaction
/help - Show help information
/book - Book appointment
/myappointments - View user appointments
/admin - Access admin panel (Web App)
```

### **Web App Integration**
- **URL:** `https://[tunnel].ngrok.io` (for testing)
- **Authentication:** Telegram initData verification
- **Features:** Full admin panel functionality
- **Responsive:** Mobile-optimized interface

---

## 🎨 Frontend Applications

### **React Admin Panel (MAIN)**
- **Framework:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + Radix UI components
- **Features:** Dashboard, Appointments, Services, Organizations, AI Config
- **Port:** 4200
- **Build:** `npm run dev` / `npm run build`

### **Angular Admin Panel (Legacy)**
- **Framework:** Angular 20 + Material Design 3
- **Features:** Same as React panel
- **Port:** 4201
- **Build:** `ng serve` / `ng build`

### **Landing Page**
- **Framework:** Next.js 14 + TypeScript
- **UI:** Tailwind CSS
- **Features:** Multi-language, Registration, Login
- **Port:** 3000
- **Build:** `npm run dev` / `npm run build`

---

## 🌍 Multi-language Support

### **Supported Languages**
- 🇷🇺 **Russian** (default)
- 🇺🇸 **English**
- 🇮🇱 **Hebrew**

### **Localization Files**
```
backend/src/i18n/
├── ru.json          # Russian translations
├── en.json          # English translations
└── he.json          # Hebrew translations
```

### **Language Switching**
- **Frontend:** Language switcher in UI
- **Backend:** Accept-Language header
- **Telegram:** User language detection
- **Database:** Localized content fields

---

## 🧠 AI Assistant Integration

### **AI Configuration**
```typescript
OrganizationAIConfig {
  provider: 'openai' | 'claude' | 'custom'
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
  baseSystemPrompt: string
  contextInstructions: string
  behaviorInstructions: string
  fallbackPrompt: string
  customPrompts: JSON
  enabled: boolean
}
```

### **AI Features**
- **Contextual Responses:** Based on organization data
- **Service Information:** Dynamic service details
- **Booking Assistance:** Help with appointment booking
- **Multi-language:** Responses in user's language
- **Usage Logging:** Track AI interactions

### **AI Testing**
```bash
cd backend
npm run test-ai                    # Test AI integration
npm run test-ai-with-key          # Test with real API key
npm run setup-ai-with-key         # Setup AI with key
```

---

## 🛠️ Development Workflow

### **Backend Development**
```bash
cd backend
npm run dev                       # Start development server
npm run build                     # Build for production
npm run prisma:generate          # Generate Prisma client
npm run prisma:push              # Push schema changes
npm run slots:month              # Generate monthly slots
npm run slots:refresh            # Refresh existing slots
```

### **Frontend Development**
```bash
# React Admin Panel
cd admin-panel-react
npm run dev                       # Start development server
npm run build                     # Build for production

# Angular Admin Panel
cd admin-panel
ng serve                          # Start development server
ng build                          # Build for production

# Landing Page
cd landing
npm run dev                       # Start development server
npm run build                     # Build for production
```

### **Database Development**
```bash
cd backend
npx prisma studio                 # Open database GUI
npx prisma migrate dev            # Create new migration
npx prisma migrate deploy         # Apply migrations
npx prisma db push                # Push schema without migration
npm run seed                      # Seed database with test data
```

---

## 📱 Telegram Web App Development

### **Web App Setup**
1. **Create Bot:** Use @BotFather to create bot
2. **Get Token:** Save bot token in organization
3. **Set Web App:** Configure web app URL
4. **Test Integration:** Use ngrok for local testing

### **Web App Features**
- **Authentication:** Telegram initData verification
- **Admin Panel:** Full React admin panel in Telegram
- **Responsive Design:** Mobile-optimized interface
- **Real-time Updates:** Live data synchronization

### **Testing Web App**
```bash
# Start ngrok tunnel
ngrok http 4200

# Use tunnel URL in bot settings
# Test in Telegram app
```

---

## 🐳 Docker & Deployment

### **Development**
```bash
# Start all services
./scripts/start-dev.sh

# Stop all services
./scripts/stop-dev.sh
```

### **Production**
```bash
# Build and deploy
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Environment Variables**
```bash
# Backend
DATABASE_URL=file:./prisma/prod.db
JWT_SECRET=your-super-secret-jwt-key
TELEGRAM_BOT_TOKEN=your_bot_token
WEBAPP_URL=http://localhost:4200

# Frontend
API_URL=http://localhost:4000
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Telegram Bot Conflict (409 Error)**
```bash
# Error: Conflict: terminated by other getUpdates request
# Solution: Only one bot instance can run at a time
# Check for running processes and kill them
pkill -f "telegraf"
pkill -f "node.*server"
```

#### **2. Port Already in Use**
```bash
# Check what's using the port
lsof -i :4000
lsof -i :4200

# Kill process
kill -9 <PID>
```

#### **3. Database Connection Issues**
```bash
# Reset database
cd backend
npx prisma migrate reset
npm run seed
```

#### **4. Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Log Files**
```bash
# View logs
tail -f logs/backend.log
tail -f logs/admin-panel-react.log
tail -f logs/ngrok.log
```

---

## 📊 Project Status

### **✅ Completed Features**
- ✅ User authentication (JWT + refresh tokens)
- ✅ Role-based access control
- ✅ Multi-language support (RU, EN, HE)
- ✅ Organization management
- ✅ Service management with localization
- ✅ Time slot generation and management
- ✅ Appointment booking system
- ✅ Telegram bot with full booking flow
- ✅ React admin panel with modern UI
- ✅ AI assistant integration
- ✅ Landing page with multi-language support

### **🔄 In Development**
- 🔄 Telegram Web App integration
- 🔄 Multi-tenant bot creation flow
- 🔄 Advanced AI features

### **📋 Planned Features**
- 📋 Payment integration
- 📋 Email/SMS notifications
- 📋 Advanced analytics
- 📋 Mobile applications

---

## 🎯 Critical Development Areas

### **1. Bot Creation Flow (CRITICAL)**
- **File:** `docs/business/CRITICAL_BOT_CREATION_FLOW.md`
- **Status:** In development
- **Priority:** 🔴 CRITICAL

### **2. Telegram Web App Integration**
- **File:** `docs/development/TELEGRAM_WEBAPP_INTEGRATION_GUIDE.md`
- **Status:** 85% complete
- **Priority:** 🟡 HIGH

### **3. AI Assistant Enhancement**
- **File:** `docs/agent-prompts/README.md`
- **Status:** Functional, needs enhancement
- **Priority:** 🟡 HIGH

---

## 📚 Key Documentation Files

### **Technical Documentation**
- `README.md` - Main project documentation
- `QUICK_START.md` - Quick start guide
- `docs/CRITICAL_FEATURES_ROADMAP.md` - Critical features roadmap
- `docs/PROJECT_CHECKPOINT_2025.md` - Current project status
- `docs/architecture/README.md` - System architecture
- `docs/api/README.md` - API documentation
- `docs/development/README.md` - Development guides
- `docs/deployment/README.md` - Deployment instructions

### **Business Documentation**
- `docs/business/README.md` - Business strategy
- `docs/business/STRATEGIC_DEVELOPMENT_PLAN.md` - Strategic plan
- `docs/business/CRITICAL_BOT_CREATION_FLOW.md` - Bot creation flow

### **AI Documentation**
- `docs/agent-prompts/README.md` - AI agent prompts

---

## 🚀 Ready for Development!

The system is **fully functional** and ready for development. All core features are working, and the architecture is solid for future enhancements.

### **Next Steps for New Agent:**
1. **Read this guide completely**
2. **Start the development environment** using the commands above
3. **Test the login** with the provided credentials
4. **Explore the admin panel** at http://localhost:4200
5. **Check the API** at http://localhost:4000/api/health
6. **Review the documentation** in the `docs/` folder
7. **Begin development** on the planned features

---

**🎉 Welcome to the Appointments Bot project! The system is production-ready and waiting for your contributions!**
