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
  template: `
    <div class="services-container">
      <div class="services-header">
        <div class="header-content">
          <h1>{{ 'services.title' | translate }}</h1>
          <p>{{ 'services.subtitle' | translate }}</p>
        </div>
        <button 
          mat-raised-button 
          color="primary" 
          routerLink="/services/create"
          class="create-button">
          <mat-icon>add</mat-icon>
          {{ 'services.create' | translate }}
        </button>
      </div>

      <div class="services-content">
        <div *ngIf="loading" class="loading-container">
          <mat-spinner></mat-spinner>
          <p>{{ 'common.loading' | translate }}</p>
        </div>

        <div *ngIf="!loading && services.length === 0" class="empty-state">
          <mat-icon class="empty-icon">business_center</mat-icon>
          <h3>{{ 'services.empty.title' | translate }}</h3>
          <p>{{ 'services.empty.message' | translate }}</p>
          <button 
            mat-raised-button 
            color="primary" 
            routerLink="/services/create">
            <mat-icon>add</mat-icon>
            {{ 'services.create' | translate }}
          </button>
        </div>

        <div *ngIf="!loading && services.length > 0" class="services-grid">
          <mat-card *ngFor="let service of services" class="service-card">
            <mat-card-header>
              <mat-card-title>{{ getLocalizedName(service) }}</mat-card-title>
              <mat-card-subtitle>
                <span class="organization-name">{{ service.organization?.name }}</span>
                <span class="duration">{{ formatDuration(service.durationMin) }}</span>
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <p *ngIf="getLocalizedDescription(service)" class="description">
                {{ getLocalizedDescription(service) }}
              </p>
              
              <div class="service-stats">
                <mat-chip-set>
                  <mat-chip>
                    <mat-icon matChipAvatar>schedule</mat-icon>
                    {{ service._count?.slots || 0 }} {{ 'services.slots' | translate }}
                  </mat-chip>
                  <mat-chip>
                    <mat-icon matChipAvatar>event</mat-icon>
                    {{ service._count?.appointments || 0 }} {{ 'services.appointments' | translate }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>

            <mat-card-actions align="end">
              <button 
                mat-button 
                [routerLink]="['/services', service.id]"
                color="primary">
                <mat-icon>visibility</mat-icon>
                {{ 'common.view' | translate }}
              </button>
              <button 
                mat-button 
                [routerLink]="['/services', service.id, 'edit']"
                color="accent">
                <mat-icon>edit</mat-icon>
                {{ 'common.edit' | translate }}
              </button>
              <button 
                mat-button 
                color="warn"
                (click)="deleteService(service)">
                <mat-icon>delete</mat-icon>
                {{ 'common.delete' | translate }}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .services-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .services-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      gap: 24px;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .header-content p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 1rem;
    }

    .create-button {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      gap: 16px;
    }

    .loading-container p {
      color: var(--text-secondary);
      margin: 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
      gap: 16px;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: var(--text-disabled);
    }

    .empty-state h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.5rem;
      font-weight: 500;
    }

    .empty-state p {
      margin: 0;
      color: var(--text-secondary);
      max-width: 400px;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .service-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .service-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .organization-name {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .duration {
      color: var(--primary-color);
      font-weight: 500;
      font-size: 0.875rem;
    }

    .description {
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 12px 0;
    }

    .service-stats {
      margin-top: 16px;
    }

    .service-stats mat-chip {
      font-size: 0.75rem;
    }

    mat-card-actions {
      padding: 16px;
      gap: 8px;
    }

    mat-card-actions button {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    @media (max-width: 768px) {
      .services-container {
        padding: 16px;
      }

      .services-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .create-button {
        align-self: flex-start;
      }

      .services-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `]
})
export class ServicesListComponent implements OnInit, OnDestroy {
  services: Service[] = [];
  loading = true;
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
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.snackBar.open('Error loading services', 'Close', { duration: 3000 });
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

  formatDuration(durationMin: number): string {
    return this.servicesService.formatDuration(durationMin);
  }

  deleteService(service: Service): void {
    if (confirm(`Are you sure you want to delete "${this.getLocalizedName(service)}"?`)) {
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
  }
}
