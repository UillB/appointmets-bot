# Toast Notification System

## Overview

Comprehensive toast notification system with WebSocket support for real-time events. Positioned at **top-right** with rich colors, icons, and contextual information.

## Import

```tsx
import { toastNotifications } from './components/toast-notifications';
```

## Usage Examples

### Appointments

```tsx
// Create appointment
toastNotifications.appointments.created();

// Update with client name
toastNotifications.appointments.updated("John Doe");

// Confirm appointment
toastNotifications.appointments.confirmed("John Doe");

// Cancel appointment
toastNotifications.appointments.cancelled("John Doe");

// Delete appointment
toastNotifications.appointments.deleted();

// Pending status
toastNotifications.appointments.pending();
```

### Services

```tsx
// Create service
toastNotifications.services.created("Haircut");

// Update service
toastNotifications.services.updated("Massage");

// Delete service
toastNotifications.services.deleted("Consultation");

// Slots generated
toastNotifications.services.slotsGenerated("Haircut");
```

### Organizations

```tsx
// Create organization
toastNotifications.organizations.created("Tech Solutions Inc");

// Update organization
toastNotifications.organizations.updated("Health Care Plus");

// Delete organization
toastNotifications.organizations.deleted("Demo Org");
```

### Real-time WebSocket Events

```tsx
// New appointment received (shows notification bell icon)
toastNotifications.realtime.newAppointment("Jane Smith");

// Appointment confirmed by client
toastNotifications.realtime.appointmentConfirmed("Jane Smith");

// Appointment cancelled by client
toastNotifications.realtime.appointmentCancelled("Jane Smith");

// Appointment rescheduled
toastNotifications.realtime.appointmentRescheduled("Jane Smith");
```

### System Events

```tsx
// Data refreshed
toastNotifications.system.refreshed("Dashboard");
toastNotifications.system.refreshed("Appointments");

// Export started
toastNotifications.system.exported("Services");
toastNotifications.system.exported("Analytics report");

// Changes saved
toastNotifications.system.saved();

// Auto-save
toastNotifications.system.autoSaved();

// Connection lost/restored
toastNotifications.system.connectionLost();
toastNotifications.system.connectionRestored();
```

### Errors & Warnings

```tsx
// General error
toastNotifications.errors.general("Something went wrong");

// Network error
toastNotifications.errors.network();

// Validation error
toastNotifications.errors.validation("Email is required");

// Unauthorized
toastNotifications.errors.unauthorized();

// Not found
toastNotifications.errors.notFound("Service");

// Warnings
toastNotifications.warnings.unsavedChanges();
toastNotifications.warnings.limitReached("Maximum 10 services allowed");
toastNotifications.warnings.deprecated("This feature");
```

### Settings

```tsx
// Settings saved
toastNotifications.settings.saved();

// Settings reset
toastNotifications.settings.reset();
```

### Info Messages

```tsx
// General info
toastNotifications.info.general("Processing data", "This may take a few moments");

// Loading
toastNotifications.info.loading("Fetching data...");
```

## Toast Types & Icons

| Type | Icon | Color | Duration |
|------|------|-------|----------|
| **Success** | CheckCircle2 | Green | 4s |
| **Error** | XCircle | Red | 6s |
| **Warning** | AlertTriangle | Amber | 5s |
| **Info** | Info | Blue | 4s |
| **Realtime** | Bell/Calendar | Blue | 4-5s |

## Design Guidelines

### Positioning
- **Desktop**: Top-right corner
- **Mobile**: Top-right, full-width on small screens

### Visual Style
- Rich colors matching notification type
- Icon on the left (5x5)
- Title + description layout
- Close button always visible
- Smooth animations

### Best Practices

1. **Use specific notifications**: Instead of generic `toast.success("Done")`, use `toastNotifications.services.created("Haircut")`

2. **Include context**: Pass names/titles when available
   ```tsx
   // Good ✓
   toastNotifications.appointments.confirmed("John Doe");
   
   // Less informative ✗
   toastNotifications.appointments.confirmed();
   ```

3. **WebSocket events**: Use `realtime` category for all WebSocket-triggered notifications
   ```tsx
   websocket.on('appointment:new', (data) => {
     toastNotifications.realtime.newAppointment(data.clientName);
   });
   ```

4. **System feedback**: Always provide feedback for user actions
   ```tsx
   const handleRefresh = () => {
     toastNotifications.system.refreshed("Services");
   };
   
   const handleExport = () => {
     toastNotifications.system.exported("Organizations");
   };
   ```

5. **Error handling**: Use appropriate error types
   ```tsx
   try {
     await api.createService(data);
     toastNotifications.services.created(data.name);
   } catch (error) {
     if (error.code === 'NETWORK_ERROR') {
       toastNotifications.errors.network();
     } else {
       toastNotifications.errors.general(error.message);
     }
   }
   ```

## WebSocket Integration Example

```tsx
import { toastNotifications } from './components/toast-notifications';

// Initialize WebSocket connection
const ws = new WebSocket('wss://your-server.com/ws');

ws.onopen = () => {
  toastNotifications.system.connectionRestored();
};

ws.onclose = () => {
  toastNotifications.system.connectionLost();
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'appointment:new':
      toastNotifications.realtime.newAppointment(data.clientName);
      break;
      
    case 'appointment:confirmed':
      toastNotifications.realtime.appointmentConfirmed(data.clientName);
      break;
      
    case 'appointment:cancelled':
      toastNotifications.realtime.appointmentCancelled(data.clientName);
      break;
      
    case 'appointment:rescheduled':
      toastNotifications.realtime.appointmentRescheduled(data.clientName);
      break;
  }
};
```

## Migration from Old Toast

### Before (Old)
```tsx
import { toast } from "sonner@2.0.3";

toast.success("Appointment created");
toast.error("Something went wrong");
```

### After (New)
```tsx
import { toastNotifications } from './components/toast-notifications';

toastNotifications.appointments.created();
toastNotifications.errors.general("Something went wrong");
```

## Benefits

✅ **Consistent**: All notifications follow the same pattern
✅ **Contextual**: Rich information with icons and descriptions
✅ **Type-safe**: Autocomplete and IntelliSense support
✅ **Organized**: Categorized by feature (appointments, services, etc.)
✅ **Real-time ready**: Built-in WebSocket event support
✅ **Maintainable**: Easy to update all notifications in one place
✅ **User-friendly**: Clear, informative messages

## Customization

To add a new notification type, edit `/components/toast-notifications.tsx`:

```tsx
export const toastNotifications = {
  // ... existing categories
  
  // New category
  myFeature: {
    created: (name?: string) =>
      toast.success("Feature created", {
        description: name ? `${name} has been created` : "New feature added",
        icon: <Plus className="w-5 h-5" />,
      }),
  },
};
```

## Testing

```tsx
// Test all notification types
import { toastNotifications } from './components/toast-notifications';

// In your component
const handleTestNotifications = () => {
  toastNotifications.appointments.created();
  setTimeout(() => toastNotifications.services.updated("Test Service"), 1000);
  setTimeout(() => toastNotifications.realtime.newAppointment("Test User"), 2000);
  setTimeout(() => toastNotifications.system.refreshed("Dashboard"), 3000);
};
```
