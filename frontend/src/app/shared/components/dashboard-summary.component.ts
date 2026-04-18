import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TASK_STATUS_CONFIG } from '../utils/status-utils';
import { TaskStatus } from '../../core/models/api.models';

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="summary-container">
      <mat-card *ngFor="let stat of stats" class="stat-card" [style.border-left-color]="stat.color">
        <mat-card-content>
          <div class="stat-header">
            <mat-icon [style.color]="stat.color">{{stat.icon}}</mat-icon>
            <span class="stat-label">{{stat.label}}</span>
          </div>
          <div class="stat-value">{{stat.count}}</div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .summary-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      border-left: 4px solid;
    }
    .stat-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: #666;
    }
    .stat-label {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
    }
  `]
})
export class DashboardSummaryComponent {
  @Input() set taskCounts(counts: Record<string, number>) {
    this.stats = (Object.entries(TASK_STATUS_CONFIG) as [TaskStatus, any][]).map(([status, config]) => ({
      status: status,
      label: config.label,
      color: config.color,
      icon: config.icon,
      count: counts[status] || 0
    }));
  }

  stats: any[] = [];
}
