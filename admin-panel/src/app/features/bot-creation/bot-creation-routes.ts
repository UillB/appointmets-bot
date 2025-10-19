import { Routes } from '@angular/router';

export const botCreationRoutes: Routes = [
  {
    path: '',
    redirectTo: 'management',
    pathMatch: 'full'
  },
  {
    path: 'management',
    loadComponent: () => import('./bot-management/bot-management.component').then(m => m.BotManagementComponent)
  },
  {
    path: 'guide',
    loadComponent: () => import('./bot-creation-guide/bot-creation-guide.component').then(m => m.BotCreationGuideComponent)
  },
  {
    path: 'token-input',
    loadComponent: () => import('./bot-token-input/bot-token-input.component').then(m => m.BotTokenInputComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./bot-settings/bot-settings.component').then(m => m.BotSettingsComponent)
  },
  {
    path: 'webapp/:organizationId',
    loadComponent: () => import('./webapp-page/webapp-page.component').then(m => m.WebappPageComponent)
  },
  {
    path: 'post-creation-guide',
    loadComponent: () => import('./post-bot-creation-guide/post-bot-creation-guide.component').then(m => m.PostBotCreationGuideComponent)
  },
  {
    path: 'service-guide',
    loadComponent: () => import('./service-creation-guide/service-creation-guide.component').then(m => m.ServiceCreationGuideComponent)
  },
  {
    path: 'slots-guide',
    loadComponent: () => import('./slots-creation-guide/slots-creation-guide.component').then(m => m.SlotsCreationGuideComponent)
  }
];
