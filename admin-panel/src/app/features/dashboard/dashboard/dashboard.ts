import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';

import { AuthService, User } from '../../../core/services/auth';
import { DashboardService, DashboardStats } from '../../../core/services/dashboard.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Appointment } from '../../../shared/models/api.models';
import { ApiTestComponent } from '../api-test/api-test.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatTabsModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatListModule,
            MatDividerModule,
            ApiTestComponent,
            TranslatePipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  currentDate = new Date();
  currentTime = new Date();
  
  stats: DashboardStats = {
    totalAppointments: 0,
    todayAppointments: 0,
    weekAppointments: 0,
    pendingAppointments: 0,
    totalServices: 0,
    activeServices: 0,
    totalRevenue: 0,
    todayRevenue: 0
  };
  
  loading = true;
  recentAppointments: Appointment[] = [];
  selectedDate: Date | null = null;
  calendarAppointments: Appointment[] = [];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private i18nService: I18nService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Set today as default selected date
    this.selectedDate = new Date();
    
    this.loadDashboardData();
    this.loadCalendarData();
    
    // Update time every second
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentTime = new Date();
        this.currentDate = new Date();
      });
    
    // Обновляем данные каждые 5 минут
    interval(5 * 60 * 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDashboardData();
        this.loadCalendarData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    this.dashboardService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.loading = false;
        },
        error: (error) => {
          console.error('Ошибка загрузки статистики:', error);
          this.loading = false;
        }
      });

    this.dashboardService.getRecentAppointments(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          this.recentAppointments = appointments;
        },
        error: (error) => {
          console.error('Ошибка загрузки последних записей:', error);
        }
      });

    this.loadCalendarData();
  }

  private loadCalendarData(): void {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.dashboardService.getAppointmentsForCalendar(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          this.calendarAppointments = appointments;
        },
        error: (error) => {
          console.error('Ошибка загрузки календаря:', error);
        }
      });
  }

  onDateSelected(date: Date | null): void {
    console.log('📅 Date selected:', date);
    this.selectedDate = date;
    
    // Load appointments for selected date
    if (date) {
      this.loadAppointmentsForDate(date);
      
      // Smooth scroll to appointments section when date is selected
      setTimeout(() => {
        const appointmentsSection = document.querySelector('.upcoming-appointments');
        if (appointmentsSection) {
          appointmentsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  }

  loadAppointmentsForDate(date: Date): void {
    console.log('📅 Loading appointments for date:', date);
    // Filter appointments for the selected date
    this.recentAppointments = this.calendarAppointments.filter(apt => {
      const aptDate = new Date(apt.slot?.startAt || apt.createdAt || '');
      return aptDate.toDateString() === date.toDateString();
    });
    console.log('📅 Found appointments:', this.recentAppointments.length);
  }

  onStatClick(statKey: string): void {
    // Navigate to appropriate section based on stat clicked
    switch (statKey) {
      case 'totalAppointments':
      case 'todayAppointments':
      case 'pendingAppointments':
        this.router.navigate(['/appointments']);
        break;
      case 'totalServices':
        this.router.navigate(['/services']);
        break;
    }
  }

  getAppointmentsForDate(date: Date): Appointment[] {
    return this.calendarAppointments.filter(apt => {
      const aptDate = new Date(apt.slot?.startAt || apt.createdAt || '');
      return aptDate.toDateString() === date.toDateString();
    });
  }

  getAppointmentStatusClass(status?: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  getAppointmentIcon(status?: string): string {
    switch (status) {
      case 'confirmed': return 'check_circle';
      case 'pending': return 'schedule';
      case 'cancelled': return 'cancel';
      default: return 'event';
    }
  }

  formatAppointmentTime(appointment: Appointment): string {
    const date = new Date(appointment.slot?.startAt || appointment.createdAt || '');
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getSelectedDateHeader(): string {
    if (this.selectedDate) {
      return this.selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return this.currentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getClientName(appointment: Appointment): string {
    // Placeholder for client name - in real app this would come from appointment data
    return `Client ID: ${appointment.chatId}`;
  }

  formatAppointmentDate(appointment: Appointment): string {
    const date = new Date(appointment.slot?.startAt || appointment.createdAt || '');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Проверяем, если это сегодня
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Проверяем, если это вчера
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Для остальных дат показываем день недели и дату
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  refreshData(): void {
    this.loadDashboardData();
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

  getInitials(name: string | undefined): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getStatusText(status: string | undefined): string {
    if (!status) return this.i18nService.translate('appointments.status.pending');
    return this.i18nService.translate(`appointments.status.${status.toLowerCase()}`);
  }
}
