import { 
  LayoutDashboard, 
  Calendar, 
  Wrench, 
  Building2, 
  Bot, 
  Sparkles, 
  Settings,
  LogOut,
  BarChart3,
  Shield,
  CheckCircle2
} from "lucide-react";
import { Badge } from "./ui/badge";
import { useWebSocket } from "../hooks/useWebSocket";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ isOpen, onClose, activePage, onNavigate, onLogout }: SidebarProps) {
  const { isConnected } = useWebSocket({ autoConnect: true });
  const isAdminLinked = false; // This should come from your auth state
  const isBotActive = false; // This should come from your bot state
  
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
    { icon: Calendar, label: "Appointments", page: "appointments", badge: "5" },
    { icon: Wrench, label: "Services", page: "services", badge: "3" },
    { icon: BarChart3, label: "Analytics", page: "analytics", badge: "NEW", badgeVariant: "secondary" as const },
    { icon: Building2, label: "Organizations", page: "organizations" },
    { icon: Bot, label: "Bot Management", page: "bot-management" },
    { icon: Sparkles, label: "AI Assistant", page: "ai", badge: "BETA", badgeVariant: "secondary" as const },
    { icon: Settings, label: "Settings", page: "settings" },
  ];

  const stats = [
    { label: "Today", value: "0 appts" },
    { label: "This Week", value: "5 appts" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-64 
          bg-gradient-to-b from-[#5B4FE9] to-[#4338CA] 
          dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950
          text-white z-50 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 dark:bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-semibold">Appointments</h1>
                <p className="text-xs text-white/70 dark:text-white/60">Business Manager</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.page);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${activePage === item.page
                    ? 'bg-white/20 dark:bg-white/10 backdrop-blur-sm shadow-sm' 
                    : 'hover:bg-white/10 dark:hover:bg-white/5'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left text-sm">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badgeVariant || "default"}
                    className={`
                      text-[10px] px-1.5 py-0 h-5
                      ${item.badgeVariant === 'secondary' 
                        ? 'bg-purple-400/90 text-white border-0' 
                        : 'bg-white/30 text-white border-0'
                      }
                    `}
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          {/* Stats & Status */}
          <div className="p-4 space-y-3">
            {/* Bot Status */}
            <div className="px-3 py-2.5 bg-white/10 dark:bg-white/5 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4" />
                <p className="text-xs font-medium">Bot Status</p>
              </div>
              <div className="flex items-center gap-2">
                {isBotActive ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-300 dark:text-emerald-400">Active & Running</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-400 dark:bg-red-500" />
                    <span className="text-xs text-red-300 dark:text-red-400">Inactive</span>
                  </>
                )}
              </div>
            </div>

            {/* Admin Status */}
            <div className="px-3 py-2.5 bg-white/10 dark:bg-white/5 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" />
                <p className="text-xs font-medium">Admin Status</p>
              </div>
              <div className="flex items-center gap-2">
                {isAdminLinked ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 dark:text-emerald-400" />
                    <span className="text-xs text-white/90 dark:text-white/80">Telegram Linked</span>
                  </>
                ) : (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-300 dark:border-amber-400" />
                    <span className="text-xs text-amber-200 dark:text-amber-300">Not Linked</span>
                  </>
                )}
              </div>
            </div>

            {stats.map((stat) => (
              <div 
                key={stat.label}
                className="flex items-center gap-3 px-3 py-2 bg-white/10 dark:bg-white/5 rounded-lg backdrop-blur-sm"
              >
                <Calendar className="w-4 h-4" />
                <div className="flex-1">
                  <p className="text-xs text-white/70 dark:text-white/60">{stat.label}</p>
                  <p className="text-sm font-medium">{stat.value}</p>
                </div>
              </div>
            ))}
            
            {/* Logout */}
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-all text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}