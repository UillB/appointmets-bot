import React, { useState, useEffect } from "react";
import { useWebSocket } from "../../hooks/useWebSocket";
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
import { createToastNotifications } from "../toast-notifications";
import { apiClient } from "../../services/api";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../i18n";

export function AnalyticsPage() {
  const { t } = useLanguage();
  const toastNotifications = createToastNotifications(t);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { events } = useWebSocket();
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year" | "all">("week");
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
      setError(err.message || t('analytics.errors.failedToLoad'));
      toastNotifications.errors.general(t('analytics.errors.failedToLoadData'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timePeriod]);

  // Handle WebSocket events for real-time updates
  useEffect(() => {
    if (events.length === 0) return;

    const latestEvent = events[0];
    
    // Reload analytics when appointment events occur
    if (
      latestEvent.type === 'appointment.created' || 
      latestEvent.type === 'appointment_created' ||
      latestEvent.type === 'appointment.updated' ||
      latestEvent.type === 'appointment_updated' ||
      latestEvent.type === 'appointment.cancelled' ||
      latestEvent.type === 'appointment_cancelled' ||
      latestEvent.type === 'appointment.confirmed' ||
      latestEvent.type === 'appointment_confirmed'
    ) {
      // Small delay to ensure backend has processed the change
      setTimeout(() => {
        loadAnalytics();
      }, 500);
    }
  }, [events]);

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
      title: t('analytics.stats.totalBookings'),
      value: (analyticsData.totalAppointments || 0) as string | number,
      subtitle: timePeriod === 'all' ? t('analytics.stats.allTime') : t(`analytics.stats.this${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}`),
      trend: analyticsData.growthRate || 0,
    },
    {
      icon: TrendingUp,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      title: t('analytics.stats.growthRate'),
      value: `${analyticsData.growthRate >= 0 ? '+' : ''}${analyticsData.growthRate || 0}%`,
      subtitle: timePeriod === 'all' ? t('analytics.stats.vsPreviousPeriod') : t(`analytics.stats.vsLast${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}`),
      trend: analyticsData.growthRate || 0,
    },
    {
      icon: Users,
      iconBg: "bg-purple-50 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      title: t('analytics.stats.activeClients'),
      value: (analyticsData.activeClients || 0) as string | number,
      subtitle: t('analytics.stats.uniqueClients'),
      trend: 0,
    },
    {
      icon: Clock,
      iconBg: "bg-amber-50 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      title: t('analytics.stats.avgDuration'),
      value: `${analyticsData.averageDuration || 0}m`,
      subtitle: t('analytics.stats.perAppointment'),
      trend: 0,
    },
  ] : [];

  // Appointments over time data - use full date for display
  const appointmentsData = analyticsData?.dailyBookings?.map((item: any) => ({
    day: item.fullDate || item.dayLabel || item.dayShort || item.day || "",
    date: item.date || "",
    fullDate: item.fullDate || item.dayLabel || "",
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

  if (loading || !analyticsData) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)] bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-white dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadAnalytics}>{t('analytics.retry')}</Button>
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
            title={t('analytics.title')}
            description={t('analytics.description')}
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="hidden sm:flex"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('common.refresh')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="hidden sm:flex"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('analytics.export')}
                </Button>
              </>
            }
          />

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const { icon, iconBg, iconColor, title, value, subtitle, trend } = stat;
              return (
                // @ts-ignore - key is a standard React prop, not part of component props
                <StatCard
                  key={title}
                  icon={icon}
                  iconBg={iconBg}
                  iconColor={iconColor}
                  title={title}
                  value={value}
                  subtitle={subtitle}
                  trend={trend}
                />
              );
            })}
          </div>

          {/* Time Period Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-gray-900 dark:text-gray-100">{t('analytics.performanceOverview')}</h3>
            <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as "week" | "month" | "year" | "all")}>
              <TabsList className="bg-gray-100 dark:bg-gray-800">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  {t('analytics.timePeriod.allTime')}
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  {t('analytics.timePeriod.week')}
                </TabsTrigger>
                <TabsTrigger
                  value="month"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  {t('analytics.timePeriod.month')}
                </TabsTrigger>
                <TabsTrigger
                  value="year"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  {t('analytics.timePeriod.year')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Appointments Trend */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-gray-900 dark:text-gray-100 mb-1">{t('analytics.appointmentsTrend.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('analytics.appointmentsTrend.description')}</p>
              </div>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointments">{t('analytics.metrics.appointments')}</SelectItem>
                  <SelectItem value="revenue">{t('analytics.metrics.revenue')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {appointmentsData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appointmentsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#E5E7EB"} />
                    <XAxis
                      dataKey="day"
                      stroke={isDark ? "#9CA3AF" : "#6B7280"}
                      style={{ fontSize: "12px", fill: isDark ? "#D1D5DB" : "#6B7280" }}
                      angle={appointmentsData.length > 7 ? -45 : 0}
                      textAnchor={appointmentsData.length > 7 ? "end" : "middle"}
                      height={appointmentsData.length > 7 ? 60 : 30}
                    />
                    <YAxis 
                      stroke={isDark ? "#9CA3AF" : "#6B7280"} 
                      style={{ fontSize: "12px", fill: isDark ? "#D1D5DB" : "#6B7280" }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1F2937" : "#fff",
                        border: isDark ? "1px solid #374151" : "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        color: isDark ? "#F9FAFB" : "#111827",
                      }}
                      formatter={(value: any) => [
                        selectedMetric === "appointments" 
                          ? `${value} ${value === 1 ? t('analytics.tooltip.appointment') : t('analytics.tooltip.appointments')}`
                          : `$${value.toFixed(2)}`,
                        selectedMetric === "appointments" ? t('analytics.metrics.appointments') : t('analytics.metrics.revenue')
                      ]}
                      labelFormatter={(label, payload) => {
                        // Use full date from payload if available
                        const fullDate = payload?.[0]?.payload?.fullDate || label;
                        return `${t('analytics.tooltip.date')}: ${fullDate}`;
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
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t('analytics.emptyStates.noAppointmentData')}</p>
              </div>
            )}
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Services */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="mb-6">
                <h3 className="text-gray-900 dark:text-gray-100 mb-1">{t('analytics.topServices.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('analytics.topServices.description')}</p>
              </div>

              {servicesData.length > 0 ? (
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
                            <p className="text-sm text-gray-600 dark:text-gray-400">{service.bookings} {t('analytics.topServices.bookings')}</p>
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
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Wrench className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t('analytics.emptyStates.noServicesWithBookings')}</p>
                </div>
              )}
            </Card>

            {/* Status Distribution */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="mb-6">
                <h3 className="text-gray-900 dark:text-gray-100 mb-1">{t('analytics.appointmentStatus.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('analytics.appointmentStatus.description')}</p>
              </div>

              {statusData.length > 0 ? (
                <>
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
                          formatter={(value: any) => [`${value}%`, t('analytics.tooltip.percentage')]}
                          labelFormatter={(label) => `${t('analytics.tooltip.status')}: ${label}`}
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
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {status.value}% ({status.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t('analytics.emptyStates.noStatusData')}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Peak Hours */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="mb-6">
              <h3 className="text-gray-900 dark:text-gray-100 mb-1">{t('analytics.peakHours.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('analytics.peakHours.description')}</p>
            </div>

            {peakHoursData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#E5E7EB"} />
                    <XAxis
                      dataKey="hour"
                      stroke={isDark ? "#9CA3AF" : "#6B7280"}
                      style={{ fontSize: "12px", fill: isDark ? "#D1D5DB" : "#6B7280" }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke={isDark ? "#9CA3AF" : "#6B7280"} 
                      style={{ fontSize: "12px", fill: isDark ? "#D1D5DB" : "#6B7280" }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1F2937" : "#fff",
                        border: isDark ? "1px solid #374151" : "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        color: isDark ? "#F9FAFB" : "#111827",
                      }}
                      formatter={(value: any) => [`${value} ${value === 1 ? t('analytics.tooltip.booking') : t('analytics.tooltip.bookings')}`, t('analytics.tooltip.bookings')]}
                      labelFormatter={(label) => `${t('analytics.tooltip.time')}: ${label}`}
                    />
                    <Bar dataKey="bookings" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t('analytics.emptyStates.noPeakHoursData')}</p>
              </div>
            )}
          </Card>

          {/* Quick Insights */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4">{t('analytics.quickInsights.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.bestDay ? (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                    <ArrowUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">{t('analytics.quickInsights.bestDay')}</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                      {insights.bestDay.formatted || `${insights.bestDay.day} ${insights.bestDay.date}`} {t('analytics.quickInsights.with')} {insights.bestDay.bookings} {t('analytics.tooltip.bookings')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('analytics.quickInsights.bestDay')}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('analytics.emptyStates.noDataAvailable')}</p>
                  </div>
                </div>
              )}

              {insights.peakTime ? (
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-100 dark:border-blue-900">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">{t('analytics.quickInsights.peakTime')}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      {insights.peakTime.hour} {t('analytics.quickInsights.with')} {insights.peakTime.bookings} {t('analytics.tooltip.bookings')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('analytics.quickInsights.peakTime')}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('analytics.emptyStates.noDataAvailable')}</p>
                  </div>
                </div>
              )}

              {insights.topService ? (
                <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-100 dark:border-purple-900">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-300">{t('analytics.quickInsights.topService')}</p>
                    <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                      {insights.topService.serviceName} {t('analytics.quickInsights.with')} {insights.topService.bookings} {t('analytics.tooltip.bookings')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('analytics.quickInsights.topService')}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('analytics.emptyStates.noDataAvailable')}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
    </div>
  );
}
