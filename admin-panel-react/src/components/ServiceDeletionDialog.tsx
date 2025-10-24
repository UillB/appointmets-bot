import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Users,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import { apiClient } from "../services/api";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface ServiceDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: {
    id: number;
    name: string;
  };
  onServiceDeleted?: () => void;
}

export function ServiceDeletionDialog({
  open,
  onOpenChange,
  service,
  onServiceDeleted,
}: ServiceDeletionDialogProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionInfo, setDeletionInfo] = useState<{
    error?: string;
    details?: {
      totalAppointments: number;
      futureAppointments: number;
      nextAppointmentDate: string;
      nextAppointmentTime: string;
      message: string;
    };
  } | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [showForceDelete, setShowForceDelete] = useState(false);

  const handleCheckDeletion = async () => {
    try {
      setIsChecking(true);
      const result = await apiClient.deleteServiceWithCheck(service.id);
      setDeletionInfo(result);
      
      if (result.error) {
        setShowForceDelete(true);
      }
    } catch (error) {
      console.error('Failed to check deletion:', error);
      toast.error('Failed to check deletion status');
    } finally {
      setIsChecking(false);
    }
  };

  const handleForceDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    try {
      setIsDeleting(true);
      const result = await apiClient.forceDeleteService(service.id);
      
      toast.success(
        `Service deleted successfully. Removed ${result.deletedAppointments} appointments and ${result.deletedSlots} slots.`
      );
      
      onServiceDeleted?.();
      onOpenChange(false);
      setDeletionInfo(null);
      setConfirmText("");
      setShowForceDelete(false);
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error('Failed to delete service');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setDeletionInfo(null);
    setConfirmText("");
    setShowForceDelete(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Service: {service.name}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please review the impact before proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!deletionInfo && (
            <div className="text-center py-8">
              <Button onClick={handleCheckDeletion} disabled={isChecking}>
                {isChecking ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Check Deletion Impact
                  </>
                )}
              </Button>
            </div>
          )}

          {deletionInfo?.error && (
            <Card className="border-red-200 bg-red-50">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">
                      Cannot Delete Service
                    </h3>
                    <p className="text-red-700 text-sm mb-3">
                      {deletionInfo.details?.message}
                    </p>

                    {deletionInfo.details && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-red-600" />
                          <span className="text-red-700">
                            Total appointments: {deletionInfo.details.totalAppointments}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-red-600" />
                          <span className="text-red-700">
                            Future appointments: {deletionInfo.details.futureAppointments}
                          </span>
                        </div>

                        {deletionInfo.details.nextAppointmentTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-red-600" />
                            <span className="text-red-700">
                              Next appointment: {deletionInfo.details.nextAppointmentTime}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {showForceDelete && (
            <Card className="border-yellow-200 bg-yellow-50">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      Force Delete Service
                    </h3>
                    <p className="text-yellow-700 text-sm mb-4">
                      This will permanently delete the service and ALL associated data:
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Trash2 className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-700">
                          • All time slots will be deleted
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-700">
                          • All appointments will be cancelled
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-700">
                          • Customers will lose their bookings
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-yellow-900 mb-1">
                          Type "DELETE" to confirm:
                        </label>
                        <input
                          type="text"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="Type DELETE here"
                          className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleForceDelete}
                          disabled={confirmText !== "DELETE" || isDeleting}
                          variant="destructive"
                          className="flex-1"
                        >
                          {isDeleting ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Force Delete Service
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {deletionInfo && !deletionInfo.error && (
            <Card className="border-green-200 bg-green-50">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">
                      Safe to Delete
                    </h3>
                    <p className="text-green-700 text-sm">
                      This service can be safely deleted without affecting any appointments.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
