import { LucideIcon, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface QuickActionCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  badge?: {
    text: string;
    variant?: string;
  };
}

export function QuickActionCard({ 
  icon: Icon, 
  iconBg, 
  iconColor, 
  title, 
  description, 
  badge 
}: QuickActionCardProps) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer group bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <div className="flex items-start gap-4">
        <div 
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} dark:opacity-90`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            {badge && (
              <Badge 
                className={`
                  text-[11px] px-2 py-0.5 h-5 whitespace-nowrap
                  ${badge.variant === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-0' : ''}
                  ${badge.variant === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-0' : ''}
                  ${!badge.variant ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0' : ''}
                `}
              >
                {badge.text}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0 mt-0.5" />
      </div>
    </Card>
  );
}