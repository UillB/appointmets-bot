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
import { Building2, X, Mail, Phone, MapPin, Globe } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { toastNotifications } from "./toast-notifications";
import { StepIndicator } from "./StepIndicator";

interface OrganizationFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationFormSheet({
  open,
  onOpenChange,
}: OrganizationFormSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    timezone: "UTC",
    website: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      toastNotifications.errors.validation("Please fill in all required fields");
      return;
    }

    // Handle form submission
    toastNotifications.organizations.created(formData.name);
    onOpenChange(false);

    // Reset form
    setFormData({
      name: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      timezone: "UTC",
      website: "",
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setFormData({
      name: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      timezone: "UTC",
      website: "",
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
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl">Create New Organization</DrawerTitle>
                <DrawerDescription>
                  Follow the steps below to add a new organization
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
          <form onSubmit={handleSubmit} id="organization-form" className="space-y-2">
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
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Beauty Salon Downtown"
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
                  placeholder="Brief description of your organization..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Step 2: Contact Information */}
            <StepIndicator
              stepNumber={2}
              title="Contact Information"
              description="Email, phone, and website"
            />
            <div className="pl-14 space-y-4 pb-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="contact@example.com"
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://example.com"
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Location */}
            <StepIndicator
              stepNumber={3}
              title="Location Details"
              description="Address and geographical information"
            />
            <div className="pl-14 space-y-4 pb-6">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Street address"
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="City name"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) =>
                      setFormData({ ...formData, country: value })
                    }
                  >
                    <SelectTrigger id="country" className="h-11">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="il">Israel</SelectItem>
                      <SelectItem value="ru">Russia</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Step 4: Settings */}
            <StepIndicator
              stepNumber={4}
              title="Organization Settings"
              description="Timezone configuration"
              isLast
            />
            <div className="pl-14 space-y-2 pb-4">
              <Label htmlFor="timezone" className="text-sm">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) =>
                  setFormData({ ...formData, timezone: value })
                }
              >
                <SelectTrigger id="timezone" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                  <SelectItem value="America/New_York">
                    Eastern Time (GMT-5)
                  </SelectItem>
                  <SelectItem value="America/Chicago">
                    Central Time (GMT-6)
                  </SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    Pacific Time (GMT-8)
                  </SelectItem>
                  <SelectItem value="Europe/London">
                    London (GMT+0)
                  </SelectItem>
                  <SelectItem value="Europe/Moscow">
                    Moscow (GMT+3)
                  </SelectItem>
                  <SelectItem value="Asia/Jerusalem">
                    Jerusalem (GMT+2)
                  </SelectItem>
                </SelectContent>
              </Select>
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
              form="organization-form"
              className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700"
            >
              Create Organization
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
