import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Wrench, 
  Building2, 
  Bot, 
  Sparkles, 
  Settings,
  LogOut,
  Clock
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
  const { logout } = useAuth();
  const { events } = useWebSocket();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    totalServices: 0,
    totalAppointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load sidebar statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const dashboardStats = await apiClient.getDashboardStats();
        setStats({
          todayAppointments: dashboardStats.todayAppointments,
          weekAppointments: dashboardStats.weekAppointments,
          totalServices: dashboardStats.totalServices,
          totalAppointments: dashboardStats.totalAppointments
        });
      } catch (error) {
        console.error('Failed to load sidebar stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  // Handle real-time WebSocket events for live updates
  useEffect(() => {
    events.forEach(event => {
      if (event.type === 'appointment.created') {
        setStats(prev => ({
          ...prev,
          totalAppointments: prev.totalAppointments + 1,
          todayAppointments: prev.todayAppointments + 1,
          weekAppointments: prev.weekAppointments + 1
        }));
      } else if (event.type === 'appointment.cancelled') {
        setStats(prev => ({
          ...prev,
          totalAppointments: Math.max(0, prev.totalAppointments - 1),
          todayAppointments: Math.max(0, prev.todayAppointments - 1),
          weekAppointments: Math.max(0, prev.weekAppointments - 1)
        }));
      } else if (event.type === 'service.created') {
        setStats(prev => ({
          ...prev,
          totalServices: prev.totalServices + 1
        }));
      } else if (event.type === 'service.deleted') {
        setStats(prev => ({
          ...prev,
          totalServices: Math.max(0, prev.totalServices - 1)
        }));
      }
    });
  }, [events]);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
    { icon: Calendar, label: "Appointments", page: "appointments", badge: (stats.totalAppointments || 0).toString() },
    { icon: Wrench, label: "Services", page: "services", badge: (stats.totalServices || 0).toString() },
    { icon: Building2, label: "Organizations", page: "organizations" },
    { icon: Bot, label: "Bot Management", page: "bot-management", badge: "NEW", badgeVariant: "secondary" as const },
    { icon: Clock, label: "Slots", page: "slots" },
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          w-64 sm:w-72 bg-gradient-to-b from-[#5B4FE9] to-[#4338CA] 
          text-white transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isOpen ? 'fixed top-0 left-0 h-screen z-50' : 'lg:relative lg:z-auto lg:h-screen'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 sm:p-6 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="font-semibold text-sm sm:text-base">Appointments</h1>
                <p className="text-[10px] sm:text-xs text-white/70">Business Manager</p>
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
                  w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all
                  ${location.pathname === `/${item.page}`
                    ? 'bg-white/20 backdrop-blur-sm shadow-sm' 
                    : 'hover:bg-white/10'
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

          {/* Stats and Logout - Fixed at bottom */}
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-white/70">Today</p>
                <p className="text-xs sm:text-sm font-medium truncate">
                  {isLoading ? "..." : `${stats.todayAppointments || 0} appts`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-white/70">This Week</p>
                <p className="text-xs sm:text-sm font-medium truncate">
                  {isLoading ? "..." : `${stats.weekAppointments || 0} appts`}
                </p>
              </div>
            </div>
            
            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-white/10 rounded-lg transition-all"
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