import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
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
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="onCreateAppointment()" class="create-btn">
            <mat-icon>add</mat-icon>
            <span class="create-text">+ {{ 'appointments.create' | translate }}</span>
          </button>
        </div>
      </div>

      <!-- Status Filters -->
      <div class="status-filters">
        <button mat-stroked-button 
                [class.active]="filters.status === ''" 
                (click)="setStatusFilter('')" 
                class="status-filter-btn">
          {{ 'common.all' | translate }} ({{ getTotalCount() }})
        </button>
        <button mat-stroked-button 
                [class.active]="filters.status === 'confirmed'" 
                (click)="setStatusFilter('confirmed')" 
                class="status-filter-btn">
          {{ 'appointments.status.confirmed' | translate }} ({{ getConfirmedCount() }})
        </button>
        <button mat-stroked-button 
                [class.active]="filters.status === 'pending'" 
                (click)="setStatusFilter('pending')" 
                class="status-filter-btn">
          {{ 'appointments.status.pending' | translate }} ({{ getPendingCount() }})
        </button>
        <button mat-stroked-button 
                [class.active]="filters.status === 'cancelled'" 
                (click)="setStatusFilter('cancelled')" 
                class="status-filter-btn">
          {{ 'appointments.status.cancelled' | translate }} ({{ getCancelledCount() }})
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-icon">
            <mat-icon>calendar_month</mat-icon>
          </div>
          <div class="summary-content">
            <div class="summary-number">{{ getTotalCount() }}</div>
            <div class="summary-label">{{ 'appointments.summary.total' | translate }}</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon confirmed">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="summary-content">
            <div class="summary-number">{{ getConfirmedCount() }}</div>
            <div class="summary-label">{{ 'appointments.summary.confirmed' | translate }}</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon pending">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="summary-content">
            <div class="summary-number">{{ getPendingCount() }}</div>
            <div class="summary-label">{{ 'appointments.summary.pending' | translate }}</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon cancelled">
            <mat-icon>cancel</mat-icon>
          </div>
          <div class="summary-content">
            <div class="summary-number">{{ getCancelledCount() }}</div>
            <div class="summary-label">{{ 'appointments.summary.cancelled' | translate }}</div>
          </div>
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="search-filter-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>{{ 'appointments.search.placeholder' | translate }}</mat-label>
          <input matInput [(ngModel)]="searchQuery" (input)="onSearchChange()" placeholder="{{ 'appointments.search.placeholder' | translate }}">
          <mat-icon matPrefix>search</mat-icon>
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
      </div>

      <!-- Mobile Compact Filters -->
      <div class="mobile-filters">
        <!-- Quick Filter Chips -->
        <div class="quick-filters">
          <button mat-stroked-button 
                  [class.active]="quickFilter === 'today'" 
                  (click)="setQuickFilter('today')" 
                  class="quick-filter-btn">
            <mat-icon>today</mat-icon>
            Сегодня
          </button>
          <button mat-stroked-button 
                  [class.active]="quickFilter === 'tomorrow'" 
                  (click)="setQuickFilter('tomorrow')" 
                  class="quick-filter-btn">
            <mat-icon>event</mat-icon>
            Завтра
          </button>
          <button mat-stroked-button 
                  [class.active]="quickFilter === 'all'" 
                  (click)="setQuickFilter('all')" 
                  class="quick-filter-btn">
            <mat-icon>list</mat-icon>
            Все
          </button>
        </div>

        <!-- Status Filter -->
        <div class="mobile-filter-row">
          <mat-form-field appearance="outline" class="mobile-filter-field">
            <mat-label>Статус</mat-label>
            <mat-select [(ngModel)]="filters.status" (selectionChange)="onStatusChange()">
              <mat-option value="">Все статусы</mat-option>
              <mat-option value="confirmed">Подтверждена</mat-option>
              <mat-option value="pending">Ожидает</mat-option>
              <mat-option value="cancelled">Отменена</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Service Filter -->
        <div class="mobile-filter-row">
          <mat-form-field appearance="outline" class="mobile-filter-field">
            <mat-label>Услуга</mat-label>
            <mat-select [(ngModel)]="filters.serviceId" (selectionChange)="onServiceChange()">
              <mat-option value="">Все услуги</mat-option>
              <mat-option *ngFor="let service of services" [value]="service.id">
                {{ getServiceName(service) }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Clear Filters -->
        <div class="mobile-filter-actions">
          <button mat-stroked-button (click)="clearFilters()" class="clear-btn">
            <mat-icon>clear</mat-icon>
            Очистить
          </button>
        </div>
      </div>

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

          <!-- Desktop Table View -->
          <div class="table-container desktop-view" *ngIf="!loading && appointments.length > 0">
            <table mat-table [dataSource]="appointments" class="appointments-table">

              <!-- Service Column -->
              <ng-container matColumnDef="service">
                <th mat-header-cell *matHeaderCellDef>{{ 'appointments.table.service' | translate }}</th>
                <td mat-cell *matCellDef="let appointment">
                  <div class="service-info">
                    <mat-icon class="service-icon">calendar_month</mat-icon>
                    <span class="service-name">{{ getServiceName(appointment.service) }}</span>
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
                    <div class="client-avatar">{{ appointment.id }}</div>
                    <div class="client-details">
                      <div class="client-id">{{ appointment.id }}</div>
                      <div class="client-chat-id">{{ appointment.chatId }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>{{ 'appointments.table.status' | translate }}</th>
                <td mat-cell *matCellDef="let appointment">
                  <mat-chip [class]="'status-chip status-' + appointment.status">
                    <mat-icon class="status-icon">{{ getStatusIcon(appointment.status) }}</mat-icon>
                    <span class="status-text">{{ getStatusText(appointment.status) }}</span>
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

            <div class="pagination-info">
              <span class="pagination-text">{{ 'appointments.pagination.showing' | translate }} {{ getDisplayedCount() }} {{ 'appointments.pagination.of' | translate }} {{ totalCount }} {{ 'appointments.pagination.appointments' | translate }}</span>
            </div>
            
            <mat-paginator
              [length]="totalCount"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 25, 50, 100]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          </div>

          <!-- Mobile Cards View -->
          <div class="mobile-cards mobile-view" *ngIf="!loading && appointments.length > 0">
            <div class="appointment-card" *ngFor="let appointment of appointments">
              <div class="card-header">
                <div class="service-info-mobile">
                  <mat-icon class="service-icon-mobile">psychology</mat-icon>
                  <span class="service-name">{{ getServiceName(appointment.service) }}</span>
                </div>
                <div class="status-badge" [class]="'status-' + appointment.status">
                  {{ getStatusText(appointment.status || '') }}
                </div>
              </div>
              
              <div class="card-content">
                <div class="info-row">
                  <mat-icon>schedule</mat-icon>
                  <div class="datetime-info-mobile">
                    <div class="date-mobile">{{ formatDate(appointment.slot?.startAt || '') }}</div>
                    <div class="time-mobile">{{ formatTime(appointment.slot?.startAt || '') }} - {{ formatTime(appointment.slot?.endAt || '') }}</div>
                  </div>
                </div>
                
                <div class="info-row">
                  <mat-icon>person</mat-icon>
                  <span class="client-id">ID: {{ appointment.chatId }}</span>
                </div>
              </div>
              
              <div class="card-actions">
                <button mat-stroked-button (click)="onViewAppointment($event, appointment)" class="action-btn">
                  <mat-icon>visibility</mat-icon>
                  {{ 'common.view' | translate }}
                </button>
                <button mat-stroked-button (click)="onEditAppointment($event, appointment)" *ngIf="appointment.status !== 'cancelled'" class="action-btn">
                  <mat-icon>edit</mat-icon>
                  {{ 'common.edit' | translate }}
                </button>
                <button mat-stroked-button color="warn" (click)="onCancelAppointment($event, appointment)" *ngIf="appointment.status !== 'cancelled'" class="action-btn">
                  <mat-icon>cancel</mat-icon>
                  {{ 'appointments.cancel' | translate }}
                </button>
              </div>
            </div>
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

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .filter-date-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      
      &:hover {
        background: #f8f9fa;
        border-color: #4F46E5;
        color: #4F46E5;
      }
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

    .create-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
      }
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    // Status Filters
    .status-filters {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .status-filter-btn {
      padding: 10px 20px;
      border-radius: 25px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      border: 2px solid #e9ecef;
      background: white;
      color: #6c757d;
      position: relative;
      overflow: hidden;
      min-height: 44px; /* Улучшенный touch target */
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }
      
      &.active {
        background: linear-gradient(135deg, #4F46E5, #7C3AED) !important;
        color: white !important;
        border-color: #4F46E5 !important;
        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4) !important;
        transform: translateY(-1px);
        
        &::before {
          left: 100%;
        }
      }
      
      &:not(.active):hover {
        background: #f8f9fa;
        border-color: #4F46E5;
        color: #4F46E5;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
      }
    }

    // Принудительное применение стилей для Angular Material
    ::ng-deep {
      .status-filter-btn.active {
        background: linear-gradient(135deg, #4F46E5, #7C3AED) !important;
        color: white !important;
        border-color: #4F46E5 !important;
        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4) !important;
      }
    }

    // Summary Cards
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #4F46E5, #7C3AED);
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(79, 70, 229, 0.15);
        border-color: #4F46E5;
        
        &::before {
          transform: scaleX(1);
        }
      }
    }

    .summary-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e3f2fd;
      color: #1976d2;
      
      &.confirmed {
        background: #e8f5e9;
        color: #2e7d32;
      }
      
      &.pending {
        background: #fff3e0;
        color: #ef6c00;
      }
      
      &.cancelled {
        background: #ffebee;
        color: #c62828;
      }
      
      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .summary-content {
      flex: 1;
    }

    .summary-number {
      font-size: 24px;
      font-weight: 700;
      color: #333;
      line-height: 1;
      margin-bottom: 4px;
    }

    .summary-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
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

    // Search and Filter Bar
    .search-filter-bar {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .filter-field {
      min-width: 200px;
    }

    // Mobile Cards Styles
    .mobile-cards {
      display: none;
    }

    .desktop-view {
      display: block;
    }

    .mobile-view {
      display: none;
    }

    // Desktop filters
    .desktop-filters {
      display: block;
    }

    // Mobile filters
    .mobile-filters {
      display: none;
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
          transition: all 0.3s ease;
          cursor: pointer;
          
          &:hover {
            background-color: #f8f9fa;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
            border-left: 3px solid #4F46E5;
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

    .service-name {
      font-weight: 500;
      font-size: 14px;
      color: #333;
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

    .client-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #4F46E5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .client-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .client-id {
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }

    .client-chat-id {
      font-size: 12px;
      color: #666;
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

    // Status Chips
    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
      
      &.status-confirmed {
        background: #e8f5e9;
        color: #2e7d32;
        
        .status-icon {
          color: #4caf50;
        }
      }
      
      &.status-pending {
        background: #fff3e0;
        color: #ef6c00;
        
        .status-icon {
          color: #ff9800;
        }
      }
      
      &.status-cancelled {
        background: #ffebee;
        color: #c62828;
        
        .status-icon {
          color: #f44336;
        }
      }
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

    // Mobile Cards Styles
    .appointment-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 12px;
      padding: 16px;
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #4F46E5, #7C3AED);
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(79, 70, 229, 0.15);
        border-color: #4F46E5;
        
        &::before {
          transform: scaleX(1);
        }
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .service-info-mobile {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .service-icon-mobile {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 6px;
      padding: 6px;
      font-size: 18px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .service-name {
      font-weight: 600;
      font-size: 16px;
      color: #333;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
      
      &.status-confirmed {
        background: #e8f5e9;
        color: #2e7d32;
      }
      
      &.status-pending {
        background: #fff3e0;
        color: #ef6c00;
      }
      
      &.status-cancelled {
        background: #ffebee;
        color: #c62828;
      }
    }

    .card-content {
      margin-bottom: 12px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      
      mat-icon {
        color: #666;
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .datetime-info-mobile {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .date-mobile {
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
    }

    .time-mobile {
      font-size: 13px;
      color: #7f8c8d;
      background: rgba(127, 140, 141, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }

    .client-id {
      font-size: 14px;
      color: #555;
    }

    .card-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .action-btn {
      flex: 1;
      min-width: 0;
      font-size: 12px;
      padding: 8px 12px;
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
    }

    @media (max-width: 768px) {
      .appointments-container {
        padding: 12px;
      }

      .header-section {
        flex-direction: column;
        align-items: stretch;
        margin-bottom: 16px;
      }

      .header-content h1 {
        font-size: 24px;
      }

      .header-content p {
        font-size: 14px;
      }

      .header-actions {
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }

      .filter-date-btn {
        width: 100%;
        justify-content: center;
      }

      .create-btn {
        padding: 10px 16px;
        font-size: 14px;
        width: 100%;
        justify-content: center;
        
        .create-text {
          display: block;
        }
      }

      // Status filters mobile
      .status-filters {
        flex-direction: column;
        gap: 8px;
      }

      .status-filter-btn {
        width: 100%;
        justify-content: center;
      }

      // Summary cards mobile
      .summary-cards {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .summary-card {
        padding: 16px;
      }

      .summary-icon {
        width: 40px;
        height: 40px;
        
        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .summary-number {
        font-size: 20px;
      }

      // Compact filters for mobile
      .filters-card {
        margin-bottom: 16px;
        
        .filters-row {
          flex-direction: column;
          gap: 8px;
        }
        
        .filter-field {
          min-width: auto;
          width: 100%;
        }
        
        .clear-filters-btn {
          margin-left: 0;
          margin-top: 8px;
          align-self: flex-start;
        }
      }

      // Show mobile cards, hide desktop table
      .desktop-view {
        display: none;
      }

      .mobile-view {
        display: block;
      }

      .mobile-cards {
        display: block;
      }

      // Show mobile filters, hide desktop filters
      .desktop-filters {
        display: none;
      }

      .mobile-filters {
        display: block;
        margin-bottom: 16px;
      }
    }

    // Mobile Filters Styles
    .mobile-filters {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e9ecef;
    }

    .quick-filters {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .quick-filter-btn {
      flex: 1;
      min-width: 0;
      padding: 10px 16px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 2px solid transparent;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      
      &.active {
        background: #1976d2;
        color: white;
        border-color: #1976d2;
        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
        transform: translateY(-1px);
      }
      
      &:not(.active) {
        background: white;
        color: #666;
        border-color: #ddd;
        
        &:hover {
          background: #f8f9fa;
          border-color: #1976d2;
          color: #1976d2;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .mobile-filter-row {
      margin-bottom: 12px;
    }

    .mobile-filter-field {
      width: 100%;
      
      ::ng-deep {
        .mat-mdc-form-field {
          width: 100%;
        }
        
        .mat-mdc-form-field-outline {
          border-radius: 12px;
        }
        
        .mat-mdc-select {
          font-size: 14px;
          padding: 8px 0;
        }
        
        .mat-mdc-form-field-label {
          font-weight: 500;
          color: #333;
        }
        
        .mat-mdc-select-value {
          color: #333;
          font-weight: 500;
        }
      }
    }

    .mobile-filter-actions {
      display: flex;
      justify-content: flex-start;
      margin-top: 8px;
    }

    .clear-btn {
      color: #666;
      border-color: #ddd;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 0.3s ease;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 6px;
      }
      
      &:hover {
        background: #f8f9fa;
        border-color: #999;
        color: #333;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
export class AppointmentsListComponent implements OnInit, OnDestroy {
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
  
  quickFilter: 'today' | 'tomorrow' | 'all' = 'all';
  searchQuery = '';

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

  ngOnDestroy() {
    // Cleanup if needed
  }

  @HostListener('window:universal-refresh')
  onUniversalRefresh() {
    console.log('🔄 Universal refresh triggered in AppointmentsListComponent');
    this.loadAppointments();
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
    this.quickFilter = 'all';
    this.applyFilters();
  }

  setQuickFilter(filter: 'today' | 'tomorrow' | 'all') {
    this.quickFilter = filter;
    
    // Reset other filters when using quick filters
    this.filters.status = '';
    this.filters.serviceId = '';
    
    switch (filter) {
      case 'today':
        this.filters.date = new Date();
        break;
      case 'tomorrow':
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.filters.date = tomorrow;
        break;
      case 'all':
        this.filters.date = null;
        break;
    }
    
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
    // Open appointment form dialog
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '90vw',
      maxWidth: '800px',
      height: '90vh',
      maxHeight: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
        this.snackBar.open('Appointment created successfully!', 'Close', {
          duration: 3000
        });
      }
    });
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

  setStatusFilter(status: string) {
    this.filters.status = status;
    this.applyFilters();
  }


  getTotalCount(): number {
    return this.totalCount;
  }

  getDisplayedCount(): number {
    return this.appointments.length;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getConfirmedCount(): number {
    return this.appointments.filter(apt => apt.status === 'confirmed').length;
  }

  getPendingCount(): number {
    return this.appointments.filter(apt => apt.status === 'pending').length;
  }

  getCancelledCount(): number {
    return this.appointments.filter(apt => apt.status === 'cancelled').length;
  }
}
