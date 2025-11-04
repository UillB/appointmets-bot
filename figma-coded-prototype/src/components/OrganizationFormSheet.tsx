import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  Save,
  Globe,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Organization {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  website?: string;
  members: number;
  activeAppointments: number;
}

interface OrganizationFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: Organization | null;
  onSave: (organization: Partial<Organization>) => void;
}

export function OrganizationFormSheet({
  open,
  onOpenChange,
  organization,
  onSave,
}: OrganizationFormSheetProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");

  const isEditMode = !!organization;

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setEmail(organization.email);
      setPhone(organization.phone);
      setAddress(organization.address);
      setDescription(organization.description);
      setWebsite(organization.website || "");
    } else {
      resetForm();
    }
  }, [organization, open]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setDescription("");
    setWebsite("");
  };

  const handleSubmit = () => {
    if (!name || !email || !phone || !address) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const orgData: Partial<Organization> = {
      ...(organization?.id && { id: organization.id }),
      name,
      email,
      phone,
      address,
      description,
      website,
      ...(!organization && {
        members: 0,
        activeAppointments: 0,
      }),
    };

    onSave(orgData);
    onOpenChange(false);
    toast.success(
      isEditMode
        ? "Organization updated successfully"
        : "Organization created successfully"
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <SheetTitle>
                {isEditMode ? "Edit Organization" : "Add New Organization"}
              </SheetTitle>
              <SheetDescription>
                {isEditMode
                  ? "Update organization information"
                  : "Create a new organization"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Organization Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Acme Corporation"
                className="pl-10"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the organization..."
              rows={3}
            />
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Contact Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street, City, State, ZIP"
                rows={3}
                className="pl-10"
              />
            </div>
          </div>

          {/* Summary */}
          {name && email && (
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">
                  Organization Summary
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="text-gray-900 font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-900">{phone}</span>
                </div>
                {website && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Website:</span>
                    <span className="text-gray-900 truncate max-w-[200px]">
                      {website}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditMode ? "Update Organization" : "Create Organization"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
