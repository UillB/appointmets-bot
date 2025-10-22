import React, { useState } from "react";
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
  Wrench,
  Calendar,
  TrendingUp,
  Plus,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Download,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { ServiceCard } from "./ServiceCard";
import { ServiceDialog } from "./ServiceDialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { PageHeader } from "./PageHeader";
import { toast } from "sonner";

interface ServicesPageProps {
  onMenuClick?: () => void;
}

export function ServicesPage({ onMenuClick }: ServicesPageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const stats = [
    {
      icon: Wrench,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Total Services",
      value: 3,
      subtitle: "Active services",
    },
    {
      icon: Calendar,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Total Bookings",
      value: 5,
      subtitle: "All time bookings",
    },
    {
      icon: TrendingUp,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Average Occupancy",
      value: "1%",
      subtitle: "Capacity utilization",
    },
  ];

  const services = [
    {
      id: 1,
      name: "Test Two Demo Some",
      category: "General",
      price: 0,
      duration: 30,
      occupancy: 0,
      slotsBooked: 0,
      totalSlots: 0,
      bookings: 0,
    },
    {
      id: 2,
      name: "Test Two",
      category: "General",
      price: 0,
      duration: 180,
      occupancy: 3,
      slotsBooked: 1,
      totalSlots: 40,
      bookings: 1,
    },
    {
      id: 3,
      name: "Test One",
      category: "General",
      price: 0,
      duration: 30,
      occupancy: 1,
      slotsBooked: 4,
      totalSlots: 168,
      bookings: 4,
    },
  ];

  const filteredServices = services?.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || service.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all";

  const handleRefresh = () => {
    toast.success("Services refreshed");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <PageHeader
        icon={<Wrench className="w-7 h-7 text-white" />}
        title="Services"
        description="Manage your services and track their performance"
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
              className="bg-indigo-600 hover:bg-indigo-700"
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
                      category={service.category}
                      price={service.price}
                      duration={service.duration}
                      occupancy={service.occupancy}
                      slotsBooked={service.slotsBooked}
                      totalSlots={service.totalSlots}
                      bookings={service.bookings}
                      onEdit={() => setDialogOpen(true)}
                      onDelete={() => {
                        // Handle delete
                      }}
                      onManageSlots={() => {
                        // Handle manage slots
                      }}
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
          <ServiceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </div>
      </div>
    </div>
  );
}