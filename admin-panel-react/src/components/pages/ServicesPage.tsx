import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Wrench,
  Calendar,
  TrendingUp,
  Plus,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Download,
} from "lucide-react";
import { StatCard } from "../cards/StatCard";
import { ServiceCard } from "../cards/ServiceCard";
import { ServiceDialog } from "../dialogs/ServiceDialog";
import { SlotsManagementPage } from "./SlotsManagementPage";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { PageHeader } from "../PageHeader";
import { toast } from "sonner";
import { apiClient } from "../../services/api";

export function ServicesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSlotsManagement, setShowSlotsManagement] = useState(false);
  const [selectedServiceForSlots, setSelectedServiceForSlots] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalServices: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    weekAppointments: 0,
    pendingAppointments: 0,
    averageOccupancy: 0,
    totalRevenue: 0,
    todayRevenue: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Load services and stats on mount
  useEffect(() => {
    loadData();
    loadStats();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const servicesData = await apiClient.getServices();
      setServices(servicesData.services || []);
    } catch (error) {
      console.error('Failed to load services:', error);
      toast.error("Failed to load services");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await apiClient.getServicesStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load statistics:', error);
      toast.error("Failed to load statistics");
    } finally {
      setStatsLoading(false);
    }
  };

  const statsCards = [
    {
      icon: Wrench,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Total Services",
      value: statsLoading ? "..." : stats.totalServices,
      subtitle: "Active services",
    },
    {
      icon: Calendar,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Total Bookings",
      value: statsLoading ? "..." : stats.totalAppointments,
      subtitle: "All time bookings",
    },
    {
      icon: TrendingUp,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Average Occupancy",
      value: statsLoading ? "..." : `${stats.averageOccupancy}%`,
      subtitle: "Capacity utilization",
    },
  ];

  const filteredServices = services?.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || (service.category || "General").toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  }) || [];

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all";

  const handleRefresh = async () => {
    try {
      await Promise.all([loadData(), loadStats()]);
      toast.success("Services refreshed");
    } catch (error) {
      console.error('Failed to refresh services:', error);
      toast.error("Failed to refresh services");
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      await apiClient.deleteService(serviceId);
      toast.success("Service deleted successfully");
      await loadData(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error("Failed to delete service");
    }
  };

  const handleManageSlots = (serviceId: number) => {
    setSelectedServiceForSlots(serviceId);
    setShowSlotsManagement(true);
  };

  const handleBackToServices = () => {
    setShowSlotsManagement(false);
    setSelectedServiceForSlots(null);
  };

  // Show slots management page if selected
  if (showSlotsManagement && selectedServiceForSlots) {
    return (
      <SlotsManagementPage 
        serviceId={selectedServiceForSlots}
        onBack={handleBackToServices}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Wrench className="w-7 h-7 text-white" />}
        title="Services"
        description="Manage your services and track their performance"
        onRefresh={handleRefresh}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="hidden sm:flex bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setDialogOpen(true)}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsCards.map((stat, index) => {
              const StatCardComponent = () => (
                <StatCard 
                  icon={stat.icon}
                  iconBg={stat.iconBg}
                  iconColor={stat.iconColor}
                  title={stat.title}
                  value={stat.value}
                  subtitle={stat.subtitle}
                />
              );
              return <StatCardComponent key={stat.title} />;
            })}
          </div>

          {/* Filters */}
          <Card className="p-4 lg:p-6 bg-white">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Mobile: Search + Filter Button */}
              <div className="flex gap-2 lg:hidden">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search services..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <SlidersHorizontal className="w-4 h-4" />
                      {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-600 rounded-full" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>Filter services by category</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 pt-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="beauty">Beauty</SelectItem>
                            <SelectItem value="health">Health</SelectItem>
                            <SelectItem value="consultation">Consultation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="w-full text-indigo-600 hover:text-indigo-700"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop: Full Filters Row */}
              <div className="hidden lg:flex flex-1 gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search services by name..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Wrench className="w-12 h-12 text-gray-300" />
                  <p className="text-gray-500">No services found</p>
                  <Button
                    variant="link"
                    onClick={() => setDialogOpen(true)}
                    className="text-indigo-600"
                  >
                    Create your first service
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredServices.map((service) => {
                  const ServiceCardComponent = () => (
                    <ServiceCard
                      id={service.id}
                      name={service.name}
                      nameRu={service.nameRu}
                      nameEn={service.nameEn}
                      nameHe={service.nameHe}
                      description={service.description}
                      descriptionRu={service.descriptionRu}
                      descriptionEn={service.descriptionEn}
                      descriptionHe={service.descriptionHe}
                      durationMin={service.durationMin}
                      price={service.price}
                      currency={service.currency}
                      organizationId={service.organizationId}
                      createdAt={service.createdAt}
                      updatedAt={service.updatedAt}
                      _count={service._count}
                      onEdit={() => setDialogOpen(true)}
                      onDelete={() => handleDeleteService(service.id)}
                      onManageSlots={() => handleManageSlots(service.id)}
                    />
                  );
                  return <ServiceCardComponent key={service.id} />;
                })}
              </div>
            )}

            {/* Results count */}
            {filteredServices.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Showing {filteredServices.length} of {services.length} services
                </p>
              </div>
            )}
          </Card>

          {/* Dialog */}
          <ServiceDialog 
            open={dialogOpen} 
            onOpenChange={setDialogOpen}
            onServiceSaved={handleRefresh}
          />
        </div>
      </div>
    </div>
  );
}