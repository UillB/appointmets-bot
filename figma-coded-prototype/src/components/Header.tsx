import { Moon, Globe, Bell, HelpCircle, Menu, Wifi, WifiOff, Settings, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState } from "react";
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

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  
  // WebSocket connection for real-time updates
  const { isConnected, lastMessage } = useWebSocket({
    autoConnect: true,
    onMessage: (event) => {
      // Increment notification count when new events arrive
      setUnreadCount((prev) => prev + 1);
    },
  });

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-4">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-sm text-gray-700">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-sm text-gray-700">Offline</span>
                  </>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>Live updates</span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="hidden md:flex w-9 h-9">
              <Moon className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" className="hidden md:flex h-9 px-3 gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">EN</span>
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
            
            <Button variant="ghost" size="icon" className="hidden sm:flex w-9 h-9">
              <HelpCircle className="w-4 h-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 hover:opacity-80 transition-opacity">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm">Vladi</p>
                    <p className="text-xs text-gray-500">Demo City</p>
                  </div>
                  <Avatar className="w-8 h-8 bg-indigo-600 cursor-pointer">
                    <AvatarFallback className="bg-indigo-600 text-white text-sm">
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
                <DropdownMenuItem className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
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
    </>
  );
}
