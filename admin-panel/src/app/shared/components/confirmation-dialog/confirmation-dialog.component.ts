import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
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
        <h2 mat-dialog-title>
          <mat-icon *ngIf="data.icon" class="dialog-icon">{{ data.icon }}</mat-icon>
          {{ data.title }}
        </h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <p class="dialog-message">{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-button">
          {{ data.cancelText || 'Отмена' }}
        </button>
        <button 
          mat-raised-button 
          [color]="data.confirmColor || 'warn'"
          (click)="onConfirm()"
          class="confirm-button">
          {{ data.confirmText || 'Подтвердить' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 400px;
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dialog-icon {
      color: #f44336;
    }

    .dialog-content {
      padding: 0 24px;
      margin-bottom: 16px;
    }

    .dialog-message {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
      color: #666;
    }

    .dialog-actions {
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }

    .cancel-button {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .confirmation-dialog {
        min-width: auto;
        max-width: 100vw;
        width: 100vw;
        margin: -24px;
      }

      .dialog-content {
        padding: 0 16px;
      }

      .dialog-actions {
        padding: 16px;
        flex-direction: column-reverse;
        gap: 12px;
      }

      .cancel-button {
        margin-right: 0;
        width: 100%;
      }

      .confirm-button {
        width: 100%;
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
