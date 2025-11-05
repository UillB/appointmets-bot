# ⚡ Quick Start Guide for Cursor AI

> **Read this FIRST before making changes**  
> **Last Updated:** November 5, 2025

---

## 🎯 Recommended Reading Order

Work with these documents in this exact order:

### 1️⃣ **START HERE**
📄 **[CURSOR_INDEX.md](./CURSOR_INDEX.md)** - Complete project overview
- What the project is
- Current status
- All features and components
- Common patterns and rules

### 2️⃣ **DARK THEME**
📄 **[DARK_THEME_GUIDE.md](./DARK_THEME_GUIDE.md)** - Dark mode implementation
- How theme toggle works
- Color system mapping
- Component patterns for dark mode
- All pages dark mode status

### 3️⃣ **MOBILE & TELEGRAM**
📄 **[MOBILE_OPTIMIZATION.md](./MOBILE_OPTIMIZATION.md)** - Responsive & Telegram Web App
- Telegram Web App integration
- Mobile navigation (bottom nav)
- Responsive breakpoints
- Touch optimization
- Component adaptations

---

## 🚀 Quick Reference

### Current State (Nov 5, 2025)

✅ **100% Complete Frontend:**
- Dashboard with bot status
- Appointments management
- Services CRUD
- Organizations CRUD
- Bot Management (3-step setup)
- Analytics
- Settings
- AI Assistant
- **Full dark theme support**
- **Mobile & Telegram Web App optimized**
- Landing page + Login/Register

### Key Technologies

```json
{
  "framework": "React 18 + TypeScript",
  "styling": "Tailwind CSS v4 + Dark Mode",
  "ui": "Shadcn/UI components",
  "icons": "Lucide React",
  "theme": "Dark/Light with localStorage",
  "responsive": "Mobile-first, Telegram Web App",
  "accessibility": "WCAG 2.1 AA"
}
```

---

## 💡 Critical Rules

### Dark Mode

**ALWAYS add dark variants:**
```tsx
// ❌ Wrong
<div className="bg-white text-gray-900">

// ✅ Correct
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

### Responsive

**ALWAYS use mobile-first:**
```tsx
// ❌ Wrong
<div className="grid-cols-4 sm:grid-cols-2">

// ✅ Correct
<div className="grid-cols-2 lg:grid-cols-4">
```

### Typography

**NEVER override font sizes/weights** (unless user requests):
```tsx
// ❌ Don't use
className="text-2xl font-bold"

// ✅ Use only
className="text-gray-900 dark:text-gray-100"
```

### Touch Targets

**Mobile buttons minimum 44x44px:**
```tsx
// ✅ Mobile-friendly
<Button className="h-10 w-full sm:w-auto sm:h-9">
```

---

## 🎨 Common Patterns

### Page Layout

```tsx
<div className="max-w-7xl mx-auto space-y-4 lg:space-y-6 p-4 lg:p-6">
  <PageTitle 
    icon={<Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />}
    title="Page Title"
    description="Description"
  />
  
  {/* Content */}
</div>
```

### Card with Dark Mode

```tsx
<Card className="p-4 lg:p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
  <h3 className="text-gray-900 dark:text-gray-100">Title</h3>
  <p className="text-gray-600 dark:text-gray-300">Content</p>
</Card>
```

### Status Badge

```tsx
<Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-0">
  Confirmed
</Badge>
```

### Responsive Grid

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

---

## 📁 Key Files

### Core
- `/App.tsx` - Main app with routing
- `/components/Header.tsx` - Top navigation
- `/components/Sidebar.tsx` - Side navigation
- `/components/MobileBottomNav.tsx` - Mobile bottom nav

### Pages (All with dark mode)
- `/components/Dashboard.tsx`
- `/components/AppointmentsPage.tsx`
- `/components/ServicesPage.tsx`
- `/components/OrganizationsPage.tsx`
- `/components/BotManagementPage.tsx`
- `/components/AnalyticsPage.tsx`
- `/components/SettingsPage.tsx`
- `/components/LandingPage.tsx`
- `/components/LoginPage.tsx`
- `/components/RegisterPage.tsx`

### Utilities
- `/hooks/useTelegramWebApp.ts` - Telegram integration
- `/hooks/useWebSocket.ts` - WebSocket connection
- `/components/toast-notifications.tsx` - Toast system
- `/styles/globals.css` - Global styles + dark mode

---

## ⚠️ Important Notes

### When Adding/Modifying Components

1. **Check dark mode** - Add `dark:` variants
2. **Check responsive** - Test mobile (< 1024px) and desktop
3. **Check Telegram Web App** - Test in TWA if possible
4. **Check touch targets** - Ensure ≥44px on mobile
5. **Check accessibility** - ARIA labels, contrast ratios

### When Working with Forms

- ✅ Use Drawer pattern (not Dialog)
- ✅ Add `flex flex-col h-screen` structure
- ✅ Make content scrollable
- ✅ Keep header/footer fixed
- ✅ Include dark mode styles

### When Adding Toast Notifications

```tsx
import { toastNotifications } from './toast-notifications';

// Success
toastNotifications.appointments.created();

// Error
toastNotifications.errors.validation("Message");
```

---

## 🧪 Testing Checklist

Before committing changes:

### Theme
- [ ] Toggle dark/light mode
- [ ] Check all text is readable
- [ ] Verify contrast ratios
- [ ] Test status colors visibility

### Responsive
- [ ] Test at 375px (mobile)
- [ ] Test at 768px (tablet)
- [ ] Test at 1024px (desktop)
- [ ] Check bottom nav on mobile
- [ ] Check sidebar on desktop

### Telegram Web App
- [ ] Test in Telegram app (if possible)
- [ ] Verify theme sync
- [ ] Check touch interactions
- [ ] Test navigation

---

## 🆘 Need More Details?

### For Specific Topics:

**Architecture & Structure:**
→ Read [ARCHITECTURE.md](./ARCHITECTURE.md)

**Styling & Design System:**
→ Read [STYLING_GUIDE.md](./STYLING_GUIDE.md)

**Toast Notifications:**
→ Read [TOAST_SYSTEM.md](./TOAST_SYSTEM.md)

**WebSocket Integration:**
→ Read [WEBSOCKET_GUIDE.md](./WEBSOCKET_GUIDE.md)

**Bot Management Flow:**
→ Read [BOT_MANAGEMENT_GUIDE.md](./BOT_MANAGEMENT_GUIDE.md)

### For Recent Changes:

**Latest Updates:**
→ Read [CHANGELOG.md](./CHANGELOG.md)

**UI Improvements:**
→ Read [UI_IMPROVEMENTS_SUMMARY.md](./UI_IMPROVEMENTS_SUMMARY.md)

---

## 💬 Summary

**Essential 3-document chain for Cursor:**

1. **CURSOR_INDEX.md** - Complete overview
2. **DARK_THEME_GUIDE.md** - Dark mode patterns
3. **MOBILE_OPTIMIZATION.md** - Responsive & Telegram Web App

**Remember:**
- ✅ Dark mode for everything
- ✅ Mobile-first responsive
- ✅ Telegram Web App optimized
- ✅ Touch-friendly (≥44px)
- ✅ WCAG 2.1 AA compliant

---

**Ready to code! 🚀**

Feed Cursor these 3 documents in order, and you're all set to work on the project effectively.
