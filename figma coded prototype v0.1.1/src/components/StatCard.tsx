import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface StatCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string | number;
  subtitle: string;
  compact?: boolean;
}

export function StatCard({ 
  icon: Icon, 
  iconBg, 
  iconColor, 
  title, 
  value, 
  subtitle,
  compact = false
}: StatCardProps) {
  if (compact) {
    return (
      <Card className="p-3 hover:shadow-sm transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg} dark:opacity-90 flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        </div>
        
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5 truncate">{title}</p>
          <p className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{subtitle}</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-5 hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <div className="flex items-start justify-between mb-3">
        <div 
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} dark:opacity-90 shadow-sm`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
      </div>
    </Card>
  );
}
