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
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { X, Wrench, Clock } from "lucide-react";
import { apiClient } from "../../services/api";
import { toast } from "sonner";
import { StepIndicator } from "../StepIndicator";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: {
    id: number;
    name: string;
    durationMin: number;
    price?: number;
    currency?: string;
    description?: string;
    nameRu?: string;
    nameEn?: string;
    nameHe?: string;
    descriptionRu?: string;
    descriptionEn?: string;
    descriptionHe?: string;
  };
  onServiceSaved?: () => void;
}

export function ServiceDialog({ open, onOpenChange, service, onServiceSaved }: ServiceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  console.log('ServiceDialog render - open:', open);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!');
    setIsLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const serviceName = formData.get('serviceName');
      const duration = formData.get('duration');

      console.log('Form data:', { serviceName, duration });

      // Validate required fields
      if (!serviceName || typeof serviceName !== 'string' || !serviceName.trim()) {
        toast.error("Service name is required");
        setIsLoading(false);
        return;
      }

      if (!duration || typeof duration !== 'string' || isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
        toast.error("Valid duration is required");
        setIsLoading(false);
        return;
      }

      const serviceData = {
        name: serviceName.trim(),
        description: (formData.get('description') as string) || undefined,
        durationMin: parseInt(duration as string),
        price: formData.get('price') ? parseFloat(formData.get('price') as string) : undefined,
        currency: (formData.get('currency') as string) || 'RUB',
        organizationId: 3, // Demo organization
      };

      console.log('Sending service data:', serviceData);
      
      if (service) {
        console.log('Updating service:', service.id);
        await apiClient.updateService(service.id, serviceData);
        toast.success("Service updated successfully");
      } else {
        console.log('Creating new service');
        const result = await apiClient.createService(serviceData);
        console.log('Service created:', result);
        toast.success("Service created successfully");
      }

      console.log('Calling onServiceSaved and closing dialog');
      onServiceSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Service save error:', error);
      toast.error("Failed to save service");
    } finally {
      setIsLoading(false);
    }
  };

  const isEdit = !!service;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg flex flex-col h-full">
        <DrawerHeader className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl text-gray-900 dark:text-gray-100">
                  {isEdit ? "Edit Service" : "Create New Service"}
                </DrawerTitle>
                <DrawerDescription className="text-gray-600 dark:text-gray-400">
                  {isEdit 
                    ? "Update service information and settings."
                    : "Follow the steps below to add a new service"}
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

        <div className="flex-1 overflow-hidden min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <form onSubmit={handleSubmit} id="service-form" className="space-y-2">
            {/* Step 1: Basic Information */}
            {!isEdit ? (
              <>
                <StepIndicator
                  stepNumber={1}
                  title="Basic Information"
                  description="Service name and description"
                />
                <div className="pl-14 space-y-4 pb-6">
                  <div className="space-y-2">
                    <Label htmlFor="serviceName" className="text-sm">
                      Service Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="serviceName"
                      name="serviceName"
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
                      name="description"
                      placeholder="Describe the service..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Step 2: Pricing & Duration */}
                <StepIndicator
                  stepNumber={2}
                  title="Pricing & Duration"
                  description="Set the price and time required"
                  isLast={false}
                />
                <div className="pl-14 space-y-4 pb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm">
                        Duration (minutes) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="duration"
                          name="duration"
                          type="number"
                          placeholder="30"
                          min="1"
                          required
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm">
                        Price (optional)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">₽</span>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="h-11 pl-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
            /* Edit mode - simple form without steps */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Service Name *
                  </Label>
                  <Input
                    id="serviceName"
                    name="serviceName"
                    placeholder="e.g., Haircut & Styling"
                    defaultValue={service?.name}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the service..."
                    defaultValue={service?.description}
                    rows={4}
                    className="text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">
                      Duration (minutes) *
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        placeholder="30"
                        defaultValue={service?.durationMin}
                        min="1"
                        required
                        className="h-12 pl-10 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                      Price (optional)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₽</span>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        placeholder="0.00"
                        defaultValue={service?.price}
                        min="0"
                        step="0.01"
                        className="h-12 pl-8 text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Working Hours Configuration - only for create mode */}
            {!isEdit && (
              <>
                <StepIndicator
                  stepNumber={3}
                  title="Working Hours"
                  description="Configure when this service is available"
                  isLast={true}
                />
                <div className="pl-14 space-y-4 pb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workStart" className="text-sm">
                        Start Time <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="workStart"
                        name="workStart"
                        type="time"
                        defaultValue="09:00"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workEnd" className="text-sm">
                        End Time <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="workEnd"
                        name="workEnd"
                        type="time"
                        defaultValue="18:00"
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lunchStart" className="text-sm">
                        Lunch Break Start (optional)
                      </Label>
                      <Input
                        id="lunchStart"
                        name="lunchStart"
                        type="time"
                        defaultValue="13:00"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lunchEnd" className="text-sm">
                        Lunch Break End (optional)
                      </Label>
                      <Input
                        id="lunchEnd"
                        name="lunchEnd"
                        type="time"
                        defaultValue="14:00"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm">Working Days</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <div key={day} className="flex flex-col items-center space-y-1">
                          <Label htmlFor={`day-${index}`} className="text-xs text-gray-600 dark:text-gray-400">
                            {day}
                          </Label>
                          <input
                            id={`day-${index}`}
                            name={`workingDays`}
                            type="checkbox"
                            value={index}
                            defaultChecked={index < 5} // Monday-Friday by default
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}


              </form>
            </div>
          </ScrollArea>
        </div>

        <DrawerFooter className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0 p-6">
          <div className="flex gap-4">
            <Button
              type="submit" 
              form="service-form"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 text-base font-semibold"
            >
              {isLoading ? "Saving..." : (isEdit ? "Update Service" : "Create Service")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 text-base font-semibold border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
