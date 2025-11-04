import React, { useState } from "react";
import { Moon, Globe, Bell, HelpCircle, Menu, LogOut, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "../hooks/useAuth";
import { useLanguage, Language } from "../i18n";
import { toast } from "sonner";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { logout, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

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
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm text-gray-700">System Online</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              <span>Updated just now</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button variant="ghost" size="icon" className="hidden md:flex w-8 h-8 sm:w-9 sm:h-9">
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hidden md:flex h-8 sm:h-9 px-2 sm:px-3 gap-1 sm:gap-2">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm uppercase">{language}</span>
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
          
          <Button variant="ghost" size="icon" className="relative w-8 h-8 sm:w-9 sm:h-9">
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <Badge className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center p-0 bg-red-500 text-white text-[8px] sm:text-[10px] border-2 border-white">
              3
            </Badge>
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9">
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          
          {/* Logout Button - Always accessible */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="w-8 h-8 sm:w-9 sm:h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          
          <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2 pl-1 sm:pl-2 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-xs sm:text-sm">{user?.name || 'User'}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">{user?.organization?.name || 'Organization'}</p>
            </div>
            <Avatar className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-600">
              <AvatarFallback className="bg-indigo-600 text-white text-xs sm:text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}