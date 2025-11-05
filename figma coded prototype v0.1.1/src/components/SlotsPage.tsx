import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Clock,
  Calendar,
  TrendingUp,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Download,
  Sparkles,
  Trash2,
  Zap,
  CalendarClock,
  Edit,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { PageHeader } from "./PageHeader";
import { SlotGenerationSheet } from "./SlotGenerationSheet";
import { TablePagination } from "./TablePagination";
import { toast } from "sonner@2.0.3";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";

interface SlotsPageProps {
  onMenuClick?: () => void;
}

interface Slot {
  id: number;
  service: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
  status: "available" | "booked" | "unavailable";
}

export function SlotsPage({ onMenuClick }: SlotsPageProps) {
  const [generationSheetOpen, setGenerationSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const stats = [
    {
      icon: CalendarClock,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Total Slots",
      value: 217,
      subtitle: "All time slots",
    },
    {
      icon: Calendar,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Available",
      value: 212,
      subtitle: "Ready to book",
    },
    {
      icon: TrendingUp,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Utilization",
      value: "2.3%",
      subtitle: "Slots booked",
    },
  ];

  const services = [
    { id: 1, name: "Test One", duration: 30 },
    { id: 2, name: "Test Two", duration: 180 },
    { id: 3, name: "Test Two Demo Some", duration: 30 },
  ];

  const mockSlots: Slot[] = [
    {
      id: 1,
      service: "Test One",
      date: "2025-10-20",
      startTime: "09:00",
      endTime: "09:30",
      duration: 30,
      capacity: 1,
      status: "unavailable",
    },
    {
      id: 2,
      service: "Test Two",
      date: "2025-10-20",
      startTime: "09:00",
      endTime: "12:00",
      duration: 180,
      capacity: 1,
      status: "booked",
    },
    {
      id: 3,
      service: "Test One",
      date: "2025-10-20",
      startTime: "09:30",
      endTime: "10:00",
      duration: 30,
      capacity: 1,
      status: "unavailable",
    },
    {
      id: 4,
      service: "Test One",
      date: "2025-10-20",
      startTime: "10:00",
      endTime: "10:30",
      duration: 30,
      capacity: 1,
      status: "unavailable",
    },
    {
      id: 5,
      service: "Test Two",
      date: "2025-10-20",
      startTime: "10:00",
      endTime: "13:00",
      duration: 180,
      capacity: 1,
      status: "unavailable",
    },
    {
      id: 6,
      service: "Test One",
      date: "2025-10-20",
      startTime: "10:30",
      endTime: "11:00",
      duration: 30,
      capacity: 1,
      status: "available",
    },
    {
      id: 7,
      service: "Test Two",
      date: "2025-10-20",
      startTime: "10:30",
      endTime: "13:30",
      duration: 180,
      capacity: 1,
      status: "available",
    },
  ];

  const filteredSlots = mockSlots.filter((slot) => {
    const matchesSearch =
      slot.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.date.includes(searchQuery);
    const matchesService =
      serviceFilter === "all" || slot.service === serviceFilter;
    const matchesStatus =
      statusFilter === "all" || slot.status === statusFilter;
    const matchesDate = !dateFilter || slot.date === dateFilter;
    return matchesSearch && matchesService && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSlots.length / pageSize);
  const paginatedSlots = filteredSlots.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const clearFilters = () => {
    setSearchQuery("");
    setServiceFilter("all");
    setStatusFilter("all");
    setDateFilter("");
  };

  const hasActiveFilters =
    searchQuery || serviceFilter !== "all" || statusFilter !== "all" || dateFilter;

  const handleRefresh = () => {
    toast.success("Slots refreshed");
  };

  const handleDeleteEmpty = () => {
    const emptyCount = mockSlots.filter(
      (slot) => slot.status === "available"
    ).length;
    toast.success(`Deleted ${emptyCount} empty slots`);
  };

  const getStatusBadge = (status: Slot["status"]) => {
    const styles = {
      available: "bg-emerald-50 text-emerald-700 border-emerald-200",
      booked: "bg-amber-50 text-amber-700 border-amber-200",
      unavailable: "bg-red-50 text-red-700 border-red-200",
    };

    const labels = {
      available: "Available",
      booked: "Booked",
      unavailable: "Unavailable",
    };

    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <PageHeader
        icon={<Clock className="w-7 h-7 text-white" />}
        title="Slot Management"
        description="Create and manage time slots for your services"
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
              onClick={() => setGenerationSheetOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Slots
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

          {/* Slot Management Card */}
          <Card className="p-4 lg:p-6 bg-white">
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2 mb-6 pb-6 border-b">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => setGenerationSheetOpen(true)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Quick Generate
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
                    onClick={() => setGenerationSheetOpen(true)}
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
                  {paginatedSlots.map((slot) => (
                    <Card key={slot.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {slot.service}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(slot.date).toLocaleDateString("en-US", {
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
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <div>{slot.duration} min</div>
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
                      {paginatedSlots.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell>{slot.service}</TableCell>
                          <TableCell>
                            {new Date(slot.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            {slot.startTime} - {slot.endTime}
                          </TableCell>
                          <TableCell>{slot.duration} min</TableCell>
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

                {/* Pagination */}
                {filteredSlots.length > 0 && (
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={filteredSlots.length}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                )}
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Generation Sheet */}
      <SlotGenerationSheet
        open={generationSheetOpen}
        onOpenChange={setGenerationSheetOpen}
        onGenerate={() => {
          // Handle generation logic here
        }}
      />
    </div>
  );
}