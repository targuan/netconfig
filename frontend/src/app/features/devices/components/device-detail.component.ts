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
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../../core/services/device.service';
import { ConfigService } from '../../../core/services/config.service';
import { TaskService } from '../../../core/services/task.service';
import { Device, DeviceConfig, Task } from '../../../core/models/api.models';
import { TaskLogsDialogComponent } from '../../tasks/components/task-logs-dialog.component';
import { Observable, switchMap, timer, startWith, map } from 'rxjs';

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
    FormsModule
  ],
  templateUrl: './device-detail.component.html',
  styleUrl: './device-detail.component.scss'
})
export class DeviceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private deviceService = inject(DeviceService);
  private configService = inject(ConfigService);
  private taskService = inject(TaskService);
  private dialog = inject(MatDialog);

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
        this.configContent = configs[0].content;
        this.currentVersion = configs[0].version;
      }
    });

    this.tasks$ = timer(0, 5000).pipe(
      switchMap(() => this.taskService.getTasks(id)),
      startWith([])
    );
  }

  saveConfig(deviceId: string) {
    this.configService.createConfig({ device: deviceId, content: this.configContent }).subscribe({
      next: (config) => {
        this.currentVersion = config.version;
        // The task will be auto-created by Django signal, and reloaded by timer
      },
      error: (err) => console.error('Error saving config', err)
    });
  }

  viewLogs(task: Task) {
    this.dialog.open(TaskLogsDialogComponent, { data: task, width: '600px' });
  }

  approveTask(id: string) {
    this.taskService.approveTask(id).subscribe();
  }

  queueTask(id: string) {
    this.taskService.queueTask(id).subscribe();
  }

  runTask(id: string) {
    this.taskService.runTask(id).subscribe();
  }
}
