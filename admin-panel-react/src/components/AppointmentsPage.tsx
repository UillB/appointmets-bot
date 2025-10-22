import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  RefreshCw,
  Download,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { AppointmentDialog } from "./AppointmentDialog";
import { AppointmentFormSheet } from "./AppointmentFormSheet";
import { MobileAppointmentCard } from "./MobileAppointmentCard";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { ScrollArea } from "./ui/scroll-area";
import { format } from "date-fns";
import { PageHeader } from "./PageHeader";
import { toast } from "sonner";
import { apiClient, Appointment } from "../services/api";

interface AppointmentsPageProps {
  onMenuClick?: () => void;
}

export function AppointmentsPage({ onMenuClick }: AppointmentsPageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [appointmentsData, servicesData] = await Promise.all([
        apiClient.getAppointments(),
        apiClient.getServices()
      ]);
      
      setAppointments(appointmentsData.appointments);
      setServices(servicesData.services);
    } catch (error) {
      console.error('Failed to load appointments data:', error);
      toast.error('Failed to load appointments data');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      icon: CalendarDays,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Total Appointments",
      value: appointments?.length || 0,
      subtitle: "All time bookings",
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Confirmed",
      value: appointments?.filter(apt => apt.status === 'confirmed').length || 0,
      subtitle: "Successfully confirmed",
    },
    {
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "Pending",
      value: appointments?.filter(apt => apt.status === 'pending').length || 0,
      subtitle: "Awaiting confirmation",
    },
    {
      icon: XCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      title: "Cancelled",
      value: appointments?.filter(apt => apt.status === 'cancelled').length || 0,
      subtitle: "Cancelled bookings",
    },
  ];


  const getStatusBadge = (status: "confirmed" | "cancelled" | "pending") => {
    const styles = {
      confirmed: "bg-emerald-100 text-emerald-700 border-0",
      cancelled: "bg-red-100 text-red-700 border-0",
      pending: "bg-amber-100 text-amber-700 border-0",
    };

    const icons = {
      confirmed: CheckCircle2,
      cancelled: XCircle,
      pending: Clock,
    };

    const Icon = icons[status];

    return (
      <Badge className={`${styles[status]} flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredAppointments = appointments?.filter((apt) => {
    if (activeTab !== "all" && apt.status !== activeTab) return false;
    if (searchQuery && 
        !(apt.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          apt.clientPhone?.includes(searchQuery))) {
      return false;
    }
    if (selectedService !== "all" && apt.service?.name !== selectedService) return false;
    return true;
  }) || [];

  const getTabCount = (tab: string) => {
    if (!appointments) return 0;
    if (tab === "all") return appointments.length;
    return appointments.filter((apt) => apt.status === tab).length;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDate(undefined);
    setSelectedService("all");
  };

  const hasActiveFilters = searchQuery || date || selectedService !== "all";

  const handleRefresh = () => {
    loadData();
    toast.success("Appointments refreshed");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <PageHeader
        icon={<CalendarDays className="w-7 h-7 text-white" />}
        title="Appointments"
        description="Manage appointments and bookings"
        onRefresh={handleRefresh}
        onMenuClick={onMenuClick}
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
              className="hidden sm:flex"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setDialogOpen(true)}
              size="sm"
              className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
            <Button
              onClick={() => setSheetOpen(true)}
              size="sm"
              className="sm:hidden bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
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
              return <StatCardComponent key={`stat-${index}`} />;
            })}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {/* Main Content Card */}
          <Card className="p-4 lg:p-6 bg-white">
            {/* Tabs - Scrollable on mobile */}
            <ScrollArea className="w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 lg:mb-6">
                <TabsList className="bg-gray-100 inline-flex">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap"
                  >
                    All ({getTabCount("all")})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="confirmed" 
                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap"
                  >
                    Confirmed ({getTabCount("confirmed")})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pending" 
                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap"
                  >
                    Pending ({getTabCount("pending")})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cancelled" 
                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap"
                  >
                    Cancelled ({getTabCount("cancelled")})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </ScrollArea>

            {/* Filters */}
            <div className="space-y-4 mb-4 lg:mb-6">
              {/* Mobile: Search + Filter Button */}
              <div className="flex gap-2 lg:hidden">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <SlidersHorizontal className="w-4 h-4" />
                      {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-600 rounded-full" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px]">
                    <div className="space-y-4 pt-6">
                      <h3 className="font-medium">Filters</h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Service</label>
                        <Select value={selectedService} onValueChange={setSelectedService}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Services" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Services</SelectItem>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.name}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !date && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
              <div className="hidden lg:flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by client ID or service..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.name}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-[180px] justify-start text-left ${
                          !date && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PP") : "Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

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
            </div>

            {/* Desktop: Table View */}
            <div className="hidden lg:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <CalendarDays className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500">No appointments found</p>
                          <Button
                            variant="link"
                            onClick={() => setDialogOpen(true)}
                            className="text-indigo-600"
                          >
                            Create your first appointment
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <TableRow key={apt.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <CalendarDays className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="font-medium">{apt.service?.name || 'Unknown Service'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{apt.slot?.startAt ? new Date(apt.slot.startAt).toLocaleDateString() : 'No date'}</p>
                            <p className="text-sm text-gray-500">
                              {apt.slot?.startAt && apt.slot?.endAt ? 
                                `${new Date(apt.slot.startAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(apt.slot.endAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                                'No time info'
                              }
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-600">
                                {apt.clientName ? apt.clientName.slice(0, 2).toUpperCase() : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">{apt.clientName || 'Unknown Client'}</span>
                              <p className="text-xs text-gray-500">{apt.clientPhone || 'No phone'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(apt.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Confirm</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: Card View */}
            <div className="lg:hidden space-y-3">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <CalendarDays className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500">No appointments found</p>
                    <Button
                      variant="link"
                      onClick={() => setSheetOpen(true)}
                      className="text-indigo-600"
                    >
                      Create your first appointment
                    </Button>
                  </div>
                </div>
              ) : (
                filteredAppointments.map((apt) => {
                  const MobileCardComponent = () => (
                    <MobileAppointmentCard 
                      id={apt.id}
                      service={apt.service?.name || 'Unknown Service'}
                      date={apt.slot?.startAt ? new Date(apt.slot.startAt).toLocaleDateString() : 'No date'}
                      timeStart={apt.slot?.startAt ? new Date(apt.slot.startAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No time'}
                      timeEnd={apt.slot?.endAt ? new Date(apt.slot.endAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No time'}
                      client={apt.clientName || 'Unknown Client'}
                      status={apt.status}
                    />
                  );
                  return <MobileCardComponent key={apt.id} />;
                })
              )}
            </div>

            {/* Pagination */}
            {filteredAppointments.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 lg:mt-6">
                <p className="text-sm text-gray-600">
                  Showing {filteredAppointments.length} of {appointments?.length || 0} appointments
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AppointmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <AppointmentFormSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}