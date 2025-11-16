import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { ServiceDeletionDialog } from "../ServiceDeletionDialog";
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
import { PageTitle } from "../PageTitle";
import { toast } from "sonner";
import { apiClient } from "../../services/api";
import { useWebSocket } from "../../hooks/useWebSocket";
import { toastNotifications } from "../toast-notifications";
import { SetupSuccessModal } from "../SetupSuccessModal";
import { listenToSetupWizardModal, SetupWizardModalData } from "../../utils/setupWizardEvents";

export function ServicesPage() {
  const { events } = useWebSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSlotsManagement, setShowSlotsManagement] = useState(false);
  const [selectedServiceForSlots, setSelectedServiceForSlots] = useState<number | null>(null);
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{ id: number; name: string } | null>(null);
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
  const processedEventsRef = useRef<Set<string>>(new Set());
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    step: 'service' | 'bot' | 'admin' | 'complete';
    message: string;
    primaryAction?: { label: string; onClick: () => void };
    secondaryAction?: { label: string; onClick: () => void };
  }>({
    open: false,
    step: 'service',
    message: '',
  });

  // Load services and stats on mount
  useEffect(() => {
    loadData();
    loadStats();
  }, []);

  // Handle navigation state for auto-opening dialog
  useEffect(() => {
    if (location.state?.openDialog) {
      setDialogOpen(true);
      // Clear state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Listen for setup wizard modal events
  useEffect(() => {
    console.log('🎯 ServicesPage: Setting up setup wizard modal listener');
    const unsubscribe = listenToSetupWizardModal((data: SetupWizardModalData) => {
      console.log('🎯 ServicesPage: Received setup wizard modal event:', data);
      setSuccessModal(prev => {
        const newState = {
          open: true,
          step: data.step,
          message: data.message,
          primaryAction: data.primaryAction,
          secondaryAction: data.secondaryAction,
        };
        console.log('✅ ServicesPage: Success modal state updated:', newState);
        return newState;
      });
    });
    return unsubscribe;
  }, []);

  // Debug: log modal state changes
  useEffect(() => {
    console.log('🔍 ServicesPage: Success modal state changed:', successModal);
  }, [successModal]);

  // Handle real-time WebSocket events for services
  useEffect(() => {
    if (events.length === 0) return;

    // Process all new events, not just the latest one
    let hasNewEvents = false;
    
    events.forEach(event => {
      // Skip if already processed
      if (processedEventsRef.current.has(event.id)) return;
      
      hasNewEvents = true;
      processedEventsRef.current.add(event.id);
      
      if (event.type === 'service.created' || event.type === 'service_created') {
        // Show toast notification
        toastNotifications.services.created(event.data?.serviceName);
      } else if (event.type === 'service.updated' || event.type === 'service_updated') {
        toastNotifications.services.updated(event.data?.serviceName);
      } else if (event.type === 'service.deleted' || event.type === 'service_deleted') {
        toastNotifications.services.deleted(event.data?.serviceName);
      }
    });

    // Reload services if we processed any new service events
    if (hasNewEvents) {
      setTimeout(() => {
        loadData();
        loadStats();
      }, 300);
    }
  }, [events]);

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
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    setServiceToDelete({ id: serviceId, name: service.name });
    setDeletionDialogOpen(true);
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
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Title */}
          <PageTitle
            icon={<Wrench className="w-6 h-6 text-white" />}
            title="Services"
            description="Manage your services and track their performance"
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
          <Card className="p-4 lg:p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Mobile: Search + Filter Button */}
              <div className="flex gap-2 lg:hidden">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search services..."
                    className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="relative border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <SlidersHorizontal className="w-4 h-4" />
                      {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <SheetHeader>
                      <SheetTitle className="text-gray-900 dark:text-gray-100">Filters</SheetTitle>
                      <SheetDescription className="text-gray-600 dark:text-gray-400">Filter services by category</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 pt-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Category</label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Categories</SelectItem>
                            <SelectItem value="general" className="text-gray-900 dark:text-gray-100">General</SelectItem>
                            <SelectItem value="beauty" className="text-gray-900 dark:text-gray-100">Beauty</SelectItem>
                            <SelectItem value="health" className="text-gray-900 dark:text-gray-100">Health</SelectItem>
                            <SelectItem value="consultation" className="text-gray-900 dark:text-gray-100">Consultation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="w-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search services by name..."
                    className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Categories</SelectItem>
                    <SelectItem value="general" className="text-gray-900 dark:text-gray-100">General</SelectItem>
                    <SelectItem value="beauty" className="text-gray-900 dark:text-gray-100">Beauty</SelectItem>
                    <SelectItem value="health" className="text-gray-900 dark:text-gray-100">Health</SelectItem>
                    <SelectItem value="consultation" className="text-gray-900 dark:text-gray-100">Consultation</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                  <Wrench className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">No services found</p>
                  <Button
                    variant="link"
                    onClick={() => setDialogOpen(true)}
                    className="text-indigo-600 dark:text-indigo-400"
                  >
                    Create your first service
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Info Banner about Auto-Slot Generation */}
                <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30">
                  <div className="p-4 flex items-start gap-3">
                    <div className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">ℹ️</div>
                    <div>
                      <h3 className="font-medium text-blue-900 dark:text-blue-100">Auto-Generated Slots</h3>
                      <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                        Time slots are automatically generated for 1 year when you create services. 
                        No manual slot management needed - just create your services and start booking!
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Services Grid */}
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
              </div>
            )}

            {/* Results count */}
            {filteredServices.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredServices.length} of {services.length} services
                </p>
              </div>
            )}
          </Card>

          {/* Dialogs */}
          <ServiceDialog 
            open={dialogOpen} 
            onOpenChange={setDialogOpen}
            onServiceSaved={handleRefresh}
          />

          <ServiceDeletionDialog
            open={deletionDialogOpen}
            onOpenChange={setDeletionDialogOpen}
            service={serviceToDelete || { id: 0, name: '' }}
            onServiceDeleted={handleRefresh}
          />

          {/* Setup Success Modal */}
          <SetupSuccessModal
            open={successModal.open}
            onOpenChange={(open) => setSuccessModal(prev => ({ ...prev, open }))}
            step={successModal.step}
            message={successModal.message}
            primaryAction={successModal.primaryAction}
            secondaryAction={successModal.secondaryAction}
          />
        </div>
      </div>
    </div>
  );
}