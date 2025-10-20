import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentsListComponent } from './appointments-list/appointments-list.component';
import { inject } from '@angular/core';
import { TelegramWebAppService } from '../../core/services/telegram-webapp.service';

const routes: Routes = [
  {
    path: '',
    component: AppointmentsListComponent
  },
  {
    path: 'twa',
    loadComponent: () => import('./twa-appointments/twa-appointments.component').then(m => m.TwaAppointmentsComponent),
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
export class AppointmentsRoutingModule { }
