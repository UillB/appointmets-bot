import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface MobileStatCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string | number;
  compact?: boolean;
}

export function MobileStatCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  value,
  compact = true,
}: MobileStatCardProps) {
  return (
    <Card className="p-3 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 ${iconBg} dark:opacity-80 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{value}</p>
        </div>
      </div>
    </Card>
  );
}
