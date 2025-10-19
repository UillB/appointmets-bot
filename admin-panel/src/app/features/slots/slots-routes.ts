import { Routes } from '@angular/router';

export const slotsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'management',
    pathMatch: 'full'
  },
  {
    path: 'management',
    loadComponent: () => import('./slots-management/slots-management.component').then(m => m.SlotsManagementComponent)
  }
];
