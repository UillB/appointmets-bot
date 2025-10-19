import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { ServicesService, Service, CreateServiceRequest, UpdateServiceRequest } from '../../../core/services/services.service';
import { OrganizationsService, Organization } from '../../../core/services/organizations.service';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    TranslatePipe
  ],
  template: `
    <div class="service-form-container">
      <div class="form-header">
        <button mat-icon-button routerLink="/services" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? ('services.edit' | translate) : ('services.create' | translate) }}</h1>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()">
            <mat-tab-group>
              <!-- Basic Information Tab -->
              <mat-tab [label]="'Basic Information'">
                <div class="tab-content">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>{{ 'services.name' | translate }}</mat-label>
                      <input matInput formControlName="name" placeholder="Service name">
                      <mat-error *ngIf="serviceForm.get('name')?.hasError('required')">
                        Name is required
                      </mat-error>
                      <mat-error *ngIf="serviceForm.get('name')?.hasError('minlength')">
                        Name must be at least 2 characters
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>{{ 'services.durationMin' | translate }}</mat-label>
                      <input matInput type="number" formControlName="durationMin" placeholder="30">
                      <mat-error *ngIf="serviceForm.get('durationMin')?.hasError('required')">
                        Duration is required
                      </mat-error>
                      <mat-error *ngIf="serviceForm.get('durationMin')?.hasError('min')">
                        Duration must be at least 5 minutes
                      </mat-error>
                      <mat-error *ngIf="serviceForm.get('durationMin')?.hasError('max')">
                        Duration cannot exceed 480 minutes
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width" *ngIf="isSuperAdmin">
                      <mat-label>{{ 'services.organization' | translate }}</mat-label>
                      <mat-select formControlName="organizationId">
                        <mat-option *ngFor="let org of organizations" [value]="org.id">
                          {{ org.name }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>{{ 'services.description' | translate }}</mat-label>
                      <textarea matInput formControlName="description" rows="3" placeholder="Service description"></textarea>
                    </mat-form-field>
                  </div>
                </div>
              </mat-tab>

              <!-- Localized Names Tab -->
              <mat-tab [label]="'Localized Names'">
                <div class="tab-content">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>{{ 'services.nameRu' | translate }}</mat-label>
                      <input matInput formControlName="nameRu" [placeholder]="'services.nameRu' | translate">
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>{{ 'services.nameEn' | translate }}</mat-label>
                      <input matInput formControlName="nameEn" placeholder="Service name in English">
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>{{ 'services.nameHe' | translate }}</mat-label>
                      <input matInput formControlName="nameHe" placeholder="שם השירות בעברית">
                    </mat-form-field>
                  </div>
                </div>
              </mat-tab>

              <!-- Localized Descriptions Tab -->
              <mat-tab [label]="'Localized Descriptions'">
                <div class="tab-content">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>{{ 'services.descriptionRu' | translate }}</mat-label>
                      <textarea matInput formControlName="descriptionRu" rows="3" [placeholder]="'services.descriptionRu' | translate"></textarea>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>{{ 'services.descriptionEn' | translate }}</mat-label>
                      <textarea matInput formControlName="descriptionEn" rows="3" placeholder="Service description in English"></textarea>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>{{ 'services.descriptionHe' | translate }}</mat-label>
                      <textarea matInput formControlName="descriptionHe" rows="3" placeholder="תיאור השירות בעברית"></textarea>
                    </mat-form-field>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>

            <div class="form-actions">
              <button 
                mat-button 
                type="button" 
                routerLink="/services"
                [disabled]="loading">
                {{ 'common.cancel' | translate }}
              </button>
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="serviceForm.invalid || loading">
                <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                <mat-icon *ngIf="!loading">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                <span *ngIf="!loading">{{ isEditMode ? ('common.update' | translate) : ('common.create' | translate) }}</span>
                <span *ngIf="loading">{{ isEditMode ? 'Обновление...' : 'Создание...' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .service-form-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .form-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .back-button {
      color: var(--text-secondary);
    }

    .form-header h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .form-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .tab-content {
      padding: 24px 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      flex: 1;
    }

    .half-width {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding: 24px 0 0 0;
      border-top: 1px solid var(--divider-color);
      margin-top: 24px;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
    }

    mat-form-field {
      width: 100%;
    }

    mat-tab-group {
      margin-bottom: 24px;
    }

    @media (max-width: 768px) {
      .service-form-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .half-width {
        flex: 1;
      }

      .form-actions {
        flex-direction: column-reverse;
        gap: 12px;
      }

      .form-actions button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ServiceFormComponent implements OnInit, OnDestroy {
  serviceForm: FormGroup;
  isEditMode = false;
  serviceId: number | null = null;
  loading = false;
  organizations: Organization[] = [];
  isSuperAdmin = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService,
    private organizationsService: OrganizationsService,
    private i18nService: I18nService,
    private snackBar: MatSnackBar
  ) {
    this.serviceForm = this.createForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.loadOrganizations();
    this.checkSuperAdminStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      nameRu: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      nameEn: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      nameHe: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      descriptionRu: ['', [Validators.maxLength(500)]],
      descriptionEn: ['', [Validators.maxLength(500)]],
      descriptionHe: ['', [Validators.maxLength(500)]],
      durationMin: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      organizationId: [null]
    });
  }

  private checkEditMode(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.serviceId = +params['id'];
        this.loadService();
      }
    });
  }

  private loadService(): void {
    if (!this.serviceId) return;

    this.loading = true;
    this.servicesService.getService(this.serviceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (service) => {
          this.serviceForm.patchValue({
            name: service.name,
            nameRu: service.nameRu || '',
            nameEn: service.nameEn || '',
            nameHe: service.nameHe || '',
            description: service.description || '',
            descriptionRu: service.descriptionRu || '',
            descriptionEn: service.descriptionEn || '',
            descriptionHe: service.descriptionHe || '',
            durationMin: service.durationMin,
            organizationId: service.organizationId
          });
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

  private loadOrganizations(): void {
    this.organizationsService.getOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.organizations = response.organizations;
        },
        error: (error) => {
          console.error('Error loading organizations:', error);
        }
      });
  }

  private checkSuperAdminStatus(): void {
    this.organizationsService.isSuperAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isSuperAdmin => {
        this.isSuperAdmin = isSuperAdmin;
        if (!isSuperAdmin) {
          // For non-super admins, set their organization ID
          const currentOrgs = this.organizationsService.getCurrentOrganizations();
          if (currentOrgs.length > 0) {
            this.serviceForm.patchValue({ organizationId: currentOrgs[0].id });
          }
        }
      });
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.serviceForm.value;

    if (this.isEditMode && this.serviceId) {
      const updateData: UpdateServiceRequest = {
        name: formValue.name,
        nameRu: formValue.nameRu || undefined,
        nameEn: formValue.nameEn || undefined,
        nameHe: formValue.nameHe || undefined,
        description: formValue.description || undefined,
        descriptionRu: formValue.descriptionRu || undefined,
        descriptionEn: formValue.descriptionEn || undefined,
        descriptionHe: formValue.descriptionHe || undefined,
        durationMin: formValue.durationMin
      };

      this.servicesService.updateService(this.serviceId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Service updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/services']);
          },
          error: (error) => {
            console.error('Error updating service:', error);
            this.snackBar.open('Error updating service', 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
    } else {
      const createData: CreateServiceRequest = {
        name: formValue.name,
        nameRu: formValue.nameRu || undefined,
        nameEn: formValue.nameEn || undefined,
        nameHe: formValue.nameHe || undefined,
        description: formValue.description || undefined,
        descriptionRu: formValue.descriptionRu || undefined,
        descriptionEn: formValue.descriptionEn || undefined,
        descriptionHe: formValue.descriptionHe || undefined,
        durationMin: formValue.durationMin,
        organizationId: this.isSuperAdmin ? formValue.organizationId : undefined
      };

      this.servicesService.createService(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Service created successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/services']);
          },
          error: (error) => {
            console.error('Error creating service:', error);
            this.snackBar.open('Error creating service', 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
    }
  }
}
