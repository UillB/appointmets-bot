# System Architecture - Appointments Bot Admin Panel

## 🏗️ Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     TELEGRAM BOT ECOSYSTEM                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   End User   │◄────────┤ Telegram Bot │                     │
│  │ (Client/User)│         │  @YourBot    │                     │
│  └──────────────┘         └───────┬──────┘                     │
│                                    │                             │
│                                    │ Bot API                     │
│                                    ▼                             │
│                          ┌─────────────────┐                    │
│                          │  Backend Server │                    │
│                          │  (Node.js/etc)  │                    │
│                          └────────┬────────┘                    │
│                                   │                              │
│                    ┌──────────────┼──────────────┐              │
│                    │              │              │              │
│                    ▼              ▼              ▼              │
│            ┌──────────┐   ┌──────────┐   ┌──────────┐         │
│            │ Database │   │WebSocket │   │REST API  │         │
│            │ (Postgres│   │  Server  │   │Endpoints │         │
│            │ /MongoDB)│   └────┬─────┘   └────┬─────┘         │
│            └──────────┘        │              │                │
│                                │              │                │
│                                ▼              ▼                │
│                         ┌─────────────────────────┐            │
│                         │   ADMIN WEB PANEL       │            │
│                         │   (React Frontend)      │            │
│                         └─────────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Component Architecture

### Frontend (React)

```
App.tsx
├── Header (Global)
│   ├── Connection Status (WebSocket)
│   ├── Notifications Panel
│   ├── Language Selector
│   └── User Profile
│
├── Sidebar (Navigation)
│   ├── Navigation Items
│   ├── Admin Status Card
│   └── Quick Stats
│
└── Pages (Content)
    ├── Dashboard
    │   ├── AppointmentsSummaryCard
    │   │   ├── Total Count
    │   │   ├── Confirmed
    │   │   ├── Pending
    │   │   └── Rejected
    │   ├── QuickActionCard
    │   ├── StatCard
    │   └── AppointmentCard
    │
    ├── Appointments
    │   ├── AppointmentsTable
    │   ├── AppointmentFormSheet
    │   └── AppointmentDialog
    │
    ├── Services
    │   ├── ServicesGrid
    │   ├── ServiceCard
    │   └── ServiceFormSheet
    │
    ├── Analytics (NEW)
    │   ├── Charts (Recharts)
    │   ├── Metrics
    │   └── Reports
    │
    ├── Organizations
    │   ├── OrganizationCard
    │   └── OrganizationFormSheet
    │
    ├── Bot Management (REDESIGNED)
    │   ├── Setup Progress
    │   ├── Status Cards
    │   ├── Token Input
    │   ├── Admin Authorization
    │   └── Commands List
    │
    ├── AI Assistant (BETA)
    │   └── Chat Interface
    │
    └── Settings
        ├── Profile Settings
        ├── Notification Preferences
        └── System Config
```

## 🔌 Real-Time Data Flow

### WebSocket Event Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT LIFECYCLE                           │
└─────────────────────────────────────────────────────────────┘

1. USER ACTION IN TELEGRAM
   ┌──────────────┐
   │   Client     │ Sends /book command
   │ (Telegram)   │────────────────┐
   └──────────────┘                │
                                   ▼
                            ┌──────────────┐
                            │ Telegram Bot │
                            │    Server    │
                            └──────┬───────┘
                                   │
                                   │ Processes request
                                   ▼
2. BOT PROCESSES & SAVES
                            ┌──────────────┐
                            │   Backend    │
                            │   Database   │
                            └──────┬───────┘
                                   │
                                   │ Stores appointment
                                   ▼
3. BROADCAST TO WEBSOCKET
                            ┌──────────────┐
                            │  WebSocket   │
                            │   Server     │
                            └──────┬───────┘
                                   │
                                   │ Broadcasts event
                                   ▼
4. ADMIN RECEIVES UPDATE
                       ┌───────────────────┐
                       │  Admin Panel      │
                       │  (useWebSocket)   │
                       └─────────┬─────────┘
                                 │
                     ┌───────────┼───────────┐
                     │           │           │
                     ▼           ▼           ▼
              ┌─────────┐ ┌─────────┐ ┌─────────┐
              │ Header  │ │Dashboard│ │ Toast   │
              │ Badge   │ │ Update  │ │ Notify  │
              └─────────┘ └─────────┘ └─────────┘
