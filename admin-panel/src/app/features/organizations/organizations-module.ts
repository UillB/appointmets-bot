import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationsRoutingModule } from './organizations-routing-module';
import { OrganizationsListComponent } from './organizations-list/organizations-list.component';
import { OrganizationFormComponent } from './organization-form/organization-form.component';
import { OrganizationDetailsComponent } from './organization-details/organization-details.component';

@NgModule({
  imports: [
    CommonModule,
    OrganizationsRoutingModule,
    OrganizationsListComponent,
    OrganizationFormComponent,
    OrganizationDetailsComponent
  ]
})
export class OrganizationsModule { }