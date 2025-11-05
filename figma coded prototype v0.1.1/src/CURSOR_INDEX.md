# 🤖 Cursor AI Guide - Appointments Bot Admin Panel

> **Last Updated:** November 5, 2025  
> **Status:** Production Ready Frontend with Dark Theme Support  
> **Stack:** React + TypeScript + Tailwind CSS + Shadcn/UI + Dark Mode

---

## 📖 RECOMMENDED READING ORDER FOR CURSOR

### 🎯 Essential Chain (Read in Order):

1. **THIS FILE FIRST** - Complete overview
2. **[DARK_THEME_GUIDE.md](./DARK_THEME_GUIDE.md)** - Dark mode implementation ⭐ NEW
3. **[MOBILE_OPTIMIZATION.md](./MOBILE_OPTIMIZATION.md)** - Responsive & Telegram Web App design ⭐ UPDATED

### 📚 Additional Context (As Needed):

4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical structure
5. **[STYLING_GUIDE.md](./STYLING_GUIDE.md)** - Design system details
6. **[TOAST_SYSTEM.md](./TOAST_SYSTEM.md)** - Notification patterns

---

## 🎨 RECENT MAJOR UPDATES (Nov 5, 2025)

### ✨ Dark Theme Implementation
- **ALL pages now support dark mode** (Dashboard, Appointments, Services, Organizations, Settings, Analytics, Bot Management)
- **Login & Register pages** - Full dark theme support
- **Landing page** - Theme toggle with localStorage persistence
- **Consistent color scheme** across all components
- Proper contrast ratios (WCAG 2.1 AA compliant)
- Smooth transitions between themes

### 📱 Mobile & Telegram Web App Optimization
- **Telegram Web App optimized** - Critical for business owners managing via Telegram
- Fully responsive for all screen sizes (320px - 1920px)
- Mobile-first design approach
- Touch-friendly interactions
- Bottom navigation for mobile
- Compact cards and layouts

### 🔐 Logout Functionality
- User dropdown in Header with Logout option
- Logout in Sidebar navigation
- Smooth transition from admin panel to landing page
- Toast notifications on logout
- Sidebar auto-closes on mobile after logout

---

## 📋 PROJECT OVERVIEW

### What is This?

**Appointments Bot Admin Panel** - админка для управления Telegram-ботом записи на услуги с поддержкой темной темы и оптимизацией для Telegram Web App.

### Key Features

✅ **Implemented:**
- 📊 Dashboard with statistics & bot status alerts
- 📅 Appointments management (table/card views)
- 🛠️ Services CRUD with pricing
- 🏢 Organizations CRUD with locations
- 🤖 Bot management (3-step setup)
- 📈 Analytics page with charts
- ⚙️ Settings (Profile + System)
- 🔔 Real-time notifications panel
- 🌐 WebSocket integration
- 🌓 **Dark/Light theme toggle**
- 📱 **Telegram Web App optimized**
- 📱 **Fully responsive (mobile + desktop)**
- 🎨 Material Design + Tailwind v4
- 🌍 Multi-language support (EN/RU/HE with RTL)

🔜 **Planned (Backend):**
- Supabase integration
- Telegram Bot webhook processing
- Real data operations

### Tech Stack

```json
{
  "frontend": {
    "framework": "React 18",
    "language": "TypeScript",
    "styling": "Tailwind CSS v4 + Dark Mode",
    "ui": "Shadcn/UI",
    "icons": "Lucide React",
    "state": "React Hooks + localStorage"
  },
  "design": {
    "theme": "Dark/Light mode with system preference",
    "responsive": "Mobile-first, Telegram Web App optimized",
    "accessibility": "WCAG 2.1 AA",
    "colors": "Indigo (#4F46E5) + Purple gradient"
  },
  "backend": {
    "planned": "Supabase",
    "realtime": "WebSocket",
    "bot": "Telegram Bot API"
  }
}
```

---

## 🌓 DARK THEME GUIDE (Quick Reference)

