import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  isThemeChanging: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Store user's theme preference
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme") as Theme | null;
    return (saved && (saved === "light" || saved === "dark" || saved === "auto")) ? saved : "light";
  });

  // Compute isDark from theme preference
  const [isDark, setIsDark] = useState(false);
  
  // Loading state during theme transition
  const [isThemeChanging, setIsThemeChanging] = useState(false);

  // Apply theme to DOM when isDark changes - EXACT LOGIC FROM PROTOTYPE
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  // Initialize theme on mount - ALWAYS START WITH LIGHT, then apply saved
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const root = document.documentElement;
    
    // CRITICAL: Always start with light theme (remove dark class)
    root.classList.remove("dark");
    setIsDark(false);
    
    // Then check and apply saved theme if it's dark
    if (theme === "dark") {
      // Apply dark theme after a brief moment
      setTimeout(() => {
        root.classList.add("dark");
        setIsDark(true);
      }, 10);
    } else {
      // Ensure light theme
      root.classList.remove("dark");
      setIsDark(false);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    if (typeof window === "undefined") return;
    if (newTheme === theme) return; // Skip if same theme
    
    // Show loader
    setIsThemeChanging(true);
    
    // Small delay to show loader before applying theme
    setTimeout(() => {
      setThemeState(newTheme);
      localStorage.setItem("theme", newTheme);
      
      // Apply theme immediately
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
        setIsDark(true);
      } else {
        root.classList.remove("dark");
        setIsDark(false);
      }
      
      // Hide loader after theme is applied and UI has time to render
      setTimeout(() => {
        setIsThemeChanging(false);
      }, 150);
    }, 50);
  };

  const resolvedTheme: "light" | "dark" = isDark ? "dark" : "light";

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, isThemeChanging }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

