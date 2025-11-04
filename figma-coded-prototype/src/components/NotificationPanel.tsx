import { useState } from "react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  Clock,
  Users,
  Sparkles,
  Bell,
  BellOff,
  Settings2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category?: "appointment" | "service" | "system" | "user";
}

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPanel({
  open,
  onOpenChange,
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "New Appointment Booked",
      message: "John Doe booked Haircut & Styling for Oct 25 at 10:00 AM",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
      read: false,
      category: "appointment",
    },
    {
      id: "2",
      type: "info",
      title: "Service Updated",
      message: "Therapeutic Massage service details have been updated",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      read: false,
      category: "service",
    },
    {
      id: "3",
      type: "warning",
      title: "Low Slot Availability",
      message: "Only 3 slots remaining for Medical Consultation this week",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      category: "system",
    },
    {
      id: "4",
      type: "success",
      title: "Appointment Confirmed",
      message: "Emma Wilson confirmed her appointment for Oct 24 at 2:00 PM",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
      category: "appointment",
    },
    {
      id: "5",
      type: "error",
      title: "Appointment Cancelled",
      message: "Sarah Parker cancelled Dental Checkup on Oct 23",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      category: "appointment",
    },
    {
      id: "6",
      type: "info",
      title: "New User Registered",
      message: "Michael Brown joined your organization",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      category: "user",
    },
    {
      id: "7",
      type: "success",
      title: "Slots Generated",
      message: "Successfully generated 120 slots for next week",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      read: true,
      category: "system",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    toast.success("Notification deleted");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString("en-US", {
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
      if (notif.timestamp >= todayStart) {
        today.push(notif);
      } else if (notif.timestamp >= yesterdayStart) {
        yesterday.push(notif);
      } else {
        earlier.push(notif);
      }
    });

    return { today, yesterday, earlier };
  };

  const { today, yesterday, earlier } = groupNotificationsByDate(
    filteredNotifications
  );

  const getNotificationIcon = (notification: Notification) => {
    if (notification.category === "appointment") {
      return <Calendar className="w-5 h-5" />;
    }
    if (notification.category === "service") {
      return <Sparkles className="w-5 h-5" />;
    }
    if (notification.category === "user") {
      return <Users className="w-5 h-5" />;
    }

    switch (notification.type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationStyles = (notification: Notification) => {
    const styles = {
      success: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: "text-emerald-600",
        unreadBg: "bg-emerald-100",
      },
      error: {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: "text-red-600",
        unreadBg: "bg-red-100",
      },
      warning: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: "text-amber-600",
        unreadBg: "bg-amber-100",
      },
      info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "text-blue-600",
        unreadBg: "bg-blue-100",
      },
    };

    return styles[notification.type];
  };

  const renderNotificationGroup = (
    notifications: Notification[],
    title: string
  ) => {
    if (notifications.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => {
            const styles = getNotificationStyles(notification);
            return (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
                className={`relative group rounded-lg border transition-all cursor-pointer ${
                  notification.read
                    ? "bg-white border-gray-200 hover:bg-gray-50"
                    : `${styles.bg} ${styles.border} hover:shadow-sm`
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                {!notification.read && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-600 rounded-full"
                  />
                )}

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        notification.read
                          ? "bg-gray-100 text-gray-400"
                          : `${styles.unreadBg} ${styles.icon}`
                      }`}
                    >
                      {getNotificationIcon(notification)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4
                          className={`font-medium text-sm ${
                            notification.read ? "text-gray-700" : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="w-4 h-4 text-indigo-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <p
                        className={`text-sm mb-2 line-clamp-2 ${
                          notification.read ? "text-gray-500" : "text-gray-700"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(notification.timestamp)}</span>
                        {notification.category && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{notification.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
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

        {notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <BellOff className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                No notifications
              </h3>
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
              onValueChange={(v) => setActiveTab(v as "all" | "unread")}
              className="flex-1 flex flex-col"
            >
              <div className="border-b bg-gray-50 px-4 pt-3">
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
                  <div className="p-4 space-y-6">
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
                      <h3 className="font-medium text-gray-900 mb-2">
                        All caught up!
                      </h3>
                      <p className="text-sm text-gray-500 max-w-[200px]">
                        No unread notifications. Great job staying on top of things!
                      </p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-6">
                      {renderNotificationGroup(today, "Today")}
                      {renderNotificationGroup(yesterday, "Yesterday")}
                      {renderNotificationGroup(earlier, "Earlier")}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
