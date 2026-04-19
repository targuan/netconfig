import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../../core/services/device.service';
import { ConfigService } from '../../../core/services/config.service';
import { TaskService } from '../../../core/services/task.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Device, DeviceConfig, Task, TaskStatus } from '../../../core/models/api.models';
import { TaskLogsDialogComponent } from '../../tasks/components/task-logs-dialog.component';
import { TaskStatusChipComponent } from '../../../shared/components/task-status-chip.component';
import { Observable, switchMap, startWith, map, combineLatest, throttleTime } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    TaskStatusChipComponent,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './device-detail.component.html',
  styleUrl: './device-detail.component.scss'
})
export class DeviceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private deviceService = inject(DeviceService);
  private configService = inject(ConfigService);
  private taskService = inject(TaskService);
  private wsService = inject(WebSocketService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  device$!: Observable<Device>;
  tasks$!: Observable<Task[]>;
  configContent: string = '';
  currentVersion?: number;
  displayedColumns: string[] = ['status', 'created', 'actions'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.device$ = this.deviceService.getDevice(id);

    this.configService.getConfigs(id).subscribe(configs => {
      if (configs.length > 0) {
        if (!this.configContent) {
            this.configContent = configs[0].content;
        }
        this.currentVersion = configs[0].version;
      }
    });

    const initialTasks$ = this.taskService.getTasks(id);
    const updates$ = this.wsService.listenToTasks().pipe(
      throttleTime(500)
    );

    this.tasks$ = combineLatest([initialTasks$, updates$.pipe(startWith(null))]).pipe(
      map(([tasks, update]) => {
        if (!update || update.type !== 'task.update') return tasks;

        const index = tasks.findIndex(t => t.id === update.id);
        if (index !== -1) {
          const updatedTasks = [...tasks];
          updatedTasks[index] = {
            ...updatedTasks[index],
            status: update.status as TaskStatus,
            progress: update.progress!,
            updated_at: update.updated_at!
          };
          return updatedTasks;
        }
        return tasks;
      }),
      startWith([])
    );
  }

  saveConfig(deviceId: string) {
    this.configService.createConfig({ device: deviceId, content: this.configContent }).subscribe({
      next: (config) => {
        this.currentVersion = config.version;
        this.snackBar.open('Configuration saved, task created', 'OK', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error saving config', err);
        this.snackBar.open('Error saving configuration', 'OK', { duration: 3000 });
      }
    });
  }

  viewLogs(task: Task) {
    this.dialog.open(TaskLogsDialogComponent, { data: task, width: '800px' });
  }

  approveTask(id: string) {
    this.taskService.approveTask(id).subscribe(() => {
        this.snackBar.open('Task approved', 'OK', { duration: 3000 });
    });
  }

  queueTask(id: string) {
    this.taskService.queueTask(id).subscribe(() => {
        this.snackBar.open('Task queued', 'OK', { duration: 3000 });
    });
  }

  runTask(id: string) {
    this.taskService.runTask(id).subscribe(() => {
        this.snackBar.open('Task started', 'OK', { duration: 3000 });
    });
  }
}
