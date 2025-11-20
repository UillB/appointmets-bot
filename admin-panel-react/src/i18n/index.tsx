import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import ru from './lang/ru.json';
import en from './lang/en.json';
import he from './lang/he.json';
import de from './lang/de.json';
import fr from './lang/fr.json';
import es from './lang/es.json';
import pt from './lang/pt.json';

export type Language = 'ru' | 'en' | 'he' | 'de' | 'fr' | 'es' | 'pt';

const translations: Record<Language, any> = {
  ru,
  en,
  he,
  de,
  fr,
  es,
  pt,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'app_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get language from localStorage
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const validLanguages: Language[] = ['ru', 'en', 'he', 'de', 'fr', 'es', 'pt'];
    if (stored && validLanguages.includes(stored as Language)) {
      return stored as Language;
    }
    // Clean up invalid value from localStorage
    if (stored && !validLanguages.includes(stored as Language)) {
      localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    }
    // Try to detect from browser
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('he')) return 'he';
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('en')) return 'en';
    if (browserLang.startsWith('ru')) return 'ru';
    // Default to English
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    console.log('[LanguageProvider] Language changed to:', language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const k2 of keys) {
          if (value && typeof value === 'object' && k2 in value) {
            value = value[k2];
          } else {
            return key;
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters like {{param}} or {param}
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] || `{{${k}}}`)
                  .replace(/\{(\w+)\}/g, (_, k) => params[k] || `{${k}}`);
    }

    return value;
  }, [language]);

  // Memoize context value to prevent unnecessary re-renders
  // but it will update when language changes (because t depends on language)
  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper function to get language name
export function getLanguageName(lang: Language): string {
  const names: Record<Language, string> = {
    ru: 'Русский',
    en: 'English',
    he: 'עברית',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    pt: 'Português',
  };
  return names[lang];
}

