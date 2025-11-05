import { Home, Calendar, Settings, Bot, BarChart3 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface MobileBottomNavProps {
  activePage?: string;
}

export function MobileBottomNav({ activePage }: MobileBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active page from location if not provided
  const currentPath = activePage || location.pathname;
  
  const navItems = [
    { id: "dashboard", path: "/dashboard", icon: Home, label: "Home" },
    { id: "appointments", path: "/appointments", icon: Calendar, label: "Bookings" },
    { id: "analytics", path: "/analytics", icon: BarChart3, label: "Stats" },
    { id: "bot-management", path: "/bot-management", icon: Bot, label: "Bot" },
    { id: "settings", path: "/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors min-h-[44px] ${
                active
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              aria-label={item.label}
            >
              <Icon className={`w-5 h-5 ${active ? "scale-110" : ""} transition-transform`} />
              <span className="text-xs font-medium">{item.label}</span>
              {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

