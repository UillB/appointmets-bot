import { Injectable } from '@angular/core';
import { TelegramWebAppService } from './telegram-webapp.service';

@Injectable({
  providedIn: 'root'
})
export class TelegramThemeService {
  constructor(private telegramWebApp: TelegramWebAppService) {}

  getTheme(): 'light' | 'dark' {
    if (this.telegramWebApp.isInTelegram) {
      return this.telegramWebApp.theme;
    }
    return 'light'; // Fallback для веб-версии
  }

  getThemeColors(): any {
    if (this.telegramWebApp.isInTelegram) {
      return this.telegramWebApp.themeParams;
    }
    return {};
  }

  applyTelegramTheme(): void {
    if (this.telegramWebApp.isInTelegram) {
      const theme = this.getTheme();
      const colors = this.getThemeColors();
      
      // Применяем тему к body
      document.body.classList.toggle('telegram-theme', true);
      document.body.classList.toggle('telegram-light', theme === 'light');
      document.body.classList.toggle('telegram-dark', theme === 'dark');
      
      // Применяем цвета из Telegram
      if (colors.bg_color) {
        document.documentElement.style.setProperty('--telegram-bg', colors.bg_color);
      }
      if (colors.text_color) {
        document.documentElement.style.setProperty('--telegram-text', colors.text_color);
      }
      if (colors.button_color) {
        document.documentElement.style.setProperty('--telegram-button', colors.button_color);
      }
    }
  }
}
