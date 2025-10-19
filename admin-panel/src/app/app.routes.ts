import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DashboardModule),
    canActivate: [authGuard]
  },
  {
    path: 'organizations',
    loadChildren: () => import('./features/organizations/organizations-module').then(m => m.OrganizationsModule),
    canActivate: [authGuard]
  },
  {
    path: 'services',
    loadChildren: () => import('./features/services/services-module').then(m => m.ServicesModule),
    canActivate: [authGuard]
  },
  {
    path: 'appointments',
    loadChildren: () => import('./features/appointments/appointments-module').then(m => m.AppointmentsModule),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings-module').then(m => m.SettingsModule),
    canActivate: [authGuard]
  },
  {
    path: 'bot-management',
    loadChildren: () => import('./features/bot-creation/bot-creation-module').then(m => m.BotCreationModule),
    canActivate: [authGuard]
  },
  {
    path: 'slots',
    loadChildren: () => import('./features/slots/slots-module').then(m => m.SlotsModule),
    canActivate: [authGuard]
  },
  {
    path: 'ai-config',
    loadChildren: () => import('./features/ai-config/ai-config-module').then(m => m.AIConfigModule),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
