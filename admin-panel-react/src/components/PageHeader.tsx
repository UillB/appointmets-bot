import React, { useState, useEffect, ReactNode } from "react";
import { RefreshCw, Menu } from "lucide-react";
import { Button } from "./ui/button";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
  onRefresh?: () => void;
  onMenuClick?: () => void;
}

export function PageHeader({ 
  icon, 
  title, 
  description, 
  actions, 
  onRefresh,
  onMenuClick
}: PageHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <>
      {/* Gradient Header with Page Title */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
              <p className="text-indigo-100">{description}</p>
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </>
  );
}