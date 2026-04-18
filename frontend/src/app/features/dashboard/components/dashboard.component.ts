import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../../core/services/device.service';
import { TaskService } from '../../../core/services/task.service';
import { Observable, timer, combineLatest, map, switchMap, shareReplay } from 'rxjs';
import { Device, Task } from '../../../core/models/api.models';
import { DashboardSummaryComponent } from '../../../shared/components/dashboard-summary.component';
import { DeviceCardComponent } from '../../../shared/components/device-card.component';
import { TaskStatusChipComponent } from '../../../shared/components/task-status-chip.component';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardSummaryComponent,
    DeviceCardComponent,
    TaskStatusChipComponent,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    RouterLink
  ],
  template: `
    <div class="dashboard-container">
      <h1>Network Automation Dashboard</h1>

      <app-dashboard-summary [taskCounts]="(taskStats$ | async) || {}"></app-dashboard-summary>

      <div class="dashboard-grid">
        <section class="active-tasks">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Active Operations</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="(activeTasks$ | async) || []" class="full-width">
                <ng-container matColumnDef="device">
                  <th mat-header-cell *matHeaderCellDef>Device</th>
                  <td mat-cell *matCellDef="let task">{{task.device_name || 'Unknown'}}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let task">
                    <app-task-status-chip [status]="task.status" [progress]="task.progress"></app-task-status-chip>
                  </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let task">
                    <a mat-button color="primary" [routerLink]="['/devices', task.device]">VIEW</a>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['device', 'status', 'actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['device', 'status', 'actions'];" class="task-row"></tr>
              </table>
              <div *ngIf="(activeTasks$ | async)?.length === 0" class="no-data">
                No active tasks at the moment.
              </div>
            </mat-card-content>
          </mat-card>
        </section>

        <section class="device-overview">
          <div class="section-header">
            <h2>Managed Devices ({{(devices$ | async)?.length || 0}})</h2>
            <a mat-button color="primary" routerLink="/devices">VIEW ALL</a>
          </div>
          <div class="device-grid">
            <app-device-card *ngFor="let device of (recentDevices$ | async)" [device]="device"></app-device-card>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .full-width {
      width: 100%;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .device-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .no-data {
      padding: 32px;
      text-align: center;
      color: #666;
    }
    .task-row {
      height: 48px;
    }
    h1 {
      margin-bottom: 32px;
      font-weight: 300;
      color: #333;
    }
    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private deviceService = inject(DeviceService);
  private taskService = inject(TaskService);

  devices$!: Observable<Device[]>;
  recentDevices$!: Observable<Device[]>;
  tasks$!: Observable<Task[]>;
  activeTasks$!: Observable<Task[]>;
  taskStats$!: Observable<Record<string, number>>;

  ngOnInit() {
    const refreshInterval$ = timer(0, 5000).pipe(shareReplay(1));

    this.devices$ = refreshInterval$.pipe(
      switchMap(() => this.deviceService.getDevices()),
      shareReplay(1)
    );

    this.recentDevices$ = this.devices$.pipe(
      map(devices => devices.slice(0, 4))
    );

    this.tasks$ = refreshInterval$.pipe(
      switchMap(() => this.taskService.getTasks()),
      shareReplay(1)
    );

    this.activeTasks$ = this.tasks$.pipe(
      map(tasks => tasks.filter(t => ['running', 'queued', 'pending_approval'].includes(t.status)).slice(0, 5))
    );

    this.taskStats$ = this.tasks$.pipe(
      map(tasks => {
        const stats: Record<string, number> = {};
        tasks.forEach(t => {
          stats[t.status] = (stats[t.status] || 0) + 1;
        });
        return stats;
      })
    );
  }
}
