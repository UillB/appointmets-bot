import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TelegramWebAppService } from '../../../core/services/telegram-webapp.service';
import { SlotsService } from '../../../core/services/slots.service';
import { ServicesService, Service } from '../../../core/services/services.service';
import { AuthService } from '../../../core/services/auth';
import { Slot } from '../../../shared/models/api.models';

@Component({
  selector: 'app-twa-slots',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div *ngIf="!isAllowed" class="guard">
      <div class="center"><mat-icon>mobile_off</mat-icon><p>Доступно только в Telegram WebApp</p></div>
    </div>

    <div *ngIf="isAllowed" class="container">
      <div class="filters">
        <select [(ngModel)]="serviceId" (change)="reload()">
          <option [ngValue]="undefined">Все услуги</option>
          <option *ngFor="let s of services" [ngValue]="s.id">{{ s.nameRu || s.name }}</option>
        </select>
        <input type="date" [(ngModel)]="date" (change)="reload()" />
      </div>

      <div class="toolbar">
        <button mat-stroked-button (click)="openQuickGenerate()"><mat-icon>bolt</mat-icon> Быстрая генерация</button>
        <button mat-stroked-button color="warn" (click)="deleteEmpty()"><mat-icon>delete</mat-icon> Удалить пустые</button>
      </div>

      <div *ngIf="loading" class="loading"><mat-spinner diameter="32"></mat-spinner></div>

      <div *ngIf="!loading" class="list">
        <div class="slot" *ngFor="let s of slots">
          <div class="row">
            <span class="service">{{ s.service?.nameRu || s.service?.name }}</span>
            <span class="status" [class.booked]="s.isBooked" [class.conflict]="s.hasConflict">{{ s.status }}</span>
          </div>
          <div class="row small">{{ toDate(s.startAt) }} · {{ toTime(s.startAt) }}–{{ toTime(s.endAt) }}</div>
          <div class="row small">Вместимость: {{ s.capacity }} | Брони: {{ s.bookings?.length || 0 }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .guard { padding:16px; }
    .center { display:flex; gap:8px; align-items:center; justify-content:center; color:#777; }
    .container { padding: 12px; }
    .filters { display:flex; gap:8px; margin-bottom:12px; }
    select, input[type=date] { flex:1; height:40px; border:1px solid #ddd; border-radius:8px; padding:0 8px; }
    .toolbar { display:flex; gap:8px; margin-bottom:12px; }
    .loading { display:flex; justify-content:center; padding:16px; }
    .list { display:flex; flex-direction:column; gap:8px; }
    .slot { background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; }
    .row { display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .row.small { font-size:12px; color:#666; justify-content:flex-start; }
    .service { font-weight:600; }
    .status { font-size:12px; padding:2px 8px; border-radius:999px; background:#f5f5f5; text-transform:capitalize; }
    .status.booked { background:#ffebee; color:#c62828; }
    .status.conflict { background:#fff3e0; color:#ef6c00; }
    @media (min-width: 769px) { .container { max-width: 480px; margin: 0 auto; } }
  `]
})
export class TwaSlotsComponent implements OnInit {
  isAllowed = false;
  loading = false;
  services: Service[] = [];
  slots: (Slot & { status?: string; isBooked?: boolean; hasConflict?: boolean })[] = [];
  serviceId: number | undefined = undefined;
  date: string = '';

  constructor(
    private tg: TelegramWebAppService,
    private slotsService: SlotsService,
    private servicesService: ServicesService,
    private auth: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAllowed = this.tg.isInTelegram && (typeof window !== 'undefined' ? window.innerWidth <= 768 : true);
    const today = new Date();
    this.date = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().slice(0,10);
    this.loadServices();
    this.reload();
  }

  loadServices() {
    this.servicesService.getServices().subscribe({ next: (r) => this.services = r.services || [] });
  }

  reload() {
    if (!this.isAllowed) return;
    const user = this.auth.getCurrentUser();
    if (!user?.organizationId) return;
    this.loading = true;
    this.slotsService.getSlotsStatus({ organizationId: user.organizationId, serviceId: this.serviceId, date: this.date, limit: 200 }).subscribe({
      next: (r) => { this.slots = r.slots || []; this.loading = false; },
      error: () => { this.loading = false; this.snack.open('Ошибка загрузки слотов', 'OK', { duration: 2000, panelClass: ['error-snackbar'] }); }
    });
  }

  openQuickGenerate() {
    const serviceId = this.serviceId || this.services[0]?.id;
    if (!serviceId) { this.snack.open('Выберите услугу', 'OK', { duration: 2000 }); return; }
    const date = prompt('Дата (YYYY-MM-DD)', this.date) || this.date;
    const startTime = prompt('Начало (HH:MM)', '10:00') || '10:00';
    const endTime = prompt('Конец (HH:MM)', '18:00') || '18:00';
    const slotDuration = Number(prompt('Длительность слота (мин)', '30') || '30');
    const body = { serviceId: Number(serviceId), startDate: date, endDate: date, startTime, endTime, includeWeekends: true, slotDuration };
    this.slotsService.generateSlotsAdvanced(body).subscribe({
      next: () => { this.snack.open('Слоты сгенерированы', 'OK', { duration: 2000, panelClass: ['success-snackbar'] }); this.reload(); },
      error: () => { this.snack.open('Ошибка генерации', 'OK', { duration: 2000, panelClass: ['error-snackbar'] }); }
    });
  }

  deleteEmpty() {
    this.snack.open('Массовое удаление пустых слотов —TODO', 'OK', { duration: 2000 });
  }

  toDate(iso: string) { const d = new Date(iso); return d.toLocaleDateString(); }
  toTime(iso: string) { const d = new Date(iso); return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); }
}