### Theme Toggle Implementation

**Location:** Landing Page Header  
**Persistence:** localStorage key `theme`  
**Default:** System preference or light

### Dark Mode Classes Pattern

```tsx
// Background & Borders
className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"

// Text Colors
className="text-gray-900 dark:text-gray-100"  // Headings
className="text-gray-600 dark:text-gray-300"  // Body text
className="text-gray-500 dark:text-gray-400"  // Secondary text

// Interactive Elements
className="hover:bg-gray-100 dark:hover:bg-gray-800"
className="text-indigo-600 dark:text-indigo-400"

// Status Colors (maintain visibility)
className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
```

### Pages with Dark Mode Support

✅ **Admin Panel:**
- Dashboard (all components)
- Appointments Page (table + cards)
- Services Page (grid + cards)
- Organizations Page (grid + cards)
- Bot Management (all steps)
- Analytics (charts + stats)
- Settings (profile + system tabs)
- AI Assistant (simple interface)

✅ **Public Pages:**
- Landing Page (hero + features + pricing)
- Login Page (form + branding)
- Register Page (form + benefits)

✅ **Components:**
- Header (navigation + user menu)
- Sidebar (navigation + status)
- All Stat Cards (compact + full)
- All Form Sheets (drawers)
- Notifications Panel
- Mobile Bottom Navigation

---

## 📱 MOBILE & TELEGRAM WEB APP (Quick Reference)

### Responsive Breakpoints

```css
/* Mobile First Approach */
base:   320px - 639px   /* Mobile portrait */
sm:     640px - 767px   /* Mobile landscape */
md:     768px - 1023px  /* Tablet */
lg:     1024px+         /* Desktop */
```

### Telegram Web App Specific

**Critical for business owners managing appointments via Telegram:**

```tsx
// Mobile Navigation
- Bottom nav (< 1024px): Dashboard, Appointments, Settings
- Sidebar (≥ 1024px): Full navigation menu

// Touch Targets
- Minimum 44x44px for all interactive elements
- Larger buttons on mobile (h-10 vs h-8)
- Adequate spacing between clickable items

// Compact Layouts
- 2-column stat grids on mobile vs 4-column on desktop
- Card views instead of tables on mobile
- Simplified headers with essential info only
```

### Mobile Optimization Patterns

```tsx
// Conditional Rendering
const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

{isMobile ? (
  <MobileStatCard {...stat} />
) : (
  <StatCard {...stat} />
)}

// Responsive Classes
className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
className="text-sm lg:text-base"
className="p-3 lg:p-6"
```

---

## 🎨 STYLING RULES

### Color Palette

```css
/* Primary Colors */
--indigo-600: #4F46E5;  /* Main brand */
--purple-600: #9333EA;  /* Accent */

/* Light Mode Backgrounds */
--gray-50: #F9FAFB;    /* Light background */
--white: #FFFFFF;       /* Cards */

/* Dark Mode Backgrounds */
--gray-900: #111827;    /* Dark background */
--gray-800: #1F2937;    /* Dark cards */
--gray-950: #030712;    /* Darker elements */

/* Status Colors (works in both themes) */
--emerald-600/400: Success
--amber-600/400: Warning
--red-600/400: Error
--blue-600/400: Info
```

### Typography Rules ⚠️

**IMPORTANT:** Do NOT use these classes unless specifically requested:
- ❌ `text-xl`, `text-2xl`, `text-3xl` (font sizes)
- ❌ `font-bold`, `font-semibold` (font weights)
- ❌ `leading-tight`, `leading-relaxed` (line heights)

**Reason:** We have default typography in `styles/globals.css`

**You CAN use:**
- ✅ `text-gray-500 dark:text-gray-400` (colors with dark variant)
- ✅ `text-center`, `text-left` (alignment)
- ✅ `space-y-4`, `gap-6` (spacing)

---

## 🎯 COMPONENT PATTERNS

### 1. Page Layout (with Dark Mode)

