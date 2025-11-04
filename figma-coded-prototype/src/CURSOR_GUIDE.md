# 🤖 Cursor AI - Quick Reference Guide

## 🎯 Quick Start

This is an **Appointments Bot Admin Panel** built with React + TypeScript + Tailwind v4.0 + shadcn/ui.

**Primary Color:** `#4F46E5` (indigo-600)  
**Design:** Material Design + Modern Minimalism  
**Layout:** Fixed sidebar (desktop), overlay (mobile)

---

## 📐 Architecture Pattern

### Every Page (except Dashboard) Uses This Structure:

```tsx
<div className="flex-1 flex flex-col min-h-0 bg-gray-50">
  {/* 1. Gradient Header with Clock */}
  <PageHeader
    icon={<Icon className="w-7 h-7 text-white" />}
    title="Page Title"
    description="Description"
    onRefresh={handleRefresh}
    onMenuClick={onMenuClick}
    actions={<>Buttons</>}
  />
  
  {/* 2. Main Content */}
  <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats (3 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(stat => <StatCard {...stat} />)}
      </div>
      
      {/* Content Cards */}
      <Card className="p-4 lg:p-6 bg-white">
        {/* Your content */}
      </Card>
    </div>
  </div>
</div>
```

---

## 🎨 Component Patterns (Copy-Paste Ready)

### Standard Card with Header
```tsx
<Card className="p-6 bg-white">
  <div className="space-y-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div>
        <h3 className="text-lg">Title</h3>
        <p className="text-sm text-gray-500">Description</p>
      </div>
    </div>
    <Separator />
    {/* Content */}
  </div>
</Card>
```

### Form Field with Icon
```tsx
<div className="space-y-2">
  <Label htmlFor="id">Field Name <span className="text-red-500">*</span></Label>
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <Input
      id="id"
      className="pl-10"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Placeholder"
    />
  </div>
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
      <SelectItem value="opt1">Option 1</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Switch Setting
```tsx
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
  <div className="flex-1">
    <Label className="text-base">Setting Name</Label>
    <p className="text-sm text-gray-500 mt-1">Description</p>
  </div>
  <Switch checked={enabled} onCheckedChange={setEnabled} className="ml-4" />
</div>
```

### Info Card
```tsx
<div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
    <div className="text-sm text-blue-700">
      <p className="font-medium mb-1">Title</p>
      <p>Description text</p>
    </div>
  </div>
</div>
```

### Password Input with Toggle
```tsx
<div className="relative">
  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <Input
    type={showPassword ? "text" : "password"}
    className="pl-10 pr-10"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
  >
    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
</div>
```

---

## 📱 Responsive Patterns

### Mobile Filter Drawer
```tsx
{/* Mobile */}
<div className="flex gap-2 lg:hidden">
  <Input className="flex-1" />
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon">
        <SlidersHorizontal className="w-4 h-4" />
      </Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-[300px]">
      {/* Filters */}
    </SheetContent>
  </Sheet>
</div>

{/* Desktop */}
<div className="hidden lg:flex flex-1 gap-4">
  <Input className="flex-1" />
  <Select>{/* Filter */}</Select>
</div>
```

### Mobile Cards + Desktop Table
```tsx
{/* Mobile */}
<div className="lg:hidden space-y-3">
  {items.map(item => (
    <Card key={item.id} className="p-4">{/* Card */}</Card>
  ))}
</div>

{/* Desktop */}
<div className="hidden lg:block overflow-x-auto rounded-lg border">
  <Table>{/* Table */}</Table>
</div>
```

---

## 🎨 Button Styles

```tsx
// Primary
<Button className="bg-indigo-600 hover:bg-indigo-700">
  <Icon className="w-4 h-4 mr-2" />
  Primary
</Button>

// Outline
<Button variant="outline">Outline</Button>

// Ghost
<Button variant="ghost">Ghost</Button>

// Destructive
<Button className="bg-red-600 hover:bg-red-700">Delete</Button>

// Link Style
<Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
  Link
</Button>
```

---

## 🎨 Status Badges

```tsx
// Available/Success
<Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
  Available
</Badge>

// Pending/Warning
<Badge className="bg-amber-50 text-amber-700 border-amber-200">
  Pending
</Badge>

// Booked/Info
<Badge className="bg-blue-50 text-blue-700 border-blue-200">
  Booked
</Badge>

// Error/Cancelled
<Badge className="bg-red-50 text-red-700 border-red-200">
  Cancelled
</Badge>
```

---

## 🔔 Toast Notifications

```tsx
import { toast } from "sonner@2.0.3";

