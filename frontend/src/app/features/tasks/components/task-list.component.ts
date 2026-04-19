import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService } from '../../../core/services/task.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Task, TaskStatus } from '../../../core/models/api.models';
import { TaskLogsDialogComponent } from './task-logs-dialog.component';
import { TaskStatusChipComponent } from '../../../shared/components/task-status-chip.component';
import { Observable, switchMap, BehaviorSubject, combineLatest, startWith, map, throttleTime } from 'rxjs';
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
    MatSnackBarModule,
    TaskStatusChipComponent,
    RouterLink
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private wsService = inject(WebSocketService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  private statusFilter$ = new BehaviorSubject<TaskStatus | null>(null);
  tasks$!: Observable<Task[]>;
  displayedColumns: string[] = ['device', 'status', 'created', 'actions'];

  ngOnInit() {
    const initialTasks$ = this.statusFilter$.pipe(
      switchMap(status => this.taskService.getTasks(undefined, status || undefined))
    );

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

  onStatusChange(status: TaskStatus | null) {
    this.statusFilter$.next(status);
  }

  viewLogs(task: Task) {
    this.dialog.open(TaskLogsDialogComponent, { data: task, width: '600px' });
  }

  approveTask(id: string) {
    this.taskService.approveTask(id).subscribe(() => {
        this.snackBar.open('Task approved successfully', 'OK', { duration: 3000 });
    });
  }

  queueTask(id: string) {
    this.taskService.queueTask(id).subscribe(() => {
        this.snackBar.open('Task queued successfully', 'OK', { duration: 3000 });
    });
  }

  runTask(id: string) {
    this.taskService.runTask(id).subscribe(() => {
        this.snackBar.open('Task started successfully', 'OK', { duration: 3000 });
    });
  }
}
