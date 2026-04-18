import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Device } from '../../core/models/api.models';

@Component({
  selector: 'app-device-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <mat-card class="device-card">
      <mat-card-header>
        <div mat-card-avatar class="device-icon">
          <mat-icon>{{device.vendor === 'cisco' ? 'router' : 'settings_input_component'}}</mat-icon>
        </div>
        <mat-card-title>{{device.name}}</mat-card-title>
        <mat-card-subtitle>{{device.ip_address}}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p><strong>Vendor:</strong> {{device.vendor}}</p>
        <p><strong>Driver:</strong> {{device.napalm_driver}}</p>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button color="primary" [routerLink]="['/devices', device.id]">DETAILS</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .device-card {
      margin-bottom: 16px;
      transition: transform 0.2s;
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
    }
    .device-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border-radius: 50%;
    }
  `]
})
export class DeviceCardComponent {
  @Input({ required: true }) device!: Device;
}
