import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil, filter } from 'rxjs';
import { AppointmentsService } from '../../core/services/appointments.service';
import { DashboardService } from '../../core/services/dashboard.service';


@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() navigate = new EventEmitter<void>();
  private destroy$ = new Subject<void>();
  currentRoute = '';
  
  // Dynamic data
  appointmentsCount = 0;
  todayAppointments = 0;
  weekAppointments = 0;

  menuItems = [
    {
      title: 'Dashboard',
      icon: 'grid_view',
      route: '/dashboard',
      badge: null,
      isActive: false
    },
    {
      title: 'Appointments',
      icon: 'event',
      route: '/appointments',
      badge: null, // Will be set dynamically
      isActive: false
    },
    {
      title: 'Services',
      icon: 'build',
      route: '/services',
      badge: null,
      isActive: false
    },
    {
      title: 'Organizations',
      icon: 'business',
      route: '/organizations',
      badge: null,
      isActive: false
    },
    {
      title: 'Bot Management',
      icon: 'smart_toy',
      route: '/bot-management',
      badge: 'New',
      isActive: false
    },
    {
      title: 'Slots',
      icon: 'schedule',
      route: '/slots',
      badge: null,
      isActive: false
    },
    {
      title: 'AI Assistant',
      icon: 'psychology',
      route: '/ai-config',
      badge: 'Beta',
      isActive: false
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/settings',
      badge: null,
      isActive: false
    }
  ];

  // Summary cards data - will be updated dynamically
  summaryCards = [
    {
      title: 'Today',
      value: '0 appts',
      icon: 'today'
    },
    {
      title: 'This Week',
      value: '0 appts',
      icon: 'date_range'
    }
  ];

  constructor(
    private router: Router,
    private appointmentsService: AppointmentsService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    // Отслеживаем изменения маршрута
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });

    // Устанавливаем текущий маршрут
    this.currentRoute = this.router.url;
    
    // Загружаем динамические данные
    this.loadAppointmentsData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route;
  }

  getRouteClass(route: string): string {
    return this.isActiveRoute(route) ? 'active' : '';
  }

  onNavigate(): void {
    // Emit event to parent component for mobile sidebar closing
    this.navigate.emit();
  }

  onLogout(): void {
    // Handle logout logic
    console.log('Logout clicked');
    // Add actual logout logic here
  }

  private loadAppointmentsData(): void {
    // Загружаем статистику appointments
    this.dashboardService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.appointmentsCount = stats.totalAppointments;
          this.todayAppointments = stats.todayAppointments;
          this.weekAppointments = stats.weekAppointments;
          
          // Обновляем badge для Appointments
          this.menuItems[1].badge = this.appointmentsCount > 0 ? this.appointmentsCount.toString() : null;
          
          // Обновляем summary cards
          this.summaryCards[0].value = `${this.todayAppointments} appts`;
          this.summaryCards[1].value = `${this.weekAppointments} appts`;
        },
        error: (error) => {
          console.error('Error loading appointments data for sidebar:', error);
          // В случае ошибки оставляем значения по умолчанию
        }
      });
  }
}
