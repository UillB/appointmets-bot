import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "../ui/card";

interface StatCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string | number;
  subtitle: string;
  trend?: number;
}

export function StatCard({ 
  icon: Icon, 
  iconBg, 
  iconColor, 
  title, 
  value, 
  subtitle, 
  trend 
}: StatCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return Minus;
    return trend > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return "text-gray-400";
    return trend > 0 ? "text-emerald-500" : "text-red-500";
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="p-3 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      {/* Top row: Icon, Title, and Count */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div 
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg} dark:opacity-80`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <p className="text-[0.91875rem] font-medium text-[#525B6A] dark:text-[#B5BCC5] truncate">{title}</p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-none">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 ${getTrendColor()} dark:text-gray-400`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Subtitle */}
      <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
    </Card>
  );
}
