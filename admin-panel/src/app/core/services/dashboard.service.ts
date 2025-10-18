import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { ApiService } from './api';
import { Appointment, Service } from '../../shared/models/api.models';

export interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  weekAppointments: number;
  pendingAppointments: number;
  totalServices: number;
  activeServices: number;
  totalRevenue: number;
  todayRevenue: number;
}

export interface AppointmentStats {
  total: number;
  today: number;
  week: number;
  pending: number;
}

export interface ServiceStats {
  total: number;
  active: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private api: ApiService) {}

  // Получить статистику для dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      appointments: this.getAppointmentStats(),
      services: this.getServiceStats(),
      revenue: this.getRevenueStats()
    }).pipe(
      map(({ appointments, services, revenue }) => ({
        totalAppointments: appointments.total,
        todayAppointments: appointments.today,
        weekAppointments: appointments.week,
        pendingAppointments: appointments.pending,
        totalServices: services.total,
        activeServices: services.active,
        totalRevenue: revenue.total,
        todayRevenue: revenue.today
      }))
    );
  }

  // Получить статистику по записям
  private getAppointmentStats(): Observable<AppointmentStats> {
    return this.api.get<any>('/appointments').pipe(
      map(response => {
        const appointments = response.appointments || response || [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const todayAppointments = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.slot?.startAt || apt.createdAt || '');
          return aptDate >= today;
        }).length;

        const weekAppointments = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.slot?.startAt || apt.createdAt || '');
          return aptDate >= weekAgo;
        }).length;

        const pendingAppointments = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.slot?.startAt || apt.createdAt || '');
          return aptDate >= now;
        }).length;

        return {
          total: appointments.length,
          today: todayAppointments,
          week: weekAppointments,
          pending: pendingAppointments
        };
      })
    );
  }

  // Получить статистику по услугам
  private getServiceStats(): Observable<ServiceStats> {
    return this.api.get<any>('/services').pipe(
      map(response => {
        const services = response.services || response || [];
        return {
          total: services.length,
          active: services.length // Пока все услуги считаем активными
        };
      })
    );
  }

  // Получить статистику по доходам (пока заглушка)
  private getRevenueStats(): Observable<{ total: number; today: number }> {
    // TODO: Добавить поле цены в модель Service и реализовать расчет доходов
    return new Observable(observer => {
      observer.next({ total: 0, today: 0 });
      observer.complete();
    });
  }

  // Получить записи для календаря
  getAppointmentsForCalendar(startDate: Date, endDate: Date): Observable<Appointment[]> {
    return this.api.get<any>('/appointments').pipe(
      map(response => {
        const appointments = response.appointments || response || [];
        return appointments.filter((apt: any) => {
          const aptDate = new Date(apt.slot?.startAt || apt.createdAt || '');
          return aptDate >= startDate && aptDate <= endDate;
        });
      })
    );
  }

  // Получить последние записи
  getRecentAppointments(limit: number = 5): Observable<Appointment[]> {
    return this.api.get<any>('/appointments').pipe(
      map(response => {
        const appointments = response.appointments || response || [];
        return appointments
          .sort((a: any, b: any) => {
            const dateA = new Date(a.slot?.startAt || a.createdAt || '');
            const dateB = new Date(b.slot?.startAt || b.createdAt || '');
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, limit);
      })
    );
  }
}
