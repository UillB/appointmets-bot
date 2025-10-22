import { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  Users, 
  BarChart3,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard, badge: null },
  { title: 'Appointments', href: '/appointments', icon: Calendar, badge: 12 },
  { title: 'Services', href: '/services', icon: Settings, badge: null },
  { title: 'Users', href: '/users', icon: Users, badge: null },
  { title: 'Analytics', href: '/analytics', icon: BarChart3, badge: null },
];

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-gradient-to-b from-indigo-600 to-indigo-800 text-white transition-transform duration-300",
        isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-indigo-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Admin Panel</h1>
                <p className="text-xs text-indigo-200">Appointments Bot</p>
              </div>
            </div>
            
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Summary Cards */}
          <div className="p-4 space-y-3">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-indigo-200">Total Appointments</span>
                <span className="text-lg font-semibold">156</span>
              </div>
              <div className="text-xs text-indigo-300">+12% from last month</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-indigo-200">Revenue</span>
                <span className="text-lg font-semibold">$12,450</span>
              </div>
              <div className="text-xs text-indigo-300">+8% from last month</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}