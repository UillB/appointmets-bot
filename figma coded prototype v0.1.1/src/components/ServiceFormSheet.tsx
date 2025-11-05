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
import { Textarea } from "./ui/textarea";
import { Wrench, X, DollarSign, Clock } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { toastNotifications } from "./toast-notifications";
import { Switch } from "./ui/switch";
import { StepIndicator } from "./StepIndicator";

interface ServiceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceFormSheet({
  open,
  onOpenChange,
}: ServiceFormSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "30",
    price: "",
    category: "",
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.price) {
      toastNotifications.errors.validation("Please fill in all required fields");
      return;
    }

    // Handle form submission
    toastNotifications.services.created(formData.name);
    onOpenChange(false);

    // Reset form
    setFormData({
      name: "",
      description: "",
      duration: "30",
      price: "",
      category: "",
      isActive: true,
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setFormData({
      name: "",
      description: "",
      duration: "30",
      price: "",
      category: "",
      isActive: true,
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-lg flex flex-col h-screen">
        {/* Header - Fixed */}
        <DrawerHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl">Create New Service</DrawerTitle>
                <DrawerDescription>
                  Follow the steps below to add a new service
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
          <form onSubmit={handleSubmit} id="service-form" className="space-y-2">
            {/* Step 1: Basic Information */}
            <StepIndicator
              stepNumber={1}
              title="Basic Information"
              description="Service name and description"
            />
            <div className="pl-14 space-y-4 pb-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">
                  Service Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Haircut, Massage, Consultation"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the service..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="category" className="h-11">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hair">Hair Services</SelectItem>
                    <SelectItem value="beauty">Beauty & Spa</SelectItem>
                    <SelectItem value="health">Health & Wellness</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Step 2: Pricing & Duration */}
            <StepIndicator
              stepNumber={2}
              title="Pricing & Duration"
              description="Set the price and time required"
            />
            <div className="pl-14 space-y-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                      className="pl-10 h-11"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm">
                    Duration <span className="text-red-500">*</span>
                  </Label>
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
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Auto Slot Generation:</strong> Time slots will be automatically
                  generated for 1 year based on the duration selected.
                </p>
              </div>
            </div>

            {/* Step 3: Availability */}
            <StepIndicator
              stepNumber={3}
              title="Availability Settings"
              description="Control if service is available for booking"
              isLast
            />
            <div className="pl-14 pb-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Active Service</p>
                    <p className="text-sm text-gray-600">
                      Service is available for booking
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
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
              form="service-form"
              className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700"
            >
              Create Service
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
