import { useState } from "react";
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

export function AppointmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState("all");

  const stats = [
    {
      icon: CalendarDays,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Total Appointments",
      value: 5,
      subtitle: "All time bookings",
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Confirmed",
      value: 3,
      subtitle: "Successfully confirmed",
    },
    {
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "Pending",
      value: 0,
      subtitle: "Awaiting confirmation",
    },
    {
      icon: XCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      title: "Cancelled",
      value: 2,
      subtitle: "Cancelled bookings",
    },
  ];

  const appointments = [
    {
      id: 1,
      service: "Test One",
      date: "20/10/2025",
      timeStart: "13:00",
      timeEnd: "13:30",
      client: "282836139",
      status: "cancelled" as const,
    },
    {
      id: 2,
      service: "Test One",
      date: "20/10/2025",
      timeStart: "17:00",
      timeEnd: "17:30",
      client: "282836139",
      status: "cancelled" as const,
    },
    {
      id: 3,
      service: "Test One",
      date: "20/10/2025",
      timeStart: "15:30",
      timeEnd: "16:00",
      client: "282836139",
      status: "confirmed" as const,
    },
    {
      id: 4,
      service: "Test Two",
      date: "20/10/2025",
      timeStart: "09:00",
      timeEnd: "11:00",
      client: "282836139",
      status: "confirmed" as const,
    },
    {
      id: 5,
      service: "Test One",
      date: "20/10/2025",
      timeStart: "16:00",
      timeEnd: "16:30",
      client: "282836139",
      status: "confirmed" as const,
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

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab !== "all" && apt.status !== activeTab) return false;
    if (searchQuery && !apt.client.includes(searchQuery) && !apt.service.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedService !== "all" && apt.service !== selectedService) return false;
    return true;
  });

  const getTabCount = (tab: string) => {
    if (tab === "all") return appointments.length;
    return appointments.filter((apt) => apt.status === tab).length;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDate(undefined);
    setSelectedService("all");
  };

  const hasActiveFilters = searchQuery || date || selectedService !== "all";

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-600 mt-1">Manage appointments and bookings</p>
        </div>
        
        {/* Desktop: Dialog, Mobile: Sheet */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setDialogOpen(true)}
            className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            New Appointment
          </Button>
          
          <Button
            onClick={() => setSheetOpen(true)}
            className="sm:hidden flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Stats - Horizontal scroll on mobile */}
      <ScrollArea className="w-full lg:w-auto">
        <div className="flex lg:grid lg:grid-cols-4 gap-4 pb-2 lg:pb-0">
          {stats.map((stat) => (
            <div key={stat.title} className="min-w-[280px] lg:min-w-0">
              <StatCard {...stat} />
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Main Content Card */}
      <Card className="p-4 lg:p-6">
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
                        <SelectItem value="Test One">Test One</SelectItem>
                        <SelectItem value="Test Two">Test Two</SelectItem>
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
                  <SelectItem value="Test One">Test One</SelectItem>
                  <SelectItem value="Test Two">Test Two</SelectItem>
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
                        <span className="font-medium">{apt.service}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{apt.date}</p>
                        <p className="text-sm text-gray-500">
                          {apt.timeStart} - {apt.timeEnd}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-600">
                            {apt.client.slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-sm">{apt.client}</span>
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
            filteredAppointments.map((apt) => (
              <MobileAppointmentCard key={apt.id} {...apt} />
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredAppointments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 lg:mt-6">
            <p className="text-sm text-gray-600">
              Showing {filteredAppointments.length} of {appointments.length} appointments
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

      {/* Dialogs */}
      <AppointmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <AppointmentFormSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}