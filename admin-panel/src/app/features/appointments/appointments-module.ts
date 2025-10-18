import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentsRoutingModule } from './appointments-routing-module';
import { AppointmentsListComponent } from './appointments-list/appointments-list.component';
import { AppointmentDetailsComponent } from './appointment-details/appointment-details.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AppointmentsRoutingModule,
    AppointmentsListComponent,
    AppointmentDetailsComponent,
    AppointmentFormComponent
  ]
})
export class AppointmentsModule { }
