import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../core/services/i18n.service';

import { AppointmentsService } from '../../../core/services/appointments.service';
import { Appointment, CreateAppointmentRequest } from '../../../shared/models/api.models';

interface Service {
  id: number;
  name: string;
  nameRu?: string;
  nameEn?: string;
  nameHe?: string;
  description?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  descriptionHe?: string;
  durationMin: number;
}

interface Slot {
  id: number;
  startAt: string;
  endAt: string;
  capacity: number;
  bookings?: any[];
}

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatChipsModule,
    TranslatePipe
  ],
  template: `
    <div class="appointment-form">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          {{ isEditMode ? ('appointments.edit.title' | translate) : ('appointments.create.title' | translate) }}
        </h2>
        <button mat-icon-button (click)="onClose()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="loading-container" *ngIf="loading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>{{ 'common.loading' | translate }}</p>
        </div>

        <form [formGroup]="appointmentForm" *ngIf="!loading" class="appointment-form-content">
          <mat-stepper #stepper linear>
            <!-- Step 1: Service Selection -->
            <mat-step [stepControl]="serviceStep" label="{{ 'appointments.form.steps.service' | translate }}">
              <div class="step-content">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'appointments.form.service' | translate }}</mat-label>
                  <mat-select formControlName="serviceId" (selectionChange)="onServiceChange()">
                    <mat-option *ngFor="let service of services" [value]="service.id">
                      {{ getServiceName(service) }} ({{ service.durationMin }} {{ 'common.minutes' | translate }})
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="serviceStep.hasError('required')">
                    {{ 'appointments.form.errors.serviceRequired' | translate }}
                  </mat-error>
                </mat-form-field>

                <div class="service-info" *ngIf="selectedService">
                  <mat-card class="info-card">
                    <mat-card-content>
                      <h4>{{ getServiceName(selectedService) }}</h4>
                      <p>{{ getServiceDescription(selectedService) }}</p>
                      <div class="service-details">
                        <mat-chip>
                          <mat-icon>schedule</mat-icon>
                          {{ selectedService.durationMin }} {{ 'common.minutes' | translate }}
                        </mat-chip>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperNext [disabled]="serviceStep.invalid">
                  {{ 'common.next' | translate }}
                </button>
              </div>
            </mat-step>

            <!-- Step 2: Date Selection -->
            <mat-step [stepControl]="dateStep" label="{{ 'appointments.form.steps.date' | translate }}">
              <div class="step-content">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'appointments.form.date' | translate }}</mat-label>
                  <input matInput [matDatepicker]="datePicker" formControlName="date" (dateChange)="onDateChange()">
                  <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
                  <mat-datepicker #datePicker></mat-datepicker>
                  <mat-error *ngIf="dateStep.hasError('required')">
                    {{ 'appointments.form.errors.dateRequired' | translate }}
                  </mat-error>
                </mat-form-field>

                <div class="available-slots" *ngIf="availableSlots.length > 0">
                  <h4>{{ 'appointments.form.availableSlots' | translate }}</h4>
                  <div class="slots-grid">
                    <button 
                      *ngFor="let slot of availableSlots" 
                      mat-stroked-button 
                      [class.selected]="appointmentForm.get('slotId')?.value === slot.id"
                      (click)="selectSlot(slot)"
                      class="slot-button">
                      <div class="slot-time">{{ formatTime(slot.startAt) }}</div>
                      <div class="slot-duration">{{ getSlotDuration(slot) }}</div>
                    </button>
                  </div>
                </div>

                <div class="no-slots" *ngIf="availableSlots.length === 0 && appointmentForm.get('date')?.value">
                  <mat-icon>event_busy</mat-icon>
                  <p>{{ 'appointments.form.noSlots' | translate }}</p>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  {{ 'common.back' | translate }}
                </button>
                <button mat-button matStepperNext [disabled]="dateStep.invalid || !appointmentForm.get('slotId')?.value">
                  {{ 'common.next' | translate }}
                </button>
              </div>
            </mat-step>

            <!-- Step 3: Client Information -->
            <mat-step [stepControl]="clientStep" label="{{ 'appointments.form.steps.client' | translate }}">
              <div class="step-content">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'appointments.form.chatId' | translate }}</mat-label>
                  <input matInput formControlName="chatId" placeholder="123456789">
                  <mat-error *ngIf="clientStep.hasError('required')">
                    {{ 'appointments.form.errors.chatIdRequired' | translate }}
                  </mat-error>
                  <mat-error *ngIf="clientStep.hasError('pattern')">
                    {{ 'appointments.form.errors.chatIdInvalid' | translate }}
                  </mat-error>
                </mat-form-field>

                <div class="appointment-summary" *ngIf="selectedService && selectedSlot">
                  <mat-card class="summary-card">
                    <mat-card-header>
                      <mat-card-title>{{ 'appointments.form.summary' | translate }}</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="summary-item">
                        <span class="label">{{ 'appointments.form.service' | translate }}:</span>
                        <span class="value">{{ getServiceName(selectedService) }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">{{ 'appointments.form.date' | translate }}:</span>
                        <span class="value">{{ formatDate(selectedSlot.startAt) }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">{{ 'appointments.form.time' | translate }}:</span>
                        <span class="value">{{ formatTime(selectedSlot.startAt) }} - {{ formatTime(selectedSlot.endAt) }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">{{ 'appointments.form.duration' | translate }}:</span>
                        <span class="value">{{ selectedService.durationMin }} {{ 'common.minutes' | translate }}</span>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  {{ 'common.back' | translate }}
                </button>
                <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="appointmentForm.invalid || submitting">
                  <mat-spinner diameter="20" *ngIf="submitting"></mat-spinner>
                  <mat-icon *ngIf="!submitting">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                  {{ isEditMode ? ('common.save' | translate) : ('appointments.form.create' | translate) }}
                </button>
              </div>
            </mat-step>
          </mat-stepper>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onClose()">
          {{ 'common.cancel' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .appointment-form {
      min-width: 600px;
      max-width: 800px;
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

    .appointment-form-content {
      padding: 16px 0;
    }

    .step-content {
      padding: 24px 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .service-info {
      margin-top: 16px;
    }

    .info-card {
      border-left: 4px solid #667eea;
    }

    .info-card h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 18px;
    }

    .info-card p {
      margin: 0 0 12px 0;
      color: #666;
    }

    .service-details {
      display: flex;
      gap: 8px;
    }

    .available-slots {
      margin-top: 24px;
    }

    .available-slots h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 16px;
    }

    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
    }

    .slot-button {
      padding: 16px 12px;
      text-align: center;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .slot-button:hover {
      background-color: #f5f5f5;
    }

    .slot-button.selected {
      background-color: #667eea;
      color: white;
    }

    .slot-time {
      font-weight: 600;
      font-size: 14px;
    }

    .slot-duration {
      font-size: 12px;
      opacity: 0.8;
    }

    .no-slots {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .no-slots mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-slots p {
      color: #666;
      margin: 0;
    }

    .appointment-summary {
      margin-top: 24px;
    }

    .summary-card {
      border-left: 4px solid #4caf50;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .summary-item:last-child {
      margin-bottom: 0;
    }

    .summary-item .label {
      font-weight: 500;
      color: #666;
    }

    .summary-item .value {
      color: #333;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
    }

    .dialog-actions {
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .appointment-form {
        min-width: auto;
        max-width: 100vw;
        width: 100vw;
        margin: -24px;
      }

      .dialog-content {
        padding: 0 16px;
      }

      .slots-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
      }

      .slot-button {
        padding: 12px 8px;
      }
    }
  `]
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  services: Service[] = [];
  availableSlots: Slot[] = [];
  selectedService: Service | null = null;
  selectedSlot: Slot | null = null;
  loading = false;
  submitting = false;
  isEditMode = false;

  // Form steps
  serviceStep: any;
  dateStep: any;
  clientStep: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AppointmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { appointment?: Appointment },
    private appointmentsService: AppointmentsService,
    private i18nService: I18nService
  ) {
    this.isEditMode = !!data.appointment;
    
    this.appointmentForm = this.fb.group({
      serviceId: ['', Validators.required],
      date: ['', Validators.required],
      slotId: ['', Validators.required],
      chatId: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });

    // Initialize form steps
    this.serviceStep = this.appointmentForm.get('serviceId');
    this.dateStep = this.appointmentForm.get('date');
    this.clientStep = this.appointmentForm.get('chatId');

    // Pre-fill form if editing
    if (this.isEditMode && data.appointment) {
      this.appointmentForm.patchValue({
        serviceId: data.appointment.serviceId,
        chatId: data.appointment.chatId
      });
    }
  }

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.loading = true;
    // TODO: Load services from services service
    this.services = [];
    this.loading = false;
  }

  onServiceChange() {
    const serviceId = this.appointmentForm.get('serviceId')?.value;
    this.selectedService = this.services.find(s => s.id === serviceId) || null;
    
    // Clear date and slot when service changes
    this.appointmentForm.patchValue({
      date: '',
      slotId: ''
    });
    this.availableSlots = [];
    this.selectedSlot = null;
  }

  onDateChange() {
    const date = this.appointmentForm.get('date')?.value;
    const serviceId = this.appointmentForm.get('serviceId')?.value;
    
    if (date && serviceId) {
      this.loadAvailableSlots(serviceId, date);
    }
    
    // Clear slot when date changes
    this.appointmentForm.patchValue({ slotId: '' });
    this.selectedSlot = null;
  }

  loadAvailableSlots(serviceId: number, date: Date) {
    // TODO: Load available slots from slots service
    this.availableSlots = [];
  }

  selectSlot(slot: Slot) {
    this.appointmentForm.patchValue({ slotId: slot.id });
    this.selectedSlot = slot;
  }

  onSubmit() {
    if (this.appointmentForm.invalid) return;

    this.submitting = true;
    const formData = this.appointmentForm.value;
    
    const appointmentData: CreateAppointmentRequest = {
      chatId: formData.chatId,
      serviceId: formData.serviceId,
      slotId: formData.slotId
    };

    if (this.isEditMode) {
      // TODO: Update appointment
      console.log('Update appointment:', appointmentData);
    } else {
      this.appointmentsService.createAppointment(appointmentData).subscribe({
        next: (appointment) => {
          this.dialogRef.close({ appointment, created: true });
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          this.submitting = false;
        }
      });
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  getServiceName(service: Service): string {
    if (!service) return '';
    
    const currentLang = this.i18nService.getCurrentLanguage();
    switch (currentLang) {
      case 'ru': return service.nameRu || service.name;
      case 'he': return service.nameHe || service.name;
      case 'en': return service.nameEn || service.name;
      default: return service.name;
    }
  }

  getServiceDescription(service: Service): string {
    if (!service) return '';
    
    const currentLang = this.i18nService.getCurrentLanguage();
    switch (currentLang) {
      case 'ru': return service.descriptionRu || service.description || '';
      case 'he': return service.descriptionHe || service.description || '';
      case 'en': return service.descriptionEn || service.description || '';
      default: return service.description || '';
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

  getSlotDuration(slot: Slot): string {
    if (!slot.startAt || !slot.endAt) return '';
    const start = new Date(slot.startAt);
    const end = new Date(slot.endAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    return `${diffMins}min`;
  }
}
