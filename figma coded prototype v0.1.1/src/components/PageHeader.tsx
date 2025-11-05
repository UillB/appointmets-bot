import { useState, useEffect, ReactNode } from "react";
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
      {/* Gradient Header with Date/Time */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Mobile: Menu Button */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/20"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          {/* Date/Time */}
          <div className="text-white flex-1 lg:flex-none">
            <p className="text-sm opacity-90 mb-1">{formatDate(currentTime)}</p>
            <p className="text-3xl font-bold tracking-tight">{formatTime(currentTime)}</p>
          </div>

          {/* Desktop: Refresh Button */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={onRefresh}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Page Title Section */}
      <div className="flex-shrink-0 bg-white px-4 sm:px-6 py-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl text-gray-900 mb-1">{title}</h1>
              <p className="text-sm text-gray-500">{description}</p>
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