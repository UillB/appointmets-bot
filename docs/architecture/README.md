# 🏗️ Architecture Documentation - Appointments Bot

This directory contains comprehensive architecture documentation for the Appointments Bot system.

## 📋 Architecture Overview

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Angular)     │◄──►│   (Node.js)     │◄──►│   (SQLite)      │
│   Port: 4200    │    │   Port: 4000    │    │   Prisma ORM    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  Telegram Bot   │    │   Web App       │
│  (Telegraf.js)  │    │   (Calendar)    │
│  Bot API        │    │   Integration   │
└─────────────────┘    └─────────────────┘
```

## 🎯 Architecture Principles

### 1. **Modular Design**
- Clear separation of concerns
- Independent deployable components
- Loose coupling between modules

### 2. **Scalability**
- Horizontal scaling capability
- Database optimization
- Caching strategies

### 3. **Security**
- JWT authentication
- Role-based access control
- Input validation and sanitization

### 4. **Maintainability**
- Clean code architecture
- Comprehensive documentation
- Automated testing

## 🔧 Technology Stack

### Frontend (Angular 20)
- **Framework:** Angular 20 with TypeScript
- **UI Library:** Angular Material Design 3
- **State Management:** RxJS Observables
- **Styling:** SCSS with CSS custom properties
- **Build Tool:** Angular CLI

### Backend (Node.js)
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **ORM:** Prisma
- **Authentication:** JWT with refresh tokens
- **Validation:** Built-in Express validation

### Database
- **Primary:** SQLite (development)
- **Production:** PostgreSQL (planned)
- **ORM:** Prisma
- **Migrations:** Prisma Migrate

### Telegram Integration
- **Bot Framework:** Telegraf.js
- **Web App:** Telegram Web App API
- **Localization:** Custom i18n system

## 📊 Database Schema

### Core Entities
```sql
-- Users and Authentication
User {
  id: Int (Primary Key)
  email: String (Unique)
  password: String (Hashed)
  name: String
  role: UserRole (SUPER_ADMIN | OWNER | MANAGER)
  organizationId: Int (Foreign Key)
  telegramId: String (Optional)
  isActive: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}

-- Multi-tenant Organizations
Organization {
  id: Int (Primary Key)
  name: String
  type: String
  avatar: String (Optional)
  ownerId: Int (Foreign Key)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Services offered by organizations
Service {
  id: Int (Primary Key)
  name: String
  nameEn: String
  nameHe: String
  description: String
  durationMin: Int
  price: Decimal
  organizationId: Int (Foreign Key)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Time slots for booking
Slot {
  id: Int (Primary Key)
  startAt: DateTime
  endAt: DateTime
  capacity: Int
  serviceId: Int (Foreign Key)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Appointments/Bookings
Appointment {
  id: Int (Primary Key)
  chatId: String
  status: AppointmentStatus (pending | confirmed | cancelled)
  serviceId: Int (Foreign Key)
  slotId: Int (Foreign Key)
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🔄 Data Flow

### 1. **User Authentication Flow**
```
User Login → JWT Token → API Requests → Role-based Access
```

### 2. **Appointment Booking Flow**
```
Telegram Bot → Web App Calendar → Backend API → Database → Confirmation
```

### 3. **Admin Panel Flow**
```
Admin Login → Dashboard → CRUD Operations → Real-time Updates
```

## 🚀 Deployment Architecture

### Development Environment
```
Local Machine:
├── Backend (localhost:4000)
├── Frontend (localhost:4200)
├── Database (SQLite file)
└── Telegram Bot (webhook)
```

### Production Environment
```
Docker Containers:
├── Backend Container
├── Frontend Container (Nginx)
├── Database Container (PostgreSQL)
└── Reverse Proxy (Nginx)
```

## 🔒 Security Architecture

### Authentication & Authorization
- **JWT Tokens:** Stateless authentication
- **Refresh Tokens:** Secure token renewal
- **Role-based Access:** Granular permissions
- **Session Management:** Secure session handling

### Data Protection
- **Input Validation:** Server-side validation
- **SQL Injection Prevention:** Prisma ORM protection
- **XSS Protection:** Angular built-in protection
- **CORS Configuration:** Controlled cross-origin access

## 📈 Performance Considerations

### Frontend Optimization
- **Lazy Loading:** Route-based code splitting
- **OnPush Strategy:** Angular change detection optimization
- **Bundle Optimization:** Tree shaking and minification
- **Caching:** HTTP caching strategies

### Backend Optimization
- **Database Indexing:** Optimized queries
- **Connection Pooling:** Efficient database connections
- **Response Caching:** API response caching
- **Compression:** Gzip compression

## 🔧 Configuration Management

### Environment Variables
```bash
# Backend Configuration
NODE_ENV=development
PORT=4000
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key
TELEGRAM_BOT_TOKEN=your-bot-token
PUBLIC_BASE_URL=http://localhost:4000

# Frontend Configuration
API_URL=http://localhost:4000/api
ENVIRONMENT=development
```

### Docker Configuration
- **Multi-stage builds:** Optimized container images
- **Environment-specific configs:** Development and production
- **Volume mounting:** Persistent data storage
- **Network configuration:** Container communication

## 📚 Related Documentation

- [Development Guides](../development/) - Implementation details
- [API Documentation](../api/) - Endpoint specifications
- [Deployment Guide](../deployment/) - Deployment instructions

## 🔄 Architecture Evolution

### Current State (v1.0)
- Monolithic backend
- SQLite database
- Basic Telegram integration
- Angular admin panel

### Planned Improvements (v2.0)
- Microservices architecture
- PostgreSQL database
- Advanced Telegram Web App
- Mobile application

### Future Vision (v3.0)
- Cloud-native architecture
- Multi-region deployment
- AI-powered features
- Enterprise integrations

---

*Architecture Documentation - System design and technical specifications* 🏗️
