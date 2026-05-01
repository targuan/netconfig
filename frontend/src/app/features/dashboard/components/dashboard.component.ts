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
  templateUrl: "dashboard.component.html",
  styleUrl: "dashboard.component.scss"
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
