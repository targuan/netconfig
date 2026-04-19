import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, timer, EMPTY } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export interface TaskEvent {
  type: 'task.update' | 'task.log';
  id?: string;
  task_id?: string;
  status?: string;
  progress?: number;
  updated_at?: string;
  log_line?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private readonly WS_URL = 'ws://localhost:8000/ws/tasks/';

  constructor() {}

  public listenToTasks(): Observable<TaskEvent> {
    return this.connect(this.WS_URL);
  }

  public listenToTask(taskId: string): Observable<TaskEvent> {
    return this.connect(`${this.WS_URL}${taskId}/`);
  }

  private connect(url: string): Observable<TaskEvent> {
    const socket$ = webSocket<TaskEvent>({
      url,
      openObserver: {
        next: () => console.log(`[WebSocketService] Connected to ${url}`)
      },
      closeObserver: {
        next: () => console.log(`[WebSocketService] Disconnected from ${url}`)
      }
    });

    return socket$.pipe(
      retry({
        delay: (error, retryCount) => {
          const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000);
          console.warn(`[WebSocketService] Connection failed. Retrying in ${backoffTime}ms...`, error);
          return timer(backoffTime);
        }
      }),
      catchError(error => {
        console.error('[WebSocketService] WebSocket error:', error);
        return EMPTY;
      })
    );
  }
}