toast.success("Success message");
toast.success("Title", { description: "Details" });
toast.error("Error message");
toast.info("Info message");
toast.warning("Warning message");
```

---

## 📊 Stats Card Pattern

```tsx
const stats = [
  {
    icon: IconComponent,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Title",
    value: 42,
    subtitle: "Subtitle",
  },
];

<StatCard key={stat.title} {...stat} />
```

---

## 🎯 Icon Background Colors

```
Blue:    bg-blue-50    text-blue-600    (General)
Purple:  bg-purple-50  text-purple-600  (Premium)
Emerald: bg-emerald-50 text-emerald-600 (Success)
Amber:   bg-amber-50   text-amber-600   (Warning)
Red:     bg-red-50     text-red-600     (Danger)
Indigo:  bg-indigo-50  text-indigo-600  (Primary)
```

---

## 🚫 IMPORTANT RULES

### ❌ DO NOT:
- Add font size/weight classes (text-2xl, font-bold, etc.) - Use default typography
- Create new pages without PageHeader component
- Modify typography in globals.css unless requested
- Use custom colors outside the established palette

### ✅ DO:
- Use PageHeader on all pages (except Dashboard)
- Follow the card pattern with icon + title + separator
- Add toast notifications for all actions
- Use relative icons in inputs (`absolute left-3 top-1/2 -translate-y-1/2`)
- Use `z-10 pointer-events-none` for icons in Select dropdowns
- Add proper spacing: `space-y-6` for sections, `gap-4` for grids
- Test on mobile, tablet, and desktop

---

## 📦 Common Imports

```tsx
import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { PageHeader } from "./PageHeader";
import { StatCard } from "./StatCard";
import { toast } from "sonner@2.0.3";
import { IconName } from "lucide-react";
```

---

## 🔄 Page State Pattern

```tsx
const [activeTab, setActiveTab] = useState("tab1");
const [searchQuery, setSearchQuery] = useState("");
const [filter, setFilter] = useState("all");
const [dialogOpen, setDialogOpen] = useState(false);

const handleRefresh = () => {
  toast.success("Refreshed");
};

const handleSave = () => {
  if (!validationCheck) {
    toast.error("Validation failed");
    return;
  }
  toast.success("Saved successfully");
};
```

---

## 🎨 Gradient Elements

```tsx
// Gradient Icon Background
<div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
  <Icon className="w-6 h-6 text-white" />
</div>

// Gradient Card
<Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
```

---

## 📱 Telegram Web App Support

- Ensure mobile-first design (320px+)
- Use touch-friendly sizes (min 44x44px for buttons)
- Test in mobile viewport
- Sidebar overlay on mobile

---

## 🎯 Quick Navigation

**Existing Pages:**
- Dashboard - Overview with stats
- Appointments - Booking management
- Services - Service CRUD
- Organizations - Org management
- Bot Management - Telegram bot config
- Slots - Schedule generation
- AI Assistant - AI configuration
- Settings - User & system settings

**Main Files:**
- `/App.tsx` - Routing
- `/components/PageHeader.tsx` - Reusable header
- `/components/Sidebar.tsx` - Navigation
- `/components/[Page]Page.tsx` - Page components
- `/styles/globals.css` - Global styles
- `/components/ui/*` - shadcn components

---

## 🚀 Adding a New Page

1. Create `components/NewPage.tsx`:
```tsx
export function NewPage({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <PageHeader
        icon={<Icon className="w-7 h-7 text-white" />}
        title="Page Title"
        description="Description"
        onRefresh={() => toast.success("Refreshed")}
        onMenuClick={onMenuClick}
        actions={<Button>Action</Button>}
      />
      {/* Rest of content */}
    </div>
  );
}
```

2. Add to `Sidebar.tsx`:
```tsx
{ icon: Icon, label: "New Page", page: "new-page" }
```

3. Add to `App.tsx`:
```tsx
import { NewPage } from "./components/NewPage";
// In renderPage():
case "new-page":
  return <NewPage onMenuClick={handleMenuClick} />;
// In fullHeightPages:
const fullHeightPages = [..., "new-page"];
```

---

## ✨ Animation Classes

```css
transition-colors       /* For backgrounds/colors */
transition-all         /* For complex animations */
hover:shadow-md        /* Card elevation */
active:scale-98        /* Button press */
animate-fadeIn         /* Modal entrance */
animate-slideUp        /* Content entrance */
skeleton              /* Loading state */
```

---

## 🎯 Color Palette Reference

```
Primary: #4F46E5 (indigo-600)
Hover:   #4338CA (indigo-700)
Background: #FAFAFA (gray-50)
Card: #FFFFFF (white)
Text Primary: gray-900
Text Secondary: gray-500
Border: gray-200
```

---

**For full documentation, see `/PROJECT.md`**

**Last Updated:** October 22, 2025
