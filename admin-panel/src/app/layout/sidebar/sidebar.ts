import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil, filter } from 'rxjs';


@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentRoute = '';

  menuItems = [
    {
      title: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      badge: null
    },
    {
      title: 'Appointments',
      icon: 'event',
      route: '/appointments',
      badge: null
    },
    {
      title: 'Services',
      icon: 'build',
      route: '/services',
      badge: null
    },
    {
      title: 'Organizations',
      icon: 'business',
      route: '/organizations',
      badge: null
    },
    {
      title: 'Bot Management',
      icon: 'smart_toy',
      route: '/bot-management',
      badge: null
    },
    {
      title: 'Slots',
      icon: 'schedule',
      route: '/slots',
      badge: null
    },
    {
      title: 'AI Assistant',
      icon: 'psychology',
      route: '/ai-config',
      badge: null
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/settings',
      badge: null
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Отслеживаем изменения маршрута
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });

    // Устанавливаем текущий маршрут
    this.currentRoute = this.router.url;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route;
  }

  getRouteClass(route: string): string {
    return this.isActiveRoute(route) ? 'active' : '';
  }
}
