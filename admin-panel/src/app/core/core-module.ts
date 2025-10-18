import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { CoreRoutingModule } from './core-routing-module';
import { AuthService } from './services/auth';
import { ApiService } from './services/api';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CoreRoutingModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    ApiService
  ]
})
export class CoreModule { }
