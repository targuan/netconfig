import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskStatus } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8000/api/tasks/';

  constructor(private http: HttpClient) { }

  getTasks(deviceId?: string, status?: TaskStatus): Observable<Task[]> {
    let url = this.apiUrl;
    const params = [];
    if (deviceId) params.push(`device=${deviceId}`);
    if (status) params.push(`status=${status}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<Task[]>(url);
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}${id}/`);
  }

  approveTask(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}${id}/approve/`, {});
  }

  queueTask(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}${id}/queue/`, {});
  }

  runTask(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}${id}/run/`, {});
  }
}
