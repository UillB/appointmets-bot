import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "./ui/card";

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
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div 
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </Card>
  );
}
