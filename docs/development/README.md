# 🔧 Development Documentation - Appointments Bot

This directory contains technical implementation guides, development workflows, and engineering documentation for the Appointments Bot project.

## 📋 Development Overview

### Technology Stack
- **Frontend:** Angular 20 + TypeScript + Material Design 3
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite (dev) / PostgreSQL (prod) + Prisma ORM
- **Bot:** Telegraf.js + Telegram Web App API
- **Deployment:** Docker + Docker Compose

### Development Environment
- **Node.js:** 20.x
- **npm:** 10.x
- **Angular CLI:** 18.x
- **TypeScript:** 5.x

## 🚀 Quick Start

### Prerequisites
```bash
# Install Node.js 20+
node --version  # Should be 20.x or higher

# Install dependencies
cd backend && npm install
cd ../admin-panel && npm install
```

### Development Setup
```bash
# Clone repository
git clone <repository-url>
cd appointments-bot

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start development environment
chmod +x scripts/dev.sh
./scripts/dev.sh
```

### Access Points
- **Backend API:** http://localhost:4000
- **Frontend:** http://localhost:4200
- **Database:** SQLite file in `backend/prisma/prisma/`

## 🏗️ Project Structure

```
appointments-bot/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── api/            # REST API routes
│   │   ├── bot/            # Telegram bot handlers
│   │   ├── lib/            # Shared utilities
│   │   └── server.ts       # Main server file
│   ├── prisma/             # Database schema and migrations
│   └── scripts/            # Utility scripts
├── admin-panel/            # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/       # Core services and guards
│   │   │   ├── features/   # Feature modules
│   │   │   ├── layout/     # Layout components
│   │   │   └── shared/     # Shared components
│   │   └── environments/   # Environment configurations
│   └── dist/               # Build output
├── docs/                   # Documentation
├── scripts/                # Automation scripts
└── docker-compose.yml      # Production deployment
```

## 🔧 Development Workflows

### Backend Development

#### Database Operations
```bash
# Generate Prisma client
cd backend && npx prisma generate

# Run database migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

#### API Development
```bash
# Start backend in development mode
cd backend && npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

#### Bot Development
```bash
# Set bot commands
cd backend && npm run bot:commands

# Test bot locally
npm run bot:dev
```

### Frontend Development

#### Angular Development
```bash
# Start development server
cd admin-panel && npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

#### Component Development
```bash
# Generate new component
ng generate component features/new-feature

# Generate new service
ng generate service core/services/new-service

# Generate new module
ng generate module features/new-module
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Testing
```bash
cd admin-panel

# Run unit tests
npm test

# Run e2e tests
npm run e2e

# Run tests in watch mode
npm run test:watch
```

### Integration Testing
```bash
# Test API endpoints
curl http://localhost:4000/api/health

# Test authentication
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.com","password":"admin123"}'
```

## 🔍 Debugging

### Backend Debugging
```bash
# Enable debug logging
DEBUG=* npm run dev

# Use Node.js debugger
node --inspect src/server.ts
```

### Frontend Debugging
```bash
# Enable Angular debug mode
ng serve --configuration=development

# Use browser dev tools
# Open Chrome DevTools (F12)
# Go to Sources tab for debugging
```

### Database Debugging
```bash
# View database schema
cd backend && npx prisma db pull

# Check database status
npx prisma db status

# View migration history
npx prisma migrate status
```

## 📦 Build & Deployment

### Development Build
```bash
# Backend
cd backend && npm run build

# Frontend
cd admin-panel && npm run build
```

### Production Build
```bash
# Build with Docker
docker-compose build

# Deploy with Docker
docker-compose up -d
```

### Environment Configuration
```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp admin-panel/src/environments/environment.example.ts \
   admin-panel/src/environments/environment.ts
```

## 🔒 Security

### Authentication
- **JWT Tokens:** Stateless authentication
- **Refresh Tokens:** Secure token renewal
- **Password Hashing:** bcrypt with salt rounds
- **Input Validation:** Server-side validation

### API Security
- **CORS:** Configured for specific origins
- **Rate Limiting:** Prevent abuse
- **Input Sanitization:** XSS protection
- **SQL Injection:** Prisma ORM protection

### Frontend Security
- **Content Security Policy:** XSS protection
- **HTTPS:** Secure communication
- **Token Storage:** Secure localStorage usage
- **Route Guards:** Protected routes

## 📊 Performance

### Backend Optimization
- **Database Indexing:** Optimized queries
- **Connection Pooling:** Efficient connections
- **Response Caching:** API response caching
- **Compression:** Gzip compression

### Frontend Optimization
- **Lazy Loading:** Route-based splitting
- **OnPush Strategy:** Change detection optimization
- **Bundle Optimization:** Tree shaking
- **Image Optimization:** Compressed assets

## 🐛 Common Issues & Solutions

### Database Issues
```bash
# Reset database
cd backend && npx prisma migrate reset

# Regenerate client
npx prisma generate

# Check connection
npx prisma db status
```

### Frontend Issues
```bash
# Clear Angular cache
cd admin-panel && rm -rf node_modules/.angular

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear browser cache
# Hard refresh (Ctrl+Shift+R)
```

### Bot Issues
```bash
# Check bot token
echo $TELEGRAM_BOT_TOKEN

# Test bot connection
cd backend && npm run bot:test

# Reset webhook
npm run bot:webhook:reset
```

## 📚 Code Standards

### TypeScript
- **Strict Mode:** Enabled
- **ESLint:** Configured with Angular rules
- **Prettier:** Code formatting
- **Type Safety:** No `any` types

### Angular
- **Standalone Components:** Modern approach
- **Reactive Forms:** Form validation
- **RxJS:** Observable patterns
- **Material Design:** Consistent UI

### Node.js
- **Express:** RESTful API design
- **Prisma:** Type-safe database access
- **JWT:** Secure authentication
- **Error Handling:** Comprehensive error management

## 🔄 Development Best Practices

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Code review
# Create pull request
# Merge after approval
```

### Code Review
- **Functionality:** Does it work as expected?
- **Security:** Any security vulnerabilities?
- **Performance:** Any performance issues?
- **Maintainability:** Is code clean and readable?

### Documentation
- **Code Comments:** Explain complex logic
- **API Documentation:** Document all endpoints
- **README Updates:** Keep documentation current
- **Change Log:** Track all changes

## 📚 Related Documentation

- [Architecture](../architecture/) - System design
- [API Documentation](../api/) - Endpoint reference
- [Deployment Guide](../deployment/) - Production deployment
- [Business Documentation](../business/) - Strategic planning

## 🔄 Development Roadmap

### Current Sprint
- [ ] Telegram Web App integration
- [ ] Multi-tenant bot creation
- [ ] Payment system integration
- [ ] Advanced analytics

### Next Sprint
- [ ] Mobile application
- [ ] AI-powered features
- [ ] Enterprise integrations
- [ ] Performance optimizations

---

*Development Documentation - Technical implementation and workflows* 🔧
