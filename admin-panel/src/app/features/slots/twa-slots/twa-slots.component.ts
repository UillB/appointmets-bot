import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';

import { TelegramWebAppService } from '../../../core/services/telegram-webapp.service';
import { SlotsService } from '../../../core/services/slots.service';
import { ServicesService, Service } from '../../../core/services/services.service';
import { AuthService } from '../../../core/services/auth';
import { Slot } from '../../../shared/models/api.models';
import { TwaBaseComponent } from '../../../shared/components/twa-base/twa-base.component';
import { TwaListComponent } from '../../../shared/components/twa-list/twa-list.component';
import { TwaNavigationComponent } from '../../../shared/components/twa-navigation/twa-navigation.component';
import { TwaMobileCardComponent } from '../../../shared/components/twa-mobile-card/twa-mobile-card.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-twa-slots',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatDialogModule,
    MatTabsModule,
    MatChipsModule,
    TwaBaseComponent,
    TwaListComponent,
    TwaNavigationComponent,
    TwaMobileCardComponent
  ],
  template: `
    <app-twa-base>
      <!-- Tabs Navigation -->
      <div class="twa-tabs">
        <div class="tab-buttons">
          <button 
            mat-stroked-button 
            [class.active]="activeTab === 'generation'"
            (click)="setActiveTab('generation')"
            class="tab-button">
            <mat-icon>auto_awesome</mat-icon>
            Генерация
          </button>
          <button 
            mat-stroked-button 
            [class.active]="activeTab === 'management'"
            (click)="setActiveTab('management')"
            class="tab-button">
            <mat-icon>schedule</mat-icon>
            Управление
          </button>
        </div>
      </div>

      <!-- Generation Tab -->
      <div *ngIf="activeTab === 'generation'" class="tab-content">
        <mat-card class="generation-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>auto_awesome</mat-icon>
              Генерация слотов
            </mat-card-title>
            <mat-card-subtitle>
              Создайте слоты для выбранной услуги на указанный период
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="generationForm" class="generation-form">
              <!-- Service Selection -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Услуга *</mat-label>
                <mat-select formControlName="serviceId" required>
                  <mat-option *ngFor="let service of services" [value]="service.id">
                    {{ getServiceName(service) }} ({{ service.durationMin }} мин)
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="generationForm.get('serviceId')?.hasError('required')">
                  Выберите услугу
                </mat-error>
              </mat-form-field>

              <!-- Date Range -->
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Дата начала *</mat-label>
                  <input matInput [matDatepicker]="startPicker" formControlName="startDate" required>
                  <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                  <mat-datepicker #startPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Дата окончания *</mat-label>
                  <input matInput [matDatepicker]="endPicker" formControlName="endDate" required>
                  <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                  <mat-datepicker #endPicker></mat-datepicker>
                </mat-form-field>
              </div>

              <!-- Time Range -->
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Время начала *</mat-label>
                  <input matInput type="time" formControlName="startTime" required>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Время окончания *</mat-label>
                  <input matInput type="time" formControlName="endTime" required>
                </mat-form-field>
              </div>

              <!-- Slot Duration -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Длительность слота (минуты) *</mat-label>
                <input matInput type="number" formControlName="slotDuration" min="15" max="480" required>
                <mat-error *ngIf="generationForm.get('slotDuration')?.hasError('min')">
                  Минимум 15 минут
                </mat-error>
                <mat-error *ngIf="generationForm.get('slotDuration')?.hasError('max')">
                  Максимум 480 минут (8 часов)
                </mat-error>
              </mat-form-field>

              <!-- Weekend Option -->
              <mat-checkbox formControlName="includeWeekends" class="weekend-checkbox">
                Включать выходные дни
              </mat-checkbox>

              <!-- Lunch Break (only if not including weekends) -->
              <div *ngIf="!generationForm.get('includeWeekends')?.value" class="lunch-break-section">
                <h4>Обеденный перерыв</h4>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Начало перерыва</mat-label>
                    <input matInput type="time" formControlName="lunchBreakStart">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Конец перерыва</mat-label>
                    <input matInput type="time" formControlName="lunchBreakEnd">
                  </mat-form-field>
                </div>
              </div>

              <!-- Generate Button -->
              <div class="form-actions">
                <button 
                  mat-raised-button 
                  color="primary" 
                  (click)="generateSlots()"
                  [disabled]="generationForm.invalid || isGenerating"
                  class="generate-button">
                  <mat-icon *ngIf="!isGenerating">auto_awesome</mat-icon>
                  <mat-spinner *ngIf="isGenerating" diameter="20"></mat-spinner>
                  {{ isGenerating ? 'Генерация...' : 'Сгенерировать слоты' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Management Tab -->
      <div *ngIf="activeTab === 'management'" class="tab-content">
        <!-- Quick Actions -->
        <div class="quick-actions">
          <button mat-stroked-button (click)="openQuickGenerate()" class="quick-action-btn">
            <mat-icon>bolt</mat-icon>
            Быстрая генерация
          </button>
          <button mat-stroked-button color="warn" (click)="deleteEmptySlots()" class="quick-action-btn">
            <mat-icon>delete_sweep</mat-icon>
            Удалить пустые
          </button>
          <button mat-stroked-button (click)="refreshSlots()" class="quick-action-btn">
            <mat-icon>refresh</mat-icon>
            Обновить
          </button>
        </div>

        <!-- Filters -->
        <div class="filters-section">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Услуга</mat-label>
            <mat-select [(ngModel)]="selectedServiceId" (selectionChange)="onServiceFilterChange()">
              <mat-option [value]="null">Все услуги</mat-option>
              <mat-option *ngFor="let service of services" [value]="service.id">
                {{ getServiceName(service) }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Дата</mat-label>
            <input matInput type="date" [(ngModel)]="selectedDate" (change)="onDateFilterChange()">
          </mat-form-field>
        </div>

        <!-- Slots List -->
        <app-twa-list
          [title]="'Слоты'"
          [subtitle]="'Управление временными слотами'"
          [items]="formattedSlots"
          [loading]="loading"
          [loadingMessage]="'Загрузка слотов...'"
          [showCreateButton]="false"
          [showFilters]="false"
          [emptyIcon]="'event_busy'"
          [emptyTitle]="'Слоты не найдены'"
          [emptyMessage]="'Создайте слоты с помощью генератора'"
          (itemClick)="onSlotClick($event)"
          (itemActionClick)="onSlotActionClick($event)">
        </app-twa-list>
      </div>

      <!-- Navigation -->
      <app-twa-navigation
        [navItems]="navItems"
        [showNavBar]="true"
        [showFab]="activeTab === 'generation'"
        [fabIcon]="'auto_awesome'"
        [fabLabel]="'Генерировать'"
        [showBackButton]="true"
        (navItemClick)="onNavItemClick($event)"
        (fabClick)="onFabClick()"
        (backClick)="onBackClick()">
      </app-twa-navigation>
    </app-twa-base>
  `,
  styles: [`
    .twa-tabs {
      margin-bottom: 16px;
    }

    .tab-buttons {
      display: flex;
      gap: 8px;
      background: #f8f9fa;
      padding: 4px;
      border-radius: 12px;
    }

    .tab-button {
      flex: 1;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &.active {
        background: #1976d2;
        color: white;
        box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
      }

      &:not(.active) {
        background: transparent;
        color: #666;
        
        &:hover {
          background: rgba(25, 118, 210, 0.1);
          color: #1976d2;
        }
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 6px;
      }
    }

    .tab-content {
      margin-bottom: 80px; /* Space for navigation */
    }

    .generation-card {
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 16px;
    }

    .generation-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 12px;
    }

    .full-width {
      width: 100%;
    }

    .weekend-checkbox {
      margin: 8px 0;
    }

    .lunch-break-section {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 12px;
      margin-top: 16px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 24px;
    }

    .generate-button {
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
      min-width: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .quick-action-btn {
      flex: 1;
      min-width: 0;
      font-size: 14px;
      padding: 10px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .filters-section {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .filter-field {
      flex: 1;
      min-width: 150px;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 8px;
      }

      .quick-actions {
        flex-direction: column;
      }

      .quick-action-btn {
        width: 100%;
      }

      .filters-section {
        flex-direction: column;
      }

      .filter-field {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .tab-buttons {
        flex-direction: column;
        gap: 4px;
      }

      .tab-button {
        font-size: 14px;
        padding: 8px 12px;
      }

      .generate-button {
        width: 100%;
        min-width: auto;
      }
    }
  `]
})
export class TwaSlotsComponent implements OnInit, OnDestroy {
  isAllowed = false;
  loading = false;
  isGenerating = false;
  services: Service[] = [];
  slots: (Slot & { status?: string; isBooked?: boolean; hasConflict?: boolean })[] = [];
  selectedServiceId: number | null = null;
  selectedDate: string = '';
  activeTab: 'generation' | 'management' = 'generation';
  