```tsx
<div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
  <PageTitle 
    icon={<Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />}
    title="Page Title"
    description="Description"
    actions={<Button>Action</Button>}
  />
  
  {/* Stats - Responsive Grid */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
    {stats.map((stat) => (
      <StatCard key={stat.title} {...stat} />
    ))}
  </div>
  
  {/* Content Card with Dark Mode */}
  <Card className="p-4 lg:p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
    <h3 className="text-gray-900 dark:text-gray-100">Title</h3>
    <p className="text-gray-600 dark:text-gray-300">Content</p>
  </Card>
</div>
```

### 2. Drawer Form Pattern (Mobile Optimized)

```tsx
<Drawer open={open} onOpenChange={onOpenChange} direction="right">
  <DrawerContent className="w-full sm:max-w-lg flex flex-col h-screen">
    {/* Fixed Header */}
    <DrawerHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <DrawerTitle className="text-gray-900 dark:text-gray-100">Title</DrawerTitle>
            <DrawerDescription className="text-gray-600 dark:text-gray-400">Description</DrawerDescription>
          </div>
        </div>
      </div>
    </DrawerHeader>

    {/* Scrollable Content */}
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
      <div className="p-4 lg:p-6">
        <form id="form-id" onSubmit={handleSubmit}>
          {/* Form fields with dark mode support */}
        </form>
      </div>
    </div>

    {/* Fixed Footer */}
    <DrawerFooter className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="flex gap-3 w-full">
        <Button variant="outline" onClick={handleCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" form="form-id" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
          Submit
        </Button>
      </div>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

### 3. Status Badge (Theme-Aware)

```tsx
// Success
<Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-0">
  Confirmed
</Badge>

// Warning
<Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-0">
  Pending
</Badge>

// Error
<Badge className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border-0">
  Rejected
