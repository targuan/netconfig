import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { TaskStatus } from '../../core/models/api.models';
import { TASK_STATUS_CONFIG } from '../utils/status-utils';

@Component({
  selector: 'app-task-status-chip',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatProgressSpinnerModule, MatProgressBarModule, MatIconModule],
  template: `
    <div class="chip-container">
      <mat-chip-set>
        <mat-chip [style.background-color]="config.color" class="status-chip">
          <mat-icon *ngIf="config.icon && status !== 'running'" class="status-icon">{{config.icon}}</mat-icon>
          <mat-progress-spinner
            *ngIf="status === 'running'"
            mode="indeterminate"
            diameter="16"
            class="status-spinner">
          </mat-progress-spinner>
          <span class="status-label">{{config.label}}</span>
        </mat-chip>
      </mat-chip-set>
      <mat-progress-bar
        *ngIf="status === 'running' && progress > 0"
        mode="determinate"
        [value]="progress"
        class="mini-progress-bar">
      </mat-progress-bar>
    </div>
  `,
  styles: [`
    .chip-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 120px;
    }
    .status-chip {
      color: white !important;
      font-weight: 500;
    }
    .status-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
    .status-spinner {
      display: inline-block;
      margin-right: 8px;
    }
    .status-label {
        display: flex;
        align-items: center;
    }
    ::ng-deep .status-spinner circle {
        stroke: white !important;
    }
    .mini-progress-bar {
      height: 4px;
      border-radius: 2px;
    }
  `]
})
export class TaskStatusChipComponent {
  @Input({ required: true }) status!: TaskStatus;
  @Input() progress: number = 0;

  get config() {
    return TASK_STATUS_CONFIG[this.status] || TASK_STATUS_CONFIG.draft;
  }
}
