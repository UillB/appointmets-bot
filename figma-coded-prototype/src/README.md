# 📅 Appointments Bot Admin Panel

A comprehensive, modern admin panel for managing an appointment booking bot system. Built with React, TypeScript, Tailwind CSS v4.0, and shadcn/ui components.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

---

## ✨ Features

### Core Functionality
- 📊 **Dashboard** - Real-time statistics and quick actions
- 📅 **Appointments** - Complete booking management with filtering
- 🛠️ **Services** - CRUD operations with auto-generated slots (1 year)
- 📈 **Analytics** - Performance tracking with charts and insights
- 🏢 **Organizations** - Multi-organization management
- 🤖 **Bot Management** - Telegram bot configuration and webhook setup
- 🤖 **AI Assistant** - OpenAI/Anthropic/Google AI integration for chatbot
- ⚙️ **Settings** - User profile and system preferences
- 🔔 **Smart Notifications** - Comprehensive toast system with WebSocket support

### Design Highlights
- 🎨 Material Design principles with modern aesthetics
- 📱 Fully responsive (Mobile, Tablet, Desktop, Telegram Web App)
- 🌐 Multi-language support (English, Russian, Hebrew)
- ♿ WCAG 2.1 AA accessibility compliant
- 🎭 Smooth animations and transitions
- 🌓 Light theme (Dark mode ready)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🏗️ Project Structure

```
/
├── App.tsx                    # Main application & routing
├── components/
│   ├── PageHeader.tsx         # Reusable gradient header
│   ├── StatCard.tsx           # Statistics card component
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── Dashboard.tsx          # Dashboard page
│   ├── AppointmentsPage.tsx      # Appointments management
│   ├── ServicesPage.tsx          # Services CRUD (auto-slots)
│   ├── AnalyticsPage.tsx         # Analytics & insights
│   ├── OrganizationsPage.tsx     # Organizations management
│   ├── BotManagementPage.tsx     # Bot configuration
│   ├── AIAssistantPage.tsx       # AI assistant configuration
│   ├── SettingsPage.tsx          # User & system settings
│   ├── toast-notifications.tsx   # Smart toast system
│   └── ui/                       # shadcn/ui components
├── styles/
│   └── globals.css            # Global styles & animations
├── PROJECT.md                 # Full project documentation
├── CURSOR_GUIDE.md            # Quick reference for developers
└── README.md                  # This file
```

---

## 🎨 Design System

### Color Palette
- **Primary**: `#4F46E5` (Indigo-600)
- **Primary Hover**: `#4338CA` (Indigo-700)
- **Sidebar Gradient**: `from-#5B4FE9 to-#4338CA`
- **Background**: `#FAFAFA` (Gray-50)
- **Card Background**: `#FFFFFF`

### Typography
Typography is managed globally in `styles/globals.css`. Do not use Tailwind font classes unless specifically needed.

### Spacing
Based on 8px grid system:
- `gap-4` / `space-y-4` = 16px
- `gap-6` / `space-y-6` = 24px
- `p-4` / `p-6` = 16px / 24px

---

## 📱 Responsive Breakpoints

| Breakpoint | Size | Usage |
|------------|------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop (sidebar becomes fixed) |
| `xl` | 1280px | Large desktop |

---

## 🧩 Key Components

### PageHeader
Reusable gradient header with live clock, used on all pages (except Dashboard):
```tsx
<PageHeader
  icon={<Icon className="w-7 h-7 text-white" />}
  title="Page Title"
  description="Page description"
  onRefresh={handleRefresh}
  onMenuClick={onMenuClick}
  actions={<>Action Buttons</>}
/>
```

### StatCard
Statistics display card:
```tsx
<StatCard
  icon={IconComponent}
  iconBg="bg-blue-50"
  iconColor="text-blue-600"
  title="Title"
  value={42}
  subtitle="Subtitle"
/>
```

### Card Pattern
Standard card layout with icon header:
```tsx
<Card className="p-6 bg-white">
  <div className="space-y-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div>
        <h3 className="text-lg">Section Title</h3>
        <p className="text-sm text-gray-500">Description</p>
      </div>
    </div>
    <Separator />
    {/* Content */}
  </div>
</Card>
```

---

## 🎯 Page Descriptions

### 📊 Dashboard
- Real-time statistics overview
- Quick action cards
- Recent appointments
- Upcoming schedule

### 📅 Appointments
- Complete booking management
- Status tracking (Pending, Confirmed, Cancelled)
- Advanced filtering and search
- Mobile-optimized card view / Desktop table view

### 🛠️ Services
- Service CRUD operations
- **Auto-generated slots for 1 year** (no manual management needed)
- Capacity and booking tracking
- Category management
- Performance metrics

### 📈 Analytics
- Performance overview with time period filters
- Appointments trend charts (daily/weekly/monthly)
- Top services ranking
- Peak hours analysis
- Status distribution (Confirmed/Pending/Cancelled)
- Quick insights and recommendations

### 🏢 Organizations
- Multi-organization support
- Organization profiles
- Contact management

### 🤖 Bot Management
- Telegram bot configuration
- Webhook URL setup
- Token management
- Test connectivity
- **Automatic slot generation** with flexible parameters
- Schedule management (Daily, Weekly, Monthly, Yearly)
- Working hours configuration
- Break time support
- Bulk operations

