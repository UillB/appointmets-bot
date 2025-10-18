import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { Subscription } from 'rxjs';

import { I18nService, Language } from '../../../core/services/i18n.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSliderModule,
    TranslatePipe
  ],
  template: `
    <div class="system-settings-container">
      <!-- Language & Theme Settings -->
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>language</mat-icon>
            {{ 'settings.system.language' | translate }} & {{ 'settings.system.theme' | translate }}
          </mat-card-title>
          <mat-card-subtitle>{{ 'settings.system.subtitle' | translate }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="systemForm" (ngSubmit)="onSaveSettings()" class="system-form">
            <div class="form-section">
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'settings.system.language' | translate }}</mat-label>
                  <mat-select formControlName="language" (selectionChange)="onLanguageChange($event.value)">
                    <mat-option *ngFor="let lang of availableLanguages" [value]="lang.code">
                      {{ lang.flag }} {{ lang.name }}
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>language</mat-icon>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'settings.system.theme' | translate }}</mat-label>
                  <mat-select formControlName="theme" (selectionChange)="onThemeChange($event.value)">
                    <mat-option value="light">
                      <mat-icon>light_mode</mat-icon>
                      {{ 'theme.light' | translate }}
                    </mat-option>
                    <mat-option value="dark">
                      <mat-icon>dark_mode</mat-icon>
                      {{ 'theme.dark' | translate }}
                    </mat-option>
                    <mat-option value="auto">
                      <mat-icon>brightness_auto</mat-icon>
                      {{ 'theme.auto' | translate }}
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>palette</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <mat-divider class="section-divider"></mat-divider>

            <!-- Notification Settings -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>notifications</mat-icon>
                {{ 'settings.system.notifications' | translate }}
              </h3>

              <div class="toggle-row">
                <div class="toggle-item">
                  <div class="toggle-content">
                    <mat-icon class="toggle-icon">email</mat-icon>
                    <div class="toggle-text">
                      <span class="toggle-label">{{ 'settings.system.emailNotifications' | translate }}</span>
                      <span class="toggle-description">Receive notifications via email</span>
                    </div>
                  </div>
                  <mat-slide-toggle formControlName="emailNotifications"></mat-slide-toggle>
                </div>

                <div class="toggle-item">
                  <div class="toggle-content">
                    <mat-icon class="toggle-icon">notifications_active</mat-icon>
                    <div class="toggle-text">
                      <span class="toggle-label">{{ 'settings.system.pushNotifications' | translate }}</span>
                      <span class="toggle-description">Receive push notifications in browser</span>
                    </div>
                  </div>
                  <mat-slide-toggle formControlName="pushNotifications"></mat-slide-toggle>
                </div>
              </div>
            </div>

            <mat-divider class="section-divider"></mat-divider>

            <!-- System Preferences -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>tune</mat-icon>
                System Preferences
              </h3>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'settings.system.timezone' | translate }}</mat-label>
                  <mat-select formControlName="timezone">
                    <mat-option value="UTC">UTC</mat-option>
                    <mat-option value="Europe/Moscow">Europe/Moscow</mat-option>
                    <mat-option value="Asia/Jerusalem">Asia/Jerusalem</mat-option>
                    <mat-option value="America/New_York">America/New_York</mat-option>
                    <mat-option value="America/Los_Angeles">America/Los_Angeles</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>schedule</mat-icon>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>{{ 'settings.system.dateFormat' | translate }}</mat-label>
                  <mat-select formControlName="dateFormat">
                    <mat-option value="MM/DD/YYYY">MM/DD/YYYY</mat-option>
                    <mat-option value="DD/MM/YYYY">DD/MM/YYYY</mat-option>
                    <mat-option value="YYYY-MM-DD">YYYY-MM-DD</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>date_range</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>{{ 'settings.system.timeFormat' | translate }}</mat-label>
                  <mat-select formControlName="timeFormat">
                    <mat-option value="12h">12 Hour (AM/PM)</mat-option>
                    <mat-option value="24h">24 Hour</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>access_time</mat-icon>
                </mat-form-field>
              </div>

              <div class="slider-row">
                <div class="slider-content">
                  <mat-icon class="slider-icon">refresh</mat-icon>
                  <div class="slider-text">
                    <span class="slider-label">{{ 'settings.system.autoRefresh' | translate }}</span>
                    <span class="slider-description">{{ 'settings.system.refreshInterval' | translate }}</span>
                  </div>
                </div>
                <div class="slider-control">
                  <mat-slider 
                    formControlName="refreshInterval"
                    min="30"
                    max="300"
                    step="30"
                    discrete
                    [displayWith]="formatRefreshInterval">
                    <input matSliderThumb>
                  </mat-slider>
                  <span class="slider-value">{{ formatRefreshInterval(systemForm.get('refreshInterval')?.value) }}</span>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button mat-raised-button 
                      color="primary" 
                      type="submit" 
                      [disabled]="isSavingSettings"
                      class="save-button">
                <mat-spinner *ngIf="isSavingSettings" diameter="20" class="button-spinner"></mat-spinner>
                <mat-icon *ngIf="!isSavingSettings">save</mat-icon>
                {{ 'settings.system.saveSettings' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .system-settings-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .settings-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .system-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #2d3748;
      font-size: 18px;
      font-weight: 600;
      
      mat-icon {
        color: #667eea;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .section-divider {
      margin: 16px 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      flex: 1;
    }

    .half-width {
      flex: 1;
    }

    .toggle-row {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .toggle-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .toggle-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toggle-icon {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .toggle-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .toggle-label {
      font-size: 16px;
      font-weight: 500;
      color: #2d3748;
    }

    .toggle-description {
      font-size: 14px;
      color: #718096;
    }

    .slider-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .slider-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .slider-icon {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .slider-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .slider-label {
      font-size: 16px;
      font-weight: 500;
      color: #2d3748;
    }

    .slider-description {
      font-size: 14px;
      color: #718096;
    }

    .slider-control {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 200px;
    }

    .slider-value {
      font-size: 14px;
      font-weight: 500;
      color: #667eea;
      min-width: 40px;
      text-align: right;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .save-button {
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

    mat-option {
      display: flex;
      align-items: center;
      gap: 8px;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 12px;
      }

      .toggle-item,
      .slider-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .slider-control {
        width: 100%;
        min-width: auto;
      }

      .form-actions {
        justify-content: center;
      }

      .save-button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class SystemSettingsComponent implements OnInit, OnDestroy {
  systemForm: FormGroup;
  availableLanguages: { code: Language; name: string; flag: string }[] = [];
  isSavingSettings = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private i18nService: I18nService,
    private themeService: ThemeService,
    private snackBar: MatSnackBar
  ) {
    this.systemForm = this.fb.group({
      language: ['en'],
      theme: ['light'],
      emailNotifications: [true],
      pushNotifications: [true],
      timezone: ['UTC'],
      dateFormat: ['MM/DD/YYYY'],
      timeFormat: ['12h'],
      refreshInterval: [60]
    });
  }

  ngOnInit(): void {
    this.availableLanguages = this.i18nService.getAvailableLanguages();

    this.subscriptions.push(
      this.i18nService.currentLanguage$.subscribe(lang => {
        this.systemForm.patchValue({ language: lang });
      })
    );

    this.subscriptions.push(
      this.themeService.currentTheme$.subscribe(theme => {
        this.systemForm.patchValue({ theme });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onLanguageChange(language: Language): void {
    this.i18nService.setLanguage(language);
  }

  onThemeChange(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  formatRefreshInterval(value: number): string {
    if (value < 60) {
      return `${value}s`;
    } else {
      const minutes = Math.floor(value / 60);
      return `${minutes}m`;
    }
  }

  onSaveSettings(): void {
    this.isSavingSettings = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isSavingSettings = false;
      this.snackBar.open(
        this.translate('settings.system.success'),
        'Close',
        { duration: 3000 }
      );
    }, 1000);
  }

  private translate(key: string): string {
    // This would normally use the I18nService
    const translations: { [key: string]: string } = {
      'settings.system.success': 'Settings saved successfully'
    };
    return translations[key] || key;
  }
}
