import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesRoutingModule } from './services-routing-module';
import { ServicesListComponent } from './services-list/services-list.component';
import { ServiceFormComponent } from './service-form/service-form.component';
import { ServiceDetailsComponent } from './service-details/service-details.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    ServicesListComponent,
    ServiceFormComponent,
    ServiceDetailsComponent
  ]
})
export class ServicesModule { }