### 🤖 AI Assistant
- AI provider selection (OpenAI, Anthropic, Google)
- Model configuration
- Custom instructions
- Temperature & token settings
- Test functionality

### ⚙️ Settings
- User profile management
- Password change
- System preferences (Language, Theme, Timezone)
- Notification settings
- Date/Time format configuration

---

## 🔔 Smart Notification System

Comprehensive toast notification system with **WebSocket support** for real-time events.

### Quick Usage
```tsx
import { toastNotifications } from './components/toast-notifications';

// Appointments
toastNotifications.appointments.created();
toastNotifications.appointments.confirmed("John Doe");

// Services
toastNotifications.services.created("Haircut");
toastNotifications.services.slotsGenerated("Massage");

// Organizations
toastNotifications.organizations.updated("Tech Inc");

// Real-time WebSocket events
toastNotifications.realtime.newAppointment("Jane Smith");
toastNotifications.realtime.appointmentCancelled("Mike Johnson");

// System
toastNotifications.system.refreshed("Dashboard");
toastNotifications.system.exported("Services");
toastNotifications.system.connectionLost();

// Errors & Warnings
toastNotifications.errors.network();
toastNotifications.warnings.unsavedChanges();
```

### Features
- ✅ **Contextual icons** - Visual feedback with Lucide icons
- ✅ **Rich descriptions** - Clear, informative messages
- ✅ **WebSocket ready** - Built-in support for real-time events
- ✅ **Categorized** - Organized by feature (appointments, services, etc.)
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Consistent** - Unified notification system across the app

📖 Full documentation: [TOAST_SYSTEM.md](./TOAST_SYSTEM.md)

---

## 📚 Documentation

### 📖 Complete Documentation Suite

| Document | Purpose | Priority |
|----------|---------|----------|
| **[INDEX.md](./INDEX.md)** | 📇 Navigation to all documentation | ⭐ Start Here |
| **[README.md](./README.md)** | 📄 Project overview & quick start | 🔴 Essential |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | ⚡ One-page cheat sheet | 🔴 Essential |
| **[CURSOR_GUIDE.md](./CURSOR_GUIDE.md)** | 🤖 Quick patterns for developers | 🔴 Essential |
| **[STYLING_GUIDE.md](./STYLING_GUIDE.md)** | 🎨 Complete styling reference | 🟡 Important |
| **[PROJECT.md](./PROJECT.md)** | 📚 Complete technical docs | 🟡 Important |
| **[CONSISTENCY_CHECKLIST.md](./CONSISTENCY_CHECKLIST.md)** | ✅ Quality assurance checklist | 🟡 Important |
| **[SUMMARY.md](./SUMMARY.md)** | 📊 Project completion summary | 🟢 Reference |
| **[.cursorrules](./.cursorrules)** | 🤖 Cursor AI configuration | 🟢 Reference |

### Quick Start for Developers
1. **New to project?** Start with [INDEX.md](./INDEX.md)
2. **Need quick patterns?** Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. **Building features?** Use [CURSOR_GUIDE.md](./CURSOR_GUIDE.md)
4. **Styling components?** See [STYLING_GUIDE.md](./STYLING_GUIDE.md)
5. **Deep dive needed?** Read [PROJECT.md](./PROJECT.md)

---

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com):
- Button, Card, Input, Label, Textarea
- Select, Switch, Checkbox, Radio Group
- Dialog, Sheet, Tabs, Separator
- Table, Badge, Avatar
- And many more...

Icons from [Lucide React](https://lucide.dev)

---

## 🌐 Internationalization

### Supported Languages
- 🇬🇧 English
- 🇷🇺 Russian (Русский)
- 🇮🇱 Hebrew (עברית) - with RTL support

---

## 🔐 Security

- Client-side form validation
- Password strength requirements
- API key verification
- Secure data handling
- No sensitive data in repository

---

## 🚧 Future Enhancements

- [ ] Real-time updates with WebSocket
- [ ] Advanced analytics dashboard
- [ ] Email template builder
- [ ] SMS notifications
- [ ] Payment integration
- [ ] Calendar view for appointments
- [ ] Drag & drop slot management
- [ ] Full dark mode implementation
- [ ] Complete i18n integration
- [ ] Role-based access control
- [ ] Export to PDF/Excel

---

## 🤝 Contributing

1. Review **[PROJECT.md](./PROJECT.md)** for architecture patterns
2. Follow established component patterns
3. Test on all breakpoints (mobile, tablet, desktop)
4. Add appropriate toast notifications
5. Maintain design consistency

---

## 📄 License

This project is proprietary and confidential.

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev)
- UI components by [shadcn/ui](https://ui.shadcn.com)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Icons by [Lucide](https://lucide.dev)
- Design inspired by Material Design 3

---

## 📞 Support

For questions or issues:
1. Check **[PROJECT.md](./PROJECT.md)**
2. Review **[CURSOR_GUIDE.md](./CURSOR_GUIDE.md)**
3. Test in browser DevTools (responsive mode)

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

Made with ❤️ for efficient appointment management