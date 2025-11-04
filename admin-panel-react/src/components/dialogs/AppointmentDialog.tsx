import React, { useState } from "react";
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
import { CalendarIcon, Clock, X } from "lucide-react";
import { apiClient } from "../../services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { StepIndicator } from "../StepIndicator";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDialog({
  open,
  onOpenChange,
}: AppointmentDialogProps) {
  const [date, setDate] = useState<Date>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Appointment form submitted!');
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const clientName = formData.get('clientName') as string;
      const clientId = formData.get('clientId') as string;
      const serviceId = formData.get('service') as string;
      const slotId = formData.get('slot') as string;

      // Validate required fields
      if (!clientName || !clientName.trim()) {
        toast.error("Client name is required");
        return;
      }

      if (!serviceId) {
        toast.error("Please select a service");
        return;
      }

      if (!slotId) {
        toast.error("Please select a time slot");
        return;
      }

      const appointmentData = {
        chatId: clientId || `client_${Date.now()}`,
        serviceId: parseInt(serviceId),
        slotId: parseInt(slotId),
      };

      console.log('Sending appointment data:', appointmentData);
      const result = await apiClient.createAppointment(appointmentData);
      console.log('Appointment created:', result);
      
      toast.success("Appointment created successfully");
      onOpenChange(false);
    } catch (error) {
      console.error('Appointment creation error:', error);
      toast.error("Failed to create appointment");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-lg flex flex-col h-screen bg-white border shadow-lg">
        <DrawerHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl text-gray-900">
                  Create New Appointment
                </DrawerTitle>
                <DrawerDescription className="text-gray-600">
                  Follow the steps below to create a new appointment
                </DrawerDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 text-gray-600 hover:bg-gray-100"
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
                  <Label htmlFor="clientName" className="text-sm">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    placeholder="Enter client name"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId" className="text-sm">
                    Client ID (optional)
                  </Label>
                  <Input
                    id="clientId"
                    name="clientId"
                    placeholder="Enter client ID or phone"
                    className="h-11"
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
                  <Label htmlFor="service" className="text-sm">
                    Service <span className="text-red-500">*</span>
                  </Label>
                  <Select name="service" required>
                    <SelectTrigger id="service" className="h-11">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Test One</SelectItem>
                      <SelectItem value="2">Test Two</SelectItem>
                      <SelectItem value="3">Haircut</SelectItem>
                      <SelectItem value="4">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal h-11 ${
                            !date && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
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

                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slot" className="text-sm">
                    Time Slot <span className="text-red-500">*</span>
                  </Label>
                  <Select name="slot" required>
                    <SelectTrigger id="slot" className="h-11">
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">09:00 - 09:30</SelectItem>
                      <SelectItem value="2">09:30 - 10:00</SelectItem>
                      <SelectItem value="3">10:00 - 10:30</SelectItem>
                      <SelectItem value="4">10:30 - 11:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any additional notes..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Submit and Cancel buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 text-base font-semibold"
                >
                  Create Appointment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-12 text-base font-semibold border-gray-300 hover:bg-gray-50"
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
