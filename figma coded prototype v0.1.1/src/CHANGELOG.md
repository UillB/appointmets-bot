# 📝 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2025-11-05

### ✨ Added - Major Landing Page Upgrade

#### New Pages
- **PricingPage** - Complete pricing page with 3 tiers
- **ContactPage** - Contact form with validation and info

#### Enhanced Landing Page
- **SVG Animations** - Animated illustrations in hero section
- **Russian Language** - All content translated to Russian
- **Alternating Backgrounds** - White → Gray → White pattern
- **Benefits Section** - 4 key benefits with icons
- **Enhanced Features** - 6 feature cards with hover animations
- **Improved Testimonials** - Star ratings and better design
- **Gradient Decorations** - Animated background elements

#### Navigation
- **Pricing Link** - Navigate to pricing from landing/nav
- **Contact Link** - Navigate to contact from anywhere
- **Back Buttons** - Return to landing from all pages

#### Design Improvements
- **Gradient Colors** - Different colors for each feature
- **Hover Effects** - Cards lift and animate on hover
- **Pulse Animations** - Subtle pulse on background elements
- **Responsive SVG** - Scalable illustrations

### 🎨 Changed

#### Landing Page
- **Hero Section** - Now with SVG phone illustration
- **Content** - Simplified messaging for all audiences
- **Stats Cards** - Enhanced with icons and gradients
- **Footer** - Cleaner design with better organization

#### App.tsx
- **View State** - Added "pricing" and "contact" views
- **Navigation Flow** - Complete flow between all pages

### 📄 Documentation

- **LANDING_IMPROVEMENTS_SUMMARY.md** - Complete guide to new features
- **LANDING_PAGE_GUIDE.md** - Updated with new pages

---

## [1.1.0] - 2025-11-05

### ✨ Added

#### Dashboard
- **Bot Status Alerts** - Red alert when bot is not active
- **Admin Link Alert** - Amber alert when admin is not linked
- **Action Buttons** - Quick navigation to Bot Management
- **Demo Controls** - Toggle bot/admin status for testing

#### Header
- **User Dropdown Menu** - Click avatar to open menu
- **Profile Option** - Navigate to profile (placeholder)
- **Settings Option** - Navigate to settings page
- **Logout Option** - Clear session and logout

#### Bot Management
- **Step Numbers in Tabs** - Shows "1. Create Bot", "2. Add Token", "3. Link Admin"
- **Numbers in Status Circles** - Visual step indicators

### 🐛 Fixed

#### Appointments Page
- **Replaced Dialog with Drawer** - Now consistent with other pages
- **Removed AppointmentDialog** - Using AppointmentFormSheet only

#### Bot Management
- **Text Alignment** - All preview cards now have centered text
- **Visual Consistency** - Numbers and text both centered

#### All Drawer Forms
- **Scroll Issue** - Fixed unable to scroll to bottom
- **Header Fixed** - Header stays at top during scroll
- **Footer Fixed** - Footer always visible at bottom
- **Content Scrollable** - Proper overflow-y-auto implementation

### 🔧 Changed

#### Form Structure
- **DrawerContent** - Added `flex flex-col h-screen`
- **DrawerHeader** - Added `flex-shrink-0`
- **Content Wrapper** - Changed from ScrollArea to native div with `flex-1 overflow-y-auto`
- **DrawerFooter** - Added `flex-shrink-0`

---

## [1.0.0] - 2025-11-01

### ✨ Added - Initial Release

#### Core Pages
- **Dashboard** - Welcome screen, stats, quick actions, calendar
- **Appointments** - Table/card view, filtering, search, pagination
- **Services** - Grid view, CRUD operations, auto slot generation
- **Organizations** - Grid view, CRUD operations, contact details
- **Bot Management** - 3-step setup wizard
- **Analytics** - Statistics overview, charts placeholder
- **Settings** - Configuration panel

#### Components
- **Header** - Navigation, notifications, language selector
- **Sidebar** - Menu, organization info, user info
- **PageTitle** - Reusable page header component
- **StatCard** - Statistic display card
- **AppointmentCard** - Appointment information card
- **ServiceCard** - Service display card
- **OrganizationCard** - Organization display card

#### Forms (Drawer-based)
- **AppointmentFormSheet** - 4-step form (client, service, date, notes)
- **ServiceFormSheet** - 3-step form (basic, pricing, availability)
- **OrganizationFormSheet** - 4-step form (basic, contact, location, settings)

