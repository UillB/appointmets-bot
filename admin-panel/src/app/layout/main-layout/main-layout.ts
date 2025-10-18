import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';

import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    HeaderComponent,
    SidebarComponent
  ],
  template: `
    <mat-sidenav-container class="main-container">
      <mat-sidenav #sidenav mode="side" opened="true" class="sidebar">
        <app-sidebar (navigate)="onSidebarNavigate()"></app-sidebar>
      </mat-sidenav>
      
      <mat-sidenav-content class="main-content">
        <app-header 
          (toggleSidenav)="sidenav.toggle()"
          (toggleTheme)="onToggleTheme()">
        </app-header>
        
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .main-container {
      height: 100vh;
    }
    
    .sidebar {
      width: 280px;
    }
    
    .main-content {
      display: flex;
      flex-direction: column;
    }
    
    .content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }
    
    @media (max-width: 768px) {
      .content {
        padding: 16px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Subscribe to theme changes to update body class
    this.subscriptions.push(
      this.themeService.currentTheme$.subscribe(theme => {
        // Theme is already applied by ThemeService
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSidebarNavigate(): void {
    // Handle sidebar navigation if needed
  }

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
