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
import { apiClient, Service } from "../../services/api";
import { useWebSocket } from "../../hooks/useWebSocket";
import { toastNotifications } from "../toast-notifications";
import { SetupSuccessModal } from "../SetupSuccessModal";
import { listenToSetupWizardModal, SetupWizardModalData } from "../../utils/setupWizardEvents";

export function ServicesPage() {
  const { events } = useWebSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Load services and stats on mount - load both in parallel but wait for both
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      setStatsLoading(true);
      try {
        await Promise.all([loadData(), loadStats()]);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
        setStatsLoading(false);
      }
    };
    loadAll();
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
      setTimeout(async () => {
        setIsLoading(true);
        setStatsLoading(true);
        try {
          await Promise.all([loadData(), loadStats()]);
        } catch (error) {
          console.error('Failed to reload after event:', error);
        } finally {
          setIsLoading(false);
          setStatsLoading(false);
        }
      }, 300);
    }
  }, [events]);

  const loadData = async () => {
    try {
      const servicesData = await apiClient.getServices();
      setServices(servicesData.services || []);
    } catch (error) {
      console.error('Failed to load services:', error);
      toast.error("Failed to load services");
      throw error;
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await apiClient.getServicesStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load statistics:', error);
      toast.error("Failed to load statistics");
      throw error;
    }
  };

  const statsCards = [
    {
      icon: Wrench,
      iconBg: "bg-blue-50 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      title: "Total Services",
      value: statsLoading ? "..." : stats.totalServices,
      subtitle: "Active services",
    },
    {
      icon: Calendar,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      title: "Total Bookings",
      value: statsLoading ? "..." : stats.totalAppointments,
      subtitle: "All time bookings",
    },
    {
      icon: TrendingUp,
      iconBg: "bg-purple-50 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      title: "Average Occupancy (Current Month)",
      value: statsLoading ? "..." : `${stats.averageOccupancy}%`,
      subtitle: "Capacity utilization",
    },
  ];

  const filteredServices = services?.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  const clearFilters = () => {
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery;

  const handleRefresh = async () => {
    try {
      // Small delay to ensure backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 300));
      await Promise.all([loadData(), loadStats()]);
      // Don't show toast on auto-refresh after edit/create
    } catch (error) {
      console.error('Failed to refresh services:', error);
      toast.error("Failed to refresh services");
    }
  };

  const handleEditService = (service: Service) => {
    setServiceToEdit(service);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Clear serviceToEdit when dialog closes
      setServiceToEdit(null);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    setServiceToDelete({ id: serviceId, name: service.name });
    setDeletionDialogOpen(true);
  };

  const handleManageAppointments = (serviceId: number) => {
    // Navigate to appointments page with service filter and today's date
    navigate('/appointments', { 
      state: { 
        serviceId,
        date: new Date() // Today's date
      } 
    });
  };


  // Show loading state before rendering content - wait for both services and stats
  // Only show content when ALL data is loaded (both services and stats)
  if (isLoading || statsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)] bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6" style={{ animation: 'none', transition: 'none' }}>
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
                  onClick={() => {
                    setServiceToEdit(null);
                    setDialogOpen(true);
                  }}
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
                      <SheetDescription className="text-gray-600 dark:text-gray-400">Filter services by name</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 pt-6">
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
                    onClick={() => {
                    setServiceToEdit(null);
                    setDialogOpen(true);
                  }}
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
                        occupancy={service.occupancy}
                        onEdit={() => handleEditService(service)}
                        onDelete={() => handleDeleteService(service.id)}
                        onManageAppointments={() => handleManageAppointments(service.id)}
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
            onOpenChange={handleDialogClose}
            service={serviceToEdit ? {
              id: serviceToEdit.id,
              name: serviceToEdit.name,
              nameRu: serviceToEdit.nameRu,
              nameEn: serviceToEdit.nameEn,
              nameHe: serviceToEdit.nameHe,
              description: serviceToEdit.description,
              descriptionRu: serviceToEdit.descriptionRu,
              descriptionEn: serviceToEdit.descriptionEn,
              descriptionHe: serviceToEdit.descriptionHe,
              durationMin: serviceToEdit.durationMin,
              price: serviceToEdit.price,
              currency: serviceToEdit.currency,
              organizationId: serviceToEdit.organizationId,
            } : undefined}
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