import { useEffect, useState, useCallback } from 'react';
import { toastNotifications } from '../components/toast-notifications';

export type WebSocketEventType = 
  | 'appointment.created'
  | 'appointment.confirmed'
  | 'appointment.cancelled'
  | 'appointment.rescheduled'
  | 'appointment.rejected';

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: {
    appointmentId?: string;
    clientName?: string;
    clientTelegramId?: string;
    serviceName?: string;
    timestamp?: string;
  };
}

export interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  onMessage?: (event: WebSocketEvent) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = 'wss://api.example.com/ws', // Mock URL
    autoConnect = true,
    reconnectInterval = 5000,
    onMessage,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null);

  // Mock WebSocket connection for demo
  useEffect(() => {
    if (!autoConnect) return;

    // Simulate connection
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      console.log('[WebSocket] Connected to', url);
    }, 1000);

    // Simulate random incoming events (for demo purposes)
    const eventSimulator = setInterval(() => {
      // Randomly trigger events
      if (Math.random() > 0.7) {
        const events: WebSocketEvent[] = [
          {
            type: 'appointment.created',
            data: {
              appointmentId: `apt-${Date.now()}`,
              clientName: 'John Doe',
              clientTelegramId: '123456789',
              serviceName: 'Haircut',
              timestamp: new Date().toISOString(),
            },
          },
          {
            type: 'appointment.confirmed',
            data: {
              appointmentId: `apt-${Date.now()}`,
              clientName: 'Jane Smith',
              timestamp: new Date().toISOString(),
            },
          },
          {
            type: 'appointment.cancelled',
            data: {
              appointmentId: `apt-${Date.now()}`,
              clientName: 'Bob Wilson',
              timestamp: new Date().toISOString(),
            },
          },
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];
        handleIncomingMessage(randomEvent);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearTimeout(connectTimer);
      clearInterval(eventSimulator);
      setIsConnected(false);
      console.log('[WebSocket] Disconnected');
    };
  }, [autoConnect, url]);

  const handleIncomingMessage = useCallback((event: WebSocketEvent) => {
    setLastMessage(event);
    
    // Trigger appropriate toast notification
    switch (event.type) {
      case 'appointment.created':
        toastNotifications.realtime.newAppointment(event.data.clientName);
        break;
      case 'appointment.confirmed':
        toastNotifications.realtime.appointmentConfirmed(event.data.clientName);
        break;
      case 'appointment.cancelled':
        toastNotifications.realtime.appointmentCancelled(event.data.clientName);
        break;
      case 'appointment.rescheduled':
        toastNotifications.realtime.appointmentRescheduled(event.data.clientName);
        break;
    }

    // Call custom handler if provided
    if (onMessage) {
      onMessage(event);
    }
  }, [onMessage]);

  const sendMessage = useCallback((message: any) => {
    if (!isConnected) {
      console.warn('[WebSocket] Cannot send message - not connected');
      return;
    }
    console.log('[WebSocket] Sending message:', message);
    // In real implementation, send via WebSocket
  }, [isConnected]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}
