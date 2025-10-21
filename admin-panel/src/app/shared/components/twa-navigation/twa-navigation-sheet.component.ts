import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-twa-navigation-sheet',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule
  ],
  template: `
    <div class="navigation-sheet">
      <div class="sheet-header">
        <h3>Навигация</h3>
        <button mat-icon-button (click)="dismiss()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="nav-items">
        <button 
          *ngFor="let item of navItems" 
          mat-button 
          (click)="selectItem(item)"
          class="nav-item"
          [class.active]="item.active"
          [class.disabled]="item.disabled">
          <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
          <div class="nav-content">
            <span class="nav-label">{{ item.label }}</span>
            <span *ngIf="item.description" class="nav-description">{{ item.description }}</span>
          </div>
          <mat-icon *ngIf="item.active" class="active-icon">check</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .navigation-sheet {
      padding: 16px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .sheet-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .close-button {
      color: #666;
      
      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }

    .nav-items {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      text-align: left;
      width: 100%;
      transition: all 0.3s ease;
      color: #333;
      
      &:hover:not(.disabled) {
        background: rgba(0, 0, 0, 0.05);
      }

      &.active {
        background: rgba(25, 118, 210, 0.1);
        color: #1976d2;
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .nav-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #666;
    }

    .nav-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-label {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.2;
    }

    .nav-description {
      font-size: 12px;
      color: #666;
      line-height: 1.3;
    }

    .active-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #1976d2;
    }

    .nav-item.active .nav-icon {
      color: #1976d2;
    }
  `]
})
export class TwaNavigationSheetComponent {
  navItems: any[] = [];

  constructor(
    private bottomSheetRef: MatBottomSheetRef<TwaNavigationSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {
    this.navItems = data.navItems || [];
  }

  selectItem(item: any) {
    if (item.disabled) return;
    this.bottomSheetRef.dismiss(item);
  }

  dismiss() {
    this.bottomSheetRef.dismiss();
  }
}
