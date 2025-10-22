import { useState, useEffect } from "react";
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
  RefreshCw,
} from "lucide-react";
import { QuickActionCard } from "./QuickActionCard";
import { StatCard } from "./StatCard";
import { AppointmentCard } from "./AppointmentCard";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";
import { apiClient } from "../services/api";
import { useAuth } from "../hooks/useAuth";

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  totalServices: number;
  totalOrganizations: number;
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState([]);

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
      icon: Calendar,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Appointments",
      description: "Manage bookings",
      badge: { text: `${stats?.pendingAppointments || 0} pending`, variant: "indigo" }
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
      badge: { text: `${stats?.totalOrganizations || 0} active`, variant: "blue" }
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
      subtitle: "all time",
      trend: 0
    },
    {
      icon: Clock,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      title: "Pending Appointments",
      value: stats.pendingAppointments,
      subtitle: "awaiting confirmation",
      trend: 0
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Confirmed Appointments",
      value: stats.confirmedAppointments,
      subtitle: "confirmed bookings",
      trend: 0
    },
    {
      icon: Sparkles,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Active Services",
      value: stats.totalServices,
      subtitle: "available for booking",
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
              <p className="text-indigo-100">Welcome back, {user?.name}! Here's what's happening.</p>
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
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="p-4 lg:p-6 bg-white">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg">Quick Actions</h3>
                  <p className="text-sm text-gray-500">Common tasks and shortcuts</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <QuickActionCard key={index} {...action} />
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Appointments */}
          <Card className="p-4 lg:p-6 bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg">Recent Appointments</h3>
                    <p className="text-sm text-gray-500">Latest booking activity</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((appointment: any, index: number) => (
                    <AppointmentCard key={index} {...appointment} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No appointments yet</p>
                    <p className="text-sm">Appointments will appear here once they're created</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}