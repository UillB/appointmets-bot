import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { PageHeader } from "../PageHeader";
import { toast } from "sonner";
import { apiClient } from "../../services/api";
import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";

interface Slot {
  id: number;
  serviceId: number;
  startAt: string;
  endAt: string;
  capacity: number;
  status?: 'available' | 'booked' | 'conflict';
  isBooked?: boolean;
  hasConflict?: boolean;
  service: {
    id: number;
    name: string;
    durationMin: number;
    organizationId: number;
  };
}

interface Service {
  id: number;
  name: string;
  durationMin: number;
  organizationId: number;
}

export function SlotsManagementPage({ 
  serviceId, 
  onBack 
}: { 
  serviceId?: number;
  onBack?: () => void;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(serviceId || null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Generation form state
  const [generationForm, setGenerationForm] = useState({
    serviceId: selectedService || 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "18:00",
    includeWeekends: false,
    lunchBreakStart: "12:00",
    lunchBreakEnd: "13:00",
    slotDuration: 30,
  });

  // Load data on mount
  useEffect(() => {
    loadServices();
    if (selectedService) {
      loadSlots();
    }
  }, [selectedService, selectedDate]);

  const loadServices = async () => {
    try {
      const response = await apiClient.getServices();
      setServices(response.services || []);
      if (response.services.length > 0 && !selectedService) {
        setSelectedService(response.services[0].id);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
      toast.error("Failed to load services");
    }
  };

  const loadSlots = async () => {
    if (!selectedService) return;

    try {
      setIsLoading(true);
      const response = await apiClient.getSlots({
        serviceId: selectedService,
        date: selectedDate,
        limit: 100
      });
      setSlots(response.slots || []);
    } catch (error) {
      console.error('Failed to load slots:', error);
      toast.error("Failed to load slots");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlots = async () => {
    if (!generationForm.serviceId) {
      toast.error("Please select a service");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await apiClient.generateSlots({
        serviceId: generationForm.serviceId,
        startDate: generationForm.startDate,
        endDate: generationForm.endDate,
        startTime: generationForm.startTime,
        endTime: generationForm.endTime,
        intervalMinutes: generationForm.slotDuration,
        capacity: 1
      });
      
      toast.success(`Generated ${response.slotsCreated} slots successfully`);
      setShowGenerateDialog(false);
      await loadSlots();
    } catch (error) {
      console.error('Failed to generate slots:', error);
      toast.error("Failed to generate slots");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteSlot = async (slotId: number) => {
    if (!confirm("Are you sure you want to delete this slot?")) {
      return;
    }

    try {
      await apiClient.deleteSlot(slotId);
      toast.success("Slot deleted successfully");
      await loadSlots();
    } catch (error) {
      console.error('Failed to delete slot:', error);
      toast.error("Failed to delete slot");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'booked':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'conflict':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return "text-green-600 bg-green-50";
      case 'booked':
        return "text-red-600 bg-red-50";
      case 'conflict':
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatSlotTime = (startAt: string, endAt: string) => {
    const start = parseISO(startAt);
    const end = parseISO(endAt);
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  const formatSlotDate = (date: string) => {
    const slotDate = parseISO(date);
    if (isToday(slotDate)) return "Today";
    if (isTomorrow(slotDate)) return "Tomorrow";
    if (isYesterday(slotDate)) return "Yesterday";
    return format(slotDate, 'MMM dd, yyyy');
  };

  const filteredSlots = slots.filter(slot => {
    const matchesSearch = slot.service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || slot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Calendar className="w-7 h-7 text-white" />}
        title="Manage Slots"
        description={`Manage time slots for ${selectedServiceData?.name || 'selected service'}`}
        onRefresh={loadSlots}
        actions={
          <>
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="hidden sm:flex bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={loadSlots}
              className="hidden sm:flex bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Slots
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Generate Time Slots</DialogTitle>
                  <DialogDescription>
                    Create time slots for the selected service
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service">Service</Label>
                      <Select
                        value={generationForm.serviceId.toString()}
                        onValueChange={(value) => setGenerationForm(prev => ({ ...prev, serviceId: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map(service => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration">Slot Duration (minutes)</Label>
                      <Select
                        value={generationForm.slotDuration.toString()}
                        onValueChange={(value) => setGenerationForm(prev => ({ ...prev, slotDuration: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">120 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={generationForm.startDate}
                        onChange={(e) => setGenerationForm(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={generationForm.endDate}
                        onChange={(e) => setGenerationForm(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={generationForm.startTime}
                        onChange={(e) => setGenerationForm(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={generationForm.endTime}
                        onChange={(e) => setGenerationForm(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="includeWeekends"
                        checked={generationForm.includeWeekends}
                        onCheckedChange={(checked) => setGenerationForm(prev => ({ ...prev, includeWeekends: checked }))}
                      />
                      <Label htmlFor="includeWeekends">Include weekends</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lunchStart">Lunch Break Start</Label>
                        <Input
                          id="lunchStart"
                          type="time"
                          value={generationForm.lunchBreakStart}
                          onChange={(e) => setGenerationForm(prev => ({ ...prev, lunchBreakStart: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lunchEnd">Lunch Break End</Label>
                        <Input
                          id="lunchEnd"
                          type="time"
                          value={generationForm.lunchBreakEnd}
                          onChange={(e) => setGenerationForm(prev => ({ ...prev, lunchBreakEnd: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowGenerateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={generateSlots}
                      disabled={isGenerating}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isGenerating ? "Generating..." : "Generate Slots"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {/* Filters */}
      <Card className="p-4 lg:p-6 bg-white">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Service Selection */}
          <div className="space-y-2">
            <Label>Service</Label>
            <Select
              value={selectedService?.toString() || ""}
              onValueChange={(value) => setSelectedService(parseInt(value))}
            >
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full lg:w-[200px]"
            />
          </div>

          {/* Search */}
          <div className="space-y-2 flex-1">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search slots..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="conflict">Conflict</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Slots Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading slots...</p>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Calendar className="w-12 h-12 text-gray-300" />
              <p className="text-gray-500">No slots found</p>
              <Button
                variant="link"
                onClick={() => setShowGenerateDialog(true)}
                className="text-indigo-600"
              >
                Generate slots for this service
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSlots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">
                      {formatSlotDate(slot.startAt)}
                    </TableCell>
                    <TableCell>
                      {formatSlotTime(slot.startAt, slot.endAt)}
                    </TableCell>
                    <TableCell>{slot.service.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(slot.status || 'available')}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.status || 'available')}`}>
                          {slot.status || 'available'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{slot.capacity}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSlot(slot.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Results count */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {filteredSlots.length} of {slots.length} slots
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
