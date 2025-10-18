import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationsListComponent } from './organizations-list/organizations-list.component';
import { OrganizationDetailsComponent } from './organization-details/organization-details.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationsListComponent
  },
  {
    path: 'new',
    component: OrganizationDetailsComponent,
    data: { isNew: true }
  },
  {
    path: ':id',
    component: OrganizationDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationsRoutingModule { }