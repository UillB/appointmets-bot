import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TelegramWebappComponent } from '../telegram-webapp/telegram-webapp.component';

@Component({
  selector: 'app-webapp-page',
  imports: [
    CommonModule,
    TelegramWebappComponent
  ],
  template: `
    <div class="webapp-page">
      <app-telegram-webapp 
        [organizationId]="organizationId"
        (webappReady)="onWebappReady()">
      </app-telegram-webapp>
    </div>
  `,
  styles: [`
    .webapp-page {
      min-height: 100vh;
      background-color: #ffffff;
    }
  `]
})
export class WebappPageComponent implements OnInit {
  organizationId = 1;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Получаем organizationId из параметров маршрута
    this.route.params.subscribe(params => {
      if (params['organizationId']) {
        this.organizationId = parseInt(params['organizationId']);
      }
    });
  }

  onWebappReady(): void {
    console.log('Telegram WebApp ready');
  }
}
