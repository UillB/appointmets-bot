import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Textarea } from "./ui/textarea";
import { CalendarIcon, Clock, User, Phone, X } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "./ui/scroll-area";
import { toastNotifications } from "./toast-notifications";
import { StepIndicator } from "./StepIndicator";

interface AppointmentFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentFormSheet({
  open,
  onOpenChange,
}: AppointmentFormSheetProps) {
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    clientName: "",
    clientId: "",
    service: "",
    time: "",
    duration: "30",
    status: "pending",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.clientName || !formData.service || !date || !formData.time) {
      toastNotifications.errors.validation("Please fill in all required fields");
      return;
    }

    // Handle form submission
    toastNotifications.appointments.created();
    onOpenChange(false);
    
    // Reset form
    setFormData({
      clientName: "",
      clientId: "",
      service: "",
      time: "",
      duration: "30",
      status: "pending",
      notes: "",
    });
    setDate(undefined);
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form on cancel
    setFormData({
      clientName: "",
      clientId: "",
      service: "",
      time: "",
      duration: "30",
      status: "pending",
      notes: "",
    });
    setDate(undefined);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-lg flex flex-col h-screen">
        {/* Header - Fixed */}
        <DrawerHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl">Create New Appointment</DrawerTitle>
                <DrawerDescription>
                  Follow the steps below to create a new appointment
                </DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
          <form onSubmit={handleSubmit} id="appointment-form" className="space-y-2">
            {/* Step 1: Client Information */}
            <StepIndicator
              stepNumber={1}
              title="Client Information"
              description="Enter the client's basic details"
            />
            <div className="pl-14 space-y-4 pb-6">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-sm">
                  Client Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  placeholder="Enter client name"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId" className="text-sm">
                  Client ID or Phone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="clientId"
                    value={formData.clientId}
                    onChange={(e) =>
                      setFormData({ ...formData, clientId: e.target.value })
                    }
                    placeholder="Enter client ID or phone"
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Service Selection */}
            <StepIndicator
              stepNumber={2}
              title="Service Details"
              description="Select the service and duration"
            />
            <div className="pl-14 space-y-4 pb-6">
              <div className="space-y-2">
                <Label htmlFor="service" className="text-sm">
                  Service <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) =>
                    setFormData({ ...formData, service: value })
                  }
                  required
                >
                  <SelectTrigger id="service" className="h-11">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="haircut">Haircut</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="manicure">Manicure</SelectItem>
                    <SelectItem value="massage">Massage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm">Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) =>
                    setFormData({ ...formData, duration: value })
                  }
                >
                  <SelectTrigger id="duration" className="h-11">
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
            </div>

            {/* Step 3: Date and Time */}
            <StepIndicator
              stepNumber={3}
              title="Date & Time"
              description="Choose when the appointment will take place"
            />
            <div className="pl-14 space-y-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left h-11 ${
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
                  <Label htmlFor="time" className="text-sm">
                    Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Step 4: Additional Notes */}
            <StepIndicator
              stepNumber={4}
              title="Additional Notes"
              description="Add any extra information (optional)"
              isLast
            />
            <div className="pl-14 space-y-2 pb-4">
              <Label htmlFor="notes" className="text-sm">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any additional notes..."
                rows={3}
                className="resize-none"
              />
            </div>
          </form>
          </div>
        </div>

        {/* Footer - Fixed */}
        <DrawerFooter className="border-t bg-gray-50 flex-shrink-0">
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="appointment-form"
              className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700"
            >
              Create Appointment
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
