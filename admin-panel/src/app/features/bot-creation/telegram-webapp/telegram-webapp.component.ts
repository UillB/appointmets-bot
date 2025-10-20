import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { BotManagementService, BotStatusResponse } from '../../../core/services/bot-management.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-telegram-webapp',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
    MatDividerModule,
    TranslatePipe
  ],
  templateUrl: './telegram-webapp.component.html',
  styleUrl: './telegram-webapp.component.scss'
})
export class TelegramWebappComponent implements OnInit {
  @Input() organizationId: number = 1;
  @Output() webappReady = new EventEmitter<void>();

  isTelegramWebApp = false;
  webAppData: any = null;
  botStatus: BotStatusResponse | null = null;
  isLoading = true;
  selectedTabIndex = 0;

  constructor(
    private botService: BotManagementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkTelegramWebApp();
    this.loadBotStatus();
  }

  /**
   * Проверка, запущено ли приложение в Telegram WebApp
   */
  private checkTelegramWebApp(): void {
    this.isTelegramWebApp = !!(window.Telegram && window.Telegram.WebApp);
    
    if (this.isTelegramWebApp) {
      this.initializeTelegramWebApp();
    } else {
      this.isLoading = false;
    }
  }

  /**
   * Инициализация Telegram WebApp
   */
  private initializeTelegramWebApp(): void {
    const webApp = window.Telegram!.WebApp;
    
    // Настраиваем WebApp
    webApp.ready();
    webApp.expand();
    
    // Получаем данные пользователя
    this.webAppData = webApp.initDataUnsafe;
    
    // Настраиваем кнопки
    this.setupWebAppButtons();
    
    // Настраиваем обработчики
    this.setupWebAppHandlers();
    
    this.isLoading = false;
    this.webappReady.emit();
  }

  /**
   * Настройка кнопок WebApp
   */
  private setupWebAppButtons(): void {
    const webApp = window.Telegram!.WebApp;
    
    // Настраиваем главную кнопку
    webApp.MainButton.setText('Записаться на консультацию');
    webApp.MainButton.color = '#007AFF';
    webApp.MainButton.textColor = '#FFFFFF';
    webApp.MainButton.show();
    
    // Обработчик клика по главной кнопке
    webApp.MainButton.onClick(() => {
      this.onMainButtonClick();
    });
  }

  /**
   * Настройка обработчиков WebApp
   */
  private setupWebAppHandlers(): void {
    const webApp = window.Telegram!.WebApp;
    
    // Обработчик кнопки "Назад"
    webApp.BackButton.onClick(() => {
      this.onBackButtonClick();
    });
  }

  /**
   * Загрузка статуса бота
   */
  private loadBotStatus(): void {
    this.botService.getBotStatus(this.organizationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.botStatus = response;
        }
      },
      error: (error) => {
        console.error('Error loading bot status:', error);
        this.showErrorMessage('Ошибка при загрузке статуса бота');
      }
    });
  }

  /**
   * Обработчик клика по главной кнопке
   */
  private onMainButtonClick(): void {
    const webApp = window.Telegram!.WebApp;
    
    // Показываем прогресс
    webApp.MainButton.showProgress();
    
    // Имитируем загрузку
    setTimeout(() => {
      webApp.MainButton.hideProgress();
      
      // Отправляем данные обратно в бот
      webApp.sendData(JSON.stringify({
        action: 'book_appointment',
        organizationId: this.organizationId,
        userId: this.webAppData?.user?.id
      }));
      
      // Закрываем WebApp
      webApp.close();
    }, 1000);
  }

  /**
   * Обработчик кнопки "Назад"
   */
  private onBackButtonClick(): void {
    const webApp = window.Telegram!.WebApp;
    webApp.close();
  }

  /**
   * Переключение вкладки
   */
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    
    // Обновляем главную кнопку в зависимости от вкладки
    const webApp = window.Telegram!.WebApp;
    if (webApp) {
      switch (index) {
        case 0:
          webApp.MainButton.setText('Записаться на консультацию');
          break;
        case 1:
          webApp.MainButton.setText('Мои записи');
          break;
        case 2:
          webApp.MainButton.setText('Настройки');
          break;
      }
    }
  }

  /**
   * Получение информации о пользователе
   */
  getUserInfo(): any {
    if (this.isTelegramWebApp && this.webAppData?.user) {
      return {
        id: this.webAppData.user.id,
        firstName: this.webAppData.user.first_name,
        lastName: this.webAppData.user.last_name,
        username: this.webAppData.user.username,
        languageCode: this.webAppData.user.language_code,
        isBot: this.webAppData.user.is_bot,
        isPremium: this.webAppData.user.is_premium
      };
    }
    return null;
  }

  /**
   * Получение информации о чате
   */
  getChatInfo(): any {
    if (this.isTelegramWebApp && this.webAppData?.chat) {
      return {
        id: this.webAppData.chat.id,
        type: this.webAppData.chat.type,
        title: this.webAppData.chat.title,
        username: this.webAppData.chat.username,
        firstName: this.webAppData.chat.first_name,
        lastName: this.webAppData.chat.last_name
      };
    }
    return null;
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
   * Показ сообщения об успехе
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}
