import { useState } from "react";
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
import { PageTitle } from "./PageTitle";
import { StatCard } from "./StatCard";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
import { toastNotifications } from "./toast-notifications";

interface AnalyticsPageProps {}

export function AnalyticsPage({}: AnalyticsPageProps) {
  const [timePeriod, setTimePeriod] = useState("week");
  const [selectedMetric, setSelectedMetric] = useState("appointments");

  const handleRefresh = () => {
    toastNotifications.system.refreshed("Analytics");
  };

  const handleExport = () => {
    toastNotifications.system.exported("Analytics report");
  };

  // Stats
  const stats = [
    {
      icon: Calendar,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Total Bookings",
      value: 142,
      subtitle: "This month",
      trend: 12,
    },
    {
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Growth Rate",
      value: "+23%",
      subtitle: "vs last month",
      trend: 23,
    },
    {
      icon: Users,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Active Clients",
      value: 87,
      subtitle: "Unique clients",
      trend: 8,
    },
    {
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "Avg. Duration",
      value: "45m",
      subtitle: "Per appointment",
      trend: 0,
    },
  ];

  // Appointments over time data
  const appointmentsData = [
    { day: "Mon", appointments: 12, revenue: 240 },
    { day: "Tue", appointments: 19, revenue: 380 },
    { day: "Wed", appointments: 15, revenue: 300 },
    { day: "Thu", appointments: 22, revenue: 440 },
    { day: "Fri", appointments: 28, revenue: 560 },
    { day: "Sat", appointments: 31, revenue: 620 },
    { day: "Sun", appointments: 15, revenue: 300 },
  ];

  // Top services data
  const servicesData = [
    { name: "Haircut", bookings: 45, color: "#4F46E5" },
    { name: "Massage", bookings: 38, color: "#7C3AED" },
    { name: "Consultation", bookings: 32, color: "#2563EB" },
    { name: "Manicure", bookings: 27, color: "#0891B2" },
  ];

  // Peak hours data
  const peakHoursData = [
    { hour: "9AM", bookings: 5 },
    { hour: "10AM", bookings: 8 },
    { hour: "11AM", bookings: 12 },
    { hour: "12PM", bookings: 15 },
    { hour: "1PM", bookings: 10 },
    { hour: "2PM", bookings: 18 },
    { hour: "3PM", bookings: 22 },
    { hour: "4PM", bookings: 20 },
    { hour: "5PM", bookings: 16 },
    { hour: "6PM", bookings: 12 },
  ];

  // Status distribution
  const statusData = [
    { name: "Confirmed", value: 85, color: "#10B981" },
    { name: "Pending", value: 10, color: "#F59E0B" },
    { name: "Cancelled", value: 5, color: "#EF4444" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Time Period Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-gray-900">Performance Overview</h3>
            <Tabs value={timePeriod} onValueChange={setTimePeriod}>
              <TabsList className="bg-gray-100">
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
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-gray-900 mb-1">Appointments Trend</h3>
                <p className="text-sm text-gray-600">Daily bookings over time</p>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="day"
                    stroke="#6B7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-gray-900 mb-1">Top Services</h3>
                <p className="text-sm text-gray-600">Most popular services</p>
              </div>

              <div className="space-y-4">
                {servicesData.map((service, index) => (
                  <div key={service.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.bookings} bookings</p>
                        </div>
                      </div>
                      <Wrench className="w-5 h-5 text-gray-400" style={{ color: service.color }} />
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(service.bookings / servicesData[0].bookings) * 100}%`,
                          backgroundColor: service.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Status Distribution */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-gray-900 mb-1">Appointment Status</h3>
                <p className="text-sm text-gray-600">Status distribution</p>
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
                    <Tooltip />
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
                      <span className="text-sm text-gray-700">{status.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{status.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Peak Hours */}
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-gray-900 mb-1">Peak Hours</h3>
              <p className="text-sm text-gray-600">Busiest times of the day</p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="hour"
                    stroke="#6B7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
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
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Quick Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ArrowUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900">Best Day</p>
                  <p className="text-xs text-emerald-700 mt-1">Saturday with 31 bookings</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Peak Time</p>
                  <p className="text-xs text-blue-700 mt-1">3PM with 22 bookings</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">Top Service</p>
                  <p className="text-xs text-purple-700 mt-1">Haircut with 45 bookings</p>
                </div>
              </div>
            </div>
          </Card>
    </div>
  );
}
