# 🏗️ Infrastructure Documentation

## 📋 Overview

This document describes the complete infrastructure setup for the Appointments Bot project, including all services, ports, and deployment configurations.

## 🚀 Services & Ports

### 1. **Backend API** - Port 4000
- **Technology**: Node.js + Express + Prisma
- **Location**: `/backend/`
- **Start Command**: `npm run dev`
- **Description**: Main API server handling business logic, database operations, and Telegram bot integration
- **Key Features**:
  - REST API endpoints
  - Prisma ORM for database management
  - Telegram Bot API integration
  - AI Assistant configuration
  - Authentication & authorization
  - File uploads and media handling

### 2. **Admin Panel (Frontend)** - Port 4200
- **Technology**: Angular 18 + Material Design
- **Location**: `/admin-panel/`
- **Start Command**: `ng serve`
- **Description**: Administrative dashboard for managing organizations, services, appointments, and AI settings
- **Key Features**:
  - Universal header with date/time and refresh
  - Mobile-optimized TWA components
  - Real-time data updates
  - Multi-language support (i18n)
  - Responsive design for desktop/mobile/TWA

### 3. **Landing Page** - Port 3000
- **Technology**: Next.js 14 + Tailwind CSS
- **Location**: `/landing/`
- **Start Command**: `npm run dev`
- **Description**: Marketing website with multi-language support
- **Key Features**:
  - Multi-language landing pages (EN, RU, HE)
  - Responsive design
  - SEO optimization
  - Contact forms
  - Pricing and features showcase

### 4. **NG Rock (Tunnel)** - Port 4040
- **Technology**: ngrok
- **Start Command**: `ngrok http 4200`
- **Description**: Secure tunnel for Telegram Web App (TWA) testing
- **Key Features**:
  - HTTPS tunnel for Telegram Web App
  - Public URL for TWA testing
  - Webhook endpoints for Telegram bot
  - SSL certificate handling

## 🔧 Development Commands

### Start All Services
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Admin Panel
cd admin-panel && ng serve

# Terminal 3 - Landing Page
cd landing && npm run dev

# Terminal 4 - NG Rock (for TWA testing)
ngrok http 4200
```

### Individual Service Commands
```bash
# Backend API
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data

# Admin Panel
cd admin-panel
ng serve             # Start development server
ng build             # Build for production
ng test              # Run unit tests
ng e2e               # Run e2e tests

# Landing Page
cd landing
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run export        # Export static site
```

## 🌐 URLs & Endpoints

### Development URLs
- **Backend API**: `http://localhost:4000`
- **Admin Panel**: `http://localhost:4200`
- **Landing Page**: `http://localhost:3000`
- **NG Rock Tunnel**: `https://[random-id].ngrok.io` (for TWA)

### API Endpoints
```
GET  /api/health              # Health check
GET  /api/organizations       # List organizations
POST /api/organizations       # Create organization
GET  /api/services            # List services
POST /api/services            # Create service
GET  /api/appointments        # List appointments
POST /api/appointments        # Create appointment
GET  /api/slots               # List time slots
POST /api/slots/generate      # Generate time slots
GET  /api/ai/config           # Get AI configuration
POST /api/ai/config           # Update AI configuration
POST /api/ai/test             # Test AI assistant
```

### Telegram Web App Routes
```
/admin-panel/dashboard        # Dashboard
/admin-panel/appointments     # Appointments management
/admin-panel/services         # Services management
/admin-panel/organizations    # Organizations management
/admin-panel/slots            # Time slots management
/admin-panel/settings         # Settings
/admin-panel/ai-config        # AI Assistant configuration
```

## 🗄️ Database

### Prisma Configuration
- **Database**: SQLite (development) / PostgreSQL (production)
- **Location**: `/backend/prisma/schema.prisma`
- **Migrations**: `/backend/prisma/migrations/`
- **Seed Data**: `/backend/prisma/seed.ts`

### Key Models
- **Organization**: Company/entity management
- **User**: System users and authentication
- **Service**: Business services offered
- **Appointment**: Customer bookings
- **Slot**: Available time slots
- **AIConfig**: AI assistant settings

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_WEBHOOK_URL="https://your-domain.com/webhook"
OPENAI_API_KEY="your_openai_key"
JWT_SECRET="your_jwt_secret"
NODE_ENV="development"
```

### Admin Panel (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000/api',
  telegramWebApp: true
};
```

### Landing Page (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## 📱 Telegram Web App (TWA)

### Configuration
- **Web App URL**: `https://[ngrok-url]/admin-panel`
- **Bot Commands**: Configured via `/backend/scripts/setBotCommands.ts`
- **Webhook**: `https://[ngrok-url]/webhook/telegram`

### TWA Features
- Universal header with date/time
- Mobile-optimized components
- Real-time data updates
- Offline support
- Push notifications (planned)

## 🚀 Deployment Strategy

### Development
1. All services run locally
2. NG Rock provides HTTPS tunnel
3. Database: SQLite file
4. Hot reload enabled

### Production (Planned)
1. **Backend**: Docker container on VPS
2. **Admin Panel**: Static build on CDN
3. **Landing Page**: Static build on CDN
4. **Database**: PostgreSQL on managed service
5. **Domain**: Custom domain with SSL

## 🔧 Development Tools

### Required Software
- Node.js 20+
- npm/yarn
- Angular CLI
- ngrok (for TWA testing)
- Git

### VS Code Extensions
- Angular Language Service
- Prisma
- Tailwind CSS IntelliSense
- GitLens
- ESLint
- Prettier

## 📊 Monitoring & Logs

### Development Logs
- **Backend**: Console output + file logs
- **Frontend**: Browser console + Angular DevTools
- **Landing**: Next.js built-in logging

### Health Checks
- Backend: `GET /api/health`
- Frontend: Built-in Angular health checks
- Database: Prisma connection status

## 🧪 Testing Strategy

### Unit Tests
- Backend: Jest + Supertest
- Frontend: Jasmine + Karma
- Landing: Jest + React Testing Library

### Integration Tests
- API endpoint testing
- Database operations
- Telegram bot interactions

### E2E Tests
- Cypress for admin panel
- Playwright for landing page
- TWA testing via ngrok

## 📝 Notes

- All services support hot reload in development
- Database migrations are handled by Prisma
- TWA requires HTTPS (ngrok provides this)
- All services are configured for CORS
- Authentication is JWT-based
- File uploads are handled by backend

## 🔄 Next Steps

1. **UI Polish**: Complete mobile optimization
2. **Testing**: Comprehensive test coverage
3. **Deployment**: Production environment setup
4. **Monitoring**: Logging and analytics
5. **Scaling**: Performance optimization
