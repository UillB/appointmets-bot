import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmColor: 'primary' | 'accent' | 'warn';
  icon?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirmation-dialog">
      <div class="dialog-header">
        <mat-icon *ngIf="data.icon" class="dialog-icon">{{ data.icon }}</mat-icon>
        <h2 class="dialog-title">{{ data.title }}</h2>
      </div>
      
      <div class="dialog-content">
        <p class="dialog-message">{{ data.message }}</p>
      </div>
      
      <div class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()" class="cancel-btn">
          {{ data.cancelText }}
        </button>
        <button 
          mat-raised-button 
          [color]="data.confirmColor"
          (click)="onConfirm()" 
          class="confirm-btn">
          {{ data.confirmText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      padding: 24px;
      min-width: 400px;
      
      .dialog-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        
        .dialog-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
          color: #f44336;
        }
        
        .dialog-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }
      
      .dialog-content {
        margin-bottom: 24px;
        
        .dialog-message {
          margin: 0;
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }
      }
      
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        
        .cancel-btn {
          border: 1px solid #e0e0e0;
          color: #666;
        }
        
        .confirm-btn {
          min-width: 80px;
        }
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}