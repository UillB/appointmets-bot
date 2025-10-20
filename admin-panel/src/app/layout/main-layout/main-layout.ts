import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter, Subscription } from 'rxjs';

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
        <app-header 
          (toggleSidenav)="toggleSidenav()"
          (toggleTheme)="onToggleTheme()">
        </app-header>
        
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .main-container { height: 100vh; }
    .sidebar { width: 280px; }
    .main-content { display: flex; flex-direction: column; }
    .content { flex: 1; padding: 24px; overflow-y: auto; }
    @media (max-width: 768px) { .content { padding: 12px; } }
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
