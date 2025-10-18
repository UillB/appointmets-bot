import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicesListComponent } from './services-list/services-list.component';
import { ServiceFormComponent } from './service-form/service-form.component';
import { ServiceDetailsComponent } from './service-details/service-details.component';

const routes: Routes = [
  {
    path: '',
    component: ServicesListComponent
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
