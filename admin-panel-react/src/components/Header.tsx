import React, { useState } from "react";
import { Moon, Sun, Globe, Bell, HelpCircle, Menu, LogOut, Check, Settings, User, Wifi, WifiOff } from "lucide-react";
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
import { useTheme } from "../hooks/useTheme";
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
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
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 gap-2 sm:gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onMenuClick}
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Offline</span>
                </>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
              <span>Live updates</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle Dropdown - Visible on all screens including mobile */}
          <DropdownMenu open={themeMenuOpen} onOpenChange={setThemeMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-9 h-9 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-40 !bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-800 z-[10000]"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTheme("light");
                  setThemeMenuOpen(false);
                }}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
              >
                <span>Light</span>
                {resolvedTheme === "light" && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTheme("dark");
                  setThemeMenuOpen(false);
                }}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
              >
                <span>Dark</span>
                {resolvedTheme === "dark" && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTheme("light"); // Auto = light for now
                  setThemeMenuOpen(false);
                }}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
              >
                <span>System</span>
                {theme === "auto" && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hidden md:flex h-9 px-3 gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Globe className="w-4 h-4" />
                <span className="text-sm uppercase">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <DropdownMenuItem
                onClick={() => handleLanguageChange('ru')}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>🇷🇺 Русский</span>
                {language === 'ru' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('en')}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>🇬🇧 English</span>
                {language === 'en' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('he')}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>🇮🇱 עברית</span>
                {language === 'he' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notification Center - Visible on all screens including mobile */}
          <div className="block">
            <NotificationCenter />
          </div>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex w-9 h-9 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <HelpCircle className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-800 hover:opacity-80 transition-opacity">
                <div className="hidden sm:block text-right">
                  <p className="text-sm text-gray-900 dark:text-gray-100">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.organization?.name || 'Organization'}</p>
                </div>
                <Avatar className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 cursor-pointer">
                  <AvatarFallback className="bg-indigo-600 dark:bg-indigo-500 text-white text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
              <DropdownMenuItem className="cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => navigate('/settings?tab=profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => navigate('/settings?tab=system')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
              <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={handleLogout}>
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