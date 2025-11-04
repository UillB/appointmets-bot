import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { Calendar, Clock, Users, DollarSign, Tag, Save } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  capacity: number;
  category: string;
}

interface ServiceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSave: (service: Partial<Service>) => void;
}

export function ServiceFormSheet({
  open,
  onOpenChange,
  service,
  onSave,
}: ServiceFormSheetProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [category, setCategory] = useState("");

  const isEditMode = !!service;

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description);
      setDuration(service.duration.toString());
      setPrice(service.price.toString());
      setCapacity(service.capacity.toString());
      setCategory(service.category);
    } else {
      resetForm();
    }
  }, [service, open]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setDuration("30");
    setPrice("");
    setCapacity("1");
    setCategory("");
  };

  const handleSubmit = () => {
    if (!name || !description || !duration || !price || !capacity || !category) {
      toast.error("Please fill all required fields");
      return;
    }

    const serviceData: Partial<Service> = {
      ...(service?.id && { id: service.id }),
      name,
      description,
      duration: parseInt(duration),
      price: parseFloat(price),
      capacity: parseInt(capacity),
      category,
    };

    onSave(serviceData);
    onOpenChange(false);
    toast.success(
      isEditMode ? "Service updated successfully" : "Service created successfully"
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <SheetTitle>
                {isEditMode ? "Edit Service" : "Add New Service"}
              </SheetTitle>
              <SheetDescription>
                {isEditMode
                  ? "Update service information"
                  : "Create a new service for appointments"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Service Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Haircut & Styling"
                className="pl-10"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the service..."
              rows={4}
            />
          </div>

          <Separator />

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beauty">Beauty & Grooming</SelectItem>
                <SelectItem value="Health">Health & Wellness</SelectItem>
                <SelectItem value="Medical">Medical Services</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
                <SelectItem value="Education">Education & Training</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Duration and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">
                Duration (minutes) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration" className="pl-10">
                    <SelectValue placeholder="Select" />
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

            <div className="space-y-2">
              <Label htmlFor="price">
                Price ($) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity">
              Capacity (per slot) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="1"
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-500">
              Maximum number of appointments per time slot
            </p>
          </div>

          {/* Summary */}
          {name && price && duration && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Service Summary</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="text-gray-900 font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-900">{duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="text-gray-900 font-medium">${price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="text-gray-900">{capacity} per slot</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditMode ? "Update Service" : "Create Service"}
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
