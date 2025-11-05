import { ReactNode } from "react";

interface PageTitleProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageTitle({ 
  icon, 
  title, 
  description, 
  actions 
}: PageTitleProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-4 mb-4 lg:mb-6">
      <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
        {icon && (
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg lg:text-2xl text-gray-900 dark:text-gray-100 truncate">{title}</h1>
          {description && (
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
