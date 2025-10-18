import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<Theme>('light');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  private isDarkMode = false;

  constructor() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('admin-theme') as Theme;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      this.currentThemeSubject.next(savedTheme);
    }

    // Apply initial theme
    this.applyTheme(this.currentThemeSubject.value);

    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.currentThemeSubject.value === 'auto') {
          this.applyTheme('auto');
        }
      });
    }
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem('admin-theme', theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const current = this.getCurrentTheme();
    if (current === 'light') {
      this.setTheme('dark');
    } else if (current === 'dark') {
      this.setTheme('auto');
    } else {
      this.setTheme('light');
    }
  }

  isDark(): boolean {
    return this.isDarkMode;
  }

  private applyTheme(theme: Theme): void {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme');

    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode = prefersDark;
      body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
      this.isDarkMode = theme === 'dark';
      body.classList.add(`${theme}-theme`);
    }

    // Update Material theme
    this.updateMaterialTheme();
  }

  private updateMaterialTheme(): void {
    // This would typically involve switching Material theme files
    // For now, we'll use CSS custom properties
    const root = document.documentElement;
    
    if (this.isDarkMode) {
      root.style.setProperty('--primary-color', '#1976d2');
      root.style.setProperty('--accent-color', '#ff4081');
      root.style.setProperty('--warn-color', '#f44336');
      root.style.setProperty('--background-color', '#121212');
      root.style.setProperty('--surface-color', '#1e1e1e');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--text-secondary', '#b3b3b3');
    } else {
      root.style.setProperty('--primary-color', '#1976d2');
      root.style.setProperty('--accent-color', '#ff4081');
      root.style.setProperty('--warn-color', '#f44336');
      root.style.setProperty('--background-color', '#fafafa');
      root.style.setProperty('--surface-color', '#ffffff');
      root.style.setProperty('--text-color', '#212121');
      root.style.setProperty('--text-secondary', '#757575');
    }
  }

  getAvailableThemes(): { code: Theme; name: string; icon: string }[] {
    return [
      { code: 'light', name: 'Light', icon: 'light_mode' },
      { code: 'dark', name: 'Dark', icon: 'dark_mode' },
      { code: 'auto', name: 'Auto', icon: 'brightness_auto' }
    ];
  }
}
