import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { HealthService } from '../../../core/services/health.service';
import { ServicesService } from '../../../core/services/services.service';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { SlotsService } from '../../../core/services/slots.service';

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Тест подключения к API</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="test-section">
          <h3>Проверка состояния API</h3>
          <button mat-raised-button color="primary" (click)="testHealth()" [disabled]="loading">
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
            Проверить подключение
          </button>
          <div *ngIf="healthStatus" class="status">
            <p [class.success]="healthStatus.ok" [class.error]="!healthStatus.ok">
              {{ healthStatus.ok ? '✅ API доступен' : '❌ API недоступен' }}
            </p>
          </div>
        </div>

        <div class="test-section">
          <h3>Тест получения данных</h3>
          <button mat-raised-button color="accent" (click)="testServices()" [disabled]="loading">
            Получить услуги
          </button>
          <button mat-raised-button color="accent" (click)="testAppointments()" [disabled]="loading">
            Получить записи
          </button>
          <button mat-raised-button color="accent" (click)="testSlots()" [disabled]="loading">
            Получить слоты
          </button>
          
          <div *ngIf="testResults.length > 0" class="results">
            <h4>Результаты тестов:</h4>
            <ul>
              <li *ngFor="let result of testResults" [class.success]="result.success" [class.error]="!result.success">
                {{ result.test }}: {{ result.success ? '✅ Успешно' : '❌ Ошибка' }}
                <span *ngIf="result.data">({{ result.data }} записей)</span>
                <span *ngIf="result.error">: {{ result.error }}</span>
              </li>
            </ul>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .test-section {
      margin-bottom: 2rem;
    }
    
    .test-section h3 {
      margin-bottom: 1rem;
      color: #333;
    }
    
    .test-section button {
      margin-right: 1rem;
      margin-bottom: 1rem;
    }
    
    .status p {
      margin-top: 1rem;
      padding: 0.5rem;
      border-radius: 4px;
    }
    
    .success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .results {
      margin-top: 1rem;
    }
    
    .results ul {
      list-style: none;
      padding: 0;
    }
    
    .results li {
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;
    }
    
    mat-spinner {
      margin-right: 0.5rem;
    }
  `]
})
export class ApiTestComponent implements OnInit {
  loading = false;
  healthStatus: { ok: boolean } | null = null;
  testResults: Array<{ test: string; success: boolean; data?: number; error?: string }> = [];

  constructor(
    private healthService: HealthService,
    private servicesService: ServicesService,
    private appointmentsService: AppointmentsService,
    private slotsService: SlotsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Автоматически проверяем подключение при загрузке
    this.testHealth();
  }

  testHealth() {
    this.loading = true;
    this.healthService.checkHealth().subscribe({
      next: (response) => {
        this.healthStatus = response;
        this.loading = false;
        this.snackBar.open('Проверка подключения завершена', 'Закрыть', { duration: 3000 });
      },
      error: (error) => {
        this.healthStatus = { ok: false };
        this.loading = false;
        this.snackBar.open(`Ошибка подключения: ${error.message}`, 'Закрыть', { duration: 5000 });
      }
    });
  }

  testServices() {
    this.loading = true;
    this.servicesService.getServices().subscribe({
      next: (services) => {
        this.testResults.push({
          test: 'Получение услуг',
          success: true,
          data: services.services?.length || 0
        });
        this.loading = false;
      },
      error: (error) => {
        this.testResults.push({
          test: 'Получение услуг',
          success: false,
          error: error.message
        });
        this.loading = false;
      }
    });
  }

  testAppointments() {
    this.loading = true;
    this.appointmentsService.getAppointments().subscribe({
      next: (appointments) => {
        this.testResults.push({
          test: 'Получение записей',
          success: true,
          data: appointments.appointments?.length || 0
        });
        this.loading = false;
      },
      error: (error) => {
        this.testResults.push({
          test: 'Получение записей',
          success: false,
          error: error.message
        });
        this.loading = false;
      }
    });
  }

  testSlots() {
    this.loading = true;
    this.slotsService.getSlots().subscribe({
      next: (slots) => {
        this.testResults.push({
          test: 'Получение слотов',
          success: true,
          data: slots.length
        });
        this.loading = false;
      },
      error: (error) => {
        this.testResults.push({
          test: 'Получение слотов',
          success: false,
          error: error.message
        });
        this.loading = false;
      }
    });
  }
}
