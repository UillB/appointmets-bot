import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Wrench, 
  Building2, 
  Settings,
  CalendarDays,
  Clock,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  RefreshCw,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { QuickActionCard } from "./QuickActionCard";
import { StatCard } from "./StatCard";
import { AppointmentCard } from "./AppointmentCard";
import { toast } from "sonner";
import { apiClient } from "../services/api";
import { useAuth } from "../hooks/useAuth";

interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  weekAppointments: number;
  pendingAppointments: number;
  totalServices: number;
  activeServices: number;
  totalRevenue: number;
  todayRevenue: number;
}

export function SimpleDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, appointmentsData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getAppointments({ limit: 5 })
      ]);
      
      setStats(statsData);
      setRecentAppointments(appointmentsData.appointments);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    loadDashboardData();
    toast.success("Dashboard refreshed");
  };

  const quickActions = [
    {
      icon: CalendarIcon,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Appointments",
      description: "Manage bookings",
      badge: { text: `${stats?.todayAppointments || 0} today`, variant: "indigo" }
    },
    {
      icon: Wrench,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Services",
      description: "Configure offerings",
      badge: { text: `${stats?.totalServices || 0} available`, variant: "" }
    },
    {
      icon: Building2,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      title: "Organizations",
      description: "Manage locations",
      badge: { text: "3 active", variant: "blue" }
    },
    {
      icon: Settings,
      iconBg: "bg-gray-50",
      iconColor: "text-gray-600",
      title: "Settings",
      description: "System configuration",
      badge: { text: "Account" }
    }
  ];

  const statsData = stats ? [
    {
      icon: CalendarDays,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Total Appointments",
      value: stats.totalAppointments,
      subtitle: "for this week",
      trend: 12
    },
    {
      icon: Clock,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      title: "Today's Bookings",
      value: stats.todayAppointments,
      subtitle: "Scheduled for today",
      trend: 0
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "Pending Approvals",
      value: stats.pendingAppointments,
      subtitle: "Awaiting confirmation",
      trend: 0
    },
    {
      icon: Sparkles,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Active Services",
      value: stats.totalServices,
      subtitle: "Available for booking",
      trend: 0
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-4 lg:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-indigo-100">Loading...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-indigo-100">Welcome back, {user?.name}!</p>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-gray-900 flex items-center gap-2">
              Welcome back, {user?.name}! <span className="text-2xl">👋</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const QuickActionComponent = () => (
                <QuickActionCard 
                  icon={action.icon}
                  iconBg={action.iconBg}
                  iconColor={action.iconColor}
                  title={action.title}
                  description={action.description}
                  badge={action.badge}
                />
              );
              return <QuickActionComponent key={action.title} />;
            })}
          </div>

          {/* Statistics & Overview */}
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Statistics & Overview</h2>
            <Button variant="link" className="text-indigo-600 hover:text-indigo-700 p-0 h-auto">
              View All →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => {
              const StatComponent = () => (
                <StatCard 
                  icon={stat.icon}
                  iconBg={stat.iconBg}
                  iconColor={stat.iconColor}
                  title={stat.title}
                  value={stat.value}
                  subtitle={stat.subtitle}
                  trend={stat.trend}
                />
              );
              return <StatComponent key={stat.title} />;
            })}
          </div>

          {/* Calendar and Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                <h3 className="text-gray-900">Calendar</h3>
              </div>

              <div className="space-y-4">
                {/* Month selector */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Headers */}
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                    <div key={idx} className="text-center text-sm text-gray-500 py-2">
                      {day}
                    </div>
                  ))}

                  {/* Month label */}
                  <div className="col-span-7 text-xs text-gray-500 font-medium py-1">
                    {new Date().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                  </div>

                  {/* Days */}
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((day, idx) => (
                    <button
                      key={idx}
                      className={`
                        aspect-square flex items-center justify-center text-sm rounded-lg
                        transition-colors
                        ${day === new Date().getDate() 
                          ? "bg-indigo-600 text-white" 
                          : "hover:bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Today's Appointments */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-gray-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 text-sm whitespace-nowrap">
                  New Appointment
                </Button>
              </div>

              <div className="space-y-2">
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((appointment: any, idx) => {
                    const AppointmentComponent = () => (
                      <AppointmentCard 
                        clientName={appointment.clientName || 'Unknown Client'}
                        clientId={appointment.clientPhone || 'N/A'}
                        time={appointment.slot?.startAt ? new Date(appointment.slot.startAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                        status={appointment.status}
                      />
                    );
                    return <AppointmentComponent key={idx} />;
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No appointments today</p>
                    <p className="text-sm">Appointments will appear here once they're created</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
