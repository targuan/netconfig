import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatus } from '../../../core/models/api.models';
import { TaskLogsDialogComponent } from './task-logs-dialog.component';
import { Observable, timer, switchMap, BehaviorSubject, combineLatest, startWith } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    RouterLink
  ],
  template: `
    <div class="header">
      <h1>Global Tasks</h1>
      <mat-form-field appearance="outline">
        <mat-label>Filter by Status</mat-label>
        <mat-select (selectionChange)="onStatusChange($event.value)" placeholder="All Statuses">
          <mat-option [value]="null">All Statuses</mat-option>
          <mat-option value="pending_approval">Pending Approval</mat-option>
          <mat-option value="approved">Approved</mat-option>
          <mat-option value="queued">Queued</mat-option>
          <mat-option value="running">Running</mat-option>
          <mat-option value="success">Success</mat-option>
          <mat-option value="failed">Failed</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <table mat-table [dataSource]="(tasks$ | async) || []" class="mat-elevation-z8">
      <ng-container matColumnDef="device">
        <th mat-header-cell *matHeaderCellDef> Device </th>
        <td mat-cell *matCellDef="let task">
            <a [routerLink]="['/devices', task.device]">View Device</a>
        </td>
      </ng-container>

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
          <button mat-icon-button color="primary" (click)="viewLogs(task)">
            <mat-icon>description</mat-icon>
          </button>
          <button mat-flat-button color="accent" *ngIf="task.status === 'pending_approval'" (click)="approveTask(task.id)">Approve</button>
          <button mat-flat-button color="accent" *ngIf="task.status === 'approved'" (click)="queueTask(task.id)">Queue</button>
          <button mat-flat-button color="warn" *ngIf="task.status === 'queued'" (click)="runTask(task.id)">Run</button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    table { width: 100%; }
    .status-pending_approval { background-color: orange !important; color: white !important; }
    .status-running { background-color: #2196f3 !important; color: white !important; }
    .status-success { background-color: #4caf50 !important; color: white !important; }
    .status-failed { background-color: #f44336 !important; color: white !important; }
    .status-approved { background-color: #9c27b0 !important; color: white !important; }
    .status-queued { background-color: #607d8b !important; color: white !important; }
  `]
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private dialog = inject(MatDialog);

  private statusFilter$ = new BehaviorSubject<TaskStatus | null>(null);
  tasks$!: Observable<Task[]>;
  displayedColumns: string[] = ['device', 'status', 'created', 'actions'];

  ngOnInit() {
    this.tasks$ = combineLatest([
      timer(0, 5000),
      this.statusFilter$
    ]).pipe(
      switchMap(([_, status]) => this.taskService.getTasks(undefined, status || undefined)),
      startWith([])
    );
  }

  onStatusChange(status: TaskStatus | null) {
    this.statusFilter$.next(status);
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
