import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskLogViewerComponent } from '../../../shared/components/task-log-viewer.component';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/api.models';
import { Subscription, timer, switchMap, filter, tap } from 'rxjs';

@Component({
  selector: 'app-task-logs-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, TaskLogViewerComponent],
  templateUrl: './task-logs-dialog.component.html',
  styleUrl: './task-logs-dialog.component.scss'
})
export class TaskLogsDialogComponent implements OnInit, OnDestroy {
  task = inject<Task>(MAT_DIALOG_DATA);
  private taskService = inject(TaskService);
  private subscription?: Subscription;

  ngOnInit() {
    if (this.task.status === 'running' || this.task.status === 'queued') {
      this.subscription = timer(0, 2000).pipe(
        switchMap(() => this.taskService.getTask(this.task.id)),
        tap(updatedTask => {
          this.task = updatedTask;
          if (updatedTask.status !== 'running' && updatedTask.status !== 'queued') {
            this.subscription?.unsubscribe();
          }
        })
      ).subscribe();
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
