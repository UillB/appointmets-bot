import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface SlotsGuideStep {
  id: string;
  title: string;
  description: string;
  image: string;
  instructions: string[];
  completed: boolean;
}

@Component({
  selector: 'app-slots-creation-guide',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './slots-creation-guide.component.html',
  styleUrl: './slots-creation-guide.component.scss'
})
export class SlotsCreationGuideComponent implements OnInit {
  @Input() organizationId: number = 0;
  @Output() slotsCreated = new EventEmitter<void>();
  @Output() skipGuide = new EventEmitter<void>();

  currentStep = 0;
  steps: SlotsGuideStep[] = [
    {
      id: 'what-are-slots',
      title: 'Что такое слоты?',
      description: 'Слоты - это доступные временные окна для записи на услуги',
      image: '/assets/guides/slots-concept.png',
      instructions: [
        'Слот - это конкретное время для записи (например: 10:00-11:00)',
        'Каждый слот привязан к определенной услуге',
        'Клиенты выбирают свободный слот при записи',
        'Слоты генерируются автоматически на основе расписания'
      ],
      completed: false
    },
    {
      id: 'working-hours',
      title: 'Рабочие часы',
      description: 'Настройте рабочие часы для автоматической генерации слотов',
      image: '/assets/guides/working-hours.png',
      instructions: [
        'Укажите время начала работы (например: 09:00)',
        'Укажите время окончания работы (например: 18:00)',
        'Установите обеденный перерыв (например: 13:00-14:00)',
        'Система автоматически создаст слоты в рабочее время'
      ],
      completed: false
    },
    {
      id: 'weekends-holidays',
      title: 'Выходные и праздники',
      description: 'Настройте выходные дни и исключения',
      image: '/assets/guides/weekends.png',
      instructions: [
        'Выберите выходные дни (суббота, воскресенье)',
        'Добавьте праздничные дни',
        'Укажите дни отпуска или технических работ',
        'В эти дни слоты создаваться не будут'
      ],
      completed: false
    },
    {
      id: 'slot-duration',
      title: 'Длительность слотов',
      description: 'Настройте длительность слотов для каждой услуги',
      image: '/assets/guides/slot-duration.png',
      instructions: [
        'Длительность должна соответствовать длительности услуги',
        'Консультации: 30-60 минут',
        'Процедуры: 15-45 минут',
        'Можно настроить буферное время между записями'
      ],
      completed: false
    },
    {
      id: 'auto-generation',
      title: 'Автоматическая генерация',
      description: 'Как система автоматически создает слоты',
      image: '/assets/guides/auto-generation.png',
      instructions: [
        'Система создает слоты на 7 дней вперед',
        'Слоты обновляются каждый день',
        'Можно настроить количество дней для генерации',
        'Старые слоты автоматически удаляются'
      ],
      completed: false
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.steps[this.currentStep].completed = true;
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  completeGuide(): void {
    this.steps[this.currentStep].completed = true;
    this.slotsCreated.emit();
  }

  skipToSlots(): void {
    this.skipGuide.emit();
  }

  getCurrentStep(): SlotsGuideStep {
    return this.steps[this.currentStep];
  }

  isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  getStepIcon(stepIndex: number): string {
    const icons = ['info', 'schedule', 'event_busy', 'timer', 'auto_awesome'];
    return icons[stepIndex] || 'help';
  }
}
