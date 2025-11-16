import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Wrench,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
} from "lucide-react";
import { PageTitle } from "../PageTitle";
import { StatCard } from "../cards/StatCard";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toastNotifications } from "../toast-notifications";
import { apiClient } from "../../services/api";
import { useTheme } from "../../hooks/useTheme";

export function AnalyticsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">("week");
  const [selectedMetric, setSelectedMetric] = useState("appointments");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getAnalytics({ timePeriod });
      setAnalyticsData(data);
    } catch (err: any) {
      console.error("Error loading analytics:", err);
      setError(err.message || "Failed to load analytics");
      toastNotifications.errors.loadFailed("Analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timePeriod]);

  const handleRefresh = () => {
    loadAnalytics();
    toastNotifications.system.refreshed("Analytics");
  };

  const handleExport = () => {
    toastNotifications.system.exported("Analytics report");
  };

  // Prepare data from analytics
  const stats: Array<{
    icon: typeof Calendar;
    iconBg: string;
    iconColor: string;
    title: string;
    value: string | number;
    subtitle: string;
    trend: number;
  }> = analyticsData ? [
    {
      icon: Calendar,
      iconBg: "bg-blue-50 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      title: "Total Bookings",
      value: (analyticsData.totalAppointments || 0) as string | number,
      subtitle: `This ${timePeriod}`,
      trend: analyticsData.growthRate || 0,
    },
    {
      icon: TrendingUp,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      title: "Growth Rate",
      value: `${analyticsData.growthRate >= 0 ? '+' : ''}${analyticsData.growthRate || 0}%`,
      subtitle: `vs last ${timePeriod}`,
      trend: analyticsData.growthRate || 0,
    },
    {
      icon: Users,
      iconBg: "bg-purple-50 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      title: "Active Clients",
      value: (analyticsData.activeClients || 0) as string | number,
      subtitle: "Unique clients",
      trend: 0,
    },
    {
      icon: Clock,
      iconBg: "bg-amber-50 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      title: "Avg. Duration",
      value: `${analyticsData.averageDuration || 0}m`,
      subtitle: "Per appointment",
      trend: 0,
    },
  ] : [];

  // Appointments over time data
  const appointmentsData = analyticsData?.dailyBookings?.map((item: any) => ({
    day: item.dayShort || item.day || "",
    appointments: item.appointments || item.bookings || 0,
    revenue: item.revenue || 0,
  })) || [];

  // Top services data with colors
  const serviceColors = ["#4F46E5", "#7C3AED", "#2563EB", "#0891B2", "#EC4899", "#F59E0B"];
  const servicesData = analyticsData?.topServices?.slice(0, 4).map((service: any, index: number) => ({
    name: service.serviceName,
    bookings: service.bookings || 0,
    color: serviceColors[index % serviceColors.length],
  })) || [];

  // Peak hours data
  const peakHoursData = analyticsData?.peakHours?.map((item: any) => ({
    hour: item.hourLabel,
    bookings: item.bookings || 0,
  })) || [];

  // Status distribution with colors
  const statusColors: Record<string, string> = {
    "Confirmed": "#10B981",
    "Pending": "#F59E0B",
    "Cancelled": "#EF4444",
  };
  const statusData = analyticsData?.statusDistribution?.map((status: any) => ({
    name: status.name,
    value: status.value || 0,
    color: statusColors[status.name] || "#6B7280",
    count: status.count || 0,
  })) || [];

  // Quick insights
  const insights = analyticsData?.insights || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadAnalytics}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 py-6" style={{ animation: 'none', transition: 'none' }}>
          {/* Page Title */}
          <PageTitle
            icon={<BarChart3 className="w-6 h-6 text-white" />}
            title="Analytics"
            description="Track performance and insights"
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="hidden sm:flex"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="hidden sm:flex"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </>
            }
          />

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              // @ts-expect-error - key is a React prop, not part of StatCardProps
              <StatCard
                key={stat.title}
                icon={stat.icon}
                iconBg={stat.iconBg}
                iconColor={stat.iconColor}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                trend={stat.trend}
              />
            ))}
          </div>

          {/* Time Period Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-gray-900 dark:text-gray-100">Performance Overview</h3>
            <Tabs value={timePeriod} onValueChange={setTimePeriod}>
              <TabsList className="bg-gray-100 dark:bg-gray-800">
                <TabsTrigger
                  value="week"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  Week
                </TabsTrigger>
                <TabsTrigger
                  value="month"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  Month
                </TabsTrigger>
                <TabsTrigger
                  value="year"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  Year
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Appointments Trend */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-gray-900 dark:text-gray-100 mb-1">Appointments Trend</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Daily bookings over time</p>
              </div>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointments">Appointments</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={appointmentsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#E5E7EB"} />
                  <XAxis
                    dataKey="day"
                    stroke={isDark ? "#9CA3AF" : "#6B7280"}
                    style={{ fontSize: "12px", fill: isDark ? "#D1D5DB" : "#6B7280" }}
                  />
                  <YAxis stroke={isDark ? "#9CA3AF" : "#6B7280"} style={{ fontSize: "12px", fill: isDark ? "#D1D5DB" : "#6B7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1F2937" : "#fff",
                      border: isDark ? "1px solid #374151" : "1px solid #E5E7EB",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      color: isDark ? "#F9FAFB" : "#111827",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={selectedMetric === "appointments" ? "appointments" : "revenue"}
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={{ fill: "#4F46E5", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Services */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="mb-6">
                <h3 className="text-gray-900 dark:text-gray-100 mb-1">Top Services</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Most popular services</p>
              </div>

              <div className="space-y-4">
                {servicesData.map((service, index) => (
                  <div key={service.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{service.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{service.bookings} bookings</p>
                        </div>
                      </div>
                      <Wrench className="w-5 h-5 text-gray-400 dark:text-gray-500" style={{ color: service.color }} />
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${servicesData.length > 0 && servicesData[0].bookings > 0 
                            ? (service.bookings / servicesData[0].bookings) * 100 
                            : 0}%`,
                          backgroundColor: service.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Status Distribution */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="mb-6">
                <h3 className="text-gray-900 dark:text-gray-100 mb-1">Appointment Status</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status distribution</p>
              </div>

              <div className="flex items-center justify-center h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1F2937" : "#fff",
                        border: isDark ? "1px solid #374151" : "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        color: isDark ? "#F9FAFB" : "#111827",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                {statusData.map((status) => (
                  <div key={status.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{status.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{status.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Peak Hours */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="mb-6">
              <h3 className="text-gray-900 dark:text-gray-100 mb-1">Peak Hours</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Busiest times of the day</p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#E5E7EB"} />
                  <XAxis
                    dataKey="hour"
                    stroke={isDark ? "#9CA3AF" : "#6B7280"}
                    style={{ fontSize: "12px", fill: isDark ? "#D1D5DB" : "#6B7280" }}
                  />
                  <YAxis stroke={isDark ? "#9CA3AF" : "#6B7280"} style={{ fontSize: "12px", fill: isDark ? "#D1D5DB" : "#6B7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1F2937" : "#fff",
                      border: isDark ? "1px solid #374151" : "1px solid #E5E7EB",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="bookings" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Quick Insights */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4">Quick Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.bestDay ? (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                    <ArrowUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Best Day</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                      {insights.bestDay.day} with {insights.bestDay.bookings} bookings
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Best Day</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">No data available</p>
                  </div>
                </div>
              )}

              {insights.peakTime ? (
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-100 dark:border-blue-900">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Peak Time</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      {insights.peakTime.hour} with {insights.peakTime.bookings} bookings
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Peak Time</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">No data available</p>
                  </div>
                </div>
              )}

              {insights.topService ? (
                <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-100 dark:border-purple-900">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Top Service</p>
                    <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                      {insights.topService.serviceName} with {insights.topService.bookings} bookings
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Top Service</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">No data available</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
    </div>
  );
}
