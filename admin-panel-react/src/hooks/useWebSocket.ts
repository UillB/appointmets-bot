import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface WebSocketEvent {
  id: string;
  type: string;
  timestamp: Date;
  data: any;
  metadata?: {
    source: 'telegram' | 'admin_panel' | 'api' | 'system';
    userAgent?: string;
    ip?: string;
  };
}

export interface WebSocketMessage {
  type: 'event' | 'notification' | 'ping' | 'pong' | 'connection';
  data?: any;
  timestamp?: Date;
  message?: string;
}

export function useWebSocket() {
  const { token, isAuthenticated } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<WebSocketEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  const connect = useCallback(() => {
    if (!token || !isAuthenticated) return;

    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    setConnectionStatus('connecting');

    try {
      const wsUrl = `ws://localhost:4000/ws?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Start heartbeat
        startHeartbeat();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Stop heartbeat
        stopHeartbeat();
        
        // Attempt to reconnect after 3 seconds
        if (event.code !== 1000) { // Not a normal closure
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [token, isAuthenticated]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping' });
      }
    }, 30000); // Send ping every 30 seconds
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'pong':
        // Heartbeat response - connection is alive
        break;
      case 'connection':
        console.log('✅ WebSocket connection established:', message.message);
        break;
      case 'event':
        // Handle real-time events
        if (message.data) {
          console.log('📨 WebSocket event received:', message.data.type, message.data);
          setEvents(prev => {
            const newEvent = {
              ...message.data,
              timestamp: new Date(message.data.timestamp)
            };
            return [newEvent, ...prev].slice(0, 100); // Keep last 100 events
          });
        }
        break;
      case 'notification':
        // Handle notifications
        console.log('Notification received:', message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Connect when authenticated
  useEffect(() => {
    console.log('🔌 WebSocket connection check:', { isAuthenticated, hasToken: !!token, tokenLength: token?.length });
    
    if (isAuthenticated && token) {
      console.log('🔌 Attempting WebSocket connection...');
      connect();
    } else {
      console.log('🔌 WebSocket not connecting:', { isAuthenticated, hasToken: !!token });
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    events,
    sendMessage,
    reconnect: connect,
    disconnect
  };
}
