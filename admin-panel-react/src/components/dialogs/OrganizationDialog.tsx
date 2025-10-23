import React, { useState } from "react";
import { X, Building2, Mail, Phone, MapPin } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { apiClient } from "../../services/api";
import { toast } from "sonner";

interface OrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    description: string;
  } | null;
  onSave: (data: any) => void;
}

export function OrganizationDialog({
  open,
  onOpenChange,
  organization,
  onSave,
}: OrganizationDialogProps) {
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    email: organization?.email || "",
    phone: organization?.phone || "",
    address: organization?.address || "",
    description: organization?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Organization form submitted!');
    
    try {
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        toast.error("Organization name is required");
        return;
      }

      const organizationData = {
        name: formData.name.trim(),
        description: formData.description || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      };

      console.log('Sending organization data:', organizationData);

      if (organization) {
        console.log('Updating organization:', organization.id);
        await apiClient.updateOrganization(parseInt(organization.id), organizationData);
        toast.success("Organization updated successfully");
      } else {
        console.log('Creating new organization');
        const result = await apiClient.createOrganization(organizationData);
        console.log('Organization created:', result);
        toast.success("Organization created successfully");
      }

      console.log('Calling onSave and closing dialog');
      onSave?.(organizationData);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        description: "",
      });
    } catch (error) {
      console.error('Organization save error:', error);
      toast.error("Failed to save organization");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-white border shadow-lg">
        <DrawerHeader className="border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-white text-2xl font-bold">
                  {organization ? "Edit Organization" : "Add New Organization"}
                </DrawerTitle>
                <DrawerDescription className="text-white/90 text-base">
                  {organization ? "Update organization information" : "Create a new organization"}
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
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Organization Name *
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Acme Corporation"
                  required
                  className="h-12 pl-10 text-base"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the organization..."
                rows={3}
                className="text-base"
              />
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@example.com"
                    required
                    className="h-12 pl-10 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    required
                    className="h-12 pl-10 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Address</h3>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, City, State, ZIP"
                    className="h-12 pl-10 text-base"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <DrawerFooter className="border-t bg-white p-6">
          <div className="flex gap-4">
            <Button
              type="submit" 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12 text-base font-semibold"
            >
              {organization ? "Save Changes" : "Create Organization"}
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
