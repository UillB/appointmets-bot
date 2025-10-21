import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { ServicesService, Service } from '../../../core/services/services.service';
import { OrganizationsService } from '../../../core/services/organizations.service';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TwaBaseComponent } from '../../../shared/components/twa-base/twa-base.component';
import { TwaListComponent } from '../../../shared/components/twa-list/twa-list.component';
import { TwaNavigationComponent } from '../../../shared/components/twa-navigation/twa-navigation.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-services-list-twa',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSnackBarModule,
    MatDialogModule,
    TranslatePipe,
    TwaBaseComponent,
    TwaListComponent,
    TwaNavigationComponent
  ],
  template: `
    <app-twa-base>
      <app-twa-list
        [title]="'services.title' | translate"
        [subtitle]="'services.subtitle' | translate"
        [items]="services"
        [loading]="loading"
        [loadingMessage]="'common.loading' | translate"
        [showCreateButton]="true"
        [createButtonText]="'services.create' | translate"
        [showFilters]="true"
        [filters]="serviceFilters"
        [emptyIcon]="'business_center'"
        [emptyTitle]="'services.empty.title' | translate"
        [emptyMessage]="'services.empty.message' | translate"
        (itemClick)="onServiceClick($event)"
        (itemActionClick)="onServiceActionClick($event)"
        (createClick)="onCreateService()"
        (filterClick)="onFilterClick($event)">
      </app-twa-list>

      <app-twa-navigation
        [navItems]="navItems"
        [showNavBar]="true"
        [showFab]="false"
        [showBackButton]="true"
        (navItemClick)="onNavItemClick($event)"
        (backClick)="onBackClick()">
      </app-twa-navigation>
    </app-twa-base>
  `,
  styles: [`
    /* TWA-specific styles are handled by the base components */
  `]
})
export class ServicesListTwaComponent implements OnInit, OnDestroy {
  services: Service[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  serviceFilters = [
    { id: 'all', label: 'Все услуги', icon: 'list', active: true },
    { id: 'active', label: 'Активные', icon: 'check_circle', active: false },
    { id: 'inactive', label: 'Неактивные', icon: 'cancel', active: false }
  ];

  navItems = [
    { id: 'dashboard', label: 'Главная', icon: 'dashboard', active: false },
    { id: 'appointments', label: 'Записи', icon: 'event', active: false },
    { id: 'services', label: 'Услуги', icon: 'build', active: true },
    { id: 'organizations', label: 'Организации', icon: 'business', active: false },
    { id: 'settings', label: 'Настройки', icon: 'settings', active: false }
  ];

  constructor(
    private servicesService: ServicesService,
    private organizationsService: OrganizationsService,
    private i18nService: I18nService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:universal-refresh')
  onUniversalRefresh() {
    console.log('🔄 Universal refresh triggered in ServicesListTwaComponent');
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.servicesService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.services = response.services.map(service => ({
            ...service,
            title: this.getLocalizedName(service),
            subtitle: service.organization?.name,
            icon: 'build',
            iconClass: 'icon-primary',
            status: 'active',
            statusText: 'Активна',
            content: [
              { icon: 'schedule', text: `${service._count?.slots || 0} слотов` },
              { icon: 'event', text: `${service._count?.appointments || 0} записей` }
            ],
            description: this.getLocalizedDescription(service),
            actions: [
              { text: 'Просмотр', icon: 'visibility', color: 'primary', action: 'view' },
              { text: 'Редактировать', icon: 'edit', color: 'accent', action: 'edit' },
              { text: 'Удалить', icon: 'delete', color: 'warn', action: 'delete' }
            ],
            footer: `Создана: ${this.formatDate(service.createdAt || '')}`
          }));
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.snackBar.open('Ошибка загрузки услуг', 'Закрыть', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  getLocalizedName(service: Service): string {
    const currentLang = this.i18nService.getCurrentLanguage();
    return this.servicesService.getLocalizedName(service, currentLang);
  }

  getLocalizedDescription(service: Service): string {
    const currentLang = this.i18nService.getCurrentLanguage();
    return this.servicesService.getLocalizedDescription(service, currentLang);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  onServiceClick(service: any): void {
    console.log('Service clicked:', service);
    // Navigate to service details
  }

  onServiceActionClick(event: {action: any, item: any, event: Event}): void {
    const { action, item } = event;
    
    switch (action.action) {
      case 'view':
        this.onViewService(item);
        break;
      case 'edit':
        this.onEditService(item);
        break;
      case 'delete':
        this.onDeleteService(item);
        break;
    }
  }

  onViewService(service: any): void {
    console.log('View service:', service);
    // Navigate to service view
  }

  onEditService(service: any): void {
    console.log('Edit service:', service);
    // Navigate to service edit
  }

  onDeleteService(service: any): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Удаление услуги',
      message: `Вы уверены, что хотите удалить услугу "${service.title}"?`,
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
        this.servicesService.deleteService(service.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Услуга успешно удалена', 'Закрыть', { duration: 3000 });
              this.loadServices();
            },
            error: (error) => {
              console.error('Error deleting service:', error);
              this.snackBar.open('Ошибка при удалении услуги', 'Закрыть', { duration: 3000 });
            }
          });
      }
    });
  }

  onCreateService(): void {
    console.log('Create service');
    // Navigate to create service
  }

  onFilterClick(filter: any): void {
    console.log('Filter clicked:', filter);
    // Apply filter logic
  }

  onNavItemClick(item: any): void {
    console.log('Navigation item clicked:', item);
    // Handle navigation
  }

  onBackClick(): void {
    console.log('Back button clicked');
    // Handle back navigation
  }
}
