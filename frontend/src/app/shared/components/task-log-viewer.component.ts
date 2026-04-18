import { Component, Input, ViewChild, ElementRef, AfterViewChecked, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-log-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terminal" #terminal>
      <div *ngFor="let line of parsedLogs" [ngClass]="line.type">
        <span class="timestamp" *ngIf="line.timestamp">[{{line.timestamp}}]</span>
        <span class="content">{{line.content}}</span>
      </div>
    </div>
  `,
  styles: [`
    .terminal {
      background-color: #000;
      color: #fff;
      font-family: 'Roboto Mono', monospace;
      padding: 16px;
      height: 400px;
      overflow-y: auto;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.5;
    }
    .timestamp {
      color: #888;
      margin-right: 8px;
    }
    .error {
      color: #ff5252;
    }
    .diff-add {
      color: #4caf50;
      background-color: rgba(76, 175, 80, 0.1);
    }
    .diff-remove {
      color: #ff5252;
      background-color: rgba(255, 82, 82, 0.1);
    }
    .info {
      color: #fff;
    }
  `]
})
export class TaskLogViewerComponent implements AfterViewChecked, OnChanges {
  @Input() logs: string = '';
  @ViewChild('terminal') private terminalContainer!: ElementRef;

  parsedLogs: { timestamp?: string; content: string; type: string }[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['logs']) {
      this.parseLogs();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private parseLogs() {
    if (!this.logs) {
      this.parsedLogs = [];
      return;
    }

    const lines = this.logs.split('\n');
    this.parsedLogs = lines.map(line => {
      let type = 'info';
      let content = line;
      let timestamp = '';

      // Basic diff detection
      if (line.startsWith('+')) {
        type = 'diff-add';
      } else if (line.startsWith('-')) {
        type = 'diff-remove';
      } else if (line.toLowerCase().includes('error') || line.toLowerCase().includes('fail')) {
        type = 'error';
      }

      // Basic timestamp detection [YYYY-MM-DD HH:MM:SS]
      const tsMatch = line.match(/^\[(.*?)\]\s?(.*)/);
      if (tsMatch) {
        timestamp = tsMatch[1];
        content = tsMatch[2];
      }

      return { timestamp, content, type };
    });
  }

  private scrollToBottom(): void {
    try {
      this.terminalContainer.nativeElement.scrollTop = this.terminalContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
