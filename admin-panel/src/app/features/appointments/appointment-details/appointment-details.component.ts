import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../core/services/i18n.service';
import { FormsModule } from '@angular/forms';

import { AppointmentsService } from '../../../core/services/appointments.service';
import { Appointment } from '../../../shared/models/api.models';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FormsModule,
    TranslatePipe
  ],
  template: `
    <div class="appointment-details">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ 'appointments.details.title' | translate }}</h2>
        <button mat-icon-button (click)="onClose()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="loading-container" *ngIf="loading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>{{ 'common.loading' | translate }}</p>
        </div>

        <div class="appointment-info" *ngIf="!loading && appointment">
          <!-- Status Section -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>info</mat-icon>
                {{ 'appointments.details.status' | translate }}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="status-section">
                <mat-chip [class]="'status-' + appointment.status" class="status-chip">
                  {{ getStatusText(appointment.status || 'pending') }}
                </mat-chip>
                
                <div class="status-actions" *ngIf="appointment.status !== 'cancelled'">
                  <mat-form-field appearance="outline" class="status-select">
                    <mat-label>{{ 'appointments.details.changeStatus' | translate }}</mat-label>
                    <mat-select [(ngModel)]="newStatus" (selectionChange)="onStatusChange()">
                      <mat-option value="confirmed">{{ 'appointments.status.confirmed' | translate }}</mat-option>
                      <mat-option value="pending">{{ 'appointments.status.pending' | translate }}</mat-option>
                      <mat-option value="cancelled">{{ 'appointments.status.cancelled' | translate }}</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Service Information -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>psychology</mat-icon>
                {{ 'appointments.details.service' | translate }}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="service-details">
                <div class="detail-row">
                  <span class="label">{{ 'appointments.details.serviceName' | translate }}:</span>
                  <span class="value">{{ getServiceName(appointment.service) }}</span>
                </div>
                <div class="detail-row" *ngIf="appointment.service?.description">
                  <span class="label">{{ 'appointments.details.description' | translate }}:</span>
                  <span class="value">{{ getServiceDescription(appointment.service) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">{{ 'appointments.details.duration' | translate }}:</span>
                  <span class="value">{{ appointment.service?.durationMin }} {{ 'common.minutes' | translate }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Time Information -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>schedule</mat-icon>
                {{ 'appointments.details.time' | translate }}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="time-details">
                <div class="detail-row">
                  <span class="label">{{ 'appointments.details.date' | translate }}:</span>
                  <span class="value">{{ formatDate(appointment.slot?.startAt || '') }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">{{ 'appointments.details.startTime' | translate }}:</span>
                  <span class="value">{{ formatTime(appointment.slot?.startAt || '') }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">{{ 'appointments.details.endTime' | translate }}:</span>
                  <span class="value">{{ formatTime(appointment.slot?.endAt || '') }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">{{ 'appointments.details.duration' | translate }}:</span>
                  <span class="value">{{ getDuration(appointment.slot?.startAt || '', appointment.slot?.endAt || '') }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Client Information -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>person</mat-icon>
                {{ 'appointments.details.client' | translate }}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="client-details">
                <div class="detail-row">
                  <span class="label">{{ 'appointments.details.chatId' | translate }}:</span>
                  <span class="value">{{ appointment.chatId }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">{{ 'appointments.details.bookingDate' | translate }}:</span>
                  <span class="value">{{ formatDateTime(appointment.createdAt || '') }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Appointment ID -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>tag</mat-icon>
                {{ 'appointments.details.appointmentId' | translate }}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="id-details">
                <div class="detail-row">
                  <span class="label">{{ 'appointments.details.id' | translate }}:</span>
                  <span class="value">{{ appointment.id }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">{{ 'appointments.details.slotId' | translate }}:</span>
                  <span class="value">{{ appointment.slotId }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onClose()">
          {{ 'common.close' | translate }}
        </button>
        <button mat-raised-button color="warn" (click)="onDelete()" *ngIf="appointment">
          <mat-icon>delete</mat-icon>
          {{ 'common.delete' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .appointment-details {
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .close-button {
      margin-left: auto;
    }

    .dialog-content {
      max-height: 70vh;
      overflow-y: auto;
      padding: 0 24px;
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

    .appointment-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-card {
      border-left: 4px solid #667eea;
    }

    .info-card mat-card-header {
      margin-bottom: 16px;
    }

    .info-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .info-card mat-icon {
      color: #667eea;
    }

    .status-section {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .status-chip {
      font-size: 14px;
      font-weight: 500;
      padding: 8px 16px;
    }

    .status-select {
      min-width: 200px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 16px;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .label {
      font-weight: 500;
      color: #666;
      min-width: 120px;
      flex-shrink: 0;
    }

    .value {
      color: #333;
      text-align: right;
      word-break: break-word;
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

    .dialog-actions {
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .appointment-details {
        min-width: auto;
        max-width: 100vw;
        width: 100vw;
        margin: -24px;
      }

      .dialog-content {
        padding: 0 16px;
      }

      .status-section {
        flex-direction: column;
        align-items: stretch;
      }

      .status-select {
        min-width: auto;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .label {
        min-width: auto;
      }

      .value {
        text-align: left;
      }
    }
  `]
})
export class AppointmentDetailsComponent implements OnInit {
  appointment: Appointment | null = null;
  loading = false;
  newStatus: string = '';

  constructor(
    public dialogRef: MatDialogRef<AppointmentDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { appointment: Appointment },
    private appointmentsService: AppointmentsService,
    private i18nService: I18nService
  ) {
    this.appointment = data.appointment;
    this.newStatus = this.appointment?.status || '';
  }

  ngOnInit() {
    if (this.appointment?.id) {
      this.loadAppointmentDetails();
    }
  }

  loadAppointmentDetails() {
    if (!this.appointment?.id) return;
    
    this.loading = true;
    this.appointmentsService.getAppointment(this.appointment.id).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.newStatus = appointment.status || '';
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading appointment details:', error);
        this.loading = false;
      }
    });
  }

  onStatusChange() {
    if (!this.appointment?.id || !this.newStatus) return;

    this.appointmentsService.updateAppointment(this.appointment.id, { status: this.newStatus }).subscribe({
      next: (updatedAppointment) => {
        this.appointment = updatedAppointment;
        // TODO: Show success message
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
        // TODO: Show error message
      }
    });
  }

  onDelete() {
    if (!this.appointment?.id) return;

    // TODO: Show confirmation dialog
    this.appointmentsService.deleteAppointment(this.appointment.id).subscribe({
      next: () => {
        this.dialogRef.close({ deleted: true });
        // TODO: Show success message
      },
      error: (error) => {
        console.error('Error deleting appointment:', error);
        // TODO: Show error message
      }
    });
  }

  onClose() {
    this.dialogRef.close();
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

  getServiceDescription(service: any): string {
    if (!service) return '';
    
    const currentLang = this.i18nService.getCurrentLanguage();
    switch (currentLang) {
      case 'ru': return service.descriptionRu || service.description;
      case 'he': return service.descriptionHe || service.description;
      case 'en': return service.descriptionEn || service.description;
      default: return service.description;
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

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  getDuration(startAt: string, endAt: string): string {
    if (!startAt || !endAt) return '';
    const start = new Date(startAt);
    const end = new Date(endAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    return `${diffMins} ${this.i18nService.translate('common.minutes')}`;
  }
}
