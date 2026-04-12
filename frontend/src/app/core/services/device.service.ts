import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Device } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private apiUrl = 'https://netgui.targuan.fr/api/devices/';

  constructor(private http: HttpClient) { }

  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(this.apiUrl);
  }

  getDevice(id: string): Observable<Device> {
    return this.http.get<Device>(`${this.apiUrl}${id}/`);
  }

  createDevice(device: Partial<Device>): Observable<Device> {
    return this.http.post<Device>(this.apiUrl, device);
  }

  updateDevice(id: string, device: Partial<Device>): Observable<Device> {
    return this.http.patch<Device>(`${this.apiUrl}${id}/`, device);
  }

  deleteDevice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
