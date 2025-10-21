import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheetModule, MatBottomSheet } from '@angular/material/bottom-sheet';

import { TelegramWebAppService } from '../../../core/services/telegram-webapp.service';
// import { TwaNavigationSheetComponent } from './twa-navigation-sheet.component';

@Component({
  selector: 'app-twa-navigation',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBottomSheetModule
  ],
  template: `
    <div class="twa-navigation" [class.telegram-theme]="isInTelegram">
      <!-- Mobile Navigation Bar -->
      <div class="nav-bar" *ngIf="showNavBar">
        <button 
          *ngFor="let item of navItems" 
          mat-icon-button 
          [class.active]="item.active"
          [class.disabled]="item.disabled"
          (click)="onNavItemClick(item)"
          class="nav-item"
          [attr.aria-label]="item.label">
          <mat-icon>{{ item.icon }}</mat-icon>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </div>

      <!-- Floating Action Button -->
      <button 
        *ngIf="showFab" 
        mat-fab 
        color="primary" 
        (click)="onFabClick()"
        class="fab-button"
        [attr.aria-label]="fabLabel">
        <mat-icon>{{ fabIcon }}</mat-icon>
      </button>

      <!-- Back Button (TWA specific) -->
      <div *ngIf="isInTelegram && showBackButton" class="back-button-container">
        <button mat-icon-button (click)="onBackClick()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .twa-navigation {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: white;
      border-top: 1px solid #e0e0e0;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    }

    .twa-navigation.telegram-theme {
      background: var(--tg-theme-bg-color, white);
      border-top-color: var(--tg-theme-hint-color, #e0e0e0);
    }

    .nav-bar {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 8px 0;
      max-width: 100%;
      overflow-x: auto;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.3s ease;
      min-width: 60px;
      color: #666;
      
      &:hover:not(.disabled) {
        background: rgba(0, 0, 0, 0.05);
        color: #333;
      }

      &.active {
        color: #1976d2;
        background: rgba(25, 118, 210, 0.1);
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .nav-label {
      font-size: 10px;
      font-weight: 500;
      text-align: center;
      line-height: 1.2;
    }

    .fab-button {
      position: fixed;
      bottom: 80px;
      right: 16px;
      z-index: 1001;
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(25, 118, 210, 0.5);
      }
    }

    .back-button-container {
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 1001;
    }

    .back-button {
      background: rgba(0, 0, 0, 0.7);
      color: white;
      backdrop-filter: blur(10px);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      
      &:hover {
        background: rgba(0, 0, 0, 0.8);
        transform: scale(1.05);
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .nav-item {
        padding: 6px 8px;
        min-width: 50px;
      }

      .nav-label {
        font-size: 9px;
      }

      .fab-button {
        bottom: 70px;
        right: 12px;
      }
    }

    @media (max-width: 480px) {
      .nav-bar {
        padding: 6px 0;
      }

      .nav-item {
        padding: 4px 6px;
        min-width: 45px;
      }

      .nav-label {
        font-size: 8px;
      }
    }

    /* TWA theme adjustments */
    .twa-navigation.telegram-theme {
      .nav-item {
        color: var(--tg-theme-hint-color, #666);
        
        &:hover:not(.disabled) {
          background: var(--tg-theme-secondary-bg-color, rgba(0, 0, 0, 0.05));
          color: var(--tg-theme-text-color, #333);
        }

        &.active {
          color: var(--tg-theme-button-color, #1976d2);
          background: var(--tg-theme-button-color, rgba(25, 118, 210, 0.1));
        }
      }
    }
  `]
})
export class TwaNavigationComponent implements OnInit, OnDestroy {
  @Input() navItems: any[] = [];
  @Input() showNavBar: boolean = true;
  @Input() showFab: boolean = false;
  @Input() fabIcon: string = 'add';
  @Input() fabLabel: string = 'Добавить';
  @Input() showBackButton: boolean = true;

  @Output() navItemClick = new EventEmitter<any>();
  @Output() fabClick = new EventEmitter<void>();
  @Output() backClick = new EventEmitter<void>();

  isInTelegram = false;

  constructor(
    private telegramWebAppService: TelegramWebAppService,
    private bottomSheet: MatBottomSheet
  ) {}

  ngOnInit(): void {
    this.isInTelegram = this.telegramWebAppService.isInTelegram;
    
    // Setup Telegram back button if in TWA
    if (this.isInTelegram && this.showBackButton) {
      this.telegramWebAppService.setupBackButton(() => {
        this.onBackClick();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.isInTelegram) {
      this.telegramWebAppService.hideBackButton();
    }
  }

  onNavItemClick(item: any) {
    if (item.disabled) return;
    
    // Update active state
    this.navItems.forEach(navItem => navItem.active = false);
    item.active = true;
    
    this.navItemClick.emit(item);
  }

  onFabClick() {
    this.fabClick.emit();
  }

  onBackClick() {
    this.backClick.emit();
  }

  openNavigationSheet() {
    // TODO: Implement navigation sheet
    console.log('Navigation sheet not implemented yet');
  }
}
