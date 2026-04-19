import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskLogViewerComponent } from '../../../shared/components/task-log-viewer.component';
import { TaskService } from '../../../core/services/task.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Task } from '../../../core/models/api.models';
import { Subscription } from 'rxjs';

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
  private wsService = inject(WebSocketService);
  private subscription?: Subscription;

  ngOnInit() {
    this.subscription = this.wsService.listenToTask(this.task.id).subscribe(event => {
      if (event.type === 'task.update') {
        this.task = {
          ...this.task,
          status: event.status as any,
          progress: event.progress!,
          updated_at: event.updated_at!
        };
      } else if (event.type === 'task.log') {
        this.task = {
          ...this.task,
          logs: (this.task.logs || '') + (this.task.logs ? '\n' : '') + event.log_line
        };
      }
    });

    if (!this.task.logs) {
      this.taskService.getTask(this.task.id).subscribe(updatedTask => {
        if (!this.task.logs) {
          this.task = updatedTask;
        }
      });
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
