import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { DeviceService } from '../../../core/services/device.service';
import { Device } from '../../../core/models/api.models';
import { AddDeviceDialogComponent } from './add-device-dialog.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    RouterLink
  ],
  template: `
    <div class="header">
      <h1>Devices</h1>
      <button mat-raised-button color="primary" (click)="addDevice()">
        <mat-icon>add</mat-icon> Add Device
      </button>
    </div>

    <table mat-table [dataSource]="devices$" class="mat-elevation-z8">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef> Name </th>
        <td mat-cell *matCellDef="let device"> {{device.name}} </td>
      </ng-container>

      <ng-container matColumnDef="ip">
        <th mat-header-cell *matHeaderCellDef> IP Address </th>
        <td mat-cell *matCellDef="let device"> {{device.ip_address}} </td>
      </ng-container>

      <ng-container matColumnDef="vendor">
        <th mat-header-cell *matHeaderCellDef> Vendor </th>
        <td mat-cell *matCellDef="let device"> {{device.vendor}} </td>
      </ng-container>

      <ng-container matColumnDef="driver">
        <th mat-header-cell *matHeaderCellDef> Driver </th>
        <td mat-cell *matCellDef="let device"> {{device.napalm_driver}} </td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef> Actions </th>
        <td mat-cell *matCellDef="let device">
          <button mat-icon-button [routerLink]="['/devices', device.id]" color="primary">
            <mat-icon>visibility</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
  `]
})
export class DeviceListComponent implements OnInit {
  private deviceService = inject(DeviceService);
  private dialog = inject(MatDialog);

  devices$!: Observable<Device[]>;
  displayedColumns: string[] = ['name', 'ip', 'vendor', 'driver', 'actions'];

  ngOnInit() {
    this.loadDevices();
  }

  loadDevices() {
    this.devices$ = this.deviceService.getDevices();
  }

  addDevice() {
    const dialogRef = this.dialog.open(AddDeviceDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDevices();
      }
    });
  }
}
