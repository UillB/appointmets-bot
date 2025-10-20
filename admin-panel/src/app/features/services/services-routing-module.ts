import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { TelegramWebAppService } from '../../core/services/telegram-webapp.service';
import { ServicesListComponent } from './services-list/services-list.component';
import { ServiceFormComponent } from './service-form/service-form.component';
import { ServiceDetailsComponent } from './service-details/service-details.component';

const routes: Routes = [
  {
    path: '',
    component: ServicesListComponent
  },
  {
    path: 'twa',
    loadComponent: () => import('./twa-services/twa-services.component').then(m => m.TwaServicesComponent),
    canActivate: [() => {
      const tg = inject(TelegramWebAppService);
      const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : true;
      return tg.isInTelegram && isMobile;
    }]
  },
  {
    path: 'create',
    component: ServiceFormComponent
  },
  {
    path: ':id',
    component: ServiceDetailsComponent
  },
  {
    path: ':id/edit',
    component: ServiceFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
