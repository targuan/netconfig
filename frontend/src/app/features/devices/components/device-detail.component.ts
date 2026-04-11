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
  template: `
    <div *ngIf="device$ | async as device" class="container">
      <div class="header">
        <h1>{{device.name}} <small>({{device.ip_address}})</small></h1>
        <button mat-stroked-button color="primary" routerLink="/devices">
          <mat-icon>arrow_back</mat-icon> Back to List
        </button>
      </div>

      <div class="grid">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Device Info</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p><strong>Vendor:</strong> {{device.vendor}}</p>
            <p><strong>Driver:</strong> {{device.napalm_driver}}</p>
            <p><strong>ID:</strong> {{device.id}}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="config-card">
          <mat-card-header>
            <mat-card-title>Configuration</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Config Content</mat-label>
              <textarea matInput rows="10" [(ngModel)]="configContent"></textarea>
            </mat-form-field>
            <div *ngIf="currentVersion" class="version-info">
              Current Version: v{{currentVersion}}
            </div>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-raised-button color="primary" (click)="saveConfig(device.id)">
              <mat-icon>save</mat-icon> Save Config
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <mat-card class="tasks-card">
        <mat-card-header>
          <mat-card-title>Related Tasks</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="(tasks$ | async) || []" class="full-width">
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Status </th>
              <td mat-cell *matCellDef="let task">
                <mat-chip-set>
                  <mat-chip [ngClass]="'status-' + task.status">
                    {{task.status}}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <ng-container matColumnDef="created">
              <th mat-header-cell *matHeaderCellDef> Created </th>
              <td mat-cell *matCellDef="let task"> {{task.created_at | date:'short'}} </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions </th>
              <td mat-cell *matCellDef="let task">
                <button mat-button color="primary" (click)="viewLogs(task)">Logs</button>
                <button mat-flat-button color="accent" *ngIf="task.status === 'pending_approval'" (click)="approveTask(task.id)">Approve</button>
                <button mat-flat-button color="accent" *ngIf="task.status === 'approved'" (click)="queueTask(task.id)">Queue</button>
                <button mat-flat-button color="warn" *ngIf="task.status === 'queued'" (click)="runTask(task.id)">Run</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { display: flex; flex-direction: column; gap: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .grid { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }
    .full-width { width: 100%; }
    .version-info { margin-top: 10px; font-style: italic; color: #666; }
    .tasks-card { margin-top: 20px; }

    .status-pending_approval { background-color: orange !important; color: white !important; }
    .status-running { background-color: #2196f3 !important; color: white !important; }
    .status-success { background-color: #4caf50 !important; color: white !important; }
    .status-failed { background-color: #f44336 !important; color: white !important; }
    .status-approved { background-color: #9c27b0 !important; color: white !important; }
    .status-queued { background-color: #607d8b !important; color: white !important; }
  `]
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
