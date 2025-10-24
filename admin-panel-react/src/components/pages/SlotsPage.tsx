import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Clock,
  Calendar,
  TrendingUp,
  Plus,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Download,
  Sparkles,
  Trash2,
  CalendarDays,
  X,
  Zap,
  CalendarClock,
  Edit,
} from "lucide-react";
import { StatCard } from "../cards/StatCard";
import { PageHeader } from "../PageHeader";
import { toast } from "sonner";
import { apiClient, Slot, SlotGenerationRequest } from "../../services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";

// Using Slot interface from API

export function SlotsPage() {
  const [createSlotsOpen, setCreateSlotsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generation form state
  const [selectedService, setSelectedService] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("18:00");
  const [slotDuration, setSlotDuration] = useState("30");
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [enableBreak, setEnableBreak] = useState(false);
  const [breakStart, setBreakStart] = useState("13:00");
  const [breakEnd, setBreakEnd] = useState("14:00");
  const [selectedDays, setSelectedDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [slotsData, servicesData] = await Promise.all([
        apiClient.getSlots(),
        apiClient.getServices()
      ]);
      
      setSlots(slotsData.slots || []);
      setServices(servicesData.services || []);
    } catch (error) {
      console.error('Failed to load slots data:', error);
      toast.error('Failed to load slots data');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      icon: CalendarClock,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Total Slots",
      value: slots.length,
      subtitle: "All time slots",
    },
    {
      icon: Calendar,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Available",
      value: slots.filter(slot => slot.status === 'available').length,
      subtitle: "Ready to book",
    },
    {
      icon: TrendingUp,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Utilization",
      value: slots.length > 0 ? `${Math.round((slots.filter(slot => slot.status === 'booked').length / slots.length) * 100)}%` : "0%",
      subtitle: "Slots booked",
    },
  ];

  // Using real services from API

  const filteredSlots = slots.filter((slot) => {
    const matchesSearch =
      slot.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.startAt.includes(searchQuery);
    const matchesService =
      serviceFilter === "all" || slot.service.name === serviceFilter;
    const matchesStatus =
      statusFilter === "all" || slot.status === statusFilter;
    const matchesDate = !dateFilter || slot.startAt.includes(dateFilter);
    return matchesSearch && matchesService && matchesStatus && matchesDate;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setServiceFilter("all");
    setStatusFilter("all");
    setDateFilter("");
  };

  const hasActiveFilters =
    searchQuery || serviceFilter !== "all" || statusFilter !== "all" || dateFilter;

  const handleRefresh = () => {
    loadData();
    toast.success("Slots refreshed");
  };

  const handleGenerate = async () => {
    if (!selectedService || !startDate || !endDate) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      await apiClient.generateSlots({
        serviceId: parseInt(selectedService),
        startDate,
        endDate,
        startTime: workStart,
        endTime: workEnd,
        intervalMinutes: parseInt(slotDuration),
        capacity: 1
      });
      toast.success("Slots generated successfully", {
        description: `Generated slots for ${services.find(s => s.id === parseInt(selectedService))?.name}`,
      });
      loadData(); // Reload data after generation
    } catch (error) {
      console.error('Failed to generate slots:', error);
      toast.error('Failed to generate slots');
    }
  };

  const handleQuickGenerate = (period: string) => {
    const today = new Date();
    let start = today.toISOString().split("T")[0];
    let end = "";

    switch (period) {
      case "today":
        end = start;
        break;
      case "week":
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        end = nextWeek.toISOString().split("T")[0];
        break;
      case "month":
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        end = nextMonth.toISOString().split("T")[0];
        break;
    }

    setStartDate(start);
    setEndDate(end);
    toast.info(`Quick generation for ${period}`, {
      description: "Review and generate slots",
    });
  };

  const handleDeleteEmpty = async () => {
    try {
      const emptySlots = slots.filter(slot => slot.status === 'available');
      for (const slot of emptySlots) {
        await apiClient.deleteSlot(slot.id);
      }
      toast.success(`Deleted ${emptySlots.length} empty slots`);
      loadData(); // Reload data after deletion
    } catch (error) {
      console.error('Failed to delete empty slots:', error);
      toast.error('Failed to delete empty slots');
    }
  };

  const getStatusBadge = (status?: Slot["status"]) => {
    const styles = {
      available: "bg-emerald-50 text-emerald-700 border-emerald-200",
      booked: "bg-amber-50 text-amber-700 border-amber-200",
      conflict: "bg-red-50 text-red-700 border-red-200",
    };

    const labels = {
      available: "Available",
      booked: "Booked",
      conflict: "Conflict",
    };

    const statusKey = status || 'available';
    return (
      <Badge variant="outline" className={styles[statusKey]}>
        {labels[statusKey]}
      </Badge>
    );
  };

  const toggleDay = (day: keyof typeof selectedDays) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Clock className="w-7 h-7 text-white" />}
        title="Slot Management"
        description="Create and manage time slots for your services"
        onRefresh={handleRefresh}
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
              onClick={() => setCreateSlotsOpen(true)}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Slots
            </Button>
          </>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Slot Management */}
          <div className="space-y-6">
              <Card className="p-4 lg:p-6 bg-white">
                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-2 mb-6 pb-6 border-b">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleQuickGenerate("today")}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Quick: Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleQuickGenerate("week")}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Quick: This Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    onClick={handleDeleteEmpty}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Empty
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  {/* Mobile: Search + Filter Button */}
                  <div className="flex gap-2 lg:hidden">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search slots..."
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
                          <SheetDescription>Filter slots by criteria</SheetDescription>
                        </SheetHeader>
                        <div className="space-y-4 pt-6">
                          <div className="space-y-2">
                            <Label>Service</Label>
                            <Select
                              value={serviceFilter}
                              onValueChange={setServiceFilter}
                            >
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
                            <Label>Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                              <SelectTrigger>
                                <SelectValue placeholder="All Statuses" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="booked">Booked</SelectItem>
                                <SelectItem value="unavailable">Unavailable</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={dateFilter}
                              onChange={(e) => setDateFilter(e.target.value)}
                            />
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
                        placeholder="Search slots by service or date..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <Select value={serviceFilter} onValueChange={setServiceFilter}>
                      <SelectTrigger className="w-[200px]">
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

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="date"
                      className="w-[180px]"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />

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

                {/* Slots Table */}
                {filteredSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">No slots found</p>
                      <Button
                        variant="link"
                        onClick={() => setActiveTab("generation")}
                        className="text-indigo-600"
                      >
                        Generate your first slots
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Mobile View */}
                    <div className="lg:hidden space-y-3">
                      {filteredSlots.map((slot) => (
                        <Card key={slot.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {slot.service.name}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {new Date(slot.startAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                              {getStatusBadge(slot.status)}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {new Date(slot.startAt).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })} - {new Date(slot.endAt).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div>{slot.service.durationMin} min</div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSlots.map((slot) => (
                            <TableRow key={slot.id}>
                              <TableCell>{slot.service.name}</TableCell>
                              <TableCell>
                                {new Date(slot.startAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </TableCell>
                              <TableCell>
                                {new Date(slot.startAt).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })} - {new Date(slot.endAt).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </TableCell>
                              <TableCell>{slot.service.durationMin} min</TableCell>
                              <TableCell>{slot.capacity}</TableCell>
                              <TableCell>{getStatusBadge(slot.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Results count */}
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        Showing {filteredSlots.length} of {slots.length} slots
                      </p>
                    </div>
                  </>
                )}
              </Card>
          </div>

          {/* Create Slots Drawer */}
          <Sheet open={createSlotsOpen} onOpenChange={setCreateSlotsOpen}>
            <SheetContent side="right" className="w-[400px] sm:w-[500px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Create Time Slots
                </SheetTitle>
                <SheetDescription>
                  Generate time slots for your services automatically
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 pt-6">
                {/* Service Selection */}
                <div className="space-y-2">
                  <Label htmlFor="service">
                    Service <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedService}
                    onValueChange={setSelectedService}
                  >
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name} ({service.durationMin} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Period */}
                <div className="space-y-2">
                  <Label>
                    Period <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date" className="text-sm text-gray-600">
                        Start Date
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date" className="text-sm text-gray-600">
                        End Date
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="space-y-2">
                  <Label>
                    Working Hours <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="work-start" className="text-sm text-gray-600">
                        Start
                      </Label>
                      <Input
                        id="work-start"
                        type="time"
                        value={workStart}
                        onChange={(e) => setWorkStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="work-end" className="text-sm text-gray-600">
                        End
                      </Label>
                      <Input
                        id="work-end"
                        type="time"
                        value={workEnd}
                        onChange={(e) => setWorkEnd(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Slot Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Slot Duration <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="duration"
                      type="number"
                      min="5"
                      step="5"
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex items-center px-4 bg-gray-50 border rounded-md">
                      <span className="text-sm text-gray-600">minutes</span>
                    </div>
                  </div>
                </div>

                {/* Working Days */}
                <div className="space-y-3">
                  <Label>Working Days</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(selectedDays).map(([day, isSelected]) => (
                      <div
                        key={day}
                        className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleDay(day as keyof typeof selectedDays)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            toggleDay(day as keyof typeof selectedDays)
                          }
                        />
                        <label className="text-sm capitalize cursor-pointer">
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Break Time */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Lunch Break</Label>
                      <p className="text-sm text-gray-500">
                        Exclude lunch break from generation
                      </p>
                    </div>
                    <Switch
                      checked={enableBreak}
                      onCheckedChange={setEnableBreak}
                    />
                  </div>

                  {enableBreak && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <Label htmlFor="break-start" className="text-sm text-gray-600">
                          Start
                        </Label>
                        <Input
                          id="break-start"
                          type="time"
                          value={breakStart}
                          onChange={(e) => setBreakStart(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="break-end" className="text-sm text-gray-600">
                          End
                        </Label>
                        <Input
                          id="break-end"
                          type="time"
                          value={breakEnd}
                          onChange={(e) => setBreakEnd(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <div className="pt-6 flex gap-3">
                  <Button
                    onClick={handleGenerate}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Slots
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedService("");
                      setStartDate("");
                      setEndDate("");
                      setWorkStart("09:00");
                      setWorkEnd("18:00");
                      setSlotDuration("30");
                      setEnableBreak(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
