import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SystemSettingsComponent } from './system-settings/system-settings.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    TranslatePipe,
    UserProfileComponent,
    SystemSettingsComponent
  ],
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <div class="header-content">
          <div class="title-section">
            <mat-icon class="title-icon">settings</mat-icon>
            <div class="title-text">
              <h1>{{ 'settings.title' | translate }}</h1>
              <p>{{ 'settings.subtitle' | translate }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-content">
        <mat-card class="settings-card">
          <mat-tab-group class="settings-tabs" animationDuration="300ms">
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>person</mat-icon>
                <span>{{ 'settings.profile.title' | translate }}</span>
              </ng-template>
              <div class="tab-content">
                <app-user-profile></app-user-profile>
              </div>
            </mat-tab>
            
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>tune</mat-icon>
                <span>{{ 'settings.system.title' | translate }}</span>
              </ng-template>
              <div class="tab-content">
                <app-system-settings></app-system-settings>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .settings-header {
      margin-bottom: 32px;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .title-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
    }

    .title-text h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
      color: #2d3748;
      line-height: 1.2;
    }

    .title-text p {
      margin: 4px 0 0 0;
      font-size: 16px;
      color: #718096;
      line-height: 1.4;
    }

    .settings-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .settings-card {
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .settings-tabs {
      ::ng-deep {
        .mat-mdc-tab-group {
          .mat-mdc-tab-header {
            background: #667eea;
            border-radius: 0;
          }

          .mat-mdc-tab {
            color: rgba(255, 255, 255, 0.8);
            min-width: 200px;
            
            &.mdc-tab--active {
              color: white;
            }

            .mdc-tab__content {
              display: flex;
              align-items: center;
              gap: 8px;
              font-weight: 500;
            }

            mat-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
            }
          }

          .mat-mdc-tab-body-wrapper {
            background: white;
          }
        }
      }
    }

    .tab-content {
      padding: 32px;
      min-height: 500px;
    }

    @media (max-width: 768px) {
      .settings-container {
        padding: 16px;
      }

      .title-section {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .title-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }

      .title-text h1 {
        font-size: 28px;
      }

      .tab-content {
        padding: 24px 16px;
      }

      .settings-tabs {
        ::ng-deep {
          .mat-mdc-tab-group {
            .mat-mdc-tab {
              min-width: 150px;
              
              .mdc-tab__content {
                flex-direction: column;
                gap: 4px;
                font-size: 12px;
              }

              mat-icon {
                font-size: 18px;
                width: 18px;
                height: 18px;
              }
            }
          }
        }
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  @HostListener('window:universal-refresh')
  onUniversalRefresh() {
    console.log('🔄 Universal refresh triggered in SettingsComponent');
    // Settings page doesn't need to refresh data, but we can add a visual feedback
    console.log('Settings page refreshed');
  }
}