#### Features
- **Toast Notifications** - Categorized toast system
- **WebSocket Integration** - Real-time updates hook
- **Step Indicators** - Visual progress in forms
- **Responsive Design** - Mobile, tablet, desktop support
- **Table Pagination** - Configurable page sizes
- **Status Badges** - Color-coded status indicators
- **Search & Filter** - Multiple filtering options

#### UI Components (Shadcn)
- Accordion, Alert, Avatar, Badge
- Button, Calendar, Card, Carousel
- Chart, Checkbox, Dialog, Drawer
- Dropdown, Form, Input, Select
- Table, Tabs, Toast, Tooltip
- And 30+ more components

#### Styling
- **Tailwind CSS v4** - Utility-first styling
- **Color Palette** - Indigo/Purple/Pink theme
- **Typography System** - Consistent font sizes
- **Spacing System** - 8px grid
- **Design Tokens** - CSS variables

#### Utilities
- **useWebSocket Hook** - WebSocket connection management
- **Toast Helper** - Centralized notifications
- **Date Formatting** - Consistent date display
- **Utils** - Class name helpers

---

## [0.3.0] - 2025-10-28

### ✨ Added

#### Bot Management
- Empty state with call-to-action
- 3-step wizard interface
- Step 1: BotFather instructions
- Step 2: Token input with validation
- Step 3: Admin linking with QR code
- Progress tracking
- Step validation
- Success state

#### Toast System
- Appointment notifications (created, updated, deleted)
- Service notifications (created, updated, deleted)
- Organization notifications (created, updated, deleted)
- Error notifications (validation, network, general)
- System notifications (saved, refreshed)
- Bot notifications (created, configured, activated)
- Consistent styling with icons

---

## [0.2.0] - 2025-10-25

### ✨ Added

#### Real-time Features
- WebSocket connection hook
- Connection status indicator in header
- Live notification updates
- Auto-reconnect on disconnect

#### Notifications
- Notification panel (slide from right)
- Notification categories (appointments, services, system)
- Unread count badge
- Mark as read functionality
- Animated notification bell

#### Forms
- Multi-step form pattern
- Step indicator component
- Form validation
- Loading states
- Error handling

---

## [0.1.0] - 2025-10-20

### ✨ Added - Initial Setup

#### Project Setup
- React 18 with TypeScript
- Vite build configuration
- Tailwind CSS v4
- ESLint and Prettier
- Project structure

#### Basic Layout
- App routing structure
- Sidebar navigation
- Header component
- Basic page layouts

#### Mock Data
- Appointments data
- Services data
- Organizations data
- Statistics data

---

## 🔮 Upcoming Features

### [1.2.0] - Planned

#### Backend Integration
- [ ] Supabase setup
- [ ] Authentication API
- [ ] Database schema
- [ ] CRUD operations
- [ ] Real data fetching

#### Telegram Bot
- [ ] Bot creation via API
- [ ] Webhook configuration
- [ ] Message handling
- [ ] Admin commands
- [ ] User booking flow

#### Enhancements
- [ ] Dark mode
- [ ] Multi-language (i18n)
- [ ] Advanced filters
- [ ] Bulk operations
- [ ] Export to CSV/PDF

---

## 📊 Version Summary

| Version | Date | Status | Features |
|---------|------|--------|----------|
| 1.1.0 | 2025-11-05 | ✅ Current | UI fixes, drawer scroll, alerts |
| 1.0.0 | 2025-11-01 | ✅ Released | Complete frontend |
| 0.3.0 | 2025-10-28 | ✅ Released | Bot management |
| 0.2.0 | 2025-10-25 | ✅ Released | Real-time features |
| 0.1.0 | 2025-10-20 | ✅ Released | Initial setup |

---

## 🔗 Related Documents

- **[README.md](./README.md)** - Project overview
- **[CURSOR_INDEX.md](./CURSOR_INDEX.md)** - Complete guide
- **[UI_IMPROVEMENTS_SUMMARY.md](./UI_IMPROVEMENTS_SUMMARY.md)** - Latest UI changes
- **[DRAWER_FIX_SUMMARY.md](./DRAWER_FIX_SUMMARY.md)** - Drawer scroll fix details

---

## 📝 Notes

### Breaking Changes
- **v1.1.0**: Removed AppointmentDialog, using AppointmentFormSheet only
- **v1.0.0**: Changed form structure (ScrollArea → native div)

### Deprecations
- **AppointmentDialog** - Replaced by AppointmentFormSheet
- **ScrollArea in Drawers** - Use native overflow-y-auto instead

### Migration Guides
- See [DRAWER_FIX_SUMMARY.md](./DRAWER_FIX_SUMMARY.md) for form migration

---

**Last Updated:** November 5, 2025
