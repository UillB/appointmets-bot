import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
          auth_date?: number;
          hash?: string;
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
        showAlert(message: string, callback?: () => void): void;
        showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
        onEvent(eventType: string, eventHandler: () => void): void;
        offEvent(eventType: string, eventHandler: () => void): void;
      };
    };
  }
}

@Injectable({ providedIn: 'root' })
export class TelegramWebAppService {
  private webApp: any;
  private isTelegramWebApp = false;
  private userDataSubject = new BehaviorSubject<any>(null);
  public userData$ = this.userDataSubject.asObservable();

  constructor() {
    this.initializeTelegramWebApp();
  }

  private initializeTelegramWebApp(): void {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      // Проверяем, что мы действительно в Telegram WebView
      // В обычном браузере initData будет пустым или отсутствовать
      const hasValidInitData = webApp.initData && webApp.initData.length > 0;
      const hasUserData = webApp.initDataUnsafe?.user;
      const isInTelegramView = hasValidInitData || hasUserData;
      
      if (isInTelegramView) {
        this.webApp = webApp;
        this.isTelegramWebApp = true;
        this.webApp.ready();
        this.webApp.expand();
        const userData = this.webApp.initDataUnsafe?.user;
        if (userData) {
          this.userDataSubject.next(userData);
        }
      }
    }
  }

  get isInTelegram(): boolean {
    return this.isTelegramWebApp;
  }

  get initData(): string | null {
    return this.webApp?.initData || null;
  }

  get currentUser(): any {
    return this.userDataSubject.value;
  }

  get theme(): 'light' | 'dark' {
    return this.webApp?.colorScheme || 'light';
  }

  get themeParams(): any {
    return this.webApp?.themeParams || {};
  }

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

  sendData(data: any): void {
    if (this.webApp) {
      this.webApp.sendData(JSON.stringify(data));
    }
  }

  close(): void {
    if (this.webApp) {
      this.webApp.close();
    }
  }
}