  private destroy$ = new Subject<void>();
  generationForm: FormGroup;

  navItems = [
    { id: 'dashboard', label: 'Главная', icon: 'dashboard', active: false },
    { id: 'appointments', label: 'Записи', icon: 'event', active: false },
    { id: 'services', label: 'Услуги', icon: 'build', active: false },
    { id: 'slots', label: 'Слоты', icon: 'schedule', active: true },
    { id: 'organizations', label: 'Организации', icon: 'business', active: false },
    { id: 'settings', label: 'Настройки', icon: 'settings', active: false }
  ];

  constructor(
    private tg: TelegramWebAppService,
    private slotsService: SlotsService,
    private servicesService: ServicesService,
    private auth: AuthService,
    private snack: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.generationForm = this.fb.group({
      serviceId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['18:00', Validators.required],
      slotDuration: [30, [Validators.required, Validators.min(15), Validators.max(480)]],
      includeWeekends: [false],
      lunchBreakStart: ['13:00'],
      lunchBreakEnd: ['14:00']
    });
  }

  ngOnInit(): void {
    this.isAllowed = this.tg.isInTelegram && (typeof window !== 'undefined' ? window.innerWidth <= 768 : true);
    const today = new Date();
    this.selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().slice(0,10);
    this.loadServices();
    this.loadSlots();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:universal-refresh')
  onUniversalRefresh() {
    console.log('🔄 Universal refresh triggered in TwaSlotsComponent');
    this.loadSlots();
  }

  loadServices() {
    this.servicesService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ 
        next: (r) => this.services = r.services || [],
        error: (error) => console.error('Error loading services:', error)
      });
  }

  loadSlots() {
    if (!this.isAllowed) return;
    const user = this.auth.getCurrentUser();
    if (!user?.organizationId) return;
    
    this.loading = true;
    this.slotsService.getSlotsStatus({ 
      organizationId: user.organizationId, 
      serviceId: this.selectedServiceId || undefined, 
      date: this.selectedDate, 
      limit: 200 
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (r) => { 
        this.slots = r.slots || []; 
        this.loading = false; 
      },
      error: (error) => { 
        this.loading = false; 
        this.snack.open('Ошибка загрузки слотов', 'OK', { 
          duration: 2000, 
          panelClass: ['error-snackbar'] 
        }); 
        console.error('Error loading slots:', error);
      }
    });
  }

  get formattedSlots() {
    return this.slots.map(slot => ({
      ...slot,
      title: this.getServiceName(slot.service),
      subtitle: this.formatDate(slot.startAt),
      icon: 'schedule',
      iconClass: this.getSlotIconClass(slot),
      status: this.getSlotStatus(slot),
      statusText: this.getSlotStatusText(slot),
      content: [
        { icon: 'access_time', text: `${this.formatTime(slot.startAt)} - ${this.formatTime(slot.endAt)}` },
        { icon: 'timer', text: `${this.getDuration(slot.startAt, slot.endAt)} мин` },
        { icon: 'people', text: `Вместимость: ${slot.capacity}` },
        { icon: 'event', text: `Брони: ${slot.bookings?.length || 0}` }
      ],
      actions: [
        { text: 'Просмотр', icon: 'visibility', color: 'primary', action: 'view' },
        { text: 'Удалить', icon: 'delete', color: 'warn', action: 'delete' }
      ]
    }));
  }

  setActiveTab(tab: 'generation' | 'management') {
    this.activeTab = tab;
    if (tab === 'management') {
      this.loadSlots();
    }
  }

  generateSlots() {
    if (this.generationForm.invalid) return;
    
    this.isGenerating = true;
    const formValue = this.generationForm.value;
    
    const body = {
      serviceId: Number(formValue.serviceId),
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      slotDuration: formValue.slotDuration,
      includeWeekends: formValue.includeWeekends,
      lunchBreakStart: formValue.lunchBreakStart,
      lunchBreakEnd: formValue.lunchBreakEnd
    };

    this.slotsService.generateSlotsAdvanced(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { 
          this.snack.open('Слоты успешно сгенерированы', 'OK', { 
            duration: 3000, 
            panelClass: ['success-snackbar'] 
          }); 
          this.isGenerating = false;
          this.setActiveTab('management');
        },
        error: (error) => { 
          this.snack.open('Ошибка генерации слотов', 'OK', { 
            duration: 3000, 
            panelClass: ['error-snackbar'] 
          }); 
          this.isGenerating = false;
          console.error('Error generating slots:', error);
        }
      });
  }

  openQuickGenerate() {
    const serviceId = this.selectedServiceId || this.services[0]?.id;
    if (!serviceId) { 
      this.snack.open('Выберите услугу', 'OK', { duration: 2000 }); 
      return; 
    }
    
    const date = prompt('Дата (YYYY-MM-DD)', this.selectedDate) || this.selectedDate;
    const startTime = prompt('Начало (HH:MM)', '10:00') || '10:00';
    const endTime = prompt('Конец (HH:MM)', '18:00') || '18:00';
    const slotDuration = Number(prompt('Длительность слота (мин)', '30') || '30');
    
    const body = { 
      serviceId: Number(serviceId), 
      startDate: date, 
      endDate: date, 
      startTime, 
      endTime, 
      includeWeekends: true, 
      slotDuration 
    };
    
    this.slotsService.generateSlotsAdvanced(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { 
          this.snack.open('Слоты сгенерированы', 'OK', { 
            duration: 2000, 
            panelClass: ['success-snackbar'] 
          }); 
          this.loadSlots(); 
        },
        error: (error) => { 
          this.snack.open('Ошибка генерации', 'OK', { 
            duration: 2000, 
            panelClass: ['error-snackbar'] 
          }); 
          console.error('Error in quick generate:', error);
        }
      });
  }

  deleteEmptySlots() {
    const dialogData: ConfirmationDialogData = {
      title: 'Удаление пустых слотов',
      message: 'Вы уверены, что хотите удалить все пустые слоты? Это действие нельзя отменить.',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      confirmColor: 'warn',
      icon: 'delete_sweep'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.snack.open('Функция удаления пустых слотов в разработке', 'OK', { duration: 2000 });
      }
    });
  }

  refreshSlots() {
    this.loadSlots();
  }

  onServiceFilterChange() {
    this.loadSlots();
  }

  onDateFilterChange() {
    this.loadSlots();
  }

  onSlotClick(slot: any) {
    console.log('Slot clicked:', slot);
  }

  onSlotActionClick(event: {action: any, item: any, event: Event}) {
    const { action, item } = event;
    
    switch (action.action) {
      case 'view':
        this.onSlotClick(item);
        break;
      case 'delete':
        this.deleteSlot(item.id);
        break;
    }
  }

  deleteSlot(slotId: number) {
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
        this.slotsService.deleteSlot(slotId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snack.open('Слот удален', 'OK', { duration: 2000 });
              this.loadSlots();
            },
            error: (error) => {
              this.snack.open('Ошибка удаления слота', 'OK', { duration: 2000 });
              console.error('Error deleting slot:', error);
            }
          });
      }
    });
  }

  onNavItemClick(item: any) {
    console.log('Navigation item clicked:', item);
    // Handle navigation
  }

  onFabClick() {
    this.generateSlots();
  }

  onBackClick() {
    console.log('Back button clicked');
    // Handle back navigation
  }

  getServiceName(service: any): string {
    if (!service) return 'Неизвестная услуга';
    return service.nameRu || service.nameEn || service.name || 'Без названия';
  }

  getSlotStatus(slot: any): string {
    if (slot.isBooked) return 'booked';
    if (slot.hasConflict) return 'conflict';
    return 'available';
  }

  getSlotStatusText(slot: any): string {
    if (slot.isBooked) return 'Забронирован';
    if (slot.hasConflict) return 'Конфликт';
    return 'Доступен';
  }

  getSlotIconClass(slot: any): string {
    if (slot.isBooked) return 'icon-error';
    if (slot.hasConflict) return 'icon-warning';
    return 'icon-success';
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU');
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  getDuration(startAt: string, endAt: string): number {
    const start = new Date(startAt);
    const end = new Date(endAt);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }
}


