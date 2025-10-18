import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  constructor(private api: ApiService) {}

  // Проверить состояние API
  checkHealth(): Observable<{ ok: boolean }> {
    return this.api.get<{ ok: boolean }>('/health');
  }
}
