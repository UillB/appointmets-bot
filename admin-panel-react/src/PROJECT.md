# Appointments Bot Admin Panel - Project Documentation

## 📋 Project Overview

This is a comprehensive admin panel for managing an Appointments Bot system. Built with React, TypeScript, Tailwind CSS v4.0, and shadcn/ui components following Material Design principles.

### Key Features
- **Dashboard** - Overview with statistics and quick actions
- **Appointments** - Manage bookings with filtering and status updates
- **Services** - CRUD operations for services with capacity tracking
- **Organizations** - Multi-organization management
- **Bot Management** - Telegram bot configuration and webhook setup
- **Slots** - Automatic slot generation and schedule management
- **AI Assistant** - OpenAI/Anthropic/Google AI integration
- **Settings** - User profile and system preferences

---

## 🎨 Design System

### Color Palette
```css
Primary: #4F46E5 (Indigo-600)
Primary Dark: #4338CA (Indigo-700)
Sidebar Gradient: from-[#5B4FE9] to-[#4338CA]
Background: #FAFAFA (Gray-50)
Card Background: #FFFFFF
```

### Spacing System
- Based on 8px grid
- Padding/margins: 4px (0.5), 8px (1), 16px (2), 24px (3), 32px (4), 48px (6)
- Component spacing: `space-y-6` for sections, `gap-4` for grids

### Typography
- **DO NOT** use Tailwind font classes unless explicitly requested
- Typography is managed in `styles/globals.css`
- Default weights and sizes are set per HTML element

### Responsive Breakpoints
```
sm: 640px   - Small tablets
md: 768px   - Tablets
lg: 1024px  - Desktop (Sidebar becomes fixed)
xl: 1280px  - Large desktop
```

---

## 🏗️ Architecture

### File Structure
```
/
├── App.tsx                          # Main routing and layout
├── components/
│   ├── PageHeader.tsx               # Reusable gradient header (ALL pages)
│   ├── Dashboard.tsx                # Dashboard page
│   ├── AppointmentsPage.tsx         # Appointments management
│   ├── ServicesPage.tsx             # Services CRUD
│   ├── OrganizationsPage.tsx        # Organizations management
│   ├── BotManagementPage.tsx        # Bot configuration
│   ├── SlotsPage.tsx                # Slot generation & management
│   ├── AIAssistantPage.tsx          # AI configuration
│   ├── SettingsPage.tsx             # User & system settings
│   ├── Sidebar.tsx                  # Navigation sidebar
│   ├── Header.tsx                   # Dashboard header only
│   ├── StatCard.tsx                 # Statistics card component
│   ├── [Feature]Card.tsx            # Feature-specific cards
│   ├── [Feature]Dialog.tsx          # Feature-specific dialogs
│   └── ui/                          # shadcn/ui components
└── styles/
    └── globals.css                  # Global styles & typography
```

### Component Patterns

#### Page Structure (All Pages)
```tsx
<div className="flex-1 flex flex-col min-h-0 bg-gray-50">
  <PageHeader
    icon={<Icon className="w-7 h-7 text-white" />}
    title="Page Title"
    description="Page description"
    onRefresh={handleRefresh}
    onMenuClick={onMenuClick}  // Mobile menu
    actions={<>Action Buttons</>}
  />
  
  <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
      </div>
      
      {/* Main Content */}
      <Card className="p-4 lg:p-6 bg-white">
        {/* Content */}
      </Card>
    </div>
  </div>
</div>
```

#### PageHeader Component
- **Gradient header** with live clock (updates every second)
- Mobile menu button (left)
- Refresh button (right)
- Secondary section with page icon, title, description, and action buttons
- Used on ALL pages except Dashboard

#### Card Pattern
```tsx
<Card className="p-4 lg:p-6 bg-white">
  <div className="space-y-4">
    {/* Header */}
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

## 🎯 Component Guidelines

### Buttons
```tsx
// Primary Action
<Button className="bg-indigo-600 hover:bg-indigo-700">
  <Icon className="w-4 h-4 mr-2" />
  Action
</Button>

// Secondary Action
<Button variant="outline">
  <Icon className="w-4 h-4 mr-2" />
  Action
</Button>

// Destructive Action
<Button className="bg-red-600 hover:bg-red-700">
  <Icon className="w-4 h-4 mr-2" />
  Delete
</Button>

// Ghost Action
<Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
  Clear
</Button>
```

### Forms
```tsx
<div className="space-y-2">
  <Label htmlFor="fieldId">
    Field Label <span className="text-red-500">*</span>
  </Label>
  <Input
    id="fieldId"
    type="text"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder="Placeholder text"
  />
  <p className="text-xs text-gray-500">Helper text</p>
</div>
```

### Input with Icon
```tsx
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <Input
    className="pl-10"
    placeholder="Search..."
  />
</div>
```

### Select with Icon
```tsx
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
  <Select value={value} onValueChange={setValue}>
    <SelectTrigger className="pl-10">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Switch Toggle
