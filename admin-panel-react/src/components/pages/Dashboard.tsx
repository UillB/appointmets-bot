import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar as CalendarIcon, 
  Wrench, 
  Building2, 
  Settings,
  CalendarDays,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bot,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { QuickActionCard } from "../cards/QuickActionCard";
import { StatCard } from "../cards/StatCard";
import { AppointmentCard } from "../cards/AppointmentCard";
import { AppointmentsSummaryCard } from "../cards/AppointmentsSummaryCard";
import { PageHeader } from "../PageHeader";
import { toast } from "sonner";
import { apiClient } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useWebSocket } from "../../hooks/useWebSocket";
import { toastNotifications } from "../toast-notifications";
import { formatTimeToLocal, isSameDay } from "../../utils/dateUtils";

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

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events } = useWebSocket();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [organizationsCount, setOrganizationsCount] = useState(0);
  const [appointmentsStats, setAppointmentsStats] = useState({
    confirmed: 0,
    rejected: 0
  });
  const [botActive, setBotActive] = useState(false);
  const [adminLinked, setAdminLinked] = useState(false);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, appointmentsData, organizationsData, summaryStatsData, botStatusData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getAppointments({ limit: 100 }), // Load more appointments for calendar
        apiClient.getOrganizations(),
        apiClient.getAppointmentsSummaryStats().catch(() => ({ totalAppointments: 0, confirmedAppointments: 0, pendingAppointments: 0, rejectedAppointments: 0 })), // Use new endpoint
        user?.organizationId ? apiClient.getBotStatus(user.organizationId).catch(() => null) : Promise.resolve(null)
      ]);
      
      setStats(statsData);
      setRecentAppointments(appointmentsData.appointments);
      setOrganizationsCount(organizationsData.organizations.length);
      
      // Use summary stats from the new endpoint
      setAppointmentsStats({ 
        confirmed: summaryStatsData.confirmedAppointments, 
        rejected: summaryStatsData.rejectedAppointments 
      });
      
      // Update bot status
      if (botStatusData?.success && botStatusData.botStatus) {
        setBotActive(botStatusData.botStatus.botActive || botStatusData.botStatus.isActive || false);
        // Use adminLinked from botStatus or check user telegramId as fallback
        setAdminLinked(botStatusData.botStatus.adminLinked !== undefined ? botStatusData.botStatus.adminLinked : !!user?.telegramId);
      } else {
        setBotActive(false);
        setAdminLinked(false);
      }
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

  // Handle real-time WebSocket events for appointments
  useEffect(() => {
    if (events.length === 0) return;

    const latestEvent = events[0];
    
    if (latestEvent.type === 'appointment.created' || latestEvent.type === 'appointment_created') {
      // Show toast notification
      toastNotifications.appointments.created();
      
      // Reload dashboard data to get updated stats and appointments
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    } else if (latestEvent.type === 'appointment.updated' || latestEvent.type === 'appointment_updated') {
      toastNotifications.appointments.updated(latestEvent.data?.customerName);
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    } else if (latestEvent.type === 'appointment.cancelled' || latestEvent.type === 'appointment_cancelled') {
      toastNotifications.appointments.cancelled(latestEvent.data?.customerName);
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    } else if (latestEvent.type === 'appointment.confirmed' || latestEvent.type === 'appointment_confirmed') {
      toastNotifications.appointments.confirmed(latestEvent.data?.customerName);
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    }
  }, [events]);

  // Initialize filtered appointments when recentAppointments change
  useEffect(() => {
    if (selectedDate && recentAppointments.length > 0) {
      const filtered = recentAppointments.filter((apt: any) => {
        if (apt.slot?.startAt) {
          return isSameDay(new Date(apt.slot.startAt), selectedDate);
        }
        return false;
      });
      setFilteredAppointments(filtered);
    }
  }, [recentAppointments, selectedDate]);


  // Calendar functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    
    // Filter appointments for selected date
    const filtered = recentAppointments.filter((apt: any) => {
      if (apt.slot?.startAt) {
        return isSameDay(new Date(apt.slot.startAt), newDate);
      }
      return false;
    });
    setFilteredAppointments(filtered);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const hasAppointments = (day: number) => {
    if (!recentAppointments || recentAppointments.length === 0) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return recentAppointments.some((apt: any) => {
      if (apt.slot?.startAt) {
        return isSameDay(new Date(apt.slot.startAt), date);
      }
      return false;
    });
  };

  const quickActions = [
    {
      icon: CalendarIcon,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Appointments",
      description: "Manage bookings",
      badge: { text: `${stats?.todayAppointments || 0} today`, variant: "indigo" },
      onClick: () => navigate("/appointments")
    },
    {
      icon: Wrench,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Services",
      description: "Configure offerings",
      badge: { text: `${stats?.totalServices || 0} available`, variant: "" },
      onClick: () => navigate("/services")
    },
    {
      icon: Building2,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      title: "Organizations",
      description: "Manage locations",
      badge: { text: `${organizationsCount} active`, variant: "blue" },
      onClick: () => navigate("/organizations")
    },
    {
      icon: Settings,
      iconBg: "bg-gray-50",
      iconColor: "text-gray-600",
      title: "Settings",
      description: "System configuration",
      badge: { text: "Account" },
      onClick: () => navigate("/settings")
    }
  ];

  const statsData = stats ? [
    {
      icon: CalendarDays,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Total Appointments",
      value: stats.totalAppointments,
      subtitle: "all time",
      trend: stats.weekAppointments > 0 ? Math.round((stats.weekAppointments / Math.max(stats.totalAppointments, 1)) * 100) : 0
    },
    {
      icon: Clock,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      title: "Today's Bookings",
      value: stats.todayAppointments,
      subtitle: "Scheduled for today",
      trend: stats.todayAppointments > 0 ? Math.min(Math.round((stats.todayAppointments / Math.max(stats.weekAppointments, 1)) * 100), 100) : 0
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "Pending Approvals",
      value: stats.pendingAppointments,
      subtitle: "Awaiting confirmation",
      trend: stats.pendingAppointments > 0 ? Math.min(Math.round((stats.pendingAppointments / Math.max(stats.totalAppointments, 1)) * 100), 100) : 0
    },
    {
      icon: Sparkles,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Active Services",
      value: stats.totalServices,
      subtitle: "Available for booking",
      trend: stats.totalServices > 0 ? Math.min(Math.round((stats.totalServices / 10) * 100), 100) : 0
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bot Status Alerts */}
      {!botActive && (
        <Alert className="border-red-200 bg-red-50">
          <Bot className="h-5 w-5 text-red-600 flex-shrink-0" />
          <AlertDescription className="text-red-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <strong className="font-semibold">Telegram Bot Not Active</strong>
                <p className="text-sm mt-1">Your bot is not configured yet. Set it up to start receiving appointments through Telegram.</p>
              </div>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 flex-shrink-0 w-full sm:w-auto"
                onClick={() => navigate("/bot-management")}
              >
                Setup Bot
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {botActive && !adminLinked && (
        <Alert className="border-amber-200 bg-amber-50">
          <Shield className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <AlertDescription className="text-amber-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <strong className="font-semibold">Admin Account Not Linked</strong>
                <p className="text-sm mt-1">Complete the setup by linking your Telegram account as administrator.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 hover:bg-amber-100 flex-shrink-0 w-full sm:w-auto"
                onClick={() => navigate("/bot-management")}
              >
                Link Admin
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Section */}
      <div>
        <h1 className="text-gray-900 flex items-center gap-2">
          Welcome back, {user?.name || 'User'}! <span className="text-2xl">👋</span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">

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
                  onClick={action.onClick}
                />
              );
              return <QuickActionComponent key={action.title} />;
            })}
          </div>

          {/* Appointments Summary - Highlighted */}
          {stats && (
            <AppointmentsSummaryCard 
              totalAppointments={stats.totalAppointments}
              confirmedAppointments={appointmentsStats.confirmed}
              pendingAppointments={stats.pendingAppointments}
              rejectedAppointments={appointmentsStats.rejected}
            />
          )}

          {/* Statistics & Overview */}
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Statistics & Overview</h2>
            <Button variant="link" className="text-indigo-600 hover:text-indigo-700 p-0 h-auto">
              View All →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                    <span className="font-medium text-lg">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-gray-100"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-gray-100"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                    <div key={idx} className="text-center text-sm text-gray-500 py-2 font-medium">
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => {
                    const day = i + 1;
                    const hasAppts = hasAppointments(day);
                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={`
                          w-8 h-8 flex flex-col items-center justify-center text-sm rounded-md relative
                          transition-all duration-200 hover:scale-105
                          ${isToday(day)
                            ? "bg-indigo-600 text-white font-semibold shadow-md"
                            : isSelected(day)
                            ? "bg-indigo-100 text-indigo-700 font-semibold border-2 border-indigo-300"
                            : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                          }
                        `}
                      >
                        <span>{day}</span>
                        {hasAppts && (
                          <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                            isToday(day) ? "bg-white" : "bg-indigo-600"
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected date info */}
                {selectedDate && (
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-900">
                        Selected: {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Selected Date Appointments */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-gray-900">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                  </h3>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 text-sm whitespace-nowrap">
                  New Appointment
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment: any, idx) => {
                    const AppointmentComponent = () => (
                      <AppointmentCard 
                        appointment={appointment}
                        clientName={`Chat ID: ${appointment.chatId || 'Unknown'}`}
                        clientId={appointment.chatId || 'N/A'}
                        time={appointment.slot?.startAt ? formatTimeToLocal(appointment.slot.startAt) : 'N/A'}
                        status={appointment.status}
                      />
                    );
                    return <AppointmentComponent key={idx} />;
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No appointments for selected date</p>
                    <p className="text-sm">Click on a date in the calendar to view appointments</p>
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
