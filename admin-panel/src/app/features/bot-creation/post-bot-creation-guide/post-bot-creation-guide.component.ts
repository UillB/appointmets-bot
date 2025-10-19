import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ServiceCreationGuideComponent } from '../service-creation-guide/service-creation-guide.component';
import { SlotsCreationGuideComponent } from '../slots-creation-guide/slots-creation-guide.component';

enum PostBotCreationStep {
  WELCOME = 0,
  CREATE_SERVICE = 1,
  CREATE_SLOTS = 2,
  COMPLETE = 3
}

@Component({
  selector: 'app-post-bot-creation-guide',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    ServiceCreationGuideComponent,
    SlotsCreationGuideComponent
  ],
  templateUrl: './post-bot-creation-guide.component.html',
  styleUrl: './post-bot-creation-guide.component.scss'
})
export class PostBotCreationGuideComponent implements OnInit {
  @Input() organizationId: number = 0;
  @Input() botUsername: string = '';
  @Output() guideCompleted = new EventEmitter<void>();
  @Output() skipGuide = new EventEmitter<void>();

  currentStep = PostBotCreationStep.WELCOME;
  PostBotCreationStep = PostBotCreationStep;
  
  serviceCreated = false;
  slotsCreated = false;

  constructor() {}

  ngOnInit(): void {}

  nextStep(): void {
    if (this.currentStep < PostBotCreationStep.COMPLETE) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > PostBotCreationStep.WELCOME) {
      this.currentStep--;
    }
  }

  onServiceCreated(): void {
    this.serviceCreated = true;
    this.nextStep();
  }

  onSlotsCreated(): void {
    this.slotsCreated = true;
    this.nextStep();
  }

  onServiceGuideSkipped(): void {
    this.nextStep();
  }

  onSlotsGuideSkipped(): void {
    this.nextStep();
  }

  completeGuide(): void {
    this.guideCompleted.emit();
  }

  skipEntireGuide(): void {
    this.skipGuide.emit();
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case PostBotCreationStep.WELCOME:
        return '🎉 Бот создан успешно!';
      case PostBotCreationStep.CREATE_SERVICE:
        return '📋 Создание услуг';
      case PostBotCreationStep.CREATE_SLOTS:
        return '📅 Настройка слотов';
      case PostBotCreationStep.COMPLETE:
        return '✅ Готово!';
      default:
        return '';
    }
  }

  getStepDescription(): string {
    switch (this.currentStep) {
      case PostBotCreationStep.WELCOME:
        return 'Теперь давайте настроим ваш бот для работы с клиентами';
      case PostBotCreationStep.CREATE_SERVICE:
        return 'Создайте услуги, на которые клиенты смогут записаться';
      case PostBotCreationStep.CREATE_SLOTS:
        return 'Настройте временные слоты для записи';
      case PostBotCreationStep.COMPLETE:
        return 'Ваш бот готов к работе! Клиенты могут записываться через Telegram';
      default:
        return '';
    }
  }

  isFirstStep(): boolean {
    return this.currentStep === PostBotCreationStep.WELCOME;
  }

  isLastStep(): boolean {
    return this.currentStep === PostBotCreationStep.COMPLETE;
  }
}
