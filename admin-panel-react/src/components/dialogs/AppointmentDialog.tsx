import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Textarea } from "../ui/textarea";
import { CalendarIcon, Clock, X, Loader2 } from "lucide-react";
import { apiClient, Service, Slot } from "../../services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { StepIndicator } from "../StepIndicator";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentSaved?: () => void;
}

export function AppointmentDialog({
  open,
  onOpenChange,
  onAppointmentSaved,
}: AppointmentDialogProps) {
  const [date, setDate] = useState<Date>();
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load services when dialog opens
  useEffect(() => {
    if (open) {
      loadServices();
    }
  }, [open]);

  // Load slots when service or date changes
  useEffect(() => {
    if (open && selectedServiceId && date) {
      loadSlots(parseInt(selectedServiceId), date);
    } else {
      setSlots([]);
    }
  }, [open, selectedServiceId, date]);

  const loadServices = async () => {
    try {
      setIsLoadingServices(true);
      const response = await apiClient.getServices();
      setServices(response.services);
    } catch (error) {
      console.error('Failed to load services:', error);
      toast.error("Failed to load services");
    } finally {
      setIsLoadingServices(false);
    }
  };

  const loadSlots = async (serviceId: number, selectedDate: Date) => {
    try {
      setIsLoadingSlots(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await apiClient.getSlots({ serviceId, date: dateStr });
      setSlots(response.slots);
    } catch (error) {
      console.error('Failed to load slots:', error);
      toast.error("Failed to load time slots");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const clientId = formData.get('clientId') as string;
      const serviceId = formData.get('service') as string;
      const slotId = formData.get('slot') as string;

      // Validate required fields
      if (!serviceId) {
        toast.error("Please select a service");
        setIsSubmitting(false);
        return;
      }

      if (!date) {
        toast.error("Please select a date");
        setIsSubmitting(false);
        return;
      }

      if (!slotId) {
        toast.error("Please select a time slot");
        setIsSubmitting(false);
        return;
      }

      const appointmentData = {
        chatId: clientId?.trim() || `client_${Date.now()}`,
        serviceId: parseInt(serviceId),
        slotId: parseInt(slotId),
      };

      await apiClient.createAppointment(appointmentData);
      
      toast.success("Appointment created successfully");
      
      // Reset form
      setDate(undefined);
      setSelectedServiceId("");
      setSlots([]);
      
      // Call callback to refresh data
      onAppointmentSaved?.();
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Appointment creation error:', error);
      const errorMessage = error?.message || "Failed to create appointment";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-lg flex flex-col h-screen bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
        <DrawerHeader className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl text-gray-900 dark:text-gray-100">
                  Create New Appointment
                </DrawerTitle>
                <DrawerDescription className="text-gray-600 dark:text-gray-400">
                  Follow the steps below to create a new appointment
                </DrawerDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <form onSubmit={handleSubmit} id="appointment-form" className="space-y-2">
              {/* Step 1: Client Information */}
              <StepIndicator
                stepNumber={1}
                title="Client Information"
                description="Enter client details"
              />
              <div className="pl-14 space-y-4 pb-6">
                <div className="space-y-2">
                  <Label htmlFor="clientId" className="text-sm text-gray-700 dark:text-gray-300">
                    Client ID / Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clientId"
                    name="clientId"
                    placeholder="Enter client ID or phone number"
                    className="h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              </div>

              {/* Step 2: Service & Time */}
              <StepIndicator
                stepNumber={2}
                title="Service & Time"
                description="Select service and time slot"
                isLast={true}
              />
              <div className="pl-14 space-y-4 pb-6">
                <div className="space-y-2">
                  <Label htmlFor="service" className="text-sm text-gray-700 dark:text-gray-300">
                    Service <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    name="service" 
                    required
                    value={selectedServiceId}
                    onValueChange={(value) => {
                      setSelectedServiceId(value);
                      setSlots([]); // Clear slots when service changes
                    }}
                  >
                    <SelectTrigger 
                      id="service" 
                      className="h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                      disabled={isLoadingServices}
                    >
                      <SelectValue placeholder={isLoadingServices ? "Loading services..." : "Select a service"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      {services.length === 0 && !isLoadingServices ? (
                        <SelectItem value="none" disabled>No services available</SelectItem>
                      ) : (
                        services.map((service) => (
                          <SelectItem 
                            key={service.id} 
                            value={service.id.toString()}
                            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            {service.name} {service.price ? `(${service.currency || 'USD'} ${service.price})` : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-700 dark:text-gray-300">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 ${
                          !date && "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          if (selectedDate && selectedServiceId) {
                            loadSlots(parseInt(selectedServiceId), selectedDate);
                          } else {
                            setSlots([]);
                          }
                        }}
                        initialFocus
                        className="bg-white dark:bg-gray-900"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slot" className="text-sm text-gray-700 dark:text-gray-300">
                    Time Slot <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    name="slot" 
                    required
                    disabled={!date || !selectedServiceId || isLoadingSlots || slots.length === 0}
                  >
                    <SelectTrigger 
                      id="slot" 
                      className="h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <SelectValue placeholder={
                        !date ? "Select a date first" :
                        !selectedServiceId ? "Select a service first" :
                        isLoadingSlots ? "Loading slots..." :
                        slots.length === 0 ? "No slots available" :
                        "Select a time slot"
                      } />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      {slots.length === 0 ? (
                        <SelectItem value="none" disabled>No slots available for this date</SelectItem>
                      ) : (
                        slots
                          .filter(slot => slot.status !== 'booked' || !slot.isBooked)
                          .map((slot) => {
                            const startTime = format(new Date(slot.startAt), 'HH:mm');
                            const endTime = format(new Date(slot.endAt), 'HH:mm');
                            return (
                              <SelectItem 
                                key={slot.id} 
                                value={slot.id.toString()}
                                className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                {startTime} - {endTime} {slot.status === 'conflict' ? '(Conflict)' : ''}
                              </SelectItem>
                            );
                          })
                      )}
                    </SelectContent>
                  </Select>
                  {isLoadingSlots && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading available slots...
                    </div>
                  )}
                </div>
              </div>

              {/* Submit and Cancel buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 text-base font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Appointment"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDate(undefined);
                    setSelectedServiceId("");
                    setSlots([]);
                    onOpenChange(false);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 h-12 text-base font-semibold border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
