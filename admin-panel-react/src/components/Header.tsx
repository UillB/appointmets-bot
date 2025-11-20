import React, { useState, useMemo } from "react";
import { Moon, Sun, Globe, Bell, HelpCircle, Menu, LogOut, Check, Settings, User, Wifi, WifiOff, Mail } from "lucide-react";
import { AppointexoLogo } from "./AppointexoLogo";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { useAuth } from "../hooks/useAuth";
import { useLanguage, Language } from "../i18n";
import { useTheme } from "../hooks/useTheme";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NotificationCenter } from "./NotificationCenter";
import { useWebSocket } from "../hooks/useWebSocket";
import ru from "../i18n/lang/ru.json";
import en from "../i18n/lang/en.json";
import he from "../i18n/lang/he.json";
import de from "../i18n/lang/de.json";
import fr from "../i18n/lang/fr.json";
import es from "../i18n/lang/es.json";
import pt from "../i18n/lang/pt.json";
import ja from "../i18n/lang/ja.json";
import zh from "../i18n/lang/zh.json";
import ar from "../i18n/lang/ar.json";

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

  // Helper function to get language name in a specific language
  const getLanguageName = (targetLang: Language, displayLang: Language): string => {
    const translations: Record<Language, any> = { ru, en, he, de, fr, es, pt, ja, zh, ar };
    const langKeyMap: Record<Language, string> = {
      ru: 'russian',
      en: 'english',
      he: 'hebrew',
      de: 'german',
      fr: 'french',
      es: 'spanish',
      pt: 'portuguese',
      ja: 'japanese',
      zh: 'chinese',
      ar: 'arabic'
    };
    const langKey = langKeyMap[targetLang];
    return translations[displayLang]?.language?.[langKey] || targetLang.toUpperCase();
  };

  const handleLanguageChange = (lang: Language) => {
    if (lang === language) {
      return; // Already selected
    }
    
    console.log('Changing language from', language, 'to', lang);
    
    // Get language name in the NEW language before changing
    const langNameInNewLang = getLanguageName(lang, lang);
    
    // Change language
    setLanguage(lang);
    
    // Show toast after a short delay to ensure language context is updated
    setTimeout(() => {
      toast.success(t("language.languageChanged", { lang: langNameInNewLang }), {
        description: t("language.switch"),
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
          
          {/* Logo */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-lg flex items-center justify-center shadow-md">
              <AppointexoLogo size={24} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg">Appointexo</span>
          </div>
          
            <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t("header.connected")}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t("header.offline")}</span>
                </>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
              <span>{t("header.liveUpdates")}</span>
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
                <span>{t("header.theme.light")}</span>
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
                <span>{t("header.theme.dark")}</span>
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
                <span>{t("header.theme.system")}</span>
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
                <span>🇷🇺 {t("language.russian")}</span>
                {language === 'ru' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('en')}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>🇬🇧 {t("language.english")}</span>
                {language === 'en' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('he')}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>🇮🇱 {t("language.hebrew")}</span>
                {language === 'he' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('de')}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>🇩🇪 {t("language.german")}</span>
                {language === 'de' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('fr')}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>🇫🇷 {t("language.french")}</span>
                {language === 'fr' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('es')}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>🇪🇸 {t("language.spanish")}</span>
                {language === 'es' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('pt')}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>🇵🇹 {t("language.portuguese")}</span>
                {language === 'pt' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('ja')}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>🇯🇵 {t("language.japanese")}</span>
                {language === 'ja' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('zh')}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>🇨🇳 {t("language.chinese")}</span>
                {language === 'zh' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('ar')}
                className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>🇸🇦 {t("language.arabic")}</span>
                {language === 'ar' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notification Center - Visible on all screens including mobile */}
          <div className="block">
            <NotificationCenter />
          </div>
          
          {/* Help Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex w-9 h-9 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              align="end" 
              className="w-80 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {t("header.help.title")}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t("header.help.description")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-indigo-600 dark:text-indigo-400">
                    {t("header.help.supportEmail")}
                  </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-800 hover:opacity-80 transition-opacity">
                <div className="hidden sm:block text-right">
                  <p className="text-sm text-gray-900 dark:text-gray-100">{user?.name || t("common.user")}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.organization?.name || t("common.organization")}</p>
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
                  <p className="text-sm font-medium">{user?.name || t("common.user")}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
              <DropdownMenuItem className="cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => navigate('/settings?tab=profile')}>
                <User className="w-4 h-4 mr-2" />
                {t("header.profile.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => navigate('/settings?tab=system')}>
                <Settings className="w-4 h-4 mr-2" />
                {t("header.profile.settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
              <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t("header.profile.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}