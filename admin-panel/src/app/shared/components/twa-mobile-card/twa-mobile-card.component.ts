import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-twa-mobile-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule
  ],
  template: `
    <div class="twa-mobile-card" [class]="cardClass" (click)="onCardClick()">
      <div class="card-header">
        <div class="card-title-section">
          <mat-icon class="card-icon" [class]="iconClass">{{ icon }}</mat-icon>
          <div class="title-content">
            <h3 class="card-title">{{ title }}</h3>
            <p *ngIf="subtitle" class="card-subtitle">{{ subtitle }}</p>
          </div>
        </div>
        <div class="card-status" *ngIf="status">
          <mat-chip [class]="'status-' + status" class="status-chip">
            {{ statusText }}
          </mat-chip>
        </div>
      </div>

      <div class="card-content" *ngIf="content">
        <div class="content-row" *ngFor="let row of contentRows">
          <mat-icon *ngIf="row.icon" class="content-icon">{{ row.icon }}</mat-icon>
          <span class="content-text">{{ row.text }}</span>
        </div>
        <p *ngIf="description" class="card-description">{{ description }}</p>
      </div>

      <div class="card-actions" *ngIf="showActions">
        <button 
          *ngFor="let action of actions" 
          mat-stroked-button 
          [class]="action.class"
          [color]="action.color"
          (click)="onActionClick($event, action)"
          class="action-button">
          <mat-icon *ngIf="action.icon">{{ action.icon }}</mat-icon>
          {{ action.text }}
        </button>
      </div>

      <div class="card-footer" *ngIf="footer">
        <span class="footer-text">{{ footer }}</span>
      </div>
    </div>
  `,
  styles: [`
    .twa-mobile-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 16px;
      padding: 16px;
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .card-title-section {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
    }

    .card-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      padding: 8px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .title-content {
      flex: 1;
      min-width: 0;
    }

    .card-title {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      line-height: 1.3;
    }

    .card-subtitle {
      margin: 0;
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }

    .card-status {
      flex-shrink: 0;
    }

    .status-chip {
      font-size: 12px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 12px;
      
      &.status-confirmed {
        background: #e8f5e9;
        color: #2e7d32;
      }
      
      &.status-pending {
        background: #fff3e0;
        color: #ef6c00;
      }
      
      &.status-cancelled {
        background: #ffebee;
        color: #c62828;
      }
      
      &.status-active {
        background: #e3f2fd;
        color: #1976d2;
      }
    }

    .card-content {
      margin-bottom: 12px;
    }

    .content-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }

    .content-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #666;
      flex-shrink: 0;
    }

    .content-text {
      font-size: 14px;
      color: #555;
      line-height: 1.4;
    }

    .card-description {
      margin: 8px 0 0 0;
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }

    .card-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .action-button {
      flex: 1;
      min-width: 0;
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.3s ease;
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .card-footer {
      border-top: 1px solid #f0f0f0;
      padding-top: 8px;
      margin-top: 8px;
    }

    .footer-text {
      font-size: 12px;
      color: #999;
    }

    /* Icon color variants */
    .icon-primary {
      background: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }

    .icon-success {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .icon-warning {
      background: rgba(255, 152, 0, 0.1);
      color: #ff9800;
    }

    .icon-error {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .icon-info {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    /* Card variants */
    .card-elevated {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    }

    .card-outlined {
      box-shadow: none;
      border: 2px solid #e0e0e0;
    }

    .card-flat {
      box-shadow: none;
      border: 1px solid #f0f0f0;
    }

    /* Mobile optimizations */
    @media (max-width: 480px) {
      .twa-mobile-card {
        padding: 12px;
        margin-bottom: 12px;
      }

      .card-title {
        font-size: 16px;
      }

      .card-subtitle {
        font-size: 13px;
      }

      .action-button {
        font-size: 11px;
        padding: 6px 10px;
      }
    }
  `]
})
export class TwaMobileCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() iconClass: string = 'icon-primary';
  @Input() status: string = '';
  @Input() statusText: string = '';
  @Input() content: any[] = [];
  @Input() description: string = '';
  @Input() actions: any[] = [];
  @Input() footer: string = '';
  @Input() showActions: boolean = true;
  @Input() cardClass: string = '';

  @Output() cardClick = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<{action: any, event: Event}>();

  get contentRows() {
    return Array.isArray(this.content) ? this.content : [];
  }

  onCardClick() {
    this.cardClick.emit();
  }

  onActionClick(event: Event, action: any) {
    event.stopPropagation();
    this.actionClick.emit({ action, event });
  }
}
