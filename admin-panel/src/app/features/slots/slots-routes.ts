import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { TelegramWebAppService } from '../../core/services/telegram-webapp.service';

export const slotsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'management',
    pathMatch: 'full'
  },
  {
    path: 'management',
    loadComponent: () => import('./slots-management/slots-management.component').then(m => m.SlotsManagementComponent)
  },
  {
    path: 'twa',
    loadComponent: () => import('./twa-slots/twa-slots.component').then(m => m.TwaSlotsComponent),
    canActivate: [() => {
      const tg = inject(TelegramWebAppService);
      const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : true;
      return tg.isInTelegram && isMobile;
    }]
  }
];