```tsx
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
  <div className="flex-1">
    <Label className="text-base">Setting Name</Label>
    <p className="text-sm text-gray-500 mt-1">Description</p>
  </div>
  <Switch
    checked={enabled}
    onCheckedChange={setEnabled}
    className="ml-4"
  />
</div>
```

### Tabs
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-2 mb-6">
    <TabsTrigger value="tab1" className="gap-2">
      <Icon className="w-4 h-4" />
      Tab 1
    </TabsTrigger>
    <TabsTrigger value="tab2" className="gap-2">
      <Icon className="w-4 h-4" />
      Tab 2
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="tab1" className="mt-0 space-y-6">
    {/* Content */}
  </TabsContent>
</Tabs>
```

---

## 📱 Responsive Design

### Mobile-First Approach
1. **Mobile (< 640px)**
   - Single column layouts
   - Mobile-specific card views
   - Drawer/Sheet for filters
   - Stacked actions

2. **Tablet (640px - 1024px)**
   - 2-column grids
   - Sidebar overlay
   - Some desktop features

3. **Desktop (> 1024px)**
   - Fixed sidebar
   - 3+ column grids
   - Table views
   - Inline filters

### Mobile Filters Pattern
```tsx
{/* Mobile */}
<div className="flex gap-2 lg:hidden">
  <Input placeholder="Search..." className="flex-1" />
  
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon" className="relative">
        <SlidersHorizontal className="w-4 h-4" />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-600 rounded-full" />
        )}
      </Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-[300px]">
      {/* Filters */}
    </SheetContent>
  </Sheet>
</div>

{/* Desktop */}
<div className="hidden lg:flex flex-1 gap-4">
  <Input placeholder="Search..." className="flex-1" />
  <Select>{/* Filter */}</Select>
  <Select>{/* Filter */}</Select>
</div>
```

### Responsive Tables
```tsx
{/* Mobile: Card View */}
<div className="lg:hidden space-y-3">
  {items.map(item => (
    <Card key={item.id} className="p-4">
      {/* Mobile card layout */}
    </Card>
  ))}
</div>

{/* Desktop: Table View */}
<div className="hidden lg:block overflow-x-auto rounded-lg border">
  <Table>
    {/* Table layout */}
  </Table>
</div>
```

---

## 🎭 Animations & Transitions

### Standard Transitions
```css
/* Hover states */
hover:bg-gray-100 transition-colors

/* Button interactions */
hover:bg-indigo-700 active:scale-95 transition-all

/* Sidebar animation */
transition-transform duration-300 ease-in-out

/* Card hover */
hover:shadow-md transition-shadow
```

### Loading States
```tsx
// Skeleton loading
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>

// Spinner (use RefreshCw icon)
<RefreshCw className="w-4 h-4 animate-spin" />
```

---

## 🔧 State Management

### Component State Pattern
```tsx
// Page state
const [activeTab, setActiveTab] = useState("tab1");
const [searchQuery, setSearchQuery] = useState("");
const [filters, setFilters] = useState({ /* ... */ });

// Form state
const [formData, setFormData] = useState({
  field1: "",
  field2: "",
});

// UI state
const [dialogOpen, setDialogOpen] = useState(false);
const [isLoading, setIsLoading] = useState(false);
```

### Toast Notifications
```tsx
import { toast } from "sonner@2.0.3";

// Success
toast.success("Action completed");
toast.success("Title", { description: "Details" });

// Error
toast.error("Something went wrong");

// Info
toast.info("Information");

// Warning
toast.warning("Warning message");
```

---

## 🎨 Color Coding by Feature

### Status Colors
```tsx
// Available / Success
bg-emerald-50 text-emerald-700 border-emerald-200

// Pending / Warning
bg-amber-50 text-amber-700 border-amber-200

// Booked / Info
bg-blue-50 text-blue-700 border-blue-200

// Cancelled / Error
bg-red-50 text-red-700 border-red-200

// Unavailable / Disabled
bg-gray-50 text-gray-700 border-gray-200

// Premium / Special
bg-purple-50 text-purple-700 border-purple-200
```

### Icon Background Colors
```tsx
// Blue - General/Info
bg-blue-50, text-blue-600

// Purple - Premium/AI
bg-purple-50, text-purple-600

// Emerald - Success/Active
bg-emerald-50, text-emerald-600

// Amber - Warning/Pending
bg-amber-50, text-amber-600

// Red - Error/Danger
bg-red-50, text-red-600

// Indigo - Primary Actions
bg-indigo-50, text-indigo-600
```

---

## 🌐 Internationalization (i18n)

### Language Support
- English (en) 🇬🇧
- Russian (ru) 🇷🇺
- Hebrew (he) 🇮🇱

### RTL Support (Future)
```tsx
// For Hebrew, add RTL support
<html dir={language === 'he' ? 'rtl' : 'ltr'}>
```

---

## 📊 Data Patterns

### Mock Data Structure
```tsx
// Appointment
interface Appointment {
  id: number;
  clientName: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string;
}

