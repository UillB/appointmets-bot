import { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  Sparkles,
  Calendar,
  Clock,
  Zap,
  Coffee,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Badge } from "./ui/badge";

interface SlotGenerationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: () => void;
}

export function SlotGenerationSheet({
  open,
  onOpenChange,
  onGenerate,
}: SlotGenerationSheetProps) {
  const [selectedService, setSelectedService] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("18:00");
  const [slotDuration, setSlotDuration] = useState("30");
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [enableBreak, setEnableBreak] = useState(false);
  const [breakStart, setBreakStart] = useState("13:00");
  const [breakEnd, setBreakEnd] = useState("14:00");
  const [selectedDays, setSelectedDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  const handleGenerate = () => {
    if (!selectedService || !startDate || !endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      toast.error("End date must be after start date");
      return;
    }

    const selectedDayCount = Object.values(selectedDays).filter(Boolean).length;
    if (selectedDayCount === 0) {
      toast.error("Please select at least one day");
      return;
    }

    onGenerate();
    onOpenChange(false);
    toast.success("Slots generated successfully", {
      description: `Generated slots for selected dates`,
    });
  };

  const handleReset = () => {
    setSelectedService("");
    setStartDate("");
    setEndDate("");
    setWorkStart("09:00");
    setWorkEnd("18:00");
    setSlotDuration("30");
    setExcludeWeekends(true);
    setEnableBreak(false);
    setBreakStart("13:00");
    setBreakEnd("14:00");
    setSelectedDays({
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    });
    toast.info("Form reset");
  };

  const toggleDay = (day: keyof typeof selectedDays) => {
    setSelectedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const days = [
    { key: "monday" as const, label: "Mon" },
    { key: "tuesday" as const, label: "Tue" },
    { key: "wednesday" as const, label: "Wed" },
    { key: "thursday" as const, label: "Thu" },
    { key: "friday" as const, label: "Fri" },
    { key: "saturday" as const, label: "Sat" },
    { key: "sunday" as const, label: "Sun" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        {/* Header - Fixed */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl">Generate Slots</SheetTitle>
              <SheetDescription className="mt-1">
                Automatically generate time slots for appointments
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-6 space-y-8">
            {/* Service Selection */}
            <div className="space-y-3">
              <Label htmlFor="service" className="text-sm font-medium">
                Service <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger id="service" className="h-11">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="haircut">Haircut & Styling</SelectItem>
                  <SelectItem value="massage">Therapeutic Massage</SelectItem>
                  <SelectItem value="consultation">Medical Consultation</SelectItem>
                  <SelectItem value="dental">Dental Checkup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Date Range */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <Label className="font-medium">Date Range</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="startDate" className="text-sm">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="endDate" className="text-sm">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Working Hours */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <Label className="font-medium">Working Hours</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="workStart" className="text-sm">
                    Start Time
                  </Label>
                  <Input
                    id="workStart"
                    type="time"
                    value={workStart}
                    onChange={(e) => setWorkStart(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="workEnd" className="text-sm">
                    End Time
                  </Label>
                  <Input
                    id="workEnd"
                    type="time"
                    value={workEnd}
                    onChange={(e) => setWorkEnd(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Slot Duration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <Label htmlFor="slotDuration" className="font-medium">
                  Slot Duration (minutes)
                </Label>
              </div>
              <Select value={slotDuration} onValueChange={setSlotDuration}>
                <SelectTrigger id="slotDuration" className="h-11">
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

            <Separator />

            {/* Working Days */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-600" />
                <Label className="font-medium">Working Days</Label>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className={`h-14 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedDays[day.key]
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                        : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-[11px] font-medium leading-none">{day.label}</span>
                    {selectedDays[day.key] && (
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Break Time */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-orange-600" />
                  <Label className="font-medium">Break Time</Label>
                </div>
                <Switch checked={enableBreak} onCheckedChange={setEnableBreak} />
              </div>

              {enableBreak && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50/50 border border-orange-200 rounded-lg">
                  <div className="space-y-3">
                    <Label htmlFor="breakStart" className="text-sm text-orange-900">
                      Break Start
                    </Label>
                    <Input
                      id="breakStart"
                      type="time"
                      value={breakStart}
                      onChange={(e) => setBreakStart(e.target.value)}
                      className="h-11 border-orange-300 bg-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="breakEnd" className="text-sm text-orange-900">
                      Break End
                    </Label>
                    <Input
                      id="breakEnd"
                      type="time"
                      value={breakEnd}
                      onChange={(e) => setBreakEnd(e.target.value)}
                      className="h-11 border-orange-300 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            {selectedService && startDate && endDate && (
              <>
                <Separator />
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-indigo-900">
                      Generation Summary
                    </span>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Service:</span>
                      <Badge
                        variant="outline"
                        className="bg-white border-indigo-300 text-indigo-700"
                      >
                        {selectedService}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Date Range:</span>
                      <span className="text-gray-900 font-medium">
                        {startDate} - {endDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Working Hours:</span>
                      <span className="text-gray-900 font-medium">
                        {workStart} - {workEnd}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Slot Duration:</span>
                      <span className="text-gray-900 font-medium">
                        {slotDuration} min
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Working Days:</span>
                      <span className="text-gray-900 font-medium">
                        {Object.values(selectedDays).filter(Boolean).length}{" "}
                        days/week
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Slots
            </Button>
            <Button variant="outline" onClick={handleReset} className="h-11 px-6">
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}