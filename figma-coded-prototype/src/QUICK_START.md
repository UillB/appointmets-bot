# ⚡ Quick Start Guide

> Get up and running in 5 minutes

---

## 🚀 Installation

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# http://localhost:5173
```

---

## 📖 First Time Setup

### Default Login (Mock)
```
Email: admin@example.com
Password: (any password works - mock auth)
```

### Initial Page
You'll land on the **Dashboard** with:
- Welcome message
- Statistics cards
- Quick actions
- Calendar widget

---

## 🗺️ Navigation

### Main Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview and stats |
| Appointments | `/appointments` | Booking management |
| Services | `/services` | Service CRUD |
| Organizations | `/organizations` | Location management |
| Bot Management | `/bot-management` | Bot setup wizard |
| Analytics | `/analytics` | Reports and charts |
| Settings | `/settings` | Configuration |

### How to Navigate
- **Sidebar** (left) - Click page names
- **Quick Actions** (dashboard) - Click cards
- **Header** (top) - User menu, notifications

---

## 🎯 Common Tasks

### 1. Create an Appointment

```
1. Go to Appointments page
2. Click "New" button (top right)
3. Fill form (4 steps):
   - Client info
   - Service selection
   - Date & time
   - Notes
4. Click "Create Appointment"
5. Toast notification confirms
```

### 2. Add a Service

```
1. Go to Services page
2. Click "Add Service"
3. Fill form (3 steps):
   - Name & description
   - Price & duration
   - Availability toggle
4. Click "Create Service"
5. Slots auto-generate for 1 year
```

### 3. Setup Bot

```
1. Go to Bot Management
2. Follow 3 steps:
   Step 1: Create bot via @BotFather
   Step 2: Add bot token
   Step 3: Link admin account (scan QR)
3. Webhook auto-configures
4. Bot is live!
```

---

## 🎨 UI Components

### Open Forms (Drawers)
- Click "New" or "Add" buttons
- Drawer slides from right
- Scroll through steps
- Footer has Cancel/Submit buttons

### Filter & Search
- Use tabs to filter by status
- Search bar for text search
- Date picker for date filters
- Clear filters button

### Notifications
- Bell icon (top right)
- Red badge shows unread count
- Click to open panel
- Real-time updates

---

## 🔧 Development Mode

### Mock Data
All data is currently **mock data** for frontend development:
- 5 appointments
- 8 services
- 3 organizations
- 156 total bookings (mock)

### WebSocket
Auto-connects to `ws://localhost:3001`:
- Shows "Connected" when running
- Shows "Offline" when not available
- Real-time updates work (when backend ready)

### Demo Controls (Dashboard)
- Toggle bot status
- Toggle admin linked
- See alerts change
- Test UI states

---

## 📱 Testing Responsive

### Desktop (1920×1080)
```
✅ Full sidebar visible
✅ Table views
✅ All features accessible
```

### Tablet (768×1024)
```
✅ Sidebar collapses
✅ Grid layouts adjust
✅ Drawers full screen
```

### Mobile (375×667)
```
✅ Hamburger menu
✅ Card views replace tables
✅ Stacked layouts
✅ Bottom navigation
```

### How to Test
```
Chrome DevTools → Toggle Device Toolbar (Cmd+Shift+M)
Select device or set custom size
```

---

## 🎯 Key Features to Try

### 1. Dashboard
- [ ] View statistics
- [ ] Check calendar
- [ ] Try quick actions
- [ ] See recent appointments

### 2. Appointments
- [ ] Switch tabs (All/Confirmed/Pending)
- [ ] Search for client
- [ ] Filter by date
- [ ] Create new appointment

### 3. Services
- [ ] View service cards
- [ ] Toggle active/inactive
- [ ] Add new service
- [ ] Edit existing

### 4. Bot Management
- [ ] See empty state
- [ ] Click "Start Bot Setup"
- [ ] Navigate through tabs
- [ ] View instructions

### 5. Forms
- [ ] Open any form
- [ ] Scroll through steps
- [ ] Fill fields
- [ ] See validation
- [ ] Submit and see toast

---

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

### WebSocket Not Connecting
```
Normal in development (no backend yet)
Will show "Offline" status
UI still fully functional
```

### Form Not Scrolling
```
✅ Already fixed!
All forms now scroll properly
See DRAWER_FIX_SUMMARY.md
```

### Styles Not Loading
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run dev
```

---

## 📚 Next Steps

### Learn More
1. Read [CURSOR_INDEX.md](./CURSOR_INDEX.md) - Complete guide
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md) - System structure
3. Review [STYLING_GUIDE.md](./STYLING_GUIDE.md) - Design system

### Start Developing
1. Pick a component to modify
2. Follow existing patterns
3. Test responsive behavior
4. Check toast notifications work

### Add Backend
1. Setup Supabase project
2. Define database schema
3. Implement auth API
4. Connect Telegram bot

---

## 🎨 Quick Reference

### Colors
```
Primary: #4F46E5 (indigo-600)
Success: #059669 (emerald-600)
Warning: #D97706 (amber-600)
Error:   #DC2626 (red-600)
```

### Spacing
```
4px → gap-1
8px → gap-2
16px → gap-4
24px → gap-6
```

### Icons
```tsx
import { Icon } from "lucide-react";
<Icon className="w-4 h-4" />
```

### Toast
```tsx
import { toastNotifications } from "./toast-notifications";
toastNotifications.appointments.created();
```

---

## ✅ Checklist

After setup, verify:

- [ ] App runs on localhost:5173
- [ ] Dashboard loads
- [ ] Can navigate between pages
- [ ] Forms open and scroll
- [ ] Toasts appear on actions
- [ ] Mobile view works
- [ ] Sidebar collapses on mobile
- [ ] No console errors

---

## 🚀 You're Ready!

Everything should be working now. Start exploring the app and building features!

**Need help?** Check [CURSOR_INDEX.md](./CURSOR_INDEX.md) for detailed documentation.

**Found a bug?** See [DRAWER_FIX_SUMMARY.md](./DRAWER_FIX_SUMMARY.md) for recent fixes.

**Happy coding! 🎉**
