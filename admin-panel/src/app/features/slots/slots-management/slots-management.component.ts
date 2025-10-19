import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../../../core/services/api';
import { AuthService } from '../../../core/services/auth';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

export interface Service {
  id: number;
  name: string;
  durationMin: number;
}

export interface Slot {
  id: number;
  serviceId: number;
  startAt: string;
  endAt: string;
  capacity: number;
  service?: Service;
  status?: 'available' | 'booked' | 'conflict';
  isBooked?: boolean;
  hasConflict?: boolean;
}

export interface SlotGenerationRequest {
  serviceId: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  includeWeekends: boolean;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  slotDuration: number;
}

@Component({
  selector: 'app-slots-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './slots-management.component.html',
  styleUrl: './slots-management.component.scss'
})
export class SlotsManagementComponent implements OnInit, OnDestroy {
  services: Service[] = [];
  slots: Slot[] = [];
  isLoading = false;
  isGenerating = false;
  
  generationForm: FormGroup;
  currentUser: any = null;
  organizationId = 0;
  
  displayedColumns: string[] = ['service', 'date', 'time', 'duration', 'capacity', 'status', 'actions'];
  
  // Пагинация
  totalCount = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50, 100];
  
  // Счетчики для отображения
  get servicesCount(): number {
    return this.services.length;
  }
  
  get slotsCount(): number {
    return this.slots.length;
  }

  getSlotStatusClass(slot: Slot): string {
    switch (slot.status) {
      case 'available':
        return 'status-available';
      case 'booked':
        return 'status-booked';
      case 'conflict':
        return 'status-conflict';
      default:
        return 'status-unknown';
    }
  }

  getSlotStatusText(slot: Slot): string {
    switch (slot.status) {
      case 'available':
        return 'Свободен';
      case 'booked':
        return 'Занят';
      case 'conflict':
        return 'Недоступен (конфликт)';
      default:
        return 'Неизвестно';
    }
  }

  getSlotStatusIcon(slot: Slot): string {
    switch (slot.status) {
      case 'available':
        return 'check_circle';
      case 'booked':
        return 'person';
      case 'conflict':
        return 'block';
      default:
        return 'help';
    }
  }
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.generationForm = this.fb.group({
      serviceId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['18:00', Validators.required],
      includeWeekends: [false],
      lunchBreakStart: ['13:00'],
      lunchBreakEnd: ['14:00'],
      slotDuration: [30, [Validators.required, Validators.min(15), Validators.max(480)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser?.organizationId) {
      this.organizationId = this.currentUser.organizationId;
    }

    this.loadServices();
    this.loadSlots();

    // Подписываемся на изменения выбранной услуги для автоматического заполнения длительности слота
    this.generationForm.get('serviceId')?.valueChanges.subscribe(serviceId => {
      if (serviceId) {
        const selectedService = this.services.find(s => s.id === serviceId);
        if (selectedService) {
          this.generationForm.patchValue({
            slotDuration: selectedService.durationMin
          });
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadServices(): void {
    this.isLoading = true;
    this.apiService.get<{ services: Service[], isSuperAdmin: boolean }>(`/services?organizationId=${this.organizationId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.services = response.services || [];
          this.isLoading = false;
          
          // Если услуга уже выбрана, автоматически заполняем длительность слота
          const selectedServiceId = this.generationForm.get('serviceId')?.value;
          if (selectedServiceId) {
            const selectedService = this.services.find(s => s.id === selectedServiceId);
            if (selectedService) {
              this.generationForm.patchValue({
                slotDuration: selectedService.durationMin
              });
            }
          }
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.showErrorMessage('Ошибка загрузки услуг');
          this.isLoading = false;
        }
      });
  }

  loadSlots(): void {
    this.isLoading = true;
    const page = this.pageIndex + 1; // Backend использует 1-based пагинацию
    console.log('Loading slots with:', { pageIndex: this.pageIndex, pageSize: this.pageSize, page: page });
    
    this.apiService.get<{ slots: Slot[], pagination: any }>(`/slots/status?organizationId=${this.organizationId}&limit=${this.pageSize}&page=${page}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);
          this.slots = response.slots || [];
          this.totalCount = response.pagination?.total || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading slots:', error);
          this.showErrorMessage('Ошибка загрузки слотов');
          this.isLoading = false;
        }
      });
  }

  generateSlots(): void {
    if (this.generationForm.invalid) {
      this.showErrorMessage('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const formValue = this.generationForm.value;
    const request: SlotGenerationRequest = {
      serviceId: formValue.serviceId,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      includeWeekends: formValue.includeWeekends,
      lunchBreakStart: formValue.lunchBreakStart,
      lunchBreakEnd: formValue.lunchBreakEnd,
      slotDuration: formValue.slotDuration
    };

    this.isGenerating = true;
    this.apiService.post<{ message: string; generatedCount: number }>('/slots/generate', request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showSuccessMessage(`Сгенерировано ${response.generatedCount} слотов`);
          this.loadSlots(); // Перезагружаем слоты
          this.isGenerating = false;
        },
        error: (error) => {
          console.error('Error generating slots:', error);
          this.showErrorMessage('Ошибка генерации слотов');
          this.isGenerating = false;
        }
      });
  }

  deleteSlot(slotId: number): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Удаление слота',
      message: 'Вы уверены, что хотите удалить этот слот?',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      confirmColor: 'warn',
      icon: 'delete'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.apiService.delete(`/slots/${slotId}`)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccessMessage('Слот удален');
              this.loadSlots();
            },
            error: (error) => {
              console.error('Error deleting slot:', error);
              this.showErrorMessage('Ошибка удаления слота');
            }
          });
      }
    });
  }

  deleteAllSlots(): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Удаление всех слотов',
      message: 'Вы уверены, что хотите удалить ВСЕ слоты? Это действие нельзя отменить.',
      confirmText: 'Удалить все',
      cancelText: 'Отмена',
      confirmColor: 'warn',
      icon: 'delete_sweep'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        this.apiService.delete(`/slots?organizationId=${this.organizationId}`)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              const deletedCount = (response as any).deletedSlots || 0;
              this.showSuccessMessage(`Успешно удалено ${deletedCount} слотов`);
              this.loadSlots();
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Error deleting all slots:', error);
              
              if (error.status === 400 && error.error?.message) {
                // Показываем понятное сообщение об ошибке
                this.showErrorMessage(error.error.message, 'Понятно');
              } else if (error.status === 403) {
                this.showErrorMessage('У вас нет прав для удаления слотов', 'Понятно');
              } else {
                this.showErrorMessage('Произошла ошибка при удалении слотов. Попробуйте еще раз.', 'Понятно');
              }
            }
          });
      }
    });
  }

  getServiceName(serviceId: number): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.name : 'Неизвестная услуга';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU');
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getDuration(startAt: string, endAt: string): number {
    const start = new Date(startAt);
    const end = new Date(endAt);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
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

  // Обработчики пагинации
  onPageChange(event: PageEvent): void {
    console.log('Page change event:', event);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    console.log('Updated pagination:', { pageIndex: this.pageIndex, pageSize: this.pageSize });
    this.loadSlots();
  }
}
