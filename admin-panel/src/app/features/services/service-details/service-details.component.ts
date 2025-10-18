import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';

import { ServicesService, Service } from '../../../core/services/services.service';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-service-details',
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
    MatTabsModule,
    MatTableModule,
    TranslatePipe
  ],
  template: `
    <div class="service-details-container">
      <div class="details-header">
        <button mat-icon-button routerLink="/services" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>{{ getLocalizedName(service) }}</h1>
          <p class="service-subtitle">
            <span class="organization">{{ service?.organization?.name }}</span>
            <span class="duration">{{ formatDuration(service?.durationMin || 0) }}</span>
          </p>
        </div>
        <div class="header-actions">
          <button 
            mat-raised-button 
            color="accent" 
            [routerLink]="['/services', service?.id, 'edit']"
            [disabled]="!service">
            <mat-icon>edit</mat-icon>
            {{ 'common.edit' | translate }}
          </button>
          <button 
            mat-raised-button 
            color="warn"
            (click)="deleteService()"
            [disabled]="!service">
            <mat-icon>delete</mat-icon>
            {{ 'common.delete' | translate }}
          </button>
        </div>
      </div>

      <div class="details-content">
        <div *ngIf="loading" class="loading-container">
          <mat-spinner></mat-spinner>
          <p>{{ 'common.loading' | translate }}</p>
        </div>

        <div *ngIf="!loading && service" class="service-details">
          <mat-tab-group>
            <!-- Overview Tab -->
            <mat-tab [label]="'Overview'">
              <div class="tab-content">
                <div class="details-grid">
                  <mat-card class="info-card">
                    <mat-card-header>
                      <mat-card-title>{{ 'services.name' | translate }}</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="localized-names">
                        <div class="name-item">
                          <strong>Default:</strong> {{ service.name }}
                        </div>
                        <div class="name-item" *ngIf="service.nameRu">
                          <strong>Russian:</strong> {{ service.nameRu }}
                        </div>
                        <div class="name-item" *ngIf="service.nameEn">
                          <strong>English:</strong> {{ service.nameEn }}
                        </div>
                        <div class="name-item" *ngIf="service.nameHe">
                          <strong>Hebrew:</strong> {{ service.nameHe }}
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="info-card">
                    <mat-card-header>
                      <mat-card-title>{{ 'services.description' | translate }}</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="localized-descriptions">
                        <div class="description-item" *ngIf="service.description">
                          <strong>Default:</strong> {{ service.description }}
                        </div>
                        <div class="description-item" *ngIf="service.descriptionRu">
                          <strong>Russian:</strong> {{ service.descriptionRu }}
                        </div>
                        <div class="description-item" *ngIf="service.descriptionEn">
                          <strong>English:</strong> {{ service.descriptionEn }}
                        </div>
                        <div class="description-item" *ngIf="service.descriptionHe">
                          <strong>Hebrew:</strong> {{ service.descriptionHe }}
                        </div>
                        <div *ngIf="!service.description && !service.descriptionRu && !service.descriptionEn && !service.descriptionHe" class="no-description">
                          No description provided
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="info-card">
                    <mat-card-header>
                      <mat-card-title>Service Details</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="service-details-list">
                        <div class="detail-item">
                          <mat-icon>schedule</mat-icon>
                          <span class="label">Duration:</span>
                          <span class="value">{{ formatDuration(service.durationMin) }}</span>
                        </div>
                        <div class="detail-item">
                          <mat-icon>business</mat-icon>
                          <span class="label">Organization:</span>
                          <span class="value">{{ service.organization?.name }}</span>
                        </div>
                        <div class="detail-item">
                          <mat-icon>event</mat-icon>
                          <span class="label">Time Slots:</span>
                          <span class="value">{{ service._count?.slots || 0 }}</span>
                        </div>
                        <div class="detail-item">
                          <mat-icon>appointment</mat-icon>
                          <span class="label">Appointments:</span>
                          <span class="value">{{ service._count?.appointments || 0 }}</span>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </mat-tab>

            <!-- Time Slots Tab -->
            <mat-tab [label]="'Time Slots'">
              <div class="tab-content">
                <div *ngIf="service.slots && service.slots.length > 0; else noSlots">
                  <div class="slots-header">
                    <h3>Available Time Slots</h3>
                    <p>{{ service.slots.length }} slots available</p>
                  </div>
                  
                  <div class="slots-grid">
                    <mat-card *ngFor="let slot of service.slots" class="slot-card">
                      <mat-card-content>
                        <div class="slot-info">
                          <div class="slot-time">
                            <mat-icon>schedule</mat-icon>
                            <span>{{ formatSlotTime(slot.startAt) }} - {{ formatSlotTime(slot.endAt) }}</span>
                          </div>
                          <div class="slot-capacity">
                            <mat-icon>people</mat-icon>
                            <span>Capacity: {{ slot.capacity }}</span>
                          </div>
                          <div class="slot-bookings" *ngIf="slot._count?.bookings">
                            <mat-icon>event</mat-icon>
                            <span>Bookings: {{ slot._count?.bookings || 0 }}</span>
                          </div>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>
                
                <ng-template #noSlots>
                  <div class="empty-state">
                    <mat-icon class="empty-icon">schedule</mat-icon>
                    <h3>No Time Slots</h3>
                    <p>{{ 'services.noSlots' | translate }}</p>
                  </div>
                </ng-template>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>

        <div *ngIf="!loading && !service" class="error-state">
          <mat-icon class="error-icon">error</mat-icon>
          <h3>Service Not Found</h3>
          <p>The requested service could not be found.</p>
          <button mat-raised-button color="primary" routerLink="/services">
            Back to Services
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .service-details-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .details-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 32px;
    }

    .back-button {
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .header-content {
      flex: 1;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .service-subtitle {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 16px;
      color: var(--text-secondary);
    }

    .organization {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .duration {
      color: var(--primary-color);
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .header-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
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

    .tab-content {
      padding: 24px 0;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .info-card {
      height: fit-content;
    }

    .localized-names,
    .localized-descriptions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .name-item,
    .description-item {
      padding: 8px 0;
      border-bottom: 1px solid var(--divider-color);
    }

    .name-item:last-child,
    .description-item:last-child {
      border-bottom: none;
    }

    .name-item strong,
    .description-item strong {
      color: var(--text-primary);
      margin-right: 8px;
    }

    .no-description {
      color: var(--text-disabled);
      font-style: italic;
    }

    .service-details-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .detail-item mat-icon {
      color: var(--primary-color);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .detail-item .label {
      font-weight: 500;
      color: var(--text-primary);
      min-width: 100px;
    }

    .detail-item .value {
      color: var(--text-secondary);
    }

    .slots-header {
      margin-bottom: 24px;
    }

    .slots-header h3 {
      margin: 0 0 8px 0;
      color: var(--text-primary);
    }

    .slots-header p {
      margin: 0;
      color: var(--text-secondary);
    }

    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    .slot-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .slot-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .slot-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .slot-time,
    .slot-capacity,
    .slot-bookings {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
    }

    .slot-time mat-icon,
    .slot-capacity mat-icon,
    .slot-bookings mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--text-secondary);
    }

    .empty-state,
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
      gap: 16px;
    }

    .empty-icon,
    .error-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: var(--text-disabled);
    }

    .empty-state h3,
    .error-state h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.5rem;
      font-weight: 500;
    }

    .empty-state p,
    .error-state p {
      margin: 0;
      color: var(--text-secondary);
      max-width: 400px;
    }

    @media (max-width: 768px) {
      .service-details-container {
        padding: 16px;
      }

      .details-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .header-actions {
        justify-content: stretch;
      }

      .header-actions button {
        flex: 1;
        justify-content: center;
      }

      .details-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .slots-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  `]
})
export class ServiceDetailsComponent implements OnInit, OnDestroy {
  service: Service | null = null;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService,
    private i18nService: I18nService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadService();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadService(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const serviceId = +params['id'];
      if (serviceId) {
        this.loading = true;
        this.servicesService.getService(serviceId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (service) => {
              this.service = service;
              this.loading = false;
            },
            error: (error) => {
              console.error('Error loading service:', error);
              this.snackBar.open('Error loading service', 'Close', { duration: 3000 });
              this.router.navigate(['/services']);
              this.loading = false;
            }
          });
      }
    });
  }

  getLocalizedName(service: Service | null): string {
    if (!service) return '';
    const currentLang = this.i18nService.getCurrentLanguage();
    return this.servicesService.getLocalizedName(service, currentLang);
  }

  formatDuration(durationMin: number): string {
    return this.servicesService.formatDuration(durationMin);
  }

  formatSlotTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  deleteService(): void {
    if (!this.service) return;

    if (confirm(`Are you sure you want to delete "${this.getLocalizedName(this.service)}"?`)) {
      this.servicesService.deleteService(this.service.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Service deleted successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/services']);
          },
          error: (error) => {
            console.error('Error deleting service:', error);
            this.snackBar.open('Error deleting service', 'Close', { duration: 3000 });
          }
        });
    }
  }
}
