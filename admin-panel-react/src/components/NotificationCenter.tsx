import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Archive, Trash2, AlertCircle, Clock, Calendar, Users, Sparkles, CheckCircle2, AlertTriangle, Info, BellOff, CheckCheck, User } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { apiClient } from '../services/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';

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
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const processedEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (events.length === 0) return;
    
    // Process real-time events - handle all event types
    // Use a ref to track processed events to avoid duplicates
    let hasNewEvents = false;
    
    events.forEach(event => {
      // Skip if already processed
      if (processedEventsRef.current.has(event.id)) return;
      
      if (event.type.startsWith('appointment.') || 
          event.type.startsWith('appointment_') ||
          event.type === 'appointment.created' ||
          event.type === 'appointment_created' ||
          event.type.startsWith('service.') || 
          event.type.startsWith('service_') ||
          event.type.startsWith('bot.') ||
          event.type.startsWith('slot.')) {
        processedEventsRef.current.add(event.id);
        hasNewEvents = true;
        addNotificationFromEvent(event);
      }
    });
    
    // Reload notifications to get latest from server if we processed any events
    if (hasNewEvents) {
      setTimeout(() => {
        loadNotifications();
        loadStats();
      }, 300);
    }
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
    // Handle both dot and underscore formats
    const normalizedType = eventType.replace('_', '.');
    
    switch (normalizedType) {
      case 'appointment.created':
      case 'appointment_created':
        return 'New Appointment';
      case 'appointment.updated':
      case 'appointment_updated':
        return 'Appointment Updated';
      case 'appointment.cancelled':
      case 'appointment_cancelled':
        return 'Appointment Cancelled';
      case 'appointment.confirmed':
      case 'appointment_confirmed':
        return 'Appointment Confirmed';
      case 'service.created':
      case 'service_created':
        return 'New Service';
      case 'service.updated':
      case 'service_updated':
        return 'Service Updated';
      case 'service.deleted':
      case 'service_deleted':
        return 'Service Deleted';
      case 'bot.message.received':
      case 'bot_message_received':
        return 'Bot Message';
      case 'bot.booking.completed':
      case 'bot_booking_completed':
        return 'Booking Completed';
      default:
        return 'System Event';
    }
  };

  const getEventMessage = (event: any): string => {
    const data = event.data;
    const normalizedType = event.type.replace('_', '.');
    
    switch (normalizedType) {
      case 'appointment.created':
      case 'appointment_created':
        return `New appointment created for ${data?.serviceName || 'service'}`;
      case 'appointment.updated':
      case 'appointment_updated':
        return `Appointment for ${data?.serviceName || 'service'} has been updated`;
      case 'appointment.cancelled':
      case 'appointment_cancelled':
        return `Appointment for ${data?.serviceName || 'service'} has been cancelled`;
      case 'appointment.confirmed':
      case 'appointment_confirmed':
        return `Appointment for ${data?.serviceName || 'service'} has been confirmed`;
      case 'service.created':
      case 'service_created':
        return `New service "${data?.serviceName || 'service'}" has been created`;
      case 'service.updated':
      case 'service_updated':
        return `Service "${data?.serviceName || 'service'}" has been updated`;
      case 'service.deleted':
      case 'service_deleted':
        return `Service "${data?.serviceName || 'service'}" has been deleted`;
      case 'bot.message.received':
      case 'bot_message_received':
        return `Message from ${data?.userName || 'user'}: ${data?.messageText?.substring(0, 50) || ''}...`;
      case 'bot.booking.completed':
      case 'bot_booking_completed':
        return `${data?.userName || 'User'} completed booking for ${data?.serviceName || 'service'}`;
      default:
        return 'System event occurred';
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.startsWith('appointment.')) {
      return <Calendar className="h-4 w-4 text-blue-500" />;
    } else if (type.startsWith('bot.')) {
      return <Bell className="h-4 w-4 text-green-500" />;
    } else if (type.includes('service')) {
      return <Sparkles className="h-4 w-4 text-purple-500" />;
    } else if (type.includes('user')) {
      return <Users className="h-4 w-4 text-indigo-500" />;
    }
    return <Bell className="h-4 w-4 text-gray-500" />;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const groupNotificationsByDate = (notifs: Notification[]) => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const earlier: Notification[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    notifs.forEach((notif) => {
      const notifDate = new Date(notif.createdAt);
      if (notifDate >= todayStart) {
        today.push(notif);
      } else if (notifDate >= yesterdayStart) {
        yesterday.push(notif);
      } else {
        earlier.push(notif);
      }
    });

    return { today, yesterday, earlier };
  };

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const { today, yesterday, earlier } = groupNotificationsByDate(filteredNotifications);

  const renderNotificationGroup = (
    notifications: Notification[],
    title: string
  ) => {
    if (notifications.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        {notifications.map(notification => {
          const customerInfo = notification.data?.customerInfo || {};
          const serviceName = notification.data?.serviceName || notification.data?.service?.name;
          const slotStart = notification.data?.slot?.startAt || notification.data?.slotStart;
          const slotEnd = notification.data?.slot?.endAt || notification.data?.slotEnd;
          
          return (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg hover:shadow-sm transition-all ${
                !notification.isRead ? 'bg-blue-50 border-blue-200 border-l-4' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      {/* Customer Metadata */}
                      {(customerInfo.firstName || customerInfo.username || customerInfo.chatId) && (
                        <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                            {customerInfo.firstName && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600 font-medium">Name:</span>
                                <span className="text-gray-900">{customerInfo.firstName} {customerInfo.lastName || ''}</span>
                              </div>
                            )}
                            {customerInfo.username && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-600 font-medium">Username:</span>
                                <span className="text-gray-900">@{customerInfo.username}</span>
                              </div>
                            )}
                            {customerInfo.chatId && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-600 font-medium">Chat ID:</span>
                                <span className="text-gray-900">{customerInfo.chatId}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Service & Time Info */}
                      {(serviceName || slotStart) && (
                        <div className="mt-2 space-y-1 text-xs">
                          {serviceName && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Sparkles className="w-3 h-3" />
                              <span className="font-medium">Service:</span>
                              <span className="text-gray-900">{serviceName}</span>
                            </div>
                          )}
                          {slotStart && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Calendar className="w-3 h-3" />
                              <span className="font-medium">Date:</span>
                              <span className="text-gray-900">
                                {new Date(slotStart).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                          {(slotStart && slotEnd) && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Clock className="w-3 h-3" />
                              <span className="font-medium">Time:</span>
                              <span className="text-gray-900">
                                {new Date(slotStart).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit'
                                })} - {new Date(slotEnd).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeAgo(notification.createdAt)}</span>
                    </div>
                    
                    <div className="flex space-x-1">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => archiveNotification(notification.id)}
                        className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                        title="Archive"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const unreadCount = stats?.unread || 0;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative w-8 h-8 sm:w-9 sm:h-9"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        {unreadCount > 0 && (
          <>
            <Badge className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] border-2 border-white animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full animate-ping" />
          </>
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col" side="right">
          <SheetHeader className="px-6 py-4 border-b bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-left">Notifications</SheetTitle>
                  {unreadCount > 0 && (
                    <SheetDescription className="text-left">
                      {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
                    </SheetDescription>
                  )}
                </div>
              </div>
              {unreadCount > 0 && (
                <Badge className="bg-indigo-600 text-white hover:bg-indigo-700">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </SheetHeader>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                <div className="mt-2 text-gray-500">Loading notifications...</div>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BellOff className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-sm text-gray-500 max-w-[200px]">
                  You're all caught up! Check back later for updates.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}
                className="flex-1 flex flex-col"
              >
                <div className="border-b bg-gray-50 px-4 pt-3 flex-shrink-0">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="all" className="relative">
                      All
                      <Badge
                        variant="outline"
                        className="ml-2 bg-white text-gray-600 border-gray-300"
                      >
                        {notifications.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="relative">
                      Unread
                      {unreadCount > 0 && (
                        <Badge className="ml-2 bg-indigo-600 text-white hover:bg-indigo-700">
                          {unreadCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-3 flex gap-2 border-b bg-gray-50">
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllAsRead}
                      className="flex-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear all
                  </Button>
                </div>

                {/* Notifications List */}
                <TabsContent value="all" className="flex-1 mt-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {renderNotificationGroup(today, "Today")}
                      {renderNotificationGroup(yesterday, "Yesterday")}
                      {renderNotificationGroup(earlier, "Earlier")}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="unread" className="flex-1 mt-0 overflow-hidden">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">All caught up!</h3>
                        <p className="text-sm text-gray-500 max-w-[200px]">
                          No unread notifications. Great job staying on top of things!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-4">
                        {renderNotificationGroup(today, "Today")}
                        {renderNotificationGroup(yesterday, "Yesterday")}
                        {renderNotificationGroup(earlier, "Earlier")}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
              </Tabs>

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
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
