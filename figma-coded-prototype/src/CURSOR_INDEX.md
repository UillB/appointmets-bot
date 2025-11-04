# 🤖 Cursor AI Guide - Appointments Bot Admin Panel

> **Last Updated:** November 5, 2025  
> **Status:** Production Ready Frontend + Backend Integration Needed  
> **Stack:** React + TypeScript + Tailwind CSS + Shadcn/UI + Supabase (planned)

---

## 📋 Quick Navigation

### 🚀 Start Here
1. **[PROJECT_OVERVIEW.md](#project-overview)** - What this project is about
2. **[CURRENT_STATE.md](#current-state)** - What's done and what's next
3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical structure

### 🎨 UI/UX Guidelines
4. **[UI_COMPONENTS.md](#ui-components)** - Component patterns
5. **[STYLING_GUIDE.md](./STYLING_GUIDE.md)** - Design system
6. **[FORMS_GUIDE.md](#forms-guide)** - Form patterns

### 🔧 Implementation Guides
7. **[WEBSOCKET_GUIDE.md](./WEBSOCKET_GUIDE.md)** - Real-time updates
8. **[TOAST_SYSTEM.md](./TOAST_SYSTEM.md)** - Notifications
9. **[BOT_MANAGEMENT_GUIDE.md](./BOT_MANAGEMENT_GUIDE.md)** - Bot setup flow

### 🐛 Recent Fixes
10. **[LATEST_CHANGES.md](#latest-changes)** - What changed recently

---

## 📖 PROJECT OVERVIEW

### What is This?

**Appointments Bot Admin Panel** - админка для управления Telegram-ботом записи на услуги.

### Key Features

✅ **Implemented (Frontend):**
- 📊 Dashboard with statistics
- 📅 Appointments management
- 🛠️ Services CRUD
- 🏢 Organizations CRUD
- 🤖 Bot management (3-step setup)
- 📈 Analytics page
- 🔔 Real-time notifications
- 🌐 WebSocket integration
- 📱 Fully responsive (mobile + desktop)
- 🎨 Material Design + Tailwind

🔜 **Planned (Backend):**
- Supabase integration
- Admin authentication API
- Telegram Bot webhook processing
- Database schema
- Real data operations

### Tech Stack

```json
{
  "frontend": {
    "framework": "React 18",
    "language": "TypeScript",
    "styling": "Tailwind CSS v4",
    "ui": "Shadcn/UI",
    "icons": "Lucide React",
    "state": "React Hooks"
  },
  "backend": {
    "planned": "Supabase",
    "realtime": "WebSocket",
    "bot": "Telegram Bot API"
  },
  "tools": {
    "build": "Vite",
    "format": "Prettier",
    "lint": "ESLint"
  }
}
```

---

## 📍 CURRENT STATE

### ✅ Completed Features

#### 1. **Dashboard** (`/components/Dashboard.tsx`)
- Welcome section
- Statistics cards (4 metrics)
- Appointments summary card
- Quick action cards
- Calendar widget
- Recent appointments
- **NEW:** Bot status alerts (red/amber)
- **NEW:** Demo controls for testing

#### 2. **Appointments Page** (`/components/AppointmentsPage.tsx`)
- Table view (desktop)
- Card view (mobile)
- Filtering (status, service, date)
- Search by client name
- Pagination
- Status badges (confirmed/pending/rejected)
- Export functionality placeholder
- **FIXED:** Now uses Drawer instead of Dialog

#### 3. **Services Page** (`/components/ServicesPage.tsx`)
- Grid layout
- Service cards with pricing
- Duration display
- Active/Inactive status
- Auto slot generation info
- Filter by status
- Search functionality

#### 4. **Organizations Page** (`/components/OrganizationsPage.tsx`)
- Grid layout
- Organization cards
- Contact info display
- Location details
- Timezone display
- Filter and search

#### 5. **Bot Management** (`/components/BotManagementPage.tsx`)
- 3-step setup process:
  1. Create Bot (BotFather)
  2. Add Token
  3. Link Admin
- **FIXED:** Centered text in preview cards
- **FIXED:** Numbered tabs (1., 2., 3.)
- Progress tracking
- Step validation
- QR code for admin linking

#### 6. **Analytics** (`/components/AnalyticsPage.tsx`)
- Statistics overview
- Charts placeholders
- Date range selector
- Export functionality

#### 7. **Forms (All Drawer-based)**
- **AppointmentFormSheet** - 4 steps
- **ServiceFormSheet** - 3 steps
- **OrganizationFormSheet** - 4 steps
- **FIXED:** All have proper scroll
- **FIXED:** Header/Footer fixed, content scrollable

#### 8. **Header** (`/components/Header.tsx`)
- Connection status indicator
- Language selector
- Notification bell
- **NEW:** User dropdown menu
  - Profile
  - Settings
  - Logout

#### 9. **Sidebar** (`/components/Sidebar.tsx`)
- Navigation menu
- Active page highlight
- Organization info
- User info
- Collapsible on mobile

### 🔜 Next Steps (Backend)

1. **Supabase Setup**
   - Create project
   - Define schema
   - Setup auth

2. **Admin API**
   - Login/Register
   - Token management
   - Session handling

3. **Telegram Integration**
   - Bot setup
   - Webhook processing
   - Message handling

4. **Real Data**
   - Replace mock data
   - CRUD operations
   - Real-time updates

---

## 🎨 UI COMPONENTS

### Component Patterns

#### 1. **Page Layout**
```tsx
<div className="max-w-7xl mx-auto space-y-6">
  <PageTitle 
    icon={<Icon />}
    title="Page Title"
    description="Description"
    actions={<Button>Action</Button>}
  />
  
  {/* Stats */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard {...stat} />
  </div>
  
  {/* Content */}
  <Card className="p-6">
    ...
  </Card>
</div>
```

#### 2. **Drawer Form Pattern** ⭐ USE THIS
```tsx
<Drawer open={open} onOpenChange={onOpenChange} direction="right">
  <DrawerContent className="w-full sm:max-w-lg flex flex-col h-screen">
    {/* Fixed Header */}
    <DrawerHeader className="flex-shrink-0 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerDescription>Description</DrawerDescription>
          </div>
        </div>
        <DrawerClose asChild>
          <Button variant="ghost" size="icon">
            <X className="w-4 h-4" />
          </Button>
        </DrawerClose>
      </div>
    </DrawerHeader>

    {/* Scrollable Content */}
    <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        <form id="form-id" onSubmit={handleSubmit}>
          <StepIndicator stepNumber={1} title="Step 1" description="..." />
          <div className="pl-14 space-y-4 pb-6">
            {/* Form fields */}
          </div>
          
          <StepIndicator stepNumber={2} title="Step 2" description="..." />
          <div className="pl-14 space-y-4 pb-6">
            {/* More fields */}
          </div>
        </form>
      </div>
    </div>

    {/* Fixed Footer */}
    <DrawerFooter className="flex-shrink-0 border-t bg-gray-50">
      <div className="flex gap-3 w-full">
        <Button variant="outline" onClick={handleCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" form="form-id" className="flex-1 bg-indigo-600">
          Submit
        </Button>
      </div>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

#### 3. **Toast Notifications**
```tsx
import { toastNotifications } from "./toast-notifications";

// Success
toastNotifications.appointments.created();
toastNotifications.services.updated();

// Errors
toastNotifications.errors.validation("Message");
toastNotifications.errors.network();

// System
toastNotifications.system.refreshed("Page Name");
```

#### 4. **Step Indicator**
```tsx
<StepIndicator
  stepNumber={1}
  title="Step Title"
  description="Step description"
  isLast={false}  // true for last step
/>
```

---

## 🎯 FORMS GUIDE

### All Forms Use Drawer Pattern

#### 1. **AppointmentFormSheet** (4 Steps)
- Step 1: Client Information (name, phone)
- Step 2: Service Details (service, duration)
- Step 3: Date & Time (calendar, time slots)
- Step 4: Additional Notes (textarea)

#### 2. **ServiceFormSheet** (3 Steps)
- Step 1: Basic Information (name, description)
- Step 2: Pricing & Duration (price, duration)
- Step 3: Availability (active toggle)

#### 3. **OrganizationFormSheet** (4 Steps)
- Step 1: Basic Information (name, description)
- Step 2: Contact Details (email, phone)
- Step 3: Location (address, city, country)
- Step 4: Settings (timezone)

### Form Structure Requirements

✅ **Must Have:**
- `flex flex-col h-screen` on DrawerContent
- `flex-shrink-0` on header
- `flex-1 overflow-y-auto` wrapper for content
- `flex-shrink-0` on footer
- Proper padding in content wrapper
- StepIndicator for each step
- Form validation
- Toast notifications on submit

❌ **Don't Use:**
- `ScrollArea` component (use native scroll)
- Dialogs for forms (use Drawers)
- Inline styles for layout
- Random heights without flex

---

## 🔧 LATEST CHANGES

### November 5, 2025 - Major UI Fixes

#### 1. **Bot Management Page**
✅ Text alignment in preview cards (centered)
✅ Step numbers in tabs (1., 2., 3.)
✅ Numbers in status circles

#### 2. **Header Component**
✅ User dropdown menu
✅ Profile/Settings/Logout options
✅ Click on avatar to open

#### 3. **Dashboard**
✅ Bot status alerts (red for inactive)
✅ Admin link alert (amber)
✅ Action buttons with navigation
✅ Demo controls for testing

#### 4. **Appointments Page**
✅ Replaced Dialog with Drawer
✅ Consistent with other pages

#### 5. **All Drawer Forms**
✅ Fixed scroll issues
✅ Can reach bottom of forms
✅ Footer always visible
✅ Smooth scrolling

---

## 🎨 STYLING RULES

### Color Palette
```css
/* Primary Colors */
--indigo-600: #4F46E5;  /* Main brand color */
--purple-600: #9333EA;  /* Accent */
--pink-600: #DB2777;    /* Highlight */

/* Status Colors */
--emerald-600: #059669; /* Success */
--amber-600: #D97706;   /* Warning */
--red-600: #DC2626;     /* Error */
--blue-600: #2563EB;    /* Info */

/* Neutrals */
--gray-50 to --gray-900
```

### Typography Rules ⚠️

**IMPORTANT:** Do NOT use these classes unless specifically requested:
- ❌ `text-xl`, `text-2xl`, `text-3xl` (font sizes)
- ❌ `font-bold`, `font-semibold` (font weights)
- ❌ `leading-tight`, `leading-relaxed` (line heights)

**Reason:** We have default typography in `styles/globals.css`

**You CAN use:**
- ✅ `text-gray-500`, `text-indigo-600` (colors)
- ✅ `text-center`, `text-left` (alignment)
- ✅ `space-y-4`, `gap-6` (spacing)

### Spacing System (8px Grid)
```
gap-1  → 4px
gap-2  → 8px
gap-3  → 12px
gap-4  → 16px
gap-6  → 24px
gap-8  → 32px
```

### Responsive Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

---

## 🔌 WEBSOCKET INTEGRATION

### Usage
```tsx
import { useWebSocket } from "../hooks/useWebSocket";

const { isConnected, lastMessage, sendMessage } = useWebSocket({
  autoConnect: true,
  onMessage: (event) => {
    const data = JSON.parse(event.data);
    // Handle message
  },
  onOpen: () => console.log("Connected"),
  onClose: () => console.log("Disconnected"),
});
```

### Connection Status
```tsx
{isConnected ? (
  <Wifi className="w-4 h-4 text-emerald-600" />
) : (
  <WifiOff className="w-4 h-4 text-red-600" />
)}
```

---

## 🚀 DEVELOPMENT WORKFLOW

### Making Changes

1. **Check existing patterns** - Look at similar components
2. **Follow drawer pattern** - For new forms
3. **Use toast notifications** - For user feedback
4. **Test responsive** - Mobile and desktop
5. **Maintain consistency** - Colors, spacing, patterns

### Common Tasks

#### Adding a New Page
```tsx
// 1. Create component
export function NewPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageTitle 
        icon={<Icon />}
        title="Title"
        description="Description"
      />
      {/* Content */}
    </div>
  );
}

// 2. Add to App.tsx routes
// 3. Add to Sidebar navigation
```

#### Adding a New Form
```tsx
// Use drawer pattern from above
// Include StepIndicator for multi-step
// Add toast notifications
// Implement validation
```

#### Adding Real-time Update
```tsx
// Use useWebSocket hook
// Listen for specific event types
// Update local state
// Show toast notification
```

---

## 📦 KEY FILES

### Core Components
- `/App.tsx` - Main app with routing
- `/components/Dashboard.tsx` - Home page
- `/components/Header.tsx` - Top navigation
- `/components/Sidebar.tsx` - Side navigation

### Pages
- `/components/AppointmentsPage.tsx`
- `/components/ServicesPage.tsx`
- `/components/OrganizationsPage.tsx`
- `/components/BotManagementPage.tsx`
- `/components/AnalyticsPage.tsx`
- `/components/SettingsPage.tsx`

### Forms (Drawers)
- `/components/AppointmentFormSheet.tsx`
- `/components/ServiceFormSheet.tsx`
- `/components/OrganizationFormSheet.tsx`

### Utilities
- `/hooks/useWebSocket.ts` - WebSocket hook
- `/components/toast-notifications.tsx` - Toast helper
- `/styles/globals.css` - Global styles

---

## ⚠️ IMPORTANT NOTES FOR CURSOR

### DO ✅
- Follow established patterns
- Use existing components
- Maintain consistency
- Test responsive design
- Use toast notifications
- Follow drawer form structure
- Use proper spacing (8px grid)
- Import icons from lucide-react

### DON'T ❌
- Create new UI components (use Shadcn)
- Override typography classes
- Use inline styles for layout
- Use ScrollArea in drawers
- Create duplicate patterns
- Break responsive design
- Forget mobile testing
- Ignore accessibility

### When Adding Backend
- Replace mock data gradually
- Keep frontend functional during transition
- Use loading states
- Handle errors gracefully
- Show user feedback
- Validate on both sides

---

## 🐛 DEBUGGING

### Common Issues

**Drawer not scrolling:**
- Check `flex flex-col h-screen` on DrawerContent
- Check `flex-1 overflow-y-auto` on content wrapper
- Don't use ScrollArea

**Form not submitting:**
- Check form `id` matches submit button `form` attribute
- Check validation logic
- Check toast notifications are called

**Responsive issues:**
- Test at 375px (mobile)
- Test at 768px (tablet)
- Test at 1024px (desktop)
- Use Chrome DevTools

**WebSocket not connecting:**
- Check URL is correct (ws://localhost:3001)
- Check server is running
- Check autoConnect is true

---

## 📚 ADDITIONAL RESOURCES

### Detailed Guides
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[WEBSOCKET_GUIDE.md](./WEBSOCKET_GUIDE.md)** - WebSocket implementation
- **[TOAST_SYSTEM.md](./TOAST_SYSTEM.md)** - Notification system
- **[BOT_MANAGEMENT_GUIDE.md](./BOT_MANAGEMENT_GUIDE.md)** - Bot setup flow
- **[STYLING_GUIDE.md](./STYLING_GUIDE.md)** - Design system details

### Recent Updates
- **[UI_IMPROVEMENTS_SUMMARY.md](./UI_IMPROVEMENTS_SUMMARY.md)** - Latest UI fixes
- **[DRAWER_FIX_SUMMARY.md](./DRAWER_FIX_SUMMARY.md)** - Drawer scroll fix

---

## 🎯 QUICK COMMANDS

### Running the Project
```bash
npm install
npm run dev
```

### Building
```bash
npm run build
```

### Testing
```bash
# Manual testing checklist
- [ ] All pages load
- [ ] Forms open and scroll
- [ ] Toasts appear
- [ ] WebSocket connects
- [ ] Mobile responsive
- [ ] Desktop responsive
```

---

## 📞 CONTACT & STATUS

**Project Status:** Frontend Complete, Backend Integration Pending  
**Last Update:** November 5, 2025  
**Version:** 1.0.0-frontend  
**Ready for:** Backend integration, Supabase setup, Telegram Bot API

---

**Happy Coding! 🚀**

This guide contains everything Cursor AI needs to understand and work with this project effectively.
