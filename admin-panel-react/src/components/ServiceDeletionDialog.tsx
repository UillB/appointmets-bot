import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Users,
  Trash2,
} from "lucide-react";
import { apiClient } from "../services/api";
import { toast } from "sonner";

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
    safeToDelete?: boolean;
    error?: string;
    details?: {
      totalAppointments: number;
      futureAppointments: number;
      nextAppointmentDate?: string;
      nextAppointmentTime?: string;
      totalSlots?: number;
      message: string;
    };
  } | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [hasBookings, setHasBookings] = useState(false);

  const handleCheckDeletion = useCallback(async () => {
    try {
      setIsChecking(true);
      const result = await apiClient.deleteServiceWithCheck(service.id);
      setDeletionInfo(result);
      
      // Check if service has bookings (appointments)
      const totalAppointments = result.details?.totalAppointments || 0;
      setHasBookings(totalAppointments > 0);
    } catch (error) {
      console.error('Failed to check deletion:', error);
      toast.error('Failed to check deletion status');
      setDeletionInfo(null);
      setHasBookings(false);
    } finally {
      setIsChecking(false);
    }
  }, [service.id]);

  // Automatically check for bookings when dialog opens
  useEffect(() => {
    if (open && service.id) {
      handleCheckDeletion();
    } else {
      // Reset state when dialog closes
      setDeletionInfo(null);
      setConfirmText("");
      setHasBookings(false);
    }
  }, [open, service.id, handleCheckDeletion]);

  const handleDeleteWithBookings = async () => {
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
      setHasBookings(false);
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error('Failed to delete service');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteWithoutBookings = async () => {
    try {
      setIsDeleting(true);
      await apiClient.deleteService(service.id);
      toast.success('Service deleted successfully');
      onServiceDeleted?.();
      onOpenChange(false);
      setDeletionInfo(null);
      setHasBookings(false);
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
    setHasBookings(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            Delete Service: {service.name}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please review the impact before proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Loading state */}
          {isChecking && (
            <div className="text-center py-10">
              <Clock className="h-8 w-8 mx-auto mb-4 text-gray-400 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Checking service status...</p>
            </div>
          )}

          {/* Error state */}
          {deletionInfo?.error && (
            <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      Cannot Delete Service
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                      {deletionInfo.details?.message || deletionInfo.error}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Warning modal for services WITH bookings */}
          {!isChecking && deletionInfo && !deletionInfo.error && hasBookings && (
            <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      Warning: Service Has Bookings
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
                      This service has {deletionInfo.details?.totalAppointments || 0} appointment(s). 
                      Deleting this service will permanently cancel all appointments and remove all associated data.
                    </p>

                    {deletionInfo.details && (
                      <div className="space-y-2 mb-4">
                        {deletionInfo.details.totalAppointments > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-amber-700 dark:text-amber-300">
                              Total appointments: {deletionInfo.details.totalAppointments}
                            </span>
                          </div>
                        )}
                        {deletionInfo.details.futureAppointments > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-amber-700 dark:text-amber-300">
                              Future appointments: {deletionInfo.details.futureAppointments}
                            </span>
                          </div>
                        )}
                        {deletionInfo.details.nextAppointmentTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-amber-700 dark:text-amber-300">
                              Next appointment: {deletionInfo.details.nextAppointmentTime}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                          Type "DELETE" to confirm:
                        </label>
                        <input
                          type="text"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="Type DELETE here"
                          className="w-full px-3 py-2 border border-amber-300 dark:border-amber-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={handleClose}
                          className="flex-1 border-gray-300 dark:border-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleDeleteWithBookings}
                          disabled={confirmText !== "DELETE" || isDeleting}
                          variant="destructive"
                          className="flex-1 border-2 border-red-500 dark:border-red-500 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 hover:border-red-600 dark:hover:border-red-400 font-medium"
                        >
                          {isDeleting ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Service
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

          {/* Simple confirmation modal for services WITHOUT bookings */}
          {!isChecking && deletionInfo && !hasBookings && (
            <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30">
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Confirm Service Deletion
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
                      Are you sure you want to delete this service? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1 border-gray-300 dark:border-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDeleteWithoutBookings}
                        disabled={isDeleting}
                        variant="destructive"
                        className="flex-1 border-2 border-red-500 dark:border-red-500 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 hover:border-red-600 dark:hover:border-red-400 font-medium"
                      >
                        {isDeleting ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Service
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
