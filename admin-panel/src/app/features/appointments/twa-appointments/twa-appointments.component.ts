import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { ServicesService, Service } from '../../../core/services/services.service';
import { SlotsService } from '../../../core/services/slots.service';
import { Appointment, Slot } from '../../../shared/models/api.models';
import { TelegramWebAppService } from '../../../core/services/telegram-webapp.service';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-twa-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div *ngIf="!isAllowed" class="guard">
      <div class="center">
        <mat-icon>mobile_off</mat-icon>
        <p>Доступно только в Telegram WebApp на мобильных устройствах</p>
      </div>
    </div>

    <div *ngIf="isAllowed" class="twa-container">
      <div class="filters">
        <div class="quick">
          <button mat-stroked-button [color]="quickFilter==='today' ? 'primary' : undefined" (click)="setQuick('today')">Сегодня</button>
          <button mat-stroked-button [color]="quickFilter==='tomorrow' ? 'primary' : undefined" (click)="setQuick('tomorrow')">Завтра</button>
          <button mat-stroked-button [color]="quickFilter==='range' ? 'primary' : undefined" (click)="setQuick('range')">Диапазон</button>
        </div>
        <div class="selects">
          <select [(ngModel)]="status" (change)="reload()">
            <option value="">Все статусы</option>
            <option value="confirmed">Подтверждена</option>
            <option value="pending">Ожидает</option>
            <option value="cancelled">Отменена</option>
          </select>
          <select [(ngModel)]="serviceId" (change)="reload()">
            <option [ngValue]="undefined">Все услуги</option>
            <option *ngFor="let s of services" [ngValue]="s.id">{{ getServiceName(s) }}</option>
          </select>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <mat-spinner diameter="36"></mat-spinner>
      </div>

      <div *ngIf="!loading && appointments.length===0" class="empty">
        <mat-icon>event_busy</mat-icon>
        <p>Нет записей</p>
      </div>

      <div class="cards" *ngIf="!loading && appointments.length>0">
        <div class="card" *ngFor="let a of appointments">
          <div class="row top">
            <div class="service">{{ getServiceName(a.service) }}</div>
            <span class="status" [class]="'st-'+a.status">{{ a.status }}</span>
          </div>
          <div class="row">
            <mat-icon>schedule</mat-icon>
            <div class="dt">{{ formatDate(a.slot?.startAt) }} · {{ formatTime(a.slot?.startAt) }}–{{ formatTime(a.slot?.endAt) }}</div>
          </div>
          <div class="row">
            <mat-icon>person</mat-icon>
            <div class="client">{{ a.chatId }}</div>
          </div>

          <div class="actions">
            <button mat-flat-button color="primary" (click)="confirm(a)" *ngIf="a.status!=='confirmed'">Подтвердить</button>
            <button mat-stroked-button color="warn" (click)="cancel(a)">Отменить</button>
            <button mat-stroked-button (click)="reschedule(a)">Перенести</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .guard { padding: 16px; }
    .center { display:flex; gap:8px; align-items:center; justify-content:center; color:#777; }
    .twa-container { padding: 12px; }
    .filters { display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }
    .quick { display:flex; gap:8px; }
    .selects { display:flex; gap:8px; }
    select { flex:1; height:40px; border-radius:8px; border:1px solid #ddd; padding:0 8px; }
    .loading { display:flex; justify-content:center; padding:24px; }
    .empty { text-align:center; color:#888; padding:24px 8px; }
    .cards { display:flex; flex-direction:column; gap:10px; }
    .card { border-radius:12px; border:1px solid #eee; padding:12px; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,0.04); }
    .row { display:flex; align-items:center; gap:8px; margin:6px 0; }
    .top { justify-content:space-between; margin-bottom:8px; }
    .service { font-weight:600; }
    .status { font-size:12px; padding:2px 8px; border-radius:999px; text-transform:capitalize; }
    .st-confirmed { background:#e8f5e9; color:#2e7d32; }
    .st-pending { background:#fff3e0; color:#ef6c00; }
    .st-cancelled { background:#ffebee; color:#c62828; }
    .actions { display:flex; gap:8px; margin-top:8px; }
    .dt { font-size:14px; color:#444; }
    .client { font-size:14px; color:#555; }
    @media (min-width: 769px) { .twa-container { max-width: 480px; margin: 0 auto; } }
  `]
})
export class TwaAppointmentsComponent implements OnInit {
  isAllowed = false;
  loading = false;
  appointments: Appointment[] = [];
  services: Service[] = [];

  status: string = '';
  serviceId: number | undefined = undefined;
  quickFilter: 'today' | 'tomorrow' | 'range' = 'today';
  fromDate?: Date;
  toDate?: Date;

  constructor(
    private telegram: TelegramWebAppService,
    private appointmentsService: AppointmentsService,
    private servicesService: ServicesService,
    private slotsService: SlotsService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAllowed = this.telegram.isInTelegram && (typeof window !== 'undefined' ? window.innerWidth <= 768 : true);
    this.loadServices();
    this.reload();
  }

  setQuick(kind: 'today' | 'tomorrow' | 'range') {
    this.quickFilter = kind;
    this.reload();
  }

  reload() {
    if (!this.isAllowed) return;
    this.loading = true;
    const filterDate = this.computeDateForQuick();
    this.appointmentsService.getAppointments({
      status: this.status || undefined,
      serviceId: this.serviceId,
      date: filterDate || undefined,
      page: 1,
      limit: 50
    }).subscribe({
      next: (res) => {
        this.appointments = res.appointments || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Ошибка загрузки записей', 'OK', { duration: 2500, panelClass: ['error-snackbar'] });
      }
    });
  }

  computeDateForQuick(): Date | null {
    const now = new Date();
    if (this.quickFilter === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (this.quickFilter === 'tomorrow') {
      const t = new Date(now);
      t.setDate(t.getDate() + 1);
      return new Date(t.getFullYear(), t.getMonth(), t.getDate());
    }
    return null;
  }

  getServiceName(service: Service | undefined): string {
    if (!service) return '';
    return service.nameRu || service.name || service.nameEn || service.nameHe || '';
  }

  formatDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString();
  }

  formatTime(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  loadServices() {
    this.servicesService.getServices().subscribe({
      next: (resp) => { this.services = resp.services || []; },
      error: () => {}
    });
  }

  confirm(a: Appointment) {
    this.appointmentsService.updateAppointment(a.id, { status: 'confirmed' }).subscribe({
      next: () => { this.snack.open('Подтверждено', 'OK', { duration: 1500, panelClass: ['success-snackbar'] }); this.reload(); },
      error: () => { this.snack.open('Ошибка подтверждения', 'OK', { duration: 2000, panelClass: ['error-snackbar'] }); }
    });
  }

  cancel(a: Appointment) {
    const reason = prompt('Причина отмены (необязательно)') || undefined;
    this.appointmentsService.cancelAppointment(a.id, reason).subscribe({
      next: () => { this.snack.open('Отменено', 'OK', { duration: 1500, panelClass: ['success-snackbar'] }); this.reload(); },
      error: () => { this.snack.open('Ошибка отмены', 'OK', { duration: 2000, panelClass: ['error-snackbar'] }); }
    });
  }

  reschedule(a: Appointment) {
    const serviceId = a.serviceId;
    const dateISO = a.slot?.startAt ? new Date(a.slot.startAt).toISOString().slice(0,10) : undefined;
    const user = this.authService.getCurrentUser();
    if (!user?.organizationId) {
      this.snack.open('Нет organizationId', 'OK', { duration: 2000, panelClass: ['error-snackbar'] });
      return;
    }
    this.loading = true;
    this.slotsService.getSlotsStatus({ organizationId: user.organizationId, serviceId, date: dateISO, limit: 100 }).subscribe({
      next: (resp) => {
        this.loading = false;
        const candidates = (resp.slots || []).filter(s => (s as any).status === 'available');
        if (!candidates.length) {
          this.snack.open('Нет доступных слотов рядом с этой датой', 'OK', { duration: 2500 });
          return;
        }
        const label = candidates.map(s => {
          const d = new Date(s.startAt);
          return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
        }).join('\n');
        const pick = prompt(`Выберите индекс слота:\n${candidates.map((_,i)=>`${i+1}`).join(', ')}\n\n${label}`);
        const idx = pick ? Number(pick) - 1 : -1;
        if (idx < 0 || idx >= candidates.length) return;
        const newSlot = candidates[idx] as Slot;
        // Вариант без серверного рескейджла: создаём новую запись и отменяем текущую
        this.appointmentsService.createAppointment({ chatId: a.chatId, serviceId: a.serviceId, slotId: newSlot.id }).subscribe({
          next: () => {
            this.appointmentsService.cancelAppointment(a.id, 'Rescheduled').subscribe({
              next: () => { this.snack.open('Перенесено', 'OK', { duration: 2000, panelClass: ['success-snackbar'] }); this.reload(); },
              error: () => { this.snack.open('Ошибка при отмене старой записи', 'OK', { duration: 2500, panelClass: ['error-snackbar'] }); }
            });
          },
          error: (err) => {
            const msg = err?.error?.message || 'Ошибка создания новой записи';
            this.snack.open(msg, 'OK', { duration: 2500, panelClass: ['error-snackbar'] });
          }
        });
      },
      error: () => {
        this.loading = false;
        this.snack.open('Не удалось получить слоты', 'OK', { duration: 2500, panelClass: ['error-snackbar'] });
      }
    });
  }
}


