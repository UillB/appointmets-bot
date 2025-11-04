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
import { AppointmentCard } from "./AppointmentCard";
import { AppointmentsSummaryCard } from "./AppointmentsSummaryCard";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { toastNotifications } from "./toast-notifications";
import { useState } from "react";

export function Dashboard() {
  // Mock bot status - в реальном приложении будет из API/state
  const [botActive, setBotActive] = useState(false);
  const [adminLinked, setAdminLinked] = useState(false);

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
      value: 5,
      subtitle: "for this week",
      trend: 12
    },
    {
      icon: Clock,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      title: "Today's Bookings",
      value: 0,
      subtitle: "Scheduled for today",
      trend: 0
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "Pending Approvals",
      value: 0,
      subtitle: "Awaiting confirmation",
      trend: 0
    },
    {
      icon: Sparkles,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Active Services",
      value: 3,
      subtitle: "Available for booking",
      trend: 0
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
        <h1 className="text-gray-900 flex items-center gap-2">
          Welcome back, Vladi! <span className="text-2xl">👋</span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">Tuesday, November 4, 2025</p>
      </div>

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
      <Card className="p-4 bg-purple-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-purple-900">Demo Controls</p>
            <p className="text-sm text-purple-700">Toggle bot status for testing</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBotActive(!botActive)}
              className="border-purple-300"
            >
              Bot: {botActive ? "Active" : "Inactive"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAdminLinked(!adminLinked)}
              className="border-purple-300"
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
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <QuickActionCard key={action.title} {...action} />
        ))}
      </div>

      {/* Statistics & Overview */}
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Statistics & Overview</h2>
        <Button variant="link" className="text-indigo-600 hover:text-indigo-700 p-0 h-auto">
          View All →
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
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
                <span className="font-medium">OCT 2025</span>
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

              {/* OCT label */}
              <div className="col-span-7 text-xs text-gray-500 font-medium py-1">
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
                      ? "bg-indigo-600 text-white" 
                      : "hover:bg-gray-100 text-gray-700"
                    }
                  `}
                >
                  {day.date}
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
              <h3 className="text-gray-900">Wednesday, October 22</h3>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 text-sm whitespace-nowrap">
              New Appointment
            </Button>
          </div>

          <div className="space-y-2">
            {appointments.map((apt, idx) => (
              <AppointmentCard key={idx} {...apt} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}