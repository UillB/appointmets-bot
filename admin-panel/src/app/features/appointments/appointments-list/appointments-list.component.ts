import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../core/services/i18n.service';

import { AppointmentsService, AppointmentsFilters } from '../../../core/services/appointments.service';
import { ServicesService } from '../../../core/services/services.service';
import { ApiService } from '../../../core/services/api';
import { Appointment } from '../../../shared/models/api.models';
import { AppointmentDetailsComponent } from '../appointment-details/appointment-details.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatSnackBarModule,
    FormsModule,
    TranslatePipe
  ],
  template: `
    <div class="appointments-container">
      <div class="header-section">
        <div class="header-content">
          <h1>{{ 'appointments.title' | translate }}</h1>
          <p>{{ 'appointments.subtitle' | translate }}</p>
        </div>
        <button mat-raised-button color="primary" (click)="onCreateAppointment()">
          <mat-icon>add</mat-icon>
          {{ 'appointments.create' | translate }}
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>{{ 'appointments.filters.status' | translate }}</mat-label>
              <mat-select [(ngModel)]="filters.status" (selectionChange)="onStatusChange()">
                <mat-option value="">{{ 'common.all' | translate }}</mat-option>
                <mat-option value="confirmed">{{ 'appointments.status.confirmed' | translate }}</mat-option>
                <mat-option value="pending">{{ 'appointments.status.pending' | translate }}</mat-option>
                <mat-option value="cancelled">{{ 'appointments.status.cancelled' | translate }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>{{ 'appointments.filters.service' | translate }}</mat-label>
              <mat-select [(ngModel)]="filters.serviceId" (selectionChange)="onServiceChange()">
                <mat-option value="">{{ 'common.all' | translate }}</mat-option>
                <mat-option *ngFor="let service of services" [value]="service.id">
                  {{ getServiceName(service) }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>{{ 'appointments.filters.date' | translate }}</mat-label>
              <input matInput [matDatepicker]="datePicker" [(ngModel)]="filters.date" (dateChange)="onDateChange()">
              <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
              <mat-datepicker #datePicker></mat-datepicker>
            </mat-form-field>

            <button mat-button (click)="clearFilters()" class="clear-filters-btn">
              <mat-icon>clear</mat-icon>
              {{ 'common.clear' | translate }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Appointments Table -->
      <mat-card class="appointments-card">
        <mat-card-content>
          <div class="loading-container" *ngIf="loading">
            <mat-spinner diameter="40"></mat-spinner>
            <p>{{ 'common.loading' | translate }}</p>
          </div>

          <div class="no-data" *ngIf="!loading && appointments.length === 0">
            <mat-icon>event_busy</mat-icon>
            <h3>{{ 'appointments.noData.title' | translate }}</h3>
            <p>{{ 'appointments.noData.message' | translate }}</p>
            <button mat-raised-button color="primary" (click)="onCreateAppointment()">
              {{ 'appointments.create' | translate }}
            </button>
          </div>

          <div class="table-container" *ngIf="!loading && appointments.length > 0">
            <table mat-table [dataSource]="appointments" class="appointments-table">

              <!-- Service Column -->
              <ng-container matColumnDef="service">
                <th mat-header-cell *matHeaderCellDef>{{ 'appointments.table.service' | translate }}</th>
                <td mat-cell *matCellDef="let appointment">
                  <div class="service-info">
                    <mat-icon class="service-icon">psychology</mat-icon>
                    <span>{{ getServiceName(appointment.service) }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Date & Time Column -->
              <ng-container matColumnDef="datetime">
                <th mat-header-cell *matHeaderCellDef>{{ 'appointments.table.datetime' | translate }}</th>
                <td mat-cell *matCellDef="let appointment">
                  <div class="datetime-info">
                    <div class="date">{{ formatDate(appointment.slot?.startAt) }}</div>
                    <div class="time">{{ formatTime(appointment.slot?.startAt) }} - {{ formatTime(appointment.slot?.endAt) }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Client Column -->
              <ng-container matColumnDef="client">
                <th mat-header-cell *matHeaderCellDef>{{ 'appointments.table.client' | translate }}</th>
                <td mat-cell *matCellDef="let appointment">
                  <div class="client-info">
                    <mat-icon class="client-icon">person</mat-icon>
                    <span>{{ appointment.chatId }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>{{ 'appointments.table.status' | translate }}</th>
                <td mat-cell *matCellDef="let appointment">
                  <div class="status-container">
                    <div class="status-indicator" [class]="'status-' + appointment.status">
                      <mat-icon class="status-icon">{{ getStatusIcon(appointment.status) }}</mat-icon>
                    </div>
                    <span class="status-text">{{ getStatusText(appointment.status) }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>{{ 'common.actions' | translate }}</th>
                <td mat-cell *matCellDef="let appointment">
                  <button mat-icon-button [matMenuTriggerFor]="actionMenu" [matMenuTriggerData]="{appointment: appointment}">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item (click)="onViewAppointment($event, appointment)">
                      <mat-icon>visibility</mat-icon>
                      <span>{{ 'common.view' | translate }}</span>
                    </button>
                    <button mat-menu-item (click)="onEditAppointment($event, appointment)" *ngIf="appointment.status !== 'cancelled'">
                      <mat-icon>edit</mat-icon>
                      <span>{{ 'common.edit' | translate }}</span>
                    </button>
                    <button mat-menu-item (click)="onCancelAppointment($event, appointment)" *ngIf="appointment.status !== 'cancelled'">
                      <mat-icon>cancel</mat-icon>
                      <span>{{ 'appointments.cancel' | translate }}</span>
                    </button>
                    <button mat-menu-item (click)="onDeleteAppointment($event, appointment)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      <span>{{ 'common.delete' | translate }}</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator
              [length]="totalCount"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 25, 50, 100]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .appointments-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 16px;
    }

    .header-content h1 {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px 0;
    }

    .header-content p {
      font-size: 16px;
      color: #666;
      margin: 0;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-field {
      min-width: 200px;
    }

    .clear-filters-btn {
      margin-left: auto;
    }

    .appointments-card {
      min-height: 400px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-data h3 {
      font-size: 24px;
      color: #666;
      margin: 0 0 8px 0;
    }

    .no-data p {
      color: #999;
      margin: 0 0 24px 0;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      background: white;
    }

    .appointments-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 12px;
      overflow: hidden;
      
      ::ng-deep {
        .mat-mdc-header-cell {
          background: #f8f9fa;
          color: #495057;
          font-weight: 600;
          font-size: 14px;
          padding: 16px 20px;
          border: none;
          border-bottom: 2px solid #e9ecef;
        }
        
        .mat-mdc-cell {
          padding: 16px 20px;
          border: none;
          border-bottom: 1px solid #f1f3f4;
          vertical-align: middle;
          
          &:last-child {
            border-right: none;
          }
        }
        
        .mat-mdc-row {
          transition: all 0.2s ease;
          
          &:hover {
            background-color: #f8f9fa;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          &:last-child .mat-mdc-cell {
            border-bottom: none;
          }
        }
      }
    }

    .service-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .service-icon {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 8px;
      padding: 8px;
      font-size: 20px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .datetime-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .date {
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
    }

    .time {
      font-size: 13px;
      color: #7f8c8d;
      background: rgba(127, 140, 141, 0.1);
      padding: 4px 8px;
      border-radius: 6px;
      display: inline-block;
      width: fit-content;
    }

    .client-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .client-icon {
      color: #95a5a6;
      background: rgba(149, 165, 166, 0.1);
      border-radius: 8px;
      padding: 8px;
      font-size: 20px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-indicator {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      
      .status-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
      
      &.status-confirmed {
        background: linear-gradient(135deg, #4caf50, #45a049);
        color: white;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
        
        &:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }
      }
      
      &.status-pending {
        background: linear-gradient(135deg, #ff9800, #f57c00);
        color: white;
        box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
        
        &:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
        }
      }
      
      &.status-cancelled {
        background: linear-gradient(135deg, #f44336, #d32f2f);
        color: white;
        box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
        
        &:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
        }
      }
    }

    .status-text {
      font-weight: 500;
      font-size: 14px;
      color: #495057;
    }

    .delete-action {
      color: #f44336;
    }

    // Actions button styling
    ::ng-deep {
      .mat-mdc-icon-button {
        color: #6c757d;
        transition: all 0.2s ease;
        
        &:hover {
          background-color: rgba(108, 117, 125, 0.1);
          color: #495057;
          transform: scale(1.1);
        }
      }
    }

    @media (max-width: 768px) {
      .appointments-container {
        padding: 16px;
      }

      .header-section {
        flex-direction: column;
        align-items: stretch;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-field {
        min-width: auto;
      }

      .clear-filters-btn {
        margin-left: 0;
        margin-top: 8px;
      }
    }

    // Стили для тостеров
    ::ng-deep {
      .success-snackbar {
        background-color: #4caf50 !important;
        color: white !important;
        border-left: 4px solid #2e7d32 !important;
        
        .mat-mdc-snack-bar-action {
          color: white !important;
          font-weight: 500;
        }
      }

      .error-snackbar {
        background-color: #f44336 !important;
        color: white !important;
        border-left: 4px solid #c62828 !important;
        
        .mat-mdc-snack-bar-action {
          color: white !important;
          font-weight: 500;
        }
      }
    }
  `]
})
export class AppointmentsListComponent implements OnInit {
  appointments: Appointment[] = [];
  services: any[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 25;
  currentPage = 0;

  displayedColumns: string[] = ['service', 'datetime', 'client', 'status', 'actions'];

  filters = {
    status: '',
    serviceId: '',
    date: null as Date | null
  };

  constructor(
    private appointmentsService: AppointmentsService,
    private servicesService: ServicesService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router,
    private i18nService: I18nService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    console.log('🔥 AppointmentsListComponent ngOnInit() called');
    console.log('🔥 Initial filters:', this.filters);
    this.loadAppointments();
    this.loadServices();
  }

  loadAppointments() {
    this.loading = true;
    
    const filters: AppointmentsFilters = {
      page: this.currentPage + 1, // Backend expects 1-based page numbers
      limit: this.pageSize
    };

    // Add filters if they are set
    if (this.filters.status && this.filters.status !== '') {
      filters.status = this.filters.status;
    }
    if (this.filters.serviceId && this.filters.serviceId !== '') {
      filters.serviceId = parseInt(this.filters.serviceId);
    }
    if (this.filters.date) {
      filters.date = this.filters.date;
    }

    console.log('🔍 Current filters object:', this.filters);
    console.log('🔍 Built filters for API:', filters);
    console.log('🔍 API request will be made with these parameters');

    this.appointmentsService.getAppointments(filters).subscribe({
      next: (response) => {
        console.log('✅ Appointments response received:', response);
        console.log('✅ Total appointments in response:', response.appointments.length);
        console.log('✅ Total count:', response.total);
        this.appointments = response.appointments;
        this.totalCount = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading appointments:', error);
        this.loading = false;
      }
    });
  }

  loadServices() {
    this.servicesService.getServices().subscribe({
      next: (response) => {
        this.services = response.services;
      },
      error: (error) => {
        console.error('Error loading services:', error);
      }
    });
  }

  applyFilters() {
    console.log('🔥 applyFilters() called');
    console.log('🔥 Current filters before reset:', this.filters);
    this.currentPage = 0; // Reset to first page when applying filters
    console.log('🔥 About to call loadAppointments()');
    this.loadAppointments();
  }

  clearFilters() {
    console.log('🔥 clearFilters() called');
    this.filters = {
      status: '',
      serviceId: '',
      date: null
    };
    this.applyFilters();
  }

  onStatusChange() {
    console.log('🔥 Status filter changed to:', this.filters.status);
    this.applyFilters();
  }

  onServiceChange() {
    console.log('🔥 Service filter changed to:', this.filters.serviceId);
    this.applyFilters();
  }

  onDateChange() {
    console.log('🔥 Date filter changed to:', this.filters.date);
    this.applyFilters();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAppointments();
  }

  onCreateAppointment() {
    // TODO: Navigate to create appointment form
    console.log('Create appointment');
  }

  onViewAppointment(event: Event, appointment: Appointment) {
    event.stopPropagation();
    this.dialog.open(AppointmentDetailsComponent, {
      width: '600px',
      data: { appointment }
    });
  }

  onEditAppointment(event: Event, appointment: Appointment) {
    event.stopPropagation();
    // TODO: Navigate to edit appointment form
    console.log('Edit appointment:', appointment);
  }

  onCancelAppointment(event: Event, appointment: Appointment) {
    event.stopPropagation();
    
    const reason = prompt('Причина отмены (необязательно):');
    if (reason === null) return; // User cancelled
    
    this.apiService.put(`/appointments/${appointment.id}/cancel`, { reason })
      .subscribe({
        next: (response: any) => {
          console.log('Appointment cancelled:', response);
          this.loadAppointments(); // Reload the list
          this.showSuccessMessage('Запись успешно отменена. Пользователь получит уведомление в Telegram.');
        },
        error: (error: any) => {
          console.error('Error cancelling appointment:', error);
          let errorMessage = 'Ошибка при отмене записи';
          
          if (error.status === 404) {
            errorMessage = 'Запись не найдена';
          } else if (error.status === 400 && error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.showErrorMessage(errorMessage);
        }
      });
  }

  onDeleteAppointment(event: Event, appointment: Appointment) {
    event.stopPropagation();
    
    const dialogData: ConfirmationDialogData = {
      title: 'Удаление записи',
      message: `Вы уверены, что хотите удалить эту запись?\n\nУслуга: ${this.getServiceName(appointment.service)}\nДата: ${this.formatDate(appointment.slot?.startAt || '')}\nВремя: ${this.formatTime(appointment.slot?.startAt || '')} - ${this.formatTime(appointment.slot?.endAt || '')}\n\nПользователь получит уведомление в Telegram.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      confirmColor: 'warn',
      icon: 'delete'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.apiService.delete(`/appointments/${appointment.id}`)
          .subscribe({
            next: (response: any) => {
              console.log('Appointment deleted:', response);
              this.loadAppointments(); // Reload the list
              this.showSuccessMessage('Запись успешно удалена. Пользователь получил уведомление в Telegram.');
            },
            error: (error: any) => {
              console.error('Error deleting appointment:', error);
              let errorMessage = 'Ошибка при удалении записи';
              
              if (error.status === 404) {
                errorMessage = 'Запись не найдена';
              } else if (error.status === 403) {
                errorMessage = 'У вас нет прав для удаления этой записи';
              } else if (error.error?.message) {
                errorMessage = error.error.message;
              }
              
              this.showErrorMessage(errorMessage);
            }
          });
      }
    });
  }

  getServiceName(service: any): string {
    if (!service) return '';
    
    const currentLang = this.i18nService.getCurrentLanguage();
    switch (currentLang) {
      case 'ru': return service.nameRu || service.name;
      case 'he': return service.nameHe || service.name;
      case 'en': return service.nameEn || service.name;
      default: return service.name;
    }
  }

  getStatusText(status: string): string {
    return this.i18nService.translate(`appointments.status.${status}`);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'confirmed': return 'check_circle';
      case 'pending': return 'schedule';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private showSuccessMessage(message: string, action: string = 'Закрыть'): void {
    this.snackBar.open(message, action, { 
      duration: 4000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }

  private showErrorMessage(message: string, action: string = 'Закрыть'): void {
    this.snackBar.open(message, action, { 
      duration: 6000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }
}
