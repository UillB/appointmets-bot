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
      <DrawerContent className="bg-white border shadow-lg">
        <DrawerHeader className="border-b bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-white text-2xl font-bold">
                  {isEdit ? "Edit Service" : "Add New Service"}
                </DrawerTitle>
                <DrawerDescription className="text-white/90 text-base">
                  {isEdit 
                    ? "Update service information and settings."
                    : "Create a new service for appointments"}
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
          <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="serviceName" className="text-sm font-semibold text-gray-700">
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


              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the service..."
                  rows={4}
                  defaultValue={service?.description}
                  className="text-base"
                />
              </div>
              
              {/* Submit and Cancel buttons inside the form */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 text-base font-semibold"
                >
                  {isLoading ? "Saving..." : (isEdit ? "Update Service" : "Create Service")}
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
      </DrawerContent>
    </Drawer>
  );
}
