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
  templateUrl: './device-list.component.html',
  styleUrl: './device-list.component.scss'
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
