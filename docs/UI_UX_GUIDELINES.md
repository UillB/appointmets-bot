# UI/UX Design Guidelines
## Appointments Bot Admin Panel

### 🎯 **Project Overview**
Telegram Bot Admin Panel for appointment management system with mobile-first design optimized for Telegram Web App (TWA), desktop, and mobile browsers.

---

## 📱 **Design System**

### **Color Palette**
```scss
// Primary Colors
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$primary-blue: #1976d2;
$primary-purple: #667eea;

// Status Colors
$success-green: #4caf50;
$warning-orange: #ff9800;
$error-red: #f44336;
$info-blue: #2196f3;

// Neutral Colors
$text-primary: #333;
$text-secondary: #666;
$text-muted: #999;
$background-light: #fafafa;
$border-light: #e0e0e0;
```

### **Typography Scale**
```scss
// Headers
h1: 24px, font-weight: 600, color: #333
h2: 20px, font-weight: 600, color: #333
h3: 18px, font-weight: 600, color: #333

// Body Text
body: 14px, font-weight: 400, color: #333
small: 13px, font-weight: 400, color: #666
caption: 12px, font-weight: 400, color: #999

// Page Descriptions
page-description: 14px, color: #666
```

### **Spacing System**
```scss
// Consistent spacing scale
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 12px;
$spacing-lg: 16px;
$spacing-xl: 20px;
$spacing-xxl: 24px;
$spacing-xxxl: 32px;
```

---

## 🏗️ **Component Architecture**

### **Universal Header Component**
**Purpose**: Consistent header across all pages with real-time updates
```html
<div class="universal-header">
  <div class="datetime-info">
    <div class="current-date">{{ currentDate | date:'EEEE, d MMMM y' }}</div>
    <div class="current-time">{{ currentTime | date:'HH:mm:ss' }}</div>
  </div>
  <button mat-icon-button (click)="onRefresh()" class="refresh-btn">
    <mat-icon>refresh</mat-icon>
  </button>
</div>
```

**Styling**:
- Gradient background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- White text with opacity variations
- Real-time clock updates every second
- Hover effects with scale transform

### **Page Header Pattern**
**Purpose**: Consistent page titles with icons and descriptions
```html
<div class="page-header">
  <div class="page-title">
    <mat-icon class="title-icon">icon_name</mat-icon>
    <div class="title-content">
      <h1>Page Title</h1>
      <p class="page-description">Brief description of page purpose</p>
    </div>
  </div>
</div>
```

**Styling**:
- Icon: 32px, color: #667eea
- Title: 24px, font-weight: 600
- Description: 14px, color: #666
- Responsive: Stack vertically on mobile

### **Quick Actions Section**
**Purpose**: Primary action buttons for each page
```html
<div class="quick-actions">
  <button mat-stroked-button class="quick-action-btn">
    <mat-icon>icon</mat-icon>
    Action Name
  </button>
</div>
```

**Styling**:
- Flex layout with gap: 12px
- Buttons: min-width: 120px, padding: 12px 16px
- Hover: translateY(-2px), box-shadow enhancement
- Mobile: Stack vertically

---

## 📊 **Page-Specific Guidelines**

### **Dashboard Page**
**Layout**: Grid-based with status cards and quick stats
- **Status Cards**: 3-column grid (desktop), 1-column (mobile)
- **Quick Stats**: Horizontal layout with icons
- **Recent Activity**: List format with timestamps

### **Bot Management Page**
**Key Components**:
1. **Bot Status Overview**: 3 cards showing bot status, organization, bot link
2. **Progress Stepper**: Visual progress indicator with colored icons
3. **Tabbed Interface**: 3 tabs (Instructions, Activation, Settings)

