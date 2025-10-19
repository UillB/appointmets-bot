import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BotCreationGuideComponent } from '../bot-creation-guide/bot-creation-guide.component';
import { BotTokenInputComponent } from '../bot-token-input/bot-token-input.component';
import { BotSettingsComponent } from '../bot-settings/bot-settings.component';
import { PostBotCreationGuideComponent } from '../post-bot-creation-guide/post-bot-creation-guide.component';
import { BotManagementService, BotActivationResponse } from '../../../core/services/bot-management.service';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-bot-management',
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    BotCreationGuideComponent,
    BotTokenInputComponent,
    BotSettingsComponent,
    PostBotCreationGuideComponent
  ],
  templateUrl: './bot-management.component.html',
  styleUrl: './bot-management.component.scss'
})
export class BotManagementComponent implements OnInit {
  selectedTabIndex = 0;
  currentUser: any = null;
  organizationId = 1; // По умолчанию
  botActivated = false;
  showPostCreationGuide = false;
  activatedBotUsername = '';

  constructor(
    private authService: AuthService,
    private botService: BotManagementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user:', this.currentUser);
    
    if (this.currentUser?.organizationId) {
      this.organizationId = this.currentUser.organizationId;
      console.log('Organization ID set to:', this.organizationId);
    } else {
      console.warn('No organization ID found for current user');
    }

    // Проверяем статус бота
    this.checkBotStatus();
  }

  /**
   * Проверка статуса бота
   */
  private checkBotStatus(): void {
    console.log('Checking bot status for organization:', this.organizationId);
    
    this.botService.getBotStatus(this.organizationId).subscribe({
      next: (response) => {
        console.log('Bot status response:', response);
        
        if (response.success && response.botStatus?.isActive) {
          console.log('Bot is active, switching to settings tab');
          this.botActivated = true;
          this.selectedTabIndex = 2; // Переходим на вкладку настроек
        } else {
          console.log('Bot is not active or response failed');
        }
      },
      error: (error) => {
        console.error('Error checking bot status:', error);
      }
    });
  }

  /**
   * Обработка активации бота
   */
  onBotActivated(response: BotActivationResponse): void {
    this.botActivated = true;
    this.activatedBotUsername = response.organization?.botUsername || '';
    
    this.snackBar.open(
      `Бот @${response.organization?.botUsername} успешно активирован!`,
      'Отлично!',
      { duration: 5000 }
    );

    // Показываем гайд после создания бота
    this.showPostCreationGuide = true;
  }

  /**
   * Обработка обновления настроек
   */
  onSettingsUpdated(): void {
    // Перезагружаем статус бота
    this.checkBotStatus();
  }

  /**
   * Переход к следующему шагу
   */
  goToNextStep(): void {
    if (this.selectedTabIndex < 2) {
      this.selectedTabIndex++;
    }
  }

  /**
   * Переход к предыдущему шагу
   */
  goToPreviousStep(): void {
    if (this.selectedTabIndex > 0) {
      this.selectedTabIndex--;
    }
  }

  /**
   * Завершение гайда после создания бота
   */
  onPostCreationGuideCompleted(): void {
    this.showPostCreationGuide = false;
    this.selectedTabIndex = 2; // Переходим на вкладку настроек
  }

  /**
   * Пропуск гайда после создания бота
   */
  onPostCreationGuideSkipped(): void {
    this.showPostCreationGuide = false;
    this.selectedTabIndex = 2; // Переходим на вкладку настроек
  }

  /**
   * Получение иконки для вкладки
   */
  getTabIcon(tabIndex: number): string {
    switch (tabIndex) {
      case 0: return 'school';
      case 1: return 'vpn_key';
      case 2: return 'settings';
      default: return 'help';
    }
  }

  /**
   * Получение заголовка вкладки
   */
  getTabTitle(tabIndex: number): string {
    switch (tabIndex) {
      case 0: return 'Инструкция';
      case 1: return 'Активация';
      case 2: return 'Настройки';
      default: return 'Неизвестно';
    }
  }

  /**
   * Проверка, доступна ли вкладка
   */
  isTabEnabled(tabIndex: number): boolean {
    switch (tabIndex) {
      case 0: return true; // Инструкция всегда доступна
      case 1: return true; // Активация всегда доступна
      case 2: return this.botActivated; // Настройки только после активации
      default: return false;
    }
  }

  /**
   * Получение статуса вкладки
   */
  getTabStatus(tabIndex: number): string {
    switch (tabIndex) {
      case 0: return 'completed';
      case 1: return this.botActivated ? 'completed' : 'pending';
      case 2: return this.botActivated ? 'active' : 'disabled';
      default: return 'disabled';
    }
  }
}
