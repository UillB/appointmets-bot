import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter, Subscription } from 'rxjs';

import { SidebarComponent } from '../sidebar/sidebar';
import { ThemeService } from '../../core/services/theme.service';
import { UniversalHeaderComponent } from '../../shared/components/universal-header/universal-header.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponent,
    UniversalHeaderComponent
  ],
  template: `
    <mat-sidenav-container class="main-container" [hasBackdrop]="isMobile">
      <mat-sidenav 
        #sidenav 
        class="sidebar"
        [mode]="isMobile ? 'over' : 'side'"
        [opened]="!isMobile"
        (backdropClick)="closeOnBackdrop()">
        <app-sidebar (navigate)="onSidebarNavigate()"></app-sidebar>
      </mat-sidenav>
      
      <mat-sidenav-content class="main-content">
        <!-- Universal Header -->
        <app-universal-header></app-universal-header>
        
        <!-- Mobile Header -->
        <div class="mobile-header" *ngIf="isMobile">
          <button mat-icon-button (click)="toggleSidenav()" class="menu-btn">
            <mat-icon>menu</mat-icon>
          </button>
          <h1 class="mobile-title">Appointments</h1>
          <div class="mobile-spacer"></div>
        </div>
        
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .main-container { 
      height: 100vh; 
      background: #fafafa;
    }
    .sidebar { 
      width: 256px; 
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    }
    .main-content { 
      display: flex; 
      flex-direction: column; 
      background: #fafafa;
    }
    .content { 
      flex: 1; 
      padding: 0; 
      overflow-y: auto; 
      background: #fafafa;
      padding-top: 80px; /* Отступ для фиксированного хедера */
    }
    .mobile-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .menu-btn {
      color: #4F46E5;
    }
    .mobile-title {
      flex: 1;
      margin: 0 0 0 16px;
      font-size: 18px;
      font-weight: 600;
      color: #0F172A;
    }
    .mobile-spacer {
      width: 48px;
    }
    @media (max-width: 768px) { 
      .content { padding: 0; } 
      .sidebar { width: 100%; }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  private subscriptions: Subscription[] = [];
  isMobile = false;

  constructor(private themeService: ThemeService, private router: Router) {}

  ngOnInit(): void {
    this.isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const resizeHandler = () => { this.isMobile = window.innerWidth <= 768; };
    window.addEventListener('resize', resizeHandler);
    const resizeSub = new Subscription();
    resizeSub.add(() => window.removeEventListener('resize', resizeHandler));
    this.subscriptions.push(resizeSub);

    // Auto-close on route change for mobile
    this.subscriptions.push(
      this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
        if (this.isMobile && this.sidenav?.opened) {
          this.sidenav.close();
        }
      })
    );

    this.subscriptions.push(
      this.themeService.currentTheme$.subscribe(() => {})
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSidenav(): void {
    if (this.isMobile) {
      this.sidenav.toggle();
    } else {
      this.sidenav.open();
    }
  }

  closeOnBackdrop(): void {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  onSidebarNavigate(): void {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
