import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Archive, Trash2, AlertCircle } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { apiClient } from '../services/api';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  readAt?: string;
  archivedAt?: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Array<{ type: string; _count: { type: number } }>;
  recent: Notification[];
}

export function NotificationCenter() {
  const { events } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  useEffect(() => {
    // Process real-time events
    events.forEach(event => {
      if (event.type.startsWith('appointment.') || event.type.startsWith('bot.')) {
        addNotificationFromEvent(event);
      }
    });
  }, [events]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/notifications?limit=20') as any;
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/notifications/stats') as any;
      setStats(response);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  const addNotificationFromEvent = (event: any) => {
    const notification: Notification = {
      id: `event_${event.id}`,
      type: event.type,
      title: getEventTitle(event.type),
      message: getEventMessage(event),
      data: event.data,
      isRead: false,
      isArchived: false,
      createdAt: event.timestamp
    };

    setNotifications(prev => [notification, ...prev].slice(0, 50));
    
    // Update stats
    setStats(prev => prev ? {
      ...prev,
      total: prev.total + 1,
      unread: prev.unread + 1
    } : null);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.post(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setStats(prev => prev ? {
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      } : null);
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setStats(prev => prev ? { ...prev, unread: 0 } : null);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const clearAll = async () => {
    try {
      await apiClient.delete('/notifications/clear-all');
      setNotifications([]);
      setStats(prev => prev ? { ...prev, total: 0, unread: 0 } : null);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      toast.error('Failed to clear all notifications');
    }
  };

  const archiveNotification = async (notificationId: string) => {
    try {
      await apiClient.post(`/notifications/${notificationId}/archive`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setStats(prev => prev ? {
        ...prev,
        total: Math.max(0, prev.total - 1),
        unread: Math.max(0, prev.unread - (notifications.find(n => n.id === notificationId)?.isRead ? 0 : 1))
      } : null);
      toast.success('Notification archived');
    } catch (error) {
      console.error('Failed to archive notification:', error);
      toast.error('Failed to archive notification');
    }
  };

  const getEventTitle = (eventType: string): string => {
    switch (eventType) {
      case 'appointment.created':
        return 'New Appointment';
      case 'appointment.updated':
        return 'Appointment Updated';
      case 'appointment.cancelled':
        return 'Appointment Cancelled';
      case 'appointment.confirmed':
        return 'Appointment Confirmed';
      case 'bot.message.received':
        return 'Bot Message';
      case 'bot.booking.completed':
        return 'Booking Completed';
      default:
        return 'System Event';
    }
  };

  const getEventMessage = (event: any): string => {
    const data = event.data;
    switch (event.type) {
      case 'appointment.created':
        return `New appointment created for ${data.serviceName}`;
      case 'appointment.updated':
        return `Appointment for ${data.serviceName} has been updated`;
      case 'appointment.cancelled':
        return `Appointment for ${data.serviceName} has been cancelled`;
      case 'appointment.confirmed':
        return `Appointment for ${data.serviceName} has been confirmed`;
      case 'bot.message.received':
        return `Message from ${data.userName}: ${data.messageText?.substring(0, 50)}...`;
      case 'bot.booking.completed':
        return `${data.userName} completed booking for ${data.serviceName}`;
      default:
        return 'System event occurred';
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.startsWith('appointment.')) {
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    } else if (type.startsWith('bot.')) {
      return <Bell className="h-4 w-4 text-green-500" />;
    }
    return <Bell className="h-4 w-4 text-gray-500" />;
  };

  const unreadCount = stats?.unread || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-96 flex flex-col">
          <div className="p-4 border-b bg-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Mark all read
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
            {stats && (
              <div className="mt-2 text-sm text-gray-600">
                {stats.total} total, {stats.unread} unread
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                <div className="mt-2">Loading notifications...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <div>No notifications</div>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getNotificationIcon(notification.type)}
                        <h4 className="font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-2 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => archiveNotification(notification.id)}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                        title="Archive"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={loadNotifications}
                className="w-full text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Refresh notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
