import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: {
    name: string;
    duration: number;
    price: number;
    category: string;
    description: string;
  };
}

export function ServiceDialog({ open, onOpenChange, service }: ServiceDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onOpenChange(false);
  };

  const isEdit = !!service;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Service" : "Create New Service"}</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Update service information and settings."
              : "Add a new service to your business offerings."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="localized-names">Localized Names</TabsTrigger>
              <TabsTrigger value="localized-desc">Localized Descriptions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  placeholder="e.g., Haircut, Consultation"
                  defaultValue={service?.name}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="30"
                    defaultValue={service?.duration}
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    defaultValue={service?.price}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={service?.category || "general"}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service..."
                  rows={4}
                  defaultValue={service?.description}
                />
              </div>
            </TabsContent>

            <TabsContent value="localized-names" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nameEn">English Name</Label>
                <Input
                  id="nameEn"
                  placeholder="Service name in English"
                  defaultValue={service?.name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameRu">Russian Name (Русский)</Label>
                <Input
                  id="nameRu"
                  placeholder="Название услуги на русском"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameHe">Hebrew Name (עברית)</Label>
                <Input
                  id="nameHe"
                  placeholder="שם השירות בעברית"
                  dir="rtl"
                />
              </div>
            </TabsContent>

            <TabsContent value="localized-desc" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descEn">English Description</Label>
                <Textarea
                  id="descEn"
                  placeholder="Service description in English"
                  rows={3}
                  defaultValue={service?.description}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descRu">Russian Description (Русский)</Label>
                <Textarea
                  id="descRu"
                  placeholder="Описание услуги на русском"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descHe">Hebrew Description (עברית)</Label>
                <Textarea
                  id="descHe"
                  placeholder="תיאור השירות בעברית"
                  rows={3}
                  dir="rtl"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              {isEdit ? "Update Service" : "Create Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
