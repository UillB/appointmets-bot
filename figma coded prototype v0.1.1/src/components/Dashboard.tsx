import { 
  Calendar, 
  Wrench, 
  Building2, 
  Settings,
  CalendarDays,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Bot,
  AlertCircle,
  ArrowRight,
  Shield,
} from "lucide-react";
import { QuickActionCard } from "./QuickActionCard";
import { StatCard } from "./StatCard";
import { MobileStatCard } from "./MobileStatCard";
import { AppointmentCard } from "./AppointmentCard";
import { AppointmentsSummaryCard } from "./AppointmentsSummaryCard";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { toastNotifications } from "./toast-notifications";
import { useState, useEffect } from "react";

export function Dashboard() {
  // Mock bot status - в реальном приложении будет из API/state
  const [botActive, setBotActive] = useState(false);
  const [adminLinked, setAdminLinked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRefresh = () => {
    toastNotifications.system.refreshed("Dashboard");
  };

  const quickActions = [
    {
      icon: Calendar,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Appointments",
      description: "Manage bookings",
      badge: { text: "5 today", variant: "indigo" }
    },
    {
      icon: Wrench,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Services",
      description: "Configure offerings",
      badge: { text: "8 available", variant: "" }
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

  const stats = [
    {
      icon: CalendarDays,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Total Appointments",
      value: 156,
      subtitle: "All time records"
    },
    {
      icon: Clock,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      title: "This Week",
      value: 5,
      subtitle: "Scheduled this week"
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Confirmed",
      value: 124,
      subtitle: "Successfully confirmed"
    },
    {
      icon: Sparkles,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Active Services",
      value: 8,
      subtitle: "Available for booking"
    }
  ];

  const appointments = [
    {
      clientName: "Test One",
      clientId: "282836139",
      time: "17:00",
      status: "cancelled" as const
    },
    {
      clientName: "Test One",
      clientId: "282836139",
      time: "16:00",
      status: "confirmed" as const
    },
    {
      clientName: "Test One",
      clientId: "282836139",
      time: "15:30",
      status: "confirmed" as const
    }
  ];

  const calendarDays = [
    { date: 1, active: false },
    { date: 2, active: false },
    { date: 3, active: false },
    { date: 4, active: false },
    { date: 5, active: false },
    { date: 6, active: false },
    { date: 7, active: false },
    { date: 8, active: false },
    { date: 9, active: false },
    { date: 10, active: false },
    { date: 11, active: false }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
          Welcome back, Vladi! <span className="text-2xl">👋</span>
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tuesday, November 4, 2025</p>
      </div>

      {/* Bot Status Alerts */}
      {!botActive && (
        <Alert className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
          <Bot className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <AlertDescription className="text-red-900 dark:text-red-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <strong className="font-semibold dark:text-red-50">Telegram Bot Not Active</strong>
                <p className="text-sm mt-1 dark:text-red-100">Your bot is not configured yet. Set it up to start receiving appointments through Telegram.</p>
              </div>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 flex-shrink-0 w-full sm:w-auto"
                onClick={() => {
                  // В реальном приложении будет навигация
                  window.location.hash = '#/bot-management';
                }}
              >
                Setup Bot
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {botActive && !adminLinked && (
        <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950">
          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <AlertDescription className="text-amber-900 dark:text-amber-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <strong className="font-semibold dark:text-amber-50">Admin Account Not Linked</strong>
                <p className="text-sm mt-1 dark:text-amber-100">Complete the setup by linking your Telegram account as administrator.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900 dark:text-amber-100 flex-shrink-0 w-full sm:w-auto"
                onClick={() => {
                  window.location.hash = '#/bot-management';
                }}
              >
                Link Admin
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Demo Toggle - Remove in production */}
      <Card className="p-4 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-purple-900 dark:text-purple-100">Demo Controls</p>
            <p className="text-sm text-purple-700 dark:text-purple-300">Toggle bot status for testing</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBotActive(!botActive)}
              className="border-purple-300 dark:border-purple-700 dark:text-purple-100"
            >
              Bot: {botActive ? "Active" : "Inactive"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAdminLinked(!adminLinked)}
              className="border-purple-300 dark:border-purple-700 dark:text-purple-100"
              disabled={!botActive}
            >
              Admin: {adminLinked ? "Linked" : "Not Linked"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Appointments Summary - Highlighted */}
      <AppointmentsSummaryCard 
        totalAppointments={156}
        confirmedAppointments={124}
        pendingAppointments={18}
        rejectedAppointments={14}
        botActive={botActive}
        adminLinked={adminLinked}
      />

      {/* Quick Actions - скрываем на мобильных */}
      {!isMobile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} {...action} />
          ))}
        </div>
      )}

      {/* Statistics & Overview */}
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900 dark:text-gray-100">{isMobile ? "Today's Stats" : "Statistics & Overview"}</h2>
        {!isMobile && (
          <Button variant="link" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-0 h-auto">
            View All →
          </Button>
        )}
      </div>

      {/* Мобильная версия - компактные карточки в 2 колонки */}
      {isMobile ? (
        <div className="grid grid-cols-2 gap-3">
          {stats.slice(0, 4).map((stat) => (
            <MobileStatCard key={stat.title} {...stat} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      )}

      {/* Calendar and Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar - скрываем на мобильных */}
        {!isMobile && (
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-gray-900 dark:text-gray-100">Calendar</h3>
          </div>

          <div className="space-y-4">
            {/* Month selector */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">OCT 2025</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </Button>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Headers */}
              {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                <div key={idx} className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}

              {/* OCT label */}
              <div className="col-span-7 text-xs text-gray-500 dark:text-gray-400 font-medium py-1">
                OCT
              </div>

              {/* Days */}
              {calendarDays.map((day, idx) => (
                <button
                  key={idx}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg
                    transition-colors
                    ${day.active 
                      ? "bg-indigo-600 dark:bg-indigo-500 text-white" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }
                  `}
                >
                  {day.date}
                </button>
              ))}
            </div>
          </div>
        </Card>
        )}

        {/* Today's Appointments - на мобильных на всю ширину */}
        <Card className={`p-4 lg:p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 ${isMobile ? 'col-span-1' : ''}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 lg:mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base lg:text-lg text-gray-900 dark:text-gray-100">{isMobile ? "Today" : "Wednesday, October 22"}</h3>
            </div>
            {!isMobile && (
              <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white h-8 px-3 text-sm whitespace-nowrap">
                New Appointment
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {appointments.slice(0, isMobile ? 3 : appointments.length).map((apt, idx) => (
              <AppointmentCard key={idx} {...apt} compact={isMobile} />
            ))}
          </div>

          {/* На мобильных показываем кнопку "See All" */}
          {isMobile && appointments.length > 3 && (
            <Button 
              variant="ghost" 
              className="w-full mt-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              See all {appointments.length} appointments →
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}