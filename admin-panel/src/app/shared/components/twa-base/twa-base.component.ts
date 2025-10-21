import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TelegramWebAppService } from '../../../core/services/telegram-webapp.service';
import { UniversalHeaderComponent } from '../universal-header/universal-header.component';

@Component({
  selector: 'app-twa-base',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    UniversalHeaderComponent
  ],
  template: `
    <div class="twa-container" [class.telegram-theme]="isInTelegram" [class.dark-theme]="isDarkTheme">
      <!-- Universal Header with DateTime and Refresh -->
      <app-universal-header></app-universal-header>
      
      <!-- TWA Status Indicator -->
      <div *ngIf="isInTelegram" class="twa-status">
        <mat-icon class="telegram-icon">telegram</mat-icon>
        <span class="status-text">Telegram Web App</span>
        <div class="user-info" *ngIf="currentUser">
          <span class="user-name">{{ currentUser.first_name }}</span>
          <span class="user-id">ID: {{ currentUser.id }}</span>
        </div>
      </div>

      <!-- Content Area -->
      <div class="twa-content">
        <ng-content></ng-content>
      </div>

      <!-- Loading Overlay -->
      <div *ngIf="loading" class="loading-overlay">
        <mat-spinner></mat-spinner>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .twa-container {
      min-height: 100vh;
      background: #f8f9fa;
      transition: all 0.3s ease;
    }

    .twa-container.telegram-theme {
      background: var(--tg-theme-bg-color, #f8f9fa);
      color: var(--tg-theme-text-color, #000);
    }

    .twa-container.dark-theme {
      background: #1a1a1a;
      color: #ffffff;
    }

    .twa-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #0088cc, #229ED9);
      color: white;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 16px;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 2px 8px rgba(0, 136, 204, 0.3);
    }

    .telegram-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .status-text {
      flex: 1;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 12px;
      opacity: 0.9;
    }

    .user-name {
      font-weight: 600;
    }

    .user-id {
      opacity: 0.7;
    }

    .twa-content {
      padding: 16px;
      max-width: 100%;
      margin: 0 auto;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
    }

    .loading-overlay p {
      margin-top: 16px;
      font-size: 16px;
      font-weight: 500;
    }

    /* TWA-specific mobile optimizations */
    .twa-container.telegram-theme {
      /* Use Telegram's theme colors */
      --primary-color: var(--tg-theme-button-color, #0088cc);
      --text-color: var(--tg-theme-text-color, #000);
      --bg-color: var(--tg-theme-bg-color, #ffffff);
      --secondary-bg-color: var(--tg-theme-secondary-bg-color, #f8f9fa);
    }

    /* Mobile-first responsive design */
    @media (max-width: 768px) {
      .twa-content {
        padding: 12px;
      }

      .twa-status {
        padding: 6px 12px;
        font-size: 12px;
      }

      .user-info {
        font-size: 10px;
      }
    }

    /* Dark theme adjustments */
    .twa-container.dark-theme {
      --primary-color: #0088cc;
      --text-color: #ffffff;
      --bg-color: #1a1a1a;
      --secondary-bg-color: #2a2a2a;
    }

    .twa-container.dark-theme .twa-status {
      background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
      border: 1px solid #333;
    }
  `]
})
export class TwaBaseComponent implements OnInit, OnDestroy {
  isInTelegram = false;
  isDarkTheme = false;
  currentUser: any = null;
  loading = false;
  loadingMessage = 'Загрузка...';

  constructor(private telegramWebAppService: TelegramWebAppService) {}

  ngOnInit(): void {
    this.isInTelegram = this.telegramWebAppService.isInTelegram;
    this.currentUser = this.telegramWebAppService.currentUser;
    this.isDarkTheme = this.telegramWebAppService.theme === 'dark';

    // Subscribe to user data changes
    this.telegramWebAppService.userData$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('window:universal-refresh')
  onUniversalRefresh() {
    console.log('🔄 Universal refresh triggered in TwaBaseComponent');
    // TWA base component can handle global refresh logic
  }

  showLoading(message: string = 'Загрузка...') {
    this.loading = true;
    this.loadingMessage = message;
  }

  hideLoading() {
    this.loading = false;
  }
}
