import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { inject } from '@angular/core';
import { TelegramWebAppService } from '../../core/services/telegram-webapp.service';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'twa',
    loadComponent: () => import('./twa-dashboard/twa-dashboard.component').then(m => m.TwaDashboardComponent),
    canActivate: [() => {
      const tg = inject(TelegramWebAppService);
      const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : true;
      return tg.isInTelegram && isMobile;
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
