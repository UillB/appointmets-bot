# WebSocket Integration Guide

## Overview

The admin panel now includes real-time WebSocket integration for live updates from the Telegram bot. When users interact with the bot (create, confirm, cancel appointments), the admin panel receives instant notifications.

## Features

### 1. Real-Time Notifications
- **New Appointments**: Toast notification when someone books via Telegram
- **Confirmations**: Alert when a client confirms their appointment  
- **Cancellations**: Notification when appointments are cancelled
- **Reschedules**: Updates when appointments are rescheduled

### 2. Connection Status
- Live connection indicator in the header
- Shows "Connected" with WiFi icon when WebSocket is active
- Shows "Offline" with warning when disconnected
- Automatic reconnection attempts

### 3. Notification Counter
- Badge in header showing unread notifications
- Auto-increments when new events arrive
- Resets when notification panel is opened
- Displays "9+" for counts over 9

## Using the WebSocket Hook

### Basic Usage

```tsx
import { useWebSocket } from '../hooks/useWebSocket';

function MyComponent() {
  const { isConnected, lastMessage, sendMessage } = useWebSocket({
    autoConnect: true,
    onMessage: (event) => {
      console.log('Received event:', event);
    },
  });

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {lastMessage && (
        <p>Last event: {lastMessage.type}</p>
      )}
    </div>
  );
}
```

### Event Types

```typescript
type WebSocketEventType = 
  | 'appointment.created'
  | 'appointment.confirmed'
  | 'appointment.cancelled'
  | 'appointment.rescheduled'
  | 'appointment.rejected';
```

### Event Structure

```typescript
interface WebSocketEvent {
  type: WebSocketEventType;
  data: {
    appointmentId?: string;
    clientName?: string;
    clientTelegramId?: string;
    serviceName?: string;
    timestamp?: string;
  };
}
```

## Implementation Details

### Current Implementation (Mock)

The current implementation uses a mock WebSocket for demonstration:
- Simulates connection after 1 second
- Randomly generates events every 30 seconds
- Automatically triggers toast notifications

### Production Implementation

To implement real WebSocket connection:

1. **Update the URL** in `useWebSocket.ts`:
```typescript
const { isConnected } = useWebSocket({
  url: 'wss://your-backend.com/ws',
  autoConnect: true,
});
```

2. **Backend Requirements**:
   - WebSocket endpoint that accepts admin connections
   - Authentication via token or session
   - Event broadcasting when Telegram bot actions occur

3. **Message Format**:
   Backend should send JSON messages matching the `WebSocketEvent` interface

## Toast Notification Colors

Toasts are now styled with appropriate colors:

- **Success** (Green): Confirmations, successful actions
- **Error** (Red): Cancellations, errors
- **Warning** (Amber): Warnings, limits reached
- **Info** (Blue): General information, loading states
- **Default** (Indigo): Real-time notifications from Telegram

## Admin Authorization Flow

### Current System
1. Admin clicks "Authorize Admin Access" button
2. Opens Telegram bot with special authorization link
3. Bot validates authorization and links Telegram account
4. Admin can now access the web panel from Telegram

### Security Considerations
- Only authorized Telegram accounts can access the panel
- Authorization link contains unique token
- Token expires after use or timeout
- Admin status stored in database linked to Telegram ID

## Next Steps

To complete the WebSocket integration:

1. **Backend Setup**:
   - Create WebSocket server endpoint
   - Implement authentication middleware
   - Set up event broadcasting system

2. **Database**:
   - Store admin Telegram IDs
   - Track WebSocket connections
   - Log events for audit trail

3. **Frontend Enhancements**:
   - Add reconnection logic
   - Implement offline queue for missed events
   - Add sound notifications (optional)
   - Show notification history in panel

## Files Modified

- `/hooks/useWebSocket.ts` - WebSocket hook implementation
- `/components/Header.tsx` - Connection status and notification counter
- `/components/BotManagementPage.tsx` - Admin authorization flow
- `/styles/globals.css` - Toast color styling
- `/components/toast-notifications.tsx` - Real-time event handlers
