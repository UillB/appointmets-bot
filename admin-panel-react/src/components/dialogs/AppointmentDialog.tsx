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
import { ScrollArea } from "../ui/scroll-area";
import { CalendarIcon, Clock, X } from "lucide-react";
import { apiClient } from "../../services/api";
import { toast } from "sonner";
import { format } from "date-fns";

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
        chatId: clientId || `client_${Date.now()}`, // Use clientId or generate a unique chatId
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
      <DrawerContent className="bg-white border shadow-lg">
        <DrawerHeader className="border-b bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-white text-2xl font-bold">
                  Create New Appointment
                </DrawerTitle>
                <DrawerDescription className="text-white/90 text-base">
                  Fill in the details below to create a new appointment.
                </DrawerDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
            {/* Client Information */}
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sm font-semibold text-gray-700">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-sm font-semibold text-gray-700">Client ID</Label>
              <Input
                id="clientId"
                placeholder="Enter client ID or phone"
                className="h-12 text-base"
              />
            </div>

            {/* Service Selection */}
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Select required>
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test-one">
                    Test One
                  </SelectItem>
                  <SelectItem value="test-two">
                    Test Two
                  </SelectItem>
                  <SelectItem value="haircut">
                    Haircut
                  </SelectItem>
                  <SelectItem value="consultation">
                    Consultation
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !date && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date
                        ? format(date, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                  >
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
                <Label htmlFor="time">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="time"
                    type="time"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select defaultValue="30">
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="pending">
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    Pending
                  </SelectItem>
                  <SelectItem value="confirmed">
                    Confirmed
                  </SelectItem>
                  <SelectItem value="cancelled">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
            </div>
          </form>
        </div>

        <DrawerFooter className="border-t bg-white p-6">
          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white h-12 text-base font-semibold"
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}