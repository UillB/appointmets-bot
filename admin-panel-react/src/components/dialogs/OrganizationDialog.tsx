import React, { useState } from "react";
import { X, Building2, Mail, Phone, MapPin } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { apiClient } from "../../services/api";
import { toast } from "sonner";
import { StepIndicator } from "../StepIndicator";

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

      if (organization) {
        await apiClient.updateOrganization(parseInt(organization.id), organizationData);
        toast.success("Organization updated successfully");
      } else {
        const result = await apiClient.createOrganization(organizationData);
        toast.success("Organization created successfully");
      }

      onSave?.(organizationData);
      onOpenChange(false);
      
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

  const isEdit = !!organization;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-lg flex flex-col h-screen bg-white border shadow-lg">
        <DrawerHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl text-gray-900">
                  {isEdit ? "Edit Organization" : "Create New Organization"}
                </DrawerTitle>
                <DrawerDescription className="text-gray-600">
                  {isEdit 
                    ? "Update organization information"
                    : "Follow the steps below to add a new organization"}
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
            <form onSubmit={handleSubmit} id="organization-form" className="space-y-2">
              {!isEdit ? (
                <>
                  {/* Step 1: Basic Information */}
                  <StepIndicator
                    stepNumber={1}
                    title="Basic Information"
                    description="Organization name and description"
                  />
                  <div className="pl-14 space-y-4 pb-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">
                        Organization Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g., Acme Corporation"
                          className="h-11 pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Brief description of the organization..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  {/* Step 2: Contact Information */}
                  <StepIndicator
                    stepNumber={2}
                    title="Contact Information"
                    description="Email, phone, and address"
                    isLast={true}
                  />
                  <div className="pl-14 space-y-4 pb-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">
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
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">
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
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm">
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
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
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
                        className="h-12 pl-10 text-base"
                      />
                    </div>
                  </div>

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
              )}

              {/* Submit and Cancel buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 text-base font-semibold"
                >
                  {isEdit ? "Save Changes" : "Create Organization"}
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
