import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-universal-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="universal-header">
      <div class="datetime-info">
        <div class="current-date">{{ currentDate | date:'EEEE, d MMMM y' }}</div>
        <div class="current-time">{{ currentTime | date:'HH:mm:ss' }}</div>
      </div>
      <button mat-icon-button 
              color="primary" 
              (click)="onRefresh()" 
              [disabled]="loading" 
              class="refresh-btn"
              [attr.aria-label]="'Обновить данные'">
        <mat-icon>refresh</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .universal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      
      .datetime-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        
        .current-date {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          line-height: 1.2;
        }
        
        .current-time {
          font-size: 18px;
          font-weight: 700;
          color: #1976d2;
          line-height: 1;
          font-family: 'Courier New', monospace;
        }
      }
      
      .refresh-btn {
        min-width: 36px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(25, 118, 210, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        
        &:hover:not(:disabled) {
          background: rgba(25, 118, 210, 0.2);
          transform: scale(1.05);
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    @media (max-width: 768px) {
      .universal-header {
        padding: 10px 12px;
        margin-bottom: 12px;
        
        .datetime-info {
          .current-date {
            font-size: 12px;
          }
          
          .current-time {
            font-size: 16px;
          }
        }
        
        .refresh-btn {
          width: 32px;
          height: 32px;
          min-width: 32px;
          
          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }
      }
    }
  `]
})
export class UniversalHeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentDate = new Date();
  currentTime = new Date();
  loading = false;

  ngOnInit(): void {
    // Update time every second
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentTime = new Date();
        this.currentDate = new Date();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRefresh(): void {
    this.loading = true;
    
    // Emit refresh event
    window.dispatchEvent(new CustomEvent('universal-refresh'));
    
    // Simulate loading state
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}
