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
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../core/services/i18n.service';

import { AppointmentsService, AppointmentsFilters } from '../../../core/services/appointments.service';
import { ServicesService } from '../../../core/services/services.service';
import { Appointment } from '../../../shared/models/api.models';
import { AppointmentDetailsComponent } from '../appointment-details/appointment-details.component';

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
              <mat-select [(ngModel)]="filters.status" (selectionChange)="applyFilters()">
                <mat-option value="">{{ 'common.all' | translate }}</mat-option>
                <mat-option value="confirmed">{{ 'appointments.status.confirmed' | translate }}</mat-option>
                <mat-option value="pending">{{ 'appointments.status.pending' | translate }}</mat-option>
                <mat-option value="cancelled">{{ 'appointments.status.cancelled' | translate }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>{{ 'appointments.filters.service' | translate }}</mat-label>
              <mat-select [(ngModel)]="filters.serviceId" (selectionChange)="applyFilters()">
                <mat-option value="">{{ 'common.all' | translate }}</mat-option>
                <mat-option *ngFor="let service of services" [value]="service.id">
                  {{ getServiceName(service) }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>{{ 'appointments.filters.date' | translate }}</mat-label>
              <input matInput [matDatepicker]="datePicker" [(ngModel)]="filters.date" (dateChange)="applyFilters()">
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
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>{{ 'appointments.table.id' | translate }}</th>
                <td mat-cell *matCellDef="let appointment">{{ appointment.id }}</td>
              </ng-container>

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
                  <mat-chip [class]="'status-' + appointment.status">
                    {{ getStatusText(appointment.status) }}
                  </mat-chip>
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
    }

    .appointments-table {
      width: 100%;
    }

    .service-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .service-icon {
      color: #667eea;
    }

    .datetime-info {
      display: flex;
      flex-direction: column;
    }

    .date {
      font-weight: 500;
      color: #333;
    }

    .time {
      font-size: 12px;
      color: #666;
    }

    .client-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .client-icon {
      color: #999;
    }

    .status-confirmed {
      background-color: #4caf50;
      color: white;
    }

    .status-pending {
      background-color: #ff9800;
      color: white;
    }

    .status-cancelled {
      background-color: #f44336;
      color: white;
    }

    .delete-action {
      color: #f44336;
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
  `]
})
export class AppointmentsListComponent implements OnInit {
  appointments: Appointment[] = [];
  services: any[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 25;
  currentPage = 0;

  displayedColumns: string[] = ['id', 'service', 'datetime', 'client', 'status', 'actions'];

  filters = {
    status: '',
    serviceId: '',
    date: null as Date | null
  };

  constructor(
    private appointmentsService: AppointmentsService,
    private servicesService: ServicesService,
    private dialog: MatDialog,
    private router: Router,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    this.loadAppointments();
    this.loadServices();
  }

  loadAppointments() {
    this.loading = true;
    
    const filters: AppointmentsFilters = {
      page: this.currentPage,
      limit: this.pageSize
    };

    // Add filters if they are set
    if (this.filters.status) {
      filters.status = this.filters.status;
    }
    if (this.filters.serviceId) {
      filters.serviceId = parseInt(this.filters.serviceId);
    }
    if (this.filters.date) {
      filters.date = this.filters.date;
    }

    this.appointmentsService.getAppointments(filters).subscribe({
      next: (response) => {
        this.appointments = response.appointments;
        this.totalCount = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
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
    this.currentPage = 0; // Reset to first page when applying filters
    this.loadAppointments();
  }

  clearFilters() {
    this.filters = {
      status: '',
      serviceId: '',
      date: null
    };
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
    // TODO: Implement cancel appointment logic
    console.log('Cancel appointment:', appointment);
  }

  onDeleteAppointment(event: Event, appointment: Appointment) {
    event.stopPropagation();
    // TODO: Implement delete appointment logic
    console.log('Delete appointment:', appointment);
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
}
