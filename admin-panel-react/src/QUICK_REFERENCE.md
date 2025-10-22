# ⚡ Quick Reference Card

One-page cheat sheet for rapid development.

---

## 🎨 Colors (Copy-Paste)

```tsx
// Primary
bg-indigo-600 hover:bg-indigo-700

// Status
bg-emerald-50 text-emerald-700 border-emerald-200  // Success
bg-amber-50 text-amber-700 border-amber-200        // Warning
bg-blue-50 text-blue-700 border-blue-200          // Info
bg-red-50 text-red-700 border-red-200             // Error
bg-purple-50 text-purple-700 border-purple-200    // Premium

// Text
text-gray-900  // Primary
text-gray-500  // Secondary
text-gray-400  // Muted
```

---

## 📏 Spacing

```tsx
space-y-6  // Sections
gap-4      // Grids
space-y-2  // Form fields
p-4 lg:p-6 // Cards
px-4 sm:px-6 py-6  // Pages
```

---

## 🎯 Page Template

```tsx
export function NewPage({ onMenuClick }: { onMenuClick?: () => void }) {
  const handleRefresh = () => toast.success("Refreshed");

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <PageHeader
        icon={<Icon className="w-7 h-7 text-white" />}
        title="Title"
        description="Description"
        onRefresh={handleRefresh}
        onMenuClick={onMenuClick}
      />
      
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Content */}
        </div>
      </div>
    </div>
  );
}
```

---

## 🎴 Card Template

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

---

## 📝 Form Field

```tsx
<div className="space-y-2">
  <Label htmlFor="field">Label <span className="text-red-500">*</span></Label>
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <Input id="field" className="pl-10" placeholder="..." />
  </div>
  <p className="text-xs text-gray-500">Helper text</p>
</div>
```

---

## 🔘 Buttons

```tsx
// Primary
<Button className="bg-indigo-600 hover:bg-indigo-700">
  <Icon className="w-4 h-4 mr-2" />Primary
</Button>

// Outline
<Button variant="outline"><Icon className="w-4 h-4 mr-2" />Outline</Button>

// Ghost
<Button variant="ghost" className="text-indigo-600">Ghost</Button>

// Destructive
<Button className="bg-red-600 hover:bg-red-700">Delete</Button>
```

---

## 🏷️ Badge

```tsx
<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
  Status
</Badge>
```

---

## 📱 Responsive Filter

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
<div className="hidden lg:flex gap-4">
  <Input className="flex-1" />
  <Select>{/* ... */}</Select>
</div>
```

---

## 📊 Stats Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
</div>
```

---

## 🔔 Toasts

```tsx
import { toast } from "sonner@2.0.3";

toast.success("Success");
toast.error("Error");
toast.info("Info");
toast.warning("Warning");
```

---

## 🎨 Icon Container

```tsx
// Small (32px)
<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
  <Icon className="w-4 h-4 text-blue-600" />
</div>

// Medium (40px)
<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
  <Icon className="w-5 h-5 text-purple-600" />
</div>

// Gradient
<div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
  <Icon className="w-6 h-6 text-white" />
</div>
```

---

## 🔄 Switch

```tsx
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
  <div className="flex-1">
    <Label className="text-base">Setting</Label>
    <p className="text-sm text-gray-500 mt-1">Description</p>
  </div>
  <Switch checked={enabled} onCheckedChange={setEnabled} className="ml-4" />
</div>
```

---

## 📋 Select with Icon

```tsx
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
  <Select value={value} onValueChange={setValue}>
    <SelectTrigger className="pl-10">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="1">Option 1</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## 💡 Info Box

```tsx
<div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
    <div className="text-sm text-blue-700">
      <p className="font-medium mb-1">Title</p>
      <p>Message</p>
    </div>
  </div>
</div>
```

---

## 🎭 Tabs

```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-2 mb-6">
    <TabsTrigger value="tab1" className="gap-2">
      <Icon className="w-4 h-4" />Tab 1
    </TabsTrigger>
    <TabsTrigger value="tab2" className="gap-2">
      <Icon className="w-4 h-4" />Tab 2
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="tab1" className="mt-0 space-y-6">
    {/* Content */}
  </TabsContent>
</Tabs>
```

---

## 📱 Mobile/Desktop

```tsx
{/* Mobile Only */}
<div className="lg:hidden">Mobile content</div>

{/* Desktop Only */}
<div className="hidden lg:block">Desktop content</div>

{/* Responsive Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 🎨 Gradients

```tsx
// Background
bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700
bg-gradient-to-br from-indigo-500 to-purple-600
bg-gradient-to-br from-indigo-50 to-purple-50

// Sidebar
bg-gradient-to-b from-[#5B4FE9] to-[#4338CA]
```

---

## 🔍 Icon Sizes

```tsx
PageHeader: w-7 h-7
Card Header: w-5 h-5
Buttons:     w-4 h-4
Inputs:      w-4 h-4
```

---

## ⚡ Transitions

```tsx
transition-colors
hover:bg-gray-100 transition-colors
hover:shadow-md transition-shadow
active:scale-98 transition-transform
```

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
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { PageHeader } from "./PageHeader";
import { StatCard } from "./StatCard";
import { toast } from "sonner@2.0.3";
import { Icon } from "lucide-react";
```

---

## 🚫 Don't Use

- ❌ `text-2xl`, `font-bold` (typography managed in globals.css)
- ❌ Custom colors outside palette
- ❌ Custom spacing values
- ❌ Pages without PageHeader

---

## ✅ Always Use

- ✅ PageHeader on all pages (except Dashboard)
- ✅ 3 StatCards at top
- ✅ Toast notifications
- ✅ Icons in buttons (mr-2)
- ✅ Responsive patterns
- ✅ Proper spacing (8px grid)

---

## 📚 Full Docs

- **Quick patterns:** CURSOR_GUIDE.md
- **Styling:** STYLING_GUIDE.md
- **Architecture:** PROJECT.md
- **Navigation:** INDEX.md

---

**Remember: Copy existing patterns, maintain consistency!**
