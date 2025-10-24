import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  AlertTriangle,
  Calendar,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { apiClient } from "../services/api";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface SlotExpirationWarningProps {
  serviceId: number;
  serviceName: string;
  onSlotsRenewed?: () => void;
}

export function SlotExpirationWarning({ 
  serviceId, 
  serviceName, 
  onSlotsRenewed 
}: SlotExpirationWarningProps) {
  const [slotStatus, setSlotStatus] = useState<{
    needsRenewal: boolean;
    daysUntilExpiry: number;
    latestSlotDate: string;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    // For now, just show a simple message that slots auto-generate
    setSlotStatus({
      needsRenewal: false,
      daysUntilExpiry: 365,
      latestSlotDate: new Date().toISOString(),
      message: 'Slots are auto-generated for 1 year when service is created'
    });
  }, [serviceId]);

  const checkSlotStatus = async () => {
    // Placeholder for future implementation
    console.log('Slot status check not yet implemented');
  };

  const renewSlots = async () => {
    // Placeholder for future implementation
    toast.success('Slot renewal feature coming soon!');
    onSlotsRenewed?.();
  };

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <div className="p-4 flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
          <span className="text-blue-700">Checking slot status...</span>
        </div>
      </Card>
    );
  }

  if (!slotStatus) {
    return null;
  }

  const getStatusIcon = () => {
    if (slotStatus.needsRenewal) {
      if (slotStatus.daysUntilExpiry <= 7) {
        return <XCircle className="h-5 w-5 text-red-600" />;
      } else if (slotStatus.daysUntilExpiry <= 30) {
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      }
    }
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const getStatusColor = () => {
    if (slotStatus.needsRenewal) {
      if (slotStatus.daysUntilExpiry <= 7) {
        return "border-red-200 bg-red-50";
      } else if (slotStatus.daysUntilExpiry <= 30) {
        return "border-yellow-200 bg-yellow-50";
      }
    }
    return "border-green-200 bg-green-50";
  };

  const getStatusBadge = () => {
    if (slotStatus.needsRenewal) {
      if (slotStatus.daysUntilExpiry <= 7) {
        return <Badge variant="destructive">Expires Soon</Badge>;
      } else if (slotStatus.daysUntilExpiry <= 30) {
        return <Badge variant="secondary">Expires in {slotStatus.daysUntilExpiry} days</Badge>;
      }
    }
    return <Badge variant="default">Valid</Badge>;
  };

  return (
    <Card className={`${getStatusColor()}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getStatusIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">
                  Slot Status for {serviceName}
                </h3>
                {getStatusBadge()}
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                {slotStatus.message}
              </p>

              {slotStatus.latestSlotDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Latest slot: {format(parseISO(slotStatus.latestSlotDate), "MMM dd, yyyy")}
                  </span>
                </div>
              )}

              {slotStatus.needsRenewal && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={renewSlots}
                    disabled={isRenewing}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isRenewing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate New Slots
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={checkSlotStatus}
                    variant="outline"
                    size="sm"
                    disabled={isRenewing}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Check Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
