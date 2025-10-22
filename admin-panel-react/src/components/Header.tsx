import { Moon, Globe, Bell, HelpCircle, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-700">System Online</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              <span>Updated just now</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hidden md:flex w-9 h-9">
            <Moon className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" className="hidden md:flex h-9 px-3 gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-sm">EN</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="relative w-9 h-9">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] border-2 border-white">
              3
            </Badge>
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex w-9 h-9">
            <HelpCircle className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm">Vladi</p>
              <p className="text-xs text-gray-500">Demo City</p>
            </div>
            <Avatar className="w-8 h-8 bg-indigo-600">
              <AvatarFallback className="bg-indigo-600 text-white text-sm">
                V
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}