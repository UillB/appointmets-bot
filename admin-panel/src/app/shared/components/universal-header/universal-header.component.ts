import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth';
import { I18nService, Language } from '../../../core/services/i18n.service';
import { TelegramWebAppService } from '../../../core/services/telegram-webapp.service';
import { TelegramThemeService } from '../../../core/services/telegram-theme.service';

@Component({
  selector: 'app-universal-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <div class="universal-header" [class.telegram-webapp]="isTelegramWebApp">
      <!-- Left side: System status -->
      <div class="system-status">
        <div class="status-indicator">
          <div class="status-dot online"></div>
          <span class="status-text">System Online</span>
        </div>
        <div class="last-updated">
          <mat-icon class="refresh-icon">refresh</mat-icon>
          <span>Updated just now</span>
        </div>
      </div>
      
      <!-- Right side: Actions and user info -->
      <div class="header-actions">
        <!-- Theme toggle - hide in Telegram Web App -->
        <button *ngIf="!isTelegramWebApp" mat-icon-button class="action-btn" (click)="toggleTheme()">
          <mat-icon>{{ isDarkTheme ? 'wb_sunny' : 'dark_mode' }}</mat-icon>
        </button>
        
        <!-- Language selector -->
        <button mat-stroked-button class="language-btn" [matMenuTriggerFor]="languageMenu">
          <mat-icon>public</mat-icon>
          <span class="language-text">{{ getCurrentLanguageName() }}</span>
          <mat-icon class="dropdown-icon">expand_more</mat-icon>
        </button>
        <mat-menu #languageMenu="matMenu" class="language-menu">
          <button mat-menu-item (click)="changeLanguage('ru')" class="language-option">
            <span class="flag-icon">🇷🇺</span>
            <span>Русский</span>
          </button>
          <button mat-menu-item (click)="changeLanguage('en')" class="language-option">
            <span class="flag-icon">🇺🇸</span>
            <span>English</span>
          </button>
          <button mat-menu-item (click)="changeLanguage('he')" class="language-option">
            <span class="flag-icon">🇮🇱</span>
            <span>עברית</span>
          </button>
        </mat-menu>
        
        <!-- Notifications -->
        <button mat-icon-button class="action-btn notification-btn">
          <mat-icon>notifications_none</mat-icon>
          <span class="notification-badge">3</span>
        </button>
        
        <!-- Help -->
        <button mat-icon-button class="action-btn" (click)="openHelp()">
          <mat-icon>help</mat-icon>
        </button>
        
        <!-- User profile -->
        <div class="user-profile" [matMenuTriggerFor]="userMenu">
          <div class="user-info">
            <span class="user-name">{{ currentUser?.name || 'User' }}</span>
            <span class="organization-name">{{ currentUser?.organization?.name || 'Demo Org' }}</span>
          </div>
          <div class="user-avatar">{{ getInitials(currentUser?.name) }}</div>
        </div>
        <mat-menu #userMenu="matMenu" class="user-menu">
          <button mat-menu-item>
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <button mat-menu-item>
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>
    </div>
  `,
  styles: [`
    .universal-header {
      position: fixed;
      top: 0;
      left: 256px;
      right: 0;
      z-index: 1000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      padding: 8px 24px;
      margin-bottom: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      height: 48px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      
      @media (max-width: 768px) {
        left: 0;
        padding: 8px 16px;
        height: 44px;
        flex-direction: column;
        gap: 8px;
        height: auto;
        min-height: 44px;
      }
      
      .system-status {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            position: relative;
            
            &.online {
              background: #10b981;
              box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
              animation: pulse 2s infinite;
            }
            
            &::after {
              content: '';
              position: absolute;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              border-radius: 50%;
              background: rgba(16, 185, 129, 0.1);
              animation: ripple 2s infinite;
            }
          }
          
          .status-text {
            font-size: 13px;
            font-weight: 600;
            color: #111827;
          }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        
        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        .last-updated {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #374151;
          font-weight: 600;
          
          .refresh-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }
      
      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          color: #374151;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          
          &:hover {
            background: #f3f4f6;
            color: #111827;
            transform: translateY(-1px);
            border-color: #d1d5db;
          }
          
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
        
        .language-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          min-width: 120px;
          
          &:hover {
            background: #f9fafb;
            border-color: #4F46E5;
            color: #4F46E5;
          }
          
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
          
          .language-text {
            flex: 1;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            color: #111827;
          }
          
          .dropdown-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            transition: transform 0.2s ease;
          }
          
          &[aria-expanded="true"] .dropdown-icon {
            transform: rotate(180deg);
          }
        }
        
        .dropdown-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
        
        .notification-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .notification-badge {
            position: absolute;
            top: 2px;
            right: 2px;
            background: #dc2626;
            color: white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            font-size: 10px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #ffffff;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }
        }
        
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          
          &:hover {
            background: #f3f4f6;
            transform: translateY(-1px);
            
            &::after {
              color: #4F46E5;
              transform: translateY(-50%) scale(1.2);
            }
          }
          
          &::after {
            content: '▼';
            position: absolute;
            right: 4px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 8px;
            color: #6b7280;
            transition: all 0.3s ease;
          }
          
          .user-info {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            
            .user-name {
              font-size: 13px;
              font-weight: 700;
              color: #111827;
              line-height: 1.2;
            }
            
            .organization-name {
              font-size: 11px;
              color: #374151;
              line-height: 1.2;
              font-weight: 500;
            }
          }
          
          .user-avatar {
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .universal-header {
        padding: 8px 16px;
        flex-direction: column;
        gap: 12px;
        
        .system-status {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        
        .header-actions {
          width: 100%;
          justify-content: space-between;
          
          .user-profile {
            .user-info {
              display: none;
            }
          }
        }
      }
      
      .language-menu {
        margin-top: 8px;
        
        .mat-mdc-menu-content {
          padding: 8px 0;
        }
        
        .language-option {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 40px;
          padding: 8px 16px;
          transition: all 0.2s ease;
          
          &:hover {
            background: #f3f4f6;
          }
          
          .flag-icon {
            font-size: 18px;
            width: 20px;
            text-align: center;
          }
          
          span:last-child {
            font-weight: 500;
            color: #111827;
          }
        }
      }
      
      .user-menu {
        margin-top: 8px;
        
        .mat-mdc-menu-content {
          padding: 8px 0;
        }
        
        .mat-mdc-menu-item {
          min-height: 40px;
          padding: 8px 16px;
          
          mat-icon {
            margin-right: 12px;
            color: #6b7280;
          }
        }
      }
    }
  `]
})
export class UniversalHeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentDate = new Date();
  currentTime = new Date();
  loading = false;
  isDarkTheme = false;
  currentUser: any = null;
  currentLanguage: Language = 'en';
  isTelegramWebApp = false;

  constructor(
    private authService: AuthService,
    private i18nService: I18nService,
    private telegramWebApp: TelegramWebAppService,
    private telegramTheme: TelegramThemeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.currentLanguage = this.i18nService.getCurrentLanguage();
    this.isTelegramWebApp = this.telegramWebApp.isInTelegram;
    
    // Setup Telegram Web App if in Telegram
    if (this.isTelegramWebApp) {
      this.setupTelegramWebApp();
    }
    
    // Subscribe to language changes
    this.i18nService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.currentLanguage = lang;
      });
    
    // Update time every second
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentTime = new Date();
        this.currentDate = new Date();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    // TODO: Implement theme switching logic
  }

  openHelp(): void {
    // TODO: Implement help functionality
    console.log('Help clicked');
  }

  private setupTelegramWebApp(): void {
    // Apply Telegram theme
    this.telegramTheme.applyTelegramTheme();
    
    // Setup back button
    this.telegramWebApp.setupBackButton(() => {
      // Navigate back or close Web App
      if (window.history.length > 1) {
        window.history.back();
      } else {
        this.telegramWebApp.close();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    
    // If in Telegram Web App, close it after logout
    if (this.isTelegramWebApp) {
      setTimeout(() => {
        this.telegramWebApp.close();
      }, 1000);
    }
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  changeLanguage(lang: string): void {
    console.log('🌐 Language changed to:', lang);
    this.i18nService.setLanguage(lang as Language);
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('language-changed', { 
      detail: { language: lang } 
    }));
  }

  getCurrentLanguageName(): string {
    const availableLanguages = this.i18nService.getAvailableLanguages();
    const currentLang = availableLanguages.find(lang => lang.code === this.currentLanguage);
    return currentLang?.name || 'English';
  }
}
