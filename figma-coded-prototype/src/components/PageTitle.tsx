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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
