import { Moon, Sun, Globe, Bell, HelpCircle, Menu, Wifi, WifiOff, Settings, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState, useEffect } from "react";
import { NotificationPanel } from "./NotificationPanel";
import { useWebSocket } from "../hooks/useWebSocket";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface HeaderProps {
  onMenuClick: () => void;
  currentPage?: string;
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export function Header({ onMenuClick, currentPage = "dashboard", onLogout, onNavigate }: HeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // WebSocket connection for real-time updates
  const { isConnected, lastMessage } = useWebSocket({
    autoConnect: true,
    onMessage: (event) => {
      // Increment notification count when new events arrive
      setUnreadCount((prev) => prev + 1);
    },
  });

  // Dark mode toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Page help content
  const getPageHelp = () => {
    const helpContent: Record<string, { title: string; description: string; tips: string[] }> = {
      dashboard: {
        title: "Dashboard Overview",
        description: "Your central hub for managing appointments and monitoring business performance.",
        tips: [
          "View quick stats on appointments, bookings, and active services",
          "Check bot status and admin linking status",
          "Access quick actions to navigate to key sections",
          "Monitor today's appointments in the calendar view"
        ]
      },
      appointments: {
        title: "Appointments Management",
        description: "View, create, and manage all your client appointments in one place.",
        tips: [
          "Filter appointments by status, date, or service",
          "Create new appointments using the + button",
          "Click on any appointment to view details or make changes",
          "Export appointment data for reporting"
        ]
      },
      services: {
        title: "Services Management",
        description: "Configure and manage the services your business offers.",
        tips: [
          "Add new services with pricing and duration",
          "Organize services by categories",
          "Set service availability and booking rules",
          "Track which services are most popular"
        ]
      },
      organizations: {
        title: "Organizations",
        description: "Manage your business locations and organizational settings.",
        tips: [
          "Add multiple locations for your business",
          "Configure working hours for each location",
          "Set location-specific services and staff",
          "Manage contact information and addresses"
        ]
      },
      "bot-management": {
        title: "Bot Management",
        description: "Set up and configure your Telegram bot for appointment bookings.",
        tips: [
          "Follow the 3-step setup process to activate your bot",
          "Get your bot token from @BotFather on Telegram",
          "Link your admin Telegram account for management",
          "Test bot functionality before going live"
        ]
      },
      ai: {
        title: "AI Assistant",
        description: "Configure AI-powered automated responses for client inquiries.",
        tips: [
          "This is a PRO feature - upgrade to unlock",
          "AI already knows about your appointments and services",
          "Customize AI personality with custom instructions",
          "Test AI responses before enabling auto-reply mode"
        ]
      },
      analytics: {
        title: "Analytics",
        description: "Track business performance and gain insights from your data.",
        tips: [
          "Monitor appointment trends over time",
          "Analyze revenue and booking patterns",
          "Identify peak booking times",
          "Export reports for business planning"
        ]
      },
      settings: {
        title: "Settings",
        description: "Configure your account and system preferences.",
        tips: [
          "Update profile information and password",
          "Set notification preferences",
          "Configure business hours and timezone",
          "Manage API keys and integrations"
        ]
      }
    };

    return helpContent[currentPage] || {
      title: "Help & Instructions",
      description: "Learn how to use this section effectively.",
      tips: ["Navigate using the sidebar menu", "Use filters to find what you need", "Click on items to view details"]
    };
  };

  const pageHelp = getPageHelp();

  return (
    <>
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="flex items-center justify-between px-3 lg:px-6 py-2 lg:py-3 gap-2 lg:gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2 lg:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 flex-shrink-0"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
            
            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
              <div className="flex items-center gap-1.5 lg:gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 hidden sm:inline truncate">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 hidden sm:inline truncate">Offline</span>
                  </>
                )}
              </div>
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full" />
                <span>Live updates</span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Dark Mode Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex w-9 h-9 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              )}
            </Button>
            
            <Button variant="ghost" className="hidden md:flex h-9 px-3 gap-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Globe className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">EN</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative w-9 h-9"
              onClick={() => {
                setNotificationOpen(true);
                setUnreadCount(0); // Clear unread count when opening
              }}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <>
                  <Badge className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] border-2 border-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full animate-ping" />
                </>
              )}
            </Button>
            
            {/* Help Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex w-9 h-9 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setHelpOpen(true)}
            >
              <HelpCircle className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm text-gray-900 dark:text-gray-100">Vladi</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Demo City</p>
                  </div>
                  <Avatar className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 cursor-pointer">
                    <AvatarFallback className="bg-indigo-600 dark:bg-indigo-500 text-white text-sm">
                      V
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Vladi</p>
                    <p className="text-xs text-gray-500">vladi@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => onNavigate?.("settings")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => onNavigate?.("settings")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel
        open={notificationOpen}
        onOpenChange={setNotificationOpen}
      />

      {/* Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              {pageHelp.title}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {pageHelp.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-medium mb-3 text-gray-900">Key Features & Tips:</h4>
              <ul className="space-y-2.5">
                {pageHelp.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-indigo-600">{index + 1}</span>
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Need More Help?</p>
                  <p>
                    Check out our documentation or contact support for personalized assistance.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setHelpOpen(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Got It!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
