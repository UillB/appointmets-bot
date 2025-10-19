import { Component, OnInit, Input, Output, EventEmitter, OnChanges, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code-generator',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './qr-code-generator.component.html',
  styleUrl: './qr-code-generator.component.scss'
})
export class QrCodeGeneratorComponent implements OnInit, OnChanges {
  @Input() data: string = '';
  @Input() size: number = 200;
  @Input() showDownloadButton: boolean = true;
  @Input() showShareButton: boolean = true;
  @Output() qrGenerated = new EventEmitter<string>();

  qrCodeDataUrl = '';
  isGenerating = false;
  error: string | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.generateQRCode();
    }
  }

  ngOnChanges(): void {
    if (this.data) {
      this.generateQRCode();
    }
  }

  /**
   * Генерация QR-кода
   */
  async generateQRCode(): Promise<void> {
    if (!this.data) {
      this.error = 'Нет данных для генерации QR-кода';
      return;
    }

    this.isGenerating = true;
    this.error = null;

    try {
      const options: QRCode.QRCodeToDataURLOptions = {
        width: this.size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      };

      this.qrCodeDataUrl = await QRCode.toDataURL(this.data, options);
      this.qrGenerated.emit(this.qrCodeDataUrl);
    } catch (error) {
      console.error('QR Code generation error:', error);
      this.error = 'Ошибка при генерации QR-кода';
      this.showErrorMessage('Не удалось сгенерировать QR-код');
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Скачивание QR-кода
   */
  downloadQRCode(): void {
    if (!this.qrCodeDataUrl) {
      this.showErrorMessage('QR-код не сгенерирован');
      return;
    }

    try {
      const link = document.createElement('a');
      link.download = `bot-qr-code-${Date.now()}.png`;
      link.href = this.qrCodeDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.showSuccessMessage('QR-код скачан успешно');
    } catch (error) {
      console.error('Download error:', error);
      this.showErrorMessage('Ошибка при скачивании QR-кода');
    }
  }

  /**
   * Поделиться QR-кодом
   */
  shareQRCode(): void {
    if (!this.qrCodeDataUrl) {
      this.showErrorMessage('QR-код не сгенерирован');
      return;
    }

    // Конвертируем data URL в blob
    fetch(this.qrCodeDataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'bot-qr-code.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          navigator.share({
            title: 'QR-код для бота',
            text: 'Сканируйте QR-код для перехода к боту',
            files: [file]
          }).catch(() => {
            this.copyQRCodeToClipboard();
          });
        } else {
          this.copyQRCodeToClipboard();
        }
      })
      .catch(() => {
        this.copyQRCodeToClipboard();
      });
  }

  /**
   * Копирование QR-кода в буфер обмена
   */
  private copyQRCodeToClipboard(): void {
    if (!this.qrCodeDataUrl) {
      this.showErrorMessage('QR-код не сгенерирован');
      return;
    }

    // Конвертируем data URL в blob
    fetch(this.qrCodeDataUrl)
      .then(res => res.blob())
      .then(blob => {
        navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]).then(() => {
          this.showSuccessMessage('QR-код скопирован в буфер обмена');
        }).catch(() => {
          this.showErrorMessage('Не удалось скопировать QR-код');
        });
      })
      .catch(() => {
        this.showErrorMessage('Ошибка при копировании QR-кода');
      });
  }

  /**
   * Открытие QR-кода в полном размере
   */
  openQRCodeFullscreen(): void {
    if (!this.qrCodeDataUrl) {
      this.showErrorMessage('QR-код не сгенерирован');
      return;
    }

    // Создаем диалог с QR-кодом в полном размере
    const dialogRef = this.dialog.open(QrCodeDialogComponent, {
      width: '400px',
      data: {
        qrCodeDataUrl: this.qrCodeDataUrl,
        data: this.data
      }
    });
  }

  /**
   * Показ сообщения об успехе
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Показ сообщения об ошибке
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}

// Диалог для отображения QR-кода в полном размере
@Component({
  selector: 'app-qr-code-dialog',
  template: `
    <div class="qr-dialog">
      <h2 mat-dialog-title>QR-код для бота</h2>
      
      <mat-dialog-content>
        <div class="qr-content">
          <img [src]="data.qrCodeDataUrl" [alt]="'QR-код для ' + data.data" class="qr-image">
          <p class="qr-text">{{ data.data }}</p>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Закрыть</button>
        <button mat-raised-button color="primary" (click)="downloadQRCode()">
          <mat-icon>download</mat-icon>
          Скачать
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .qr-dialog {
      text-align: center;
    }
    
    .qr-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    .qr-image {
      max-width: 100%;
      height: auto;
    }
    
    .qr-text {
      word-break: break-all;
      font-size: 12px;
      color: #666;
    }
  `],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ]
})
export class QrCodeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<QrCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { qrCodeDataUrl: string; data: string }
  ) {}

  downloadQRCode(): void {
    const link = document.createElement('a');
    link.download = `bot-qr-code-${Date.now()}.png`;
    link.href = this.data.qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
