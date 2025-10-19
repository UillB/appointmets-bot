import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { BotManagementService, BotStatusResponse } from '../../../core/services/bot-management.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { QrCodeGeneratorComponent } from '../qr-code-generator/qr-code-generator.component';

@Component({
  selector: 'app-bot-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    TranslatePipe,
    QrCodeGeneratorComponent
  ],
  templateUrl: './bot-settings.component.html',
  styleUrl: './bot-settings.component.scss'
})
export class BotSettingsComponent implements OnInit {
  @Input() organizationId: number = 1;
  @Output() settingsUpdated = new EventEmitter<void>();

  settingsForm: FormGroup;
  isUpdating = false;
  botStatus: BotStatusResponse | null = null;
  botLink = '';
  qrCodeData = '';
  webAppUrl = '';

  constructor(
    private fb: FormBuilder,
    private botService: BotManagementService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.settingsForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(64)]],
      description: ['', [Validators.maxLength(512)]]
    });
  }

  ngOnInit(): void {
    this.loadBotStatus();
  }

  /**
   * Загрузка статуса бота
   */
  private loadBotStatus(): void {
    this.botService.getBotStatus(this.organizationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.botStatus = response;
          this.botLink = response.botStatus?.botLink || '';
          this.qrCodeData = this.botLink;
          
          // Заполняем форму текущими данными
          this.settingsForm.patchValue({
            name: response.botStatus?.firstName || '',
            description: this.getCurrentDescription()
          });

          // Загружаем WebApp URL
          this.loadWebAppUrl();
        }
      },
      error: (error) => {
        console.error('Error loading bot status:', error);
        this.showErrorMessage('Ошибка при загрузке статуса бота');
      }
    });
  }

  /**
   * Загрузка WebApp URL
   */
  private loadWebAppUrl(): void {
    this.botService.getWebAppUrl(this.organizationId).subscribe({
      next: (response: any) => {
        if (response.success && response.webAppUrl) {
          this.webAppUrl = response.webAppUrl;
        }
      },
      error: (error: any) => {
        console.error('Error loading WebApp URL:', error);
      }
    });
  }

  /**
   * Получение текущего описания бота
   */
  private getCurrentDescription(): string {
    // Здесь можно получить текущее описание из API или использовать дефолтное
    return 'Бот для записи на консультацию. Используйте /book для записи, /my для просмотра ваших записей.';
  }

  /**
   * Обновление настроек бота
   */
  async updateBotSettings(): Promise<void> {
    if (this.settingsForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isUpdating = true;

    try {
      const settings = {
        organizationId: this.organizationId,
        name: this.settingsForm.get('name')?.value,
        description: this.settingsForm.get('description')?.value
      };

      const response = await this.botService.updateBotSettings(this.organizationId, settings).toPromise();
      
      if (response?.success) {
        this.showSuccessMessage('Настройки бота успешно обновлены!');
        this.settingsUpdated.emit();
        
        // Перезагружаем статус бота
        this.loadBotStatus();
      } else {
        this.showErrorMessage(response?.error || 'Ошибка при обновлении настроек');
      }
    } catch (error) {
      this.showErrorMessage('Ошибка при обновлении настроек бота');
      console.error('Bot settings update error:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Копирование ссылки на бота
   */
  copyBotLink(): void {
    if (this.botLink) {
      navigator.clipboard.writeText(this.botLink).then(() => {
        this.showSuccessMessage('Ссылка на бота скопирована в буфер обмена');
      }).catch(() => {
        this.showErrorMessage('Не удалось скопировать ссылку');
      });
    }
  }

  /**
   * Поделиться ботом
   */
  shareBot(): void {
    if (navigator.share && this.botLink) {
      navigator.share({
        title: 'Мой бот для записи на консультацию',
        text: 'Записывайтесь на консультацию через моего Telegram бота!',
        url: this.botLink
      }).catch(() => {
        this.copyBotLink();
      });
    } else {
      this.copyBotLink();
    }
  }

  /**
   * Копирование WebApp URL
   */
  copyWebAppUrl(): void {
    if (this.webAppUrl) {
      navigator.clipboard.writeText(this.webAppUrl).then(() => {
        this.showSuccessMessage('WebApp URL скопирован в буфер обмена');
      }).catch(() => {
        this.showErrorMessage('Не удалось скопировать WebApp URL');
      });
    }
  }

  /**
   * Открытие WebApp в новой вкладке
   */
  openWebApp(): void {
    if (this.webAppUrl) {
      window.open(this.webAppUrl, '_blank');
    }
  }


  /**
   * Получение сообщения об ошибке для поля
   */
  getFieldError(fieldName: string): string {
    const field = this.settingsForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Поле обязательно для заполнения';
      }
      if (field.errors['minlength']) {
        return `Минимальная длина: ${field.errors['minlength'].requiredLength} символов`;
      }
      if (field.errors['maxlength']) {
        return `Максимальная длина: ${field.errors['maxlength'].requiredLength} символов`;
      }
    }
    return '';
  }

  /**
   * Проверка, можно ли обновить настройки
   */
  canUpdateSettings(): boolean {
    return this.settingsForm.valid && !this.isUpdating && (this.botStatus?.botStatus?.isActive || false);
  }

  /**
   * Получение статуса бота
   */
  getBotStatusText(): string {
    if (!this.botStatus?.botStatus) {
      return 'Статус неизвестен';
    }
    
    if (this.botStatus.botStatus.isActive) {
      return 'Активен';
    } else {
      return 'Неактивен';
    }
  }

  /**
   * Получение цвета статуса
   */
  getBotStatusColor(): string {
    if (!this.botStatus?.botStatus) {
      return 'warn';
    }
    
    return this.botStatus.botStatus.isActive ? 'primary' : 'warn';
  }

  /**
   * Отметка всех полей формы как touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.settingsForm.controls).forEach(key => {
      const control = this.settingsForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Показ сообщения об успехе
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 5000,
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
