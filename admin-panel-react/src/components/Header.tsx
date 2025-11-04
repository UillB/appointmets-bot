import React, { useState } from "react";
import { Moon, Globe, Bell, HelpCircle, Menu, LogOut, Check, Settings, User, Wifi, WifiOff } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "../hooks/useAuth";
import { useLanguage, Language } from "../i18n";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NotificationCenter } from "./NotificationCenter";
import { useWebSocket } from "../hooks/useWebSocket";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { logout, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { isConnected } = useWebSocket();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    if (lang === language) {
      return; // Already selected
    }
    
    console.log('Changing language from', language, 'to', lang);
    
    // Change language first
    setLanguage(lang);
    
    // Get language names for toast
    const langNames: Record<Language, string> = {
      ru: 'Русский',
      en: 'English',
      he: 'עברית',
    };
    
    // Show toast after a short delay to ensure language is changed
    setTimeout(() => {
      const messages: Record<Language, { changed: string; switch: string }> = {
        ru: { changed: `Язык изменен на ${langNames[lang]}`, switch: 'Переключение языка' },
        en: { changed: `Language changed to ${langNames[lang]}`, switch: 'Language Switch' },
        he: { changed: `השפה שונתה ל-${langNames[lang]}`, switch: 'החלפת שפה' },
      };
      
      toast.success(messages[lang].changed, {
        description: messages[lang].switch,
        duration: 2000,
      });
    }, 100);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 gap-2 sm:gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden w-8 h-8 sm:w-9 sm:h-9"
            onClick={onMenuClick}
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-sm text-gray-700">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-sm text-gray-700">Offline</span>
                </>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              <span>Live updates</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hidden md:flex w-9 h-9">
            <Moon className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hidden md:flex h-9 px-3 gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm uppercase">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => handleLanguageChange('ru')}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>🇷🇺 Русский</span>
                {language === 'ru' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('en')}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>🇬🇧 English</span>
                {language === 'en' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('he')}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>🇮🇱 עברית</span>
                {language === 'he' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <NotificationCenter />
          
          <Button variant="ghost" size="icon" className="hidden sm:flex w-9 h-9">
            <HelpCircle className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 hover:opacity-80 transition-opacity">
                <div className="hidden sm:block text-right">
                  <p className="text-sm">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.organization?.name || 'Organization'}</p>
                </div>
                <Avatar className="w-8 h-8 bg-indigo-600 cursor-pointer">
                  <AvatarFallback className="bg-indigo-600 text-white text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings?tab=profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings?tab=system')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}