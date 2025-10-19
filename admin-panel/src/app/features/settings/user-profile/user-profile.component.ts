import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

import { AuthService, User } from '../../../core/services/auth';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    TranslatePipe
  ],
  template: `
    <div class="user-profile-container">
      <!-- Profile Information Card -->
      <mat-card class="profile-card">
        <mat-card-header>
          <div mat-card-avatar class="profile-avatar">
            <mat-icon>account_circle</mat-icon>
          </div>
          <mat-card-title>{{ 'settings.profile.title' | translate }}</mat-card-title>
          <mat-card-subtitle>{{ 'settings.profile.subtitle' | translate }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="profile-info" *ngIf="currentUser">
            <div class="info-grid">
              <div class="info-item">
                <mat-icon class="info-icon">person</mat-icon>
                <div class="info-content">
                  <span class="info-label">{{ 'settings.profile.name' | translate }}</span>
                  <span class="info-value">{{ currentUser.name }}</span>
                </div>
              </div>

              <div class="info-item">
                <mat-icon class="info-icon">email</mat-icon>
                <div class="info-content">
                  <span class="info-label">{{ 'settings.profile.email' | translate }}</span>
                  <span class="info-value">{{ currentUser.email }}</span>
                </div>
              </div>

              <div class="info-item">
                <mat-icon class="info-icon">admin_panel_settings</mat-icon>
                <div class="info-content">
                  <span class="info-label">{{ 'settings.profile.role' | translate }}</span>
                  <mat-chip class="role-chip" [class]="'role-' + currentUser.role.toLowerCase()">
                    {{ currentUser.role }}
                  </mat-chip>
                </div>
              </div>

              <div class="info-item" *ngIf="currentUser.organization">
                <mat-icon class="info-icon">business</mat-icon>
                <div class="info-content">
                  <span class="info-label">{{ 'settings.profile.organization' | translate }}</span>
                  <span class="info-value">{{ currentUser.organization.name }}</span>
                </div>
              </div>

              <div class="info-item">
                <mat-icon class="info-icon">calendar_today</mat-icon>
                <div class="info-content">
                  <span class="info-label">{{ 'settings.profile.createdAt' | translate }}</span>
                  <span class="info-value">{{ 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Edit Profile Form -->
      <mat-card class="edit-profile-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>edit</mat-icon>
            {{ 'settings.profile.updateProfile' | translate }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="profile-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'settings.profile.name' | translate }}</mat-label>
                <input matInput formControlName="name" [placeholder]="'settings.profile.name' | translate">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="profileForm.get('name')?.hasError('required')">
                  {{ 'settings.profile.name' | translate }} {{ 'common.required' | translate }}
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'settings.profile.email' | translate }}</mat-label>
                <input matInput formControlName="email" type="email" [placeholder]="'settings.profile.email' | translate">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                  {{ 'settings.profile.email' | translate }} {{ 'common.required' | translate }}
                </mat-error>
                <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                  {{ 'common.invalidEmail' | translate }}
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-raised-button 
                      color="primary" 
                      type="submit" 
                      [disabled]="profileForm.invalid || isUpdatingProfile"
                      class="update-button">
                <mat-spinner *ngIf="isUpdatingProfile" diameter="20" class="button-spinner"></mat-spinner>
                <mat-icon *ngIf="!isUpdatingProfile">save</mat-icon>
                {{ 'settings.profile.updateProfile' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Change Password Form -->
      <mat-card class="change-password-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>lock</mat-icon>
            {{ 'settings.profile.changePassword' | translate }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="password-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'settings.profile.currentPassword' | translate }}</mat-label>
                <input matInput 
                       formControlName="currentPassword" 
                       type="password" 
                       [placeholder]="'settings.profile.currentPassword' | translate">
                <mat-icon matSuffix>lock</mat-icon>
                <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                  {{ 'settings.profile.currentPassword' | translate }} {{ 'common.required' | translate }}
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'settings.profile.newPassword' | translate }}</mat-label>
                <input matInput 
                       formControlName="newPassword" 
                       type="password" 
                       [placeholder]="'settings.profile.newPassword' | translate">
                <mat-icon matSuffix>lock_outline</mat-icon>
                <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                  {{ 'settings.profile.newPassword' | translate }} {{ 'common.required' | translate }}
                </mat-error>
                <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                  {{ 'settings.password.weak' | translate }}
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'settings.profile.confirmPassword' | translate }}</mat-label>
                <input matInput 
                       formControlName="confirmPassword" 
                       type="password" 
                       [placeholder]="'settings.profile.confirmPassword' | translate">
                <mat-icon matSuffix>lock_outline</mat-icon>
                <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                  {{ 'settings.profile.confirmPassword' | translate }} {{ 'common.required' | translate }}
                </mat-error>
                <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
                  {{ 'settings.password.mismatch' | translate }}
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-raised-button 
                      color="accent" 
                      type="submit" 
                      [disabled]="passwordForm.invalid || isUpdatingPassword"
                      class="update-button">
                <mat-spinner *ngIf="isUpdatingPassword" diameter="20" class="button-spinner"></mat-spinner>
                <mat-icon *ngIf="!isUpdatingPassword">lock_reset</mat-icon>
                {{ 'settings.profile.updatePassword' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .user-profile-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .profile-card,
    .edit-profile-card,
    .change-password-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .profile-avatar {
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      
      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }

    .profile-info {
      margin-top: 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .info-icon {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-size: 12px;
      color: #718096;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 16px;
      color: #2d3748;
      font-weight: 600;
    }

    .role-chip {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      &.role-super_admin {
        background-color: #e53e3e;
        color: white;
      }
      
      &.role-owner {
        background-color: #3182ce;
        color: white;
      }
      
      &.role-manager {
        background-color: #38a169;
        color: white;
      }
    }

    .profile-form,
    .password-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .update-button {
      min-width: 160px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .button-spinner {
      margin-right: 8px;
    }

    mat-card-header {
      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #2d3748;
        font-weight: 600;
        
        mat-icon {
          color: #667eea;
        }
      }
      
      mat-card-subtitle {
        color: #718096;
        margin-top: 4px;
      }
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 12px;
      }

      .form-actions {
        justify-content: center;
      }

      .update-button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isUpdatingProfile = false;
  isUpdatingPassword = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.profileForm.patchValue({
            name: user.name,
            email: user.email
          });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  onUpdateProfile(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isUpdatingProfile = true;
      
      // Simulate API call
      setTimeout(() => {
        this.isUpdatingProfile = false;
        this.snackBar.open(
          this.translate('settings.profile.success'),
          'Close',
          { duration: 3000 }
        );
      }, 1000);
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      this.isUpdatingPassword = true;
      
      // Simulate API call
      setTimeout(() => {
        this.isUpdatingPassword = false;
        this.passwordForm.reset();
        this.snackBar.open(
          this.translate('settings.password.success'),
          'Close',
          { duration: 3000 }
        );
      }, 1000);
    }
  }

  private translate(key: string): string {
    // This would normally use the I18nService
    const translations: { [key: string]: string } = {
      'settings.profile.success': 'Profile updated successfully',
      'settings.password.success': 'Password updated successfully'
    };
    return translations[key] || key;
  }
}