// Service
interface Service {
  id: number;
  name: string;
  category: string;
  price: number;
  duration: number;
  occupancy: number;
  slotsBooked: number;
  totalSlots: number;
  bookings: number;
}

// Slot
interface Slot {
  id: number;
  service: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
  status: "available" | "booked" | "unavailable";
}
```

---

## 🚀 Performance Best Practices

### Component Optimization
```tsx
// Use React.memo for expensive components
export const ExpensiveComponent = memo(({ data }) => {
  // Component logic
});

// Use useMemo for expensive calculations
const filteredData = useMemo(() => {
  return data.filter(/* complex filter */);
}, [data, filterCriteria]);

// Use useCallback for event handlers passed to children
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### List Rendering
```tsx
// Always provide unique keys
{items.map(item => (
  <Component key={item.id} {...item} />
))}

// For large lists, consider virtualization
// Use react-window or similar libraries
```

---

## 🧪 Testing Considerations

### Component Testing Checklist
- [ ] Mobile responsiveness (320px - 1920px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (> 1024px)
- [ ] Form validation
- [ ] Error states
- [ ] Loading states
- [ ] Empty states
- [ ] Toast notifications
- [ ] Keyboard navigation
- [ ] Screen reader accessibility

---

## 🔐 Security Notes

### API Keys
- Never commit real API keys
- Use placeholder values: "YOUR_API_KEY_HERE"
- Add .env support for production

### Form Validation
```tsx
// Client-side validation
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password: string) => {
  return password.length >= 8;
};
```

---

## 📝 Code Style Guide

### Naming Conventions
```tsx
// Components: PascalCase
const AppointmentCard = () => { };

// Functions: camelCase
const handleSubmit = () => { };

// Constants: UPPER_SNAKE_CASE
const MAX_APPOINTMENTS = 100;

// Props interfaces: ComponentNameProps
interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: () => void;
}
```

### Import Order
```tsx
// 1. React imports
import { useState, useEffect } from "react";

// 2. UI components
import { Button } from "./ui/button";
import { Card } from "./ui/card";

// 3. Custom components
import { PageHeader } from "./PageHeader";
import { StatCard } from "./StatCard";

// 4. Icons
import { Calendar, Clock } from "lucide-react";

// 5. Utils and helpers
import { toast } from "sonner@2.0.3";
```

### Component Structure
```tsx
// 1. Props interface
interface ComponentProps {
  prop1: string;
  onAction?: () => void;
}

// 2. Component definition
export function Component({ prop1, onAction }: ComponentProps) {
  // 3. State declarations
  const [state, setState] = useState("");

  // 4. Derived state / computed values
  const computedValue = useMemo(() => {
    // Computation
  }, [dependencies]);

  // 5. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 6. Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## 🐛 Common Issues & Solutions

### Issue: Select dropdown not showing icon
**Solution:** Add `z-10 pointer-events-none` to icon
```tsx
<Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
```

### Issue: Button not working in Dialog
**Solution:** Add `forwardRef` to Button component (already done)

### Issue: Mobile sidebar not closing
**Solution:** Call `onClose()` after navigation in Sidebar

### Issue: Toast not showing
**Solution:** Ensure Toaster component is in App.tsx root

---

## 📦 Dependencies

### Core Dependencies
```json
{
  "react": "^18.x",
  "lucide-react": "latest",
  "sonner": "2.0.3",
  "react-hook-form": "7.55.0"
}
```

### UI Components
- shadcn/ui components (in `/components/ui`)
- Tailwind CSS v4.0
- Radix UI primitives (via shadcn)

---

## 🎯 Future Enhancements

### Planned Features
- [ ] Real-time data with WebSocket
- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] Export to PDF/Excel
- [ ] Calendar view for appointments
- [ ] Drag & drop slot management
- [ ] Dark mode implementation
- [ ] Full i18n integration
- [ ] Role-based access control
- [ ] Analytics dashboard
- [ ] Email templates
- [ ] SMS notifications
- [ ] Payment integration

---

## 📚 Additional Resources

### Documentation Links
- [Tailwind CSS v4.0](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)
- [React Hook Form](https://react-hook-form.com)
- [Radix UI](https://www.radix-ui.com)

### Design References
- Material Design 3
- Apple Human Interface Guidelines
- Telegram Web App Guidelines

---

## 🤝 Contributing Guidelines

### Before Making Changes
1. Review existing component patterns
2. Maintain design consistency
3. Test on mobile, tablet, and desktop
4. Add appropriate toast notifications
5. Update this documentation if needed

### Code Review Checklist
- [ ] Follows established patterns
- [ ] Responsive on all breakpoints
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Proper error handling
- [ ] Toast notifications for actions
- [ ] Loading states implemented
- [ ] Empty states handled
- [ ] No console errors
- [ ] TypeScript types defined

---

## 📞 Support

For questions or issues:
1. Review this documentation
2. Check component examples in existing pages
3. Test in browser DevTools (responsive mode)
4. Verify console for errors

---

**Last Updated:** October 22, 2025
**Version:** 1.0.0
**Author:** Development Team
