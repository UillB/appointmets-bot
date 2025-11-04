import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
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
import { apiClient } from "../../services/api";
import { toast } from "sonner";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AnalyticsData {
  totalAppointments: number;
  totalRevenue: number;
  averageBookingTime: number;
  topServices: Array<{
    serviceId: number;
    serviceName: string;
    bookings: number;
    revenue: number;
  }>;
  dailyBookings: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
  customerInsights: {
    newCustomers: number;
    returningCustomers: number;
    averageBookingFrequency: number;
  };
}

export function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const startDate = format(dateRange.start, "yyyy-MM-dd");
      const endDate = format(dateRange.end, "yyyy-MM-dd");
      const endpoint = `/analytics?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
      const response = await apiClient.get<AnalyticsData>(endpoint);
      setAnalyticsData(response);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      const startDate = format(dateRange.start, "yyyy-MM-dd");
      const endDate = format(dateRange.end, "yyyy-MM-dd");
      const endpoint = `/analytics/export?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&format=csv`;
      
      // Use fetch directly for blob response
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:4000/api${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("Analytics data exported successfully");
    } catch (error) {
      console.error("Error exporting analytics:", error);
      toast.error("Failed to export analytics data");
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    color = "blue",
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: number;
    color?: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-1">
              <TrendingUp
                className={`h-4 w-4 ${
                  trend >= 0 ? "text-green-500" : "text-red-500"
                }`}
              />
              <span
                className={`text-sm ${
                  trend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend >= 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Loading analytics...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Card className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-600 mb-4">
            Start booking appointments to see analytics data.
          </p>
          <Button onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Load Analytics
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Insights and performance metrics for your business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Appointments"
          value={analyticsData.totalAppointments}
          icon={Calendar}
          trend={12}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={8}
          color="green"
        />
        <StatCard
          title="Avg. Booking Time"
          value={`${analyticsData.averageBookingTime} min`}
          icon={Clock}
          trend={-5}
          color="orange"
        />
        <StatCard
          title="New Customers"
          value={analyticsData.customerInsights.newCustomers}
          icon={Users}
          trend={15}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bookings Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Daily Bookings Trend</h3>
              <p className="text-sm text-gray-600">Appointments over time</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.dailyBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => format(new Date(value), "MMM dd")}
                />
                <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(value) => format(new Date(value), "MMM dd, yyyy")}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ fill: "#4F46E5", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Services Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Services</h3>
              <p className="text-sm text-gray-600">Bookings by service</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.topServices.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="serviceName" 
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="bookings" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Services */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Services</h3>
          <Badge variant="secondary">
            {analyticsData.topServices.length} services
          </Badge>
        </div>
        <div className="space-y-3">
          {analyticsData.topServices.map((service, index) => (
            <div
              key={service.serviceId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{service.serviceName}</p>
                  <p className="text-sm text-gray-600">
                    {service.bookings} bookings
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${service.revenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">revenue</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Customer Base</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">New Customers</span>
              <span className="font-semibold text-gray-900">
                {analyticsData.customerInsights.newCustomers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Returning Customers</span>
              <span className="font-semibold text-gray-900">
                {analyticsData.customerInsights.returningCustomers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg. Frequency</span>
              <span className="font-semibold text-gray-900">
                {analyticsData.customerInsights.averageBookingFrequency}x/month
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Growth Trends</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="font-semibold text-green-600">+12%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="font-semibold text-gray-900">+8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Quarterly</span>
              <span className="font-semibold text-blue-600">+25%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Performance</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg. Response Time</span>
              <span className="font-semibold text-gray-900">2.3s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="font-semibold text-green-600">99.9%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <span className="font-semibold text-blue-600">4.8/5</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