</Badge>
```

---

## 📦 KEY FILES BY CATEGORY

### 🏠 Core Navigation
- `/App.tsx` - Main app with routing & theme context
- `/components/Header.tsx` - Top nav with theme toggle (landing) or user menu (admin)
- `/components/Sidebar.tsx` - Side nav with logout
- `/components/MobileBottomNav.tsx` - Bottom nav for mobile

### 📄 Public Pages (Dark Mode Enabled)
- `/components/LandingPage.tsx` - Hero, features, pricing, contact
- `/components/LoginPage.tsx` - Login form with branding
- `/components/RegisterPage.tsx` - Registration with benefits

### 📊 Admin Pages (Dark Mode Enabled)
- `/components/Dashboard.tsx` - Stats, bot status, recent appointments
- `/components/AppointmentsPage.tsx` - Table/card views, filters
- `/components/ServicesPage.tsx` - Service grid, CRUD
- `/components/OrganizationsPage.tsx` - Organization grid, CRUD
- `/components/BotManagementPage.tsx` - 3-step bot setup
- `/components/AnalyticsPage.tsx` - Charts and analytics
- `/components/SettingsPage.tsx` - Profile & system settings
- `/components/AIAssistantPage.tsx` - Simple AI interface

### 🎴 Reusable Components (Dark Mode Enabled)
- `/components/StatCard.tsx` - Statistics card (compact & full)
- `/components/MobileStatCard.tsx` - Compact stats for mobile
- `/components/QuickActionCard.tsx` - Dashboard quick actions
- `/components/AppointmentsSummaryCard.tsx` - Dashboard summary
- `/components/AppointmentCard.tsx` - Full appointment card
- `/components/MobileAppointmentCard.tsx` - Compact for mobile
- `/components/ServiceCard.tsx` - Service display card
- `/components/OrganizationCard.tsx` - Organization display card

### 📝 Forms (Drawers with Dark Mode)
- `/components/AppointmentFormSheet.tsx` - 4-step appointment form
- `/components/ServiceFormSheet.tsx` - 3-step service form
- `/components/OrganizationFormSheet.tsx` - 4-step organization form
- `/components/SlotGenerationSheet.tsx` - Auto slot generation

### 🔧 Utilities
- `/hooks/useWebSocket.ts` - WebSocket connection
- `/hooks/useTelegramWebApp.ts` - Telegram Web App SDK
- `/components/toast-notifications.tsx` - Toast helper
- `/styles/globals.css` - Global styles + dark mode CSS variables

---

## ⚠️ CRITICAL RULES FOR CURSOR

### DO ✅

**Dark Mode:**
- Always add dark mode variants for all colors
- Use `dark:` prefix for dark theme styles
- Test contrast in both themes
- Use semantic color tokens (gray-900/gray-100 for text)

**Responsive:**
- Mobile-first approach (base styles for mobile)
- Use responsive prefixes: `sm:` `md:` `lg:`
- Test on mobile viewport (375px, 390px, 428px)
- Ensure touch targets are ≥44px on mobile

**Telegram Web App:**
- Optimize for in-app browser experience
- Bottom navigation for mobile users
- Simplified layouts for small screens
- Quick access to essential features

**General:**
- Follow established component patterns
- Use toast notifications for feedback
- Maintain consistent spacing (8px grid)
- Keep accessibility in mind (ARIA labels)

### DON'T ❌

**Dark Mode:**
- Don't use absolute colors without dark variants
- Don't use light-only assumptions
- Don't forget icon colors in dark mode
- Don't use white backgrounds without dark alternatives

**Responsive:**
- Don't use fixed heights that break on mobile
- Don't ignore touch target sizes
- Don't hide critical features on mobile
- Don't forget to test in DevTools mobile view

**General:**
- Don't override typography classes
- Don't use ScrollArea in drawers
- Don't create inconsistent patterns
- Don't ignore loading/error states

---

## 🔍 TESTING CHECKLIST

### Theme Testing
- [ ] Toggle theme on landing page
- [ ] Check localStorage persistence
- [ ] Test all admin pages in dark mode
- [ ] Verify contrast ratios
- [ ] Check status colors (red, green, amber)
- [ ] Test form inputs in both themes

### Responsive Testing
- [ ] Test at 375px (iPhone SE)
- [ ] Test at 390px (iPhone 12/13)
- [ ] Test at 428px (iPhone 14 Pro Max)
- [ ] Test at 768px (iPad)
- [ ] Test at 1024px (Desktop)
- [ ] Check bottom nav visibility (< 1024px)
- [ ] Check sidebar visibility (≥ 1024px)

### Telegram Web App Testing
- [ ] Open in Telegram Web App
- [ ] Test touch interactions
- [ ] Check viewport height (vh units)
- [ ] Verify button sizes
- [ ] Test forms in mobile view

---

## 🚀 QUICK REFERENCE

### Common Dark Mode Patterns

```tsx
// Card
<Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">

// Text
<h2 className="text-gray-900 dark:text-gray-100">
<p className="text-gray-600 dark:text-gray-300">
<span className="text-gray-500 dark:text-gray-400">

// Interactive
<Button className="bg-indigo-600 hover:bg-indigo-700">
<div className="hover:bg-gray-100 dark:hover:bg-gray-800">

// Icons with theme awareness
<Icon className="text-indigo-600 dark:text-indigo-400" />
```

### Common Responsive Patterns

```tsx
// Grid
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">

// Padding
<div className="p-3 lg:p-6">

// Text Size
<h2 className="text-base lg:text-lg">

// Conditional Render
{isMobile ? <MobileView /> : <DesktopView />}
```

---

## 📞 PROJECT STATUS

**Version:** 1.0.0 (Frontend Complete with Dark Theme)  
**Last Update:** November 5, 2025  
**Ready for:** Backend integration, Supabase, Telegram Bot API  
**Recent Additions:** Dark theme, full mobile optimization, Telegram Web App support

---

**Happy Coding! 🚀**

For detailed guides, read the recommended documents in order:
1. This file (overview)
2. DARK_THEME_GUIDE.md (theme implementation)
3. MOBILE_OPTIMIZATION.md (responsive & Telegram Web App)
