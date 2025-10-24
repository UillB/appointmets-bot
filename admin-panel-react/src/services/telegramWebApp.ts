import { BehaviorSubject, Observable } from 'rxjs';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          auth_date: number;
          hash: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText(text: string): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          showProgress(leaveActive?: boolean): void;
          hideProgress(): void;
          setParams(params: any): void;
        };
        ready(): void;
        expand(): void;
        close(): void;
        sendData(data: string): void;
        switchInlineQuery(query: string, choose_chat_types?: string[]): void;
        openLink(url: string, options?: { try_instant_view?: boolean }): void;
        openTelegramLink(url: string): void;
        openInvoice(url: string, callback?: (status: string) => void): void;
        showPopup(params: any, callback?: (button_id: string) => void): void;
        showAlert(message: string, callback?: () => void): void;
        showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
        showScanQrPopup(params: any, callback?: (text: string) => void): void;
        closeScanQrPopup(): void;
        readTextFromClipboard(callback?: (text: string) => void): void;
        requestWriteAccess(callback?: (granted: boolean) => void): void;
        requestContact(callback?: (granted: boolean) => void): void;
        onEvent(eventType: string, eventHandler: () => void): void;
        offEvent(eventType: string, eventHandler: () => void): void;
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramWebAppData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

export class TelegramWebAppService {
  private webApp: any;
  private isTelegramWebApp = false;
  private userDataSubject = new BehaviorSubject<TelegramUser | null>(null);
  public userData$ = this.userDataSubject.asObservable();

  constructor() {
    this.initializeTelegramWebApp();
  }

  private initializeTelegramWebApp(): void {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.isTelegramWebApp = true;
      
      // Initialize Web App
      this.webApp.ready();
      this.webApp.expand();
      
      // Get user data
      const userData = this.webApp.initDataUnsafe?.user;
      if (userData) {
        this.userDataSubject.next(userData);
      }
      
      console.log('Telegram Web App initialized:', {
        user: userData,
        platform: this.webApp.platform,
        version: this.webApp.version,
        colorScheme: this.webApp.colorScheme
      });
    }
  }

  get isInTelegram(): boolean {
    return this.isTelegramWebApp;
  }

  get currentUser(): TelegramUser | null {
    return this.userDataSubject.value;
  }

  get theme(): 'light' | 'dark' {
    return this.webApp?.colorScheme || 'light';
  }

  get themeParams(): any {
    return this.webApp?.themeParams || {};
  }

  // Setup back button
  setupBackButton(callback: () => void): void {
    if (this.webApp?.BackButton) {
      this.webApp.BackButton.onClick(callback);
      this.webApp.BackButton.show();
    }
  }

  hideBackButton(): void {
    if (this.webApp?.BackButton) {
      this.webApp.BackButton.hide();
    }
  }

  // Setup main button
  setupMainButton(text: string, callback: () => void): void {
    if (this.webApp?.MainButton) {
      this.webApp.MainButton.setText(text);
      this.webApp.MainButton.onClick(callback);
      this.webApp.MainButton.show();
    }
  }

  hideMainButton(): void {
    if (this.webApp?.MainButton) {
      this.webApp.MainButton.hide();
    }
  }

  // Send data to bot
  sendData(data: any): void {
    if (this.webApp) {
      this.webApp.sendData(JSON.stringify(data));
    }
  }

  // Close Web App
  close(): void {
    if (this.webApp) {
      this.webApp.close();
    }
  }

  // Show alert
  showAlert(message: string): void {
    if (this.webApp) {
      this.webApp.showAlert(message);
    } else {
      alert(message);
    }
  }

  // Show confirmation
  showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showConfirm(message, resolve);
      } else {
        resolve(confirm(message));
      }
    });
  }

  // Apply Telegram theme to document
  applyTheme(): void {
    if (this.webApp && this.isTelegramWebApp) {
      const theme = this.getTheme();
      const colors = this.getThemeColors();
      
      // Apply theme classes to body
      document.body.classList.toggle('telegram-theme', true);
      document.body.classList.toggle('telegram-light', theme === 'light');
      document.body.classList.toggle('telegram-dark', theme === 'dark');
      
      // Apply colors from Telegram
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

  private getTheme(): 'light' | 'dark' {
    if (this.webApp && this.isTelegramWebApp) {
      return this.webApp.colorScheme;
    }
    return 'light';
  }

  private getThemeColors(): any {
    if (this.webApp && this.isTelegramWebApp) {
      return this.webApp.themeParams;
    }
    return {};
  }
}

// Export singleton instance
export const telegramWebApp = new TelegramWebAppService();
