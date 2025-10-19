import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface BotCreationStep {
  id: string;
  title: string;
  description: string;
  image: string;
  instructions: string[];
  completed: boolean;
}

@Component({
  selector: 'app-bot-creation-guide',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './bot-creation-guide.component.html',
  styleUrl: './bot-creation-guide.component.scss'
})
export class BotCreationGuideComponent implements OnInit {
  currentStep = 0;
  steps: BotCreationStep[] = [
    {
      id: 'find-botfather',
      title: 'Найдите BotFather',
      description: 'Откройте Telegram и найдите @BotFather',
      image: '/assets/guides/botfather-search.png',
      instructions: [
        'Откройте Telegram на телефоне или компьютере',
        'В поиске введите @BotFather',
        'Нажмите на бота и нажмите "Start"'
      ],
      completed: false
    },
    {
      id: 'create-bot',
      title: 'Создайте бота',
      description: 'Отправьте команду /newbot и следуйте инструкциям',
      image: '/assets/guides/newbot-command.png',
      instructions: [
        'Отправьте команду /newbot',
        'Введите название вашего бота (например: "Моя Клиника")',
        'Введите username бота (например: "my_clinic_bot")',
        'Убедитесь, что username уникален'
      ],
      completed: false
    },
    {
      id: 'copy-token',
      title: 'Скопируйте токен',
      description: 'Скопируйте токен, который даст BotFather',
      image: '/assets/guides/bot-token.png',
      instructions: [
        'BotFather даст вам токен вида: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
        'Скопируйте весь токен',
        'Сохраните токен в безопасном месте'
      ],
      completed: false
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Загружаем прогресс из localStorage
    this.loadProgress();
  }

  /**
   * Переход к следующему шагу
   */
  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.steps[this.currentStep].completed = true;
      this.currentStep++;
      this.saveProgress();
    }
  }

  /**
   * Переход к предыдущему шагу
   */
  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  /**
   * Переход к конкретному шагу
   */
  goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.currentStep = stepIndex;
    }
  }

  /**
   * Отметить шаг как выполненный
   */
  markStepCompleted(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.steps[stepIndex].completed = true;
      this.saveProgress();
    }
  }

  /**
   * Проверить, завершен ли шаг
   */
  isStepCompleted(stepIndex: number): boolean {
    return this.steps[stepIndex]?.completed || false;
  }

  /**
   * Проверить, можно ли перейти к следующему шагу
   */
  canProceedToNext(): boolean {
    return this.currentStep < this.steps.length - 1;
  }

  /**
   * Проверить, можно ли перейти к предыдущему шагу
   */
  canGoBack(): boolean {
    return this.currentStep > 0;
  }

  /**
   * Получить процент выполнения
   */
  getProgressPercentage(): number {
    const completedSteps = this.steps.filter(step => step.completed).length;
    return Math.round((completedSteps / this.steps.length) * 100);
  }

  /**
   * Сохранить прогресс в localStorage
   */
  private saveProgress(): void {
    const progress = {
      currentStep: this.currentStep,
      steps: this.steps.map(step => ({
        id: step.id,
        completed: step.completed
      }))
    };
    localStorage.setItem('bot-creation-progress', JSON.stringify(progress));
  }

  /**
   * Загрузить прогресс из localStorage
   */
  private loadProgress(): void {
    const savedProgress = localStorage.getItem('bot-creation-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        this.currentStep = progress.currentStep || 0;
        
        // Восстанавливаем статус шагов
        progress.steps?.forEach((savedStep: any) => {
          const step = this.steps.find(s => s.id === savedStep.id);
          if (step) {
            step.completed = savedStep.completed;
          }
        });
      } catch (error) {
        console.error('Error loading bot creation progress:', error);
      }
    }
  }

  /**
   * Сбросить прогресс
   */
  resetProgress(): void {
    this.currentStep = 0;
    this.steps.forEach(step => {
      step.completed = false;
    });
    localStorage.removeItem('bot-creation-progress');
  }

  /**
   * Получить локализованный текст для шага
   */
  getLocalizedStep(stepId: string, field: string): string {
    // Здесь можно добавить логику для мультиязычности
    // Пока возвращаем русский текст
    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      return (step as any)[field] || '';
    }
    return '';
  }

  /**
   * Получить иконку для шага
   */
  getStepIcon(stepIndex: number): string {
    if (this.isStepCompleted(stepIndex)) {
      return 'check_circle';
    } else if (stepIndex === this.currentStep) {
      return 'radio_button_checked';
    } else {
      return 'radio_button_unchecked';
    }
  }

  /**
   * Получить цвет для шага
   */
  getStepColor(stepIndex: number): string {
    if (this.isStepCompleted(stepIndex)) {
      return 'primary';
    } else if (stepIndex === this.currentStep) {
      return 'accent';
    } else {
      return 'warn';
    }
  }
}
