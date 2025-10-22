import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { ServicesService, Service } from '../../../core/services/services.service';
import { OrganizationsService } from '../../../core/services/organizations.service';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    TranslatePipe
  ],
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss']
})
export class ServicesListComponent implements OnInit, OnDestroy {
  services: Service[] = [];
  loading = true;
  totalBookings = 0;
  averageOccupancy = 0;
  private destroy$ = new Subject<void>();

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

  loadServices(): void {
    this.loading = true;
    this.servicesService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.services = response.services;
          this.calculateStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.snackBar.open('Error loading services', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  calculateStats(): void {
    // Calculate total bookings
    this.totalBookings = this.services.reduce((total, service) => {
      return total + (service._count?.appointments || 0);
    }, 0);

    // Calculate average occupancy
    const totalSlots = this.services.reduce((total, service) => {
      return total + (service._count?.slots || 0);
    }, 0);
    
    if (totalSlots > 0) {
      this.averageOccupancy = Math.round((this.totalBookings / totalSlots) * 100);
    }
  }

  getLocalizedName(service: Service): string {
    const currentLang = this.i18nService.getCurrentLanguage();
    return this.servicesService.getLocalizedName(service, currentLang);
  }

  getLocalizedDescription(service: Service): string {
    const currentLang = this.i18nService.getCurrentLanguage();
    return this.servicesService.getLocalizedDescription(service, currentLang);
  }

  formatDuration(durationMin: number): string {
    return this.servicesService.formatDuration(durationMin);
  }

  getServiceIcon(service: Service): string {
    // Map service names to appropriate icons
    const name = this.getLocalizedName(service).toLowerCase();
    if (name.includes('hair') || name.includes('стрижк')) return 'content_cut';
    if (name.includes('color') || name.includes('краск')) return 'palette';
    if (name.includes('facial') || name.includes('лиц')) return 'face';
    if (name.includes('massage') || name.includes('массаж')) return 'spa';
    if (name.includes('nail') || name.includes('ногт')) return 'self_improvement';
    return 'build';
  }

  getServiceCategory(service: Service): string {
    const name = this.getLocalizedName(service).toLowerCase();
    if (name.includes('hair') || name.includes('стрижк') || name.includes('краск')) return 'Hair';
    if (name.includes('facial') || name.includes('лиц') || name.includes('массаж')) return 'Skincare';
    if (name.includes('nail') || name.includes('ногт')) return 'Nails';
    return 'General';
  }

  getOccupancyPercentage(service: Service): number {
    const totalSlots = service._count?.slots || 0;
    const bookedSlots = service._count?.appointments || 0;
    if (totalSlots === 0) return 0;
    return Math.round((bookedSlots / totalSlots) * 100);
  }

  getOccupancyClass(service: Service): string {
    const percentage = this.getOccupancyPercentage(service);
    if (percentage >= 80) return 'high';
    if (percentage >= 60) return 'medium';
    return 'low';
  }

  getBookedSlots(service: Service): number {
    return service._count?.appointments || 0;
  }

  getTotalSlots(service: Service): number {
    return service._count?.slots || 0;
  }

  deleteService(service: Service): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Удаление услуги',
      message: `Вы уверены, что хотите удалить услугу "${this.getLocalizedName(service)}"?`,
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
              this.snackBar.open('Service deleted successfully', 'Close', { duration: 3000 });
              this.loadServices(); // Reload to get updated data
            },
            error: (error) => {
              console.error('Error deleting service:', error);
              this.snackBar.open('Error deleting service', 'Close', { duration: 3000 });
            }
          });
      }
    });
  }
}
