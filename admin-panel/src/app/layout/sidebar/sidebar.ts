import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil, filter } from 'rxjs';

import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatBadgeModule,
    TranslatePipe
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentRoute = '';

  menuItems = [
    {
      title: 'nav.dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      badge: null
    },
    {
      title: 'nav.appointments',
      icon: 'event',
      route: '/appointments',
      badge: null
    },
    {
      title: 'nav.services',
      icon: 'build',
      route: '/services',
      badge: null
    },
    {
      title: 'nav.organizations',
      icon: 'business',
      route: '/organizations',
      badge: null
    },
    {
      title: 'nav.settings',
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
