import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeviceConfig } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = 'http://localhost:8000/api/configs/';

  constructor(private http: HttpClient) { }

  getConfigs(deviceId?: string): Observable<DeviceConfig[]> {
    const url = deviceId ? `${this.apiUrl}?device=${deviceId}` : this.apiUrl;
    return this.http.get<DeviceConfig[]>(url);
  }

  getConfig(id: string): Observable<DeviceConfig> {
    return this.http.get<DeviceConfig>(`${this.apiUrl}${id}/`);
  }

  createConfig(config: Partial<DeviceConfig>): Observable<DeviceConfig> {
    return this.http.post<DeviceConfig>(this.apiUrl, config);
  }
}
