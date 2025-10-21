import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { TelegramWebAppService } from '../../../core/services/telegram-webapp.service';
import { TwaMobileCardComponent } from '../twa-mobile-card/twa-mobile-card.component';

@Component({
  selector: 'app-twa-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    TwaMobileCardComponent
  ],
  template: `
    <div class="twa-list" [class.telegram-theme]="isInTelegram">
      <!-- Header Section -->
      <div class="list-header" *ngIf="showHeader">
        <div class="header-content">
          <h1 class="list-title">{{ title }}</h1>
          <p *ngIf="subtitle" class="list-subtitle">{{ subtitle }}</p>
        </div>
        <button 
          *ngIf="showCreateButton" 
          mat-fab 
          color="primary" 
          (click)="onCreateClick()"
          class="create-fab">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      <!-- Filters Section -->
      <div class="list-filters" *ngIf="showFilters && filters.length > 0">
        <div class="filter-chips">
          <button 
            *ngFor="let filter of filters" 
            mat-stroked-button 
            [class.active]="filter.active"
            (click)="onFilterClick(filter)"
            class="filter-chip">
            <mat-icon *ngIf="filter.icon">{{ filter.icon }}</mat-icon>
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>{{ loadingMessage }}</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && items.length === 0" class="empty-state">
        <mat-icon class="empty-icon">{{ emptyIcon }}</mat-icon>
        <h3>{{ emptyTitle }}</h3>
        <p>{{ emptyMessage }}</p>
        <button 
          *ngIf="showCreateButton" 
          mat-raised-button 
          color="primary" 
          (click)="onCreateClick()">
          <mat-icon>add</mat-icon>
          {{ createButtonText }}
        </button>
      </div>

      <!-- Items List -->
      <div *ngIf="!loading && items.length > 0" class="items-container">
        <app-twa-mobile-card
          *ngFor="let item of items; trackBy: trackByFn"
          [title]="getItemTitle(item)"
          [subtitle]="getItemSubtitle(item)"
          [icon]="getItemIcon(item)"
          [iconClass]="getItemIconClass(item)"
          [status]="getItemStatus(item)"
          [statusText]="getItemStatusText(item)"
          [content]="getItemContent(item)"
          [description]="getItemDescription(item)"
          [actions]="getItemActions(item)"
          [footer]="getItemFooter(item)"
          [cardClass]="getItemCardClass(item)"
          (cardClick)="onItemClick(item)"
          (actionClick)="onItemActionClick($event, item)">
        </app-twa-mobile-card>
      </div>

      <!-- Load More Button -->
      <div *ngIf="showLoadMore && hasMore" class="load-more-container">
        <button 
          mat-stroked-button 
          (click)="onLoadMoreClick()"
          [disabled]="loadingMore"
          class="load-more-button">
          <mat-spinner *ngIf="loadingMore" diameter="20"></mat-spinner>
          <mat-icon *ngIf="!loadingMore">expand_more</mat-icon>
          {{ loadMoreText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .twa-list {
      padding: 16px;
      max-width: 100%;
      margin: 0 auto;
    }

    .twa-list.telegram-theme {
      background: var(--tg-theme-bg-color, #f8f9fa);
      color: var(--tg-theme-text-color, #000);
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 16px;
    }

    .header-content {
      flex: 1;
    }

    .list-title {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
      line-height: 1.2;
    }

    .list-subtitle {
      margin: 0;
      font-size: 16px;
      color: #666;
      line-height: 1.4;
    }

    .create-fab {
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(25, 118, 210, 0.5);
      }
    }

    .list-filters {
      margin-bottom: 16px;
    }

    .filter-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-chip {
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 16px;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &.active {
        background: #1976d2;
        color: white;
        border-color: #1976d2;
        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
      }

      &:not(.active) {
        background: white;
        color: #666;
        border-color: #ddd;
        
        &:hover {
          border-color: #1976d2;
          color: #1976d2;
        }
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 6px;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
      font-size: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: #666;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: #999;
      max-width: 300px;
    }

    .items-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .load-more-container {
      display: flex;
      justify-content: center;
      margin-top: 24px;
    }

    .load-more-button {
      padding: 12px 24px;
      border-radius: 25px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      
      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      mat-spinner {
        margin-right: 8px;
      }
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .twa-list {
        padding: 12px;
      }

      .list-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .list-title {
        font-size: 20px;
      }

      .list-subtitle {
        font-size: 14px;
      }

      .filter-chips {
        gap: 6px;
      }

      .filter-chip {
        font-size: 12px;
        padding: 6px 12px;
      }
    }

    /* TWA theme adjustments */
    .twa-list.telegram-theme {
      .list-title {
        color: var(--tg-theme-text-color, #333);
      }

      .list-subtitle {
        color: var(--tg-theme-hint-color, #666);
      }

      .filter-chip {
        &:not(.active) {
          background: var(--tg-theme-secondary-bg-color, white);
          color: var(--tg-theme-hint-color, #666);
          border-color: var(--tg-theme-hint-color, #ddd);
        }

        &.active {
          background: var(--tg-theme-button-color, #1976d2);
          color: var(--tg-theme-button-text-color, white);
        }
      }
    }
  `]
})
export class TwaListComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() items: any[] = [];
  @Input() loading: boolean = false;
  @Input() loadingMessage: string = 'Загрузка...';
  @Input() showHeader: boolean = true;
  @Input() showCreateButton: boolean = true;
  @Input() createButtonText: string = 'Создать';
  @Input() showFilters: boolean = true;
  @Input() filters: any[] = [];
  @Input() showLoadMore: boolean = false;
  @Input() hasMore: boolean = false;
  @Input() loadingMore: boolean = false;
  @Input() loadMoreText: string = 'Загрузить еще';
  @Input() emptyIcon: string = 'inbox';
  @Input() emptyTitle: string = 'Нет данных';
  @Input() emptyMessage: string = 'Список пуст';

  @Output() itemClick = new EventEmitter<any>();
  @Output() itemActionClick = new EventEmitter<{action: any, item: any, event: Event}>();
  @Output() createClick = new EventEmitter<void>();
  @Output() filterClick = new EventEmitter<any>();
  @Output() loadMoreClick = new EventEmitter<void>();

  isInTelegram = false;

  constructor(private telegramWebAppService: TelegramWebAppService) {}

  ngOnInit(): void {
    this.isInTelegram = this.telegramWebAppService.isInTelegram;
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('window:universal-refresh')
  onUniversalRefresh() {
    console.log('🔄 Universal refresh triggered in TwaListComponent');
    // List component can handle refresh logic
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  getItemTitle(item: any): string {
    return item.title || item.name || '';
  }

  getItemSubtitle(item: any): string {
    return item.subtitle || item.description || '';
  }

  getItemIcon(item: any): string {
    return item.icon || 'circle';
  }

  getItemIconClass(item: any): string {
    return item.iconClass || 'icon-primary';
  }

  getItemStatus(item: any): string {
    return item.status || '';
  }

  getItemStatusText(item: any): string {
    return item.statusText || item.status || '';
  }

  getItemContent(item: any): any[] {
    return item.content || [];
  }

  getItemDescription(item: any): string {
    return item.description || '';
  }

  getItemActions(item: any): any[] {
    return item.actions || [];
  }

  getItemFooter(item: any): string {
    return item.footer || '';
  }

  getItemCardClass(item: any): string {
    return item.cardClass || '';
  }

  onItemClick(item: any) {
    this.itemClick.emit(item);
  }

  onItemActionClick(event: {action: any, event: Event}, item: any) {
    this.itemActionClick.emit({ action: event.action, item, event: event.event });
  }

  onCreateClick() {
    this.createClick.emit();
  }

  onFilterClick(filter: any) {
    // Update active state
    this.filters.forEach(f => f.active = false);
    filter.active = true;
    
    this.filterClick.emit(filter);
  }

  onLoadMoreClick() {
    this.loadMoreClick.emit();
  }
}
