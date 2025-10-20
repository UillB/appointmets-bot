import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { TelegramWebAppService } from '../../../core/services/telegram-webapp.service';
import { Appointment } from '../../../shared/models/api.models';

@Component({
  selector: 'app-twa-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div *ngIf="!isAllowed" class="guard">
      <div class="center">
        <mat-icon>mobile_off</mat-icon>
        <p>Доступно только в Telegram WebApp на мобильных устройствах</p>
      </div>
    </div>

    <div *ngIf="isAllowed" class="container">
      <div class="kpis">
        <div class="kpi">
          <div class="label">Сегодня</div>
          <div class="value">{{ todayCount }}</div>
        </div>
        <div class="kpi">
          <div class="label">Завтра</div>
          <div class="value">{{ tomorrowCount }}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Последние события</div>
        <div *ngIf="loading" class="loading"><mat-spinner diameter="28"></mat-spinner></div>
        <div *ngIf="!loading && events.length===0" class="empty">Событий нет</div>
        <div class="events" *ngIf="!loading && events.length>0">
          <div class="event" *ngFor="let e of events">
            <div class="row">
              <span class="status" [class]="'st-'+(e.status||'')">{{ e.status }}</span>
              <span class="service">{{ e.service?.nameRu || e.service?.name }}</span>
            </div>
            <div class="row small">
              <span>{{ formatDateTime(e.slot?.startAt) }}</span>
              <span>·</span>
              <span>chat {{ e.chatId }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .guard { padding: 16px; }
    .center { display:flex; gap:8px; align-items:center; justify-content:center; color:#777; }
    .container { padding: 12px; }
    .kpis { display:flex; gap:8px; }
    .kpi { flex:1; background:#fff; border:1px solid #eee; border-radius:12px; padding:12px; box-shadow:0 1px 2px rgba(0,0,0,0.04); }
    .label { font-size:12px; color:#666; }
    .value { font-size:22px; font-weight:700; margin-top:4px; }
    .section { margin-top:16px; }
    .section-title { font-weight:600; margin-bottom:8px; }
    .loading { display:flex; justify-content:center; padding:16px; }
    .empty { color:#888; text-align:center; padding:12px; }
    .events { display:flex; flex-direction:column; gap:8px; }
    .event { background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; }
    .row { display:flex; gap:8px; align-items:center; justify-content:space-between; }
    .row.small { font-size:12px; color:#666; justify-content:flex-start; }
    .status { font-size:12px; padding:2px 8px; border-radius:999px; text-transform:capitalize; background:#f5f5f5; }
    .st-confirmed { background:#e8f5e9; color:#2e7d32; }
    .st-pending { background:#fff3e0; color:#ef6c00; }
    .st-cancelled { background:#ffebee; color:#c62828; }
    @media (min-width: 769px) { .container { max-width: 480px; margin: 0 auto; } }
  `]
})
export class TwaDashboardComponent implements OnInit {
  isAllowed = false;
  loading = false;
  todayCount = 0;
  tomorrowCount = 0;
  events: Appointment[] = [];

  constructor(
    private tg: TelegramWebAppService,
    private appointments: AppointmentsService
  ) {}

  ngOnInit(): void {
    this.isAllowed = this.tg.isInTelegram && (typeof window !== 'undefined' ? window.innerWidth <= 768 : true);
    if (!this.isAllowed) return;
    this.loadKpis();
    this.loadEvents();
  }

  private loadKpis() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    this.appointments.getAppointments({ date: new Date(today.getFullYear(), today.getMonth(), today.getDate()), page: 1, limit: 1 }).subscribe({
      next: (r) => this.todayCount = r.total || 0
    });
    this.appointments.getAppointments({ date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()), page: 1, limit: 1 }).subscribe({
      next: (r) => this.tomorrowCount = r.total || 0
    });
  }

  private loadEvents() {
    this.loading = true;
    this.appointments.getAppointments({ page: 1, limit: 20 }).subscribe({
      next: (r) => { this.events = r.appointments || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  formatDateTime(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  }
}




