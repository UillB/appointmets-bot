import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface ServiceGuideStep {
  id: string;
  title: string;
  description: string;
  image: string;
  instructions: string[];
  completed: boolean;
}

@Component({
  selector: 'app-service-creation-guide',
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
  templateUrl: './service-creation-guide.component.html',
  styleUrl: './service-creation-guide.component.scss'
})
export class ServiceCreationGuideComponent implements OnInit {
  @Input() organizationId: number = 0;
  @Output() serviceCreated = new EventEmitter<void>();
  @Output() skipGuide = new EventEmitter<void>();

  currentStep = 0;
  steps: ServiceGuideStep[] = [
    {
      id: 'what-is-service',
      title: 'Что такое услуга?',
      description: 'Услуга - это то, на что клиенты могут записаться через вашего бота',
      image: '/assets/guides/service-concept.png',
      instructions: [
        'Услуга определяет тип консультации или процедуры',
        'Каждая услуга имеет название, описание и длительность',
        'Клиенты выбирают услугу при записи через бота',
        'Примеры: "Консультация психолога", "УЗИ", "Юридическая консультация"'
      ],
      completed: false
    },
    {
      id: 'service-settings',
      title: 'Настройки услуги',
      description: 'Как правильно настроить услугу для максимальной эффективности',
      image: '/assets/guides/service-settings.png',
      instructions: [
        'Название должно быть понятным для клиентов',
        'Описание помогает клиентам понять, что включает услуга',
        'Длительность влияет на количество доступных слотов',
        'Можно добавить названия на разных языках (RU, EN, HE)'
      ],
      completed: false
    },
    {
      id: 'duration-tips',
      title: 'Советы по длительности',
      description: 'Как правильно выбрать длительность услуги',
      image: '/assets/guides/duration-tips.png',
      instructions: [
        'Консультации: 30-60 минут',
        'Процедуры: 15-45 минут',
        'Обследования: 30-90 минут',
        'Учитывайте время на подготовку и оформление документов'
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
    this.serviceCreated.emit();
  }

  skipToServices(): void {
    this.skipGuide.emit();
  }

  getCurrentStep(): ServiceGuideStep {
    return this.steps[this.currentStep];
  }

  isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  getStepIcon(stepIndex: number): string {
    const icons = ['info', 'settings', 'schedule'];
    return icons[stepIndex] || 'help';
  }
}
