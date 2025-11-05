import { Home, Calendar, Settings, Bot, BarChart3 } from "lucide-react";

interface MobileBottomNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function MobileBottomNav({ activePage, onNavigate }: MobileBottomNavProps) {
  const navItems = [
    { id: "dashboard", icon: Home, label: "Home" },
    { id: "appointments", icon: Calendar, label: "Bookings" },
    { id: "analytics", icon: BarChart3, label: "Stats" },
    { id: "bot-management", icon: Bot, label: "Bot" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
              <span className="text-xs">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
