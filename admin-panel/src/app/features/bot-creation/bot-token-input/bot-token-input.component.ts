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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { BotManagementService, BotValidationResponse, BotActivationResponse } from '../../../core/services/bot-management.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-bot-token-input',
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
    MatDialogModule,
    MatChipsModule,
    TranslatePipe
  ],
  templateUrl: './bot-token-input.component.html',
  styleUrl: './bot-token-input.component.scss'
})
export class BotTokenInputComponent implements OnInit {
  @Input() organizationId: number = 1; // По умолчанию
  @Output() botActivated = new EventEmitter<BotActivationResponse>();

  tokenForm: FormGroup;
  isValidating = false;
  isActivating = false;
  validationResult: 'success' | 'error' | null = null;
  botInfo: any = null;
  showToken = false;

  constructor(
    private fb: FormBuilder,
    private botService: BotManagementService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.tokenForm = this.fb.group({
      token: ['', [
        Validators.required,
        Validators.pattern(/^\d+:[A-Za-z0-9_-]+$/)
      ]]
    });
  }

  ngOnInit(): void {
    // Загружаем сохраненный токен из localStorage
    this.loadSavedToken();
  }

  /**
   * Валидация токена
   */
  async validateToken(): Promise<void> {
    if (this.tokenForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const token = this.tokenForm.get('token')?.value;
    if (!token) return;

    this.isValidating = true;
    this.validationResult = null;
    this.botInfo = null;

    try {
      const response = await this.botService.validateBotToken(token).toPromise();
      
      if (response?.success && response.bot) {
        this.validationResult = 'success';
        this.botInfo = response.bot;
        this.showSuccessMessage(`Бот @${response.bot.username} найден и готов к активации!`);
      } else {
        this.validationResult = 'error';
        this.showErrorMessage(response?.error || 'Неверный токен бота');
      }
    } catch (error) {
      this.validationResult = 'error';
      this.showErrorMessage('Ошибка при валидации токена. Проверьте подключение к интернету.');
      console.error('Token validation error:', error);
    } finally {
      this.isValidating = false;
    }
  }

  /**
   * Активация бота
   */
  async activateBot(): Promise<void> {
    if (!this.botInfo || this.validationResult !== 'success') {
      this.showErrorMessage('Сначала необходимо валидировать токен');
      return;
    }

    const token = this.tokenForm.get('token')?.value;
    if (!token) return;

    this.isActivating = true;

    try {
      const response = await this.botService.activateBot({ token, organizationId: this.organizationId }).toPromise();
      
      if (response?.success && response.organization) {
        this.showSuccessMessage(`Бот @${response.organization.botUsername} успешно активирован!`);
        this.saveToken(token);
        this.botActivated.emit(response);
        
        // Показываем диалог с результатом
        this.showActivationSuccessDialog(response.organization);
      } else {
        this.showErrorMessage(response?.error || 'Ошибка при активации бота');
      }
    } catch (error) {
      this.showErrorMessage('Ошибка при активации бота. Попробуйте еще раз.');
      console.error('Bot activation error:', error);
    }
    
    // Всегда сбрасываем состояние загрузки
    this.isActivating = false;
  }

  /**
   * Переключение видимости токена
   */
  toggleTokenVisibility(): void {
    this.showToken = !this.showToken;
  }

  /**
   * Копирование токена в буфер обмена
   */
  copyToken(): void {
    const token = this.tokenForm.get('token')?.value;
    if (token) {
      navigator.clipboard.writeText(token).then(() => {
        this.showSuccessMessage('Токен скопирован в буфер обмена');
      }).catch(() => {
        this.showErrorMessage('Не удалось скопировать токен');
      });
    }
  }

  /**
   * Очистка формы
   */
  clearForm(): void {
    this.tokenForm.reset();
    this.validationResult = null;
    this.botInfo = null;
    this.showToken = false;
    localStorage.removeItem('bot-token');
  }

  /**
   * Получение сообщения об ошибке для поля
   */
  getFieldError(fieldName: string): string {
    const field = this.tokenForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Токен обязателен для заполнения';
      }
      if (field.errors['pattern']) {
        return 'Неверный формат токена. Токен должен иметь вид: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz';
      }
    }
    return '';
  }

  /**
   * Проверка, можно ли активировать бота
   */
  canActivateBot(): boolean {
    return this.validationResult === 'success' && this.botInfo && !this.isActivating;
  }

  /**
   * Проверка, можно ли валидировать токен
   */
  canValidateToken(): boolean {
    return this.tokenForm.valid && !this.isValidating;
  }

  /**
   * Получение иконки для статуса валидации
   */
  getValidationIcon(): string {
    if (this.isValidating) return 'hourglass_empty';
    if (this.validationResult === 'success') return 'check_circle';
    if (this.validationResult === 'error') return 'error';
    return 'help_outline';
  }

  /**
   * Получение цвета для статуса валидации
   */
  getValidationColor(): string {
    if (this.isValidating) return 'primary';
    if (this.validationResult === 'success') return 'primary';
    if (this.validationResult === 'error') return 'warn';
    return '';
  }

  /**
   * Сохранение токена в localStorage
   */
  private saveToken(token: string): void {
    localStorage.setItem('bot-token', token);
  }

  /**
   * Загрузка сохраненного токена
   */
  private loadSavedToken(): void {
    const savedToken = localStorage.getItem('bot-token');
    if (savedToken) {
      this.tokenForm.patchValue({ token: savedToken });
    }
  }

  /**
   * Отметка всех полей формы как touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.tokenForm.controls).forEach(key => {
      const control = this.tokenForm.get(key);
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

  /**
   * Показ диалога успешной активации
   */
  private showActivationSuccessDialog(organization: any): void {
    // Здесь можно добавить диалог с информацией об успешной активации
    // Пока просто показываем snackbar
    this.showSuccessMessage(`Бот @${organization.botUsername} готов к работе! Ссылка: ${organization.botLink}`);
  }
}
