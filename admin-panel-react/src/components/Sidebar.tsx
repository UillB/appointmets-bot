import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Wrench, 
  BarChart3,
  Building2, 
  Bot, 
  Sparkles, 
  Settings,
  LogOut,
  Clock,
  Shield,
  CheckCircle2
} from "lucide-react";
import { Badge } from "./ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ isOpen, onClose, activePage, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { events } = useWebSocket();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    totalServices: 0,
    totalAppointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminLinked, setIsAdminLinked] = useState(false);

  // Load sidebar statistics and admin status
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const [dashboardStats, botStatusData] = await Promise.all([
          apiClient.getDashboardStats(),
          user?.organizationId ? apiClient.getBotStatus(user.organizationId).catch(() => null) : Promise.resolve(null)
        ]);
        
        setStats({
          todayAppointments: dashboardStats.todayAppointments,
          weekAppointments: dashboardStats.weekAppointments,
          totalServices: dashboardStats.totalServices,
          totalAppointments: dashboardStats.totalAppointments
        });

        // Check admin link status
        if (botStatusData?.success && botStatusData.botStatus) {
          setIsAdminLinked(botStatusData.botStatus.adminLinked !== undefined ? botStatusData.botStatus.adminLinked : !!user?.telegramId);
        } else {
          setIsAdminLinked(!!user?.telegramId);
        }
      } catch (error) {
        console.error('Failed to load sidebar stats:', error);
        // Fallback to user telegramId
        setIsAdminLinked(!!user?.telegramId);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user]);

  // Handle real-time WebSocket events for live updates
  useEffect(() => {
    if (events.length === 0) return;

    // Process only the latest events to avoid duplicates
    const latestEvent = events[0];
    
    if (latestEvent.type === 'appointment.created' || latestEvent.type === 'appointment_created') {
      setStats(prev => ({
        ...prev,
        totalAppointments: prev.totalAppointments + 1,
        todayAppointments: prev.todayAppointments + 1,
        weekAppointments: prev.weekAppointments + 1
      }));
      // Reload stats to get accurate data
      setTimeout(() => {
        apiClient.getDashboardStats().then(data => {
          setStats(prev => ({
            ...prev,
            totalAppointments: data.totalAppointments,
            todayAppointments: data.todayAppointments,
            weekAppointments: data.weekAppointments
          }));
        }).catch(console.error);
      }, 500);
    } else if (latestEvent.type === 'appointment.cancelled' || latestEvent.type === 'appointment_cancelled') {
      setStats(prev => ({
        ...prev,
        totalAppointments: Math.max(0, prev.totalAppointments - 1),
        todayAppointments: Math.max(0, prev.todayAppointments - 1),
        weekAppointments: Math.max(0, prev.weekAppointments - 1)
      }));
      // Reload stats to get accurate data
      setTimeout(() => {
        apiClient.getDashboardStats().then(data => {
          setStats(prev => ({
            ...prev,
            totalAppointments: data.totalAppointments,
            todayAppointments: data.todayAppointments,
            weekAppointments: data.weekAppointments
          }));
        }).catch(console.error);
      }, 500);
    } else if (latestEvent.type === 'service.created' || latestEvent.type === 'service_created') {
      setStats(prev => ({
        ...prev,
        totalServices: prev.totalServices + 1
      }));
      // Reload stats to get accurate data
      setTimeout(() => {
        apiClient.getDashboardStats().then(data => {
          setStats(prev => ({
            ...prev,
            totalServices: data.totalServices
          }));
        }).catch(console.error);
      }, 500);
    } else if (latestEvent.type === 'service.deleted' || latestEvent.type === 'service_deleted') {
      setStats(prev => ({
        ...prev,
        totalServices: Math.max(0, prev.totalServices - 1)
      }));
      // Reload stats to get accurate data
      setTimeout(() => {
        apiClient.getDashboardStats().then(data => {
          setStats(prev => ({
            ...prev,
            totalServices: data.totalServices
          }));
        }).catch(console.error);
      }, 500);
    }
  }, [events]);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
    { icon: Calendar, label: "Appointments", page: "appointments", badge: (stats.totalAppointments || 0).toString() },
    { icon: Wrench, label: "Services", page: "services", badge: (stats.totalServices || 0).toString() },
    { icon: BarChart3, label: "Analytics", page: "analytics" },
    { icon: Building2, label: "Organizations", page: "organizations" },
    { icon: Bot, label: "Bot Management", page: "bot-management", badge: "NEW", badgeVariant: "secondary" as const },
    { icon: Sparkles, label: "AI Assistant", page: "ai", badge: "BETA", badgeVariant: "secondary" as const },
    { icon: Settings, label: "Settings", page: "settings" },
  ];

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      logout();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - fixed on mobile (overlay), relative on desktop (in flow) */}
      <aside 
        className={`
          w-64 sm:w-72 
          bg-gradient-to-b from-[#5B4FE9] to-[#4338CA] 
          dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950
          text-white transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative
          top-0 left-0 h-screen z-50 lg:z-auto
          lg:flex-shrink-0
          ${!isOpen ? 'pointer-events-none lg:pointer-events-auto' : ''}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 sm:p-6 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 dark:bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="font-semibold text-sm sm:text-base">Appointments</h1>
                <p className="text-[10px] sm:text-xs text-white/70 dark:text-white/60">Business Manager</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 sm:px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(`/${item.page}`);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all cursor-pointer
                  ${location.pathname === `/${item.page}`
                    ? 'bg-white/20 dark:bg-white/10 backdrop-blur-sm shadow-sm' 
                    : 'hover:bg-white/10 dark:hover:bg-white/5'
                  }
                `}
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="flex-1 text-left text-xs sm:text-sm">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badgeVariant || "default"}
                    className={`
                      text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-4 sm:h-5
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

          {/* Stats & Status - Fixed at bottom */}
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-shrink-0">
            {/* Admin Status */}
            <div className="px-2 sm:px-3 py-2 sm:py-2.5 bg-white/10 dark:bg-white/5 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <p className="text-[10px] sm:text-xs font-medium">Admin Status</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isAdminLinked ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs text-white/90 dark:text-white/80">Telegram Linked</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-amber-300 dark:border-amber-400 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs text-amber-200 dark:text-amber-300">Not Linked</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 dark:bg-white/5 rounded-lg backdrop-blur-sm">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-white/70 dark:text-white/60">Today</p>
                <p className="text-xs sm:text-sm font-medium truncate">
                  {isLoading ? "..." : `${stats.todayAppointments || 0} appts`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 dark:bg-white/5 rounded-lg backdrop-blur-sm">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-white/70 dark:text-white/60">This Week</p>
                <p className="text-xs sm:text-sm font-medium truncate">
                  {isLoading ? "..." : `${stats.weekAppointments || 0} appts`}
                </p>
              </div>
            </div>
            
            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}