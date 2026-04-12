import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-task-logs-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './task-logs-dialog.component.html',
  styleUrl: './task-logs-dialog.component.scss'
})
export class TaskLogsDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
