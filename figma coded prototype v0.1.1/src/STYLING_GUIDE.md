# 🎨 Styling Guide - Quick Reference

## 🎯 Color System

### Primary Colors
```css
Primary:       #4F46E5  (indigo-600)    bg-indigo-600
Primary Hover: #4338CA  (indigo-700)    bg-indigo-700
```

### Status Colors
```css
Success:   bg-emerald-50  text-emerald-700  border-emerald-200
Warning:   bg-amber-50    text-amber-700    border-amber-200
Info:      bg-blue-50     text-blue-700     border-blue-200
Error:     bg-red-50      text-red-700      border-red-200
Premium:   bg-purple-50   text-purple-700   border-purple-200
Disabled:  bg-gray-50     text-gray-700     border-gray-200
```

### Neutral Colors
```css
Background:       #FAFAFA  (gray-50)     bg-gray-50
Card:             #FFFFFF  (white)       bg-white
Text Primary:     gray-900              text-gray-900
Text Secondary:   gray-500              text-gray-500
Border:           gray-200              border-gray-200
```

---

## 📏 Spacing Scale (8px grid)

```css
gap-2  /  space-y-2  =  8px
gap-3  /  space-y-3  =  12px
gap-4  /  space-y-4  =  16px
gap-6  /  space-y-6  =  24px
gap-8  /  space-y-8  =  32px

p-4  =  16px padding
p-6  =  24px padding
px-4 sm:px-6  =  16px → 24px horizontal padding
```

### Common Patterns
```css
Sections:        space-y-6
Grids:           gap-4
Form Fields:     space-y-2
Card Padding:    p-4 lg:p-6
Page Padding:    px-4 sm:px-6 py-6
```

---

## 🎭 Shadows & Borders

```css
Card Shadow:       shadow-sm
Hover Shadow:      hover:shadow-md
Border:            border
Border Color:      border-gray-200
Rounded:           rounded-lg  (10px)
Rounded Full:      rounded-full
```

---

## 🎨 Button Styles

### Primary Button
```tsx
<Button className="bg-indigo-600 hover:bg-indigo-700">
  <Icon className="w-4 h-4 mr-2" />
  Primary
</Button>
```

### Outline Button
```tsx
<Button variant="outline">
  <Icon className="w-4 h-4 mr-2" />
  Outline
</Button>
```

### Ghost Button
```tsx
<Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
  Ghost
</Button>
```

### Destructive Button
```tsx
<Button className="bg-red-600 hover:bg-red-700">
  <Icon className="w-4 h-4 mr-2" />
  Delete
</Button>
```

### Icon Button
```tsx
<Button variant="outline" size="icon">
  <Icon className="w-4 h-4" />
</Button>
```

---

## 📝 Form Elements

### Input with Icon
```tsx
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <Input className="pl-10" placeholder="Placeholder" />
</div>
```

### Select with Icon
```tsx
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
  <Select>
    <SelectTrigger className="pl-10">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="1">Option 1</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Label with Required
```tsx
<Label htmlFor="id">
  Field Name <span className="text-red-500">*</span>
</Label>
```

---

## 🎨 Card Patterns

### Standard Card
```tsx
<Card className="p-4 lg:p-6 bg-white">
  {/* Content */}
</Card>
```

### Card with Icon Header
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

### Info/Alert Card
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

### Gradient Card
```tsx
<Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
  {/* Content */}
</Card>
```

---

## 🎨 Icon Backgrounds

### Icon Container Sizes
```css
Small:   w-8 h-8   (32px)    Icon: w-4 h-4
Medium:  w-10 h-10 (40px)    Icon: w-5 h-5
Large:   w-12 h-12 (48px)    Icon: w-6 h-6
XLarge:  w-14 h-14 (56px)    Icon: w-7 h-7
```

### Icon Background Colors
```tsx
// Blue - General/Info
<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
  <Icon className="w-5 h-5 text-blue-600" />
</div>

// Purple - Premium/AI
<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
  <Icon className="w-5 h-5 text-purple-600" />
</div>

// Emerald - Success
<div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
  <Icon className="w-5 h-5 text-emerald-600" />
</div>

// Amber - Warning
<div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
  <Icon className="w-5 h-5 text-amber-600" />
</div>

// Red - Danger
<div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
  <Icon className="w-5 h-5 text-red-600" />
</div>

// Indigo - Primary
<div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
  <Icon className="w-5 h-5 text-indigo-600" />
