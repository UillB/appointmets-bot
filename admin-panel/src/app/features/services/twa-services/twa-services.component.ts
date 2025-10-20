import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TelegramWebAppService } from '../../../core/services/telegram-webapp.service';
import { ServicesService, Service } from '../../../core/services/services.service';

@Component({
  selector: 'app-twa-services',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div *ngIf="!isAllowed" class="guard"><div class="center"><mat-icon>mobile_off</mat-icon><p>Доступно только в Telegram WebApp</p></div></div>
    <div *ngIf="isAllowed" class="container">
      <div *ngIf="loading" class="loading"><mat-spinner diameter="32"></mat-spinner></div>
      <div *ngIf="!loading" class="list">
        <div class="svc" *ngFor="let s of services">
          <div class="row top">
            <div class="name">{{ s.nameRu || s.name }}</div>
            <span class="duration">{{ s.durationMin }} мин</span>
          </div>
          <div class="row">
            <input [(ngModel)]="s.nameRu" placeholder="Название (RU)" />
          </div>
          <div class="row">
            <input type="number" [(ngModel)]="s.durationMin" placeholder="Длительность (мин)" />
          </div>
          <div class="row actions">
            <button mat-flat-button color="primary" (click)="save(s)">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .guard { padding:16px; }
    .center { display:flex; gap:8px; align-items:center; justify-content:center; color:#777; }
    .container { padding:12px; }
    .loading { display:flex; justify-content:center; padding:16px; }
    .list { display:flex; flex-direction:column; gap:8px; }
    .svc { background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; }
    .row { display:flex; gap:8px; align-items:center; }
    .row.top { justify-content:space-between; margin-bottom:6px; }
    input { flex:1; height:40px; border:1px solid #ddd; border-radius:8px; padding:0 10px; }
    .actions { justify-content:flex-end; }
    .duration { font-size:12px; color:#666; }
    @media (min-width: 769px) { .container { max-width: 480px; margin: 0 auto; } }
  `]
})
export class TwaServicesComponent implements OnInit {
  isAllowed = false;
  loading = false;
  services: Service[] = [];

  constructor(
    private tg: TelegramWebAppService,
    private servicesService: ServicesService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAllowed = this.tg.isInTelegram && (typeof window !== 'undefined' ? window.innerWidth <= 768 : true);
    this.reload();
  }

  reload() {
    if (!this.isAllowed) return;
    this.loading = true;
    this.servicesService.getServices().subscribe({
      next: (r) => { this.services = r.services || []; this.loading = false; },
      error: () => { this.loading = false; this.snack.open('Ошибка загрузки услуг', 'OK', { duration: 2000, panelClass: ['error-snackbar'] }); }
    });
  }

  save(s: Service) {
    this.servicesService.updateService(s.id, { nameRu: s.nameRu, durationMin: s.durationMin }).subscribe({
      next: () => { this.snack.open('Сохранено', 'OK', { duration: 1500, panelClass: ['success-snackbar'] }); },
      error: () => { this.snack.open('Ошибка сохранения', 'OK', { duration: 2000, panelClass: ['error-snackbar'] }); }
    });
  }
}