**Stepper Design**:
- Icons: 24px, color-coded by status
- Completed: Green (#4caf50)
- Active: Blue (#1976d2)
- Pending: Orange (#ff9800)
- Disabled: Gray (#ccc)

### **Slots Management Page**
**Layout**: Two-tab interface
1. **Slot Management**: List with filters and pagination
2. **Slot Generation**: Form with grid layout

**Form Design**:
- Grid layout: 2 columns (desktop), 1 column (mobile)
- Form groups with icons and labels
- Input fields: 48px min-height
- Suffix text: Proper spacing (margin-right: 8px)

### **Organizations Page**
**Layout**: Table (desktop) + Cards (mobile)
- **Desktop**: Material table with sorting and filtering
- **Mobile**: Card-based layout with essential info
- **Filters**: Search and sort dropdowns
- **Actions**: Edit, delete, view buttons

### **AI Assistant Page**
**Layout**: Form-based configuration
- **Form Grid**: 2 columns (desktop), 1 column (mobile)
- **Section Headers**: With icons and descriptions
- **Form Labels**: With icons and required indicators
- **API Key Field**: With validation button

---

## 📱 **Responsive Design**

### **Breakpoints**
```scss
// Mobile First Approach
$mobile: max-width: 768px;
$tablet: 769px - 1024px;
$desktop: 1025px+;
```

### **Mobile Optimizations**
1. **Touch Targets**: Minimum 44px for buttons
2. **Card Layout**: Replace tables with cards
3. **Stack Layout**: Vertical stacking of form elements
4. **Navigation**: Bottom sheet or drawer navigation
5. **Typography**: Slightly larger text for readability

### **TWA (Telegram Web App) Specific**
1. **Viewport**: Optimized for Telegram's webview
2. **Navigation**: Telegram-style bottom navigation
3. **Colors**: Match Telegram's design language
4. **Gestures**: Support for swipe navigation
5. **Performance**: Lightweight components for mobile

---

## 🎨 **Visual Design Principles**

### **Card Design**
```scss
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
```

### **Button Styles**
```scss
// Primary Button
.primary-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
}

// Stroked Button
.stroked-button {
  border: 1px solid #e0e0e0;
  background: white;
  color: #333;
  border-radius: 8px;
  padding: 12px 24px;
}
```

### **Form Design**
```scss
.form-field {
  .mat-mdc-form-field {
    .mat-mdc-text-field-wrapper {
      .mat-mdc-form-field-flex {
        .mat-mdc-form-field-infix {
          min-height: 48px;
          padding: 12px 0;
        }
      }
    }
  }
}
```

---

## 🔄 **Interaction Patterns**

### **Loading States**
- **Skeleton Loaders**: For content loading
- **Progress Indicators**: For form submissions
- **Spinner Overlays**: For page transitions

### **Error Handling**
- **Inline Validation**: Real-time form validation
- **Toast Notifications**: Success/error messages
- **Error Pages**: 404, 500 error handling

### **Success Feedback**
- **Toast Messages**: 2-3 second duration
- **Visual Confirmation**: Checkmarks, color changes
- **Progress Indicators**: Step completion

---

## 📐 **Layout Guidelines**

### **Grid System**
```scss
// Desktop: 2-column grid
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

// Mobile: Single column
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

### **Spacing Rules**
- **Section Spacing**: 24px between major sections
- **Element Spacing**: 16px between related elements
- **Form Spacing**: 20px between form groups
- **Card Padding**: 20px internal padding

---

## 🎯 **Accessibility Guidelines**

### **Color Contrast**
- **Text**: Minimum 4.5:1 contrast ratio
- **Interactive Elements**: Minimum 3:1 contrast ratio
- **Status Colors**: Accessible color combinations

### **Keyboard Navigation**
- **Tab Order**: Logical flow through interface
- **Focus Indicators**: Clear focus states
- **Skip Links**: For screen readers

### **Screen Reader Support**
- **ARIA Labels**: Descriptive labels for icons
- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: For images and icons

---

## 🚀 **Performance Guidelines**

### **Component Optimization**
- **Lazy Loading**: For heavy components
- **OnPush Strategy**: For change detection
- **Virtual Scrolling**: For large lists

### **Asset Optimization**
- **Icon Fonts**: Material Icons for consistency
- **Image Compression**: Optimized images
- **Bundle Size**: Minimize JavaScript bundles

---

## 🔧 **Technical Implementation**

### **Angular Material Components**
```typescript
// Required Material Modules
MatCardModule, MatButtonModule, MatIconModule,
MatTabsModule, MatFormFieldModule, MatInputModule,
MatSelectModule, MatDatepickerModule, MatCheckboxModule,
MatSnackBarModule, MatProgressSpinnerModule, MatDialogModule,
MatBottomSheetModule, MatTableModule, MatPaginatorModule,
MatSlideToggleModule, MatProgressBarModule
```

### **Responsive Utilities**
```scss
// Mobile-first media queries
@media (max-width: 768px) {
  // Mobile-specific styles
}

// Desktop enhancements
@media (min-width: 769px) {
  // Desktop-specific styles
}
```

### **State Management**
- **Reactive Forms**: For form state
- **RxJS**: For data streams and async operations
- **Local Storage**: For user preferences
- **Session Storage**: For temporary data

---

## 📋 **Component Checklist**

### **Every Page Should Have**:
- [ ] Universal Header with datetime
- [ ] Page Header with icon and description
- [ ] Quick Actions section
- [ ] Responsive layout (mobile + desktop)
- [ ] Loading states
- [ ] Error handling
- [ ] Success feedback

### **Form Components Should Have**:
- [ ] Grid layout (2 columns desktop, 1 mobile)
- [ ] Form labels with icons
- [ ] Required field indicators
- [ ] Validation messages
- [ ] Submit button with loading state

### **List Components Should Have**:
- [ ] Desktop table view
- [ ] Mobile card view
- [ ] Search and filter options
- [ ] Pagination (if needed)
- [ ] Action buttons
- [ ] Empty state handling

---

## 🎨 **Design Tokens**

```scss
// Spacing
$space-xs: 4px;
$space-sm: 8px;
$space-md: 12px;
$space-lg: 16px;
$space-xl: 20px;
$space-xxl: 24px;
$space-xxxl: 32px;

// Border Radius
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-xl: 16px;

// Shadows
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
$shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.15);

// Transitions
$transition-fast: 0.2s ease;
$transition-normal: 0.3s ease;
$transition-slow: 0.5s ease;
```

---

## 📝 **Implementation Notes**

### **For AI Design Tools (Builder.io)**
1. **Use these exact color codes** for consistency
2. **Follow the spacing system** for proper alignment
3. **Implement responsive breakpoints** as specified
4. **Use Material Design icons** for consistency
5. **Apply hover effects** and transitions
6. **Test on mobile devices** for touch interactions

### **For Development**
1. **Follow Angular Material patterns** for components
2. **Use SCSS variables** for maintainability
3. **Implement proper TypeScript types** for data
4. **Add proper ARIA attributes** for accessibility
5. **Test keyboard navigation** for all interactions
6. **Optimize for performance** with OnPush strategy

---

*This document serves as the single source of truth for UI/UX design decisions in the Appointments Bot project. All design changes should reference and update this document accordingly.*