```

## 🗄️ Data Models

### Appointment
```typescript
interface Appointment {
  id: string;
  clientName: string;
  clientTelegramId: string;
  serviceId: string;
  organizationId: string;
  slotId: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  date: Date;
  time: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Service
```typescript
interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  organizationId: string;
  isActive: boolean;
  slots: Slot[]; // Auto-generated for 1 year
}
```

### Organization
```typescript
interface Organization {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  services: Service[];
}
```

### Admin User
```typescript
interface AdminUser {
  id: string;
  telegramId: string;
  telegramUsername: string;
  firstName: string;
  lastName?: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'manager';
  isLinked: boolean;
  linkedAt?: Date;
}
```

### WebSocket Event
```typescript
interface WebSocketEvent {
  type: 'appointment.created' 
      | 'appointment.confirmed' 
      | 'appointment.cancelled' 
      | 'appointment.rescheduled'
      | 'appointment.rejected';
  data: {
    appointmentId: string;
    clientName?: string;
    clientTelegramId?: string;
    serviceName?: string;
    timestamp: string;
  };
}
```

## 🔐 Authentication & Authorization

### Admin Authorization Flow

```
┌────────────────────────────────────────────────────────────────┐
│                  ADMIN LINKING PROCESS                          │
└────────────────────────────────────────────────────────────────┘

1. INITIATE
   Admin clicks "Authorize Admin Access"
   ↓
   Frontend generates unique token
   ↓
   Creates link: t.me/YourBot?start=admin_auth_TOKEN

2. TELEGRAM
   User clicks link → Opens bot
   ↓
   Bot receives /start admin_auth_TOKEN
   ↓
   Bot validates token (not expired, not used)

3. VERIFICATION
   Bot checks:
   ├─ Token valid? ✓
   ├─ Not expired? ✓
   ├─ Organization exists? ✓
   └─ User authorized? ✓

4. LINKING
   Backend creates AdminUser record
   ├─ telegramId: from Telegram
   ├─ organizationId: from token
   ├─ isLinked: true
   └─ linkedAt: timestamp

5. CONFIRMATION
   Bot sends success message
   ↓
   Frontend updates via WebSocket
   ↓
   Sidebar shows "Telegram Linked ✓"

6. ACCESS GRANTED
   User can now:
   ├─ Open Web App from Telegram
   ├─ Manage appointments
   ├─ Configure bot
   └─ View analytics
```

## 🎨 UI Component Hierarchy

### shadcn/ui Components Used

```
Core Components
├── Button (Primary actions)
├── Card (Content containers)
├── Input (Form fields)
├── Label (Form labels)
├── Badge (Status indicators)
├── Progress (Setup progress)
├── Alert (Warnings/Info)
├── Dialog (Modals)
├── Sheet (Side panels)
├── Tabs (Content organization)
├── Select (Dropdowns)
├── Calendar (Date picker)
├── Avatar (User profile)
└── Sonner (Toast notifications)

Custom Components
├── PageTitle (Page headers)
├── StatCard (Statistics display)
├── QuickActionCard (Action tiles)
├── AppointmentCard (Appointment items)
├── AppointmentsSummaryCard (Stats overview)
├── ServiceCard (Service display)
├── OrganizationCard (Org display)
├── NotificationPanel (Notifications)
└── Header (Global header)
```

## 🎨 Styling System

### Tailwind Configuration

```css
/* Color Palette */
Primary (Indigo)
  ├─ #4F46E5 (600)
  ├─ #4338CA (700)
  └─ #6366F1 (500)

Success (Emerald)
  ├─ #10B981 (500)
  └─ #16a34a (600)

Warning (Amber)
  ├─ #F59E0B (500)
  └─ #D97706 (600)

Error (Red)
  ├─ #DC2626 (600)
  └─ #EF4444 (500)

Info (Blue)
  ├─ #3B82F6 (500)
  └─ #2563EB (600)

/* Spacing (8px grid) */
Space: 0, 8, 16, 24, 32, 40, 48...
  
/* Typography */
Font: System sans-serif
Sizes: 12, 14, 16, 18, 20, 24, 30, 36
Weights: 400 (normal), 500 (medium), 600 (semibold)

/* Shadows */
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.1)
lg: 0 10px 15px rgba(0,0,0,0.1)
```

## 📱 Responsive Breakpoints

```
Mobile: 0-639px
  ├─ Single column
  ├─ Stacked cards
  └─ Mobile menu

Tablet: 640-1023px
  ├─ 2-column grid
  ├─ Compact sidebar
  └─ Touch-optimized

Desktop: 1024px+
  ├─ Full layout
  ├─ Fixed sidebar
  └─ Hover states
```

## 🔄 State Management

### Current Architecture

```
Component State (useState)
  ├─ Form inputs
  ├─ UI toggles
  └─ Local data

Custom Hooks
  ├─ useWebSocket
  │   ├─ Connection state
  │   ├─ Last message
  │   └─ Send function
  │
  └─ (Future hooks)
      ├─ useAuth
      ├─ useAppointments
      └─ useNotifications

Props Flow
  ├─ App → Header (onMenuClick)
  ├─ App → Sidebar (activePage, onNavigate)
  └─ Parent → Child (data, callbacks)
```

### Recommended for Production

```
Context API (React)
  ├─ AuthContext (user, admin status)
  ├─ WebSocketContext (connection)
  └─ NotificationContext (unread count)

State Library (optional)
  ├─ Zustand (lightweight)
  └─ Redux Toolkit (complex apps)
```

## 🚀 Performance Optimizations

### Current
- ✅ Component code splitting
- ✅ Lazy loading pages
- ✅ Optimized re-renders
- ✅ Debounced inputs

### Recommended
- ⏳ Image lazy loading
- ⏳ Virtual scrolling (large lists)
- ⏳ Service worker (offline)
- ⏳ CDN for assets

## 🔒 Security Considerations

### Frontend
- ✅ Input validation
- ✅ XSS prevention (React default)
- ✅ HTTPS only
- ⏳ CSP headers

### Backend (To Implement)
- ⏳ JWT authentication
- ⏳ Rate limiting
- ⏳ SQL injection prevention
- ⏳ CORS configuration

### WebSocket
- ⏳ WSS (secure)
- ⏳ Token authentication
- ⏳ Message validation
- ⏳ Connection limits

## 📊 Monitoring & Analytics

### Frontend Metrics
- Page load time
- Component render time
- WebSocket latency
- Error rates

### Backend Metrics
- API response time
- WebSocket connections
- Database queries
- Bot response rate

## 🌐 Internationalization

### Current: English
### Planned: Russian, Hebrew

```
Structure
  ├─ /locales
  │   ├─ en.json
  │   ├─ ru.json
  │   └─ he.json
  │
  ├─ RTL Support (Hebrew)
  │   ├─ Flexbox reversal
  │   ├─ Text alignment
  │   └─ Icon positioning
  │
  └─ Language Context
      ├─ Selected language
      ├─ Translation function
      └─ Language switcher
```

## 🎯 Future Enhancements

### Phase 1 (Current)
- ✅ Dashboard
- ✅ Appointments
- ✅ Services
- ✅ Analytics
- ✅ Bot Management
- ✅ WebSocket

### Phase 2 (Next)
- ⏳ Real WebSocket backend
- ⏳ Admin authorization backend
- ⏳ Multi-language
- ⏳ Sound notifications
- ⏳ Export features

### Phase 3 (Future)
- ⏳ Mobile app (React Native)
- ⏳ Calendar integration
- ⏳ Payment processing
- ⏳ SMS notifications
- ⏳ Custom branding

## 📖 Related Documentation

- **WEBSOCKET_GUIDE.md** - WebSocket implementation
- **BOT_SETUP_GUIDE.md** - Bot management
- **TOAST_SYSTEM.md** - Toast notifications
- **STYLING_GUIDE.md** - Design system
- **LATEST_UPDATES.md** - Recent changes
- **QUICK_START.md** - Getting started

---

**Last Updated**: November 2025  
**Version**: 2.0.0 - Real-Time System