</div>
```

### Gradient Icon Background
```tsx
<div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
  <Icon className="w-6 h-6 text-white" />
</div>
```

---

## 🏷️ Badges

### Status Badges
```tsx
// Success
<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
  Active
</Badge>

// Warning
<Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
  Pending
</Badge>

// Error
<Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
  Cancelled
</Badge>

// Info
<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
  Info
</Badge>
```

### Solid Badge
```tsx
<Badge className="bg-indigo-600 hover:bg-indigo-700">
  Primary
</Badge>
```

---

## 📊 Grid Layouts

### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

### Stats Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
</div>
```

### Form Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Form fields */}
</div>
```

---

## 🎭 Transitions & Animations

### Standard Transitions
```css
transition-colors         /* For background/text color changes */
transition-all           /* For complex animations */
transition-shadow        /* For shadow changes */
```

### Hover Effects
```css
hover:bg-gray-100 transition-colors
hover:shadow-md transition-shadow
hover:text-indigo-700 transition-colors
```

### Active States
```css
active:scale-98 transition-transform
```

### Custom Classes (from globals.css)
```css
.transition-smooth       /* 200ms ease-in-out */
.transition-hover        /* Background/color 200ms */
.card-hover             /* Shadow + transform on hover */
.animate-fadeIn         /* Fade in animation */
.animate-slideUp        /* Slide up animation */
.skeleton              /* Loading skeleton */
```

---

## 📱 Responsive Classes

### Visibility
```css
hidden sm:flex          /* Hide on mobile, show on tablet+ */
lg:hidden              /* Hide on desktop */
flex sm:hidden         /* Show on mobile only */
```

### Layout
```css
flex-col sm:flex-row    /* Stack on mobile, row on tablet+ */
grid-cols-1 lg:grid-cols-3   /* 1 column → 3 columns */
```

### Spacing
```css
px-4 sm:px-6           /* 16px → 24px horizontal padding */
p-4 lg:p-6            /* 16px → 24px all-around padding */
text-sm lg:text-base   /* Small text → base text */
```

---

## 🎨 Gradient Styles

### Background Gradients
```css
bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700
bg-gradient-to-br from-indigo-500 to-purple-600
bg-gradient-to-b from-[#5B4FE9] to-[#4338CA]
bg-gradient-to-br from-indigo-50 to-purple-50
```

---

## 🔘 Switch Toggle Style

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

## 📋 Table Styles

### Desktop Table
```tsx
<div className="hidden lg:block overflow-x-auto rounded-lg border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Header</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Cell</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

---

## 🎯 Quick Copy-Paste Components

### Section Header
```tsx
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
```

### Action Buttons Row
```tsx
<div className="flex gap-2">
  <Button className="bg-indigo-600 hover:bg-indigo-700">
    <Icon className="w-4 h-4 mr-2" />
    Primary
  </Button>
  <Button variant="outline">
    <Icon className="w-4 h-4 mr-2" />
    Secondary
  </Button>
</div>
```

### Info Box
```tsx
<div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-blue-700">Information message</p>
  </div>
</div>
```

### Stats Info Card
```tsx
<div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
  <div className="flex items-center gap-3 mb-2">
    <Icon className="w-5 h-5 text-blue-600" />
    <span className="text-xs text-blue-600 font-medium uppercase">Label</span>
  </div>
  <p className="text-gray-900">Value</p>
</div>
```

---

## 🎨 Text Styles

### Headings (Use Default Typography)
```tsx
<h1>Heading 1</h1>  {/* No text-* classes */}
<h2>Heading 2</h2>
<h3>Heading 3</h3>
```

### Text Colors
```tsx
<p className="text-gray-900">Primary text</p>
<p className="text-gray-500">Secondary text</p>
<p className="text-gray-400">Muted text</p>
```

### Text Sizes (Use Sparingly)
```tsx
<p className="text-xs">Extra small (12px)</p>
<p className="text-sm">Small (14px)</p>
<p>Base (16px - default)</p>
<p className="text-lg">Large (18px)</p>
```

---

## 🎯 Remember

### ❌ Don't Use
- Manual font-weight classes (font-bold, font-medium)
- Manual font-size classes (text-2xl, text-xl) unless necessary
- Custom colors outside the palette
- Inconsistent spacing values

### ✅ Always Use
- Color palette from this guide
- 8px spacing grid
- Consistent component patterns
- Proper icon sizing
- Transition classes for hover states

---

**Refer to this guide for all styling decisions to maintain consistency!**
